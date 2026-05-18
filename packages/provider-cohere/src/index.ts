import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, LLMCompletionChunk, PluginManifest } from "@mxclaw/core";

const manifest: PluginManifest = {
  name: "cohere", version: "0.1.0", type: "provider",
  description: "Cohere API provider", author: "mxclaw",
  main: "dist/index.js", capabilities: ["completion", "streaming", "embeddings"],
};

let apiKey = "";

const plugin: ProviderPlugin = {
  manifest,
  initialize: async (config) => { apiKey = (config.apiKey as string) ?? process.env.COHERE_API_KEY ?? ""; },
  complete: async (request): Promise<LLMCompletionResponse> => {
    const resp = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`Cohere error: ${resp.status}`);
    const data = (await resp.json()) as { message?: { content?: Array<{ text?: string }> }; finish_reason?: string; usage?: { billed_units?: { input_tokens?: number; output_tokens?: number } } };
    const text = data.message?.content?.map(c => c.text ?? "").join("") ?? "";
    return {
      content: text,
      finishReason: data.finish_reason === "COMPLETE" ? "stop" : "error",
      usage: data.usage?.billed_units ? { promptTokens: data.usage.billed_units.input_tokens ?? 0, completionTokens: data.usage.billed_units.output_tokens ?? 0, totalTokens: (data.usage.billed_units.input_tokens ?? 0) + (data.usage.billed_units.output_tokens ?? 0) } : undefined,
    };
  },
  completeStream: async function* (request): AsyncGenerator<LLMCompletionChunk> {
    const resp = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`Cohere stream error: ${resp.status}`);
    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const parsed = JSON.parse(line.slice(6)) as { type: string; delta?: { message?: { content?: { text?: string } } } };
          if (parsed.type === "content-delta" && parsed.delta?.message?.content?.text) {
            yield { content: parsed.delta.message.content.text };
          }
        } catch { /* skip */ }
      }
    }
  },
  listModels: async () => [{ id: "command-r-plus", name: "Command R+" }, { id: "command-r", name: "Command R" }],
  healthCheck: async () => { try { await fetch("https://api.cohere.com/v2/models", { headers: { Authorization: `Bearer ${apiKey}` } }); return true; } catch { return false; } },
};

export default plugin;