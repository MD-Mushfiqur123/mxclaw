/**
 * Groq Provider — OpenAI-compatible API with Groq's ultra-fast inference.
 * Supports Llama 3.3, Mixtral, and other models.
 */
const manifest = {
    name: "groq", version: "0.1.0", type: "provider",
    description: "Groq inference provider (Llama 3.3 70B, Mixtral, etc.)",
    author: "mxclaw", main: "dist/index.js",
    capabilities: ["completion", "streaming", "tools"],
};
let apiKey = "";
let baseUrl = "https://api.groq.com/openai/v1";
const plugin = {
    manifest,
    initialize: async (config) => {
        apiKey = config.apiKey ?? process.env.GROQ_API_KEY ?? "";
        baseUrl = config.baseUrl ?? "https://api.groq.com/openai/v1";
    },
    complete: async (request) => {
        const resp = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: request.model,
                messages: request.messages,
                tools: request.tools,
                temperature: request.temperature,
                max_tokens: request.maxTokens,
            }),
            signal: request.signal,
        });
        if (!resp.ok) {
            const errBody = await resp.text();
            throw new Error(`Groq error ${resp.status}: ${errBody}`);
        }
        const data = await resp.json();
        const choice = data.choices[0];
        return {
            content: choice.message.content ?? "",
            toolCalls: choice.message.tool_calls?.map(tc => ({
                id: tc.id,
                name: tc.function.name,
                arguments: safeParseArgs(tc.function.arguments),
            })),
            finishReason: choice.finish_reason,
            usage: { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens },
        };
    },
    completeStream: async function* (request) {
        yield* openaiCompatibleStream(`${baseUrl}/chat/completions`, apiKey, request);
    },
    listModels: async () => [
        { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile" },
        { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant" },
        { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
        { id: "gemma2-9b-it", name: "Gemma 2 9B IT" },
    ],
    healthCheck: async () => {
        try {
            const resp = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
            return resp.ok;
        }
        catch {
            return false;
        }
    },
};
function safeParseArgs(argsStr) {
    try {
        return JSON.parse(argsStr);
    }
    catch {
        return { raw: argsStr };
    }
}
async function* openaiCompatibleStream(url, token, request) {
    const resp = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            tools: request.tools,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: true,
        }),
        signal: request.signal,
    });
    if (!resp.ok)
        throw new Error(`Stream error: ${resp.status}`);
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
                    toolCalls: delta.tool_calls?.map(tc => ({
                        id: tc.id ?? "",
                        name: tc.function?.name ?? "",
                        arguments: tc.function?.arguments ?? "",
                    })),
                    finishReason: parsed.choices[0]?.finish_reason,
                };
            }
            catch { /* skip malformed */ }
        }
    }
}
export default plugin;
export { openaiCompatibleStream, safeParseArgs };
//# sourceMappingURL=index.js.map