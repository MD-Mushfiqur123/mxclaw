import { MxClawConfigSchema, type MxClawConfig } from "./types.js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const CONFIG_DIR = path.join(os.homedir(), ".mxclaw");
const CONFIG_PATH = path.join(CONFIG_DIR, "mxclaw.json");
const SNAPSHOT_PATH = path.join(CONFIG_DIR, "mxclaw.snapshot.json");

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}

export function getWorkspacePath(config?: MxClawConfig): string {
  const raw = config?.storage?.workspacePath ?? "~/.mxclaw/workspace";
  return raw.replace(/^~/, os.homedir());
}

export function getLanceDbPath(config?: MxClawConfig): string {
  const raw = config?.storage?.lanceDbPath ?? "~/.mxclaw/lancedb";
  return raw.replace(/^~/, os.homedir());
}

export function getSqlitePath(config?: MxClawConfig): string {
  const raw = config?.storage?.sqlitePath ?? "~/.mxclaw/mxclaw.db";
  return raw.replace(/^~/, os.homedir());
}

export function loadConfig(configPath?: string): MxClawConfig {
  const targetPath = configPath ?? CONFIG_PATH;

  if (!fs.existsSync(targetPath)) {
    const defaultConfig = MxClawConfigSchema.parse({ version: 1 });
    ensureConfigDir();
    fs.writeFileSync(targetPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return defaultConfig;
  }

  try {
    const raw = fs.readFileSync(targetPath, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = MxClawConfigSchema.parse(parsed);
    saveSnapshot(validated);
    return validated;
  } catch (err) {
    console.error("[config] Failed to load config, trying snapshot fallback:", err);
    return loadSnapshot();
  }
}

export function saveConfig(config: MxClawConfig, configPath?: string): void {
  const targetPath = configPath ?? CONFIG_PATH;
  ensureConfigDir();
  const validated = MxClawConfigSchema.parse(config);
  fs.writeFileSync(targetPath, JSON.stringify(validated, null, 2), "utf-8");
  saveSnapshot(validated);
}

export function loadSnapshot(): MxClawConfig {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error("No config snapshot available; cannot recover config");
  }
  const raw = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return MxClawConfigSchema.parse(parsed);
}

function saveSnapshot(config: MxClawConfig): void {
  ensureConfigDir();
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function watchConfig(
  onConfigChange: (config: MxClawConfig) => void,
  configPath?: string,
): () => void {
  const targetPath = configPath ?? CONFIG_PATH;
  ensureConfigDir();

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = fs.watch(targetPath, (eventType) => {
    if (eventType === "change") {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          const newConfig = loadConfig(targetPath);
          onConfigChange(newConfig);
        } catch (err) {
          console.error("[config] Hot-reload failed:", err);
        }
      }, 500);
    }
  });

  watcher.on("error", (err) => {
    console.error("[config] Watcher error:", err);
  });

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    watcher.close();
  };
}

export function generateDefaultConfig(): MxClawConfig {
  return MxClawConfigSchema.parse({
    version: 1,
    gateway: { host: "127.0.0.1", port: 18700 },
    agents: {
      default: {
        id: "default",
        name: "Default Agent",
        description: "The default mxclaw agent",
        model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096 },
        fallbackChain: [
          { provider: "anthropic", model: "claude-sonnet-4-20250514", temperature: 0.7, maxTokens: 4096 },
          { provider: "groq", model: "llama-3.3-70b-versatile", temperature: 0.7, maxTokens: 4096 },
        ],
        tools: {
          bash: { enabled: true, approval: "always-require-approval" },
          fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
          fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] },
          canvas: { enabled: true, approval: "owner-only" },
          sessionSpawn: { enabled: true, approval: "owner-only" },
        },
        mentionGating: true,
        maxSessionTurns: 100,
        compactionThreshold: 50,
      },
    },
    defaultAgentId: "default",
    channels: {},
    bindings: [],
    devices: [],
    plugins: [],
  });
}