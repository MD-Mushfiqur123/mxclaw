import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, LLMCompletionChunk, PluginManifest } from "@mxclaw/core";

const manifest: PluginManifest = {
  name: "cloudflare", version: "0.1.0", type: "provider",
  description: "Cloudflare Workers AI provider", author: "mxclaw",
  main: "dist/index.js", capabilities: ["completion", "streaming", "embeddings"],
};

let accountId = "";
let apiToken = "";

const plugin: ProviderPlugin = {
  manifest,
  initialize: async (config) => {
    accountId = (config.accountId as string) ?? process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
    apiToken = (config.apiToken as string) ?? process.env.CLOUDFLARE_API_TOKEN ?? "";
  },
  complete: async (request): Promise<LLMCompletionResponse> => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${request.model}`;
    const resp = await fetch(url, {
      method: "POST", headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: request.messages, max_tokens: request.maxTokens, temperature: request.temperature }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`Cloudflare error: ${resp.status}`);
    const data = (await resp.json()) as { result?: { response?: string } };
    return { content: data.result?.response ?? "", finishReason: "stop" };
  },
  completeStream: async function* (request): AsyncGenerator<LLMCompletionChunk> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${request.model}`;
    const resp = await fetch(url, {
      method: "POST", headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: request.messages, max_tokens: request.maxTokens, temperature: request.temperature, stream: true }),
      signal: request.signal,
    });
    if (!resp.ok) throw new Error(`Cloudflare stream error: ${resp.status}`);
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
          const parsed = JSON.parse(data) as { response?: string };
          if (parsed.response) yield { content: parsed.response };
        } catch { /* skip */ }
      }
    }
  },
  listModels: async () => [{ id: "@cf/meta/llama-3.3-70b-instruct", name: "Llama 3.3 70B" }, { id: "@cf/mistral/mistral-7b-instruct-v0.2", name: "Mistral 7B" }],
  healthCheck: async () => { try { await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models`, { headers: { Authorization: `Bearer ${apiToken}` } }); return true; } catch { return false; } },
};

export default plugin;