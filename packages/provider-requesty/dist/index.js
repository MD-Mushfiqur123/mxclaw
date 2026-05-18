const manifest = {
    name: "requesty", version: "0.1.0", type: "provider",
    description: "Requesty AI router provider (OpenAI-compatible multi-model gateway)", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming", "tools"],
};
let apiKey = "";
let baseUrl = "https://router.requesty.ai/v1";
const plugin = {
    manifest,
    initialize: async (config) => {
        apiKey = config.apiKey ?? process.env.REQUESTY_API_KEY ?? process.env.REQUESTY_TOKEN ?? "";
        baseUrl = config.baseUrl ?? "https://router.requesty.ai/v1";
    },
    complete: async (request) => {
        const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Requesty error: ${resp.status} ${await resp.text().catch(() => "")}`);
        const data = (await resp.json());
        const choice = data.choices[0];
        return {
            content: choice.message.content ?? "",
            toolCalls: choice.message.tool_calls?.map(tc => ({ id: tc.id, name: tc.function.name, arguments: JSON.parse(tc.function.arguments) })),
            finishReason: choice.finish_reason,
            usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens },
        };
    },
    completeStream: async function* (request) {
        const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Requesty stream error: ${resp.status}`);
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
                if (!line.startsWith("data: "))
                    continue;
                const data = line.slice(6);
                if (data === "[DONE]")
                    return;
                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices[0]?.delta;
                    if (!delta)
                        continue;
                    yield {
                        content: delta.content ?? "",
                        toolCalls: delta.tool_calls?.map(tc => ({ id: tc.id ?? "", name: tc.function?.name ?? "", arguments: tc.function?.arguments ?? "" })),
                        finishReason: parsed.choices[0]?.finish_reason,
                    };
                }
                catch { /* skip */ }
            }
        }
    },
    listModels: async () => {
        try {
            const resp = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
            if (!resp.ok)
                return [{ id: "gpt-4o", name: "GPT-4o" }];
            const data = (await resp.json());
            return (data.data ?? []).map(m => ({ id: m.id, name: m.id }));
        }
        catch {
            return [{ id: "gpt-4o", name: "GPT-4o" }];
        }
    },
    healthCheck: async () => { try {
        const r = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
        return r.ok;
    }
    catch {
        return false;
    } },
};
export default plugin;
//# sourceMappingURL=index.js.map