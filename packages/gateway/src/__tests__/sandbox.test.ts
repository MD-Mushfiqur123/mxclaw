import { describe, it, expect } from "vitest";
import { sanitizeEnvVars, sanitizeExplicitSandboxEnvVars } from "../sandbox/sanitize-env-vars.js";

describe("Sandbox Env Vars Sanitizer", () => {
  describe("sanitizeEnvVars", () => {
    it("blocks API keys and secrets", () => {
      const input = {
        OPENAI_API_KEY: "sk-12345",
        ANTHROPIC_API_KEY: "sk-ant-12345",
        DISCORD_BOT_TOKEN: "MTEyMzQ1.xyz",
        MY_APP_SECRET: "secret123",
        SAFE_VAR: "hello",
      };

      const result = sanitizeEnvVars(input);

      expect(result.blocked).toContain("OPENAI_API_KEY");
      expect(result.blocked).toContain("ANTHROPIC_API_KEY");
      expect(result.blocked).toContain("DISCORD_BOT_TOKEN");
      expect(result.blocked).toContain("MY_APP_SECRET");
      
      expect(result.allowed).toHaveProperty("SAFE_VAR", "hello");
      expect(result.allowed).not.toHaveProperty("OPENAI_API_KEY");
    });

    it("allows standard safe environment variables", () => {
      const input = {
        LANG: "en_US.UTF-8",
        PATH: "/usr/bin",
        HOME: "/home/user",
        USER: "user",
        TZ: "UTC",
        NODE_ENV: "production",
      };

      const result = sanitizeEnvVars(input);

      expect(result.blocked).toHaveLength(0);
      expect(result.allowed).toEqual(input);
    });

    it("blocks null bytes and overlong values", () => {
      const input = {
        VAR_NULL: "hello\0world",
        VAR_LONG: "a".repeat(40000),
      };

      const result = sanitizeEnvVars(input);

      expect(result.blocked).toContain("VAR_NULL");
      expect(result.allowed).not.toHaveProperty("VAR_LONG");
      expect(result.warnings.some(w => w.includes("exceeds maximum length"))).toBe(true);
    });

    it("enforces strict mode", () => {
      const input = {
        LANG: "en_US.UTF-8",
        UNKNOWN_SAFE_LOOKING_VAR: "hello",
      };

      const result = sanitizeEnvVars(input, { strictMode: true });

      expect(result.allowed).toHaveProperty("LANG", "en_US.UTF-8");
      expect(result.blocked).toContain("UNKNOWN_SAFE_LOOKING_VAR");
    });
  });

  describe("sanitizeExplicitSandboxEnvVars", () => {
    it("allows user-specified vars but validates them", () => {
      const input = {
        MY_CUSTOM_API_URL: "https://api.example.com",
        NULL_VAR: "bad\0string",
        B64_SECRET_LOOKING: "YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjEyMzQ1Njc4OTA=",
      };

      const result = sanitizeExplicitSandboxEnvVars(input);

      expect(result.allowed).toHaveProperty("MY_CUSTOM_API_URL", "https://api.example.com");
      expect(result.blocked).toContain("NULL_VAR");
      
      // Should generate a warning for base64 looking data but might still allow it if it's explicit config
      expect(result.warnings.some(w => w.includes("base64-encoded credential data"))).toBe(true);
    });
  });
});
