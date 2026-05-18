import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionChunk } from "@mxclaw/core";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import plugin from "./index.js";

describe("Replicate Provider Plugin Interface Compliance", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("manifest", () => {
    it("should have a valid manifest with all required fields", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("replicate");
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
    });
  });

  describe("initialize", () => {
    it("should initialize with defaults (no config)", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should accept apiKey from config", async () => {
      await expect(plugin.initialize({ apiKey: "r8-test-key" })).resolves.toBeUndefined();
    });
  });

  describe("complete", () => {
    const request: LLMCompletionRequest = {
      model: "meta/meta-llama-3-70b-instruct",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      vi.useFakeTimers();
      await plugin.initialize({ apiKey: "r8-test-key" });
    });

    it("should poll until succeeded and return content", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "pred-1", status: "starting" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "pred-1", status: "processing" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "pred-1", status: "succeeded", output: ["Hello world"] }),
        });

      const promise = plugin.complete(request);

      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;
      expect(result.content).toBe("Hello world");
      expect(result.finishReason).toBe("stop");
    });

    it("should throw on HTTP error from POST", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      await expect(plugin.complete(request)).rejects.toThrow(
        "Replicate error: 401"
      );
    });

    it("should throw on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      await expect(plugin.complete(request)).rejects.toThrow();
    });
  });

  describe("completeStream", () => {
    const request: LLMCompletionRequest = {
      model: "meta/meta-llama-3-70b-instruct",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      vi.useFakeTimers();
      await plugin.initialize({ apiKey: "r8-test-key" });
    });

    async function collectStream(
      stream: AsyncGenerator<LLMCompletionChunk>
    ): Promise<LLMCompletionChunk[]> {
      const chunks: LLMCompletionChunk[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return chunks;
    }

    it("should yield from complete result", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "pred-1", status: "starting" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "pred-1", status: "processing" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: "pred-1", status: "succeeded", output: ["Hello world"] }),
        });

      const stream = plugin.completeStream(request);
      const collectPromise = collectStream(stream);

      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(1000);

      const chunks = await collectPromise;
      expect(chunks).toHaveLength(1);
      expect(chunks[0].content).toBe("Hello world");
      expect(chunks[0].finishReason).toBe("stop");
    });
  });

  describe("listModels", () => {
    it("should return hardcoded model list", async () => {
      const models = await plugin.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(2);
      expect(models[0]).toEqual({
        id: "meta/meta-llama-3-70b-instruct",
        name: "Llama 3 70B",
      });
      expect(models[1]).toEqual({
        id: "mistralai/mixtral-8x7b-instruct-v0.1",
        name: "Mixtral 8x7B",
      });
    });
  });

  describe("healthCheck", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "r8-test-key" });
    });

    it("should return true when healthy", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      expect(await plugin.healthCheck()).toBe(true);
    });

    it("should return false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Timeout"));
      expect(await plugin.healthCheck()).toBe(false);
    });
  });
});
