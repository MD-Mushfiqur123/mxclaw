import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionChunk, PluginManifest } from "@mxclaw/core";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import defaultPlugin from "./index.js";

describe("Ollama Provider Plugin Interface Compliance", () => {
  let plugin: ProviderPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = defaultPlugin as unknown as ProviderPlugin;
  });

  describe("manifest", () => {
    it("should have a valid manifest with all required fields", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("ollama");
      expect(m.version).toBe("0.1.0");
      expect(m.type).toBe("provider");
      expect(m.description).toBeDefined();
      expect(m.author).toBeDefined();
      expect(m.main).toBeDefined();
      expect(Array.isArray(m.capabilities)).toBe(true);
    });

    it("should list expected capabilities (no tools, no vision)", () => {
      const m = plugin.manifest;
      expect(m.capabilities).toContain("completion");
      expect(m.capabilities).toContain("streaming");
      expect(m.capabilities).not.toContain("tools");
      expect(m.capabilities).not.toContain("vision");
    });
  });

  describe("initialize", () => {
    it("should initialize with empty config (no apiKey needed)", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should accept baseUrl from config", async () => {
      await expect(plugin.initialize({ baseUrl: "http://custom:11434" })).resolves.toBeUndefined();
    });
  });

  describe("complete", () => {
    const request: LLMCompletionRequest = {
      model: "llama3",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({});
    });

    it("should return a valid completion response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: { content: "Hi there!" },
          eval_count: 5,
          prompt_eval_count: 10,
        }),
      });

      const result = await plugin.complete(request);
      expect(result).toHaveProperty("content", "Hi there!");
      expect(result).toHaveProperty("finishReason", "stop");
      expect(result.usage).toEqual({ promptTokens: 10, completionTokens: 5, totalTokens: 15 });
    });

    it("should handle missing token counts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: { content: "Hello" },
        }),
      });

      const result = await plugin.complete(request);
      expect(result.usage).toEqual({ promptTokens: 0, completionTokens: 0, totalTokens: 0 });
    });

    it("should throw on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(plugin.complete(request)).rejects.toThrow(/500/);
    });

    it("should throw on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));
      await expect(plugin.complete(request)).rejects.toThrow();
    });
  });

  describe("completeStream", () => {
    const request: LLMCompletionRequest = {
      model: "llama3",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({});
    });

    async function collectStream(stream: AsyncGenerator<LLMCompletionChunk>): Promise<LLMCompletionChunk[]> {
      const chunks: LLMCompletionChunk[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return chunks;
    }

    function createMockStreamResponse(lines: string[]): Response {
      const encoder = new TextEncoder();
      const body = lines.join("\n");
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

    it("should yield text chunks from NDJSON stream (no data: prefix)", async () => {
      const ndjsonLines = [
        JSON.stringify({ message: { content: "Hello" }, done: false }),
        JSON.stringify({ message: { content: " world" }, done: false }),
        JSON.stringify({ message: { content: "" }, done: true }),
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(ndjsonLines));

      const stream = plugin.completeStream(request);
      const chunks = await collectStream(stream);
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks.map((c) => c.content).join("")).toBe("Hello world");
    });

    it("should mark finishReason as stop when done is true", async () => {
      const ndjsonLines = [
        JSON.stringify({ message: { content: "Hi" }, done: false }),
        JSON.stringify({ message: { content: "" }, done: true }),
        "",
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(ndjsonLines));

      const stream = plugin.completeStream(request);
      const chunks = await collectStream(stream);
      expect(chunks.some((c) => c.finishReason === "stop")).toBe(true);
    });

    it("should handle empty content in stream chunks", async () => {
      const ndjsonLines = [
        JSON.stringify({ message: {}, done: false }),
        JSON.stringify({ message: { content: "Hi" }, done: false }),
        JSON.stringify({ message: {}, done: true }),
        "",
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(ndjsonLines));

      const stream = plugin.completeStream(request);
      const chunks = await collectStream(stream);
      expect(chunks.map((c) => c.content).join("")).toBe("Hi");
    });

    it("should throw on streaming HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const stream = plugin.completeStream(request);
      await expect(collectStream(stream)).rejects.toThrow(/429/);
    });

    it("should throw on streaming network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Stream connection failed"));
      const stream = plugin.completeStream(request);
      await expect(collectStream(stream)).rejects.toThrow();
    });
  });

  describe("listModels", () => {
    beforeEach(async () => {
      await plugin.initialize({});
    });

    it("should return list of models from /api/tags", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          models: [{ name: "llama3" }, { name: "mistral" }],
        }),
      });

      const models = await plugin.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(2);
      expect(models[0]).toEqual({ id: "llama3", name: "llama3" });
      expect(models[1]).toEqual({ id: "mistral", name: "mistral" });
    });

    it("should return fallback on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const models = await plugin.listModels();
      expect(models).toEqual([]);
    });

    it("should return fallback on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const models = await plugin.listModels();
      expect(models).toEqual([]);
    });
  });

  describe("healthCheck", () => {
    beforeEach(async () => {
      await plugin.initialize({});
    });

    it("should return true when healthy", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      expect(await plugin.healthCheck()).toBe(true);
    });

    it("should return false on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      expect(await plugin.healthCheck()).toBe(false);
    });

    it("should return false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Timeout"));
      expect(await plugin.healthCheck()).toBe(false);
    });
  });
});
