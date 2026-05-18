import type { MxClawConfig, LLMCompletionRequest, LLMCompletionChunk, ProviderStatus } from "@mxclaw/core";
import type { createPluginRegistry } from "@mxclaw/plugin-system";
import type { Logger } from "@mxclaw/logging";
export interface AgentRunnerDeps {
    registry: ReturnType<typeof createPluginRegistry>;
    logger: Logger;
    providerStatuses: Map<string, ProviderStatus>;
}
/**
 * Run a non-streaming LLM completion with the agent's provider fallback chain.
 */
export declare function runCompletion(deps: AgentRunnerDeps, request: LLMCompletionRequest, agentConfig: MxClawConfig["agents"][string]): Promise<{
    content: string;
}>;
/**
 * Run a streaming LLM completion with the agent's provider fallback chain.
 */
export declare function runCompletionStream(deps: AgentRunnerDeps, request: LLMCompletionRequest, agentConfig: MxClawConfig["agents"][string]): AsyncGenerator<LLMCompletionChunk>;
//# sourceMappingURL=agent-runner.d.ts.map