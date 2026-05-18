import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionChunk } from "@mxclaw/core";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import defaultPlugin from "./index.js";

function createMockStreamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const body = chunks.join("\n");
  return {
    ok: true,
    body: {
      getReader: () => {
        let pos = 0;
        return {
          read: async () => {
            if (pos >= body.length) return { done: true, value: undefined as unknown as Uint8Array };
            const chunk = body.slice(pos, pos + 100);
            pos += 100;
            return { done: false, value: encoder.encode(chunk) };
          },
          cancel: vi.fn(),
          releaseLock: vi.fn(),
        };
      },
    },
  } as unknown as Response;
}

async function collectStream(stream: AsyncGenerator<LLMCompletionChunk>): Promise<LLMCompletionChunk[]> {
  const chunks: LLMCompletionChunk[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return chunks;
}

describe("openai provider", () => {
  let plugin: ProviderPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = defaultPlugin as unknown as ProviderPlugin;
  });

  describe("manifest", () => {
    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("openai");
      expect(m.version).toBe("0.1.0");
      expect(m.type).toBe("provider");
      expect(m.description).toBeDefined();
      expect(m.author).toBeDefined();
      expect(m.main).toBeDefined();
      expect(Array.isArray(m.capabilities)).toBe(true);
    });

    it("should list expected capabilities", () => {
      const caps = plugin.manifest.capabilities;
      expect(caps).toContain("completion");
      expect(caps).toContain("streaming");
      expect(caps).toContain("tools");
      expect(caps).toContain("vision");
    });
  });

  describe("initialize", () => {
    it("should initialize with defaults", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should accept apiKey from config", async () => {
      await expect(plugin.initialize({ apiKey: "test-key" })).resolves.toBeUndefined();
    });

    it("should accept baseUrl override", async () => {
      await expect(plugin.initialize({ baseUrl: "https://custom.api.com/v1" })).resolves.toBeUndefined();
    });
  });

  describe("complete", () => {
    const request: LLMCompletionRequest = {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({ apiKey: "test-key" });
    });

    it("should return valid completion", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Hi!", tool_calls: undefined, }, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      });

      const result = await plugin.complete(request);
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("finishReason");
    });

    it("should throw on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      await expect(plugin.complete(request)).rejects.toThrow();
    });

    it("should throw on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));
      await expect(plugin.complete(request)).rejects.toThrow();
    });
    
    it("should handle tool calls", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: "",
              tool_calls: [{ id: "call-1", function: { name: "bash", arguments: '{"cmd":"ls"}' } }],
            },
            finish_reason: "tool_calls",
          }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      });

      const result = await plugin.complete(request);
      expect(result.finishReason).toBe("tool_calls");
      expect(result.toolCalls).toHaveLength(1);
    });
  });

  describe("completeStream", () => {
    const request: LLMCompletionRequest = {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({ apiKey: "test-key" });
    });

    it("should yield text chunks", async () => {
      const sseData = [
        `data: ${JSON.stringify({ choices: [{ delta: { content: "Hello" }, finish_reason: null }] })}`,
        `data: ${JSON.stringify({ choices: [{ delta: { content: " world" }, finish_reason: null }] })}`,
        `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}`,
        "data: [DONE]",
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(sseData));

      const chunks = await collectStream(plugin.completeStream(request));
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks.map(c => c.content).join("")).toBe("Hello world");
    });

    it("should throw on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 429, text: async () => "Rate limited" });
      await expect(collectStream(plugin.completeStream(request))).rejects.toThrow();
    });

    it("should throw on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Stream failed"));
      await expect(collectStream(plugin.completeStream(request))).rejects.toThrow();
    });
  });

  describe("listModels", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "test-key" });
    });

    it("should return model list from API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: "gpt-4o" }, { id: "gpt-4" }] }),
      });
      const models = await plugin.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThanOrEqual(2);
      expect(models[0]).toHaveProperty("id");
      expect(models[0]).toHaveProperty("name");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => "" });
      await expect(plugin.listModels()).rejects.toThrow();
    });
  });

  describe("healthCheck", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "test-key" });
    });

    it("should return false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Timeout"));
      expect(await plugin.healthCheck()).toBe(false);
    });
  });
});
