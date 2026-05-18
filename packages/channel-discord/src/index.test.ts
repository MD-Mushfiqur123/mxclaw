import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ChannelPlugin, ChannelConfig, MessageEnvelope, ReplyEnvelope, ChannelStatus, PluginManifest } from "@mxclaw/core";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

let lastWs: MockWebSocket | null = null;

class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: ((e: { code: number; reason: string }) => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: ((e: Error) => void) | null = null;
  readyState = 0;
  static OPEN = 1;
  static CONNECTING = 0;
  send = vi.fn();
  close = vi.fn((code?: number, reason?: string) => {
    this.readyState = 3;
    this.onclose?.({ code: code ?? 1000, reason: reason ?? "" });
  });
  addEventListener = vi.fn();
  removeEventListener = vi.fn();

  constructor(_url: string) {
    lastWs = this;
  }
}

vi.stubGlobal("WebSocket", MockWebSocket);

import defaultPlugin from "./index.js";

async function simulateDiscordConnected() {
  if (!lastWs) throw new Error("No WebSocket created");
  if (!lastWs.onopen) throw new Error("WebSocket onopen not assigned");
  lastWs.onopen();
  await vi.waitFor(() => { expect(lastWs!.send).toHaveBeenCalled(); });
  // Simulate Hello (op 10) with heartbeat interval
  lastWs.onmessage!({ data: JSON.stringify({ op: 10, d: { heartbeat_interval: 41250 } }) });
  // Wait a tick for the heartbeat interval to be set
  await new Promise(r => setTimeout(r, 5));
  // Simulate READY dispatch (op 0, t: "READY")
  lastWs.onmessage!({ data: JSON.stringify({ op: 0, t: "READY", s: 1, d: { session_id: "test-session", user: { id: "bot-1" } } }) });
  await new Promise(r => setTimeout(r, 5));
}

describe("Discord Channel Plugin Interface Compliance", () => {
  let plugin: ChannelPlugin;

  beforeEach(() => {
    vi.clearAllMocks();
    lastWs = null;
    plugin = defaultPlugin as unknown as ChannelPlugin;
    mockFetch.mockReset();
  });

  describe("manifest", () => {
    it("should have a valid manifest with all required fields", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("discord");
      expect(m.version).toBe("0.1.0");
      expect(m.type).toBe("channel");
      expect(m.description).toBeDefined();
      expect(m.author).toBeDefined();
      expect(m.main).toBeDefined();
      expect(Array.isArray(m.capabilities)).toBe(true);
    });

    it("should have sendMessage and receiveMessage capabilities", () => {
      const m = plugin.manifest;
      expect(m.capabilities).toContain("sendMessage");
      expect(m.capabilities).toContain("receiveMessage");
    });
  });

  describe("setupChannel", () => {
    it("should throw when no token provided", async () => {
      const config: ChannelConfig = { id: "discord-1", type: "discord", enabled: true, credentials: {}, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
      await expect(plugin.setupChannel(config)).rejects.toThrow(/token/i);
    });

    it("should accept token from credentials", async () => {
      const config: ChannelConfig = { id: "discord-1", type: "discord", enabled: true, credentials: { token: "my-bot-token" }, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
      await expect(plugin.setupChannel(config)).resolves.toBeUndefined();
    });

    it("should accept token from env var", async () => {
      vi.stubEnv("DISCORD_BOT_TOKEN", "env-token");
      const config: ChannelConfig = { id: "discord-1", type: "discord", enabled: true, credentials: {}, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
      await expect(plugin.setupChannel(config)).resolves.toBeUndefined();
      vi.unstubAllEnvs();
    });
  });

  describe("startChannel", () => {
    const config: ChannelConfig = { id: "discord-1", type: "discord", enabled: true, credentials: { token: "test-token" }, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
    const onMessage = vi.fn();

    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ url: "wss://gateway.discord.gg" }),
      });
      await plugin.setupChannel(config);
    });

    it("should start without error", async () => {
      await expect(plugin.startChannel(config, onMessage)).resolves.toBeUndefined();
    });

    it("should connect WebSocket on start", async () => {
      await plugin.startChannel(config, onMessage);
      expect(lastWs).not.toBeNull();
    });

    it("should call onMessage when Discord message is received", async () => {
      await plugin.startChannel(config, onMessage);
      await simulateDiscordConnected();

      const fakeMsg = {
        op: 0, t: "MESSAGE_CREATE", s: 2,
        d: { id: "msg-1", channel_id: "123", content: "Hello bot!", author: { id: "user-1", username: "TestUser" }, mentions: [], attachments: [] },
      };
      lastWs!.onmessage!({ data: JSON.stringify(fakeMsg) });

      expect(onMessage).toHaveBeenCalled();
      const env = onMessage.mock.calls[0][0] as MessageEnvelope;
      expect(env.content[0]).toMatchObject({ type: "text", text: "Hello bot!" });
    });
  });

  describe("sendMessage", () => {
    const config: ChannelConfig = { id: "discord-1", type: "discord", enabled: true, credentials: { token: "test-token" }, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
    const onMessage = vi.fn();

    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ url: "wss://gateway.discord.gg" }),
      });
      await plugin.setupChannel(config);
      await plugin.startChannel(config, onMessage);
      await simulateDiscordConnected();
      mockFetch.mockClear();
    });

    it("should send a text reply to a channel", async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const reply: ReplyEnvelope = { conversationId: "123", content: [{ type: "text", text: "Hello!" }], isStreaming: false, metadata: {} };
      await plugin.sendMessage("discord-1", reply);
      expect(mockFetch).toHaveBeenCalled();
      const callUrl = mockFetch.mock.calls[0][0] as string;
      expect(callUrl).toContain("discord.com/api/v10/channels/123/messages");
    });

    it("should not call fetch for empty content", async () => {
      const reply: ReplyEnvelope = { conversationId: "123", content: [], isStreaming: false, metadata: {} };
      await plugin.sendMessage("discord-1", reply);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should queue messages when not connected", async () => {
      await plugin.stopChannel("discord-1");
      mockFetch.mockClear();

      const reply: ReplyEnvelope = { conversationId: "456", content: [{ type: "text", text: "Queued" }], isStreaming: false, metadata: {} };
      await plugin.sendMessage("discord-1", reply);
    });

    it("should throw on Discord API error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 403, statusText: "Forbidden" });
      const reply: ReplyEnvelope = { conversationId: "123", content: [{ type: "text", text: "Test" }], isStreaming: false, metadata: {} };
      await expect(plugin.sendMessage("discord-1", reply)).rejects.toThrow(/403/);
    });
  });

  describe("stopChannel", () => {
    const config: ChannelConfig = { id: "discord-1", type: "discord", enabled: true, credentials: { token: "test-token" }, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
    const onMessage = vi.fn();

    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ url: "wss://gateway.discord.gg" }),
      });
      await plugin.setupChannel(config);
      await plugin.startChannel(config, onMessage);
      mockFetch.mockClear();
    });

    it("should stop a channel without error", async () => {
      await expect(plugin.stopChannel("discord-1")).resolves.toBeUndefined();
    });

    it("should return disconnected status after stop", async () => {
      await plugin.stopChannel("discord-1");
      const status = await plugin.getStatus("discord-1");
      expect(status.connected).toBe(false);
    });
  });

  describe("getStatus", () => {
    const config: ChannelConfig = { id: "discord-1", type: "discord", enabled: true, credentials: { token: "test-token" }, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
    const onMessage = vi.fn();

    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ url: "wss://gateway.discord.gg" }),
      });
      await plugin.setupChannel(config);
    });

    it("should return status with correct shape", async () => {
      await plugin.startChannel(config, onMessage);
      const status = await plugin.getStatus("discord-1");
      expect(status).toHaveProperty("id");
      expect(status).toHaveProperty("type", "discord");
      expect(status).toHaveProperty("connected");
      expect(status).toHaveProperty("messageCount");
      expect(status).toHaveProperty("queueSize");
    });

    it("should indicate disconnected when not started", async () => {
      const status = await plugin.getStatus("discord-1");
      expect(status.connected).toBe(false);
    });
  });
});
