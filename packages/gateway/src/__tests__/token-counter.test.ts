import { describe, it, expect } from "vitest";
import { TokenCounter } from "../token-counter.js";
import type { SessionTurn } from "@mxclaw/core";

describe("TokenCounter", () => {
  describe("countTextTokens", () => {
    it("handles empty or null text gracefully", () => {
      expect(TokenCounter.countTextTokens("")).toBe(0);
    });

    it("estimates basic sentences using BPE word boundaries", () => {
      const text = "Hello world! This is a secure agent gateway.";
      // Regex splits: ["Hello", " ", "world", "!", " ", "This", " ", "is", " ", "a", " ", "secure", " ", "agent", " ", "gateway", "."]
      // Matches count = 17.
      const count = TokenCounter.countTextTokens(text, "openai");
      expect(count).toBeGreaterThan(5);
      expect(count).toBeLessThan(25);
    });

    it("scales weights appropriately depending on model family", () => {
      const text = "Supercalifragilisticexpialidocious text split";
      const openai = TokenCounter.countTextTokens(text, "openai");
      const claude = TokenCounter.countTextTokens(text, "claude");
      const gemini = TokenCounter.countTextTokens(text, "gemini");

      expect(claude).toBeLessThanOrEqual(openai);
      expect(gemini).toBeGreaterThanOrEqual(openai);
    });
  });

  describe("countContentTokens", () => {
    it("handles simple string contents", () => {
      const count = TokenCounter.countContentTokens("Test simple content string", "openai");
      expect(count).toBe(TokenCounter.countTextTokens("Test simple content string", "openai"));
    });

    it("calculates low-detail image tokens correctly", () => {
      const payload = [
        { type: "text" as const, text: "Describe this image" },
        { type: "image_url" as const, image_url: { url: "https://example.com/pic.png", detail: "low" as const } }
      ];
      const count = TokenCounter.countContentTokens(payload, "openai");
      const expectedText = TokenCounter.countTextTokens("Describe this image", "openai");
      expect(count).toBe(expectedText + 85);
    });

    it("calculates high-detail image tokens correctly", () => {
      const payload = [
        { type: "text" as const, text: "Describe this high-res image" },
        { type: "image_url" as const, image_url: { url: "https://example.com/pic.png", detail: "high" as const } }
      ];
      const count = TokenCounter.countContentTokens(payload, "openai");
      const expectedText = TokenCounter.countTextTokens("Describe this high-res image", "openai");
      expect(count).toBe(expectedText + 255);
    });
  });

  describe("countTurnTokens", () => {
    it("returns cached tokenCount if present and positive", () => {
      const turn: SessionTurn = {
        role: "user",
        content: "Very long transcript that would ordinarily have high token counts",
        timestamp: Date.now(),
        tokenCount: 5 // Mock cached small value
      };
      expect(TokenCounter.countTurnTokens(turn)).toBe(5);
    });

    it("estimates basic turn tokens and caches them", () => {
      const turn: SessionTurn = {
        role: "assistant",
        content: "Here is the response.",
        timestamp: Date.now()
      };
      expect(turn.tokenCount).toBeUndefined();
      
      const count = TokenCounter.countTurnTokens(turn);
      expect(count).toBeGreaterThan(0);
      expect(turn.tokenCount).toBe(count); // Verified cached
    });

    it("counts tokens from nested tool execution arrays", () => {
      const turn: SessionTurn = {
        role: "assistant",
        content: "I will read the system file",
        toolCalls: [
          { id: "call_1", name: "fileRead", arguments: { path: "settings.json" } }
        ],
        timestamp: Date.now()
      };
      
      const basicTokens = TokenCounter.countTextTokens("I will read the system file");
      const fullTokens = TokenCounter.countTurnTokens(turn);
      
      expect(fullTokens).toBeGreaterThan(basicTokens + 20); // Accounting for overhead and arguments path
    });
  });
});
