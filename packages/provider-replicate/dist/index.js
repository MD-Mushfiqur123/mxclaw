const manifest = {
    name: "replicate", version: "0.1.0", type: "provider",
    description: "Replicate provider (hosted models)", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming"],
};
let apiKey = "";
const plugin = {
    manifest,
    initialize: async (config) => { apiKey = config.apiKey ?? process.env.REPLICATE_API_KEY ?? ""; },
    complete: async (request) => {
        const resp = await fetch("https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions", {
            method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ input: { prompt: request.messages.map(m => `${m.role}: ${m.content}`).join("\n"), max_tokens: request.maxTokens, temperature: request.temperature } }),
            signal: request.signal,
        });
        if (!resp.ok)
            throw new Error(`Replicate error: ${resp.status}`);
        const prediction = (await resp.json());
        // Poll for completion
        let result = prediction;
        while (result.status !== "succeeded" && result.status !== "failed") {
            await new Promise(r => setTimeout(r, 1000));
            const pollResp = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, { headers: { Authorization: `Bearer ${apiKey}` } });
            result = (await pollResp.json());
        }
        return { content: result.output?.join("") ?? "", finishReason: result.status === "succeeded" ? "stop" : "error" };
    },
    completeStream: async function* (request) {
        // Replicate doesn't natively stream chat; fall back to non-streaming
        const result = await plugin.complete(request);
        yield { content: result.content, finishReason: result.finishReason };
    },
    listModels: async () => [{ id: "meta/meta-llama-3-70b-instruct", name: "Llama 3 70B" }, { id: "mistralai/mixtral-8x7b-instruct-v0.1", name: "Mixtral 8x7B" }],
    healthCheck: async () => { try {
        await fetch("https://api.replicate.com/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
        return true;
    }
    catch {
        return false;
    } },
};
export default plugin;
//# sourceMappingURL=index.js.map