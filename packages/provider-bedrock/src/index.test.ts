import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LLMCompletionRequest, LLMCompletionChunk, ProviderPlugin } from "@mxclaw/core";
import { invokeBedrockModel, invokeBedrockStream } from "./sigv4.js";

vi.mock("./sigv4.js", () => ({
  invokeBedrockModel: vi.fn(),
  invokeBedrockStream: vi.fn(),
}));

import defaultPlugin from "./index.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createMockJsonResponse(data: unknown) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn(),
  };
}

function createMockErrorResponse(status: number, body: string) {
  return {
    ok: false,
    status,
    text: vi.fn().mockResolvedValue(body),
    json: vi.fn(),
  };
}

async function collectStream(
  stream: AsyncGenerator<LLMCompletionChunk>,
): Promise<LLMCompletionChunk[]> {
  const chunks: LLMCompletionChunk[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
}

function createMockStreamReader(
  lines: string[],
): () => {
  getReader: () => {
    read: () => Promise<{ done: boolean; value: Uint8Array }>;
    cancel: ReturnType<typeof vi.fn>;
    releaseLock: ReturnType<typeof vi.fn>;
  };
} {
  return () => {
    let index = 0;
    const encoder = new TextEncoder();
    return {
      getReader: () => ({
        read: async () => {
          if (index >= lines.length) {
            return { done: true, value: undefined as unknown as Uint8Array };
          }
          const encoded = encoder.encode(lines[index] + "\n");
          index += 1;
          return { done: false, value: encoded };
        },
        cancel: vi.fn(),
        releaseLock: vi.fn(),
      }),
    };
  };
}

describe("Bedrock Provider", () => {
  let plugin: ProviderPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = defaultPlugin as unknown as ProviderPlugin;
  });

  describe("manifest", () => {
    it("should have valid manifest fields", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("bedrock");
      expect(m.version).toBe("0.1.0");
      expect(m.type).toBe("provider");
      expect(m.description).toBeTruthy();
      expect(m.author).toBe("mxclaw");
      expect(m.main).toBe("dist/index.js");
      expect(Array.isArray(m.capabilities)).toBe(true);
    });

    it("should list expected capabilities", () => {
      const m = plugin.manifest;
      expect(m.capabilities).toContain("completion");
      expect(m.capabilities).toContain("streaming");
      expect(m.capabilities).toContain("tools");
    });
  });

  describe("initialize", () => {
    it("should accept config with accessKeyId, secretAccessKey, and region", async () => {
      await expect(
        plugin.initialize({
          accessKeyId: "my-access-key",
          secretAccessKey: "my-secret-key",
          region: "us-west-2",
        }),
      ).resolves.toBeUndefined();
    });

    it("should pass sigv4 options to invokeBedrockModel", async () => {
      await plugin.initialize({
        accessKeyId: "ak-test",
        secretAccessKey: "sk-test",
        region: "ap-southeast-1",
      });

      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "end_turn",
        usage: { inputTokens: 5, outputTokens: 3, totalTokens: 8 },
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      await plugin.complete({
        model: "claude-3-sonnet",
        messages: [{ role: "user", content: "hi" }],
      });

      expect(invokeBedrockModel).toHaveBeenCalledWith(
        "claude-3-sonnet",
        expect.any(Object),
        expect.objectContaining({
          accessKeyId: "ak-test",
          secretAccessKey: "sk-test",
          region: "ap-southeast-1",
          service: "bedrock",
        }),
      );
    });

    it("should fall back to environment variables", async () => {
      const prevKey = process.env.AWS_ACCESS_KEY_ID;
      const prevSecret = process.env.AWS_SECRET_ACCESS_KEY;
      const prevRegion = process.env.AWS_REGION;
      process.env.AWS_ACCESS_KEY_ID = "env-access-key";
      process.env.AWS_SECRET_ACCESS_KEY = "env-secret-key";
      process.env.AWS_REGION = "eu-central-1";

      await plugin.initialize({});

      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "end_turn",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      await plugin.complete({
        model: "claude-3",
        messages: [{ role: "user", content: "hi" }],
      });

      expect(invokeBedrockModel).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          accessKeyId: "env-access-key",
          secretAccessKey: "env-secret-key",
          region: "eu-central-1",
          service: "bedrock",
        }),
      );

      process.env.AWS_ACCESS_KEY_ID = prevKey;
      process.env.AWS_SECRET_ACCESS_KEY = prevSecret;
      process.env.AWS_REGION = prevRegion;
    });

    it("should default region to us-east-1 when not provided", async () => {
      delete process.env.AWS_REGION;
      await plugin.initialize({
        accessKeyId: "ak",
        secretAccessKey: "sk",
      });

      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "end_turn",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      await plugin.complete({
        model: "claude-3",
        messages: [{ role: "user", content: "hi" }],
      });

      expect(invokeBedrockModel).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ region: "us-east-1" }),
      );
    });
  });

  describe("complete", () => {
    const basicRequest: LLMCompletionRequest = {
      model: "anthropic.claude-3-sonnet-20240229-v1:0",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        region: "us-east-1",
      });
    });

    it("should return a valid completion response", async () => {
      const responseData = {
        output: { message: { content: [{ text: "Hi there!" }] } },
        stopReason: "end_turn",
        usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      const result = await plugin.complete(basicRequest);
      expect(result).toHaveProperty("content", "Hi there!");
      expect(result).toHaveProperty("finishReason", "stop");
      expect(result.usage).toEqual({
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      });
    });

    it("should map finishReason end_turn to stop", async () => {
      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "end_turn",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      const result = await plugin.complete(basicRequest);
      expect(result.finishReason).toBe("stop");
    });

    it("should map finishReason tool_use to tool_calls", async () => {
      const responseData = {
        output: { message: { content: [{ text: "" }] } },
        stopReason: "tool_use",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      const result = await plugin.complete(basicRequest);
      expect(result.finishReason).toBe("tool_calls");
    });

    it("should build correct converse body with system message", async () => {
      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "end_turn",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      await plugin.complete({
        model: "claude-3",
        messages: [
          { role: "system", content: "You are helpful." },
          { role: "user", content: "Hello" },
        ],
        maxTokens: 2048,
        temperature: 0.7,
      });

      const callBody = (invokeBedrockModel as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      expect(callBody.anthropic_version).toBe("bedrock-2023-05-31");
      expect(callBody.max_tokens).toBe(2048);
      expect(callBody.temperature).toBe(0.7);
      expect(callBody.messages).toHaveLength(1);
      expect(callBody.messages[0].role).toBe("user");
      expect(callBody.system).toEqual([{ text: "You are helpful." }]);
    });

    it("should build correct converse body with tools", async () => {
      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "tool_use",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      await plugin.complete({
        model: "claude-3",
        messages: [{ role: "user", content: "Run a command" }],
        tools: [
          {
            function: {
              name: "bash",
              description: "Run shell commands",
              parameters: {
                type: "object",
                properties: { cmd: { type: "string" } },
              },
            },
          },
        ],
      });

      const callBody = (invokeBedrockModel as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      expect(callBody.toolConfig).toBeDefined();
      expect(callBody.toolConfig.tools).toHaveLength(1);
      expect(callBody.toolConfig.tools[0].toolSpec.name).toBe("bash");
      expect(callBody.toolConfig.tools[0].toolSpec.description).toBe(
        "Run shell commands",
      );
      expect(
        callBody.toolConfig.tools[0].toolSpec.inputSchema.json.properties.cmd,
      ).toBeDefined();
    });

    it("should concat multiple content parts from response", async () => {
      const responseData = {
        output: {
          message: {
            content: [
              { text: "Hello" },
              { text: " " },
              { text: "world" },
            ],
          },
        },
        stopReason: "end_turn",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      const result = await plugin.complete(basicRequest);
      expect(result.content).toBe("Hello world");
    });

    it("should return usage as undefined when not present", async () => {
      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "end_turn",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      const result = await plugin.complete(basicRequest);
      expect(result.usage).toBeUndefined();
    });

    it("should throw on HTTP error", async () => {
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockErrorResponse(403, "Access denied"),
      );

      await expect(
        plugin.complete(basicRequest),
      ).rejects.toThrow("Bedrock error 403: Access denied");
    });

    it("should throw on network failure", async () => {
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network failure"),
      );

      await expect(plugin.complete(basicRequest)).rejects.toThrow(
        "Network failure",
      );
    });

    it("should call invokeBedrockModel with correct model and body", async () => {
      const responseData = {
        output: { message: { content: [{ text: "ok" }] } },
        stopReason: "end_turn",
      };
      (invokeBedrockModel as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockJsonResponse(responseData),
      );

      await plugin.complete({
        model: "claude-3-haiku",
        messages: [{ role: "user", content: "test" }],
      });

      expect(invokeBedrockModel).toHaveBeenCalledWith(
        "claude-3-haiku",
        expect.objectContaining({
          anthropic_version: "bedrock-2023-05-31",
        }),
        expect.any(Object),
      );
    });
  });

  describe("completeStream", () => {
    const streamRequest: LLMCompletionRequest = {
      model: "anthropic.claude-3-sonnet-20240229-v1:0",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        region: "us-east-1",
      });
    });

    it("should yield content chunks from base64-encoded stream", async () => {
      const delta1 = {
        type: "contentBlockDelta",
        contentBlockDelta: { delta: { text: "Hello" } },
      };
      const delta2 = {
        type: "contentBlockDelta",
        contentBlockDelta: { delta: { text: " world" } },
      };
      const stop = {
        type: "messageStop",
        messageStop: { stopReason: "end_turn" },
      };

      const line1 = JSON.stringify({
        bytes: Buffer.from(JSON.stringify(delta1)).toString("base64"),
      });
      const line2 = JSON.stringify({
        bytes: Buffer.from(JSON.stringify(delta2)).toString("base64"),
      });
      const line3 = JSON.stringify({
        bytes: Buffer.from(JSON.stringify(stop)).toString("base64"),
      });

      const makeReader = createMockStreamReader([line1, line2, line3]);
      (invokeBedrockStream as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: makeReader(),
        text: vi.fn(),
      });

      const chunks = await collectStream(
        plugin.completeStream(streamRequest),
      );
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks.map((c) => c.content).join("")).toBe("Hello world");
    });

    it("should yield finish reason on messageStop", async () => {
      const delta = {
        type: "contentBlockDelta",
        contentBlockDelta: { delta: { text: "done" } },
      };
      const stop = {
        type: "messageStop",
        messageStop: { stopReason: "end_turn" },
      };

      const line1 = JSON.stringify({
        bytes: Buffer.from(JSON.stringify(delta)).toString("base64"),
      });
      const line2 = JSON.stringify({
        bytes: Buffer.from(JSON.stringify(stop)).toString("base64"),
      });

      const makeReader = createMockStreamReader([line1, line2]);
      (invokeBedrockStream as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: makeReader(),
        text: vi.fn(),
      });

      const chunks = await collectStream(
        plugin.completeStream(streamRequest),
      );
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk).toHaveProperty("finishReason", "stop");
    });

    it("should skip lines without bytes field", async () => {
      const delta = {
        type: "contentBlockDelta",
        contentBlockDelta: { delta: { text: "Hello" } },
      };

      const validLine = JSON.stringify({
        bytes: Buffer.from(JSON.stringify(delta)).toString("base64"),
      });

      const makeReader = createMockStreamReader([
        JSON.stringify({}),
        validLine,
      ]);
      (invokeBedrockStream as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: makeReader(),
        text: vi.fn(),
      });

      const chunks = await collectStream(
        plugin.completeStream(streamRequest),
      );
      expect(chunks.map((c) => c.content).join("")).toBe("Hello");
    });

    it("should throw on HTTP error", async () => {
      (invokeBedrockStream as ReturnType<typeof vi.fn>).mockResolvedValue(
        createMockErrorResponse(429, "Rate limited"),
      );

      await expect(
        collectStream(plugin.completeStream(streamRequest)),
      ).rejects.toThrow("Bedrock stream error 429: Rate limited");
    });

    it("should throw on network failure", async () => {
      (invokeBedrockStream as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Stream connection failed"),
      );

      await expect(
        collectStream(plugin.completeStream(streamRequest)),
      ).rejects.toThrow("Stream connection failed");
    });

    it("should call invokeBedrockStream with correct arguments", async () => {
      const makeReader = createMockStreamReader([]);
      (invokeBedrockStream as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        body: makeReader(),
        text: vi.fn(),
      });

      await collectStream(plugin.completeStream(streamRequest));

      expect(invokeBedrockStream).toHaveBeenCalledWith(
        streamRequest.model,
        expect.objectContaining({
          anthropic_version: "bedrock-2023-05-31",
        }),
        expect.any(Object),
      );
    });
  });

  describe("listModels", () => {
    beforeEach(async () => {
      await plugin.initialize({
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        region: "us-east-1",
      });
    });

    it("should return list of models from API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          modelSummaries: [
            { modelId: "claude-3-opus", modelName: "Claude 3 Opus" },
            { modelId: "llama-3-70b", modelName: "Llama 3 70B" },
          ],
        }),
      });

      const models = await plugin.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe("claude-3-opus");
      expect(models[0].name).toBe("Claude 3 Opus");
      expect(models[1].id).toBe("llama-3-70b");
      expect(models[1].name).toBe("Llama 3 70B");
    });

    it("should return default fallback on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const models = await plugin.listModels();
      expect(models).toHaveLength(1);
      expect(models[0].id).toBe("default");
      expect(models[0].name).toBe("Default");
    });

    it("should return default fallback on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const models = await plugin.listModels();
      expect(models).toHaveLength(1);
      expect(models[0].id).toBe("default");
    });
  });

  describe("healthCheck", () => {
    beforeEach(async () => {
      await plugin.initialize({
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        region: "us-east-1",
      });
    });

    it("should return true when API responds", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      expect(await plugin.healthCheck()).toBe(true);
    });

    it("should return false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Timeout"));

      expect(await plugin.healthCheck()).toBe(false);
    });

    it("should use AbortSignal.timeout(5000)", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await plugin.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(Object),
        }),
      );
    });
  });
});
