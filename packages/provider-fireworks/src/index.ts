import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, LLMCompletionChunk, PluginManifest } from "@mxclaw/core";

const manifest: PluginManifest = {
  name: "fireworks", version: "0.1.0", type: "provider",
  description: "Fireworks AI provider", author: "mxclaw",
  main: "dist/index.js", capabilities: ["completion", "streaming"],
};

let apiKey = "";

const plugin: ProviderPlugin = {
  manifest,
  initialize: async (config) => { apiKey = (config.apiKey as string) ?? process.env.FIREWORKS_API_KEY ?? ""; },
  complete: async (request): Promise<LLMCompletionResponse> => {
    const resp = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`Fireworks error: ${resp.status}`);
    const data = (await resp.json()) as { choices: Array<{ message: { content: string }; finish_reason: string }>; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } };
    return { content: data.choices[0]?.message.content ?? "", finishReason: data.choices[0]?.finish_reason as LLMCompletionResponse["finishReason"], usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens } };
  },
  completeStream: async function* (request): AsyncGenerator<LLMCompletionChunk> {
    const resp = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`Fireworks stream error: ${resp.status}`);
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
          if (parsed.choices[0]?.delta?.content) yield { content: parsed.choices[0].delta.content };
        } catch { /* skip */ }
      }
    }
  },
  listModels: async () => [{ id: "accounts/fireworks/models/llama-v3p3-70b-instruct", name: "Llama 3.3 70B" }],
  healthCheck: async () => { try { await fetch("https://api.fireworks.ai/inference/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } }); return true; } catch { return false; } },
};

export default plugin;