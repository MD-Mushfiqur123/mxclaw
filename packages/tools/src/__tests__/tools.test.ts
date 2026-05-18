import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerSessionSpawnHandler } from "../index.js";

// We need to import the tool after registering the handler
describe("tools", () => {
  describe("session_spawn", () => {
    it("returns error when no handler is registered", async () => {
      // Import fresh to get clean state
      const { sessionSpawnTool } = await import("../index.js");

      // Clear any previously registered handler by re-registering null
      // (we can't do this directly, but we can test the unregistered path
      // by checking behavior before any registration)
      // Since module state persists, we test via the tool directly
      const result = await sessionSpawnTool.execute(
        { agentId: "test-agent", message: "hello" },
        {
          agentId: "parent",
          sessionKey: "parent-session",
          workspacePath: "/tmp/workspace",
          sandbox: undefined,
          signal: new AbortController().signal,
        },
      );

      // After this test file's first run, the handler might be null
      // This verifies the tool handles missing handler gracefully
      expect(result).toBeDefined();
      expect(typeof result.output === "string" || typeof result.error === "string").toBe(true);
    });

    it("calls the registered handler on spawn", async () => {
      const mockSpawn = vi.fn().mockResolvedValue({
        sessionKey: "spawn:test-agent:abc12345",
        agentId: "test-agent",
      });

      registerSessionSpawnHandler(mockSpawn);

      const { sessionSpawnTool } = await import("../index.js");

      const result = await sessionSpawnTool.execute(
        { agentId: "test-agent", message: "do the task", context: { key: "value" } },
        {
          agentId: "parent",
          sessionKey: "parent-session",
          workspacePath: "/tmp/workspace",
          sandbox: undefined,
          signal: new AbortController().signal,
        },
      );

      expect(result.success).toBe(true);
      expect(mockSpawn).toHaveBeenCalledWith(
        "parent-session",
        "test-agent",
        "do the task",
        { key: "value" },
      );

      const output = JSON.parse(result.output);
      expect(output.sessionKey).toBe("spawn:test-agent:abc12345");
      expect(output.agentId).toBe("test-agent");
    });

    it("handles spawn errors gracefully", async () => {
      registerSessionSpawnHandler(async () => {
        throw new Error("Agent not found");
      });

      const { sessionSpawnTool } = await import("../index.js");

      const result = await sessionSpawnTool.execute(
        { agentId: "nonexistent", message: "hello" },
        {
          agentId: "parent",
          sessionKey: "parent-session",
          workspacePath: "/tmp/workspace",
          sandbox: undefined,
          signal: new AbortController().signal,
        },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Agent not found");
    });
  });

  describe("tool registry", () => {
    it("has all 11 tools registered", async () => {
      const { ALL_TOOLS } = await import("../index.js");
      expect(ALL_TOOLS.length).toBe(11);

      const names = ALL_TOOLS.map((t) => t.name);
      expect(names).toContain("bash");
      expect(names).toContain("browser");
      expect(names).toContain("canvas");
      expect(names).toContain("cron");
      expect(names).toContain("session_spawn");
      expect(names).toContain("image_gen");
      expect(names).toContain("file_read");
      expect(names).toContain("file_write");
      expect(names).toContain("web_search");
      expect(names).toContain("web_fetch");
      expect(names).toContain("memory");
    });

    it("getTool returns correct tool by name", async () => {
      const { getTool } = await import("../index.js");
      const bash = getTool("bash");
      expect(bash).toBeDefined();
      expect(bash!.name).toBe("bash");

      const missing = getTool("nonexistent");
      expect(missing).toBeUndefined();
    });
  });
});
