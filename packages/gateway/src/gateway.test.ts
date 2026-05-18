import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external dependencies that the gateway imports
vi.mock("@mxclaw/core", () => ({
  loadConfig: vi.fn(() => ({
    version: 1,
    gateway: { host: "127.0.0.1", port: 18700, webhookPath: "/gateway/webhook", corsOrigins: ["http://localhost:5173"], wsHeartbeatIntervalMs: 30000 },
    agents: { default: { id: "default", name: "Default", model: { provider: "openai", model: "gpt-4o" }, tools: {}, sandbox: { enabled: false, type: "docker" }, voice: { provider: "system-tts" }, mentionGating: true, maxSessionTurns: 100, compactionThreshold: 50 } },
    defaultAgentId: "default",
    channels: {},
    bindings: [],
    devices: [],
    plugins: [],
    storage: { workspacePath: "/tmp/mxclaw-test" },
    logging: { level: "silent" },
    voice: { defaultProvider: "system-tts" },
    sandbox: { enabled: false, type: "docker" },
  })),
  getWorkspacePath: vi.fn(() => "/tmp/mxclaw-test"),
  watchConfig: vi.fn(() => vi.fn()),
}));

vi.mock("@mxclaw/plugin-system", () => ({
  createPluginRegistry: vi.fn(() => ({ channels: new Map(), providers: new Map(), voices: new Map(), pluginErrors: [] })),
  loadPlugins: vi.fn().mockResolvedValue(undefined),
  getChannelPlugin: vi.fn(() => undefined),
}));

vi.mock("@mxclaw/storage", () => ({
  JsonlStorageAdapter: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  SqliteStorageAdapter: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  deriveSessionKey: vi.fn(() => "test-key"),
}));

vi.mock("@mxclaw/security", () => ({
  isSenderAllowed: vi.fn(() => true),
  shouldRespondToMessage: vi.fn(() => true),
  generatePairingCode: vi.fn(() => ({ code: "ABCD", channelId: "test", senderId: "user", expiresAt: Date.now() + 300000 })),
}));

vi.mock("@mxclaw/security/secrets", () => ({
  SecretsManager: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(undefined),
    listKeys: vi.fn(() => []),
    getSecret: vi.fn(),
    setSecret: vi.fn(),
  })),
}));

vi.mock("@mxclaw/tools", () => ({
  getTool: vi.fn(() => undefined),
  getToolDefinitionsForLLM: vi.fn(() => []),
  ApprovalManager: vi.fn().mockImplementation(() => ({
    requestApproval: vi.fn(),
    resolveApproval: vi.fn(),
    getPendingApprovals: vi.fn(() => []),
  })),
  registerMemoryAdapter: vi.fn(),
}));

vi.mock("@mxclaw/logging", () => ({
  createLogger: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() })),
}));

vi.mock("@mxclaw/voice", () => ({
  VoiceManager: vi.fn().mockImplementation(() => ({
    register: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
    startVoiceSession: vi.fn(),
    stopSession: vi.fn(),
    getActiveSessions: vi.fn(() => []),
  })),
}));

vi.mock("@mxclaw/skills", () => ({
  SkillLoader: vi.fn().mockImplementation(() => ({
    loadAll: vi.fn().mockResolvedValue(undefined),
    getAllSkills: vi.fn(() => []),
    buildSkillsPrompt: vi.fn(() => ""),
  })),
}));

vi.mock("@mxclaw/memory", () => ({
  InMemoryMemoryAdapter: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(undefined),
    stats: vi.fn().mockResolvedValue({ total: 0 }),
    store: vi.fn().mockResolvedValue(undefined),
    recall: vi.fn().mockResolvedValue([]),
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock node:http to prevent EADDRINUSE
vi.mock("node:http", () => ({
  createServer: vi.fn(() => ({
    listen: vi.fn((_port: number, _host: string, cb?: () => void) => { cb?.(); return this; }),
    close: vi.fn((cb?: () => void) => { cb?.(); }),
    address: vi.fn(() => ({ port: 18700, address: "127.0.0.1", family: "IPv4" })),
  })),
}));

// Mock ws to prevent real WebSocket server creation
vi.mock("ws", () => {
  const MockWebSocket = vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
    send: vi.fn(),
    readyState: 1,
  }));
  return {
    WebSocket: MockWebSocket,
    WebSocketServer: vi.fn(() => ({
      on: vi.fn(),
      close: vi.fn(),
      clients: new Set(),
    })),
  };
});

import { MxClawGateway } from "./index.js";

describe("MxClawGateway", () => {
  let gateway: MxClawGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new MxClawGateway("/fake/path/config.json");
  });

  describe("constructor", () => {
    it("should construct without error", () => {
      expect(gateway).toBeDefined();
      expect(gateway).toBeInstanceOf(MxClawGateway);
    });
  });

  describe("start / stop lifecycle", () => {
    it("should start without error", async () => {
      await expect(gateway.start()).resolves.toBeUndefined();
    });

    it("should stop after start without error", async () => {
      await gateway.start();
      await expect(gateway.stop()).resolves.toBeUndefined();
    });

    it("should be safe to call stop multiple times", async () => {
      await gateway.start();
      await gateway.stop();
      await expect(gateway.stop()).resolves.toBeUndefined();
    });
  });

  describe("class exports", () => {
    it("should export MxClawGateway as a class", () => {
      expect(typeof MxClawGateway).toBe("function");
    });

    it("should have start as a method", () => {
      expect(typeof gateway.start).toBe("function");
    });

    it("should have stop as a method", () => {
      expect(typeof gateway.stop).toBe("function");
    });

    it("should have getSessionManager as a method", () => {
      expect(typeof gateway.getSessionManager).toBe("function");
    });
  });
});
