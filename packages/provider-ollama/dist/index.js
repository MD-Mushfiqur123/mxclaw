const manifest = {
    name: "ollama", version: "0.1.0", type: "provider",
    description: "Ollama local model provider", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming"],
};
let baseUrl = "http://localhost:11434";
const plugin = {
    manifest,
    initialize: async (config) => {
        baseUrl = config.baseUrl ?? process.env.OLLAMA_HOST ?? "http://localhost:11434";
    },
    complete: async (request) => {
        const resp = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, stream: false, options: { temperature: request.temperature, num_predict: request.maxTokens } }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Ollama error ${resp.status}: ${await resp.text()}`);
        const data = await resp.json();
        return {
            content: data.message.content,
            finishReason: "stop",
            usage: { promptTokens: data.prompt_eval_count ?? 0, completionTokens: data.eval_count ?? 0, totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0) },
        };
    },
    completeStream: async function* (request) {
        const resp = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, stream: true, options: { temperature: request.temperature, num_predict: request.maxTokens } }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Ollama stream error: ${resp.status}`);
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
                if (!line.trim())
                    continue;
                try {
                    const data = JSON.parse(line);
                    yield { content: data.message?.content ?? "", finishReason: data.done ? "stop" : undefined };
                }
                catch { }
            }
        }
    },
    listModels: async () => {
        try {
            const resp = await fetch(`${baseUrl}/api/tags`);
            const data = await resp.json();
            return data.models.map(m => ({ id: m.name, name: m.name }));
        }
        catch {
            return [];
        }
    },
    healthCheck: async () => {
        try {
            const r = await fetch(`${baseUrl}/api/tags`);
            return r.ok;
        }
        catch {
            return false;
        }
    },
};
export default plugin;
//# sourceMappingURL=index.js.map