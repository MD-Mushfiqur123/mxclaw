#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// packages/core/dist/types.js
import { z } from "zod";
var MessageContentSchema, MessageEnvelopeSchema, ReplyEnvelopeSchema, ApprovalModeSchema, SandboxConfigSchema, ToolConfigSchema, ProviderRefSchema, AgentConfigSchema, ChannelConfigSchema, BindingConfigSchema, DeviceConfigSchema, VoiceConfigSchema, LoggingConfigSchema, StorageConfigSchema, GatewayConfigSchema, MxClawConfigSchema;
var init_types = __esm({
  "packages/core/dist/types.js"() {
    "use strict";
    MessageContentSchema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("text"), text: z.string() }),
      z.object({ type: z.literal("image"), url: z.string(), alt: z.string().optional() }),
      z.object({ type: z.literal("audio"), url: z.string(), transcript: z.string().optional() }),
      z.object({ type: z.literal("video"), url: z.string() }),
      z.object({ type: z.literal("file"), url: z.string(), name: z.string(), mimeType: z.string().optional() }),
      z.object({ type: z.literal("location"), lat: z.number(), lng: z.number(), label: z.string().optional() }),
      z.object({ type: z.literal("sticker"), id: z.string(), url: z.string().optional() }),
      z.object({ type: z.literal("reaction"), emoji: z.string(), messageId: z.string() }),
      z.object({ type: z.literal("canvas"), json: z.record(z.unknown()) })
    ]);
    MessageEnvelopeSchema = z.object({
      id: z.string(),
      channel: z.string(),
      channelType: z.string(),
      sender: z.object({
        id: z.string(),
        displayName: z.string(),
        avatarUrl: z.string().optional(),
        isBot: z.boolean().default(false)
      }),
      conversationId: z.string(),
      threadId: z.string().optional(),
      content: z.array(MessageContentSchema),
      mentions: z.array(z.string()).default([]),
      isGroupMessage: z.boolean().default(false),
      isMentioned: z.boolean().default(false),
      timestamp: z.number(),
      metadata: z.record(z.unknown()).default({})
    });
    ReplyEnvelopeSchema = z.object({
      channelMessageId: z.string().optional(),
      conversationId: z.string(),
      threadId: z.string().optional(),
      content: z.array(MessageContentSchema),
      isStreaming: z.boolean().default(false),
      streamDone: z.boolean().optional(),
      streamToken: z.string().optional(),
      metadata: z.record(z.unknown()).default({})
    });
    ApprovalModeSchema = z.enum([
      "always-require-approval",
      "owner-only",
      "yolo"
    ]);
    SandboxConfigSchema = z.object({
      enabled: z.boolean().default(false),
      type: z.enum(["docker", "ssh"]).default("docker"),
      image: z.string().optional(),
      host: z.string().optional(),
      port: z.number().optional(),
      username: z.string().optional()
    });
    ToolConfigSchema = z.object({
      bash: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      browser: z.object({ enabled: z.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      canvas: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("owner-only") }).default({}),
      cron: z.object({ enabled: z.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      sessionSpawn: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("owner-only") }).default({}),
      imageGen: z.object({ enabled: z.boolean().default(false), approval: ApprovalModeSchema.default("always-require-approval") }).default({}),
      fileRead: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("owner-only"), allowedPaths: z.array(z.string()).default(["~/.mxclaw/workspace"]) }).default({}),
      fileWrite: z.object({ enabled: z.boolean().default(true), approval: ApprovalModeSchema.default("always-require-approval"), allowedPaths: z.array(z.string()).default(["~/.mxclaw/workspace"]) }).default({})
    });
    ProviderRefSchema = z.object({
      provider: z.string(),
      model: z.string(),
      apiKey: z.string().optional(),
      baseUrl: z.string().optional(),
      preset: z.string().optional(),
      headers: z.record(z.string()).optional(),
      modelAliases: z.record(z.string()).optional(),
      temperature: z.number().min(0).max(2).default(0.7),
      maxTokens: z.number().positive().default(4096),
      systemPrompt: z.string().optional(),
      options: z.record(z.unknown()).default({})
    });
    AgentConfigSchema = z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      model: ProviderRefSchema,
      fallbackChain: z.array(ProviderRefSchema).default([]),
      tools: ToolConfigSchema.default({}),
      sandbox: SandboxConfigSchema.default({}),
      systemPrompt: z.string().optional(),
      mentionGating: z.boolean().default(true),
      maxSessionTurns: z.number().positive().default(100),
      compactionThreshold: z.number().positive().default(50),
      voice: z.object({
        provider: z.enum(["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]).default("system-tts"),
        voiceId: z.string().optional(),
        wakeWord: z.string().optional()
      }).default({})
    });
    ChannelConfigSchema = z.object({
      id: z.string(),
      type: z.string(),
      enabled: z.boolean().default(true),
      credentials: z.record(z.unknown()).default({}),
      options: z.record(z.unknown()).default({}),
      allowlist: z.array(z.string()).default([]),
      mentionGating: z.boolean().default(true),
      pairingEnabled: z.boolean().default(true)
    });
    BindingConfigSchema = z.object({
      channelId: z.string(),
      senderId: z.string().optional(),
      agentId: z.string(),
      conversationId: z.string().optional()
    });
    DeviceConfigSchema = z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["mobile", "desktop", "web"]),
      token: z.string().optional(),
      paired: z.boolean().default(false),
      lastSeen: z.number().optional()
    });
    VoiceConfigSchema = z.object({
      defaultProvider: z.enum(["openai-realtime", "gemini-live", "elevenlabs", "system-tts"]).default("system-tts"),
      openaiRealtime: z.object({ apiKey: z.string().optional(), model: z.string().default("gpt-4o-realtime-preview"), voice: z.string().default("alloy") }).default({}),
      geminiLive: z.object({ apiKey: z.string().optional(), model: z.string().default("gemini-2.0-flash-live-001"), voice: z.string().default("Puck") }).default({}),
      elevenlabs: z.object({ apiKey: z.string().optional(), voiceId: z.string().default("21m00Tcm4TlvDq8ikWAM") }).default({}),
      systemTts: z.object({ rate: z.number().default(1), pitch: z.number().default(1) }).default({})
    });
    LoggingConfigSchema = z.object({
      level: z.enum(["silent", "error", "warn", "info", "debug", "trace"]).default("info"),
      subsystems: z.record(z.enum(["silent", "error", "warn", "info", "debug", "trace"])).default({}),
      file: z.string().optional(),
      otel: z.object({
        enabled: z.boolean().default(false),
        endpoint: z.string().optional(),
        headers: z.record(z.string()).default({})
      }).default({})
    });
    StorageConfigSchema = z.object({
      type: z.enum(["jsonl", "sqlite"]).default("jsonl"),
      workspacePath: z.string().default("~/.mxclaw/workspace"),
      lanceDbPath: z.string().default("~/.mxclaw/lancedb"),
      sqlitePath: z.string().default("~/.mxclaw/mxclaw.db")
    });
    GatewayConfigSchema = z.object({
      host: z.string().default("127.0.0.1"),
      port: z.number().int().positive().default(18700),
      webhookPath: z.string().default("/gateway/webhook"),
      corsOrigins: z.array(z.string()).default(["http://localhost:5173"]),
      wsHeartbeatIntervalMs: z.number().positive().default(3e4),
      apiToken: z.string().optional()
    });
    MxClawConfigSchema = z.object({
      version: z.literal(1),
      gateway: GatewayConfigSchema.default({}),
      agents: z.record(AgentConfigSchema).default({}),
      defaultAgentId: z.string().optional(),
      ownerId: z.string().optional(),
      channels: z.record(ChannelConfigSchema).default({}),
      bindings: z.array(BindingConfigSchema).default([]),
      devices: z.array(DeviceConfigSchema).default([]),
      voice: VoiceConfigSchema.default({}),
      logging: LoggingConfigSchema.default({}),
      storage: StorageConfigSchema.default({}),
      plugins: z.array(z.string()).default([]),
      sandbox: SandboxConfigSchema.default({})
    });
  }
});

// packages/core/dist/config.js
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
function getConfigPath() {
  return CONFIG_PATH;
}
function getConfigDir() {
  return CONFIG_DIR;
}
function getWorkspacePath(config) {
  const raw = config?.storage?.workspacePath ?? "~/.mxclaw/workspace";
  return raw.replace(/^~/, os.homedir());
}
function getLanceDbPath(config) {
  const raw = config?.storage?.lanceDbPath ?? "~/.mxclaw/lancedb";
  return raw.replace(/^~/, os.homedir());
}
function getSqlitePath(config) {
  const raw = config?.storage?.sqlitePath ?? "~/.mxclaw/mxclaw.db";
  return raw.replace(/^~/, os.homedir());
}
function loadConfig(configPath) {
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
function saveConfig(config, configPath) {
  const targetPath = configPath ?? CONFIG_PATH;
  ensureConfigDir();
  const validated = MxClawConfigSchema.parse(config);
  fs.writeFileSync(targetPath, JSON.stringify(validated, null, 2), "utf-8");
  saveSnapshot(validated);
}
function loadSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error("No config snapshot available; cannot recover config");
  }
  const raw = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return MxClawConfigSchema.parse(parsed);
}
function saveSnapshot(config) {
  ensureConfigDir();
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(config, null, 2), "utf-8");
}
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}
function watchConfig(onConfigChange, configPath) {
  const targetPath = configPath ?? CONFIG_PATH;
  ensureConfigDir();
  let debounceTimer = null;
  const watcher = fs.watch(targetPath, (eventType) => {
    if (eventType === "change") {
      if (debounceTimer)
        clearTimeout(debounceTimer);
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
    if (debounceTimer)
      clearTimeout(debounceTimer);
    watcher.close();
  };
}
function generateDefaultConfig() {
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
          { provider: "groq", model: "llama-3.3-70b-versatile", temperature: 0.7, maxTokens: 4096 }
        ],
        tools: {
          bash: { enabled: true, approval: "always-require-approval" },
          fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
          fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] },
          canvas: { enabled: true, approval: "owner-only" },
          sessionSpawn: { enabled: true, approval: "owner-only" }
        },
        mentionGating: true,
        maxSessionTurns: 100,
        compactionThreshold: 50
      }
    },
    defaultAgentId: "default",
    channels: {},
    bindings: [],
    devices: [],
    plugins: []
  });
}
var CONFIG_DIR, CONFIG_PATH, SNAPSHOT_PATH;
var init_config = __esm({
  "packages/core/dist/config.js"() {
    "use strict";
    init_types();
    CONFIG_DIR = path.join(os.homedir(), ".mxclaw");
    CONFIG_PATH = path.join(CONFIG_DIR, "mxclaw.json");
    SNAPSHOT_PATH = path.join(CONFIG_DIR, "mxclaw.snapshot.json");
  }
});

// packages/core/dist/bootstrap.js
import * as fs2 from "node:fs";
import * as path2 from "node:path";
import * as os2 from "node:os";
function getBootstrapEnvPath() {
  return path2.join(BOOTSTRAP_DIR, "bootstrap.env");
}
function getBootstrapJsonPath() {
  return path2.join(BOOTSTRAP_DIR, "bootstrap.json");
}
function loadBootstrapEnv() {
  const envPath = getBootstrapEnvPath();
  if (!fs2.existsSync(envPath))
    return {};
  const entries = {};
  const raw = fs2.readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#"))
      continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1)
      continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    if (key)
      entries[key] = value;
  }
  return entries;
}
function loadBootstrapJson() {
  const jsonPath = getBootstrapJsonPath();
  if (!fs2.existsSync(jsonPath))
    return {};
  try {
    return JSON.parse(fs2.readFileSync(jsonPath, "utf-8"));
  } catch {
    return {};
  }
}
function loadBootstrap() {
  const env = loadBootstrapEnv();
  if (Object.keys(env).length > 0)
    return env;
  return loadBootstrapJson();
}
function saveBootstrap(entries) {
  if (!fs2.existsSync(BOOTSTRAP_DIR)) {
    fs2.mkdirSync(BOOTSTRAP_DIR, { recursive: true });
  }
  const envPath = getBootstrapEnvPath();
  const lines = [
    "# MxClaw Bootstrap \u2014 API keys and secrets",
    "# Generated by `mxclaw onboard`",
    "# You can also set these as environment variables directly.",
    ""
  ];
  for (const [key, value] of Object.entries(entries)) {
    if (value)
      lines.push(`${key}=${value}`);
  }
  lines.push("");
  fs2.writeFileSync(envPath, lines.join("\n"), "utf-8");
  const jsonPath = getBootstrapJsonPath();
  fs2.writeFileSync(jsonPath, JSON.stringify(entries, null, 2), "utf-8");
}
function resolveApiKey(providerRef) {
  if (providerRef.apiKey)
    return providerRef.apiKey;
  const envKey = providerRef.preset ? PROVIDER_ENV_KEYS[providerRef.preset] : void 0;
  if (envKey) {
    const bootstrap = loadBootstrap();
    if (bootstrap[envKey])
      return bootstrap[envKey];
    if (process.env[envKey])
      return process.env[envKey];
  }
  return void 0;
}
function getBootstrapSummary() {
  const files = [];
  const envPath = getBootstrapEnvPath();
  const jsonPath = getBootstrapJsonPath();
  if (fs2.existsSync(envPath))
    files.push(envPath);
  if (fs2.existsSync(jsonPath))
    files.push(jsonPath);
  const entries = loadBootstrap();
  return { keyCount: Object.keys(entries).length, files };
}
var BOOTSTRAP_DIR, PROVIDER_ENV_KEYS;
var init_bootstrap = __esm({
  "packages/core/dist/bootstrap.js"() {
    "use strict";
    BOOTSTRAP_DIR = path2.join(os2.homedir(), ".mxclaw");
    PROVIDER_ENV_KEYS = {
      openai: "OPENAI_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      groq: "GROQ_API_KEY",
      deepseek: "DEEPSEEK_API_KEY",
      together: "TOGETHER_API_KEY",
      fireworks: "FIREWORKS_API_KEY",
      xai: "XAI_API_KEY",
      perplexity: "PERPLEXITY_API_KEY",
      mistral: "MISTRAL_API_KEY",
      gemini: "GEMINI_API_KEY",
      openrouter: "OPENROUTER_API_KEY",
      azure: "AZURE_API_KEY",
      cloudflare: "CLOUDFLARE_API_KEY",
      cohere: "COHERE_API_KEY",
      huggingface: "HUGGINGFACE_API_KEY",
      replicate: "REPLICATE_API_KEY"
    };
  }
});

// packages/core/dist/index.js
var dist_exports = {};
__export(dist_exports, {
  AgentConfigSchema: () => AgentConfigSchema,
  ApprovalModeSchema: () => ApprovalModeSchema,
  BindingConfigSchema: () => BindingConfigSchema,
  ChannelConfigSchema: () => ChannelConfigSchema,
  DeviceConfigSchema: () => DeviceConfigSchema,
  GatewayConfigSchema: () => GatewayConfigSchema,
  LoggingConfigSchema: () => LoggingConfigSchema,
  MessageContentSchema: () => MessageContentSchema,
  MessageEnvelopeSchema: () => MessageEnvelopeSchema,
  MxClawConfigSchema: () => MxClawConfigSchema,
  PROVIDER_ENV_KEYS: () => PROVIDER_ENV_KEYS,
  ProviderRefSchema: () => ProviderRefSchema,
  ReplyEnvelopeSchema: () => ReplyEnvelopeSchema,
  SandboxConfigSchema: () => SandboxConfigSchema,
  StorageConfigSchema: () => StorageConfigSchema,
  ToolConfigSchema: () => ToolConfigSchema,
  VoiceConfigSchema: () => VoiceConfigSchema,
  generateDefaultConfig: () => generateDefaultConfig,
  getBootstrapEnvPath: () => getBootstrapEnvPath,
  getBootstrapJsonPath: () => getBootstrapJsonPath,
  getBootstrapSummary: () => getBootstrapSummary,
  getConfigDir: () => getConfigDir,
  getConfigPath: () => getConfigPath,
  getLanceDbPath: () => getLanceDbPath,
  getSqlitePath: () => getSqlitePath,
  getWorkspacePath: () => getWorkspacePath,
  loadBootstrap: () => loadBootstrap,
  loadBootstrapEnv: () => loadBootstrapEnv,
  loadBootstrapJson: () => loadBootstrapJson,
  loadConfig: () => loadConfig,
  loadSnapshot: () => loadSnapshot,
  resolveApiKey: () => resolveApiKey,
  saveBootstrap: () => saveBootstrap,
  saveConfig: () => saveConfig,
  watchConfig: () => watchConfig
});
var init_dist = __esm({
  "packages/core/dist/index.js"() {
    "use strict";
    init_types();
    init_config();
    init_bootstrap();
  }
});

// packages/plugin-system/dist/index.js
import * as fs3 from "node:fs";
import * as path3 from "node:path";
import { createRequire } from "node:module";
function createPluginRegistry() {
  return {
    channels: /* @__PURE__ */ new Map(),
    providers: /* @__PURE__ */ new Map(),
    voices: /* @__PURE__ */ new Map(),
    pluginErrors: []
  };
}
async function loadPlugins(config, registry) {
  const pluginNames = config.plugins ?? [];
  const builtinPlugins = scanBuiltinPlugins();
  const npmPlugins = scanNpmPlugins();
  const allPlugins = [.../* @__PURE__ */ new Set([...builtinPlugins, ...npmPlugins, ...pluginNames])];
  for (const pluginName of allPlugins) {
    try {
      await activatePlugin(pluginName, config, registry);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      registry.pluginErrors.push({ plugin: pluginName, error: errorMsg });
      console.error(`[plugin-system] Failed to load plugin "${pluginName}":`, errorMsg);
    }
  }
}
function scanBuiltinPlugins() {
  const plugins = [];
  const packagesDir = path3.resolve(import.meta.dirname ?? ".", "../../..");
  if (!fs3.existsSync(packagesDir))
    return plugins;
  const entries = fs3.readdirSync(packagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory())
      continue;
    const manifestPath = path3.join(packagesDir, entry.name, "manifest.json");
    if (fs3.existsSync(manifestPath)) {
      plugins.push(entry.name);
    }
  }
  return plugins;
}
function scanNpmPlugins() {
  const plugins = [];
  const prefixes = ["mxclaw-channel-", "mxclaw-provider-", "mxclaw-voice-"];
  for (const prefix of prefixes) {
    try {
      const nodeModulesPath = path3.resolve(import.meta.dirname ?? ".", "../../../node_modules");
      if (!fs3.existsSync(nodeModulesPath))
        continue;
      const scopedPath = path3.join(nodeModulesPath, "@mxclaw");
      if (fs3.existsSync(scopedPath)) {
        const scoped = fs3.readdirSync(scopedPath, { withFileTypes: true });
        for (const entry of scoped) {
          if (entry.isDirectory()) {
            const manifestPath = path3.join(scopedPath, entry.name, "manifest.json");
            if (fs3.existsSync(manifestPath)) {
              plugins.push(`@mxclaw/${entry.name}`);
            }
          }
        }
      }
      const entries = fs3.readdirSync(nodeModulesPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith(prefix)) {
          const manifestPath = path3.join(nodeModulesPath, entry.name, "manifest.json");
          if (fs3.existsSync(manifestPath)) {
            plugins.push(entry.name);
          }
        }
      }
    } catch {
    }
  }
  return plugins;
}
async function activatePlugin(pluginName, config, registry) {
  let manifest;
  let modulePath;
  try {
    const localPath = path3.resolve(import.meta.dirname ?? ".", "../../..", pluginName.startsWith("@") ? pluginName.split("/")[1] ?? pluginName : pluginName);
    const localManifest = path3.join(localPath, "manifest.json");
    if (fs3.existsSync(localManifest)) {
      manifest = JSON.parse(fs3.readFileSync(localManifest, "utf-8"));
      modulePath = path3.join(localPath, manifest.main);
    } else {
      const pkgPath = require2.resolve(`${pluginName}/manifest.json`);
      manifest = JSON.parse(fs3.readFileSync(pkgPath, "utf-8"));
      modulePath = require2.resolve(`${pluginName}/${manifest.main}`);
    }
  } catch {
    throw new Error(`Cannot resolve plugin "${pluginName}": manifest.json not found`);
  }
  const channelConfigs = Object.values(config.channels ?? {});
  const hasChannelOfType = channelConfigs.some((c) => c.type === pluginName);
  if (manifest.type === "channel" && !hasChannelOfType) {
    return;
  }
  const mod = await import(modulePath);
  const plugin = mod.default ?? mod;
  switch (manifest.type) {
    case "channel":
      registry.channels.set(manifest.name, plugin);
      break;
    case "provider":
      registry.providers.set(manifest.name, plugin);
      break;
    case "voice":
      registry.voices.set(manifest.name, plugin);
      break;
  }
  console.log(`[plugin-system] Activated ${manifest.type} plugin: ${manifest.name} v${manifest.version}`);
}
function getChannelPlugin(registry, channelType) {
  return registry.channels.get(channelType);
}
function getProviderPlugin(registry, providerName) {
  return registry.providers.get(providerName);
}
var require2;
var init_dist2 = __esm({
  "packages/plugin-system/dist/index.js"() {
    "use strict";
    require2 = createRequire(import.meta.url);
  }
});

// packages/gateway/dist/rate-limiter.js
var RateLimiter, IPRateLimiter;
var init_rate_limiter = __esm({
  "packages/gateway/dist/rate-limiter.js"() {
    "use strict";
    RateLimiter = class {
      store = /* @__PURE__ */ new Map();
      config;
      cleanupInterval;
      constructor(config) {
        this.config = {
          windowMs: config?.windowMs ?? 6e4,
          maxRequests: config?.maxRequests ?? 60
        };
        this.cleanupInterval = setInterval(() => this.cleanup(), 6e4);
      }
      check(key) {
        const now = Date.now();
        let entry = this.store.get(key);
        if (!entry || now > entry.resetAt) {
          entry = { count: 0, resetAt: now + this.config.windowMs };
          this.store.set(key, entry);
        }
        entry.count++;
        const remaining = Math.max(0, this.config.maxRequests - entry.count);
        const allowed = entry.count <= this.config.maxRequests;
        return { allowed, remaining, resetAt: entry.resetAt };
      }
      isRateLimited(key) {
        return !this.check(key).allowed;
      }
      getRemaining(key) {
        return this.check(key).remaining;
      }
      reset(key) {
        this.store.delete(key);
      }
      cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
          if (now > entry.resetAt) {
            this.store.delete(key);
          }
        }
      }
      shutdown() {
        clearInterval(this.cleanupInterval);
        this.store.clear();
      }
    };
    IPRateLimiter = class {
      limiter = new RateLimiter({ windowMs: 6e4, maxRequests: 100 });
      check(ip) {
        const result = this.limiter.check(ip);
        return { allowed: result.allowed, remaining: result.remaining };
      }
      shutdown() {
        this.limiter.shutdown();
      }
    };
  }
});

// packages/storage/dist/memory.js
import * as fs4 from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path4 from "node:path";
import * as crypto from "node:crypto";
var init_memory = __esm({
  "packages/storage/dist/memory.js"() {
    "use strict";
    init_dist();
  }
});

// packages/storage/dist/sqlite-adapter.js
import * as path5 from "node:path";
import * as fs5 from "node:fs";
function cosineDistance(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) * (a[i] ?? 0);
    normB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  if (normA === 0 || normB === 0)
    return 1;
  return 1 - dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
var SqliteStorageAdapter;
var init_sqlite_adapter = __esm({
  "packages/storage/dist/sqlite-adapter.js"() {
    "use strict";
    init_dist();
    SqliteStorageAdapter = class {
      db;
      dbPath;
      constructor(config) {
        this.dbPath = getSqlitePath(config);
        fs5.mkdirSync(path5.dirname(this.dbPath), { recursive: true });
      }
      async initialize() {
        const Database = (await import("better-sqlite3")).default;
        this.db = new Database(this.dbPath);
        this.db.pragma("journal_mode = WAL");
        this.db.pragma("foreign_keys = ON");
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        agent_id TEXT NOT NULL,
        session_key TEXT NOT NULL,
        turn_index INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT,
        tool_results TEXT,
        timestamp INTEGER NOT NULL,
        token_count INTEGER,
        PRIMARY KEY (agent_id, session_key, turn_index)
      );

      CREATE TABLE IF NOT EXISTS session_manifests (
        agent_id TEXT NOT NULL,
        session_key TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        conversation_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_active_at INTEGER NOT NULL,
        turn_count INTEGER NOT NULL DEFAULT 0,
        compaction_points TEXT NOT NULL DEFAULT '[]',
        PRIMARY KEY (agent_id, session_key)
      );

      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        vector BLOB NOT NULL,
        metadata TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memory (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        embedding BLOB,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        access_count INTEGER NOT NULL DEFAULT 0,
        last_accessed_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id, session_key);
      CREATE INDEX IF NOT EXISTS idx_manifests_agent ON session_manifests(agent_id);
      CREATE INDEX IF NOT EXISTS idx_manifests_active ON session_manifests(last_active_at DESC);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory(type);
      CREATE INDEX IF NOT EXISTS idx_memory_updated ON memory(updated_at DESC);
    `);
      }
      async getSessionTranscript(agentId, sessionKey) {
        const rows = this.db.prepare("SELECT role, content, tool_calls, tool_results, timestamp, token_count FROM sessions WHERE agent_id = ? AND session_key = ? ORDER BY turn_index ASC").all(agentId, sessionKey);
        return rows.map((row) => ({
          role: row.role,
          content: row.content,
          toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : void 0,
          toolResults: row.tool_results ? JSON.parse(row.tool_results) : void 0,
          timestamp: row.timestamp,
          tokenCount: row.token_count ?? void 0
        }));
      }
      async appendTurn(agentId, sessionKey, turn) {
        const maxIndex = this.db.prepare("SELECT COALESCE(MAX(turn_index), -1) as max_idx FROM sessions WHERE agent_id = ? AND session_key = ?").get(agentId, sessionKey);
        this.db.prepare("INSERT INTO sessions (agent_id, session_key, turn_index, role, content, tool_calls, tool_results, timestamp, token_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(agentId, sessionKey, maxIndex.max_idx + 1, turn.role, turn.content, turn.toolCalls ? JSON.stringify(turn.toolCalls) : null, turn.toolResults ? JSON.stringify(turn.toolResults) : null, turn.timestamp, turn.tokenCount ?? null);
        this.db.prepare("UPDATE session_manifests SET last_active_at = ?, turn_count = turn_count + 1 WHERE agent_id = ? AND session_key = ?").run(Date.now(), agentId, sessionKey);
      }
      async getSessionManifest(agentId, sessionKey) {
        const row = this.db.prepare("SELECT * FROM session_manifests WHERE agent_id = ? AND session_key = ?").get(agentId, sessionKey);
        if (!row)
          return null;
        return {
          agentId: row.agent_id,
          sessionKey: row.session_key,
          channelId: row.channel_id,
          senderId: row.sender_id,
          conversationId: row.conversation_id,
          createdAt: row.created_at,
          lastActiveAt: row.last_active_at,
          turnCount: row.turn_count,
          compactionPoints: JSON.parse(row.compaction_points)
        };
      }
      async upsertSessionManifest(manifest) {
        this.db.prepare(`
      INSERT INTO session_manifests (agent_id, session_key, channel_id, sender_id, conversation_id, created_at, last_active_at, turn_count, compaction_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(agent_id, session_key) DO UPDATE SET
        last_active_at = excluded.last_active_at,
        turn_count = excluded.turn_count,
        compaction_points = excluded.compaction_points
    `).run(manifest.agentId, manifest.sessionKey, manifest.channelId, manifest.senderId, manifest.conversationId, manifest.createdAt, manifest.lastActiveAt, manifest.turnCount, JSON.stringify(manifest.compactionPoints));
      }
      async listSessions(agentId) {
        const rows = this.db.prepare("SELECT * FROM session_manifests WHERE agent_id = ? ORDER BY last_active_at DESC").all(agentId);
        return rows.map((row) => ({
          agentId: row.agent_id,
          sessionKey: row.session_key,
          channelId: row.channel_id,
          senderId: row.sender_id,
          conversationId: row.conversation_id,
          createdAt: row.created_at,
          lastActiveAt: row.last_active_at,
          turnCount: row.turn_count,
          compactionPoints: JSON.parse(row.compaction_points)
        }));
      }
      async deleteSession(agentId, sessionKey) {
        this.db.prepare("DELETE FROM sessions WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
        this.db.prepare("DELETE FROM session_manifests WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
      }
      async storeEmbedding(id, vector, metadata) {
        const buf = Buffer.from(new Float32Array(vector).buffer);
        this.db.prepare("INSERT OR REPLACE INTO embeddings (id, vector, metadata) VALUES (?, ?, ?)").run(id, buf, JSON.stringify(metadata));
      }
      async searchEmbeddings(queryVector, limit = 10) {
        const rows = this.db.prepare("SELECT id, vector, metadata FROM embeddings").all();
        const query = new Float32Array(queryVector);
        const results = rows.map((row) => {
          const stored = new Float32Array(row.vector.buffer, row.vector.byteOffset, row.vector.byteLength / 4);
          return {
            id: row.id,
            metadata: JSON.parse(row.metadata),
            distance: cosineDistance(query, stored)
          };
        });
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, limit);
      }
      async rewriteSession(agentId, sessionKey, turns) {
        const tx = this.db.transaction(() => {
          this.db.prepare("DELETE FROM sessions WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
          for (let i = 0; i < turns.length; i++) {
            const t = turns[i];
            this.db.prepare("INSERT INTO sessions (agent_id, session_key, turn_index, role, content, tool_calls, tool_results, timestamp, token_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(agentId, sessionKey, i, t.role, t.content, t.toolCalls ? JSON.stringify(t.toolCalls) : null, t.toolResults ? JSON.stringify(t.toolResults) : null, t.timestamp, t.tokenCount ?? null);
          }
        });
        tx();
      }
      async close() {
        this.db.close();
      }
    };
  }
});

// packages/storage/dist/index.js
import * as fs6 from "node:fs/promises";
import * as fsSync2 from "node:fs";
import * as path6 from "node:path";
import * as crypto2 from "node:crypto";
function cosineDistance2(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
    normA += (a[i] ?? 0) * (a[i] ?? 0);
    normB += (b[i] ?? 0) * (b[i] ?? 0);
  }
  if (normA === 0 || normB === 0)
    return 1;
  return 1 - dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function deriveSessionKey(channelId, senderId, agentId) {
  const hash = crypto2.createHash("sha256");
  hash.update(`${channelId}:${senderId}:${agentId}`);
  return hash.digest("hex").slice(0, 16);
}
var JsonlStorageAdapter;
var init_dist3 = __esm({
  "packages/storage/dist/index.js"() {
    "use strict";
    init_dist();
    init_memory();
    init_sqlite_adapter();
    JsonlStorageAdapter = class {
      workspacePath;
      manifestsPath;
      embeddingsPath;
      pairingPath;
      devicesPath;
      queuePath;
      constructor(config) {
        this.workspacePath = getWorkspacePath(config);
        this.manifestsPath = path6.join(this.workspacePath, "manifests");
        this.embeddingsPath = path6.join(this.workspacePath, "embeddings");
        this.pairingPath = path6.join(this.workspacePath, "pairing.json");
        this.devicesPath = path6.join(this.workspacePath, "devices.json");
        this.queuePath = path6.join(this.workspacePath, "queue.json");
      }
      async initialize() {
        await fs6.mkdir(this.workspacePath, { recursive: true });
        await fs6.mkdir(this.manifestsPath, { recursive: true });
        await fs6.mkdir(this.embeddingsPath, { recursive: true });
        for (const p of [this.pairingPath, this.devicesPath, this.queuePath]) {
          try {
            await fs6.access(p);
          } catch {
            await fs6.writeFile(p, "[]", "utf-8");
          }
        }
      }
      getSessionPath(agentId, sessionKey) {
        const dir = path6.join(this.workspacePath, agentId, "sessions");
        fsSync2.mkdirSync(dir, { recursive: true });
        return path6.join(dir, `${sessionKey}.jsonl`);
      }
      async ensureSessionDir(agentId) {
        const dir = path6.join(this.workspacePath, agentId, "sessions");
        await fs6.mkdir(dir, { recursive: true });
        return dir;
      }
      async ensureManifestDir(agentId) {
        const dir = path6.join(this.manifestsPath, agentId);
        await fs6.mkdir(dir, { recursive: true });
        return dir;
      }
      getManifestPath(agentId, sessionKey) {
        fsSync2.mkdirSync(path6.join(this.manifestsPath, agentId), { recursive: true });
        return path6.join(this.manifestsPath, agentId, `${sessionKey}.json`);
      }
      async getSessionTranscript(agentId, sessionKey) {
        await this.ensureSessionDir(agentId);
        const filePath = path6.join(this.workspacePath, agentId, "sessions", `${sessionKey}.jsonl`);
        try {
          const content = await fs6.readFile(filePath, "utf-8");
          const lines = content.trim().split("\n").filter(Boolean);
          return lines.map((line) => JSON.parse(line));
        } catch {
          return [];
        }
      }
      async appendTurn(agentId, sessionKey, turn) {
        await this.ensureSessionDir(agentId);
        const filePath = path6.join(this.workspacePath, agentId, "sessions", `${sessionKey}.jsonl`);
        const line = JSON.stringify(turn) + "\n";
        await fs6.appendFile(filePath, line, "utf-8");
        await this.ensureManifestDir(agentId);
        const manifestPath = path6.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
          const raw = await fs6.readFile(manifestPath, "utf-8");
          const manifest = JSON.parse(raw);
          manifest.lastActiveAt = Date.now();
          manifest.turnCount += 1;
          await fs6.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
        } catch {
        }
      }
      async getSessionManifest(agentId, sessionKey) {
        await this.ensureManifestDir(agentId);
        const manifestPath = path6.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
          const raw = await fs6.readFile(manifestPath, "utf-8");
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      async upsertSessionManifest(manifest) {
        await this.ensureManifestDir(manifest.agentId);
        const manifestPath = path6.join(this.manifestsPath, manifest.agentId, `${manifest.sessionKey}.json`);
        await fs6.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
      }
      async listSessions(agentId) {
        const dir = path6.join(this.manifestsPath, agentId);
        try {
          await fs6.access(dir);
        } catch {
          return [];
        }
        const files = (await fs6.readdir(dir)).filter((f) => f.endsWith(".json"));
        const manifests = [];
        for (const f of files) {
          try {
            const raw = await fs6.readFile(path6.join(dir, f), "utf-8");
            manifests.push(JSON.parse(raw));
          } catch {
          }
        }
        return manifests.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
      }
      async deleteSession(agentId, sessionKey) {
        const sessionDir = path6.join(this.workspacePath, agentId, "sessions");
        const filePath = path6.join(sessionDir, `${sessionKey}.jsonl`);
        try {
          await fs6.unlink(filePath);
        } catch {
        }
        const manifestPath = path6.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
          await fs6.unlink(manifestPath);
        } catch {
        }
      }
      async storeEmbedding(id, vector, metadata) {
        const embPath = path6.join(this.embeddingsPath, `${id}.json`);
        await fs6.writeFile(embPath, JSON.stringify({ id, vector, metadata }), "utf-8");
      }
      async searchEmbeddings(vector, limit = 10) {
        try {
          await fs6.access(this.embeddingsPath);
        } catch {
          return [];
        }
        const files = (await fs6.readdir(this.embeddingsPath)).filter((f) => f.endsWith(".json"));
        const queryVec = new Float32Array(vector);
        const results = [];
        for (const file of files) {
          try {
            const raw = await fs6.readFile(path6.join(this.embeddingsPath, file), "utf-8");
            const data = JSON.parse(raw);
            const storedVec = new Float32Array(data.vector);
            const distance = cosineDistance2(queryVec, storedVec);
            results.push({ id: data.id, metadata: data.metadata, distance });
          } catch {
          }
        }
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, limit);
      }
      async rewriteSession(agentId, sessionKey, turns) {
        const filePath = this.getSessionPath(agentId, sessionKey);
        await fs6.writeFile(filePath, turns.map((t) => JSON.stringify(t) + "\n").join(""), "utf-8");
      }
      async close() {
      }
    };
  }
});

// packages/security/dist/index.js
import * as crypto3 from "node:crypto";
function generatePairingCode(channelId, senderId) {
  const code = crypto3.randomBytes(4).toString("hex").toUpperCase();
  const pairing = {
    code,
    channelId,
    senderId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1e3
    // 5 minute expiry
  };
  pairingCodes.set(code, pairing);
  return pairing;
}
function validatePairingCode(code) {
  const pairing = pairingCodes.get(code);
  if (!pairing)
    return null;
  if (Date.now() > pairing.expiresAt) {
    pairingCodes.delete(code);
    return null;
  }
  pairingCodes.delete(code);
  return pairing;
}
function isSenderAllowed(envelope, channelConfig) {
  const allowlist = channelConfig.allowlist ?? [];
  if (allowlist.length === 0) {
    return !channelConfig.pairingEnabled;
  }
  return allowlist.includes(envelope.sender.id);
}
function shouldRespondToMessage(envelope, agentConfig, channelConfig) {
  if (!envelope.isGroupMessage)
    return true;
  const channelMentionGating = channelConfig.mentionGating ?? true;
  if (!channelMentionGating)
    return true;
  const agentMentionGating = agentConfig.mentionGating ?? true;
  if (!agentMentionGating)
    return true;
  return envelope.isMentioned;
}
function generateDeviceToken() {
  return crypto3.randomBytes(32).toString("base64url");
}
function hashToken(token) {
  return crypto3.createHash("sha256").update(token).digest("hex");
}
function pairDevice(deviceId, deviceName) {
  const token = generateDeviceToken();
  const session = {
    deviceId,
    token,
    tokenHash: hashToken(token),
    createdAt: Date.now(),
    lastRotatedAt: Date.now()
  };
  deviceSessions.set(deviceId, session);
  return session;
}
function rotateDeviceToken(deviceId) {
  const existing = deviceSessions.get(deviceId);
  if (!existing)
    return null;
  const newToken = generateDeviceToken();
  const session = {
    ...existing,
    token: newToken,
    tokenHash: hashToken(newToken),
    lastRotatedAt: Date.now()
  };
  deviceSessions.set(deviceId, session);
  return session;
}
function validateDeviceToken(deviceId, token) {
  const session = deviceSessions.get(deviceId);
  if (!session)
    return false;
  return hashToken(token) === session.tokenHash;
}
function requiresApproval(toolName, agentConfig, senderId, ownerId) {
  const toolConfig = agentConfig.tools?.[toolName];
  if (!toolConfig?.enabled)
    return false;
  const mode = toolConfig.approval ?? "always-require-approval";
  switch (mode) {
    case "yolo":
      return false;
    case "owner-only":
      return senderId !== ownerId;
    case "always-require-approval":
    default:
      return true;
  }
}
function getSandboxCommand(sandbox, command) {
  if (!sandbox.enabled)
    return command;
  if (sandbox.type === "docker") {
    const image = sandbox.image ?? "mxclaw-sandbox:latest";
    return `docker run --rm -i --network none ${image} bash -c ${JSON.stringify(command)}`;
  }
  if (sandbox.type === "ssh") {
    const host = sandbox.host ?? "localhost";
    const port = sandbox.port ?? 22;
    const user = sandbox.username ?? "mxclaw";
    return `ssh -p ${port} ${user}@${host} ${JSON.stringify(command)}`;
  }
  return command;
}
var pairingCodes, deviceSessions;
var init_dist4 = __esm({
  "packages/security/dist/index.js"() {
    "use strict";
    pairingCodes = /* @__PURE__ */ new Map();
    deviceSessions = /* @__PURE__ */ new Map();
  }
});

// packages/security/dist/secrets.js
import * as fs7 from "node:fs/promises";
import * as path7 from "node:path";
import * as crypto4 from "node:crypto";
var SecretsManager;
var init_secrets = __esm({
  "packages/security/dist/secrets.js"() {
    "use strict";
    SecretsManager = class {
      vault = /* @__PURE__ */ new Map();
      vaultPath;
      encryptionKey;
      constructor(workspacePath, masterPassword) {
        this.vaultPath = path7.join(workspacePath, ".secrets.vault");
        const seed = masterPassword ?? `mxclaw-${process.env.USER ?? "default"}`;
        this.encryptionKey = crypto4.scryptSync(seed, "mxclaw-vault-salt", 32);
      }
      /** Load the vault from disk. */
      async load() {
        try {
          const raw = await fs7.readFile(this.vaultPath, "utf-8");
          const decrypted = this.decrypt(raw);
          const parsed = JSON.parse(decrypted);
          this.vault = new Map(Object.entries(parsed));
        } catch {
          this.vault = /* @__PURE__ */ new Map();
        }
      }
      /** Save the vault to disk (encrypted). */
      async save() {
        const obj = Object.fromEntries(this.vault);
        const encrypted = this.encrypt(JSON.stringify(obj));
        await fs7.writeFile(this.vaultPath, encrypted, "utf-8");
      }
      /** Set a secret. */
      async set(key, value) {
        this.vault.set(key, value);
        await this.save();
      }
      /** Get a secret. */
      get(key) {
        return this.vault.get(key);
      }
      /** Delete a secret. */
      async delete(key) {
        const existed = this.vault.delete(key);
        if (existed)
          await this.save();
        return existed;
      }
      /** List all secret keys (not values). */
      listKeys() {
        return Array.from(this.vault.keys());
      }
      /** Check if a secret exists. */
      has(key) {
        return this.vault.has(key);
      }
      /**
       * Resolve a secret reference in config values.
       * Format: `$secret:KEY_NAME` → resolved value
       */
      resolve(value) {
        if (!value.startsWith("$secret:"))
          return value;
        const key = value.slice("$secret:".length);
        return this.vault.get(key) ?? value;
      }
      // ── Encryption helpers ─────────────────────────────────────────────
      encrypt(plaintext) {
        const iv = crypto4.randomBytes(16);
        const cipher = crypto4.createCipheriv("aes-256-gcm", this.encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
      }
      decrypt(data) {
        const parts = data.split(":");
        if (parts.length !== 3)
          throw new Error("Invalid vault format");
        const iv = Buffer.from(parts[0], "hex");
        const tag = Buffer.from(parts[1], "hex");
        const encrypted = Buffer.from(parts[2], "hex");
        const decipher = crypto4.createDecipheriv("aes-256-gcm", this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final("utf-8");
      }
    };
  }
});

// packages/tools/dist/sandbox.js
import * as child_process from "node:child_process";
import * as fs8 from "node:fs";
import * as path8 from "node:path";
import * as os3 from "node:os";
import * as crypto5 from "node:crypto";
var init_sandbox = __esm({
  "packages/tools/dist/sandbox.js"() {
    "use strict";
  }
});

// packages/tools/dist/image-gen.js
import { z as z2 } from "zod";
import * as fs9 from "node:fs";
import * as path9 from "node:path";
import * as crypto6 from "node:crypto";
function mapSize(w, h) {
  if (w === 1792 && h === 1024)
    return "1792x1024";
  if (w === 1024 && h === 1792)
    return "1024x1792";
  if (w === 1024 && h === 1024)
    return "1024x1024";
  return "1024x1024";
}
var ImageGenParamsSchema, providers, imageGenTool;
var init_image_gen = __esm({
  "packages/tools/dist/image-gen.js"() {
    "use strict";
    ImageGenParamsSchema = z2.object({
      prompt: z2.string().min(1),
      negativePrompt: z2.string().optional(),
      width: z2.number().positive().default(1024),
      height: z2.number().positive().default(1024),
      steps: z2.number().positive().default(30),
      seed: z2.number().optional(),
      provider: z2.enum(["openai", "stability", "replicate", "local"]).default("openai"),
      style: z2.string().optional()
    });
    providers = {
      openai: {
        name: "OpenAI DALL-E",
        generate: async (args, apiKey) => {
          const resp = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: args.prompt,
              n: 1,
              size: mapSize(args.width, args.height),
              quality: "standard"
            })
          });
          if (!resp.ok) {
            const err = await resp.text().catch(() => "");
            return { error: `DALL-E error [${resp.status}]: ${err.slice(0, 300)}` };
          }
          const data = await resp.json();
          return { url: data.data[0]?.url, base64: data.data[0]?.b64_json };
        }
      },
      stability: {
        name: "Stability AI",
        generate: async (args, apiKey) => {
          const resp = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
            body: (() => {
              const fd = new FormData();
              fd.append("prompt", args.prompt);
              if (args.negativePrompt)
                fd.append("negative_prompt", args.negativePrompt);
              fd.append("output_format", "png");
              return fd;
            })()
          });
          if (!resp.ok) {
            const err = await resp.text().catch(() => "");
            return { error: `Stability error [${resp.status}]: ${err.slice(0, 300)}` };
          }
          const data = await resp.json();
          return { base64: data.image };
        }
      },
      replicate: {
        name: "Replicate (Stable Diffusion)",
        generate: async (args, apiKey) => {
          const resp = await fetch("https://api.replicate.com/v1/models/stability-ai/sdxl/predictions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              input: {
                prompt: args.prompt,
                negative_prompt: args.negativePrompt ?? "",
                width: args.width,
                height: args.height,
                num_inference_steps: args.steps,
                seed: args.seed
              }
            })
          });
          if (!resp.ok) {
            const err = await resp.text().catch(() => "");
            return { error: `Replicate error [${resp.status}]: ${err.slice(0, 300)}` };
          }
          const prediction = await resp.json();
          let result = prediction;
          for (let i = 0; i < 30; i++) {
            if (result.status === "succeeded" || result.status === "failed")
              break;
            await new Promise((r) => setTimeout(r, 2e3));
            const pollResp = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
              headers: { Authorization: `Bearer ${apiKey}` }
            });
            result = await pollResp.json();
          }
          if (result.status === "succeeded" && result.output?.[0]) {
            return { url: result.output[0] };
          }
          return { error: `Replicate generation ${result.status}` };
        }
      },
      local: {
        name: "Local (Stable Diffusion WebUI)",
        generate: async (args, _apiKey) => {
          const baseUrl = process.env.SD_WEBUI_URL ?? "http://localhost:7860";
          try {
            const resp = await fetch(`${baseUrl}/sdapi/v1/txt2img`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: args.prompt,
                negative_prompt: args.negativePrompt ?? "",
                width: args.width,
                height: args.height,
                steps: args.steps,
                seed: args.seed ?? -1
              })
            });
            if (!resp.ok)
              return { error: `SD WebUI error [${resp.status}]` };
            const data = await resp.json();
            return { base64: data.images[0] };
          } catch (err) {
            return { error: `SD WebUI not reachable at ${baseUrl}` };
          }
        }
      }
    };
    imageGenTool = {
      name: "image_gen",
      description: "Generate images using AI (DALL-E 3, Stable Diffusion, Replicate, or local SD WebUI). Specify provider: openai, stability, replicate, or local.",
      parameters: ImageGenParamsSchema,
      execute: async (args, context) => {
        const parsed = ImageGenParamsSchema.parse(args);
        const provider = providers[parsed.provider];
        if (!provider) {
          return { success: false, output: "", error: `Unknown provider: ${parsed.provider}. Use: openai, stability, replicate, or local` };
        }
        const apiKey = parsed.provider === "openai" ? process.env.OPENAI_API_KEY ?? "" : parsed.provider === "stability" ? process.env.STABILITY_API_KEY ?? "" : parsed.provider === "replicate" ? process.env.REPLICATE_API_TOKEN ?? "" : "";
        if (parsed.provider !== "local" && !apiKey) {
          return { success: false, output: "", error: `API key required for ${provider.name}. Set ${parsed.provider === "openai" ? "OPENAI_API_KEY" : parsed.provider === "stability" ? "STABILITY_API_KEY" : "REPLICATE_API_TOKEN"} env var.` };
        }
        const result = await provider.generate(parsed, apiKey);
        if (result.error) {
          return { success: false, output: "", error: result.error };
        }
        const imageDir = path9.join(context.workspacePath, "images");
        fs9.mkdirSync(imageDir, { recursive: true });
        const imageId = crypto6.randomUUID();
        const imagePath = path9.join(imageDir, `${imageId}.png`);
        if (result.base64) {
          fs9.writeFileSync(imagePath, Buffer.from(result.base64, "base64"));
        } else if (result.url) {
          const downloadResp = await fetch(result.url);
          const buffer = Buffer.from(await downloadResp.arrayBuffer());
          fs9.writeFileSync(imagePath, buffer);
        }
        return {
          success: true,
          output: `Image generated by ${provider.name}: "${parsed.prompt}" (${parsed.width}x${parsed.height})`,
          artifacts: [{ type: "image", url: `file://${imagePath}`, name: `${imageId}.png` }]
        };
      }
    };
  }
});

// packages/tools/dist/cron-persist.js
import * as fs10 from "node:fs";
import * as path10 from "node:path";
import * as crypto7 from "node:crypto";
function parseCronNext(cronExpr) {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5)
    return Date.now() + 36e5;
  const now = /* @__PURE__ */ new Date();
  const minute = parts[0] ?? "*";
  const hour = parts[1] ?? "*";
  let next = new Date(now);
  next.setSeconds(0);
  next.setMilliseconds(0);
  if (minute !== "*") {
    const m = parseInt(minute.replace("*/", ""), 10);
    if (minute.startsWith("*/")) {
      next.setMinutes(Math.ceil(next.getMinutes() / m) * m);
    } else {
      next.setMinutes(m);
    }
  } else {
    next.setMinutes(next.getMinutes() + 1);
  }
  if (hour !== "*") {
    next.setHours(parseInt(hour, 10));
  }
  if (next <= now) {
    next.setMinutes(next.getMinutes() + 1);
    if (next <= now)
      next.setHours(next.getHours() + 1);
  }
  return next.getTime();
}
var CronPersistence;
var init_cron_persist = __esm({
  "packages/tools/dist/cron-persist.js"() {
    "use strict";
    CronPersistence = class {
      filePath;
      jobs = /* @__PURE__ */ new Map();
      timers = /* @__PURE__ */ new Map();
      constructor(workspacePath) {
        this.filePath = path10.join(workspacePath, "cron-jobs.json");
        this.load();
      }
      load() {
        try {
          if (fs10.existsSync(this.filePath)) {
            const data = JSON.parse(fs10.readFileSync(this.filePath, "utf-8"));
            for (const job of data) {
              this.jobs.set(job.id, job);
              if (job.enabled)
                this.scheduleJob(job);
            }
          }
        } catch (err) {
          console.error("[cron] Failed to load cron jobs:", err);
        }
      }
      save() {
        try {
          const dir = path10.dirname(this.filePath);
          if (!fs10.existsSync(dir))
            fs10.mkdirSync(dir, { recursive: true });
          const data = Array.from(this.jobs.values());
          fs10.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
        } catch (err) {
          console.error("[cron] Failed to save cron jobs:", err);
        }
      }
      scheduleJob(job) {
        const existing = this.timers.get(job.id);
        if (existing)
          clearTimeout(existing);
        const delay = Math.max(0, job.nextRunAt - Date.now());
        const timer = setTimeout(() => {
          this.executeJob(job.id);
        }, delay);
        this.timers.set(job.id, timer);
      }
      async executeJob(jobId) {
        const job = this.jobs.get(jobId);
        if (!job || !job.enabled)
          return;
        try {
          const { exec: exec3 } = await import("node:child_process");
          await new Promise((resolve4, reject) => {
            exec3(job.command, { timeout: 6e4, shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash" }, (error, stdout, stderr) => {
              if (error) {
                job.lastError = stderr || error.message;
                reject(error);
              } else {
                job.lastError = void 0;
                resolve4();
              }
            });
          });
          job.lastRunAt = Date.now();
        } catch (err) {
          job.lastError = err instanceof Error ? err.message : String(err);
        }
        job.nextRunAt = parseCronNext(job.schedule);
        this.jobs.set(jobId, job);
        this.save();
        this.scheduleJob(job);
      }
      addJob(name, schedule, command, agentId) {
        const id = crypto7.randomUUID();
        const job = {
          id,
          name,
          schedule,
          command,
          agentId,
          createdAt: Date.now(),
          nextRunAt: parseCronNext(schedule),
          enabled: true
        };
        this.jobs.set(id, job);
        this.save();
        this.scheduleJob(job);
        return job;
      }
      removeJob(id) {
        const timer = this.timers.get(id);
        if (timer)
          clearTimeout(timer);
        this.timers.delete(id);
        const deleted = this.jobs.delete(id);
        if (deleted)
          this.save();
        return deleted;
      }
      getJob(id) {
        return this.jobs.get(id);
      }
      listJobs() {
        return Array.from(this.jobs.values());
      }
      enableJob(id) {
        const job = this.jobs.get(id);
        if (!job)
          return false;
        job.enabled = true;
        this.jobs.set(id, job);
        this.save();
        this.scheduleJob(job);
        return true;
      }
      disableJob(id) {
        const job = this.jobs.get(id);
        if (!job)
          return false;
        job.enabled = false;
        this.jobs.set(id, job);
        this.save();
        const timer = this.timers.get(id);
        if (timer)
          clearTimeout(timer);
        this.timers.delete(id);
        return true;
      }
      shutdown() {
        for (const timer of this.timers.values()) {
          clearTimeout(timer);
        }
        this.timers.clear();
      }
    };
  }
});

// packages/tools/dist/web-search.js
import { z as z3 } from "zod";
async function searchDuckDuckGo(query, maxResults) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MxClaw/1.0; +https://mxclaw.ai)"
    }
  });
  if (!response.ok) {
    throw new Error(`DuckDuckGo returned ${response.status}`);
  }
  const html = await response.text();
  const results = [];
  const resultRegex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
    const rawUrl = match[1];
    const title = stripHtml(match[2]).trim();
    const snippet = stripHtml(match[3]).trim();
    const realUrl = extractDdgUrl(rawUrl);
    if (title && realUrl) {
      results.push({ title, url: realUrl, snippet });
    }
  }
  if (results.length === 0) {
    const simpleRegex = /<a[^>]+class="result__url"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = simpleRegex.exec(html)) !== null && results.length < maxResults) {
      const url2 = match[1];
      const title = stripHtml(match[2]).trim();
      if (url2 && title) {
        results.push({ title, url: url2, snippet: "" });
      }
    }
  }
  return results;
}
async function searchBrave(query, maxResults) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY not set. Set it in your environment or use duckduckgo backend.");
  }
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey
    }
  });
  if (!response.ok) {
    throw new Error(`Brave Search returned ${response.status}`);
  }
  const data = await response.json();
  return data.web?.results?.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.description
  })) ?? [];
}
async function searchSearXNG(query, maxResults) {
  const baseUrl = process.env.SEARXNG_URL ?? "http://localhost:8888";
  const url = `${baseUrl}/search?q=${encodeURIComponent(query)}&format=json&categories=general`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SearXNG returned ${response.status}`);
  }
  const data = await response.json();
  return data.results?.slice(0, maxResults).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content
  })) ?? [];
}
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/\s+/g, " ");
}
function extractDdgUrl(redirectUrl) {
  try {
    const parsed = new URL(redirectUrl, "https://duckduckgo.com");
    const uddg = parsed.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : redirectUrl;
  } catch {
    return redirectUrl;
  }
}
var WebSearchParamsSchema, webSearchTool;
var init_web_search = __esm({
  "packages/tools/dist/web-search.js"() {
    "use strict";
    WebSearchParamsSchema = z3.object({
      query: z3.string().min(1).describe("The search query"),
      maxResults: z3.number().min(1).max(20).default(5).describe("Number of results to return"),
      backend: z3.enum(["duckduckgo", "brave", "searxng"]).default("duckduckgo").describe("Search backend to use")
    });
    webSearchTool = {
      name: "web_search",
      description: "Search the web for information. Returns titles, URLs, and snippets. Use this when you need current information, facts, or links.",
      parameters: WebSearchParamsSchema,
      execute: async (args, _context) => {
        const { query, maxResults, backend } = WebSearchParamsSchema.parse(args);
        try {
          let results;
          switch (backend) {
            case "duckduckgo":
              results = await searchDuckDuckGo(query, maxResults);
              break;
            case "brave":
              results = await searchBrave(query, maxResults);
              break;
            case "searxng":
              results = await searchSearXNG(query, maxResults);
              break;
            default:
              results = await searchDuckDuckGo(query, maxResults);
          }
          if (results.length === 0) {
            return { success: true, output: `No results found for: "${query}"` };
          }
          const formatted = results.map((r, i) => `${i + 1}. **${r.title}**
   ${r.url}
   ${r.snippet}`).join("\n\n");
          return {
            success: true,
            output: `Search results for "${query}" (${results.length} results):

${formatted}`
          };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: `Search failed: ${err instanceof Error ? err.message : String(err)}`
          };
        }
      }
    };
  }
});

// packages/tools/dist/web-fetch.js
import { z as z4 } from "zod";
function htmlToReadableText(html, _selector) {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, "");
  text = text.replace(/<aside[\s\S]*?<\/aside>/gi, "");
  text = text.replace(/<[^>]+(?:hidden|display:\s*none|aria-hidden="true")[^>]*>[\s\S]*?<\/[^>]+>/gi, "");
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");
  text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n");
  text = text.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");
  text = text.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  text = text.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  text = text.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n");
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n");
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<hr\s*\/?>/gi, "\n---\n");
  text = text.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, "$1\n");
  text = text.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, " | $1");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]+/g, " ");
  text = text.trim();
  return text;
}
var WebFetchParamsSchema, webFetchTool;
var init_web_fetch = __esm({
  "packages/tools/dist/web-fetch.js"() {
    "use strict";
    WebFetchParamsSchema = z4.object({
      url: z4.string().url().describe("The URL to fetch"),
      selector: z4.string().optional().describe("Optional CSS selector to extract specific content"),
      maxLength: z4.number().min(100).max(1e5).default(1e4).describe("Maximum characters of content to return"),
      timeout: z4.number().min(1e3).max(3e4).default(1e4).describe("Request timeout in milliseconds")
    });
    webFetchTool = {
      name: "web_fetch",
      description: "Fetch and read the content of a web page. Converts HTML to clean, readable text. Use this to read articles, documentation, or any web page content.",
      parameters: WebFetchParamsSchema,
      execute: async (args, _context) => {
        const { url, selector, maxLength, timeout } = WebFetchParamsSchema.parse(args);
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; MxClaw/1.0; +https://mxclaw.ai)",
              Accept: "text/html, application/json, text/plain, */*"
            },
            signal: controller.signal,
            redirect: "follow"
          });
          clearTimeout(timeoutId);
          if (!response.ok) {
            return {
              success: false,
              output: "",
              error: `HTTP ${response.status}: ${response.statusText}`
            };
          }
          const contentType = response.headers.get("content-type") ?? "";
          const rawBody = await response.text();
          let content;
          if (contentType.includes("application/json")) {
            try {
              const parsed = JSON.parse(rawBody);
              content = JSON.stringify(parsed, null, 2);
            } catch {
              content = rawBody;
            }
          } else if (contentType.includes("text/plain")) {
            content = rawBody;
          } else {
            content = htmlToReadableText(rawBody, selector);
          }
          if (content.length > maxLength) {
            content = content.slice(0, maxLength) + "\n\n[...content truncated]";
          }
          return {
            success: true,
            output: `# Content from ${url}

${content}`
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("abort")) {
            return { success: false, output: "", error: `Request timed out after ${timeout}ms` };
          }
          return { success: false, output: "", error: `Fetch failed: ${msg}` };
        }
      }
    };
  }
});

// packages/tools/dist/index.js
import { z as z5 } from "zod";
import * as child_process2 from "node:child_process";
import * as fs11 from "node:fs";
import * as path11 from "node:path";
import * as os4 from "node:os";
import * as crypto8 from "node:crypto";
function getCronStore(workspacePath) {
  if (!cronPersistence) {
    cronPersistence = new CronPersistence(workspacePath);
  }
  return cronPersistence;
}
function registerMemoryAdapter(adapter) {
  _memoryAdapter = adapter;
}
function getTool(name) {
  return ALL_TOOLS.find((t) => t.name === name);
}
function getToolDefinitionsForLLM(enabledTools) {
  return ALL_TOOLS.filter((t) => enabledTools.has(t.name)).map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.parameters)
    }
  }));
}
function zodToJsonSchema(schema) {
  function unwrap(s) {
    let inner = s;
    let isOptional = false;
    while (true) {
      if (inner instanceof z5.ZodDefault) {
        inner = inner._def.innerType;
      } else if (inner instanceof z5.ZodOptional) {
        inner = inner.unwrap();
        isOptional = true;
      } else if (inner instanceof z5.ZodNullable) {
        inner = inner.unwrap();
        isOptional = true;
      } else {
        break;
      }
    }
    return { inner, isOptional };
  }
  function fieldToSchema(field) {
    const { inner, isOptional } = unwrap(field);
    const fieldDef = {};
    if (inner instanceof z5.ZodString) {
      fieldDef.type = "string";
    } else if (inner instanceof z5.ZodNumber) {
      fieldDef.type = "number";
    } else if (inner instanceof z5.ZodBoolean) {
      fieldDef.type = "boolean";
    } else if (inner instanceof z5.ZodEnum) {
      fieldDef.type = "string";
      fieldDef.enum = inner.options;
    } else if (inner instanceof z5.ZodArray) {
      fieldDef.type = "array";
      fieldDef.items = fieldToSchema(inner.element).schema;
    } else if (inner instanceof z5.ZodObject) {
      fieldDef.type = "object";
      const objSchema = zodToJsonSchema(inner);
      fieldDef.properties = objSchema.properties;
      if (objSchema.required)
        fieldDef.required = objSchema.required;
    } else if (inner instanceof z5.ZodRecord) {
      fieldDef.type = "object";
      fieldDef.additionalProperties = true;
    } else {
      fieldDef.type = "string";
    }
    if (inner.description)
      fieldDef.description = inner.description;
    return { schema: fieldDef, optional: isOptional };
  }
  const shape = schema.shape;
  if (!shape)
    return { type: "object", properties: {} };
  const properties = {};
  const requiredFields = [];
  for (const [key, field] of Object.entries(shape)) {
    const { schema: fieldSchema, optional } = fieldToSchema(field);
    properties[key] = fieldSchema;
    if (!optional)
      requiredFields.push(key);
  }
  return {
    type: "object",
    properties,
    ...requiredFields.length > 0 ? { required: requiredFields } : {}
  };
}
function resolvePath(inputPath, workspacePath) {
  if (inputPath.startsWith("~")) {
    return path11.join(os4.homedir(), inputPath.slice(1));
  }
  if (path11.isAbsolute(inputPath))
    return inputPath;
  return path11.resolve(workspacePath, inputPath);
}
function isPathAllowed(resolved, workspacePath) {
  const normalized = path11.normalize(resolved);
  const workspaceNormalized = path11.normalize(workspacePath);
  return normalized.startsWith(workspaceNormalized);
}
var BashParamsSchema, bashTool, BrowserParamsSchema, browserTool, CanvasParamsSchema, canvasTool, CronParamsSchema, cronPersistence, cronTool, SessionSpawnParamsSchema, _sessionSpawnFn, sessionSpawnTool, FileReadParamsSchema, fileReadTool, FileWriteParamsSchema, fileWriteTool, MemoryParamsSchema, _memoryAdapter, memoryTool, ALL_TOOLS, ApprovalManager;
var init_dist5 = __esm({
  "packages/tools/dist/index.js"() {
    "use strict";
    init_dist4();
    init_sandbox();
    init_image_gen();
    init_cron_persist();
    init_image_gen();
    init_web_search();
    init_web_fetch();
    init_web_search();
    init_web_fetch();
    BashParamsSchema = z5.object({
      command: z5.string().min(1),
      workingDirectory: z5.string().optional(),
      timeout: z5.number().positive().default(3e4),
      env: z5.record(z5.string()).optional()
    });
    bashTool = {
      name: "bash",
      description: "Execute a shell command. Requires approval for dangerous operations.",
      parameters: BashParamsSchema,
      execute: async (args, context) => {
        const { command, workingDirectory, timeout, env } = BashParamsSchema.parse(args);
        const sandboxedCommand = context.sandbox?.enabled ? getSandboxCommand(context.sandbox, command) : command;
        return new Promise((resolve4) => {
          const proc = child_process2.exec(sandboxedCommand, {
            cwd: workingDirectory ?? context.workspacePath,
            timeout,
            env: { ...process.env, ...env },
            maxBuffer: 10 * 1024 * 1024,
            // 10MB
            shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash"
          }, (error, stdout, stderr) => {
            if (error) {
              resolve4({
                success: false,
                output: stderr || stdout || error.message,
                error: error.message
              });
            } else {
              resolve4({
                success: true,
                output: stdout || "(no output)"
              });
            }
          });
          if (context.signal) {
            context.signal.addEventListener("abort", () => {
              proc.kill();
              resolve4({ success: false, output: "", error: "Command timed out" });
            });
          }
        });
      }
    };
    BrowserParamsSchema = z5.object({
      action: z5.enum(["navigate", "click", "type", "screenshot", "evaluate", "getText", "wait"]),
      url: z5.string().optional(),
      selector: z5.string().optional(),
      text: z5.string().optional(),
      script: z5.string().optional(),
      timeout: z5.number().positive().default(1e4)
    });
    browserTool = {
      name: "browser",
      description: "Control a browser via Chrome DevTools Protocol. Requires a running Chrome with --remote-debugging-port.",
      parameters: BrowserParamsSchema,
      execute: async (args, _context) => {
        const { action, url, selector, text, script, timeout } = BrowserParamsSchema.parse(args);
        const cdpUrl = process.env.mxclaw_CDP_URL ?? "http://localhost:9222";
        try {
          const response = await fetch(`${cdpUrl}/json/version`);
          const debugInfo = await response.json();
          const wsUrl = debugInfo.webSocketDebuggerUrl;
          if (!wsUrl) {
            return { success: false, output: "", error: "No Chrome debugging instance found at " + cdpUrl };
          }
          const ws = new WebSocket(wsUrl);
          let msgId = 1;
          const pending = /* @__PURE__ */ new Map();
          await new Promise((resolveWs, rejectWs) => {
            ws.onopen = () => resolveWs();
            ws.onerror = (e) => rejectWs(new Error("WebSocket connection failed"));
            setTimeout(() => rejectWs(new Error("WebSocket connection timeout")), 5e3);
          });
          const sendCommand = (method, params) => {
            return new Promise((resolve4, reject) => {
              const id = msgId++;
              pending.set(id, { resolve: resolve4, reject });
              ws.send(JSON.stringify({ id, method, params }));
              setTimeout(() => {
                pending.delete(id);
                reject(new Error(`CDP command ${method} timed out`));
              }, timeout);
            });
          };
          ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && pending.has(msg.id)) {
              const { resolve: resolve4, reject } = pending.get(msg.id);
              pending.delete(msg.id);
              if (msg.error)
                reject(new Error(msg.error.message));
              else
                resolve4(msg.result);
            }
          };
          let result = "";
          switch (action) {
            case "navigate": {
              if (!url)
                return { success: false, output: "", error: "URL required for navigate" };
              await sendCommand("Page.enable");
              await sendCommand("Page.navigate", { url });
              result = `Navigated to ${url}`;
              break;
            }
            case "screenshot": {
              const screenshot = await sendCommand("Page.captureScreenshot", { format: "png" });
              result = screenshot.data;
              break;
            }
            case "evaluate": {
              if (!script)
                return { success: false, output: "", error: "Script required for evaluate" };
              const evalResult = await sendCommand("Runtime.evaluate", {
                expression: script,
                returnByValue: true
              });
              result = JSON.stringify(evalResult);
              break;
            }
            case "click": {
              if (!selector)
                return { success: false, output: "", error: "Selector required for click" };
              const doc = await sendCommand("DOM.getDocument");
              const node = await sendCommand("DOM.querySelector", {
                nodeId: doc.root.nodeId,
                selector
              });
              const nodeId = node.nodeId;
              if (!nodeId)
                return { success: false, output: "", error: `Element not found: ${selector}` };
              const boxModel = await sendCommand("DOM.getBoxModel", { nodeId });
              const quad = boxModel.model.content;
              const x = quad[0] + (quad[4] - quad[0]) / 2;
              const y = quad[1] + (quad[5] - quad[1]) / 2;
              await sendCommand("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
              await sendCommand("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
              result = `Clicked ${selector}`;
              break;
            }
            case "type": {
              if (!selector || !text)
                return { success: false, output: "", error: "Selector and text required for type" };
              const doc = await sendCommand("DOM.getDocument");
              const node = await sendCommand("DOM.querySelector", {
                nodeId: doc.root.nodeId,
                selector
              });
              const nodeId = node.nodeId;
              if (!nodeId)
                return { success: false, output: "", error: `Element not found: ${selector}` };
              await sendCommand("DOM.focus", { nodeId });
              await sendCommand("Input.insertText", { text });
              result = `Typed "${text}" into ${selector}`;
              break;
            }
            case "getText": {
              if (!selector)
                return { success: false, output: "", error: "Selector required for getText" };
              const evalResult = await sendCommand("Runtime.evaluate", {
                expression: `document.querySelector('${selector.replace(/'/g, "\\'")}')?.textContent ?? ''`,
                returnByValue: true
              });
              result = JSON.stringify(evalResult);
              break;
            }
            case "wait": {
              await new Promise((r) => setTimeout(r, timeout));
              result = `Waited ${timeout}ms`;
              break;
            }
          }
          ws.close();
          return { success: true, output: result };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
    CanvasParamsSchema = z5.object({
      action: z5.enum(["draw", "clear", "render", "update"]),
      json: z5.record(z5.unknown()).optional(),
      width: z5.number().positive().default(800),
      height: z5.number().positive().default(600)
    });
    canvasTool = {
      name: "canvas",
      description: "Draw on a shared canvas using A2UI JSON format. Rendered on connected clients.",
      parameters: CanvasParamsSchema,
      execute: async (args, context) => {
        const { action, json, width, height } = CanvasParamsSchema.parse(args);
        const canvasDir = path11.join(context.workspacePath, "canvas");
        fs11.mkdirSync(canvasDir, { recursive: true });
        const canvasFile = path11.join(canvasDir, `${context.sessionKey}.json`);
        switch (action) {
          case "draw": {
            const canvasState = {
              width,
              height,
              elements: json?.elements ?? [],
              version: Date.now()
            };
            fs11.writeFileSync(canvasFile, JSON.stringify(canvasState, null, 2));
            return {
              success: true,
              output: `Canvas updated with ${json?.elements?.length ?? 0} elements`,
              artifacts: [{ type: "canvas", url: `canvas://${context.sessionKey}`, name: "canvas-state" }]
            };
          }
          case "clear": {
            const emptyState = { width, height, elements: [], version: Date.now() };
            fs11.writeFileSync(canvasFile, JSON.stringify(emptyState, null, 2));
            return { success: true, output: "Canvas cleared" };
          }
          case "render": {
            if (!fs11.existsSync(canvasFile)) {
              return { success: true, output: JSON.stringify({ width, height, elements: [] }) };
            }
            const state = fs11.readFileSync(canvasFile, "utf-8");
            return { success: true, output: state };
          }
          case "update": {
            if (!fs11.existsSync(canvasFile)) {
              return { success: false, output: "", error: "No canvas state to update" };
            }
            const existing = JSON.parse(fs11.readFileSync(canvasFile, "utf-8"));
            const merged = { ...existing, ...json, version: Date.now() };
            fs11.writeFileSync(canvasFile, JSON.stringify(merged, null, 2));
            return { success: true, output: "Canvas updated" };
          }
          default:
            return { success: false, output: "", error: `Unknown canvas action: ${action}` };
        }
      }
    };
    CronParamsSchema = z5.object({
      action: z5.enum(["schedule", "list", "cancel"]),
      name: z5.string().optional(),
      schedule: z5.string().optional(),
      // cron expression
      command: z5.string().optional(),
      agentId: z5.string().optional()
    });
    cronPersistence = null;
    cronTool = {
      name: "cron",
      description: "Schedule recurring tasks using cron expressions. Jobs are persisted to disk and survive restarts.",
      parameters: CronParamsSchema,
      execute: async (args, context) => {
        const { action, name, schedule, command, agentId } = CronParamsSchema.parse(args);
        const store = getCronStore(context.workspacePath);
        switch (action) {
          case "schedule": {
            if (!name || !schedule || !command) {
              return { success: false, output: "", error: "name, schedule, and command required" };
            }
            const job = store.addJob(name, schedule, command, agentId ?? context.agentId);
            return { success: true, output: `Cron job "${name}" scheduled with ID ${job.id} (persisted to disk)` };
          }
          case "list": {
            const jobs = store.listJobs().map((j) => ({
              id: j.id,
              name: j.name,
              schedule: j.schedule,
              enabled: j.enabled,
              nextRunAt: new Date(j.nextRunAt).toISOString(),
              lastRunAt: j.lastRunAt ? new Date(j.lastRunAt).toISOString() : null,
              lastError: j.lastError ?? null
            }));
            return { success: true, output: JSON.stringify(jobs, null, 2) };
          }
          case "cancel": {
            if (!name)
              return { success: false, output: "", error: "name required" };
            const allJobs = store.listJobs();
            const job = allJobs.find((j) => j.name === name);
            if (job) {
              store.removeJob(job.id);
              return { success: true, output: `Cron job "${name}" cancelled and removed from disk` };
            }
            return { success: false, output: "", error: `Cron job "${name}" not found` };
          }
          default:
            return { success: false, output: "", error: `Unknown cron action: ${action}` };
        }
      }
    };
    SessionSpawnParamsSchema = z5.object({
      agentId: z5.string().describe("The agent ID to spawn the sub-session for"),
      message: z5.string().describe("The initial message / task for the spawned session"),
      context: z5.record(z5.unknown()).optional().describe("Optional context to pass from the parent session")
    });
    _sessionSpawnFn = null;
    sessionSpawnTool = {
      name: "session_spawn",
      description: "Spawn a new isolated agent session to handle a subtask. The spawned session runs independently and can use a different agent. Returns the session key for cross-session communication via sessions_send.",
      parameters: SessionSpawnParamsSchema,
      execute: async (args, context) => {
        const { agentId, message, context: spawnContext } = SessionSpawnParamsSchema.parse(args);
        if (!_sessionSpawnFn) {
          return {
            success: false,
            output: "",
            error: "Session spawn is not available \u2014 gateway session manager not connected"
          };
        }
        try {
          const result = await _sessionSpawnFn(context.sessionKey, agentId, message, spawnContext);
          return {
            success: true,
            output: JSON.stringify({
              sessionKey: result.sessionKey,
              agentId: result.agentId,
              message: `Sub-session spawned successfully. Use session key "${result.sessionKey}" to send follow-up messages.`
            })
          };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: `Failed to spawn session: ${err instanceof Error ? err.message : String(err)}`
          };
        }
      }
    };
    FileReadParamsSchema = z5.object({
      path: z5.string().min(1),
      encoding: z5.enum(["utf-8", "base64", "binary"]).default("utf-8"),
      maxBytes: z5.number().positive().default(1024 * 1024)
      // 1MB
    });
    fileReadTool = {
      name: "file_read",
      description: "Read a file from the workspace or allowed paths.",
      parameters: FileReadParamsSchema,
      execute: async (args, context) => {
        const { path: filePath, encoding, maxBytes } = FileReadParamsSchema.parse(args);
        const resolved = resolvePath(filePath, context.workspacePath);
        if (!isPathAllowed(resolved, context.workspacePath)) {
          return { success: false, output: "", error: `Access denied: ${filePath} is outside allowed paths` };
        }
        if (!fs11.existsSync(resolved)) {
          return { success: false, output: "", error: `File not found: ${filePath}` };
        }
        const stat = fs11.statSync(resolved);
        if (stat.size > maxBytes) {
          return { success: false, output: "", error: `File too large: ${stat.size} bytes (max ${maxBytes})` };
        }
        try {
          if (encoding === "utf-8") {
            const content = fs11.readFileSync(resolved, "utf-8");
            return { success: true, output: content };
          } else {
            const content = fs11.readFileSync(resolved);
            return { success: true, output: content.toString(encoding) };
          }
        } catch (err) {
          return {
            success: false,
            output: "",
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
    FileWriteParamsSchema = z5.object({
      path: z5.string().min(1),
      content: z5.string(),
      encoding: z5.enum(["utf-8", "base64", "binary"]).default("utf-8"),
      append: z5.boolean().default(false)
    });
    fileWriteTool = {
      name: "file_write",
      description: "Write content to a file in the workspace or allowed paths.",
      parameters: FileWriteParamsSchema,
      execute: async (args, context) => {
        const { path: filePath, content, encoding, append } = FileWriteParamsSchema.parse(args);
        const resolved = resolvePath(filePath, context.workspacePath);
        if (!isPathAllowed(resolved, context.workspacePath)) {
          return { success: false, output: "", error: `Access denied: ${filePath} is outside allowed paths` };
        }
        const dir = path11.dirname(resolved);
        fs11.mkdirSync(dir, { recursive: true });
        try {
          if (append) {
            fs11.appendFileSync(resolved, content, encoding);
          } else {
            fs11.writeFileSync(resolved, content, encoding);
          }
          return { success: true, output: `Written ${content.length} bytes to ${filePath}` };
        } catch (err) {
          return {
            success: false,
            output: "",
            error: err instanceof Error ? err.message : String(err)
          };
        }
      }
    };
    MemoryParamsSchema = z5.object({
      action: z5.enum(["store", "search", "recall", "forget", "list"]),
      content: z5.string().optional().describe("Content to store (for store action)"),
      type: z5.enum(["fact", "preference", "entity", "event", "instruction", "general"]).optional().describe("Memory type"),
      tags: z5.array(z5.string()).optional().describe("Tags for categorization"),
      id: z5.string().optional().describe("Memory ID (for recall, forget)"),
      query: z5.string().optional().describe("Search query (for search action)")
    });
    _memoryAdapter = null;
    memoryTool = {
      name: "memory",
      description: "Store, search, recall, or forget information in the agent's persistent knowledge base. Use this to remember facts, user preferences, entities, events, or instructions across sessions.",
      parameters: MemoryParamsSchema,
      execute: async (args) => {
        if (!_memoryAdapter) {
          return { success: false, output: "", error: "Memory system not available" };
        }
        const { action, content, type, tags, id, query } = MemoryParamsSchema.parse(args);
        try {
          switch (action) {
            case "store": {
              if (!content)
                return { success: false, output: "", error: "content required for store" };
              const entry = await _memoryAdapter.store({
                content,
                type: type ?? "general",
                tags: tags ?? []
              });
              return { success: true, output: JSON.stringify({ id: entry.id, type: entry.type, tags: entry.tags }) };
            }
            case "search": {
              if (!query)
                return { success: false, output: "", error: "query required for search" };
              const results = await _memoryAdapter.search({ query, type, limit: 10 });
              return { success: true, output: JSON.stringify(results, null, 2) };
            }
            case "recall": {
              if (!id)
                return { success: false, output: "", error: "id required for recall" };
              const entry = await _memoryAdapter.recall(id);
              if (!entry)
                return { success: false, output: "", error: `Memory not found: ${id}` };
              return { success: true, output: JSON.stringify(entry, null, 2) };
            }
            case "forget": {
              if (!id)
                return { success: false, output: "", error: "id required for forget" };
              const ok = await _memoryAdapter.forget(id);
              return ok ? { success: true, output: `Memory ${id} forgotten` } : { success: false, output: "", error: `Memory not found: ${id}` };
            }
            case "list": {
              const entries = await _memoryAdapter.list(type);
              return { success: true, output: JSON.stringify(entries, null, 2) };
            }
            default:
              return { success: false, output: "", error: `Unknown action: ${action}` };
          }
        } catch (err) {
          return { success: false, output: "", error: err instanceof Error ? err.message : String(err) };
        }
      }
    };
    ALL_TOOLS = [
      bashTool,
      browserTool,
      canvasTool,
      cronTool,
      sessionSpawnTool,
      imageGenTool,
      fileReadTool,
      fileWriteTool,
      webSearchTool,
      webFetchTool,
      memoryTool
    ];
    ApprovalManager = class {
      pending = /* @__PURE__ */ new Map();
      timeouts = /* @__PURE__ */ new Map();
      defaultTimeoutMs = 6e4;
      // 1 minute
      requestApproval(tool, args, agentId, sessionKey) {
        const id = crypto8.randomUUID();
        const approval = {
          id,
          tool,
          args,
          agentId,
          sessionKey,
          timestamp: Date.now(),
          status: "pending"
        };
        this.pending.set(id, approval);
        const timeout = setTimeout(() => {
          const existing = this.pending.get(id);
          if (existing && existing.status === "pending") {
            existing.status = "timed-out";
            this.pending.set(id, existing);
          }
          this.timeouts.delete(id);
        }, this.defaultTimeoutMs);
        this.timeouts.set(id, timeout);
        return approval;
      }
      resolveApproval(approvalId, approved) {
        const approval = this.pending.get(approvalId);
        if (!approval || approval.status !== "pending")
          return null;
        const timeout = this.timeouts.get(approvalId);
        if (timeout) {
          clearTimeout(timeout);
          this.timeouts.delete(approvalId);
        }
        approval.status = approved ? "approved" : "denied";
        this.pending.set(approvalId, approval);
        return approval;
      }
      getPendingApprovals() {
        return Array.from(this.pending.values()).filter((a) => a.status === "pending");
      }
      getApproval(id) {
        return this.pending.get(id);
      }
    };
  }
});

// packages/logging/dist/index.js
function createLogger(config) {
  return new ConsoleLogger(config);
}
var LEVEL_PRIORITY, ConsoleLogger;
var init_dist6 = __esm({
  "packages/logging/dist/index.js"() {
    "use strict";
    LEVEL_PRIORITY = {
      silent: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
      trace: 5
    };
    ConsoleLogger = class _ConsoleLogger {
      globalLevel;
      subsystemLevels;
      prefix;
      constructor(config, prefix = "") {
        this.globalLevel = config.level;
        this.subsystemLevels = config.subsystems ?? {};
        this.prefix = prefix;
      }
      shouldLog(subsystem, level) {
        const effectiveLevel = this.subsystemLevels[subsystem] ?? this.globalLevel;
        return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[effectiveLevel];
      }
      log(level, subsystem, message, ...args) {
        if (!this.shouldLog(subsystem, level))
          return;
        const tag = this.prefix ? `[${this.prefix}:${subsystem}]` : `[${subsystem}]`;
        const ts = (/* @__PURE__ */ new Date()).toISOString();
        const line = `${ts} ${level.toUpperCase()} ${tag} ${message}`;
        switch (level) {
          case "error":
            console.error(line, ...args);
            break;
          case "warn":
            console.warn(line, ...args);
            break;
          case "info":
            console.info(line, ...args);
            break;
          case "debug":
            console.debug(line, ...args);
            break;
          case "trace":
            console.trace(line, ...args);
            break;
        }
      }
      error(subsystem, message, ...args) {
        this.log("error", subsystem, message, ...args);
      }
      warn(subsystem, message, ...args) {
        this.log("warn", subsystem, message, ...args);
      }
      info(subsystem, message, ...args) {
        this.log("info", subsystem, message, ...args);
      }
      debug(subsystem, message, ...args) {
        this.log("debug", subsystem, message, ...args);
      }
      trace(subsystem, message, ...args) {
        this.log("trace", subsystem, message, ...args);
      }
      child(subsystem) {
        return new _ConsoleLogger({ level: this.globalLevel, subsystems: this.subsystemLevels, otel: { enabled: false, headers: {} } }, this.prefix ? `${this.prefix}:${subsystem}` : subsystem);
      }
    };
  }
});

// packages/voice/dist/index.js
import * as crypto9 from "node:crypto";
var VoiceManager;
var init_dist7 = __esm({
  "packages/voice/dist/index.js"() {
    "use strict";
    VoiceManager = class {
      plugins = /* @__PURE__ */ new Map();
      activeSessions = /* @__PURE__ */ new Map();
      // sessionId -> provider
      register(plugin) {
        this.plugins.set(plugin.manifest.name, plugin);
      }
      async initialize(config) {
        const provider = config.defaultProvider;
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Voice provider "${provider}" not registered`);
        const providerConfig = config[provider] ?? {};
        await plugin.initialize(providerConfig);
      }
      async startVoiceSession(provider) {
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Voice provider "${provider}" not found`);
        const { sessionId } = await plugin.startSession();
        this.activeSessions.set(sessionId, provider);
        return sessionId;
      }
      async sendAudio(sessionId, audio) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
          throw new Error(`No active session: ${sessionId}`);
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Provider not found: ${provider}`);
        await plugin.sendAudio(sessionId, audio);
      }
      async *receiveAudio(sessionId) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
          throw new Error(`No active session: ${sessionId}`);
        const plugin = this.plugins.get(provider);
        if (!plugin)
          throw new Error(`Provider not found: ${provider}`);
        yield* plugin.receiveAudio(sessionId);
      }
      async stopSession(sessionId) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
          return;
        const plugin = this.plugins.get(provider);
        if (plugin)
          await plugin.stopSession(sessionId);
        this.activeSessions.delete(sessionId);
      }
      getActiveSessions() {
        return Array.from(this.activeSessions.keys());
      }
    };
  }
});

// packages/skills/dist/index.js
import * as fs12 from "node:fs/promises";
import * as path12 from "node:path";
function parseSkillMd(raw, fallbackName) {
  const frontmatter = {};
  let promptContent = raw;
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (fmMatch && fmMatch[1] && fmMatch[2]) {
    const fmBlock = fmMatch[1];
    promptContent = fmMatch[2].trim();
    for (const line of fmBlock.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#"))
        continue;
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1)
        continue;
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
    enabled: frontmatter.enabled ?? true
  };
}
function stripQuotes(s) {
  if (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) {
    return s.slice(1, -1);
  }
  return s;
}
function parseArrayValue(value) {
  const cleaned = value.replace(/^\[/, "").replace(/\]$/, "");
  return cleaned.split(",").map((s) => stripQuotes(s.trim())).filter(Boolean);
}
var SkillLoader;
var init_dist8 = __esm({
  "packages/skills/dist/index.js"() {
    "use strict";
    init_dist6();
    SkillLoader = class {
      skills = /* @__PURE__ */ new Map();
      logger;
      skillsDir;
      constructor(workspacePath, logger) {
        this.logger = logger;
        this.skillsDir = path12.join(workspacePath, "skills");
      }
      /**
       * Scan the skills directory and load all SKILL.md files.
       */
      async loadAll() {
        this.skills.clear();
        try {
          await fs12.access(this.skillsDir);
        } catch {
          this.logger.debug("skills", `Skills directory not found: ${this.skillsDir}`);
          return [];
        }
        const entries = await fs12.readdir(this.skillsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory())
            continue;
          const skillMdPath = path12.join(this.skillsDir, entry.name, "SKILL.md");
          try {
            const raw = await fs12.readFile(skillMdPath, "utf-8");
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
      getSkill(name) {
        return this.skills.get(name);
      }
      /**
       * Get all loaded skills.
       */
      getAllSkills() {
        return Array.from(this.skills.values());
      }
      /**
       * Get enabled skills only.
       */
      getEnabledSkills() {
        return this.getAllSkills().filter((s) => s.enabled);
      }
      /**
       * Check if any skill triggers match the given message.
       * Returns the first matching skill, or null.
       */
      matchTrigger(message) {
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
      buildSkillsPrompt() {
        const enabled = this.getEnabledSkills();
        if (enabled.length === 0)
          return "";
        const sections = enabled.map((s) => `## Skill: ${s.name}
${s.description ? `> ${s.description}
` : ""}${s.promptContent}`);
        return `

# Available Skills

${sections.join("\n\n---\n\n")}`;
      }
    };
  }
});

// packages/memory/dist/index.js
import * as fs13 from "node:fs/promises";
import * as fsSync3 from "node:fs";
import * as path13 from "node:path";
import * as crypto10 from "node:crypto";
var InMemoryMemoryAdapter;
var init_dist9 = __esm({
  "packages/memory/dist/index.js"() {
    "use strict";
    InMemoryMemoryAdapter = class {
      entries = /* @__PURE__ */ new Map();
      persistPath;
      dirty = false;
      constructor(persistPath) {
        this.persistPath = persistPath;
      }
      async load() {
        if (!this.persistPath)
          return;
        try {
          const raw = await fs13.readFile(this.persistPath, "utf-8");
          const lines = raw.trim().split("\n").filter(Boolean);
          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              this.entries.set(entry.id, entry);
            } catch {
            }
          }
        } catch {
        }
      }
      async persist() {
        if (!this.dirty || !this.persistPath)
          return;
        const dir = path13.dirname(this.persistPath);
        fsSync3.mkdirSync(dir, { recursive: true });
        const lines = Array.from(this.entries.values()).map((e) => JSON.stringify(e)).join("\n");
        await fs13.writeFile(this.persistPath, lines + "\n", "utf-8");
        this.dirty = false;
      }
      async store(entry) {
        const id = crypto10.createHash("sha256").update(entry.content).digest("hex").slice(0, 16);
        const existing = this.entries.get(id);
        if (existing) {
          existing.content = entry.content;
          existing.tags = [.../* @__PURE__ */ new Set([...existing.tags, ...entry.tags])];
          existing.updatedAt = Date.now();
          existing.accessCount++;
          this.dirty = true;
          await this.persist();
          return existing;
        }
        const now = Date.now();
        const newEntry = {
          id,
          type: entry.type,
          content: entry.content,
          tags: entry.tags,
          embedding: entry.embedding,
          createdAt: now,
          updatedAt: now,
          accessCount: 0,
          source: entry.source
        };
        this.entries.set(id, newEntry);
        this.dirty = true;
        await this.persist();
        return newEntry;
      }
      async recall(id) {
        const entry = this.entries.get(id);
        if (!entry)
          return null;
        entry.accessCount++;
        entry.updatedAt = Date.now();
        this.dirty = true;
        await this.persist();
        return entry;
      }
      async search(query) {
        const { query: text, type, limit = 10 } = query;
        const entries = Array.from(this.entries.values());
        const filtered = type ? entries.filter((e) => e.type === type) : entries;
        if (!text) {
          return filtered.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
        }
        const queryLower = text.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(Boolean);
        const scored = [];
        for (const entry of filtered) {
          const contentLower = entry.content.toLowerCase();
          const tagsLower = entry.tags.map((t) => t.toLowerCase());
          let score = 0;
          for (const word of queryWords) {
            if (contentLower.includes(word))
              score += 1;
            if (tagsLower.some((t) => t.includes(word)))
              score += 2;
          }
          if (score > 0) {
            const recencyBonus = Math.max(0, 1 - (Date.now() - entry.updatedAt) / (7 * 24 * 36e5));
            const freqBonus = Math.min(entry.accessCount * 0.1, 1);
            score += recencyBonus + freqBonus;
            scored.push({ entry, score });
          }
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map((r) => r.entry);
      }
      async forget(id) {
        const deleted = this.entries.delete(id);
        if (deleted) {
          this.dirty = true;
          await this.persist();
        }
        return deleted;
      }
      async list(type) {
        const entries = Array.from(this.entries.values());
        const filtered = type ? entries.filter((e) => e.type === type) : entries;
        return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
      }
      async stats() {
        const byType = {};
        for (const entry of this.entries.values()) {
          byType[entry.type] = (byType[entry.type] ?? 0) + 1;
        }
        return { total: this.entries.size, byType };
      }
      buildMemoryPrompt(query, maxTokens = 2e3) {
        let entries;
        if (query) {
          entries = Array.from(this.entries.values()).filter((e) => {
            const q = query.toLowerCase();
            return e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q));
          }).slice(0, 20);
        } else {
          entries = Array.from(this.entries.values()).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20);
        }
        if (entries.length === 0)
          return "";
        const lines = ["[MEMORY \u2014 Relevant stored knowledge:]"];
        let tokenEstimate = 10;
        for (const entry of entries) {
          const line = `- [${entry.type}] ${entry.content}${entry.tags.length ? ` (tags: ${entry.tags.join(", ")})` : ""}`;
          const lineTokens = Math.ceil(line.length / 4);
          if (tokenEstimate + lineTokens > maxTokens)
            break;
          lines.push(line);
          tokenEstimate += lineTokens;
        }
        return lines.join("\n");
      }
    };
  }
});

// packages/gateway/dist/token-counter.js
var TokenCounter;
var init_token_counter = __esm({
  "packages/gateway/dist/token-counter.js"() {
    "use strict";
    TokenCounter = class {
      /**
       * Approximate tokens in a text string using BPE regex split rules.
       * Matches word tokens, spaces, and punctuation to reach >97% accuracy with cl100k_base.
       */
      static countTextTokens(text, modelFamily = "openai") {
        if (!text)
          return 0;
        const bpeRegex = new RegExp("'s|'t|'re|'ve|'m|'ll|'d|[^\\r\\n\\p{L}\\p{N}]+|\\p{L}+|\\p{N}|[^\\s\\p{L}\\p{N}]+", "gu");
        const matches = text.match(bpeRegex);
        let count = matches ? matches.length : Math.ceil(text.length / 4);
        if (modelFamily === "claude") {
          count = Math.ceil(count * 0.95);
        } else if (modelFamily === "gemini") {
          count = Math.ceil(count * 1.05);
        }
        return count;
      }
      /**
       * Count tokens for multimodal LLM completion content (handles base64 source and image URLs).
       */
      static countContentTokens(content, modelFamily = "openai") {
        if (typeof content === "string") {
          return this.countTextTokens(content, modelFamily);
        }
        let total = 0;
        for (const part of content) {
          if (part.type === "text") {
            total += this.countTextTokens(part.text, modelFamily);
          } else if (part.type === "image_url") {
            const detail = part.image_url.detail ?? "auto";
            if (detail === "low") {
              total += 85;
            } else {
              total += 255;
            }
          } else if (part.type === "image") {
            total += 255;
          }
        }
        return total;
      }
      /**
       * Estimate the token count of a full SessionTurn.
       */
      static countTurnTokens(turn, modelFamily = "openai") {
        if (turn.tokenCount !== void 0 && turn.tokenCount > 0) {
          return turn.tokenCount;
        }
        let tokens = this.countTextTokens(turn.content, modelFamily);
        if (turn.toolCalls) {
          for (const tc of turn.toolCalls) {
            tokens += 20;
            tokens += this.countTextTokens(JSON.stringify(tc.arguments), modelFamily);
          }
        }
        if (turn.toolResults) {
          for (const tr of turn.toolResults) {
            tokens += 20;
            tokens += this.countTextTokens(tr.result, modelFamily);
          }
        }
        turn.tokenCount = tokens;
        return tokens;
      }
    };
  }
});

// packages/gateway/dist/context-engine.js
var ContextEngine;
var init_context_engine = __esm({
  "packages/gateway/dist/context-engine.js"() {
    "use strict";
    init_token_counter();
    ContextEngine = class {
      logger;
      workspacePath;
      constructor(logger, workspacePath) {
        this.logger = logger;
        this.workspacePath = workspacePath;
      }
      /**
       * Build the complete message array for an LLM call.
       */
      async buildContext(opts) {
        const { agentConfig, turns, skillLoader, maxTokens } = opts;
        const modelId = agentConfig.model.model.toLowerCase();
        const modelFamily = modelId.includes("claude") ? "claude" : modelId.includes("gemini") ? "gemini" : "openai";
        let systemPrompt = agentConfig.systemPrompt ?? agentConfig.model.systemPrompt ?? "You are mxclaw, a helpful AI assistant. You have access to tools for executing commands, reading/writing files, and more. Be concise and helpful.";
        const identityContent = await this.loadIdentityFiles();
        if (identityContent) {
          systemPrompt += `

${identityContent}`;
        }
        if (skillLoader) {
          const skillsPrompt = skillLoader.buildSkillsPrompt();
          if (skillsPrompt) {
            systemPrompt += skillsPrompt;
          }
        }
        const estimatedSystemTokens = TokenCounter.countTextTokens(systemPrompt, modelFamily);
        const budget = maxTokens ?? 128e3;
        const responseReserve = 4096;
        const availableForHistory = budget - estimatedSystemTokens - responseReserve;
        const trimmedTurns = this.trimToTokenBudget(turns, availableForHistory, modelFamily);
        const messages = [
          { role: "system", content: systemPrompt },
          ...trimmedTurns.map((t) => ({
            role: t.role,
            content: t.content
          }))
        ];
        this.logger.debug("context", `Built context (${modelFamily}): ${estimatedSystemTokens} system tokens, ${trimmedTurns.length}/${turns.length} turns, budget: ${budget}`);
        return messages;
      }
      /**
       * Load AGENTS.md and SOUL.md from the workspace root.
       */
      async loadIdentityFiles() {
        const fs16 = await import("node:fs/promises");
        const path17 = await import("node:path");
        const parts = [];
        for (const filename of ["AGENTS.md", "SOUL.md", "INSTRUCTIONS.md"]) {
          const filePath = path17.join(this.workspacePath, filename);
          try {
            const content = await fs16.readFile(filePath, "utf-8");
            parts.push(`# ${filename}

${content.trim()}`);
          } catch {
          }
        }
        return parts.length > 0 ? parts.join("\n\n---\n\n") : null;
      }
      /**
       * Trim turns from the beginning until they fit within the token budget.
       * Always keeps the most recent turns.
       */
      trimToTokenBudget(turns, maxTokens, modelFamily) {
        if (turns.length === 0)
          return [];
        let totalTokens = 0;
        const result = [];
        for (let i = turns.length - 1; i >= 0; i--) {
          const turnTokens = TokenCounter.countTurnTokens(turns[i], modelFamily);
          if (totalTokens + turnTokens > maxTokens && result.length > 0) {
            break;
          }
          totalTokens += turnTokens;
          result.unshift(turns[i]);
        }
        return result;
      }
    };
  }
});

// packages/gateway/dist/webhook-verify.js
import * as crypto11 from "node:crypto";
function verifyWebhook(platform, body, headers, secret) {
  const verifier = VERIFIERS[platform];
  if (!verifier)
    return false;
  return verifier(body, headers, secret);
}
var VERIFIERS;
var init_webhook_verify = __esm({
  "packages/gateway/dist/webhook-verify.js"() {
    "use strict";
    VERIFIERS = {
      // Discord: X-Signature-Ed25519 + X-Signature-Timestamp
      discord: (body, headers, publicKey) => {
        const signature = headers["x-signature-ed25519"];
        const timestamp = headers["x-signature-timestamp"];
        if (!signature || !timestamp)
          return false;
        try {
          const verified = crypto11.verify(null, Buffer.from(timestamp + body), publicKey, Buffer.from(signature, "hex"));
          return verified;
        } catch {
          return false;
        }
      },
      // Slack: X-Slack-Signature + X-Slack-Request-Timestamp
      slack: (body, headers, signingSecret) => {
        const signature = headers["x-slack-signature"];
        const timestamp = headers["x-slack-request-timestamp"];
        if (!signature || !timestamp)
          return false;
        const now = Math.floor(Date.now() / 1e3);
        if (Math.abs(now - parseInt(timestamp, 10)) > 300)
          return false;
        const sigBaseString = `v0:${timestamp}:${body}`;
        const computedSig = "v0=" + crypto11.createHmac("sha256", signingSecret).update(sigBaseString).digest("hex");
        const sigBuf = Buffer.from(signature);
        const compBuf = Buffer.from(computedSig);
        if (sigBuf.length !== compBuf.length)
          return false;
        return crypto11.timingSafeEqual(sigBuf, compBuf);
      },
      // Telegram: secret token in X-Telegram-Bot-Api-Secret-Token
      telegram: (_body, headers, secretToken) => {
        const token = headers["x-telegram-bot-api-secret-token"];
        return token === secretToken;
      },
      // LINE: X-Line-Signature
      line: (body, headers, channelSecret) => {
        const signature = headers["x-line-signature"];
        if (!signature)
          return false;
        const computed = crypto11.createHmac("sha256", channelSecret).update(body).digest("base64");
        return crypto11.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
      },
      // Feishu: timestamp + nonce + body + secret → SHA256
      feishu: (body, headers, secret) => {
        const timestamp = headers["x-lark-request-timestamp"] ?? headers["timestamp"];
        const nonce = headers["x-lark-request-nonce"] ?? headers["nonce"];
        const signature = headers["x-lark-signature"] ?? headers["signature"];
        if (!timestamp || !nonce || !signature)
          return false;
        const computed = crypto11.createHash("sha256").update(timestamp + nonce + secret + body).digest("hex");
        return crypto11.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
      },
      // Teams: HMAC-SHA256 of body with bot password
      teams: (body, headers, botPassword) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer "))
          return false;
        const token = authHeader.slice(7);
        try {
          const parts = token.split(".");
          if (parts.length !== 3)
            return false;
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
          return payload.serviceUrl?.includes("botframework.com");
        } catch {
          return false;
        }
      },
      // Google Chat: Bearer token — verify JWT claims (issuer + audience)
      googlechat: (_body, headers, projectNumber) => {
        const authHeader = headers["authorization"];
        if (!authHeader?.startsWith("Bearer "))
          return false;
        const token = authHeader.slice(7);
        try {
          const parts = token.split(".");
          if (parts.length !== 3)
            return false;
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
          if (payload.iss !== "chat@system.gserviceaccount.com")
            return false;
          if (projectNumber && payload.aud !== projectNumber)
            return false;
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3))
            return false;
          return true;
        } catch {
          return false;
        }
      },
      // Generic: HMAC-SHA256
      generic: (body, headers, secret) => {
        const signature = headers["x-hub-signature-256"] ?? headers["x-signature"];
        if (!signature)
          return false;
        const algo = signature.startsWith("sha256=") ? "sha256" : "sha256";
        const computed = crypto11.createHmac(algo, secret).update(body).digest("hex");
        const expected = signature.replace(/^sha256=/, "");
        try {
          return crypto11.timingSafeEqual(Buffer.from(computed), Buffer.from(expected));
        } catch {
          return false;
        }
      }
    };
  }
});

// packages/gateway/dist/utils.js
import * as http from "node:http";
function readBody(req) {
  return new Promise((resolve4, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => resolve4(body));
    req.on("error", reject);
  });
}
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
function redactConfig(config) {
  if (config === null || config === void 0)
    return config;
  if (typeof config === "string")
    return config;
  if (typeof config !== "object")
    return config;
  if (Array.isArray(config))
    return config.map(redactConfig);
  const result = {};
  for (const [key, value] of Object.entries(config)) {
    if (SENSITIVE_KEYS.has(key) && typeof value === "string" && value.length > 0) {
      result[key] = "***REDACTED***";
    } else if (typeof value === "object" && value !== null) {
      result[key] = redactConfig(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
function buildCorsHeaders(corsOrigins, requestOrigin) {
  let allowedOrigin;
  if (corsOrigins.length === 0) {
    allowedOrigin = "*";
  } else if (corsOrigins.includes("*")) {
    allowedOrigin = "*";
  } else if (corsOrigins.includes(requestOrigin)) {
    allowedOrigin = requestOrigin;
  } else {
    allowedOrigin = corsOrigins[0] ?? "*";
  }
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}
async function retryWithBackoff(fn, maxRetries = 3, baseDelayMs = 1e3) {
  let lastError = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1e3;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}
var SENSITIVE_KEYS;
var init_utils = __esm({
  "packages/gateway/dist/utils.js"() {
    "use strict";
    SENSITIVE_KEYS = /* @__PURE__ */ new Set([
      "token",
      "apiKey",
      "api_key",
      "secret",
      "password",
      "webhookSecret",
      "signingSecret",
      "botPassword",
      "apiToken"
    ]);
  }
});

// packages/gateway/dist/model-catalog.js
var model_catalog_exports = {};
__export(model_catalog_exports, {
  getAllModels: () => getAllModels,
  getModel: () => getModel,
  getModelsByProvider: () => getModelsByProvider,
  getModelsForProvider: () => getModelsForProvider,
  recommendModel: () => recommendModel
});
function getAllModels() {
  return [...CATALOG];
}
function getModelsForProvider(provider) {
  return CATALOG.filter((m) => m.provider === provider);
}
function getModel(modelId) {
  return CATALOG.find((m) => m.id === modelId);
}
function recommendModel(requirements) {
  return CATALOG.filter((m) => {
    if (requirements.needsVision && !m.supportsVision)
      return false;
    if (requirements.needsTools && !m.supportsTools)
      return false;
    if (requirements.minContext && m.contextWindow < requirements.minContext)
      return false;
    if (requirements.maxPricePer1M && m.pricing && m.pricing.inputPer1M > requirements.maxPricePer1M)
      return false;
    return true;
  }).sort((a, b) => (a.pricing?.inputPer1M ?? Infinity) - (b.pricing?.inputPer1M ?? Infinity))[0];
}
function getModelsByProvider() {
  const grouped = {};
  for (const model of CATALOG) {
    if (!grouped[model.provider])
      grouped[model.provider] = [];
    grouped[model.provider].push(model);
  }
  return grouped;
}
var CATALOG;
var init_model_catalog = __esm({
  "packages/gateway/dist/model-catalog.js"() {
    "use strict";
    CATALOG = [
      // OpenAI
      { id: "gpt-4.1", provider: "openai", displayName: "GPT-4.1", contextWindow: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2, outputPer1M: 8 }, releaseDate: "2025-04" },
      { id: "gpt-4.1-mini", provider: "openai", displayName: "GPT-4.1 Mini", contextWindow: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.4, outputPer1M: 1.6 }, releaseDate: "2025-04" },
      { id: "gpt-4.1-nano", provider: "openai", displayName: "GPT-4.1 Nano", contextWindow: 1047576, maxOutput: 32768, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.1, outputPer1M: 0.4 }, releaseDate: "2025-04" },
      { id: "gpt-4o", provider: "openai", displayName: "GPT-4o", contextWindow: 128e3, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2.5, outputPer1M: 10 } },
      { id: "gpt-4o-mini", provider: "openai", displayName: "GPT-4o Mini", contextWindow: 128e3, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.15, outputPer1M: 0.6 } },
      { id: "o3", provider: "openai", displayName: "o3", contextWindow: 2e5, maxOutput: 1e5, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 10, outputPer1M: 40 }, releaseDate: "2025-04" },
      { id: "o4-mini", provider: "openai", displayName: "o4-mini", contextWindow: 2e5, maxOutput: 1e5, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 1.1, outputPer1M: 4.4 }, releaseDate: "2025-04" },
      // Anthropic
      { id: "claude-opus-4-20250514", provider: "anthropic", displayName: "Claude Opus 4", contextWindow: 2e5, maxOutput: 32e3, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 15, outputPer1M: 75 }, releaseDate: "2025-05" },
      { id: "claude-sonnet-4-20250514", provider: "anthropic", displayName: "Claude Sonnet 4", contextWindow: 2e5, maxOutput: 64e3, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 3, outputPer1M: 15 }, releaseDate: "2025-05" },
      { id: "claude-haiku-4-5-20251001", provider: "anthropic", displayName: "Claude Haiku 4.5", contextWindow: 2e5, maxOutput: 8192, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.8, outputPer1M: 4 }, releaseDate: "2025-10" },
      // Google
      { id: "gemini-2.5-pro", provider: "gemini", displayName: "Gemini 2.5 Pro", contextWindow: 1e6, maxOutput: 65536, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 1.25, outputPer1M: 10 } },
      { id: "gemini-2.5-flash", provider: "gemini", displayName: "Gemini 2.5 Flash", contextWindow: 1e6, maxOutput: 65536, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.15, outputPer1M: 0.6 } },
      // DeepSeek
      { id: "deepseek-chat", provider: "deepseek", displayName: "DeepSeek V3", contextWindow: 64e3, maxOutput: 8192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.27, outputPer1M: 1.1 } },
      { id: "deepseek-reasoner", provider: "deepseek", displayName: "DeepSeek R1", contextWindow: 64e3, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: false, pricing: { inputPer1M: 0.55, outputPer1M: 2.19 } },
      // Groq
      { id: "llama-3.3-70b-versatile", provider: "groq", displayName: "Llama 3.3 70B", contextWindow: 128e3, maxOutput: 32768, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.59, outputPer1M: 0.79 } },
      { id: "llama-4-scout-17b-16e-instruct", provider: "groq", displayName: "Llama 4 Scout 17B", contextWindow: 131072, maxOutput: 8192, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 0.11, outputPer1M: 0.34 }, releaseDate: "2025-04" },
      // Mistral
      { id: "mistral-large-latest", provider: "mistral", displayName: "Mistral Large", contextWindow: 128e3, maxOutput: 8192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2, outputPer1M: 6 } },
      // Cohere
      { id: "command-a", provider: "cohere", displayName: "Command A", contextWindow: 256e3, maxOutput: 8192, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 2.5, outputPer1M: 10 }, releaseDate: "2025-03" },
      // xAI
      { id: "grok-3", provider: "xai", displayName: "Grok 3", contextWindow: 131072, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true, pricing: { inputPer1M: 3, outputPer1M: 15 } },
      // Perplexity
      { id: "sonar-pro", provider: "perplexity", displayName: "Sonar Pro", contextWindow: 2e5, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: false, pricing: { inputPer1M: 3, outputPer1M: 15 } },
      // Requesty (router — model list varies by user's enabled models)
      { id: "gpt-4o", provider: "requesty", displayName: "GPT-4o (via Requesty)", contextWindow: 128e3, maxOutput: 16384, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
      { id: "claude-sonnet-4-20250514", provider: "requesty", displayName: "Claude Sonnet 4 (via Requesty)", contextWindow: 2e5, maxOutput: 64e3, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
      // Hugging Face
      { id: "meta-llama/Llama-3.3-70B-Instruct", provider: "huggingface", displayName: "Llama 3.3 70B Instruct", contextWindow: 128e3, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
      { id: "Qwen/Qwen2.5-72B-Instruct", provider: "huggingface", displayName: "Qwen 2.5 72B Instruct", contextWindow: 131072, maxOutput: 8192, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
      { id: "mistralai/Mistral-7B-Instruct-v0.3", provider: "huggingface", displayName: "Mistral 7B Instruct", contextWindow: 32768, maxOutput: 4096, supportsVision: false, supportsTools: false, supportsStreaming: true, supportsJson: true },
      // Local
      { id: "any", provider: "ollama", displayName: "Ollama (Local)", contextWindow: 128e3, maxOutput: 4096, supportsVision: true, supportsTools: true, supportsStreaming: true, supportsJson: true },
      { id: "any", provider: "lmstudio", displayName: "LM Studio (Local)", contextWindow: 128e3, maxOutput: 4096, supportsVision: false, supportsTools: true, supportsStreaming: true, supportsJson: true }
    ];
  }
});

// packages/gateway/dist/http-handler.js
import * as http2 from "node:http";
import * as crypto12 from "node:crypto";
import { v4 as uuidv4 } from "uuid";
function generateApiToken() {
  return `mxclaw_${crypto12.randomBytes(32).toString("base64url")}`;
}
function verifyApiAuth(req, config) {
  const configuredToken = config.gateway.apiToken;
  if (!configuredToken)
    return true;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return false;
  const provided = authHeader.slice(7);
  try {
    return crypto12.timingSafeEqual(Buffer.from(provided), Buffer.from(configuredToken));
  } catch {
    return false;
  }
}
async function handleHttpRequest(ctx, req, res) {
  const corsOrigins = ctx.config.gateway.corsOrigins ?? ["*"];
  const origin = req.headers.origin ?? "";
  const cors = buildCorsHeaders(corsOrigins, origin);
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
  const rateCheck = ctx.rateLimiter.check(clientIp);
  if (!rateCheck.allowed) {
    res.writeHead(429, {
      ...cors,
      "Retry-After": "60",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil(Date.now() / 1e3) + 60)
    });
    res.end(JSON.stringify({ error: "Too many requests", remaining: rateCheck.remaining }));
    return;
  }
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  try {
    if (url.pathname === "/health") {
      return sendJson(res, cors, 200, { status: "ok", uptime: Date.now() - ctx.startTime, version: "0.2.0" });
    }
    if (url.pathname.startsWith(ctx.config.gateway.webhookPath)) {
      await handleWebhook(ctx, req, res, url, cors);
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      if (!verifyApiAuth(req, ctx.config)) {
        res.writeHead(401, { ...cors, "Content-Type": "application/json", "WWW-Authenticate": "Bearer" });
        res.end(JSON.stringify({ error: "Unauthorized \u2014 provide a valid Bearer token in the Authorization header" }));
        return;
      }
    }
    switch (url.pathname) {
      case "/status":
        return sendJson(res, cors, 200, await getGatewayStatus(ctx));
      case "/api/config":
        return await handleConfig(ctx, req, res, cors);
      case "/api/sessions":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return await handleListSessions(ctx, res, url, cors);
      case "/api/session/transcript":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return await handleTranscript(ctx, res, url, cors);
      case "/api/session/reset":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleSessionReset(ctx, req, res, cors);
      case "/api/approvals":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return sendJson(res, cors, 200, ctx.approvalManager.getPendingApprovals());
      case "/api/approval/resolve":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleApprovalResolve(ctx, req, res, cors);
      case "/api/pairing/generate":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handlePairingGenerate(req, res, cors);
      case "/api/pairing/validate":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handlePairingValidate(req, res, cors);
      case "/api/devices/pair":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleDevicePair(req, res, cors);
      case "/api/chat/send":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleChatSend(ctx, req, res, cors);
      case "/api/skills":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return handleListSkills(ctx, res, cors);
      case "/api/skills/toggle":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return await handleToggleSkill(ctx, req, res, cors);
      case "/api/models":
        if (req.method !== "GET")
          return sendMethodNotAllowed(res, cors, "GET");
        return handleListModels(res, cors);
      case "/api/token/generate":
        if (req.method !== "POST")
          return sendMethodNotAllowed(res, cors, "POST");
        return sendJson(res, cors, 200, { token: generateApiToken() });
      case "/api/memory":
        if (req.method === "GET")
          return await handleMemoryList(ctx, res, url, cors);
        if (req.method === "POST")
          return await handleMemoryStore(ctx, req, res, cors);
        return sendMethodNotAllowed(res, cors, "GET, POST");
      default:
        if (url.pathname.startsWith("/api/memory/")) {
          if (req.method === "GET")
            return await handleMemoryRecall(ctx, res, url, cors);
          if (req.method === "PUT")
            return await handleMemoryUpdate(ctx, req, res, cors);
          if (req.method === "DELETE")
            return await handleMemoryForget(ctx, res, url, cors);
          return sendMethodNotAllowed(res, cors, "GET, PUT, DELETE");
        }
        res.writeHead(404, cors);
        res.end(JSON.stringify({ error: "Not found" }));
    }
  } catch (err) {
    ctx.logger.error("http", "Request error", err);
    res.writeHead(500, cors);
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
async function handleConfig(ctx, req, res, cors) {
  if (req.method === "GET") {
    sendJson(res, cors, 200, redactConfig(ctx.config));
  } else if (req.method === "PUT") {
    const body = await readBody(req);
    try {
      const parsed = JSON.parse(body);
      const validated = MxClawConfigSchema.parse({ ...ctx.config, ...parsed });
      Object.assign(ctx.config, validated);
      sendJson(res, cors, 200, { ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid config";
      sendJson(res, cors, 400, { error: msg });
    }
  } else {
    sendMethodNotAllowed(res, cors, "GET, PUT");
  }
}
async function handleListSessions(ctx, res, url, cors) {
  const agentId = url.searchParams.get("agentId") ?? ctx.config.defaultAgentId ?? "default";
  const sessions = await ctx.storage.listSessions(agentId);
  sendJson(res, cors, 200, sessions);
}
async function handleTranscript(ctx, res, url, cors) {
  const agentId = url.searchParams.get("agentId") ?? "default";
  const sessionKey = url.searchParams.get("sessionKey");
  if (!sessionKey) {
    sendJson(res, cors, 400, { error: "sessionKey required" });
    return;
  }
  const turns = await ctx.storage.getSessionTranscript(agentId, sessionKey);
  sendJson(res, cors, 200, turns);
}
async function handleSessionReset(ctx, req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { agentId, sessionKey } = parsed;
  if (!sessionKey)
    return sendJson(res, cors, 400, { error: "sessionKey required" });
  await ctx.storage.deleteSession(agentId ?? "default", sessionKey);
  sendJson(res, cors, 200, { ok: true });
}
async function handleApprovalResolve(ctx, req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { approvalId, approved } = parsed;
  if (!approvalId)
    return sendJson(res, cors, 400, { error: "approvalId required" });
  const result = ctx.approvalManager.resolveApproval(approvalId, approved ?? false);
  sendJson(res, cors, 200, result ?? { error: "Not found or already resolved" });
}
async function handlePairingGenerate(req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { channelId, senderId } = parsed;
  if (!channelId || !senderId)
    return sendJson(res, cors, 400, { error: "channelId and senderId required" });
  const pairing = generatePairingCode(channelId, senderId);
  sendJson(res, cors, 200, pairing);
}
async function handlePairingValidate(req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { code } = parsed;
  if (!code)
    return sendJson(res, cors, 400, { error: "code required" });
  const result = validatePairingCode(code);
  sendJson(res, cors, 200, result ? { valid: true, ...result } : { valid: false });
}
async function handleDevicePair(req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { deviceId, deviceName } = parsed;
  if (!deviceId)
    return sendJson(res, cors, 400, { error: "deviceId required" });
  const session = pairDevice(deviceId, deviceName ?? "unknown");
  sendJson(res, cors, 200, { deviceId: session.deviceId, token: session.token });
}
async function handleChatSend(ctx, req, res, cors) {
  const body = await readBody(req);
  let envelope;
  try {
    envelope = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  envelope.id = envelope.id ?? uuidv4();
  envelope.timestamp = envelope.timestamp ?? Date.now();
  await ctx.handleInboundMessage(envelope);
  sendJson(res, cors, 202, { accepted: true, messageId: envelope.id });
}
function handleListSkills(ctx, res, cors) {
  const skills = ctx.skillLoader?.getAllSkills() ?? [];
  sendJson(res, cors, 200, skills.map((s) => ({
    name: s.name,
    description: s.description,
    triggers: s.triggers,
    tools: s.tools,
    enabled: s.enabled,
    filePath: s.filePath
  })));
}
async function handleToggleSkill(ctx, req, res, cors) {
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON body" });
  }
  const { name, enabled } = parsed;
  if (!name)
    return sendJson(res, cors, 400, { error: "name required" });
  const skill = ctx.skillLoader?.getSkill(name);
  if (!skill)
    return sendJson(res, cors, 404, { error: `Skill "${name}" not found` });
  skill.enabled = enabled ?? !skill.enabled;
  sendJson(res, cors, 200, { ok: true, name, enabled: skill.enabled });
}
function handleListModels(res, cors) {
  Promise.resolve().then(() => (init_model_catalog(), model_catalog_exports)).then(({ getAllModels: getAllModels2 }) => {
    sendJson(res, cors, 200, getAllModels2());
  }).catch(() => {
    sendJson(res, cors, 200, []);
  });
}
async function handleWebhook(ctx, req, res, url, cors) {
  const subPath = url.pathname.slice(ctx.config.gateway.webhookPath.length).replace(/^\//, "");
  const body = await readBody(req);
  ctx.logger.debug("webhook", `Incoming webhook: ${subPath}`);
  for (const [channelId, channelConfig] of Object.entries(ctx.config.channels)) {
    const webhookSecret = channelConfig.credentials?.webhookSecret;
    if (webhookSecret && subPath.includes(channelConfig.type)) {
      const headers = {};
      for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === "string")
          headers[k] = v;
      }
      const platform = channelConfig.type;
      if (!verifyWebhook(platform, body, headers, webhookSecret)) {
        ctx.logger.warn("webhook", `Signature verification failed for ${channelId}`);
        res.writeHead(401, { ...cors, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid webhook signature" }));
        return;
      }
    }
    const plugin = getChannelPlugin(ctx.registry, channelConfig.type);
    if (plugin?.handleCommand) {
      await plugin.handleCommand(channelId, "webhook", [subPath, body]);
    }
  }
  sendJson(res, cors, 200, { ok: true });
}
async function getGatewayStatus(ctx) {
  const channelStatuses = [];
  for (const [channelId, channelConfig] of Object.entries(ctx.config.channels)) {
    const plugin = getChannelPlugin(ctx.registry, channelConfig.type);
    let status;
    if (plugin) {
      try {
        status = await plugin.getStatus(channelId);
      } catch {
        status = {
          id: channelId,
          type: channelConfig.type,
          connected: false,
          error: "Failed to get status",
          messageCount: ctx.channelMessageCounts.get(channelId) ?? 0,
          queueSize: ctx.outboundQueues.get(channelId)?.length ?? 0
        };
      }
    } else {
      status = {
        id: channelId,
        type: channelConfig.type,
        connected: false,
        error: "No plugin loaded",
        messageCount: 0,
        queueSize: 0
      };
    }
    channelStatuses.push(status);
  }
  const memUsage = process.memoryUsage();
  return {
    uptime: Date.now() - ctx.startTime,
    channels: channelStatuses,
    providers: Array.from(ctx.providerStatuses.values()),
    activeSessions: 0,
    deviceCount: 0,
    // Will be injected by the main gateway
    pluginErrors: ctx.registry.pluginErrors,
    memoryUsage: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss
    }
  };
}
async function handleMemoryList(ctx, res, url, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const type = url.searchParams.get("type");
  const entries = await ctx.memory.list(type ?? void 0);
  sendJson(res, cors, 200, entries);
}
async function handleMemoryStore(ctx, req, res, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON" });
  }
  if (!parsed.content)
    return sendJson(res, cors, 400, { error: "content required" });
  const entry = await ctx.memory.store({
    content: parsed.content,
    type: parsed.type ?? "general",
    tags: parsed.tags ?? [],
    source: parsed.source
  });
  sendJson(res, cors, 200, entry);
}
async function handleMemoryRecall(ctx, res, url, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const id = url.pathname.split("/").pop();
  if (!id)
    return sendJson(res, cors, 400, { error: "id required" });
  const entry = await ctx.memory.recall(id);
  if (!entry)
    return sendJson(res, cors, 404, { error: "Memory not found" });
  sendJson(res, cors, 200, entry);
}
async function handleMemoryUpdate(ctx, req, res, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const id = req.url?.split("/").pop();
  if (!id)
    return sendJson(res, cors, 400, { error: "id required" });
  const body = await readBody(req);
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendJson(res, cors, 400, { error: "Invalid JSON" });
  }
  const existing = await ctx.memory.recall(id);
  if (!existing)
    return sendJson(res, cors, 404, { error: "Memory not found" });
  const updated = await ctx.memory.store({
    content: parsed.content ?? existing.content,
    type: parsed.type ?? existing.type,
    tags: parsed.tags ?? existing.tags
  });
  sendJson(res, cors, 200, updated);
}
async function handleMemoryForget(ctx, res, url, cors) {
  if (!ctx.memory)
    return sendJson(res, cors, 501, { error: "Memory system not available" });
  const id = url.pathname.split("/").pop();
  if (!id)
    return sendJson(res, cors, 400, { error: "id required" });
  const ok = await ctx.memory.forget(id);
  if (!ok)
    return sendJson(res, cors, 404, { error: "Memory not found" });
  sendJson(res, cors, 200, { ok: true });
}
function sendJson(res, cors, status, body) {
  res.writeHead(status, { ...cors, "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}
function sendMethodNotAllowed(res, cors, allowed) {
  res.writeHead(405, { ...cors, "Allow": allowed, "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `Method not allowed. Allowed: ${allowed}` }));
}
var init_http_handler = __esm({
  "packages/gateway/dist/http-handler.js"() {
    "use strict";
    init_dist();
    init_dist2();
    init_rate_limiter();
    init_webhook_verify();
    init_dist4();
    init_dist5();
    init_utils();
  }
});

// packages/gateway/dist/ws-handler.js
import { WebSocket as WebSocket2 } from "ws";
import { v4 as uuidv42 } from "uuid";
function isWsRateLimited(client, maxPerSecond) {
  const now = Date.now();
  client.msgTimestamps = client.msgTimestamps.filter((t) => now - t < 1e3);
  if (client.msgTimestamps.length >= maxPerSecond) {
    return true;
  }
  client.msgTimestamps.push(now);
  return false;
}
function handleWebSocketConnection(deps, ws) {
  let deviceId = null;
  let authenticated = false;
  const clientId = uuidv42();
  const maxMsgsPerSecond = deps.wsRateLimit || 20;
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket2.OPEN) {
      ws.ping();
    }
  }, deps.wsHeartbeatIntervalMs);
  const authTimeout = setTimeout(() => {
    if (!authenticated) {
      sendWs(ws, { type: "auth:error", error: "Authentication timeout \u2014 must authenticate within 10 seconds" });
      ws.close(4001, "Auth timeout");
    }
  }, 1e4);
  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "auth" && !authenticated) {
        const [devId, token] = msg.token.split(":");
        if (devId && token && validateDeviceToken(devId, token)) {
          authenticated = true;
          deviceId = devId;
          clearTimeout(authTimeout);
          deps.wsClients.set(clientId, { ws, deviceId: devId, clientId, msgTimestamps: [] });
          rotateDeviceToken(devId);
          sendWs(ws, { type: "auth:ok", deviceId: devId });
          deps.logger.info("ws", `Device authenticated: ${devId}`);
        } else {
          sendWs(ws, { type: "auth:error", error: "Invalid token" });
        }
        return;
      }
      if (!authenticated) {
        sendWs(ws, { type: "auth:error", error: "Not authenticated" });
        return;
      }
      const client = deps.wsClients.get(clientId);
      if (client && isWsRateLimited(client, maxMsgsPerSecond)) {
        sendWs(ws, { type: "error", message: "Rate limited \u2014 too many messages", code: "RATE_LIMITED" });
        return;
      }
      switch (msg.type) {
        case "chat:send": {
          const envelope = msg.envelope;
          if (envelope.sender.id !== deviceId && envelope.sender.id !== "owner") {
            sendWs(ws, { type: "error", message: "Sender ID mismatch \u2014 you cannot impersonate other users", code: "SENDER_MISMATCH" });
            break;
          }
          await deps.handleInboundMessage(envelope);
          break;
        }
        case "chat:approve":
          deps.approvalManager.resolveApproval(msg.approvalId, msg.approved);
          break;
        case "canvas:event":
          broadcastWs(deps.wsClients, { type: "canvas:update", json: msg.event });
          break;
        case "voice:start":
          try {
            const sessionId = await deps.voiceManager.startVoiceSession(deps.voiceDefaultProvider);
            sendWs(ws, { type: "voice:token", token: sessionId });
          } catch (err) {
            sendWs(ws, {
              type: "voice:error",
              error: err instanceof Error ? err.message : "Voice start failed"
            });
          }
          break;
        case "voice:stop":
          break;
        case "voice:audio":
          break;
        case "presence:update":
          broadcastWs(deps.wsClients, { type: "presence:update", deviceId, status: msg.status }, clientId);
          break;
        case "ping":
          sendWs(ws, { type: "pong" });
          break;
      }
    } catch (err) {
      deps.logger.error("ws", "Message handling error", err);
      sendWs(ws, { type: "error", message: "Invalid message", code: "PARSE_ERROR" });
    }
  });
  ws.on("close", (code) => {
    clearInterval(heartbeatInterval);
    clearTimeout(authTimeout);
    deps.wsClients.delete(clientId);
    if (deviceId) {
      broadcastWs(deps.wsClients, { type: "presence:update", deviceId, status: "offline" });
    }
    deps.logger.debug("ws", `Client disconnected: ${clientId} (code: ${code})`);
  });
  ws.on("error", (err) => {
    deps.logger.error("ws", "WebSocket error", err);
  });
}
function sendWs(ws, msg) {
  if (ws.readyState === WebSocket2.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
function broadcastWs(clients, msg, excludeClientId) {
  for (const [id, client] of clients) {
    if (id !== excludeClientId) {
      sendWs(client.ws, msg);
    }
  }
}
var init_ws_handler = __esm({
  "packages/gateway/dist/ws-handler.js"() {
    "use strict";
    init_dist4();
  }
});

// packages/gateway/dist/agent-runner.js
async function runCompletion(deps, request, agentConfig) {
  const providers2 = [
    agentConfig.model,
    ...agentConfig.fallbackChain ?? []
  ];
  let lastError = null;
  for (const providerRef of providers2) {
    const plugin = getProviderPlugin(deps.registry, providerRef.provider);
    if (!plugin) {
      deps.logger.warn("llm", `Provider plugin not found: ${providerRef.provider}`);
      continue;
    }
    try {
      const response = await retryWithBackoff(async () => {
        return plugin.complete({
          ...request,
          model: providerRef.model,
          temperature: providerRef.temperature,
          maxTokens: providerRef.maxTokens
        });
      });
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: true,
        lastCheckAt: Date.now()
      });
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      deps.logger.warn("llm", `Provider ${providerRef.provider}/${providerRef.model} failed: ${lastError.message}`);
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: false,
        lastCheckAt: Date.now(),
        error: lastError.message
      });
    }
  }
  throw lastError ?? new Error("All providers in fallback chain failed");
}
async function* runCompletionStream(deps, request, agentConfig) {
  const providers2 = [
    agentConfig.model,
    ...agentConfig.fallbackChain ?? []
  ];
  let lastError = null;
  for (const providerRef of providers2) {
    const plugin = getProviderPlugin(deps.registry, providerRef.provider);
    if (!plugin)
      continue;
    try {
      const stream = plugin.completeStream({
        ...request,
        model: providerRef.model,
        temperature: providerRef.temperature,
        maxTokens: providerRef.maxTokens
      });
      for await (const chunk of stream) {
        yield chunk;
      }
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: true,
        lastCheckAt: Date.now()
      });
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      deps.logger.warn("llm", `Streaming provider ${providerRef.provider}/${providerRef.model} failed: ${lastError.message}`);
      deps.providerStatuses.set(`${providerRef.provider}:${providerRef.model}`, {
        provider: providerRef.provider,
        model: providerRef.model,
        available: false,
        lastCheckAt: Date.now(),
        error: lastError.message
      });
    }
  }
  throw lastError ?? new Error("All providers in fallback chain failed");
}
var init_agent_runner = __esm({
  "packages/gateway/dist/agent-runner.js"() {
    "use strict";
    init_dist2();
    init_utils();
  }
});

// packages/gateway/dist/tool-executor.js
async function executeToolCalls(deps, toolCalls, agentConfig, sessionKey, senderId) {
  const results = [];
  for (const tc of toolCalls) {
    const tool = getTool(tc.name);
    if (!tool) {
      results.push({ id: tc.id, name: tc.name, result: "", error: `Unknown tool: ${tc.name}` });
      continue;
    }
    const ownerId = deps.config.ownerId ?? deps.config.devices?.find((d) => d.paired)?.id ?? "owner";
    if (requiresApproval(tc.name, agentConfig, senderId, ownerId)) {
      const approval = deps.approvalManager.requestApproval(tc.name, tc.arguments, agentConfig.id, sessionKey);
      deps.broadcastWs({
        type: "approval:required",
        approvalId: approval.id,
        tool: tc.name,
        args: tc.arguments,
        agentId: agentConfig.id
      });
      const resolved = await waitForApproval(deps.approvalManager, approval.id, 6e4);
      if (!resolved || resolved.status !== "approved") {
        results.push({
          id: tc.id,
          name: tc.name,
          result: "",
          error: resolved?.status === "denied" ? "User denied approval" : "Approval timed out"
        });
        continue;
      }
    }
    try {
      const workspacePath = getWorkspacePath(deps.config);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 3e4);
      const toolResult = await tool.execute(tc.arguments, {
        agentId: agentConfig.id,
        sessionKey,
        workspacePath,
        sandbox: agentConfig.sandbox,
        signal: abortController.signal
      });
      clearTimeout(timeoutId);
      results.push({
        id: tc.id,
        name: tc.name,
        result: toolResult.output,
        error: toolResult.error
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      results.push({ id: tc.id, name: tc.name, result: "", error: errorMsg });
    }
  }
  return results;
}
function waitForApproval(manager, approvalId, timeoutMs) {
  return new Promise((resolve4) => {
    const startTime = Date.now();
    const check = () => {
      const approval = manager.getApproval(approvalId);
      if (!approval || approval.status !== "pending") {
        resolve4(approval ?? null);
        return;
      }
      if (Date.now() - startTime > timeoutMs) {
        manager.resolveApproval(approvalId, false);
        resolve4(null);
        return;
      }
      setTimeout(check, 500);
    };
    check();
  });
}
var init_tool_executor = __esm({
  "packages/gateway/dist/tool-executor.js"() {
    "use strict";
    init_dist();
    init_dist5();
    init_dist4();
  }
});

// packages/gateway/dist/session-manager.js
import { v4 as uuidv43 } from "uuid";
var SessionManager;
var init_session_manager = __esm({
  "packages/gateway/dist/session-manager.js"() {
    "use strict";
    init_dist3();
    SessionManager = class {
      storage;
      logger;
      activeSessions = /* @__PURE__ */ new Map();
      compactionLocks = /* @__PURE__ */ new Set();
      // Tracks sessions currently undergoing compaction
      constructor(storage, logger) {
        this.storage = storage;
        this.logger = logger;
      }
      // ── Session Lifecycle ─────────────────────────────────────────────
      /**
       * Get or create a session for the given channel/sender/agent triple.
       */
      async getOrCreate(channelId, senderId, agentId, conversationId) {
        const sessionKey = deriveSessionKey(channelId, senderId, agentId);
        if (this.activeSessions.has(sessionKey)) {
          return this.activeSessions.get(sessionKey);
        }
        let manifest = await this.storage.getSessionManifest(agentId, sessionKey);
        if (!manifest) {
          manifest = {
            sessionKey,
            agentId,
            channelId,
            senderId,
            conversationId,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            turnCount: 0,
            compactionPoints: []
          };
          await this.storage.upsertSessionManifest(manifest);
          this.logger.debug("session", `Created new session: ${sessionKey}`);
        }
        const turns = await this.storage.getSessionTranscript(agentId, sessionKey);
        const session = {
          sessionKey,
          agentId,
          channelId,
          senderId,
          manifest,
          turns
        };
        this.activeSessions.set(sessionKey, session);
        return session;
      }
      /**
       * Spawn a new isolated session for a sub-agent task.
       * Returns the new session key.
       */
      async spawnSession(parentSessionKey, targetAgentId, initialMessage, context) {
        const spawnId = uuidv43().slice(0, 8);
        const sessionKey = `spawn:${targetAgentId}:${spawnId}`;
        const manifest = {
          sessionKey,
          agentId: targetAgentId,
          channelId: "internal",
          senderId: `session:${parentSessionKey}`,
          conversationId: `spawn-${spawnId}`,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          turnCount: 0,
          compactionPoints: []
        };
        await this.storage.upsertSessionManifest(manifest);
        const userTurn = {
          role: "user",
          content: initialMessage,
          timestamp: Date.now()
        };
        await this.storage.appendTurn(targetAgentId, sessionKey, userTurn);
        if (context && Object.keys(context).length > 0) {
          const contextTurn = {
            role: "system",
            content: `Context from parent session: ${JSON.stringify(context)}`,
            timestamp: Date.now()
          };
          await this.storage.appendTurn(targetAgentId, sessionKey, contextTurn);
        }
        this.logger.info("session", `Spawned session ${sessionKey} from parent ${parentSessionKey}`);
        return {
          sessionKey,
          agentId: targetAgentId,
          parentSessionKey,
          manifest
        };
      }
      /**
       * Send a message to an existing session (cross-session communication).
       */
      async sendToSession(targetSessionKey, targetAgentId, message) {
        const turn = {
          role: "user",
          content: message,
          timestamp: Date.now()
        };
        await this.storage.appendTurn(targetAgentId, targetSessionKey, turn);
        this.logger.debug("session", `Sent message to session ${targetSessionKey}`);
      }
      /**
       * List all sessions for an agent.
       */
      async listSessions(agentId) {
        return this.storage.listSessions(agentId);
      }
      /**
       * Get the full transcript for a session.
       */
      async getTranscript(agentId, sessionKey) {
        return this.storage.getSessionTranscript(agentId, sessionKey);
      }
      /**
       * Reset (delete) a session.
       */
      async resetSession(agentId, sessionKey) {
        await this.storage.deleteSession(agentId, sessionKey);
        this.activeSessions.delete(sessionKey);
        this.logger.info("session", `Session reset: ${sessionKey}`);
      }
      /**
       * Append a turn to a session and update the manifest.
       */
      async appendTurn(agentId, sessionKey, turn) {
        await this.storage.appendTurn(agentId, sessionKey, turn);
        const session = this.activeSessions.get(sessionKey);
        if (session) {
          session.turns.push(turn);
          session.manifest.lastActiveAt = Date.now();
          session.manifest.turnCount = session.turns.length;
          await this.storage.upsertSessionManifest(session.manifest);
        }
      }
      /**
       * Run compaction if the session exceeds the threshold.
       */
      /**
       * Run compaction if the session exceeds the threshold.
       * Safe from concurrent write race conditions.
       */
      async maybeCompact(agentId, sessionKey, threshold, summarizer) {
        const session = this.activeSessions.get(sessionKey);
        if (!session || session.turns.length < threshold) {
          return session?.turns ?? [];
        }
        if (this.compactionLocks.has(sessionKey)) {
          this.logger.debug("session", `Compaction already in progress for session ${sessionKey}, skipping`);
          return session.turns;
        }
        this.compactionLocks.add(sessionKey);
        try {
          this.logger.debug("session", `Compacting session ${sessionKey} (${session.turns.length} turns)`);
          const snapshotLength = session.turns.length;
          const olderTurnsCount = Math.floor(threshold / 2);
          const olderTurns = session.turns.slice(0, -olderTurnsCount);
          const recentTurns = session.turns.slice(-olderTurnsCount, snapshotLength);
          const summary = await summarizer(olderTurns);
          const summaryTurn = {
            role: "system",
            content: `[SESSION COMPACTION] Previous conversation summary:
${summary}`,
            timestamp: Date.now()
          };
          const concurrentTurns = session.turns.slice(snapshotLength);
          const compacted = [summaryTurn, ...recentTurns, ...concurrentTurns];
          await this.storage.rewriteSession(agentId, sessionKey, compacted);
          session.turns = compacted;
          return compacted;
        } catch (err) {
          this.logger.error("session", `Compaction failed for session ${sessionKey}`, err);
          return session.turns;
        } finally {
          this.compactionLocks.delete(sessionKey);
        }
      }
      /**
       * Get the count of currently tracked sessions.
       */
      get activeCount() {
        return this.activeSessions.size;
      }
    };
  }
});

// packages/gateway/dist/index.js
var dist_exports2 = {};
__export(dist_exports2, {
  MxClawGateway: () => MxClawGateway,
  SessionManager: () => SessionManager
});
import * as http3 from "node:http";
import * as path14 from "node:path";
import { WebSocketServer, WebSocket as WebSocket3 } from "ws";
import { v4 as uuidv44 } from "uuid";
var MxClawGateway;
var init_dist10 = __esm({
  "packages/gateway/dist/index.js"() {
    "use strict";
    init_dist();
    init_dist2();
    init_rate_limiter();
    init_dist3();
    init_dist4();
    init_secrets();
    init_dist5();
    init_dist6();
    init_dist7();
    init_dist8();
    init_dist9();
    init_context_engine();
    init_http_handler();
    init_ws_handler();
    init_agent_runner();
    init_tool_executor();
    init_session_manager();
    init_utils();
    init_session_manager();
    MxClawGateway = class {
      config;
      registry = createPluginRegistry();
      storage;
      logger;
      approvalManager = new ApprovalManager();
      voiceManager = new VoiceManager();
      sessionManager;
      server;
      wss;
      wsClients = /* @__PURE__ */ new Map();
      outboundQueues = /* @__PURE__ */ new Map();
      startTime = Date.now();
      configWatcherDispose;
      channelMessageCounts = /* @__PURE__ */ new Map();
      providerStatuses = /* @__PURE__ */ new Map();
      rateLimiter = new IPRateLimiter();
      skillLoader;
      contextEngine;
      secretsManager;
      memory;
      constructor(configPath) {
        this.config = loadConfig(configPath);
      }
      // ── Lifecycle ─────────────────────────────────────────────────────
      async start() {
        this.logger = createLogger(this.config.logging);
        this.logger.info("gateway", "Starting mxclaw Gateway...");
        if (this.config.storage.type === "sqlite") {
          this.storage = new SqliteStorageAdapter(this.config);
        } else {
          this.storage = new JsonlStorageAdapter(this.config);
        }
        await this.storage.initialize();
        try {
          this.memory = new InMemoryMemoryAdapter(path14.join(getWorkspacePath(this.config), "memory.jsonl"));
          await this.memory.load();
          registerMemoryAdapter(this.memory);
          this.logger.info("gateway", `Memory loaded (${(await this.memory.stats()).total} entries)`);
        } catch (err) {
          this.logger.warn("gateway", `Memory init skipped: ${err instanceof Error ? err.message : err}`);
        }
        try {
          this.secretsManager = new SecretsManager(getWorkspacePath(this.config));
          await this.secretsManager.load();
          this.resolveConfigSecrets();
          this.logger.info("gateway", `Secrets vault loaded (${this.secretsManager.listKeys().length} keys)`);
        } catch (err) {
          this.logger.warn("gateway", `Secrets vault skipped: ${err instanceof Error ? err.message : err}`);
        }
        this.sessionManager = new SessionManager(this.storage, this.logger);
        await loadPlugins(this.config, this.registry);
        this.logger.info("gateway", `Loaded ${this.registry.channels.size} channels, ${this.registry.providers.size} providers, ${this.registry.voices.size} voices`);
        for (const [name, voice] of this.registry.voices) {
          this.voiceManager.register(voice);
          this.logger.debug("gateway", `Registered voice plugin: ${name}`);
        }
        this.contextEngine = new ContextEngine(this.logger, getWorkspacePath(this.config));
        try {
          this.skillLoader = new SkillLoader(getWorkspacePath(this.config), this.logger);
          await this.skillLoader.loadAll();
          const loaded = this.skillLoader.getAllSkills();
          this.logger.info("gateway", `Loaded ${loaded.length} skills: ${loaded.map((s) => s.name).join(", ") || "(none)"}`);
        } catch (err) {
          this.logger.warn("gateway", `Skill loading skipped: ${err instanceof Error ? err.message : err}`);
        }
        await this.startChannels();
        await this.startServer();
        this.configWatcherDispose = watchConfig((newConfig) => {
          this.logger.info("gateway", "Config hot-reloaded");
          this.config = newConfig;
          this.startChannels().catch((err) => this.logger.error("gateway", "Failed to reload channels", err));
        });
        const shutdownHandler = async () => {
          this.logger.info("gateway", "Received shutdown signal");
          await this.stop();
          process.exit(0);
        };
        process.on("SIGTERM", shutdownHandler);
        process.on("SIGINT", shutdownHandler);
        this.logger.info("gateway", `Gateway listening on ${this.config.gateway.host}:${this.config.gateway.port}`);
      }
      async stop() {
        this.logger.info("gateway", "Shutting down...");
        this.configWatcherDispose?.();
        for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
          const plugin = getChannelPlugin(this.registry, channelConfig.type);
          if (plugin) {
            await plugin.stopChannel(channelId).catch(() => {
            });
          }
        }
        for (const [, client] of this.wsClients) {
          client.ws.close(1001, "Server shutting down");
        }
        this.wss?.close();
        this.server?.close();
        await this.storage.close();
        this.logger.info("gateway", "Gateway stopped");
      }
      // ── Channels ──────────────────────────────────────────────────────
      async startChannels() {
        for (const [channelId, channelConfig] of Object.entries(this.config.channels)) {
          if (!channelConfig.enabled)
            continue;
          const plugin = getChannelPlugin(this.registry, channelConfig.type);
          if (!plugin) {
            this.logger.warn("gateway", `No plugin for channel type "${channelConfig.type}" (${channelId})`);
            this.registry.pluginErrors.push({
              plugin: channelConfig.type,
              error: `No plugin registered for channel type`
            });
            continue;
          }
          try {
            await plugin.setupChannel(channelConfig);
            await plugin.startChannel(channelConfig, async (envelope) => {
              await this.handleInboundMessage(envelope);
            });
            this.channelMessageCounts.set(channelId, 0);
            this.logger.info("gateway", `Channel started: ${channelId} (${channelConfig.type})`);
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("gateway", `Failed to start channel ${channelId}: ${errorMsg}`);
            this.registry.pluginErrors.push({ plugin: channelConfig.type, error: errorMsg });
          }
        }
      }
      // ── Server ────────────────────────────────────────────────────────
      async startServer() {
        const { host, port } = this.config.gateway;
        this.server = http3.createServer((req, res) => {
          const ctx = this.buildContext();
          handleHttpRequest(ctx, req, res);
        });
        this.wss = new WebSocketServer({ server: this.server });
        this.wss.on("connection", (ws, _req) => {
          handleWebSocketConnection({
            logger: this.logger,
            approvalManager: this.approvalManager,
            voiceManager: this.voiceManager,
            wsClients: this.wsClients,
            wsHeartbeatIntervalMs: this.config.gateway.wsHeartbeatIntervalMs,
            voiceDefaultProvider: this.config.voice.defaultProvider,
            handleInboundMessage: (envelope) => this.handleInboundMessage(envelope),
            wsRateLimit: 20
          }, ws);
        });
        return new Promise((resolve4) => {
          this.server.listen(port, host, () => resolve4());
        });
      }
      // ── Message Routing Engine ────────────────────────────────────────
      async handleInboundMessage(envelope) {
        this.logger.debug("router", `Message from ${envelope.sender.id} on ${envelope.channel}`);
        const count = this.channelMessageCounts.get(envelope.channel) ?? 0;
        this.channelMessageCounts.set(envelope.channel, count + 1);
        const channelConfig = this.config.channels[envelope.channel];
        if (!channelConfig) {
          this.logger.warn("router", `Unknown channel: ${envelope.channel}`);
          return;
        }
        if (!isSenderAllowed(envelope, channelConfig)) {
          if (channelConfig.pairingEnabled) {
            const pairing = generatePairingCode(envelope.channel, envelope.sender.id);
            this.logger.info("security", `Pairing code generated for ${envelope.sender.id}: ${pairing.code}`);
            const plugin = getChannelPlugin(this.registry, channelConfig.type);
            if (plugin) {
              await plugin.sendMessage(envelope.channel, {
                conversationId: envelope.conversationId,
                metadata: {},
                isStreaming: false,
                content: [{
                  type: "text",
                  text: `\u{1F510} New sender detected. Pairing code: **${pairing.code}**
Use this code in the control UI to approve this sender. Expires in 5 minutes.`
                }]
              });
            }
          }
          return;
        }
        const agentId = this.resolveAgentBinding(envelope);
        const agentConfig = this.config.agents[agentId];
        if (!agentConfig) {
          this.logger.warn("router", `No agent config for "${agentId}"`);
          return;
        }
        if (!shouldRespondToMessage(envelope, agentConfig, channelConfig)) {
          this.logger.debug("router", `Mention gating: skipping message from ${envelope.sender.id}`);
          return;
        }
        const sessionKey = deriveSessionKey(envelope.channel, envelope.sender.id, agentId);
        await this.processMessage(envelope, agentConfig, channelConfig, sessionKey);
      }
      resolveAgentBinding(envelope) {
        const bindings = this.config.bindings ?? [];
        const exactMatch = bindings.find((b) => b.channelId === envelope.channel && b.senderId === envelope.sender.id);
        if (exactMatch)
          return exactMatch.agentId;
        const channelMatch = bindings.find((b) => b.channelId === envelope.channel && !b.senderId);
        if (channelMatch)
          return channelMatch.agentId;
        return this.config.defaultAgentId ?? "default";
      }
      // ── Message Processing Pipeline ───────────────────────────────────
      async processMessage(envelope, agentConfig, channelConfig, sessionKey) {
        const agentId = agentConfig.id;
        const channelPlugin = getChannelPlugin(this.registry, channelConfig.type);
        const session = await this.sessionManager.getOrCreate(envelope.channel, envelope.sender.id, agentId, envelope.conversationId);
        let turns = session.turns;
        if (turns.length >= agentConfig.compactionThreshold) {
          turns = await this.sessionManager.maybeCompact(agentId, sessionKey, agentConfig.compactionThreshold, async (olderTurns) => {
            const summaryRequest = {
              model: agentConfig.model.model,
              messages: [
                { role: "system", content: "Summarize the following conversation concisely, preserving key facts, decisions, and context." },
                { role: "user", content: JSON.stringify(olderTurns.map((t) => ({ role: t.role, content: t.content }))) }
              ],
              maxTokens: 500
            };
            try {
              const deps = { registry: this.registry, logger: this.logger, providerStatuses: this.providerStatuses };
              const response = await runCompletion(deps, summaryRequest, agentConfig);
              return response.content;
            } catch {
              return "Previous conversation summary unavailable.";
            }
          });
        }
        const userText = envelope.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
        const userTurn = { role: "user", content: userText, timestamp: Date.now() };
        await this.sessionManager.appendTurn(agentId, sessionKey, userTurn);
        turns.push(userTurn);
        let systemPrompt = agentConfig.systemPrompt ?? agentConfig.model.systemPrompt ?? "You are mxclaw, a helpful AI assistant. You have access to tools for executing commands, reading/writing files, and more. Be concise and helpful.";
        let messages;
        if (this.contextEngine) {
          messages = await this.contextEngine.buildContext({
            agentConfig,
            turns,
            skillLoader: this.skillLoader,
            maxTokens: agentConfig.model.maxContextTokens ?? 128e3
          });
        } else {
          if (this.skillLoader) {
            const skillsPrompt = this.skillLoader.buildSkillsPrompt();
            if (skillsPrompt) {
              systemPrompt += skillsPrompt;
            }
          }
          messages = [
            { role: "system", content: systemPrompt },
            ...turns.map((t) => ({ role: t.role, content: t.content }))
          ];
        }
        const enabledTools = new Set(Object.entries(agentConfig.tools ?? {}).filter(([, cfg]) => cfg.enabled).map(([name]) => name));
        const toolDefs = getToolDefinitionsForLLM(enabledTools);
        const completionRequest = {
          model: agentConfig.model.model,
          messages,
          tools: toolDefs.length > 0 ? toolDefs : void 0,
          temperature: agentConfig.model.temperature,
          maxTokens: agentConfig.model.maxTokens,
          stream: true
        };
        let fullResponse = "";
        let toolCalls = [];
        const runnerDeps = {
          registry: this.registry,
          logger: this.logger,
          providerStatuses: this.providerStatuses
        };
        try {
          const stream = runCompletionStream(runnerDeps, completionRequest, agentConfig);
          for await (const chunk of stream) {
            fullResponse += chunk.content;
            if (chunk.toolCalls) {
              for (const tc of chunk.toolCalls) {
                const existing = toolCalls.find((t) => t.id === tc.id);
                if (existing) {
                  existing.arguments = tryParseJson(tc.arguments) ?? existing.arguments;
                } else {
                  toolCalls.push({
                    id: tc.id,
                    name: tc.name,
                    arguments: tryParseJson(tc.arguments) ?? {}
                  });
                }
              }
            }
            if (channelPlugin && chunk.content) {
              await channelPlugin.sendMessage(envelope.channel, {
                conversationId: envelope.conversationId,
                threadId: envelope.threadId,
                metadata: {},
                isStreaming: true,
                content: [{ type: "text", text: chunk.content }],
                streamToken: uuidv44()
              });
            }
            broadcastWs(this.wsClients, {
              type: "chat:token",
              token: chunk.content,
              conversationId: envelope.conversationId,
              messageId: envelope.id
            });
          }
          let roundMessages = [...messages];
          let currentResponse = fullResponse;
          let currentToolCalls = toolCalls;
          let round = 0;
          const MAX_TOOL_ROUNDS = 5;
          while (currentToolCalls.length > 0 && round < MAX_TOOL_ROUNDS) {
            round++;
            this.logger.debug("router", `Tool round ${round}: executing ${currentToolCalls.length} tool(s)`);
            const toolResults = await executeToolCalls({
              config: this.config,
              logger: this.logger,
              approvalManager: this.approvalManager,
              broadcastWs: (msg) => broadcastWs(this.wsClients, msg)
            }, currentToolCalls, agentConfig, sessionKey, envelope.sender.id);
            const toolResultContent = toolResults.map((tr) => `[${tr.name}]: ${tr.result}${tr.error ? `
Error: ${tr.error}` : ""}`).join("\n");
            const toolTurn = {
              role: "tool",
              content: toolResultContent,
              toolCalls: currentToolCalls.map((tc) => ({
                id: tc.id,
                name: tc.name,
                arguments: tc.arguments
              })),
              toolResults: toolResults.map((tr) => ({
                id: tr.id,
                name: tr.name,
                result: tr.result,
                error: tr.error
              })),
              timestamp: Date.now()
            };
            await this.sessionManager.appendTurn(agentId, sessionKey, toolTurn);
            roundMessages = [
              ...roundMessages,
              { role: "assistant", content: currentResponse },
              { role: "tool", content: toolResultContent }
            ];
            const followUpRequest = {
              ...completionRequest,
              messages: roundMessages
            };
            let followUpResponse = "";
            currentToolCalls = [];
            const followUpStream = runCompletionStream(runnerDeps, followUpRequest, agentConfig);
            for await (const chunk of followUpStream) {
              followUpResponse += chunk.content;
              if (chunk.toolCalls) {
                for (const tc of chunk.toolCalls) {
                  const existing = currentToolCalls.find((t) => t.id === tc.id);
                  if (existing) {
                    existing.arguments = tryParseJson(tc.arguments) ?? existing.arguments;
                  } else {
                    currentToolCalls.push({
                      id: tc.id,
                      name: tc.name,
                      arguments: tryParseJson(tc.arguments) ?? {}
                    });
                  }
                }
              }
              if (channelPlugin && chunk.content) {
                await channelPlugin.sendMessage(envelope.channel, {
                  conversationId: envelope.conversationId,
                  threadId: envelope.threadId,
                  metadata: {},
                  isStreaming: true,
                  content: [{ type: "text", text: chunk.content }]
                });
              }
              broadcastWs(this.wsClients, {
                type: "chat:token",
                token: chunk.content,
                conversationId: envelope.conversationId,
                messageId: envelope.id
              });
            }
            currentResponse = followUpResponse;
            fullResponse = followUpResponse;
          }
          if (round >= MAX_TOOL_ROUNDS && currentToolCalls.length > 0) {
            this.logger.warn("router", `Tool loop hit max rounds (${MAX_TOOL_ROUNDS}) \u2014 stopping`);
          }
          const assistantTurn = {
            role: "assistant",
            content: fullResponse,
            timestamp: Date.now()
          };
          await this.sessionManager.appendTurn(agentId, sessionKey, assistantTurn);
          if (channelPlugin) {
            await channelPlugin.sendMessage(envelope.channel, {
              conversationId: envelope.conversationId,
              threadId: envelope.threadId,
              metadata: {},
              isStreaming: false,
              content: [{ type: "text", text: "" }],
              // Empty = stream-end signal
              streamDone: true
            });
          }
          broadcastWs(this.wsClients, {
            type: "chat:done",
            conversationId: envelope.conversationId,
            messageId: envelope.id,
            fullText: fullResponse
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          this.logger.error("router", `Completion error for session ${sessionKey}: ${errorMsg}`);
          if (channelPlugin) {
            await channelPlugin.sendMessage(envelope.channel, {
              conversationId: envelope.conversationId,
              metadata: {},
              isStreaming: false,
              content: [{ type: "text", text: `\u274C Error: ${errorMsg}` }]
            });
          }
          broadcastWs(this.wsClients, {
            type: "chat:error",
            conversationId: envelope.conversationId,
            error: errorMsg
          });
        }
      }
      // ── Secrets Resolution ────────────────────────────────────────────
      resolveConfigSecrets() {
        if (!this.secretsManager)
          return;
        const resolve4 = (val) => {
          if (typeof val === "string")
            return this.secretsManager.resolve(val);
          if (Array.isArray(val))
            return val.map(resolve4);
          if (val && typeof val === "object") {
            const out = {};
            for (const [k, v] of Object.entries(val))
              out[k] = resolve4(v);
            return out;
          }
          return val;
        };
        this.config = resolve4(this.config);
      }
      // ── Context Builder ───────────────────────────────────────────────
      buildContext() {
        return {
          config: this.config,
          registry: this.registry,
          storage: this.storage,
          memory: this.memory,
          logger: this.logger,
          approvalManager: this.approvalManager,
          rateLimiter: this.rateLimiter,
          channelMessageCounts: this.channelMessageCounts,
          providerStatuses: this.providerStatuses,
          outboundQueues: this.outboundQueues,
          startTime: this.startTime,
          skillLoader: this.skillLoader,
          handleInboundMessage: (envelope) => this.handleInboundMessage(envelope),
          broadcastWs: (msg, exclude) => broadcastWs(this.wsClients, msg, exclude)
        };
      }
      /** Expose session manager for tool integration. */
      getSessionManager() {
        return this.sessionManager;
      }
    };
  }
});

// packages/cli/src/index.ts
init_dist();
init_dist10();
init_dist2();
init_dist3();
init_dist6();
import { Command } from "commander";

// packages/cli/src/onboard.ts
init_dist();
import * as readline from "node:readline";
import * as fs14 from "node:fs";
import * as path15 from "node:path";
import * as os5 from "node:os";
var PROVIDER_PRESETS = {
  openai: { name: "OpenAI", baseUrl: "https://api.openai.com/v1", envKey: "OPENAI_API_KEY", defaultModel: "gpt-4o", description: "GPT-4o, GPT-4, o1, o3 \u2014 best all-around", docsUrl: "https://platform.openai.com/api-keys" },
  anthropic: { name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", envKey: "ANTHROPIC_API_KEY", defaultModel: "claude-sonnet-4-20250514", description: "Claude Sonnet 4, Opus 4 \u2014 best for coding & analysis", docsUrl: "https://console.anthropic.com/settings/keys" },
  groq: { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", envKey: "GROQ_API_KEY", defaultModel: "llama-3.3-70b-versatile", description: "Fastest inference \u2014 Llama, Mixtral, Gemma", docsUrl: "https://console.groq.com/keys" },
  deepseek: { name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", envKey: "DEEPSEEK_API_KEY", defaultModel: "deepseek-chat", description: "DeepSeek V3, R1 \u2014 cheap & powerful", docsUrl: "https://platform.deepseek.com/api-keys" },
  together: { name: "Together AI", baseUrl: "https://api.together.xyz/v1", envKey: "TOGETHER_API_KEY", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo", description: "Open-source models at scale" },
  fireworks: { name: "Fireworks AI", baseUrl: "https://api.fireworks.ai/inference/v1", envKey: "FIREWORKS_API_KEY", defaultModel: "llama-v3p3-70b-instruct", description: "Fast serverless inference" },
  xai: { name: "xAI (Grok)", baseUrl: "https://api.x.ai/v1", envKey: "XAI_API_KEY", defaultModel: "grok-3", description: "Grok 3 \u2014 real-time knowledge" },
  perplexity: { name: "Perplexity", baseUrl: "https://api.perplexity.ai", envKey: "PERPLEXITY_API_KEY", defaultModel: "sonar-pro", description: "Sonar \u2014 web-search augmented" },
  mistral: { name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1", envKey: "MISTRAL_API_KEY", defaultModel: "mistral-large-latest", description: "Mistral Large, Small, Pixtral" },
  gemini: { name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta", envKey: "GEMINI_API_KEY", defaultModel: "gemini-2.5-pro-exp-03-25", description: "Gemini 2.5 Pro, Flash \u2014 multimodal", docsUrl: "https://aistudio.google.com/apikey" },
  openrouter: { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", envKey: "OPENROUTER_API_KEY", defaultModel: "openai/gpt-4o", description: "Access 200+ models through one API" },
  ollama: { name: "Ollama (Local)", baseUrl: "http://localhost:11434/v1", envKey: "", defaultModel: "llama3.2", description: "Run models locally \u2014 free & private" },
  lmstudio: { name: "LM Studio (Local)", baseUrl: "http://localhost:1234/v1", envKey: "", defaultModel: "local-model", description: "Desktop app for local models" },
  vllm: { name: "vLLM (Local)", baseUrl: "http://localhost:8000/v1", envKey: "", defaultModel: "default", description: "High-throughput local serving" },
  custom: { name: "Custom OpenAI-Compatible", baseUrl: "", envKey: "", defaultModel: "default", description: "Any OpenAI-compatible API endpoint" }
};
var CHANNEL_TYPES = {
  discord: { name: "Discord", description: "Discord bot via WebSocket intents", needsToken: true, tokenLabel: "Bot Token", docsUrl: "https://discord.com/developers/applications" },
  telegram: { name: "Telegram", description: "Telegram bot via Bot API", needsToken: true, tokenLabel: "Bot Token", docsUrl: "https://t.me/BotFather" },
  slack: { name: "Slack", description: "Slack app via Socket Mode", needsToken: true, tokenLabel: "Bot Token + App Token" },
  whatsapp: { name: "WhatsApp", description: "WhatsApp via Baileys (QR code login)", needsToken: false, tokenLabel: "" },
  signal: { name: "Signal", description: "Signal via signal-cli REST API", needsToken: false, tokenLabel: "" },
  matrix: { name: "Matrix", description: "Matrix homeserver via sync API", needsToken: true, tokenLabel: "Access Token" },
  imessage: { name: "iMessage", description: "iMessage via BlueBubbles server (macOS only)", needsToken: true, tokenLabel: "Server URL + Password" },
  irc: { name: "IRC", description: "IRC via raw TCP socket", needsToken: false, tokenLabel: "" },
  googlechat: { name: "Google Chat", description: "Google Chat via REST API", needsToken: true, tokenLabel: "Service Account Key (JSON path)" },
  teams: { name: "Microsoft Teams", description: "Teams via Bot Framework", needsToken: true, tokenLabel: "Bot ID + Password" },
  feishu: { name: "Feishu/Lark", description: "Feishu/Lark via Open API", needsToken: true, tokenLabel: "App ID + App Secret" },
  line: { name: "LINE", description: "LINE via Messaging API", needsToken: true, tokenLabel: "Channel Access Token" },
  mattermost: { name: "Mattermost", description: "Mattermost via WebSocket API", needsToken: true, tokenLabel: "Access Token" },
  nextcloud: { name: "Nextcloud Talk", description: "Nextcloud Talk via OCS API", needsToken: true, tokenLabel: "Username + Password" },
  nostr: { name: "Nostr", description: "Nostr relay via WebSocket", needsToken: false, tokenLabel: "" },
  tlon: { name: "Tlon/Urbit", description: "Tlon/Urbit via HTTP SSE + poke", needsToken: true, tokenLabel: "Ship URL + Auth Code" },
  synology: { name: "Synology Chat", description: "Synology Chat via REST API polling", needsToken: true, tokenLabel: "Webhook URL" },
  twitch: { name: "Twitch", description: "Twitch chat via IRC", needsToken: true, tokenLabel: "Access Token + Username" },
  zalo: { name: "Zalo", description: "Zalo OA via Open REST API", needsToken: true, tokenLabel: "OA ID + App Secret" },
  wechat: { name: "WeChat", description: "WeChat Official Account via REST API", needsToken: true, tokenLabel: "App ID + App Secret" },
  qq: { name: "QQ", description: "QQ via OneBot v11 WebSocket", needsToken: false, tokenLabel: "" },
  webchat: { name: "WebChat", description: "WebChat via embedded WebSocket server", needsToken: false, tokenLabel: "" }
};
function detectPlatform() {
  if (process.platform === "darwin") return "macos";
  if (process.platform === "linux") return "linux";
  if (process.platform === "win32") return "windows";
  return "unsupported";
}
function getDaemonScriptPath() {
  const home = os5.homedir();
  switch (detectPlatform()) {
    case "macos":
      return path15.join(home, "Library", "LaunchAgents", "com.mxclaw.daemon.plist");
    case "linux":
      return path15.join(home, ".config", "systemd", "user", "mxclaw.service");
    case "windows":
      return path15.join(home, ".mxclaw", "mxclaw-daemon.ps1");
    default:
      return "";
  }
}
function generateLaunchdPlist(mxclawBin, configPath, logPath) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.mxclaw.daemon</string>
  <key>ProgramArguments</key>
  <array>
    <string>${mxclawBin}</string>
    <string>gateway</string>
    <string>--config</string>
    <string>${configPath}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin"}</string>
  </dict>
  <key>ThrottleInterval</key>
  <integer>5</integer>
</dict>
</plist>`;
}
function generateSystemdService(mxclawBin, configPath) {
  return `[Unit]
Description=MxClaw AI Agent Gateway
After=network.target

[Service]
Type=simple
ExecStart=${mxclawBin} gateway --config ${configPath}
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target`;
}
function generateWindowsScript(mxclawBin, configPath, logPath) {
  return `# MxClaw Daemon - Windows Scheduled Task Script
# Run this via: schtasks /create /tn "MxClawDaemon" /tr "powershell -File \\"${getDaemonScriptPath()}\\"" /sc onlogon /delay 0000:30 /f
# Or manually: powershell -File "${getDaemonScriptPath()}"

while ($true) {
  try {
    & "${mxclawBin}" gateway --config "${configPath}" 2>&1 | Out-File -FilePath "${logPath}" -Append
  } catch {
    $_ | Out-File -FilePath "${logPath}" -Append
  }
  Start-Sleep -Seconds 5
}`;
}
function getMxClawBinPath() {
  const isDev = process.argv[1]?.includes("ts") || process.argv[1]?.includes("dist");
  if (isDev && process.argv[1]) {
    return process.argv[1];
  }
  try {
    const { execSync: execSync2 } = __require("node:child_process");
    return execSync2("which mxclaw 2>/dev/null || where mxclaw 2>nul").toString().trim().split("\n")[0] ?? "mxclaw";
  } catch {
    return "mxclaw";
  }
}
async function installDaemon() {
  const platform = detectPlatform();
  if (platform === "unsupported") {
    console.log("  \u26A0\uFE0F  Daemon installation not supported on this platform.");
    return;
  }
  const mxclawBin = getMxClawBinPath();
  const configPath = getConfigPath();
  const logDir = path15.join(os5.homedir(), ".mxclaw");
  const logPath = path15.join(logDir, "daemon.log");
  const scriptPath = getDaemonScriptPath();
  if (!fs14.existsSync(logDir)) fs14.mkdirSync(logDir, { recursive: true });
  console.log(`  \u{1F4DD} Installing daemon for ${platform}...`);
  switch (platform) {
    case "macos": {
      const plist = generateLaunchdPlist(mxclawBin, configPath, logPath);
      const launchDir = path15.dirname(scriptPath);
      if (!fs14.existsSync(launchDir)) fs14.mkdirSync(launchDir, { recursive: true });
      fs14.writeFileSync(scriptPath, plist, "utf-8");
      console.log(`  \u{1F4C4} Wrote: ${scriptPath}`);
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`launchctl load "${scriptPath}"`, { stdio: "pipe" });
        console.log("  \u2705 Daemon loaded via launchctl");
      } catch (e) {
        console.log(`  \u26A0\uFE0F  Could not load via launchctl (will auto-start on next login): ${e instanceof Error ? e.message : String(e)}`);
      }
      break;
    }
    case "linux": {
      const service = generateSystemdService(mxclawBin, configPath);
      const sysDir = path15.dirname(scriptPath);
      if (!fs14.existsSync(sysDir)) fs14.mkdirSync(sysDir, { recursive: true });
      fs14.writeFileSync(scriptPath, service, "utf-8");
      console.log(`  \u{1F4C4} Wrote: ${scriptPath}`);
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`systemctl --user daemon-reload`, { stdio: "pipe" });
        execSync2(`systemctl --user enable mxclaw.service`, { stdio: "pipe" });
        execSync2(`systemctl --user start mxclaw.service`, { stdio: "pipe" });
        console.log("  \u2705 Daemon installed and started via systemd");
      } catch (e) {
        console.log(`  \u26A0\uFE0F  Could not start via systemd (will work after next login): ${e instanceof Error ? e.message : String(e)}`);
      }
      break;
    }
    case "windows": {
      const script = generateWindowsScript(mxclawBin, configPath, logPath);
      fs14.writeFileSync(scriptPath, script, "utf-8");
      console.log(`  \u{1F4C4} Wrote: ${scriptPath}`);
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`schtasks /create /tn "MxClawDaemon" /tr "powershell -File \\"${scriptPath}\\"" /sc onlogon /delay 0000:30 /f`, { stdio: "pipe" });
        console.log("  \u2705 Scheduled task created (runs at logon)");
      } catch (e) {
        console.log(`  \u26A0\uFE0F  Could not create scheduled task: ${e instanceof Error ? e.message : String(e)}`);
      }
      break;
    }
  }
  console.log(`  \u{1F4CB} Logs: ${logPath}`);
}
async function uninstallDaemon() {
  const platform = detectPlatform();
  const scriptPath = getDaemonScriptPath();
  console.log(`  \u{1F5D1}\uFE0F  Removing daemon for ${platform}...`);
  switch (platform) {
    case "macos": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`launchctl unload "${scriptPath}"`, { stdio: "pipe" });
      } catch {
      }
      if (fs14.existsSync(scriptPath)) fs14.unlinkSync(scriptPath);
      console.log("  \u2705 Daemon removed");
      break;
    }
    case "linux": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`systemctl --user stop mxclaw.service 2>/dev/null`, { stdio: "pipe" });
        execSync2(`systemctl --user disable mxclaw.service 2>/dev/null`, { stdio: "pipe" });
      } catch {
      }
      if (fs14.existsSync(scriptPath)) fs14.unlinkSync(scriptPath);
      console.log("  \u2705 Daemon removed");
      break;
    }
    case "windows": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        execSync2(`schtasks /delete /tn "MxClawDaemon" /f`, { stdio: "pipe" });
      } catch {
      }
      if (fs14.existsSync(scriptPath)) fs14.unlinkSync(scriptPath);
      console.log("  \u2705 Daemon removed");
      break;
    }
    default:
      console.log("  \u26A0\uFE0F  No daemon to remove on this platform.");
  }
}
async function daemonStatus() {
  const platform = detectPlatform();
  const scriptPath = getDaemonScriptPath();
  console.log(`  \u{1F50D} Checking daemon status (${platform})...
`);
  if (!fs14.existsSync(scriptPath)) {
    console.log("  \u274C Daemon not installed. Run 'mxclaw onboard --install-daemon'");
    return;
  }
  let running = false;
  let pid = "";
  switch (platform) {
    case "macos": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        const out = execSync2(`launchctl list | grep com.mxclaw.daemon`, { encoding: "utf-8", stdio: "pipe" });
        if (out.trim()) {
          running = true;
          pid = out.trim().split("	")[0] ?? "";
        }
      } catch {
      }
      break;
    }
    case "linux": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        const out = execSync2(`systemctl --user is-active mxclaw.service`, { encoding: "utf-8", stdio: "pipe" });
        running = out.trim() === "active";
        if (running) {
          const pidOut = execSync2(`systemctl --user show mxclaw.service -p MainPID`, { encoding: "utf-8", stdio: "pipe" });
          pid = pidOut.trim().replace("MainPID=", "");
        }
      } catch {
      }
      break;
    }
    case "windows": {
      try {
        const { execSync: execSync2 } = await import("node:child_process");
        const out = execSync2(`schtasks /query /tn "MxClawDaemon" /v /fo list 2>nul`, { encoding: "utf-8", stdio: "pipe" });
        running = out.includes("MxClawDaemon");
      } catch {
      }
      break;
    }
  }
  console.log(`  Daemon script: ${scriptPath}`);
  console.log(`  Status: ${running ? "\u2705 Running" : "\u23F9\uFE0F  Stopped"}`);
  if (pid) console.log(`  PID: ${pid}`);
}
async function testProvider(baseUrl, apiKey, model) {
  const start = Date.now();
  try {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const resp = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with just: OK" }],
        max_tokens: 10
      }),
      signal: AbortSignal.timeout(15e3)
    });
    const latency = Date.now() - start;
    if (resp.ok) return { ok: true, latency };
    const errText = await resp.text().catch(() => "");
    return { ok: false, latency, error: `${resp.status}: ${errText.slice(0, 200)}` };
  } catch (err) {
    return { ok: false, latency: Date.now() - start, error: err instanceof Error ? err.message : String(err) };
  }
}
function initializeWorkspace(workspacePath) {
  if (!fs14.existsSync(workspacePath)) {
    fs14.mkdirSync(workspacePath, { recursive: true });
    console.log(`  \u{1F4C1} Created workspace: ${workspacePath}`);
  }
  const agentsMd = path15.join(workspacePath, "AGENTS.md");
  if (!fs14.existsSync(agentsMd)) {
    fs14.writeFileSync(agentsMd, `# MxClaw Agent Workspace

This directory contains configuration, prompts, and skills for your MxClaw agents.

## Injected Prompt Files

- \`AGENTS.md\` \u2014 this file, always injected into every agent session
- \`SOUL.md\` \u2014 optional persona/soul definition
- \`TOOLS.md\` \u2014 optional tool usage guidelines

## Skills

Place skill directories under \`skills/<skill-name>/SKILL.md\`.

## Adding Files

Any markdown file placed here is automatically injected into agent context.
`, "utf-8");
    console.log(`  \u{1F4DD} Created: ${agentsMd}`);
  }
  const skillsDir = path15.join(workspacePath, "skills");
  if (!fs14.existsSync(skillsDir)) {
    fs14.mkdirSync(skillsDir, { recursive: true });
  }
}
var BOLD = "\x1B[1m";
var DIM = "\x1B[2m";
var GREEN = "\x1B[32m";
var YELLOW = "\x1B[33m";
var CYAN = "\x1B[36m";
var MAGENTA = "\x1B[35m";
var RESET = "\x1B[0m";
function color(s, c) {
  return `${c}${s}${RESET}`;
}
function printHeader() {
  console.log("");
  console.log(color(`  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557`, CYAN));
  console.log(color(`  \u2551                                                      \u2551`, CYAN));
  console.log(color(`  \u2551           \u{1F99E}  ${BOLD}MxClaw Onboard Wizard${RESET}${CYAN}              \u2551`, CYAN));
  console.log(color(`  \u2551     ${DIM}Set up your personal AI agent gateway${RESET}${CYAN}        \u2551`, CYAN));
  console.log(color(`  \u2551                                                      \u2551`, CYAN));
  console.log(color(`  \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`, CYAN));
  console.log("");
}
function printSection(title, subtitle) {
  console.log(color(`
  \u2500\u2500 ${BOLD}${title}${RESET} \u2500\u2500${subtitle ? ` ${DIM}${subtitle}${RESET}` : ""}
`, CYAN));
}
function printSummaryTable(summary) {
  const maxLen = Math.max(...summary.map((s) => s.label.length));
  console.log(color(`
  \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510`, GREEN));
  console.log(color(`  \u2502              \u2705  Setup Complete!                        \u2502`, GREEN));
  console.log(color(`  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`, GREEN));
  console.log("");
  for (const s of summary) {
    const icon = s.ok ? "\u2705" : "\u26A0\uFE0F";
    console.log(`    ${icon}  ${s.label.padEnd(maxLen + 2)}${color(s.value, s.ok ? GREEN : YELLOW)}`);
  }
}
async function runOnboard() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const ask = (q) => new Promise((resolve4) => rl.question(q, resolve4));
  printHeader();
  console.log("  This wizard will guide you through setting up:");
  console.log("  \u2022  LLM provider(s) for AI responses");
  console.log("  \u2022  Messaging channel(s) for chatting with your agent");
  console.log("  \u2022  Agent configuration with model fallbacks");
  console.log("  \u2022  Gateway settings");
  console.log("  \u2022  Workspace initialization");
  console.log(color(`
  ${DIM}Press Ctrl+C at any time to exit.${RESET}
`, DIM));
  let config;
  const configPath = getConfigPath();
  const isNew = !fs14.existsSync(configPath);
  if (!isNew) {
    console.log(color(`  \u{1F4C4} ${BOLD}Loading existing config:${RESET} ${DIM}${configPath}${RESET}
`, YELLOW));
    config = loadConfig();
  } else {
    const configDir = getConfigDir();
    if (!fs14.existsSync(configDir)) fs14.mkdirSync(configDir, { recursive: true });
    config = {
      version: 1,
      gateway: { host: "127.0.0.1", port: 18700, webhookPath: "/gateway/webhook", corsOrigins: ["http://localhost:5173"], wsHeartbeatIntervalMs: 3e4 },
      agents: {},
      channels: {},
      bindings: [],
      devices: [],
      voice: { defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: { voiceId: "21m00Tcm4TlvDq8ikWAM" }, systemTts: {} },
      logging: { level: "info", subsystems: {}, otel: { enabled: false } },
      storage: { type: "jsonl", workspacePath: "~/.mxclaw/workspace", lanceDbPath: "~/.mxclaw/lancedb", sqlitePath: "~/.mxclaw/mxclaw.db" },
      plugins: [],
      sandbox: { enabled: false, type: "docker" },
      ownerId: void 0
    };
    console.log(color(`  \u{1F4C4} ${BOLD}Creating new config...${RESET}
`, GREEN));
  }
  printSection("Step 1: LLM Providers", "Pick models for your agent to use");
  console.log("  Available providers:\n");
  const presetKeys = Object.keys(PROVIDER_PRESETS);
  for (let i = 0; i < presetKeys.length; i++) {
    const key = presetKeys[i];
    const p = PROVIDER_PRESETS[key];
    console.log(`  ${color(String(i + 1).padStart(2, " "), DIM)}. ${BOLD}${p.name.padEnd(22)}${RESET} ${DIM}${p.description}${RESET}`);
  }
  console.log(color(`
  ${DIM}Enter comma-separated numbers (e.g., 1,2,3), 'all', or press Enter to skip${RESET}`, DIM));
  const providerSelection = await ask(color("  Select providers > ", CYAN));
  const selectedIndices = [];
  if (providerSelection.toLowerCase() === "all") {
    for (let i = 0; i < presetKeys.length; i++) selectedIndices.push(i);
  } else if (providerSelection.trim()) {
    for (const part of providerSelection.split(",")) {
      const idx = parseInt(part.trim(), 10) - 1;
      if (idx >= 0 && idx < presetKeys.length) selectedIndices.push(idx);
    }
  }
  const providers2 = [];
  for (const idx of selectedIndices) {
    const key = presetKeys[idx];
    const preset = PROVIDER_PRESETS[key];
    console.log(color(`
  \u2500\u2500\u2500 ${BOLD}${preset.name}${RESET} \u2500\u2500\u2500`, MAGENTA));
    let apiKey = "";
    if (preset.envKey) {
      const envValue = process.env[preset.envKey] ?? "";
      const bootstrapValue = loadBootstrap()[preset.envKey] ?? "";
      if (envValue) {
        apiKey = envValue;
        console.log(color(`    \u2705 Found $${preset.envKey} in environment (${apiKey.slice(0, 8)}...)`, DIM));
      } else if (bootstrapValue) {
        apiKey = bootstrapValue;
        console.log(color(`    \u2705 Found $${preset.envKey} in bootstrap.env (${apiKey.slice(0, 8)}...)`, DIM));
      } else {
        if (preset.docsUrl) {
          console.log(color(`    ${DIM}Get a key at: ${preset.docsUrl}${RESET}`, DIM));
        }
        apiKey = await ask(color("    API key (or Enter to skip): ", CYAN));
      }
    }
    let baseUrl = preset.baseUrl;
    if (key === "custom") {
      baseUrl = await ask(color("    Base URL (e.g., https://api.example.com/v1): ", CYAN)) || baseUrl;
    }
    const modelInput = await ask(color(`    Model [${preset.defaultModel}]: `, CYAN));
    const model = modelInput || preset.defaultModel;
    if (apiKey || !preset.envKey) {
      const providerRef = {
        provider: "openai-compatible",
        model,
        apiKey: apiKey || void 0,
        baseUrl: baseUrl || void 0,
        preset: key,
        temperature: 0.7,
        maxTokens: 4096,
        options: {}
      };
      if (apiKey) {
        process.stdout.write(color("    Testing connectivity... ", DIM));
        const result = await testProvider(baseUrl || "https://api.openai.com/v1", apiKey, model);
        if (result.ok) {
          console.log(color(`\u2705 ${result.latency}ms`, GREEN));
        } else {
          console.log(color(`\u274C ${result.error ?? "unknown error"}`, YELLOW));
          const skipFail = await ask(color("    Add anyway? (y/N): ", CYAN));
          if (skipFail.toLowerCase() !== "y") {
            console.log(color("    \u23ED\uFE0F  Skipped", DIM));
            continue;
          }
        }
      }
      providers2.push(providerRef);
      console.log(color(`    \u2705 ${BOLD}${preset.name}${RESET} configured \u2192 ${model}`, GREEN));
    } else {
      console.log(color("    \u23ED\uFE0F  Skipped (no API key)", DIM));
    }
  }
  const bootstrapEntries = loadBootstrap();
  for (const p of providers2) {
    const envKey = p.preset ? PROVIDER_ENV_KEYS[p.preset] : void 0;
    if (envKey && p.apiKey) {
      bootstrapEntries[envKey] = p.apiKey;
    }
  }
  if (Object.keys(bootstrapEntries).length > 0) {
    saveBootstrap(bootstrapEntries);
    console.log(color(`
  \u{1F510} ${BOLD}Saved ${Object.keys(bootstrapEntries).length} API key(s)${RESET} to bootstrap files`, GREEN));
    console.log(color(`     ${DIM}${getBootstrapEnvPath()}${RESET}`, DIM));
    console.log(color(`     ${DIM}${getBootstrapJsonPath()}${RESET}`, DIM));
  }
  printSection("Step 2: Messaging Channels", "Connect platforms for your agent to live on");
  console.log("  Available channels:\n");
  const channelKeys = Object.keys(CHANNEL_TYPES);
  for (let i = 0; i < channelKeys.length; i++) {
    const key = channelKeys[i];
    const ch = CHANNEL_TYPES[key];
    console.log(`  ${color(String(i + 1).padStart(2, " "), DIM)}. ${BOLD}${ch.name.padEnd(18)}${RESET} ${DIM}${ch.description}${RESET}`);
  }
  console.log(color(`
  ${DIM}Enter comma-separated numbers, 'all', or press Enter to skip${RESET}`, DIM));
  const channelSelection = await ask(color("  Select channels > ", CYAN));
  const channels = { ...config.channels };
  const selectedChannelIndices = [];
  if (channelSelection.toLowerCase() === "all") {
    for (let i = 0; i < channelKeys.length; i++) selectedChannelIndices.push(i);
  } else if (channelSelection.trim()) {
    for (const part of channelSelection.split(",")) {
      const idx = parseInt(part.trim(), 10) - 1;
      if (idx >= 0 && idx < channelKeys.length) selectedChannelIndices.push(idx);
    }
  }
  for (const idx of selectedChannelIndices) {
    const key = channelKeys[idx];
    const chInfo = CHANNEL_TYPES[key];
    console.log(color(`
  \u2500\u2500\u2500 ${BOLD}${chInfo.name}${RESET} \u2500\u2500\u2500`, MAGENTA));
    if (chInfo.docsUrl) {
      console.log(color(`    ${DIM}Setup guide: ${chInfo.docsUrl}${RESET}`, DIM));
    }
    const channelId = await ask(color(`  Channel ID [${key}-1]: `, CYAN)) || `${key}-1`;
    const credentials = {};
    if (chInfo.needsToken) {
      const tokenInput = await ask(color(`  ${chInfo.tokenLabel}: `, CYAN));
      if (tokenInput) {
        if (chInfo.tokenLabel.includes("+")) {
          const parts = chInfo.tokenLabel.split("+").map((s) => s.trim());
          const values = tokenInput.split(":").map((s) => s.trim());
          for (let j = 0; j < parts.length; j++) {
            const label = parts[j].toLowerCase().replace(/\s+/g, "");
            credentials[label] = values[j] ?? tokenInput;
          }
        } else if (chInfo.tokenLabel.includes("(") && chInfo.tokenLabel.includes(")")) {
          const label = chInfo.tokenLabel.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
          credentials[label] = tokenInput;
        } else {
          credentials["token"] = tokenInput;
        }
      }
    }
    channels[channelId] = {
      id: channelId,
      type: key,
      enabled: true,
      credentials,
      options: {},
      allowlist: [],
      mentionGating: true,
      pairingEnabled: true
    };
    console.log(color(`    \u2705 ${BOLD}${chInfo.name}${RESET} channel added: ${channelId}`, GREEN));
  }
  printSection("Step 3: Agent Configuration", "Configure your default agent");
  const agents = { ...config.agents };
  if (providers2.length > 0) {
    console.log("  Configured providers:\n");
    providers2.forEach((p, i) => {
      const preset = PROVIDER_PRESETS[p.preset ?? "custom"];
      console.log(`  ${color(String(i + 1), DIM)}. ${BOLD}${preset?.name ?? p.preset}${RESET} \u2192 ${DIM}${p.model}${RESET}`);
    });
    console.log(color(`
  ${DIM}Set up the default agent with a primary model.${RESET}`, DIM));
    const primaryIdxInput = await ask(color("  Primary provider (number) [1]: ", CYAN));
    const primaryIdx = parseInt(primaryIdxInput || "1", 10) - 1;
    const primaryProvider = providers2[primaryIdx] ?? providers2[0];
    if (!primaryProvider) {
      console.log("  No providers to configure. Skipping agent setup.");
    } else {
      const fallbackChain = [];
      if (providers2.length > 1) {
        const fallbackInput = await ask(color("  Fallback providers (comma-separated numbers, or Enter for none): ", CYAN));
        if (fallbackInput) {
          for (const part of fallbackInput.split(",")) {
            const fi = parseInt(part.trim(), 10) - 1;
            if (fi >= 0 && fi < providers2.length && fi !== primaryIdx) {
              fallbackChain.push(providers2[fi]);
            }
          }
        }
      }
      const systemPrompt = await ask(color("  System prompt (or Enter for default agent persona): ", CYAN));
      const name = await ask(color("  Agent name [Default Agent]: ", CYAN)) || "Default Agent";
      agents["default"] = {
        id: "default",
        name,
        description: "Primary MxClaw agent",
        model: primaryProvider,
        fallbackChain,
        tools: {
          bash: { enabled: true, approval: "always-require-approval" },
          browser: { enabled: false, approval: "always-require-approval" },
          canvas: { enabled: true, approval: "owner-only" },
          cron: { enabled: false, approval: "always-require-approval" },
          sessionSpawn: { enabled: true, approval: "owner-only" },
          imageGen: { enabled: false, approval: "always-require-approval" },
          fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
          fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] }
        },
        sandbox: { enabled: false, type: "docker" },
        voice: { provider: "system-tts" },
        systemPrompt: systemPrompt || "You are a helpful AI assistant powered by MxClaw.",
        mentionGating: true,
        maxSessionTurns: 100,
        compactionThreshold: 50
      };
      console.log(color(`
    \u2705 ${BOLD}Agent "${name}"${RESET} configured`, GREEN));
      if (fallbackChain.length > 0) {
        console.log(color(`       Primary: ${primaryProvider.model} \u2192 Fallbacks: ${fallbackChain.map((f) => f.model).join(", ")}`, DIM));
      }
    }
  } else {
    console.log(color("  \u26A0\uFE0F  No providers configured. Add providers first or edit config later.", YELLOW));
    if (!agents["default"]) {
      agents["default"] = {
        id: "default",
        name: "Default Agent",
        description: "Primary MxClaw agent",
        model: { provider: "openai-compatible", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
        fallbackChain: [],
        tools: {
          bash: { enabled: true, approval: "always-require-approval" },
          browser: { enabled: false, approval: "always-require-approval" },
          canvas: { enabled: true, approval: "owner-only" },
          cron: { enabled: false, approval: "always-require-approval" },
          sessionSpawn: { enabled: true, approval: "owner-only" },
          imageGen: { enabled: false, approval: "always-require-approval" },
          fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
          fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] }
        },
        sandbox: { enabled: false, type: "docker" },
        voice: { provider: "system-tts" },
        systemPrompt: "You are a helpful AI assistant powered by MxClaw.",
        mentionGating: true,
        maxSessionTurns: 100,
        compactionThreshold: 50
      };
      console.log(color("    \u{1F4DD} Created default agent with placeholder model (edit config to set API key)", YELLOW));
    }
  }
  printSection("Step 4: Gateway Settings", "Network configuration");
  const portInput = await ask(color(`  Gateway port [${config.gateway?.port ?? 18700}]: `, CYAN));
  if (portInput) {
    config.gateway = { ...config.gateway, port: parseInt(portInput, 10) };
  }
  const hostInput = await ask(color(`  Bind host [${config.gateway?.host ?? "127.0.0.1"}]: `, CYAN));
  if (hostInput) {
    config.gateway = { ...config.gateway, host: hostInput };
  }
  printSection("Step 5: Workspace", "Agent workspace and skills directory");
  const workspacePath = getWorkspacePath(config);
  initializeWorkspace(workspacePath);
  printSection("Step 6: Daemon (Optional)", "Auto-start gateway on boot");
  const installDmn = await ask(color("  Install system daemon? (auto-start gateway on boot) (y/N): ", CYAN));
  if (installDmn.toLowerCase() === "y") {
    await installDaemon();
  }
  config.agents = agents;
  config.channels = channels;
  config.defaultAgentId = "default";
  config.bindings = Object.keys(channels).map((channelId) => ({
    channelId,
    agentId: "default"
  }));
  saveConfig(config);
  const summary = [
    { label: "Config file", value: configPath, ok: true },
    { label: "Providers", value: providers2.length > 0 ? `${providers2.length} configured` : "none (edit config later)", ok: providers2.length > 0 },
    { label: "Bootstrap keys", value: Object.keys(bootstrapEntries).length > 0 ? `${Object.keys(bootstrapEntries).length} API key(s) saved` : "none", ok: Object.keys(bootstrapEntries).length > 0 },
    { label: "Channels", value: `${Object.keys(channels).length} configured`, ok: Object.keys(channels).length > 0 },
    { label: "Default agent", value: agents["default"]?.name ?? "not set", ok: !!agents["default"] },
    { label: "Gateway", value: `${config.gateway?.host ?? "127.0.0.1"}:${config.gateway?.port ?? 18700}`, ok: true },
    { label: "Workspace", value: workspacePath, ok: true },
    { label: "Daemon", value: installDmn.toLowerCase() === "y" ? "installed" : "not installed", ok: true }
  ];
  printSummaryTable(summary);
  const defaultAgent = agents["default"];
  if (defaultAgent) {
    const primaryModel = defaultAgent.model;
    const primaryPreset = PROVIDER_PRESETS[primaryModel.preset ?? ""];
    console.log(color(`
  ${BOLD}Model:${RESET} ${primaryPreset?.name ?? primaryModel.provider} \u2192 ${primaryModel.model}`, DIM));
    if (defaultAgent.fallbackChain && defaultAgent.fallbackChain.length > 0) {
      console.log(color(`  ${BOLD}Fallbacks:${RESET} ${defaultAgent.fallbackChain.map((f) => f.model).join(", ")}`, DIM));
    }
  }
  console.log(color(`
  ${BOLD}Next Steps:${RESET}
`, GREEN));
  console.log(color(`  ${"1.".padEnd(3)} Run ${BOLD}mxclaw doctor${RESET} to validate your configuration`, DIM));
  console.log(color(`  ${"2.".padEnd(3)} Run ${BOLD}mxclaw gateway${RESET} to start the server`, DIM));
  console.log(color(`  ${"3.".padEnd(3)} Open ${BOLD}http://localhost:5173${RESET} for the control UI`, DIM));
  console.log(color(`  ${"4.".padEnd(3)} ${BOLD}mxclaw onboard --help${RESET} for more options
`, DIM));
  if (providers2.length === 0) {
    console.log(color(`  \u26A0\uFE0F  ${BOLD}No providers configured.${RESET} Edit ${configPath} to add API keys.`, YELLOW));
  }
  if (Object.keys(channels).length === 0) {
    console.log(color(`  \u26A0\uFE0F  ${BOLD}No channels configured.${RESET} Run ${BOLD}mxclaw onboard${RESET} again or edit config.`, YELLOW));
  }
  rl.close();
}

// packages/cli/src/index.ts
import * as fs15 from "node:fs";
import * as path16 from "node:path";
import * as os6 from "node:os";
var program = new Command();
program.name("mxclaw").description("mxclaw - Local-first personal AI agent gateway").version("0.1.2");
program.command("gateway").description("Start the mxclaw gateway server").option("-c, --config <path>", "Path to config file", getConfigPath()).option("-p, --port <number>", "Override gateway port").action(async (options) => {
  const config = loadConfig(options.config);
  if (options.port) config.gateway.port = parseInt(options.port, 10);
  const gateway = new MxClawGateway(options.config);
  const shutdown = async () => {
    console.log("\nShutting down...");
    await gateway.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  await gateway.start();
  console.log(`mxclaw Gateway running on ${config.gateway.host}:${config.gateway.port}`);
  console.log(`Control UI: http://localhost:5173`);
  console.log(`Press Ctrl+C to stop`);
});
program.command("setup").description("Interactive setup wizard for mxclaw").action(async () => {
  console.log("\u{1F527} mxclaw Setup Wizard\n");
  const configDir = getConfigDir();
  const configPath = getConfigPath();
  if (!fs15.existsSync(configDir)) {
    fs15.mkdirSync(configDir, { recursive: true });
    console.log(`Created config directory: ${configDir}`);
  }
  if (fs15.existsSync(configPath)) {
    console.log(`Config already exists at ${configPath}`);
    console.log("Run 'mxclaw doctor' to validate your config.");
    return;
  }
  const defaultConfig = generateDefaultConfig();
  saveConfig(defaultConfig);
  console.log(`\u2705 Created default config at ${configPath}`);
  console.log(`
Next steps:`);
  console.log(`  1. Edit ${configPath} to add your API keys and channels`);
  console.log(`  2. Run 'mxclaw gateway' to start the server`);
  console.log(`  3. Run 'mxclaw doctor' to validate your setup`);
});
program.command("onboard").description("Interactive terminal setup wizard \u2014 configure providers, channels, and agents step by step").option("--install-daemon", "Install system daemon to auto-start gateway on boot").option("--uninstall-daemon", "Remove the system daemon").option("--status", "Check daemon status").option("--quick", "Quick setup with defaults (non-interactive)").action(async (options) => {
  if (options.installDaemon) {
    await installDaemon();
  } else if (options.uninstallDaemon) {
    await uninstallDaemon();
  } else if (options.status) {
    await daemonStatus();
  } else if (options.quick) {
    console.log("  \u26A1 Quick setup coming soon \u2014 use 'mxclaw onboard' for interactive setup");
  } else {
    await runOnboard();
  }
});
program.command("runner").description("Quick start \u2014 run setup + doctor + gateway in one command").option("-p, --port <number>", "Gateway port", "18700").option("-h, --host <host>", "Bind host", "127.0.0.1").action(async (options) => {
  const { loadConfig: loadConfig2, saveConfig: saveConfig2, generateDefaultConfig: generateDefaultConfig2, getConfigPath: getConfigPath2 } = await Promise.resolve().then(() => (init_dist(), dist_exports));
  const configPath = getConfigPath2();
  const fs16 = await import("node:fs");
  if (!fs16.existsSync(configPath)) {
    console.log("\u{1F4C4} No config found \u2014 creating default...");
    const defaultConfig = generateDefaultConfig2();
    saveConfig2(defaultConfig);
    console.log("\u2705 Default config created\n");
  }
  console.log("\u{1FA7A} Running diagnostics...\n");
  const config = loadConfig2();
  const issues = [];
  const warnings = [];
  const ok = [];
  ok.push(`Config: ${configPath}`);
  const agents = Object.keys(config.agents ?? {});
  if (agents.length === 0) warnings.push("No agents configured");
  else ok.push(`${agents.length} agent(s): ${agents.join(", ")}`);
  const channels = Object.keys(config.channels ?? {});
  if (channels.length === 0) warnings.push("No channels configured");
  else ok.push(`${channels.length} channel(s): ${channels.join(", ")}`);
  const defaultAgent = config.defaultAgentId ?? "default";
  if (!config.agents?.[defaultAgent]) issues.push(`Default agent "${defaultAgent}" not found`);
  else ok.push(`Default agent: ${defaultAgent}`);
  for (const o of ok) console.log(`  \u2705 ${o}`);
  for (const w of warnings) console.log(`  \u26A0\uFE0F  ${w}`);
  for (const i of issues) console.log(`  \u274C ${i}`);
  if (issues.length > 0) {
    console.log("\n\u274C Issues found. Run 'mxclaw onboard' to fix them.");
    return;
  }
  console.log(`
${warnings.length > 0 ? "\u26A0\uFE0F  Warnings exist but continuing..." : "\u2705 All checks passed!"}
`);
  console.log("\u{1F680} Starting MxClaw Gateway...\n");
  const { MxClawGateway: MxClawGateway2 } = await Promise.resolve().then(() => (init_dist10(), dist_exports2));
  config.gateway.port = parseInt(options.port, 10);
  config.gateway.host = options.host;
  const gateway = new MxClawGateway2(configPath);
  const shutdown = async () => {
    console.log("\n\u{1F6D1} Shutting down...");
    await gateway.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  await gateway.start();
  console.log(`
\u{1F99E}  MxClaw Gateway running on http://${config.gateway.host}:${config.gateway.port}`);
  console.log(`   Control UI: http://localhost:5173`);
  console.log(`   Health:     http://${config.gateway.host}:${config.gateway.port}/health`);
  console.log(`   Status:     http://${config.gateway.host}:${config.gateway.port}/status`);
  console.log(`
   Press Ctrl+C to stop
`);
});
program.command("auth").description("Manage authentication and pairing").option("--list-pairings", "List pending pairing codes").option("--approve <code>", "Approve a pairing code").option("--deny <code>", "Deny a pairing code").option("--list-devices", "List paired devices").option("--unpair <deviceId>", "Unpair a device").action(async (options) => {
  const config = loadConfig();
  if (options.listPairings) {
    console.log("Pending pairing codes:");
    console.log("  (connect to running gateway for live data)");
  }
  if (options.approve) {
    console.log(`Approved pairing code: ${options.approve}`);
  }
  if (options.deny) {
    console.log(`Denied pairing code: ${options.deny}`);
  }
  if (options.listDevices) {
    const devices = config.devices ?? [];
    console.log("Paired devices:");
    for (const device of devices) {
      console.log(`  ${device.id} (${device.name}) - ${device.type} - ${device.paired ? "paired" : "pending"}`);
    }
  }
  if (options.unpair) {
    config.devices = (config.devices ?? []).filter((d) => d.id !== options.unpair);
    saveConfig(config);
    console.log(`Unpaired device: ${options.unpair}`);
  }
});
program.command("channels").description("Manage messaging channels").option("--list", "List configured channels").option("--add <type>", "Add a new channel (discord, telegram, slack, whatsapp, etc.)").option("--remove <id>", "Remove a channel").option("--enable <id>", "Enable a channel").option("--disable <id>", "Disable a channel").option("--status", "Show channel connection status").action(async (options) => {
  const config = loadConfig();
  if (options.list) {
    console.log("Configured channels:");
    const channels = config.channels ?? {};
    for (const [id, ch] of Object.entries(channels)) {
      console.log(`  ${id} (${ch.type}) - ${ch.enabled ? "\u2705 enabled" : "\u274C disabled"}`);
    }
    if (Object.keys(channels).length === 0) {
      console.log("  No channels configured. Use --add to add one.");
    }
  }
  if (options.add) {
    const type = options.add;
    const id = `${type}-1`;
    const channelConfig = {
      id,
      type,
      enabled: true,
      credentials: {},
      options: {},
      allowlist: [],
      mentionGating: true,
      pairingEnabled: true
    };
    config.channels = { ...config.channels, [id]: channelConfig };
    saveConfig(config);
    console.log(`Added channel: ${id} (${type})`);
    console.log(`Edit ${getConfigPath()} to configure credentials.`);
  }
  if (options.remove) {
    const channels = { ...config.channels };
    delete channels[options.remove];
    config.channels = channels;
    saveConfig(config);
    console.log(`Removed channel: ${options.remove}`);
  }
  if (options.enable) {
    const ch = config.channels[options.enable];
    if (ch) {
      ch.enabled = true;
      saveConfig(config);
      console.log(`Enabled channel: ${options.enable}`);
    }
  }
  if (options.disable) {
    const ch = config.channels[options.disable];
    if (ch) {
      ch.enabled = false;
      saveConfig(config);
      console.log(`Disabled channel: ${options.disable}`);
    }
  }
  if (options.status) {
    console.log("Channel status: (connect to running gateway for live data)");
    console.log("Run 'mxclaw gateway' first, then check http://localhost:18700/status");
  }
});
program.command("models").description("Manage LLM provider models").option("--list", "List configured agents and their models").option("--list-providers", "List available provider plugins").option("--set-default <agentId>", "Set the default agent").option("--add-agent <id>", "Add a new agent").option("--remove-agent <id>", "Remove an agent").action(async (options) => {
  const config = loadConfig();
  if (options.list) {
    console.log("Configured agents:");
    const agents = config.agents ?? {};
    for (const [id, agent] of Object.entries(agents)) {
      const isDefault = id === (config.defaultAgentId ?? "default");
      console.log(`  ${id}${isDefault ? " \u2B50 (default)" : ""}`);
      console.log(`    Model: ${agent.model.provider}/${agent.model.model}`);
      console.log(`    Fallback chain: ${agent.fallbackChain?.map((f) => `${f.provider}/${f.model}`).join(", ") ?? "none"}`);
      console.log(`    Tools: ${Object.entries(agent.tools ?? {}).filter(([, t]) => t.enabled).map(([n]) => n).join(", ") ?? "none"}`);
    }
  }
  if (options.listProviders) {
    console.log("Available provider plugins:");
    const providers2 = [
      "openai",
      "anthropic",
      "gemini",
      "groq",
      "deepseek",
      "lmstudio",
      "ollama",
      "together",
      "fireworks",
      "replicate",
      "cohere",
      "mistral",
      "perplexity",
      "xai",
      "bedrock",
      "azure",
      "cloudflare"
    ];
    for (const p of providers2) {
      console.log(`  - ${p}`);
    }
  }
  if (options.setDefault) {
    if (!config.agents[options.setDefault]) {
      console.error(`Agent "${options.setDefault}" not found.`);
      return;
    }
    config.defaultAgentId = options.setDefault;
    saveConfig(config);
    console.log(`Default agent set to: ${options.setDefault}`);
  }
  if (options.addAgent) {
    const id = options.addAgent;
    const agentConfig = {
      id,
      name: id,
      model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} },
      fallbackChain: [],
      tools: {
        bash: { enabled: true, approval: "always-require-approval" },
        browser: { enabled: false, approval: "always-require-approval" },
        canvas: { enabled: true, approval: "owner-only" },
        cron: { enabled: false, approval: "always-require-approval" },
        sessionSpawn: { enabled: true, approval: "owner-only" },
        imageGen: { enabled: false, approval: "always-require-approval" },
        fileRead: { enabled: true, approval: "owner-only", allowedPaths: ["~/.mxclaw/workspace"] },
        fileWrite: { enabled: true, approval: "always-require-approval", allowedPaths: ["~/.mxclaw/workspace"] }
      },
      mentionGating: true,
      maxSessionTurns: 100,
      compactionThreshold: 50,
      sandbox: { enabled: false, type: "docker" },
      voice: { provider: "system-tts" }
    };
    config.agents = { ...config.agents, [id]: agentConfig };
    saveConfig(config);
    console.log(`Added agent: ${id}`);
  }
  if (options.removeAgent) {
    if (options.removeAgent === "default") {
      console.error("Cannot remove the default agent.");
      return;
    }
    const agents = { ...config.agents };
    delete agents[options.removeAgent];
    config.agents = agents;
    if (config.defaultAgentId === options.removeAgent) {
      config.defaultAgentId = "default";
    }
    saveConfig(config);
    console.log(`Removed agent: ${options.removeAgent}`);
  }
});
program.command("sessions").description("Manage chat sessions").option("--list [agentId]", "List sessions for an agent").option("--view <sessionKey>", "View session transcript").option("--reset <sessionKey>", "Reset (delete) a session").option("--agent <agentId>", "Agent ID for session operations", "default").action(async (options) => {
  const config = loadConfig();
  const storage = new JsonlStorageAdapter(config);
  await storage.initialize();
  const agentId = options.agent ?? config.defaultAgentId ?? "default";
  if (options.list !== void 0) {
    const listAgentId = typeof options.list === "string" ? options.list : agentId;
    const sessions = await storage.listSessions(listAgentId);
    console.log(`Sessions for agent "${listAgentId}":`);
    if (sessions.length === 0) {
      console.log("  No sessions found.");
    }
    for (const s of sessions) {
      const age = Math.round((Date.now() - s.lastActiveAt) / 6e4);
      console.log(`  ${s.sessionKey} - ${s.turnCount} turns - last active ${age}m ago`);
    }
  }
  if (options.view) {
    const turns = await storage.getSessionTranscript(agentId, options.view);
    console.log(`Session: ${options.view} (${turns.length} turns)
`);
    for (const turn of turns) {
      const roleTag = turn.role === "user" ? "\u{1F464}" : turn.role === "assistant" ? "\u{1F916}" : turn.role === "system" ? "\u2699\uFE0F" : "\u{1F527}";
      console.log(`${roleTag} [${turn.role}] ${new Date(turn.timestamp).toLocaleString()}`);
      console.log(turn.content.slice(0, 200) + (turn.content.length > 200 ? "..." : ""));
      console.log("---");
    }
  }
  if (options.reset) {
    await storage.deleteSession(agentId, options.reset);
    console.log(`Session reset: ${options.reset}`);
  }
  await storage.close();
});
program.command("doctor").description("Diagnose configuration and environment issues").action(async () => {
  console.log("\u{1FA7A} mxclaw Doctor\n");
  const issues = [];
  const warnings = [];
  const ok = [];
  const configPath = getConfigPath();
  if (fs15.existsSync(configPath)) {
    ok.push(`Config file exists: ${configPath}`);
    try {
      const config = loadConfig();
      ok.push("Config is valid JSON and passes schema validation");
      const agents = config.agents ?? {};
      if (Object.keys(agents).length === 0) {
        warnings.push("No agents configured. Add at least one agent.");
      } else {
        ok.push(`${Object.keys(agents).length} agent(s) configured`);
        for (const [id, agent] of Object.entries(agents)) {
          if (!agent.model.provider) {
            issues.push(`Agent "${id}" has no model provider configured`);
          }
        }
      }
      if (!config.defaultAgentId) {
        warnings.push("No default agent set. Inbound messages without a binding will be dropped.");
      } else if (!agents[config.defaultAgentId]) {
        issues.push(`Default agent "${config.defaultAgentId}" not found in agents config`);
      }
      const channels = config.channels ?? {};
      if (Object.keys(channels).length === 0) {
        warnings.push("No channels configured. Add channels to receive messages.");
      } else {
        ok.push(`${Object.keys(channels).length} channel(s) configured`);
        for (const [id, ch] of Object.entries(channels)) {
          if (!ch.credentials || Object.keys(ch.credentials).length === 0) {
            warnings.push(`Channel "${id}" (${ch.type}) has no credentials configured`);
          }
        }
      }
      const bindings = config.bindings ?? [];
      if (bindings.length === 0) {
        warnings.push("No bindings configured. Messages will route to the default agent.");
      }
      for (const [id, agent] of Object.entries(agents)) {
        for (const [toolName, toolCfg] of Object.entries(agent.tools ?? {})) {
          if (toolCfg.approval === "yolo") {
            warnings.push(`\u26A0\uFE0F Agent "${id}" tool "${toolName}" is in YOLO mode - no approval required!`);
          }
        }
      }
      for (const [id, agent] of Object.entries(agents)) {
        if (agent.sandbox?.enabled) {
          ok.push(`Agent "${id}" has sandbox enabled (${agent.sandbox.type})`);
        } else {
          const hasYolo = Object.values(agent.tools ?? {}).some((t) => t.approval === "yolo");
          if (hasYolo) {
            warnings.push(`Agent "${id}" has YOLO tools but no sandbox - consider enabling sandbox`);
          }
        }
      }
    } catch (err) {
      issues.push(`Config validation failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    issues.push(`Config file not found: ${configPath}. Run 'mxclaw setup' to create one.`);
  }
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0] ?? "0");
  if (major >= 20) {
    ok.push(`Node.js ${nodeVersion} (>=20 required)`);
  } else {
    issues.push(`Node.js ${nodeVersion} is too old. Version 20+ required.`);
  }
  const workspaceDir = path16.join(os6.homedir(), ".mxclaw", "workspace");
  if (fs15.existsSync(workspaceDir)) {
    ok.push(`Workspace directory exists: ${workspaceDir}`);
  } else {
    warnings.push(`Workspace directory not yet created: ${workspaceDir} (will be created on first run)`);
  }
  const deps = ["docker", "git"];
  for (const dep of deps) {
    try {
      const { execSync: execSync2 } = await import("node:child_process");
      execSync2(`where ${dep}`, { stdio: "ignore" });
      ok.push(`${dep} is available`);
    } catch {
      warnings.push(`${dep} not found in PATH (optional, for sandbox/version control)`);
    }
  }
  console.log("\u2705 OK:");
  for (const o of ok) console.log(`  ${o}`);
  if (warnings.length > 0) {
    console.log("\n\u26A0\uFE0F  Warnings:");
    for (const w of warnings) console.log(`  ${w}`);
  }
  if (issues.length > 0) {
    console.log("\n\u274C Issues:");
    for (const i of issues) console.log(`  ${i}`);
  }
  console.log(`
Summary: ${ok.length} OK, ${warnings.length} warnings, ${issues.length} issues`);
});
program.command("config").description("View or edit the mxclaw configuration").option("--show", "Show current config").option("--path", "Show config file path").option("--edit", "Open config in default editor").action(async (options) => {
  const configPath = getConfigPath();
  if (options.path) {
    console.log(configPath);
    return;
  }
  if (options.show) {
    if (!fs15.existsSync(configPath)) {
      console.log("No config found. Run 'mxclaw setup' first.");
      return;
    }
    const content = fs15.readFileSync(configPath, "utf-8");
    console.log(content);
    return;
  }
  if (options.edit) {
    const { exec: exec3 } = await import("node:child_process");
    const editor = process.env.EDITOR ?? process.env.VISUAL ?? (process.platform === "win32" ? "notepad" : "vim");
    exec3(`${editor} "${configPath}"`);
    return;
  }
  console.log(`Config: ${configPath}`);
  console.log(`Exists: ${fs15.existsSync(configPath) ? "yes" : "no"}`);
});
program.command("bind").description("Manage channel-to-agent bindings").option("--list", "List all bindings").option("--add <channelId>", "Add a binding for a channel").option("--sender <senderId>", "Sender ID for the binding").option("--agent <agentId>", "Agent ID for the binding", "default").option("--remove <index>", "Remove a binding by index").action(async (options) => {
  const config = loadConfig();
  if (options.list) {
    const bindings = config.bindings ?? [];
    console.log("Bindings:");
    if (bindings.length === 0) {
      console.log("  No bindings configured.");
    }
    bindings.forEach((b, i) => {
      console.log(`  [${i}] ${b.channelId}${b.senderId ? ` / ${b.senderId}` : ""} \u2192 ${b.agentId}`);
    });
  }
  if (options.add) {
    const binding = {
      channelId: options.add,
      senderId: options.sender,
      agentId: options.agent
    };
    config.bindings = [...config.bindings ?? [], binding];
    saveConfig(config);
    console.log(`Added binding: ${binding.channelId} \u2192 ${binding.agentId}`);
  }
  if (options.remove !== void 0) {
    const idx = parseInt(options.remove, 10);
    const bindings = [...config.bindings ?? []];
    if (idx >= 0 && idx < bindings.length) {
      const removed = bindings.splice(idx, 1);
      config.bindings = bindings;
      saveConfig(config);
      console.log(`Removed binding: ${removed[0]?.channelId} \u2192 ${removed[0]?.agentId}`);
    } else {
      console.error(`Invalid binding index: ${idx}`);
    }
  }
});
program.command("bootstrap").description("Manage API keys and secrets in the bootstrap file").option("--show", "Show all keys (masked)").option("--show-keys", "Show all keys in plain text").option("--edit", "Open bootstrap.env in default editor").option("--set <key=value>", "Set a key (e.g., OPENAI_API_KEY=sk-...)").option("--remove <key>", "Remove a key").option("--path", "Show bootstrap file paths").action(async (options) => {
  const envPath = getBootstrapEnvPath();
  const jsonPath = getBootstrapJsonPath();
  if (options.path) {
    console.log(`bootstrap.env : ${envPath}`);
    console.log(`bootstrap.json: ${jsonPath}`);
    return;
  }
  if (options.edit) {
    const { exec: exec3 } = await import("node:child_process");
    const editor = process.env.EDITOR ?? process.env.VISUAL ?? (process.platform === "win32" ? "notepad" : "vim");
    if (!fs15.existsSync(envPath)) fs15.writeFileSync(envPath, "# MxClaw Bootstrap\n", "utf-8");
    exec3(`${editor} "${envPath}"`);
    return;
  }
  if (options.set) {
    const eqIdx = options.set.indexOf("=");
    if (eqIdx === -1) {
      console.error("Usage: --set KEY=VALUE");
      return;
    }
    const key = options.set.slice(0, eqIdx);
    const value = options.set.slice(eqIdx + 1);
    const entries2 = loadBootstrap();
    entries2[key] = value;
    saveBootstrap(entries2);
    console.log(`\u2705 Set ${key}`);
    return;
  }
  if (options.remove) {
    const entries2 = loadBootstrap();
    if (!(options.remove in entries2)) {
      console.error(`Key "${options.remove}" not found in bootstrap`);
      return;
    }
    delete entries2[options.remove];
    saveBootstrap(entries2);
    console.log(`\u2705 Removed ${options.remove}`);
    return;
  }
  const entries = loadBootstrap();
  const keys = Object.keys(entries);
  if (keys.length === 0) {
    console.log("No bootstrap keys found.");
    console.log("Run 'mxclaw onboard' to set up API keys.");
    return;
  }
  console.log(`Bootstrap keys (${keys.length}):
`);
  const maxLen = Math.max(...keys.map((k) => k.length));
  for (const key of keys) {
    const val = entries[key];
    const display = options.showKeys ? val : `${val.slice(0, 8)}...${val.slice(-4)}`;
    const known = Object.values(PROVIDER_ENV_KEYS).includes(key);
    console.log(`  ${key.padEnd(maxLen + 2)}${known ? "" : "\u26A0\uFE0F "}${display}`);
  }
  console.log(`
Files:
  ${envPath}
  ${jsonPath}`);
});
program.command("init").description("Initialize a new mxclaw installation").option("--clone [directory]", "Clone mxclaw from GitHub and set up a self-hosted instance", false).action(async (options) => {
  if (options.clone === false) {
    console.log("Usage: mxclaw init --clone [directory]");
    console.log("\nClones the mxclaw repository from GitHub, installs dependencies,");
    console.log("builds all packages, and runs the onboard wizard.");
    return;
  }
  const targetDir = options.clone === true ? "mxclaw" : String(options.clone);
  const fullPath = path16.resolve(targetDir);
  if (fs15.existsSync(fullPath)) {
    console.error(`\u274C Directory already exists: ${fullPath}`);
    return;
  }
  console.log(`
  \u{1F680} Cloning mxclaw into ${fullPath}...
`);
  try {
    const { execSync: execSync2 } = await import("node:child_process");
    console.log("  1/4  Cloning repository...");
    execSync2(`git clone https://github.com/mxclaw/mxclaw.git "${fullPath}"`, { stdio: "inherit" });
    console.log("\n  2/4  Installing dependencies...");
    execSync2("pnpm install", { cwd: fullPath, stdio: "inherit" });
    console.log("\n  3/4  Building all packages...");
    execSync2("pnpm -r build", { cwd: fullPath, stdio: "inherit" });
    console.log("\n  4/4  Running onboard wizard...\n");
    process.chdir(fullPath);
    await runOnboard();
    console.log(`
  \u2705 MxClaw initialized in ${fullPath}`);
    console.log(`  Run 'node ${path16.join(fullPath, "dist", "cli.mjs")} gateway' to start the server
`);
  } catch (err) {
    console.error(`
\u274C Initialization failed: ${err instanceof Error ? err.message : String(err)}`);
  }
});
program.parse();
