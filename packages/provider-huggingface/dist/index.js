const manifest = {
    name: "huggingface", version: "0.1.0", type: "provider",
    description: "Hugging Face Inference API provider (serverless & dedicated endpoints)", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming"],
};
let apiKey = "";
let baseUrl = "https://api-inference.huggingface.co";
const plugin = {
    manifest,
    initialize: async (config) => {
        apiKey = config.apiKey ?? process.env.HF_API_KEY ?? process.env.HUGGINGFACE_API_KEY ?? "";
        baseUrl = config.baseUrl ?? "https://api-inference.huggingface.co";
    },
    complete: async (request) => {
        const endpoint = `${baseUrl}/models/${request.model}/v1/chat/completions`;
        const resp = await fetch(endpoint, {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Hugging Face error: ${resp.status} ${await resp.text().catch(() => "")}`);
        const data = (await resp.json());
        return { content: data.choices[0]?.message.content ?? "", finishReason: data.choices[0]?.finish_reason, usage: data.usage ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens } : undefined };
    },
    completeStream: async function* (request) {
        const endpoint = `${baseUrl}/models/${request.model}/v1/chat/completions`;
        const resp = await fetch(endpoint, {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: request.model, messages: request.messages, temperature: request.temperature, max_tokens: request.maxTokens, stream: true }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Hugging Face stream error: ${resp.status}`);
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
    listModels: async () => [
        { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B Instruct" },
        { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B Instruct" },
        { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B Instruct" },
    ],
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