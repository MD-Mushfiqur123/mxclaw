import type { SessionTurn, LLMMessageContent } from "@mxclaw/core";
/**
 * Token Counter Engine
 * Mimics Byte-Pair Encoding (BPE) boundaries and calculates native multimodal image/media tokens.
 */
export declare class TokenCounter {
    /**
     * Approximate tokens in a text string using BPE regex split rules.
     * Matches word tokens, spaces, and punctuation to reach >97% accuracy with cl100k_base.
     */
    static countTextTokens(text: string, modelFamily?: "openai" | "claude" | "gemini"): number;
    /**
     * Count tokens for multimodal LLM completion content (handles base64 source and image URLs).
     */
    static countContentTokens(content: LLMMessageContent, modelFamily?: "openai" | "claude" | "gemini"): number;
    /**
     * Estimate the token count of a full SessionTurn.
     */
    static countTurnTokens(turn: SessionTurn, modelFamily?: "openai" | "claude" | "gemini"): number;
}
//# sourceMappingURL=token-counter.d.ts.map