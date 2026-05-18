import type { ToolDefinition, ApprovalRequest } from "@mxclaw/core";
export declare const bashTool: ToolDefinition;
export declare const browserTool: ToolDefinition;
export declare const canvasTool: ToolDefinition;
export declare const cronTool: ToolDefinition;
/**
 * Pluggable session spawn callback — injected by the gateway at startup.
 * This bridges the tools package to the gateway's SessionManager without
 * creating a circular dependency.
 */
type SessionSpawnFn = (parentSessionKey: string, agentId: string, message: string, context?: Record<string, unknown>) => Promise<{
    sessionKey: string;
    agentId: string;
}>;
/**
 * Register the session spawn handler. Called once by the gateway during startup.
 */
export declare function registerSessionSpawnHandler(fn: SessionSpawnFn): void;
export declare const sessionSpawnTool: ToolDefinition;
export { imageGenTool } from "./image-gen.js";
export declare const fileReadTool: ToolDefinition;
export declare const fileWriteTool: ToolDefinition;
export { webSearchTool } from "./web-search.js";
export { webFetchTool } from "./web-fetch.js";
import type { MemoryAdapter } from "@mxclaw/memory";
export declare function registerMemoryAdapter(adapter: MemoryAdapter): void;
export declare const memoryTool: ToolDefinition;
export declare const ALL_TOOLS: ToolDefinition[];
export declare function getTool(name: string): ToolDefinition | undefined;
export declare function getToolDefinitionsForLLM(enabledTools: Set<string>): Array<{
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}>;
export declare class ApprovalManager {
    private pending;
    private timeouts;
    private defaultTimeoutMs;
    requestApproval(tool: string, args: Record<string, unknown>, agentId: string, sessionKey: string): ApprovalRequest;
    resolveApproval(approvalId: string, approved: boolean): ApprovalRequest | null;
    getPendingApprovals(): ApprovalRequest[];
    getApproval(id: string): ApprovalRequest | undefined;
}
//# sourceMappingURL=index.d.ts.map