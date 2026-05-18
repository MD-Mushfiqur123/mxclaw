import { getProviderPlugin } from "@mxclaw/plugin-system";
import { retryWithBackoff } from "./utils.js";
/**
 * Run a non-streaming LLM completion with the agent's provider fallback chain.
 */
export async function runCompletion(deps, request, agentConfig) {
    const providers = [
        agentConfig.model,
        ...(agentConfig.fallbackChain ?? []),
    ];
    let lastError = null;
    for (const providerRef of providers) {
        const plugin = getProviderPlugin(deps.registry, providerRef.provider);
        if (!plugin) {
            deps.logger.warn("llm", `Provider plugin not found: ${providerRef.provider}`);
            continue;
        }
        try {
            const response = await retryWithBackoff(async () => {
                return plugin.complete({
                    ...request,
                    model: providerRef.model,
                    temperature: providerRef.temperature,
                    maxTokens: providerRef.maxTokens,
                });
            });
            deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
                provider: providerRef.provider,
                model: providerRef.model,
                available: true,
                lastCheckAt: Date.now(),
            });
            return response;
        }
        catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            deps.logger.warn("llm", `Provider ${providerRef.provider}/${providerRef.model} failed: ${lastError.message}`);
            deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
                provider: providerRef.provider,
                model: providerRef.model,
                available: false,
                lastCheckAt: Date.now(),
                error: lastError.message,
            });
        }
    }
    throw lastError ?? new Error("All providers in fallback chain failed");
}
/**
 * Run a streaming LLM completion with the agent's provider fallback chain.
 */
export async function* runCompletionStream(deps, request, agentConfig) {
    const providers = [
        agentConfig.model,
        ...(agentConfig.fallbackChain ?? []),
    ];
    let lastError = null;
    for (const providerRef of providers) {
        const plugin = getProviderPlugin(deps.registry, providerRef.provider);
        if (!plugin)
            continue;
        try {
            const stream = plugin.completeStream({
                ...request,
                model: providerRef.model,
                temperature: providerRef.temperature,
                maxTokens: providerRef.maxTokens,
            });
            for await (const chunk of stream) {
                yield chunk;
            }
            deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
                provider: providerRef.provider,
                model: providerRef.model,
                available: true,
                lastCheckAt: Date.now(),
            });
            return;
        }
        catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            deps.logger.warn("llm", `Streaming provider ${providerRef.provider}/${providerRef.model} failed: ${lastError.message}`);
            deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
                provider: providerRef.provider,
                model: providerRef.model,
                available: false,
                lastCheckAt: Date.now(),
                error: lastError.message,
            });
        }
    }
    throw lastError ?? new Error("All providers in fallback chain failed");
}
//# sourceMappingURL=agent-runner.js.map