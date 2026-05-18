import type { MxClawConfig } from "@mxclaw/core";
import { type ApprovalManager } from "@mxclaw/tools";
import type { Logger } from "@mxclaw/logging";
import type { WsServerMessage } from "@mxclaw/core";
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
/**
 * Execute an array of tool calls with approval gating, timeout, and sandboxing.
 */
export declare function executeToolCalls(deps: ToolExecutorDeps, toolCalls: ToolCallInput[], agentConfig: MxClawConfig["agents"][string], sessionKey: string, senderId: string): Promise<ToolCallResult[]>;
//# sourceMappingURL=tool-executor.d.ts.map