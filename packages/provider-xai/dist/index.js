const manifest = {
    name: "xai", version: "0.1.0", type: "provider",
    description: "xAI Grok API provider", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming"],
};
let apiKey = "";
const plugin = {
    manifest,
    initialize: async (config) => { apiKey = config.apiKey ?? process.env.XAI_API_KEY ?? ""; },
    complete: async (request) => {
        const resp = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`xAI error: ${resp.status}`);
        const data = (await resp.json());
        return { content: data.choices[0]?.message.content ?? "", finishReason: data.choices[0]?.finish_reason, usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens } };
    },
    completeStream: async function* (request) {
        const resp = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`xAI stream error: ${resp.status}`);
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
                    if (parsed.choices[0]?.delta?.content)
                        yield { content: parsed.choices[0].delta.content };
                }
                catch { /* skip */ }
            }
        }
    },
    listModels: async () => [{ id: "grok-3", name: "Grok 3" }, { id: "grok-2", name: "Grok 2" }],
    healthCheck: async () => { try {
        await fetch("https://api.x.ai/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
        return true;
    }
    catch {
        return false;
    } },
};
export default plugin;
//# sourceMappingURL=index.js.map