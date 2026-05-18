import { getWorkspacePath } from "@mxclaw/core";
import { getTool } from "@mxclaw/tools";
import { requiresApproval } from "@mxclaw/security";
/**
 * Execute an array of tool calls with approval gating, timeout, and sandboxing.
 */
export async function executeToolCalls(deps, toolCalls, agentConfig, sessionKey, senderId) {
    const results = [];
    for (const tc of toolCalls) {
        const tool = getTool(tc.name);
        if (!tool) {
            results.push({ id: tc.id, name: tc.name, result: "", error: `Unknown tool: ${tc.name}` });
            continue;
        }
        // Check approval — ownerId from config, fallback to first paired device
        const ownerId = deps.config.ownerId ??
            deps.config.devices?.find((d) => d.paired)?.id ??
            "owner";
        if (requiresApproval(tc.name, agentConfig, senderId, ownerId)) {
            const approval = deps.approvalManager.requestApproval(tc.name, tc.arguments, agentConfig.id, sessionKey);
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
        // Execute tool with timeout
        try {
            const workspacePath = getWorkspacePath(deps.config);
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 30_000);
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
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            results.push({ id: tc.id, name: tc.name, result: "", error: errorMsg });
        }
    }
    return results;
}
/**
 * Poll the approval manager until the request is resolved or times out.
 */
function waitForApproval(manager, approvalId, timeoutMs) {
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
//# sourceMappingURL=tool-executor.js.map