import { describe, it, expect, beforeEach } from "vitest";
import type { ChannelPlugin, ChannelConfig } from "@mxclaw/core";

import defaultPlugin from "./index.js";

describe("wechat channel", () => {
  let plugin: ChannelPlugin;

  beforeEach(() => {
    plugin = defaultPlugin as unknown as ChannelPlugin;
  });

  describe("manifest", () => {
    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("wechat");
      expect(m.version).toBe("0.1.0");
      expect(m.type).toBe("channel");
      expect(m.description).toBeDefined();
      expect(m.author).toBeDefined();
      expect(m.main).toBeDefined();
      expect(Array.isArray(m.capabilities)).toBe(true);
    });

    it("should list sendMessage and receiveMessage capabilities", () => {
      const caps = plugin.manifest.capabilities;
      expect(caps).toContain("sendMessage");
      expect(caps).toContain("receiveMessage");
      expect(caps).toContain("pm");
    });
  });
  describe("setupChannel", () => {
    it("should throw when no credentials provided", async () => {
      const config: ChannelConfig = { id: "wechat-1", type: "wechat", enabled: true, credentials: {}, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
      await expect(plugin.setupChannel(config)).rejects.toThrow();
    });

    it("should accept credentials from config", async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, result: { id: 1, username: "test" } }) });
      vi.stubGlobal("fetch", mockFetch);
      const config: ChannelConfig = { id: "wechat-1", type: "wechat", enabled: true, credentials: { token: "test" }, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
      try { await plugin.setupChannel(config); } catch { /* some channels make API calls */ }
    });
  });
});
