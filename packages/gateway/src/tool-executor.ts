import type { MxClawConfig, ApprovalRequest } from "@mxclaw/core";
import { getWorkspacePath } from "@mxclaw/core";
import { getTool, type ApprovalManager } from "@mxclaw/tools";
import { requiresApproval } from "@mxclaw/security";
import type { Logger } from "@mxclaw/logging";
import type { WsServerMessage } from "@mxclaw/core";
import { SandboxExecutor } from "./sandbox/index.js";

export interface ToolExecutorDeps {
  config: MxClawConfig;
  logger: Logger;
  approvalManager: ApprovalManager;
  broadcastWs: (msg: WsServerMessage) => void;
}

export interface ToolCallInput {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResult {
  id: string;
  name: string;
  result: string;
  error?: string;
}

// Cache sandbox executors per agent+session to reuse running containers
const sandboxCache = new Map<string, SandboxExecutor>();

/**
 * Execute an array of tool calls with approval gating, timeout, and sandboxing.
 */
export async function executeToolCalls(
  deps: ToolExecutorDeps,
  toolCalls: ToolCallInput[],
  agentConfig: MxClawConfig["agents"][string],
  sessionKey: string,
  senderId: string,
): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = [];

  // Resolve or create sandbox for this session (if enabled)
  let sandbox: SandboxExecutor | undefined;
  if (agentConfig.sandbox?.enabled) {
    const cacheKey = `${agentConfig.id}:${sessionKey}`;
    if (!sandboxCache.has(cacheKey)) {
      const executor = await SandboxExecutor.create(
        agentConfig.sandbox as { enabled: boolean; type?: "docker" | "process"; image?: string; workdir?: string },
        sessionKey,
        deps.logger,
      );
      sandboxCache.set(cacheKey, executor);
    }
    sandbox = sandboxCache.get(cacheKey);
  }

  for (const tc of toolCalls) {
    const tool = getTool(tc.name);
    if (!tool) {
      results.push({ id: tc.id, name: tc.name, result: "", error: `Unknown tool: ${tc.name}` });
      continue;
    }

    // Check approval — ownerId from config, fallback to first paired device
    const ownerId =
      deps.config.ownerId ??
      deps.config.devices?.find((d) => d.paired)?.id ??
      "owner";

    if (requiresApproval(tc.name, agentConfig, senderId, ownerId)) {
      const approval = deps.approvalManager.requestApproval(
        tc.name,
        tc.arguments,
        agentConfig.id,
        sessionKey,
      );

      // Broadcast approval request to WebSocket clients
      deps.broadcastWs({
        type: "approval:required",
        approvalId: approval.id,
        tool: tc.name,
        args: tc.arguments,
        agentId: agentConfig.id,
      });

      // Wait for approval (with timeout)
      const resolved = await waitForApproval(deps.approvalManager, approval.id, 60_000);
      if (!resolved || resolved.status !== "approved") {
        results.push({
          id: tc.id,
          name: tc.name,
          result: "",
          error: resolved?.status === "denied" ? "User denied approval" : "Approval timed out",
        });
        continue;
      }
    }

    // Execute tool — route bash/exec through sandbox if enabled
    try {
      const workspacePath = getWorkspacePath(deps.config);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30_000);

      // If sandbox is active and this is a bash/shell tool, run in sandbox
      if (sandbox?.isEnabled && (tc.name === "bash" || tc.name === "exec" || tc.name === "process")) {
        const command = String(tc.arguments.command ?? tc.arguments.cmd ?? "");
        if (!command) {
          results.push({ id: tc.id, name: tc.name, result: "", error: "No command provided" });
          clearTimeout(timeoutId);
          continue;
        }

        const sandboxResult = await sandbox.run({
          command,
          sessionKey,
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);
        deps.logger.debug("sandbox", `[${tc.name}] exit=${sandboxResult.exitCode} mode=${sandbox.activeMode}`);

        results.push({
          id: tc.id,
          name: tc.name,
          result: sandboxResult.stdout || sandboxResult.stderr || `(exit ${sandboxResult.exitCode})`,
          error: sandboxResult.exitCode !== 0 ? sandboxResult.error : undefined,
        });
        continue;
      }

      const toolResult = await tool.execute(tc.arguments, {
        agentId: agentConfig.id,
        sessionKey,
        workspacePath,
        sandbox: agentConfig.sandbox,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);
      results.push({
        id: tc.id,
        name: tc.name,
        result: toolResult.output,
        error: toolResult.error,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ id: tc.id, name: tc.name, result: "", error: errorMsg });
    }
  }

  return results;
}

/**
 * Poll the approval manager until the request is resolved or times out.
 */
function waitForApproval(
  manager: ApprovalManager,
  approvalId: string,
  timeoutMs: number,
): Promise<ApprovalRequest | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      const approval = manager.getApproval(approvalId);
      if (!approval || approval.status !== "pending") {
        resolve(approval ?? null);
        return;
      }
      if (Date.now() - startTime > timeoutMs) {
        manager.resolveApproval(approvalId, false);
        resolve(null);
        return;
      }
      setTimeout(check, 500);
    };
    check();
  });
}

