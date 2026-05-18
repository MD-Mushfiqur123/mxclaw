import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionChunk } from "@mxclaw/core";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import defaultPlugin from "./index.js";

describe("Gemini Provider Plugin Interface Compliance", () => {
  let plugin: ProviderPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = defaultPlugin as unknown as ProviderPlugin;
  });

  describe("manifest", () => {
    it("should have a valid manifest with all required fields", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("gemini");
      expect(m.version).toBe("0.1.0");
      expect(m.type).toBe("provider");
      expect(m.description).toBeDefined();
      expect(m.author).toBeDefined();
      expect(m.main).toBeDefined();
      expect(Array.isArray(m.capabilities)).toBe(true);
    });

    it("should list expected capabilities", () => {
      const m = plugin.manifest;
      expect(m.capabilities).toContain("completion");
      expect(m.capabilities).toContain("streaming");
      expect(m.capabilities).toContain("tools");
      expect(m.capabilities).toContain("vision");
    });
  });

  describe("initialize", () => {
    it("should initialize with defaults (no config)", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should accept apiKey from config", async () => {
      await expect(plugin.initialize({ apiKey: "ai-test-key" })).resolves.toBeUndefined();
    });

    it("should accept baseUrl override", async () => {
      await expect(plugin.initialize({ baseUrl: "https://custom.api.com/v1beta" })).resolves.toBeUndefined();
    });
  });

  describe("complete", () => {
    const request: LLMCompletionRequest = {
      model: "gemini-2.5-pro",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({ apiKey: "ai-test-key" });
    });

    it("should return a valid completion response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: { parts: [{ text: "Hi there!" }] },
            finishReason: "STOP",
          }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
        }),
      });

      const result = await plugin.complete(request);
      expect(result).toHaveProperty("content", "Hi there!");
      expect(result).toHaveProperty("finishReason", "stop");
      expect(result.usage).toEqual({ promptTokens: 10, completionTokens: 5, totalTokens: 15 });
    });

    it("should handle tool calls in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [
                { functionCall: { name: "bash", args: { cmd: "ls" } } },
              ],
            },
            finishReason: "STOP",
          }],
        }),
      });

      const result = await plugin.complete(request);
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0].name).toBe("bash");
      expect(result.toolCalls![0].arguments).toEqual({ cmd: "ls" });
    });

    it("should throw on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Invalid API key",
      });

      await expect(plugin.complete(request)).rejects.toThrow(/401/);
    });

    it("should throw on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));
      await expect(plugin.complete(request)).rejects.toThrow();
    });
  });

  describe("completeStream", () => {
    const request: LLMCompletionRequest = {
      model: "gemini-2.5-pro",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({ apiKey: "ai-test-key" });
    });

    async function collectStream(stream: AsyncGenerator<LLMCompletionChunk>): Promise<LLMCompletionChunk[]> {
      const chunks: LLMCompletionChunk[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return chunks;
    }

    function createMockStreamResponse(chunks: string[]): Response {
      const encoder = new TextEncoder();
      const body = chunks.join("\n") + "\n";
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

    it("should yield text chunks from SSE stream", async () => {
      const sseData = [
        "data: " + JSON.stringify({ candidates: [{ content: { parts: [{ text: "Hello" }] } }] }),
        "data: " + JSON.stringify({ candidates: [{ content: { parts: [{ text: " world" }] } }] }),
        "data: " + JSON.stringify({ candidates: [{ content: { parts: [{}] }, finishReason: "STOP" }] }),
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(sseData));

      const stream = plugin.completeStream(request);
      const chunks = await collectStream(stream);
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks.map((c) => c.content).join("")).toBe("Hello world");
    });

    it("should yield tool call chunks from SSE stream", async () => {
      const sseData = [
        "data: " + JSON.stringify({
          candidates: [{
            content: { parts: [{ functionCall: { name: "bash", args: { cmd: "ls" } } }] },
            finishReason: "STOP",
          }],
        }),
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(sseData));

      const stream = plugin.completeStream(request);
      const chunks = await collectStream(stream);
      expect(chunks.some((c) => c.toolCalls)).toBe(true);
      const tcChunk = chunks.find((c) => c.toolCalls);
      expect(tcChunk!.toolCalls![0].name).toBe("bash");
    });

    it("should throw on streaming HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Rate Limited",
        text: async () => "Too many requests",
      });

      const stream = plugin.completeStream(request);
      await expect(collectStream(stream)).rejects.toThrow(/429/);
    });

    it("should handle streaming network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Stream connection failed"));
      const stream = plugin.completeStream(request);
      await expect(collectStream(stream)).rejects.toThrow();
    });
  });

  describe("listModels", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "ai-test-key" });
    });

    it("should return list of models from API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          models: [
            { name: "models/gemini-2.5-pro", displayName: "Gemini 2.5 Pro" },
            { name: "models/gemini-2.5-flash", displayName: "Gemini 2.5 Flash" },
          ],
        }),
      });

      const models = await plugin.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThanOrEqual(2);
      models.forEach((m) => {
        expect(m).toHaveProperty("id");
        expect(m).toHaveProperty("name");
      });
      expect(models[0].id).toBe("gemini-2.5-pro");
    });

    it("should filter out non-gemini models", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          models: [
            { name: "models/gemini-2.5-pro", displayName: "Gemini 2.5 Pro" },
            { name: "models/text-bison", displayName: "PaLM 2" },
          ],
        }),
      });

      const models = await plugin.listModels();
      expect(models).toHaveLength(1);
      expect(models[0].id).toBe("gemini-2.5-pro");
    });

    it("should return fallback on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const models = await plugin.listModels();
      expect(models.length).toBe(2);
      expect(models[0].id).toBe("gemini-2.5-pro");
      expect(models[1].id).toBe("gemini-2.5-flash");
    });
  });

  describe("healthCheck", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "ai-test-key" });
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
