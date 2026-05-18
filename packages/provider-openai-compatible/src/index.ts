import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, LLMCompletionChunk, PluginManifest } from "@mxclaw/core";

const manifest: PluginManifest = {
  name: "openai-compatible", version: "0.1.0", type: "provider",
  description: "Unified OpenAI-compatible provider — works with OpenAI, Anthropic proxy, Groq, DeepSeek, Together, Fireworks, xAI, Perplexity, Mistral, LM Studio, Ollama, vLLM, LocalAI, text-generation-webui, and any OpenAI-compatible API",
  author: "MxClaw",
  main: "dist/index.js",
  capabilities: ["completion", "streaming", "tools", "vision", "custom-base-url", "custom-headers"],
};

interface ProviderState {
  apiKey: string;
  baseUrl: string;
  extraHeaders: Record<string, string>;
  modelMap: Map<string, string>;
}

const state: ProviderState = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  extraHeaders: {},
  modelMap: new Map(),
};

// ── Known provider presets ────────────────────────────────────────

export const PROVIDER_PRESETS: Record<string, { baseUrl: string; envKey: string; defaultModel: string; headers?: Record<string, string> }> = {
  openai:           { baseUrl: "https://api.openai.com/v1",              envKey: "OPENAI_API_KEY",           defaultModel: "gpt-4o" },
  anthropic:        { baseUrl: "https://api.anthropic.com/v1",           envKey: "ANTHROPIC_API_KEY",        defaultModel: "claude-sonnet-4-20250514" },
  groq:             { baseUrl: "https://api.groq.com/openai/v1",         envKey: "GROQ_API_KEY",             defaultModel: "llama-3.3-70b-versatile" },
  deepseek:         { baseUrl: "https://api.deepseek.com/v1",            envKey: "DEEPSEEK_API_KEY",         defaultModel: "deepseek-chat" },
  together:         { baseUrl: "https://api.together.xyz/v1",            envKey: "TOGETHER_API_KEY",         defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  fireworks:        { baseUrl: "https://api.fireworks.ai/inference/v1",  envKey: "FIREWORKS_API_KEY",        defaultModel: "accounts/fireworks/models/llama-v3p3-70b-instruct" },
  xai:              { baseUrl: "https://api.x.ai/v1",                    envKey: "XAI_API_KEY",              defaultModel: "grok-3" },
  perplexity:       { baseUrl: "https://api.perplexity.ai",              envKey: "PERPLEXITY_API_KEY",       defaultModel: "sonar-pro" },
  mistral:          { baseUrl: "https://api.mistral.ai/v1",              envKey: "MISTRAL_API_KEY",          defaultModel: "mistral-large-latest" },
  lmstudio:         { baseUrl: "http://localhost:1234/v1",               envKey: "",                          defaultModel: "local-model" },
  ollama:           { baseUrl: "http://localhost:11434/v1",              envKey: "",                          defaultModel: "llama3.2" },
  vllm:             { baseUrl: "http://localhost:8000/v1",               envKey: "",                          defaultModel: "default" },
  localai:          { baseUrl: "http://localhost:8080/v1",               envKey: "",                          defaultModel: "gpt-4" },
  textgen:          { baseUrl: "http://localhost:5000/v1",               envKey: "",                          defaultModel: "default" },
  openrouter:       { baseUrl: "https://openrouter.ai/api/v1",           envKey: "OPENROUTER_API_KEY",       defaultModel: "openai/gpt-4o" },
  requesty:         { baseUrl: "https://router.requesty.ai/v1",           envKey: "REQUESTY_API_KEY",         defaultModel: "gpt-4o" },
  huggingface:      { baseUrl: "https://api-inference.huggingface.co",    envKey: "HF_API_KEY",               defaultModel: "meta-llama/Llama-3.3-70B-Instruct" },
  azure:            { baseUrl: "",                                        envKey: "AZURE_OPENAI_API_KEY",     defaultModel: "gpt-4o" },
  custom:           { baseUrl: "",                                        envKey: "",                          defaultModel: "default" },
};

export function getPreset(name: string) {
  return PROVIDER_PRESETS[name];
}

export function listPresets(): string[] {
  return Object.keys(PROVIDER_PRESETS);
}

const plugin: ProviderPlugin = {
  manifest,

  initialize: async (config) => {
    // Support preset-based config
    const presetName = (config.preset as string) ?? "openai";
    const preset = PROVIDER_PRESETS[presetName];

    state.apiKey = (config.apiKey as string)
      ?? (preset?.envKey ? process.env[preset.envKey] : "")
      ?? process.env.OPENAI_API_KEY
      ?? "";

    state.baseUrl = (config.baseUrl as string)
      ?? preset?.baseUrl
      ?? "https://api.openai.com/v1";

    state.extraHeaders = (config.headers as Record<string, string>) ?? preset?.headers ?? {};

    // Model mapping for aliases
    const modelAliases = (config.modelAliases as Record<string, string>) ?? {};
    for (const [alias, real] of Object.entries(modelAliases)) {
      state.modelMap.set(alias, real);
    }
  },

  complete: async (request): Promise<LLMCompletionResponse> => {
    const model = state.modelMap.get(request.model) ?? request.model;
    const url = `${state.baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...state.extraHeaders,
    };
    if (state.apiKey) headers["Authorization"] = `Bearer ${state.apiKey}`;

    const body: Record<string, unknown> = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
    };
    if (request.tools?.length) body["tools"] = request.tools;

    const resp = await fetch(url, {
      method: "POST", headers,
      body: JSON.stringify(body),
      signal: request.signal,
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`OpenAI-compatible error [${resp.status}]: ${errText.slice(0, 500)}`);
    }

    const data = (await resp.json()) as {
      choices: Array<{
        message: { content: string; tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> };
        finish_reason: string;
      }>;
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

    const choice = data.choices?.[0];
    if (!choice) throw new Error("No completion choice returned");

    return {
      content: choice.message.content ?? "",
      toolCalls: choice.message.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: safeJsonParse(tc.function.arguments),
      })),
      finishReason: mapFinishReason(choice.finish_reason),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  },

  completeStream: async function* (request): AsyncGenerator<LLMCompletionChunk> {
    const model = state.modelMap.get(request.model) ?? request.model;
    const url = `${state.baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...state.extraHeaders,
    };
    if (state.apiKey) headers["Authorization"] = `Bearer ${state.apiKey}`;

    const body: Record<string, unknown> = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
      stream: true,
      stream_options: { include_usage: true },
    };
    if (request.tools?.length) body["tools"] = request.tools;

    const resp = await fetch(url, {
      method: "POST", headers,
      body: JSON.stringify(body),
      signal: request.signal,
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`OpenAI-compatible stream error [${resp.status}]: ${errText.slice(0, 500)}`);
    }

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const toolCallAccum: Map<number, { id: string; name: string; args: string }> = new Map();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data) as {
            choices?: Array<{
              delta?: { content?: string; tool_calls?: Array<{ index: number; id?: string; function?: { name?: string; arguments?: string } }> };
              finish_reason?: string;
            }>;
          };

          const choice = parsed.choices?.[0];
          if (!choice) continue;

          const delta = choice.delta;
          let content = "";
          let toolCalls: LLMCompletionChunk["toolCalls"] | undefined;

          if (delta?.content) {
            content = delta.content;
          }

          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const existing = toolCallAccum.get(tc.index);
              if (existing) {
                if (tc.function?.arguments) existing.args += tc.function.arguments;
                if (tc.id) existing.id = tc.id;
                if (tc.function?.name) existing.name = tc.function.name;
              } else {
                toolCallAccum.set(tc.index, {
                  id: tc.id ?? "",
                  name: tc.function?.name ?? "",
                  args: tc.function?.arguments ?? "",
                });
              }
            }
            toolCalls = Array.from(toolCallAccum.values()).map((tc) => ({
              id: tc.id,
              name: tc.name,
              arguments: tc.args,
            }));
          }

          yield {
            content,
            toolCalls,
            finishReason: choice.finish_reason ? mapFinishReason(choice.finish_reason) : undefined,
          };
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  },

  listModels: async () => {
    try {
      const headers: Record<string, string> = { ...state.extraHeaders };
      if (state.apiKey) headers["Authorization"] = `Bearer ${state.apiKey}`;

      const resp = await fetch(`${state.baseUrl}/models`, { headers });
      if (!resp.ok) return [{ id: "default", name: "Default Model" }];

      const data = (await resp.json()) as { data?: Array<{ id: string }>; models?: Array<{ id: string; name?: string }> };
      const models = data.data ?? data.models ?? [];
      return models.map((m) => ({ id: m.id, name: m.id }));
    } catch {
      return [{ id: "default", name: "Default Model" }];
    }
  },

  healthCheck: async () => {
    try {
      const headers: Record<string, string> = { ...state.extraHeaders };
      if (state.apiKey) headers["Authorization"] = `Bearer ${state.apiKey}`;

      const resp = await fetch(`${state.baseUrl}/models`, { headers, signal: AbortSignal.timeout(5000) });
      return resp.ok;
    } catch {
      return false;
    }
  },
};

function mapFinishReason(reason: string): LLMCompletionResponse["finishReason"] {
  switch (reason) {
    case "stop": return "stop";
    case "tool_calls": return "tool_calls";
    case "length": return "length";
    default: return "error";
  }
}

function safeJsonParse(str: string): Record<string, unknown> {
  try { return JSON.parse(str) as Record<string, unknown>; }
  catch { return {}; }
}

export default plugin;