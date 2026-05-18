/**
 * Slash command parser and handler for MxClaw.
 *
 * Adapted from OpenClaw (MIT License) — openclaw/openclaw
 * src/auto-reply/commands-registry.shared.ts  (command list)
 * src/auto-reply/thinking.shared.ts            (think levels)
 *
 * Supported commands (channel-universal subset):
 *   /new             — Start a new session
 *   /reset           — Reset the current session (alias for /new)
 *   /status          — Show gateway/session status
 *   /compact [instr] — Compact session context
 *   /think <level>   — Set thinking level (off/low/medium/high/max)
 *   /verbose on|off  — Toggle verbose mode
 *   /usage off|tokens|full — Set usage display mode
 *   /whoami          — Show sender ID
 *   /help            — List available commands
 *   /stop            — Acknowledge stop (no active run to stop)
 */

export type ThinkLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
export type VerboseLevel = "off" | "on" | "full";
export type UsageDisplayLevel = "off" | "tokens" | "full";

export interface ParsedSlashCommand {
  /** Canonical command name e.g. "new", "reset", "think" */
  command: string;
  /** Remaining tokens after command name */
  args: string[];
  /** Original raw message text */
  raw: string;
}

// ── Parser ────────────────────────────────────────────────────────────

const COMMAND_ALIASES: Record<string, string> = {
  "/new": "new",
  "/reset": "reset",
  "/status": "status",
  "/compact": "compact",
  "/think": "think",
  "/verbose": "verbose",
  "/usage": "usage",
  "/whoami": "whoami",
  "/help": "help",
  "/commands": "help",
  "/stop": "stop",
  "/restart": "restart",
  "/tools": "tools",
};

/**
 * Parse a message text into a slash command, or return null if not a command.
 */
export function parseSlashCommand(text: string): ParsedSlashCommand | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) return null;

  const parts = trimmed.split(/\s+/);
  const trigger = parts[0]?.toLowerCase() ?? "";
  const command = COMMAND_ALIASES[trigger];

  if (!command) return null;

  return {
    command,
    args: parts.slice(1),
    raw: trimmed,
  };
}

// ── Thinking level normalizer (from OpenClaw thinking.shared.ts) ──────

export function normalizeThinkLevel(raw?: string | null): ThinkLevel | undefined {
  if (!raw) return undefined;
  const key = raw.toLowerCase().trim().replace(/[\s_-]+/g, "");

  if (key === "off" || key === "none") return "off";
  if (key === "min" || key === "minimal") return "minimal";
  if (key === "low" || key === "on" || key === "enable" || key === "enabled") return "low";
  if (key === "mid" || key === "med" || key === "medium") return "medium";
  if (key === "high" || key === "ultra" || key === "ultrathink") return "high";
  if (key === "xhigh" || key === "extrahigh") return "xhigh";
  if (key === "max") return "max";

  return undefined;
}

export function normalizeVerboseLevel(raw?: string | null): VerboseLevel | undefined {
  if (!raw) return undefined;
  const key = raw.toLowerCase().trim();
  if (["off", "false", "no", "0"].includes(key)) return "off";
  if (["full", "all"].includes(key)) return "full";
  if (["on", "true", "yes", "1"].includes(key)) return "on";
  return undefined;
}

export function normalizeUsageDisplay(raw?: string | null): UsageDisplayLevel | undefined {
  if (!raw) return undefined;
  const key = raw.toLowerCase().trim();
  if (["off", "false", "no", "0"].includes(key)) return "off";
  if (["tokens", "token", "minimal"].includes(key)) return "tokens";
  if (["full", "session"].includes(key)) return "full";
  if (["on", "true"].includes(key)) return "tokens";
  return undefined;
}

// ── Session-level overrides (per active session) ──────────────────────

export interface SessionDirectives {
  thinkLevel?: ThinkLevel;
  verboseLevel?: VerboseLevel;
  usageDisplay?: UsageDisplayLevel;
}

/** In-memory store of per-session directive overrides */
const sessionDirectives = new Map<string, SessionDirectives>();

export function getSessionDirectives(sessionKey: string): SessionDirectives {
  return sessionDirectives.get(sessionKey) ?? {};
}

export function setSessionDirective<K extends keyof SessionDirectives>(
  sessionKey: string,
  key: K,
  value: SessionDirectives[K],
): void {
  const existing = sessionDirectives.get(sessionKey) ?? {};
  sessionDirectives.set(sessionKey, { ...existing, [key]: value });
}

export function clearSessionDirectives(sessionKey: string): void {
  sessionDirectives.delete(sessionKey);
}

// ── Help text ─────────────────────────────────────────────────────────

export function buildHelpMessage(): string {
  return [
    "**MxClaw Commands**",
    "",
    "/new — Start a new session",
    "/reset — Reset current session (same as /new)",
    "/status — Show gateway and session status",
    "/compact [instructions] — Compact session context now",
    "/think <level> — Set thinking level (off/low/medium/high/max)",
    "/verbose on|off|full — Toggle verbose mode",
    "/usage off|tokens|full — Set usage display",
    "/whoami — Show your sender ID",
    "/tools — List available tools",
    "/stop — Acknowledge (no active run to stop)",
    "/help — Show this message",
  ].join("\n");
}
