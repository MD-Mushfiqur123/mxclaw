const manifest = {
    name: "perplexity", version: "0.1.0", type: "provider",
    description: "Perplexity AI API provider", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming", "search"],
};
let apiKey = "";
const plugin = {
    manifest,
    initialize: async (config) => { apiKey = config.apiKey ?? process.env.PERPLEXITY_API_KEY ?? ""; },
    complete: async (request) => {
        const resp = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Perplexity error: ${resp.status}`);
        const data = (await resp.json());
        return { content: data.choices[0]?.message.content ?? "", finishReason: data.choices[0]?.finish_reason, usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens } };
    },
    completeStream: async function* (request) {
        const resp = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Perplexity stream error: ${resp.status}`);
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
    listModels: async () => [{ id: "sonar-pro", name: "Sonar Pro" }, { id: "sonar", name: "Sonar" }, { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro" }],
    healthCheck: async () => { try {
        await fetch("https://api.perplexity.ai/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: "hi" }], max_tokens: 1 }) });
        return true;
    }
    catch {
        return false;
    } },
};
export default plugin;
//# sourceMappingURL=index.js.map