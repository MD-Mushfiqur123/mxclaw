import { describe, it, expect } from "vitest";
import { parseSkillMd, SkillLoader } from "../index.js";

describe("skills", () => {
  describe("parseSkillMd", () => {
    it("parses full frontmatter + content", () => {
      const raw = `---
name: Web Researcher
description: Expert at finding information online
triggers: [search, find, lookup, research]
tools: [web_search, web_fetch]
enabled: true
---

# Web Researcher

You are an expert web researcher. When asked to find information:
1. Use web_search to find relevant results
2. Use web_fetch to read the most promising pages
3. Synthesize the information into a clear answer`;

      const skill = parseSkillMd(raw, "fallback-name");
      expect(skill.name).toBe("Web Researcher");
      expect(skill.description).toBe("Expert at finding information online");
      expect(skill.triggers).toEqual(["search", "find", "lookup", "research"]);
      expect(skill.tools).toEqual(["web_search", "web_fetch"]);
      expect(skill.enabled).toBe(true);
      expect(skill.promptContent).toContain("# Web Researcher");
      expect(skill.promptContent).toContain("Synthesize the information");
    });

    it("uses fallback name when no frontmatter name", () => {
      const raw = `---
description: A simple skill
---

Do the thing.`;

      const skill = parseSkillMd(raw, "my-skill");
      expect(skill.name).toBe("my-skill");
      expect(skill.description).toBe("A simple skill");
    });

    it("handles no frontmatter at all", () => {
      const raw = `# Just Content\n\nNo frontmatter here.`;

      const skill = parseSkillMd(raw, "raw-skill");
      expect(skill.name).toBe("raw-skill");
      expect(skill.description).toBe("");
      expect(skill.triggers).toEqual([]);
      expect(skill.tools).toEqual([]);
      expect(skill.enabled).toBe(true);
      expect(skill.promptContent).toContain("# Just Content");
    });

    it("handles quoted values", () => {
      const raw = `---
name: "My 'Quoted' Skill"
description: 'Single quoted'
triggers: ["hello world", 'goodbye']
---

Content`;

      const skill = parseSkillMd(raw, "x");
      expect(skill.name).toBe("My 'Quoted' Skill");
      expect(skill.description).toBe("Single quoted");
      expect(skill.triggers).toEqual(["hello world", "goodbye"]);
    });

    it("defaults enabled to true when not specified", () => {
      const raw = `---
name: Test
---
Content`;
      const skill = parseSkillMd(raw, "x");
      expect(skill.enabled).toBe(true);
    });

    it("respects enabled: false", () => {
      const raw = `---
name: Disabled Skill
enabled: false
---
Content`;
      // enabled is set to false only if value is "true" or "yes"
      const skill = parseSkillMd(raw, "x");
      expect(skill.enabled).toBe(false);
    });
  });
});
