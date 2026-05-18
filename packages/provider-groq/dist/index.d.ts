import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionChunk } from "@mxclaw/core";
declare const plugin: ProviderPlugin;
declare function safeParseArgs(argsStr: string): Record<string, unknown>;
declare function openaiCompatibleStream(url: string, token: string, request: LLMCompletionRequest): AsyncGenerator<LLMCompletionChunk>;
export default plugin;
export { openaiCompatibleStream, safeParseArgs };
//# sourceMappingURL=index.d.ts.map