import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, LLMCompletionChunk, PluginManifest } from "@mxclaw/core";

const manifest: PluginManifest = {
  name: "lmstudio", version: "0.1.0", type: "provider",
  description: "LM Studio local inference provider (OpenAI-compatible API)", author: "mxclaw",
  main: "dist/index.js", capabilities: ["completion", "streaming", "local"],
};

let baseUrl = "http://localhost:1234/v1";

const plugin: ProviderPlugin = {
  manifest,
  initialize: async (config) => { baseUrl = (config.baseUrl as string) ?? "http://localhost:1234/v1"; },
  complete: async (request): Promise<LLMCompletionResponse> => {
    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`LM Studio error: ${resp.status}`);
    const data = (await resp.json()) as { choices: Array<{ message: { content: string }; finish_reason: string }>; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } };
    return { content: data.choices[0]?.message.content ?? "", finishReason: data.choices[0]?.finish_reason as LLMCompletionResponse["finishReason"], usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens } };
  },
  completeStream: async function* (request): AsyncGenerator<LLMCompletionChunk> {
    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`LM Studio stream error: ${resp.status}`);
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
        const data = line.slice(6);
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data) as { choices: Array<{ delta: { content?: string } }> };
          const content = parsed.choices[0]?.delta?.content;
          if (content) yield { content };
        } catch { /* skip */ }
      }
    }
  },
  listModels: async () => {
    try {
      const resp = await fetch(`${baseUrl}/models`);
      const data = (await resp.json()) as { data: Array<{ id: string }> };
      return data.data.map(m => ({ id: m.id, name: m.id }));
    } catch { return [{ id: "local-model", name: "Local Model" }]; }
  },
  healthCheck: async () => { try { await fetch(`${baseUrl}/models`); return true; } catch { return false; } },
};

export default plugin;