import { describe, it, expect, vi } from "vitest";
import { parseSlashCommand, normalizeThinkLevel, normalizeVerboseLevel, normalizeUsageDisplay } from "../slash-commands.js";

describe("Slash Commands", () => {
  describe("parseSlashCommand", () => {
    it("parses valid commands", () => {
      expect(parseSlashCommand("/new")).toEqual({ command: "new", args: [], raw: "/new" });
      expect(parseSlashCommand("/reset")).toEqual({ command: "reset", args: [], raw: "/reset" });
      expect(parseSlashCommand("/status")).toEqual({ command: "status", args: [], raw: "/status" });
      expect(parseSlashCommand("/whoami")).toEqual({ command: "whoami", args: [], raw: "/whoami" });
      expect(parseSlashCommand("/help")).toEqual({ command: "help", args: [], raw: "/help" });
      expect(parseSlashCommand("/stop")).toEqual({ command: "stop", args: [], raw: "/stop" });
      expect(parseSlashCommand("/tools")).toEqual({ command: "tools", args: [], raw: "/tools" });
    });

    it("parses commands with arguments", () => {
      expect(parseSlashCommand("/think high")).toEqual({ command: "think", args: ["high"], raw: "/think high" });
      expect(parseSlashCommand("/verbose on")).toEqual({ command: "verbose", args: ["on"], raw: "/verbose on" });
      expect(parseSlashCommand("/usage full")).toEqual({ command: "usage", args: ["full"], raw: "/usage full" });
      expect(parseSlashCommand("/compact please keep focus on foo")).toEqual({ 
        command: "compact", 
        args: ["please", "keep", "focus", "on", "foo"], 
        raw: "/compact please keep focus on foo" 
      });
    });

    it("handles whitespace and casing", () => {
      expect(parseSlashCommand("  /NEW  ")).toEqual({ command: "new", args: [], raw: "/NEW" });
      expect(parseSlashCommand("/Think  max ")).toEqual({ command: "think", args: ["max"], raw: "/Think  max" });
    });

    it("returns null for non-commands", () => {
      expect(parseSlashCommand("hello world")).toBeNull();
      expect(parseSlashCommand("/unknown")).toBeNull();
      expect(parseSlashCommand("\\new")).toBeNull();
      expect(parseSlashCommand("")).toBeNull();
    });
  });

  describe("Normalizers", () => {
    it("normalizeThinkLevel", () => {
      expect(normalizeThinkLevel("off")).toBe("off");
      expect(normalizeThinkLevel("none")).toBe("off");
      expect(normalizeThinkLevel("low")).toBe("low");
      expect(normalizeThinkLevel("on")).toBe("low");
      expect(normalizeThinkLevel("enable")).toBe("low");
      expect(normalizeThinkLevel("medium")).toBe("medium");
      expect(normalizeThinkLevel("mid")).toBe("medium");
      expect(normalizeThinkLevel("high")).toBe("high");
      expect(normalizeThinkLevel("ultra")).toBe("high");
      expect(normalizeThinkLevel("xhigh")).toBe("xhigh");
      expect(normalizeThinkLevel("extrahigh")).toBe("xhigh");
      expect(normalizeThinkLevel("max")).toBe("max");
      expect(normalizeThinkLevel("unknown")).toBeUndefined();
    });

    it("normalizeVerboseLevel", () => {
      expect(normalizeVerboseLevel("on")).toBe("on");
      expect(normalizeVerboseLevel("true")).toBe("on");
      expect(normalizeVerboseLevel("1")).toBe("on");
      expect(normalizeVerboseLevel("off")).toBe("off");
      expect(normalizeVerboseLevel("false")).toBe("off");
      expect(normalizeVerboseLevel("0")).toBe("off");
      expect(normalizeVerboseLevel("full")).toBe("full");
      expect(normalizeVerboseLevel("all")).toBe("full");
      expect(normalizeVerboseLevel("unknown")).toBeUndefined();
    });

    it("normalizeUsageDisplay", () => {
      expect(normalizeUsageDisplay("tokens")).toBe("tokens");
      expect(normalizeUsageDisplay("minimal")).toBe("tokens");
      expect(normalizeUsageDisplay("on")).toBe("tokens");
      expect(normalizeUsageDisplay("off")).toBe("off");
      expect(normalizeUsageDisplay("false")).toBe("off");
      expect(normalizeUsageDisplay("full")).toBe("full");
      expect(normalizeUsageDisplay("session")).toBe("full");
      expect(normalizeUsageDisplay("unknown")).toBeUndefined();
    });
  });
});
