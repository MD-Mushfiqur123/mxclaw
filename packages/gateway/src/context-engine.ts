import type { MxClawConfig, SessionTurn } from "@mxclaw/core";
import type { SkillLoader } from "@mxclaw/skills";
import type { Logger } from "@mxclaw/logging";
import { TokenCounter } from "./token-counter.js";

/**
 * Context Engine — assembles the complete system prompt for agent LLM calls.
 *
 * Mirrors OpenClaw's `src/context-engine/` by combining:
 * - Agent system prompt (from config)
 * - AGENTS.md / SOUL.md (workspace markdown files)
 * - Active skills (from SkillLoader)
 * - Conversation history (with token budgeting)
 * - Tool definitions
 *
 * Token budgeting ensures we never exceed the model's context window.
 */
export class ContextEngine {
  constructor(
    private logger: Logger,
    private workspacePath: string,
  ) {}

  /**
   * Build the complete message array for an LLM call.
   */
  async buildContext(opts: {
    agentConfig: MxClawConfig["agents"][string];
    turns: SessionTurn[];
    skillLoader?: SkillLoader;
    maxTokens?: number;
  }): Promise<Array<{ role: string; content: string }>> {
    const { agentConfig, turns, skillLoader, maxTokens } = opts;

    // Detect model family for precision token calculation
    const modelId = agentConfig.model.model.toLowerCase();
    const modelFamily = modelId.includes("claude")
      ? "claude"
      : modelId.includes("gemini")
      ? "gemini"
      : "openai";

    // 1. Base system prompt
    let systemPrompt =
      agentConfig.systemPrompt ??
      agentConfig.model.systemPrompt ??
      "You are mxclaw, a helpful AI assistant. You have access to tools for executing commands, reading/writing files, and more. Be concise and helpful.";

    // 2. Load workspace identity files (AGENTS.md, SOUL.md)
    const identityContent = await this.loadIdentityFiles();
    if (identityContent) {
      systemPrompt += `\n\n${identityContent}`;
    }

    // 3. Inject skills
    if (skillLoader) {
      const skillsPrompt = skillLoader.buildSkillsPrompt();
      if (skillsPrompt) {
        systemPrompt += skillsPrompt;
      }
    }

    // 4. Token budget management
    const estimatedSystemTokens = TokenCounter.countTextTokens(systemPrompt, modelFamily);
    const budget = maxTokens ?? 128_000; // Default to 128k context
    const responseReserve = 4_096;
    const availableForHistory = budget - estimatedSystemTokens - responseReserve;

    // 5. Trim conversation history to fit budget using precise BPE rules
    const trimmedTurns = this.trimToTokenBudget(turns, availableForHistory, modelFamily);

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
      ...trimmedTurns.map((t) => ({
        role: t.role,
        content: t.content,
      })),
    ];

    this.logger.debug(
      "context",
      `Built context (${modelFamily}): ${estimatedSystemTokens} system tokens, ${trimmedTurns.length}/${turns.length} turns, budget: ${budget}`,
    );

    return messages;
  }

  /**
   * Load AGENTS.md and SOUL.md from the workspace root.
   */
  private async loadIdentityFiles(): Promise<string | null> {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const parts: string[] = [];

    for (const filename of ["AGENTS.md", "SOUL.md", "INSTRUCTIONS.md", "TOOLS.md"]) {
      const filePath = path.join(this.workspacePath, filename);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        parts.push(`# ${filename}\n\n${content.trim()}`);
      } catch {
        // File doesn't exist — skip
      }
    }

    return parts.length > 0 ? parts.join("\n\n---\n\n") : null;
  }

  /**
   * Trim turns from the beginning until they fit within the token budget.
   * Always keeps the most recent turns.
   */
  private trimToTokenBudget(turns: SessionTurn[], maxTokens: number, modelFamily: "openai" | "claude" | "gemini"): SessionTurn[] {
    if (turns.length === 0) return [];

    let totalTokens = 0;
    const result: SessionTurn[] = [];

    // Walk backwards (newest first)
    for (let i = turns.length - 1; i >= 0; i--) {
      const turnTokens = TokenCounter.countTurnTokens(turns[i]!, modelFamily);
      if (totalTokens + turnTokens > maxTokens && result.length > 0) {
        break;
      }
      totalTokens += turnTokens;
      result.unshift(turns[i]!);
    }

    return result;
  }
}
