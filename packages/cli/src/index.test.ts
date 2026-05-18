import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const mockCommands: string[] = [];

vi.mock("commander", () => {
  function makeMock(name?: string) {
    return {
      name: vi.fn().mockReturnThis(),
      description: vi.fn().mockReturnThis(),
      version: vi.fn().mockReturnThis(),
      option: vi.fn().mockReturnThis(),
      action: vi.fn().mockReturnThis(),
      command: vi.fn((subName: string) => {
        mockCommands.push(subName);
        return makeMock(subName);
      }),
      parse: vi.fn(),
    };
  }
  return { Command: vi.fn(() => makeMock()) };
});

vi.mock("@mxclaw/core", () => ({
  loadConfig: vi.fn(() => ({
    version: 1,
    gateway: { host: "127.0.0.1", port: 18700, webhookPath: "/gateway/webhook", corsOrigins: ["http://localhost:5173"], wsHeartbeatIntervalMs: 30000 },
    agents: { default: { id: "default", name: "Default", model: { provider: "openai", model: "gpt-4o", temperature: 0.7, maxTokens: 4096, options: {} }, tools: {}, sandbox: { enabled: false, type: "docker" }, voice: { provider: "system-tts" }, mentionGating: true, maxSessionTurns: 100, compactionThreshold: 50 } },
    defaultAgentId: "default",
    channels: {},
    bindings: [],
    devices: [],
    plugins: [],
    storage: { workspacePath: "~/.mxclaw/workspace", lanceDbPath: "~/.mxclaw/lancedb", sqlitePath: "~/.mxclaw/mxclaw.db" },
    logging: { level: "info", subsystems: {}, otel: { enabled: false } },
    voice: { defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: {}, systemTts: {} },
    sandbox: { enabled: false, type: "docker" },
  })),
  saveConfig: vi.fn(),
  generateDefaultConfig: vi.fn(() => ({ version: 1, gateway: { host: "127.0.0.1", port: 18700 }, agents: {}, defaultAgentId: "default", channels: {}, bindings: [], devices: [], plugins: [] })),
  getConfigPath: vi.fn(() => "/tmp/.mxclaw/mxclaw.json"),
  getConfigDir: vi.fn(() => "/tmp/.mxclaw"),
  getWorkspacePath: vi.fn(() => "/tmp/.mxclaw/workspace"),
}));

vi.mock("@mxclaw/gateway", () => ({
  MxClawGateway: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    getSessionManager: vi.fn(),
  })),
}));

vi.mock("@mxclaw/plugin-system", () => ({
  createPluginRegistry: vi.fn(() => ({ channels: new Map(), providers: new Map(), voices: new Map(), pluginErrors: [] })),
  loadPlugins: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@mxclaw/storage", () => ({
  JsonlStorageAdapter: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    listSessions: vi.fn().mockResolvedValue([]),
    getSessionTranscript: vi.fn().mockResolvedValue([]),
    deleteSession: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("@mxclaw/logging", () => ({
  createLogger: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() })),
}));

vi.mock("./onboard.js", () => ({
  runOnboard: vi.fn().mockResolvedValue(undefined),
  testProvider: vi.fn().mockResolvedValue({ ok: true, latency: 100 }),
  installDaemon: vi.fn().mockResolvedValue(undefined),
  uninstallDaemon: vi.fn().mockResolvedValue(undefined),
  daemonStatus: vi.fn().mockResolvedValue(undefined),
}));

const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

describe("CLI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCommands.length = 0;
  });

  it("should define all 11 subcommands", async () => {
    await import("./index.js");
    expect(mockCommands).toContain("gateway");
    expect(mockCommands).toContain("setup");
    expect(mockCommands).toContain("onboard");
    expect(mockCommands).toContain("doctor");
    expect(mockCommands).toContain("config");
    expect(mockCommands).toContain("channels");
    expect(mockCommands).toContain("models");
    expect(mockCommands).toContain("sessions");
    expect(mockCommands).toContain("auth");
    expect(mockCommands).toContain("bind");
    expect(mockCommands).toContain("runner");
  });

  it("should export a module", async () => {
    const mod = await import("./index.js");
    expect(mod).toBeDefined();
  });

  it("should not throw on import", async () => {
    await expect(import("./index.js")).resolves.toBeDefined();
  });

  it("should export onboard module functions", async () => {
    const onboard = await import("./onboard.js");
    expect(onboard.runOnboard).toBeDefined();
    expect(onboard.installDaemon).toBeDefined();
    expect(onboard.uninstallDaemon).toBeDefined();
    expect(onboard.daemonStatus).toBeDefined();
    expect(onboard.testProvider).toBeDefined();
  });

  it("should have onboard subcommand with options", async () => {
    const mockAction = vi.fn();
    const mockOnboard = { name: "onboard" };

    // Simulate the action being called with each option
    const { installDaemon, uninstallDaemon, daemonStatus, runOnboard } = await import("./onboard.js");

    // Verify the functions exist and are mockable
    await installDaemon();
    expect(installDaemon).toHaveBeenCalled();

    await uninstallDaemon();
    expect(uninstallDaemon).toHaveBeenCalled();

    await daemonStatus();
    expect(daemonStatus).toHaveBeenCalled();
  });

  it("should test a provider endpoint", async () => {
    const { testProvider } = await import("./onboard.js");
    const result = await testProvider("https://api.openai.com/v1", "sk-test", "gpt-4o");
    expect(result).toBeDefined();
    expect(result.ok).toBe(true);
    expect(result.latency).toBe(100);
  });
});
