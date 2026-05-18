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

describe("cohere provider", () => {
  let plugin: ProviderPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = defaultPlugin as unknown as ProviderPlugin;
  });

  describe("manifest", () => {
    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("cohere");
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
      expect(caps).toContain("embeddings");
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
          message: { content: [{ text: "Hi!" }] },
          finish_reason: "COMPLETE",
        }),
      });

      const result = await plugin.complete(request);
      expect(result).toHaveProperty("content", "Hi!");
      expect(result).toHaveProperty("finishReason", "stop");
    });

    it("should throw on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => "Unauthorized" });
      await expect(plugin.complete(request)).rejects.toThrow();
    });

    it("should throw on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));
      await expect(plugin.complete(request)).rejects.toThrow();
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

    it("should yield text chunks from Cohere SSE", async () => {
      const sseData = [
        "data: " + JSON.stringify({ type: "content-delta", delta: { message: { content: { text: "Hello" } } } }),
        "data: " + JSON.stringify({ type: "content-delta", delta: { message: { content: { text: " world" } } } }),
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

    it("should return hardcoded model list", async () => {
      const models = await plugin.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThanOrEqual(1);
      expect(models[0]).toHaveProperty("id");
      expect(models[0]).toHaveProperty("name");
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
