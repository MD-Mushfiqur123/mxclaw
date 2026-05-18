const manifest = {
    name: "anthropic", version: "0.1.0", type: "provider",
    description: "Anthropic Claude API provider (Claude Sonnet 4, Haiku, Opus)",
    author: "mxclaw", main: "dist/index.js",
    capabilities: ["completion", "streaming", "tools", "vision"],
};
let apiKey = "";
let baseUrl = "https://api.anthropic.com";
const plugin = {
    manifest,
    initialize: async (config) => {
        apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY ?? "";
        baseUrl = config.baseUrl ?? "https://api.anthropic.com";
    },
    complete: async (request) => {
        const { system, messages } = convertMessages(request);
        const resp = await fetch(`${baseUrl}/v1/messages`, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: request.model,
                max_tokens: request.maxTokens ?? 4096,
                temperature: request.temperature,
                system,
                messages,
                ...(request.tools ? { tools: convertTools(request.tools) } : {}),
            }),
            signal: request.signal,
        });
        if (!resp.ok) {
            const errBody = await resp.text();
            throw new Error(`Anthropic error ${resp.status}: ${errBody}`);
        }
        const data = await resp.json();
        return parseAnthropicResponse(data);
    },
    completeStream: async function* (request) {
        const { system, messages } = convertMessages(request);
        const resp = await fetch(`${baseUrl}/v1/messages`, {
            method: "POST",
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: request.model,
                max_tokens: request.maxTokens ?? 4096,
                temperature: request.temperature,
                system,
                messages,
                stream: true,
                ...(request.tools ? { tools: convertTools(request.tools) } : {}),
            }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Anthropic stream error: ${resp.status}`);
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let toolCallId = "";
        let toolCallName = "";
        let toolCallArgs = "";
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
                const raw = line.slice(6);
                if (raw === "[DONE]")
                    return;
                try {
                    const event = JSON.parse(raw);
                    if (event.type === "content_block_start") {
                        if (event.content_block?.type === "tool_use") {
                            toolCallId = event.content_block.id ?? "";
                            toolCallName = event.content_block.name ?? "";
                            toolCallArgs = "";
                        }
                    }
                    else if (event.type === "content_block_delta") {
                        if (event.delta?.type === "text_delta") {
                            yield { content: event.delta.text ?? "", finishReason: undefined };
                        }
                        else if (event.delta?.type === "input_json_delta") {
                            toolCallArgs += event.delta.partial_json ?? "";
                        }
                    }
                    else if (event.type === "content_block_stop") {
                        if (toolCallName) {
                            yield {
                                content: "",
                                toolCalls: [{
                                        id: toolCallId,
                                        name: toolCallName,
                                        arguments: toolCallArgs,
                                    }],
                                finishReason: undefined,
                            };
                            toolCallId = "";
                            toolCallName = "";
                            toolCallArgs = "";
                        }
                    }
                    else if (event.type === "message_delta") {
                        if (event.delta?.stop_reason) {
                            yield {
                                content: "",
                                finishReason: (event.delta.stop_reason === "end_turn" ? "stop" : event.delta.stop_reason),
                            };
                        }
                    }
                }
                catch { /* skip malformed */ }
            }
        }
    },
    listModels: async () => [
        { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
        { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
        { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    ],
    healthCheck: async () => {
        try {
            const resp = await fetch(`${baseUrl}/v1/messages`, {
                method: "POST",
                headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
                body: JSON.stringify({ model: "claude-3-5-haiku-20241022", max_tokens: 1, messages: [{ role: "user", content: "ping" }] }),
            });
            return resp.ok;
        }
        catch {
            return false;
        }
    },
};
function convertMessages(request) {
    let system = "";
    const messages = [];
    for (const msg of request.messages) {
        if (msg.role === "system") {
            system += (system ? "\n\n" : "") + msg.content;
        }
        else {
            messages.push({ role: msg.role, content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content) });
        }
    }
    return { system, messages };
}
function convertTools(tools) {
    if (!tools)
        return [];
    return tools.map(t => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
    }));
}
function parseAnthropicResponse(data) {
    let content = "";
    const toolCalls = [];
    for (const block of data.content) {
        if (block.type === "text")
            content += block.text ?? "";
        if (block.type === "tool_use") {
            toolCalls.push({ id: block.id ?? "", name: block.name ?? "", arguments: block.input ?? {} });
        }
    }
    return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        finishReason: (data.stop_reason === "end_turn" ? "stop" : data.stop_reason),
        usage: { promptTokens: data.usage.input_tokens, completionTokens: data.usage.output_tokens, totalTokens: data.usage.input_tokens + data.usage.output_tokens },
    };
}
export default plugin;
//# sourceMappingURL=index.js.map