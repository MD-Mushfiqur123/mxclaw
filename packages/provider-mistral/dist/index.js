const manifest = {
    name: "mistral", version: "0.1.0", type: "provider",
    description: "Mistral AI API provider", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming", "tools"],
};
let apiKey = "";
const plugin = {
    manifest,
    initialize: async (config) => { apiKey = config.apiKey ?? process.env.MISTRAL_API_KEY ?? ""; },
    complete: async (request) => {
        const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Mistral error: ${resp.status}`);
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
        const resp = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Mistral stream error: ${resp.status}`);
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
    listModels: async () => [{ id: "mistral-large-latest", name: "Mistral Large" }, { id: "mistral-small-latest", name: "Mistral Small" }, { id: "pixtral-large-latest", name: "Pixtral Large" }],
    healthCheck: async () => { try {
        await fetch("https://api.mistral.ai/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
        return true;
    }
    catch {
        return false;
    } },
};
export default plugin;
//# sourceMappingURL=index.js.map