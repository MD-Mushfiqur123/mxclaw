const manifest = {
    name: "openai-compatible", version: "0.1.0", type: "provider",
    description: "Unified OpenAI-compatible provider — works with OpenAI, Anthropic proxy, Groq, DeepSeek, Together, Fireworks, xAI, Perplexity, Mistral, LM Studio, Ollama, vLLM, LocalAI, text-generation-webui, and any OpenAI-compatible API",
    author: "MxClaw",
    main: "dist/index.js",
    capabilities: ["completion", "streaming", "tools", "vision", "custom-base-url", "custom-headers"],
};
const state = {
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    extraHeaders: {},
    modelMap: new Map(),
};
// ── Known provider presets ────────────────────────────────────────
export const PROVIDER_PRESETS = {
    openai: { baseUrl: "https://api.openai.com/v1", envKey: "OPENAI_API_KEY", defaultModel: "gpt-4o" },
    anthropic: { baseUrl: "https://api.anthropic.com/v1", envKey: "ANTHROPIC_API_KEY", defaultModel: "claude-sonnet-4-20250514" },
    groq: { baseUrl: "https://api.groq.com/openai/v1", envKey: "GROQ_API_KEY", defaultModel: "llama-3.3-70b-versatile" },
    deepseek: { baseUrl: "https://api.deepseek.com/v1", envKey: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat" },
    together: { baseUrl: "https://api.together.xyz/v1", envKey: "TOGETHER_API_KEY", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
    fireworks: { baseUrl: "https://api.fireworks.ai/inference/v1", envKey: "FIREWORKS_API_KEY", defaultModel: "accounts/fireworks/models/llama-v3p3-70b-instruct" },
    xai: { baseUrl: "https://api.x.ai/v1", envKey: "XAI_API_KEY", defaultModel: "grok-3" },
    perplexity: { baseUrl: "https://api.perplexity.ai", envKey: "PERPLEXITY_API_KEY", defaultModel: "sonar-pro" },
    mistral: { baseUrl: "https://api.mistral.ai/v1", envKey: "MISTRAL_API_KEY", defaultModel: "mistral-large-latest" },
    lmstudio: { baseUrl: "http://localhost:1234/v1", envKey: "", defaultModel: "local-model" },
    ollama: { baseUrl: "http://localhost:11434/v1", envKey: "", defaultModel: "llama3.2" },
    vllm: { baseUrl: "http://localhost:8000/v1", envKey: "", defaultModel: "default" },
    localai: { baseUrl: "http://localhost:8080/v1", envKey: "", defaultModel: "gpt-4" },
    textgen: { baseUrl: "http://localhost:5000/v1", envKey: "", defaultModel: "default" },
    openrouter: { baseUrl: "https://openrouter.ai/api/v1", envKey: "OPENROUTER_API_KEY", defaultModel: "openai/gpt-4o" },
    requesty: { baseUrl: "https://router.requesty.ai/v1", envKey: "REQUESTY_API_KEY", defaultModel: "gpt-4o" },
    huggingface: { baseUrl: "https://api-inference.huggingface.co", envKey: "HF_API_KEY", defaultModel: "meta-llama/Llama-3.3-70B-Instruct" },
    azure: { baseUrl: "", envKey: "AZURE_OPENAI_API_KEY", defaultModel: "gpt-4o" },
    custom: { baseUrl: "", envKey: "", defaultModel: "default" },
};
export function getPreset(name) {
    return PROVIDER_PRESETS[name];
}
export function listPresets() {
    return Object.keys(PROVIDER_PRESETS);
}
const plugin = {
    manifest,
    initialize: async (config) => {
        // Support preset-based config
        const presetName = config.preset ?? "openai";
        const preset = PROVIDER_PRESETS[presetName];
        state.apiKey = config.apiKey
            ?? (preset?.envKey ? process.env[preset.envKey] : "")
            ?? process.env.OPENAI_API_KEY
            ?? "";
        state.baseUrl = config.baseUrl
            ?? preset?.baseUrl
            ?? "https://api.openai.com/v1";
        state.extraHeaders = config.headers ?? preset?.headers ?? {};
        // Model mapping for aliases
        const modelAliases = config.modelAliases ?? {};
        for (const [alias, real] of Object.entries(modelAliases)) {
            state.modelMap.set(alias, real);
        }
    },
    complete: async (request) => {
        const model = state.modelMap.get(request.model) ?? request.model;
        const url = `${state.baseUrl}/chat/completions`;
        const headers = {
            "Content-Type": "application/json",
            ...state.extraHeaders,
        };
        if (state.apiKey)
            headers["Authorization"] = `Bearer ${state.apiKey}`;
        const body = {
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 4096,
        };
        if (request.tools?.length)
            body["tools"] = request.tools;
        const resp = await fetch(url, {
            method: "POST", headers,
            body: JSON.stringify(body),
            signal: request.signal,
        });
        if (!resp.ok) {
            const errText = await resp.text().catch(() => "");
            throw new Error(`OpenAI-compatible error [${resp.status}]: ${errText.slice(0, 500)}`);
        }
        const data = (await resp.json());
        const choice = data.choices?.[0];
        if (!choice)
            throw new Error("No completion choice returned");
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
    completeStream: async function* (request) {
        const model = state.modelMap.get(request.model) ?? request.model;
        const url = `${state.baseUrl}/chat/completions`;
        const headers = {
            "Content-Type": "application/json",
            ...state.extraHeaders,
        };
        if (state.apiKey)
            headers["Authorization"] = `Bearer ${state.apiKey}`;
        const body = {
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 4096,
            stream: true,
            stream_options: { include_usage: true },
        };
        if (request.tools?.length)
            body["tools"] = request.tools;
        const resp = await fetch(url, {
            method: "POST", headers,
            body: JSON.stringify(body),
            signal: request.signal,
        });
        if (!resp.ok) {
            const errText = await resp.text().catch(() => "");
            throw new Error(`OpenAI-compatible stream error [${resp.status}]: ${errText.slice(0, 500)}`);
        }
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        const toolCallAccum = new Map();
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data: "))
                    continue;
                const data = trimmed.slice(6);
                if (data === "[DONE]")
                    return;
                try {
                    const parsed = JSON.parse(data);
                    const choice = parsed.choices?.[0];
                    if (!choice)
                        continue;
                    const delta = choice.delta;
                    let content = "";
                    let toolCalls;
                    if (delta?.content) {
                        content = delta.content;
                    }
                    if (delta?.tool_calls) {
                        for (const tc of delta.tool_calls) {
                            const existing = toolCallAccum.get(tc.index);
                            if (existing) {
                                if (tc.function?.arguments)
                                    existing.args += tc.function.arguments;
                                if (tc.id)
                                    existing.id = tc.id;
                                if (tc.function?.name)
                                    existing.name = tc.function.name;
                            }
                            else {
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
                }
                catch {
                    // skip malformed SSE chunks
                }
            }
        }
    },
    listModels: async () => {
        try {
            const headers = { ...state.extraHeaders };
            if (state.apiKey)
                headers["Authorization"] = `Bearer ${state.apiKey}`;
            const resp = await fetch(`${state.baseUrl}/models`, { headers });
            if (!resp.ok)
                return [{ id: "default", name: "Default Model" }];
            const data = (await resp.json());
            const models = data.data ?? data.models ?? [];
            return models.map((m) => ({ id: m.id, name: m.id }));
        }
        catch {
            return [{ id: "default", name: "Default Model" }];
        }
    },
    healthCheck: async () => {
        try {
            const headers = { ...state.extraHeaders };
            if (state.apiKey)
                headers["Authorization"] = `Bearer ${state.apiKey}`;
            const resp = await fetch(`${state.baseUrl}/models`, { headers, signal: AbortSignal.timeout(5000) });
            return resp.ok;
        }
        catch {
            return false;
        }
    },
};
function mapFinishReason(reason) {
    switch (reason) {
        case "stop": return "stop";
        case "tool_calls": return "tool_calls";
        case "length": return "length";
        default: return "error";
    }
}
function safeJsonParse(str) {
    try {
        return JSON.parse(str);
    }
    catch {
        return {};
    }
}
export default plugin;
//# sourceMappingURL=index.js.map