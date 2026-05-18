import { invokeBedrockModel, invokeBedrockStream } from "./sigv4.js";
const manifest = {
    name: "bedrock", version: "0.1.0", type: "provider",
    description: "AWS Bedrock provider (Claude, Llama, etc.)", author: "mxclaw",
    main: "dist/index.js", capabilities: ["completion", "streaming", "tools"],
};
let sigv4Opts = {
    accessKeyId: "", secretAccessKey: "", region: "us-east-1", service: "bedrock",
};
function contentToString(content) {
    if (typeof content === "string")
        return content;
    return content.map((part) => part.text ?? "").join(" ").trim();
}
function toConverseBody(request) {
    const systemMessages = [];
    const messages = [];
    for (const msg of request.messages) {
        if (msg.role === "system") {
            systemMessages.push(contentToString(msg.content));
        }
        else {
            messages.push({
                role: msg.role,
                content: [{ text: contentToString(msg.content) }],
            });
        }
    }
    const body = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: request.maxTokens ?? 4096,
        messages,
    };
    if (request.temperature !== undefined)
        body.temperature = request.temperature;
    if (systemMessages.length > 0)
        body.system = systemMessages.map(t => ({ text: t }));
    if (request.tools?.length) {
        body.toolConfig = {
            tools: request.tools.map(t => ({
                toolSpec: {
                    name: t.function.name,
                    description: t.function.description,
                    inputSchema: { json: t.function.parameters },
                },
            })),
        };
    }
    return body;
}
const plugin = {
    manifest,
    initialize: async (config) => {
        sigv4Opts = {
            accessKeyId: config.accessKeyId ?? process.env.AWS_ACCESS_KEY_ID ?? "",
            secretAccessKey: config.secretAccessKey ?? process.env.AWS_SECRET_ACCESS_KEY ?? "",
            sessionToken: config.sessionToken ?? process.env.AWS_SESSION_TOKEN ?? undefined,
            region: config.region ?? process.env.AWS_REGION ?? "us-east-1",
            service: "bedrock",
        };
    },
    complete: async (request) => {
        const body = toConverseBody(request);
        const resp = await invokeBedrockModel(request.model, body, sigv4Opts);
        if (!resp.ok)
            throw new Error(`Bedrock error ${resp.status}: ${await resp.text().catch(() => "")}`);
        const data = (await resp.json());
        const content = data.output?.message?.content?.map(c => c.text ?? "").join("") ?? "";
        return {
            content,
            finishReason: (data.stopReason === "end_turn" ? "stop" : data.stopReason === "tool_use" ? "tool_calls" : "stop"),
            usage: data.usage ? {
                promptTokens: data.usage.inputTokens,
                completionTokens: data.usage.outputTokens,
                totalTokens: data.usage.totalTokens,
            } : undefined,
        };
    },
    completeStream: async function* (request) {
        const body = toConverseBody(request);
        const resp = await invokeBedrockStream(request.model, body, sigv4Opts);
        if (!resp.ok)
            throw new Error(`Bedrock stream error ${resp.status}: ${await resp.text().catch(() => "")}`);
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
                try {
                    const parsed = JSON.parse(line);
                    if (!parsed.bytes)
                        continue;
                    const decoded = JSON.parse(Buffer.from(parsed.bytes, "base64").toString());
                    if (decoded.type === "contentBlockDelta" && decoded.contentBlockDelta?.delta?.text) {
                        yield { content: decoded.contentBlockDelta.delta.text };
                    }
                    if (decoded.type === "messageStop") {
                        yield { content: "", finishReason: "stop" };
                    }
                }
                catch { /* skip malformed chunks */ }
            }
        }
    },
    listModels: async () => {
        try {
            const resp = await fetch(`https://bedrock.${sigv4Opts.region}.amazonaws.com/foundation-models`, {
                headers: { "X-Amz-Date": new Date().toISOString().replace(/[:-]|\.\d{3}/g, "") },
                signal: AbortSignal.timeout(5000),
            });
            if (!resp.ok)
                return [{ id: "default", name: "Default" }];
            const data = (await resp.json());
            return (data.modelSummaries ?? []).map(m => ({ id: m.modelId, name: m.modelName ?? m.modelId }));
        }
        catch {
            return [{ id: "default", name: "Default" }];
        }
    },
    healthCheck: async () => {
        try {
            await fetch(`https://bedrock.${sigv4Opts.region}.amazonaws.com/foundation-models`, { signal: AbortSignal.timeout(5000) });
            return true;
        }
        catch {
            return false;
        }
    },
};
export default plugin;
//# sourceMappingURL=index.js.map