import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { LLMCompletionChunk } from "@mxclaw/core";
import plugin from "./index.js";

function createSSEStream(data: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(data));
      controller.close();
    },
  });
}

function sseLine(obj: Record<string, unknown>): string {
  return "data: " + JSON.stringify(obj) + "\n";
}

const baseRequest = {
  model: "claude-sonnet-4-20250514",
  messages: [{ role: "user", content: "hello" }],
};

const completeFixture = {
  content: [
    { type: "text", text: "Hello!" },
    { type: "tool_use", id: "toolu_123", name: "get_weather", input: { location: "NYC" } },
  ],
  stop_reason: "end_turn",
  usage: { input_tokens: 10, output_tokens: 20 },
};

function mockOkResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(""),
  };
}

describe("Anthropic provider", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("manifest", () => {
    it("has valid manifest fields", () => {
      expect(plugin.manifest.name).toBe("anthropic");
      expect(plugin.manifest.version).toBe("0.1.0");
      expect(plugin.manifest.type).toBe("provider");
      expect(plugin.manifest.description).toBeTruthy();
      expect(plugin.manifest.author).toBeTruthy();
      expect(plugin.manifest.main).toBeTruthy();
    });

    it("includes all required capabilities", () => {
      expect(plugin.manifest.capabilities).toContain("completion");
      expect(plugin.manifest.capabilities).toContain("streaming");
      expect(plugin.manifest.capabilities).toContain("tools");
      expect(plugin.manifest.capabilities).toContain("vision");
    });
  });

  describe("initialize", () => {
    it("uses default baseUrl when not configured", async () => {
      await plugin.initialize({ apiKey: "test-key" });
      mockFetch.mockResolvedValue(mockOkResponse(completeFixture));
      await plugin.complete(baseRequest);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.anthropic.com/v1/messages",
        expect.anything()
      );
    });

    it("uses custom baseUrl when configured", async () => {
      await plugin.initialize({ apiKey: "test-key", baseUrl: "https://custom.com" });
      mockFetch.mockResolvedValue(mockOkResponse(completeFixture));
      await plugin.complete(baseRequest);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://custom.com/v1/messages",
        expect.anything()
      );
    });

    it("passes x-api-key header", async () => {
      await plugin.initialize({ apiKey: "secret-key" });
      mockFetch.mockResolvedValue(mockOkResponse(completeFixture));
      await plugin.complete(baseRequest);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "secret-key",
          }),
        })
      );
    });
  });

  describe("complete", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "test-key" });
    });

    it("returns valid response with content and tool calls", async () => {
      mockFetch.mockResolvedValue(mockOkResponse(completeFixture));
      const result = await plugin.complete(baseRequest);
      expect(result).toEqual({
        content: "Hello!",
        toolCalls: [
          { id: "toolu_123", name: "get_weather", arguments: { location: "NYC" } },
        ],
        finishReason: "stop",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      });
    });

    it("returns response without tool calls when none present", async () => {
      mockFetch.mockResolvedValue(
        mockOkResponse({
          content: [{ type: "text", text: "Just text" }],
          stop_reason: "end_turn",
          usage: { input_tokens: 5, output_tokens: 5 },
        })
      );
      const result = await plugin.complete(baseRequest);
      expect(result.content).toBe("Just text");
      expect(result.toolCalls).toBeUndefined();
      expect(result.finishReason).toBe("stop");
    });

    it("throws on HTTP error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });
      await expect(plugin.complete(baseRequest)).rejects.toThrow(
        "Anthropic error 400: Bad request"
      );
    });

    it("throws on network failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network failure"));
      await expect(plugin.complete(baseRequest)).rejects.toThrow("Network failure");
    });
  });

  describe("completeStream", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "test-key" });
    });

    it("yields text chunks from content_block_delta events", async () => {
      const sseData =
        sseLine({ type: "content_block_start", content_block: { type: "text", text: "" } }) +
        sseLine({ type: "content_block_delta", delta: { type: "text_delta", text: "Hello" } }) +
        sseLine({ type: "content_block_delta", delta: { type: "text_delta", text: " world" } }) +
        sseLine({ type: "content_block_stop" }) +
        sseLine({ type: "message_delta", delta: { stop_reason: "end_turn" } });

      mockFetch.mockResolvedValue({
        ok: true,
        body: createSSEStream(sseData),
      });

      const chunks: LLMCompletionChunk[] = [];
      for await (const chunk of plugin.completeStream(baseRequest)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ content: "Hello", finishReason: undefined });
      expect(chunks[1]).toEqual({ content: " world", finishReason: undefined });
      expect(chunks[2]).toEqual({ content: "", finishReason: "stop" });
    });

    it("yields tool call from content_block_start/stop and input_json_delta", async () => {
      const sseData =
        sseLine({
          type: "content_block_start",
          content_block: { type: "tool_use", id: "toolu_123", name: "get_weather" },
        }) +
        sseLine({
          type: "content_block_delta",
          delta: { type: "input_json_delta", partial_json: '{"location": "NYC"}' },
        }) +
        sseLine({ type: "content_block_stop" }) +
        sseLine({ type: "message_delta", delta: { stop_reason: "tool_use" } });

      mockFetch.mockResolvedValue({
        ok: true,
        body: createSSEStream(sseData),
      });

      const chunks: LLMCompletionChunk[] = [];
      for await (const chunk of plugin.completeStream(baseRequest)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toEqual({
        content: "",
        toolCalls: [
          { id: "toolu_123", name: "get_weather", arguments: '{"location": "NYC"}' },
        ],
        finishReason: undefined,
      });
      expect(chunks[1]).toEqual({ content: "", finishReason: "tool_use" });
    });

    it("throws on HTTP error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      const gen = plugin.completeStream(baseRequest);
      await expect(gen.next()).rejects.toThrow("Anthropic stream error: 500");
    });
  });

  describe("listModels", () => {
    it("returns hardcoded list of three models", async () => {
      const models = await plugin.listModels();
      expect(models).toHaveLength(3);
      expect(models[0]).toEqual({
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
      });
      expect(models[1]).toEqual({
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
      });
      expect(models[2]).toEqual({
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
      });
    });
  });

  describe("healthCheck", () => {
    beforeEach(async () => {
      await plugin.initialize({ apiKey: "test-key" });
    });

    it("returns true on success", async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const result = await plugin.healthCheck();
      expect(result).toBe(true);
    });

    it("returns false when server returns error", async () => {
      mockFetch.mockResolvedValue({ ok: false });
      const result = await plugin.healthCheck();
      expect(result).toBe(false);
    });

    it("returns false on network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      const result = await plugin.healthCheck();
      expect(result).toBe(false);
    });
  });
});
