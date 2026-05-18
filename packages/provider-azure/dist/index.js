const manifest = {
    name: "azure", version: "0.1.0", type: "provider",
    description: "Azure OpenAI provider", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming", "tools"],
};
let endpoint = "";
let apiKey = "";
let apiVersion = "2024-10-21";
const plugin = {
    manifest,
    initialize: async (config) => {
        endpoint = config.endpoint ?? process.env.AZURE_OPENAI_ENDPOINT ?? "";
        apiKey = config.apiKey ?? process.env.AZURE_OPENAI_API_KEY ?? "";
        apiVersion = config.apiVersion ?? "2024-10-21";
    },
    complete: async (request) => {
        const url = `${endpoint}/openai/deployments/${request.model}/chat/completions?api-version=${apiVersion}`;
        const resp = await fetch(url, {
            method: "POST", headers: { "api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Azure error: ${resp.status}`);
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
        const url = `${endpoint}/openai/deployments/${request.model}/chat/completions?api-version=${apiVersion}`;
        const resp = await fetch(url, {
            method: "POST", headers: { "api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({ messages: request.messages, tools: request.tools, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Azure stream error: ${resp.status}`);
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
    listModels: async () => [{ id: "gpt-4o", name: "GPT-4o" }, { id: "gpt-4o-mini", name: "GPT-4o Mini" }],
    healthCheck: async () => { try {
        await fetch(`${endpoint}/openai/deployments?api-version=${apiVersion}`, { headers: { "api-key": apiKey } });
        return true;
    }
    catch {
        return false;
    } },
};
export default plugin;
//# sourceMappingURL=index.js.map