import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProviderPlugin, LLMCompletionRequest, LLMCompletionResponse, PluginManifest } from "@mxclaw/core";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import defaultPlugin, { getPreset, listPresets, PROVIDER_PRESETS } from "./index.js";

describe("OpenAI-Compatible Provider Plugin Interface Compliance", () => {
  let plugin: ProviderPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    plugin = defaultPlugin as unknown as ProviderPlugin;
  });

  describe("manifest", () => {
    it("should have a valid manifest with all required fields", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("openai-compatible");
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
      await expect(plugin.initialize({ apiKey: "sk-test" })).resolves.toBeUndefined();
    });

    it("should accept preset from config", async () => {
      await expect(plugin.initialize({ preset: "groq", apiKey: "gsk-test" })).resolves.toBeUndefined();
    });

    it("should accept baseUrl override", async () => {
      await expect(plugin.initialize({ baseUrl: "https://custom.api.com/v1" })).resolves.toBeUndefined();
    });

    it("should accept modelAliases", async () => {
      await expect(plugin.initialize({ modelAliases: { "gpt4": "gpt-4o" } })).resolves.toBeUndefined();
    });

    it("should accept custom headers", async () => {
      await expect(plugin.initialize({ headers: { "X-Custom": "value" } })).resolves.toBeUndefined();
    });
  });

  describe("complete", () => {
    const request: LLMCompletionRequest = {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({ apiKey: "sk-test" });
    });

    it("should return a valid completion response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Hi there!", tool_calls: undefined }, finish_reason: "stop" }],
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
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
          choices: [{
            message: {
              content: "",
              tool_calls: [{ id: "call-1", function: { name: "bash", arguments: '{"cmd":"ls"}' } }],
            },
            finish_reason: "tool_calls",
          }],
        }),
      });

      const result = await plugin.complete(request);
      expect(result.finishReason).toBe("tool_calls");
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0].name).toBe("bash");
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

    it("should throw on empty choices", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      });
      await expect(plugin.complete(request)).rejects.toThrow(/no completion choice/i);
    });

    it("should handle abort signal", async () => {
      const ac = new AbortController();
      ac.abort();
      await expect(plugin.complete({ ...request, signal: ac.signal })).rejects.toThrow();
    });
  });

  describe("completeStream", () => {
    const request: LLMCompletionRequest = {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
    };

    beforeEach(async () => {
      await plugin.initialize({ apiKey: "sk-test" });
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

    it("should yield text chunks from SSE stream", async () => {
      const sseData = [
        `data: ${JSON.stringify({ choices: [{ delta: { content: "Hello" }, finish_reason: null }] })}`,
        `data: ${JSON.stringify({ choices: [{ delta: { content: " world" }, finish_reason: null }] })}`,
        `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}`,
        "data: [DONE]",
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(sseData));

      const stream = plugin.completeStream(request);
      const chunks = await collectStream(stream);
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks.map((c) => c.content).join("")).toBe("Hello world");
    });

    it("should yield tool call chunks from SSE stream", async () => {
      const sseData = [
        `data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [{ index: 0, id: "call-1", function: { name: "bash", arguments: "" } }] }, finish_reason: null }] })}`,
        `data: ${JSON.stringify({ choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '{"cmd":"ls"}' } }] }, finish_reason: null }] })}`,
        `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "tool_calls" }] })}`,
        "data: [DONE]",
      ];
      mockFetch.mockResolvedValueOnce(createMockStreamResponse(sseData));

      const stream = plugin.completeStream(request);
      const chunks = await collectStream(stream);
      expect(chunks.some((c) => c.toolCalls)).toBe(true);
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
      await plugin.initialize({ apiKey: "sk-test" });
    });

    it("should return list of models", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: "gpt-4o" }, { id: "gpt-4" }] }),
      });

      const models = await plugin.listModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThanOrEqual(2);
      models.forEach((m) => {
        expect(m).toHaveProperty("id");
        expect(m).toHaveProperty("name");
      });
    });

    it("should return fallback on HTTP error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const models = await plugin.listModels();
      expect(models.length).toBe(1);
      expect(models[0].id).toBe("default");
    });

    it("should return fallback on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      const models = await plugin.listModels();
      expect(models.length).toBe(1);
      expect(models[0].id).toBe("default");
    });
  });

  describe("healthCheck", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "sk-test" });
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

describe("getPreset / listPresets", () => {
  it("should return known presets", () => {
    expect(listPresets()).toContain("openai");
    expect(listPresets()).toContain("groq");
    expect(listPresets()).toContain("ollama");
    expect(listPresets()).toContain("custom");
  });

  it("should get specific preset", () => {
    const preset = getPreset("openai");
    expect(preset).toBeDefined();
    expect(preset!.baseUrl).toBe("https://api.openai.com/v1");
    expect(preset!.defaultModel).toBe("gpt-4o");
  });

  it("should return undefined for unknown preset", () => {
    expect(getPreset("nonexistent")).toBeUndefined();
  });

  it("should have all required fields for every preset", () => {
    for (const [name, preset] of Object.entries(PROVIDER_PRESETS)) {
      expect(preset.baseUrl).toBeDefined();
      expect(preset.defaultModel).toBeDefined();
      expect(typeof preset.baseUrl).toBe("string");
    }
  });
});
