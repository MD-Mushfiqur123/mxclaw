import type { MxClawConfig, SessionTurn } from "@mxclaw/core";
import type { SkillLoader } from "@mxclaw/skills";
import type { Logger } from "@mxclaw/logging";
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
export declare class ContextEngine {
    private logger;
    private workspacePath;
    constructor(logger: Logger, workspacePath: string);
    /**
     * Build the complete message array for an LLM call.
     */
    buildContext(opts: {
        agentConfig: MxClawConfig["agents"][string];
        turns: SessionTurn[];
        skillLoader?: SkillLoader;
        maxTokens?: number;
    }): Promise<Array<{
        role: string;
        content: string;
    }>>;
    /**
     * Load AGENTS.md and SOUL.md from the workspace root.
     */
    private loadIdentityFiles;
    /**
     * Trim turns from the beginning until they fit within the token budget.
     * Always keeps the most recent turns.
     */
    private trimToTokenBudget;
}
//# sourceMappingURL=context-engine.d.ts.map