import * as fs from "node:fs/promises";
import * as path from "node:path";
import { type Logger } from "@mxclaw/logging";

// ── Types ────────────────────────────────────────────────────────────

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

// ── SKILL.md Parser ──────────────────────────────────────────────────

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
export function parseSkillMd(raw: string, fallbackName: string): SkillDefinition {
  const frontmatter: SkillFrontmatter = {};
  let promptContent = raw;

  // Extract YAML frontmatter between --- delimiters
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (fmMatch && fmMatch[1] && fmMatch[2]) {
    const fmBlock = fmMatch[1];
    promptContent = fmMatch[2].trim();

    for (const line of fmBlock.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) continue;

      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();

      switch (key) {
        case "name":
          frontmatter.name = stripQuotes(value);
          break;
        case "description":
          frontmatter.description = stripQuotes(value);
          break;
        case "triggers":
          frontmatter.triggers = parseArrayValue(value);
          break;
        case "tools":
          frontmatter.tools = parseArrayValue(value);
          break;
        case "enabled":
          frontmatter.enabled = value === "true" || value === "yes";
          break;
      }
    }
  }

  return {
    name: frontmatter.name ?? fallbackName,
    description: frontmatter.description ?? "",
    triggers: frontmatter.triggers ?? [],
    tools: frontmatter.tools ?? [],
    promptContent,
    filePath: "",
    enabled: frontmatter.enabled ?? true,
  };
}

// ── Skill Loader ─────────────────────────────────────────────────────

/**
 * Load all skills from the workspace skills directory.
 *
 * Directory structure (mirrors OpenClaw):
 *   ~/.mxclaw/workspace/skills/<skill-name>/SKILL.md
 */
export class SkillLoader {
  private skills = new Map<string, SkillDefinition>();
  private logger: Logger;
  private skillsDir: string;

  constructor(workspacePath: string, logger: Logger) {
    this.logger = logger;
    this.skillsDir = path.join(workspacePath, "skills");
  }

  /**
   * Scan the skills directory and load all SKILL.md files.
   */
  async loadAll(): Promise<SkillDefinition[]> {
    this.skills.clear();

    try {
      await fs.access(this.skillsDir);
    } catch {
      this.logger.debug("skills", `Skills directory not found: ${this.skillsDir}`);
      return [];
    }

    const entries = await fs.readdir(this.skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillMdPath = path.join(this.skillsDir, entry.name, "SKILL.md");
      try {
        const raw = await fs.readFile(skillMdPath, "utf-8");
        const skill = parseSkillMd(raw, entry.name);
        skill.filePath = skillMdPath;

        this.skills.set(skill.name, skill);
        this.logger.info("skills", `Loaded skill: ${skill.name} (${skill.triggers.length} triggers)`);
      } catch {
        this.logger.debug("skills", `No SKILL.md in ${entry.name}, skipping`);
      }
    }

    return Array.from(this.skills.values());
  }

  /**
   * Get a specific skill by name.
   */
  getSkill(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  /**
   * Get all loaded skills.
   */
  getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get enabled skills only.
   */
  getEnabledSkills(): SkillDefinition[] {
    return this.getAllSkills().filter((s) => s.enabled);
  }

  /**
   * Check if any skill triggers match the given message.
   * Returns the first matching skill, or null.
   */
  matchTrigger(message: string): SkillDefinition | null {
    const lower = message.toLowerCase();
    for (const skill of this.getEnabledSkills()) {
      for (const trigger of skill.triggers) {
        if (lower.includes(trigger.toLowerCase())) {
          return skill;
        }
      }
    }
    return null;
  }

  /**
   * Build the combined skills prompt to inject into the agent's system context.
   * Only includes enabled skills.
   */
  buildSkillsPrompt(): string {
    const enabled = this.getEnabledSkills();
    if (enabled.length === 0) return "";

    const sections = enabled.map(
      (s) =>
        `## Skill: ${s.name}\n${s.description ? `> ${s.description}\n` : ""}${s.promptContent}`,
    );

    return `\n\n# Available Skills\n\n${sections.join("\n\n---\n\n")}`;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseArrayValue(value: string): string[] {
  // Support [a, b, c] or a, b, c
  const cleaned = value.replace(/^\[/, "").replace(/\]$/, "");
  return cleaned
    .split(",")
    .map((s) => stripQuotes(s.trim()))
    .filter(Boolean);
}
