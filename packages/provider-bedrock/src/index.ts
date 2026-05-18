import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, LLMCompletionChunk, PluginManifest, LLMMessageContent } from "@mxclaw/core";
import { invokeBedrockModel, invokeBedrockStream, type SigV4Options } from "./sigv4.js";

const manifest: PluginManifest = {
  name: "bedrock", version: "0.1.0", type: "provider",
  description: "AWS Bedrock provider (Claude, Llama, etc.)", author: "mxclaw",
  main: "dist/index.js", capabilities: ["completion", "streaming", "tools"],
};

let sigv4Opts: SigV4Options = {
  accessKeyId: "", secretAccessKey: "", region: "us-east-1", service: "bedrock",
};

function contentToString(content: LLMMessageContent): string {
  if (typeof content === "string") return content;
  return content.map((part: Record<string, unknown>) => (part.text as string) ?? "").join(" ").trim();
}

function toConverseBody(request: LLMCompletionRequest): Record<string, unknown> {
  const systemMessages: string[] = [];
  const messages: Array<Record<string, unknown>> = [];

  for (const msg of request.messages) {
    if (msg.role === "system") {
      systemMessages.push(contentToString(msg.content));
    } else {
      messages.push({
        role: msg.role,
        content: [{ text: contentToString(msg.content) }],
      });
    }
  }

  const body: Record<string, unknown> = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: request.maxTokens ?? 4096,
    messages,
  };
  if (request.temperature !== undefined) body.temperature = request.temperature;
  if (systemMessages.length > 0) body.system = systemMessages.map(t => ({ text: t }));
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

const plugin: ProviderPlugin = {
  manifest,
  initialize: async (config) => {
    sigv4Opts = {
      accessKeyId: (config.accessKeyId as string) ?? process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: (config.secretAccessKey as string) ?? process.env.AWS_SECRET_ACCESS_KEY ?? "",
      sessionToken: (config.sessionToken as string) ?? process.env.AWS_SESSION_TOKEN ?? undefined,
      region: (config.region as string) ?? process.env.AWS_REGION ?? "us-east-1",
      service: "bedrock",
    };
  },
  complete: async (request): Promise<LLMCompletionResponse> => {
    const body = toConverseBody(request);
    const resp = await invokeBedrockModel(request.model, body, sigv4Opts);
    if (!resp.ok) throw new Error(`Bedrock error ${resp.status}: ${await resp.text().catch(() => "")}`);

    const data = (await resp.json()) as {
      output?: { message?: { content?: Array<{ text?: string }> } };
      stopReason?: string;
      usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
    };

    const content = data.output?.message?.content?.map(c => c.text ?? "").join("") ?? "";
    return {
      content,
      finishReason: (data.stopReason === "end_turn" ? "stop" : data.stopReason === "tool_use" ? "tool_calls" : "stop") as LLMCompletionResponse["finishReason"],
      usage: data.usage ? {
        promptTokens: data.usage.inputTokens,
        completionTokens: data.usage.outputTokens,
        totalTokens: data.usage.totalTokens,
      } : undefined,
    };
  },
  completeStream: async function* (request): AsyncGenerator<LLMCompletionChunk> {
    const body = toConverseBody(request);
    const resp = await invokeBedrockStream(request.model, body, sigv4Opts);
    if (!resp.ok) throw new Error(`Bedrock stream error ${resp.status}: ${await resp.text().catch(() => "")}`);

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line) as { bytes?: string };
          if (!parsed.bytes) continue;
          const decoded = JSON.parse(Buffer.from(parsed.bytes, "base64").toString()) as {
            type?: string;
            contentBlockDelta?: { delta?: { text?: string } };
            messageStop?: { stopReason?: string };
          };

          if (decoded.type === "contentBlockDelta" && decoded.contentBlockDelta?.delta?.text) {
            yield { content: decoded.contentBlockDelta.delta.text };
          }
          if (decoded.type === "messageStop") {
            yield { content: "", finishReason: "stop" };
          }
        } catch { /* skip malformed chunks */ }
      }
    }
  },
  listModels: async () => {
    try {
      const resp = await fetch(`https://bedrock.${sigv4Opts.region}.amazonaws.com/foundation-models`, {
        headers: { "X-Amz-Date": new Date().toISOString().replace(/[:-]|\.\d{3}/g, "") },
        signal: AbortSignal.timeout(5000),
      });
      if (!resp.ok) return [{ id: "default", name: "Default" }];
      const data = (await resp.json()) as { modelSummaries?: Array<{ modelId: string; modelName?: string }> };
      return (data.modelSummaries ?? []).map(m => ({ id: m.modelId, name: m.modelName ?? m.modelId }));
    } catch {
      return [{ id: "default", name: "Default" }];
    }
  },
  healthCheck: async () => {
    try {
      await fetch(`https://bedrock.${sigv4Opts.region}.amazonaws.com/foundation-models`, { signal: AbortSignal.timeout(5000) });
      return true;
    } catch { return false; }
  },
};

export default plugin;