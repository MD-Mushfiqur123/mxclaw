import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, LLMCompletionChunk, PluginManifest, LLMMessageContent } from "@mxclaw/core";

const manifest: PluginManifest = {
  name: "gemini", version: "0.1.0", type: "provider",
  description: "Google Gemini API provider (Gemini 2.5 Pro, Flash)",
  author: "mxclaw", main: "dist/index.js",
  capabilities: ["completion", "streaming", "tools", "vision"],
};

let apiKey = "";
let baseUrl = "https://generativelanguage.googleapis.com/v1beta";

const plugin: ProviderPlugin = {
  manifest,
  initialize: async (config) => {
    apiKey = (config.apiKey as string) ?? process.env.GEMINI_API_KEY ?? "";
    baseUrl = (config.baseUrl as string) ?? "https://generativelanguage.googleapis.com/v1beta";
  },

  complete: async (request): Promise<LLMCompletionResponse> => {
    const { systemInstruction, contents, tools } = convertToGemini(request);
    const resp = await fetch(
      `${baseUrl}/models/${request.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction,
          contents,
          ...(tools.length > 0 ? { tools: [{ functionDeclarations: tools }] } : {}),
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
          },
        }),
        signal: request.signal,
      },
    );

    if (!resp.ok) {
      const errBody = await resp.text();
      throw new Error(`Gemini error ${resp.status}: ${errBody}`);
    }

    const data = await resp.json() as GeminiResponse;
    const candidate = data.candidates?.[0];
    if (!candidate) throw new Error("No candidates in Gemini response");

    let content = "";
    const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];

    for (const part of candidate.content?.parts ?? []) {
      if (part.text) content += part.text;
      if (part.functionCall) {
        toolCalls.push({
          id: `call_${Math.random().toString(36).slice(2, 10)}`,
          name: part.functionCall.name,
          arguments: part.functionCall.args ?? {},
        });
      }
    }

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      finishReason: candidate.finishReason === "STOP" ? "stop" : "stop",
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  },

  completeStream: async function* (request): AsyncGenerator<LLMCompletionChunk> {
    const { systemInstruction, contents, tools } = convertToGemini(request);
    const resp = await fetch(
      `${baseUrl}/models/${request.model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction,
          contents,
          ...(tools.length > 0 ? { tools: [{ functionDeclarations: tools }] } : {}),
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
          },
        }),
        signal: request.signal,
      },
    );

    if (!resp.ok) throw new Error(`Gemini stream error: ${resp.status}`);
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
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6)) as GeminiResponse;
          const candidate = data.candidates?.[0];
          if (!candidate) continue;

          for (const part of candidate.content?.parts ?? []) {
            if (part.text) {
              yield { content: part.text, finishReason: undefined };
            }
            if (part.functionCall) {
              yield {
                content: "",
                toolCalls: [{
                  id: `call_${Math.random().toString(36).slice(2, 10)}`,
                  name: part.functionCall.name,
                  arguments: JSON.stringify(part.functionCall.args ?? {}),
                }],
                finishReason: undefined,
              };
            }
          }

          if (candidate.finishReason === "STOP") {
            yield { content: "", finishReason: "stop" };
          }
        } catch { /* skip malformed */ }
      }
    }
  },

  listModels: async () => {
    try {
      const resp = await fetch(`${baseUrl}/models?key=${apiKey}`);
      const data = await resp.json() as { models: Array<{ name: string; displayName: string }> };
      return data.models
        .filter(m => m.name.includes("gemini"))
        .map(m => ({ id: m.name.replace("models/", ""), name: m.displayName }));
    } catch {
      return [
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
        { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      ];
    }
  },

  healthCheck: async () => {
    try {
      const resp = await fetch(`${baseUrl}/models?key=${apiKey}`);
      return resp.ok;
    } catch { return false; }
  },
};

// ── Gemini Format Types ─────────────────────────────────────────────

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts: Array<{ text?: string; functionCall?: { name: string; args?: Record<string, unknown> } }> };
    finishReason?: string;
  }>;
  usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number };
}

function contentToString(content: LLMMessageContent): string {
  if (typeof content === "string") return content;
  return content.map((part: Record<string, unknown>) => (part.text as string) ?? "").join(" ").trim();
}

function convertToGemini(request: LLMCompletionRequest) {
  let systemInstruction: { parts: Array<{ text: string }> } | undefined;
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  for (const msg of request.messages) {
    if (msg.role === "system") {
      systemInstruction = { parts: [{ text: contentToString(msg.content) }] };
    } else {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: contentToString(msg.content) }],
      });
    }
  }

  const tools: Array<{ name: string; description: string; parameters: Record<string, unknown> }> = [];
  if (request.tools) {
    for (const t of request.tools) {
      tools.push({
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters as Record<string, unknown>,
      });
    }
  }

  return { systemInstruction, contents, tools };
}

export default plugin;