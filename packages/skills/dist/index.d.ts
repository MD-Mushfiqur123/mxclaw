import { type Logger } from "@mxclaw/logging";
export interface SkillDefinition {
    /** Skill name (directory name or frontmatter override). */
    name: string;
    /** Human-readable description. */
    description: string;
    /** Trigger keywords/phrases that activate this skill. */
    triggers: string[];
    /** Tools this skill uses or unlocks. */
    tools: string[];
    /** The raw SKILL.md content to inject into the agent's system prompt. */
    promptContent: string;
    /** Absolute path to the SKILL.md file. */
    filePath: string;
    /** Whether this skill is currently enabled. */
    enabled: boolean;
}
export interface SkillFrontmatter {
    name?: string;
    description?: string;
    triggers?: string[];
    tools?: string[];
    enabled?: boolean;
}
/**
 * Parse a SKILL.md file into structured frontmatter + prompt content.
 *
 * Format:
 * ```
 * ---
 * name: My Skill
 * description: Does cool things
 * triggers: [summarize, tldr]
 * tools: [web_search, web_fetch]
 * ---
 *
 * # My Skill
 * You are an expert at summarizing...
 * ```
 */
export declare function parseSkillMd(raw: string, fallbackName: string): SkillDefinition;
/**
 * Load all skills from the workspace skills directory.
 *
 * Directory structure (mirrors OpenClaw):
 *   ~/.mxclaw/workspace/skills/<skill-name>/SKILL.md
 */
export declare class SkillLoader {
    private skills;
    private logger;
    private skillsDir;
    constructor(workspacePath: string, logger: Logger);
    /**
     * Scan the skills directory and load all SKILL.md files.
     */
    loadAll(): Promise<SkillDefinition[]>;
    /**
     * Get a specific skill by name.
     */
    getSkill(name: string): SkillDefinition | undefined;
    /**
     * Get all loaded skills.
     */
    getAllSkills(): SkillDefinition[];
    /**
     * Get enabled skills only.
     */
    getEnabledSkills(): SkillDefinition[];
    /**
     * Check if any skill triggers match the given message.
     * Returns the first matching skill, or null.
     */
    matchTrigger(message: string): SkillDefinition | null;
    /**
     * Build the combined skills prompt to inject into the agent's system context.
     * Only includes enabled skills.
     */
    buildSkillsPrompt(): string;
}
//# sourceMappingURL=index.d.ts.map