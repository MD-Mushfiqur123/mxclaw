const manifest = {
    name: "deepseek", version: "0.1.0", type: "provider",
    description: "DeepSeek API provider (V3, R1)", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming", "tools"],
};
let apiKey = "";
let baseUrl = "https://api.deepseek.com";
function safeParseArgs(s) {
    try {
        return JSON.parse(s);
    }
    catch {
        return { raw: s };
    }
}
const plugin = {
    manifest,
    initialize: async (config) => {
        apiKey = config.apiKey ?? process.env.DEEPSEEK_API_KEY ?? "";
        baseUrl = config.baseUrl ?? "https://api.deepseek.com";
    },
    complete: async (request) => {
        const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`DeepSeek error ${resp.status}: ${await resp.text()}`);
        const data = await resp.json();
        const choice = data.choices[0];
        let content = choice.message.content ?? "";
        if (choice.message.reasoning_content)
            content = `<thinking>\n${choice.message.reasoning_content}\n</thinking>\n\n${content}`;
        return {
            content,
            toolCalls: choice.message.tool_calls?.map((tc) => ({ id: tc.id, name: tc.function.name, arguments: safeParseArgs(tc.function.arguments) })),
            finishReason: choice.finish_reason, usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens },
        };
    },
    completeStream: async function* (request) {
        const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`DeepSeek stream error: ${resp.status}`);
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
                const d = line.slice(6);
                if (d === "[DONE]")
                    return;
                try {
                    const parsed = JSON.parse(d);
                    const delta = parsed.choices[0]?.delta;
                    if (!delta)
                        continue;
                    yield { content: delta.content ?? delta.reasoning_content ?? "", toolCalls: delta.tool_calls?.map((tc) => ({ id: tc.id ?? "", name: tc.function?.name ?? "", arguments: tc.function?.arguments ?? "" })), finishReason: parsed.choices[0]?.finish_reason };
                }
                catch { }
            }
        }
    },
    listModels: async () => [{ id: "deepseek-chat", name: "DeepSeek V3" }, { id: "deepseek-reasoner", name: "DeepSeek R1" }],
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