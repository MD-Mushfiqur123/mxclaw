import { describe, it, expect, beforeEach } from "vitest";
import type { ChannelPlugin, ChannelConfig } from "@mxclaw/core";

import defaultPlugin from "./index.js";

describe("webchat channel", () => {
  let plugin: ChannelPlugin;

  beforeEach(() => {
    plugin = defaultPlugin as unknown as ChannelPlugin;
  });

  describe("manifest", () => {
    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("webchat");
      expect(m.version).toBe("0.1.0");
      expect(m.type).toBe("channel");
      expect(m.description).toBeDefined();
      expect(m.author).toBeDefined();
      expect(m.main).toBeDefined();
      expect(Array.isArray(m.capabilities)).toBe(true);
    });

    it("should list sendMessage, receiveMessage, and pm capabilities", () => {
      const caps = plugin.manifest.capabilities;
      expect(caps).toContain("sendMessage");
      expect(caps).toContain("receiveMessage");
      expect(caps).toContain("pm");
    });
  });

  describe("setupChannel", () => {
    it("should accept config without throwing", async () => {
      const config: ChannelConfig = { id: "webchat-1", type: "webchat", enabled: true, credentials: {}, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
      await expect(plugin.setupChannel(config)).resolves.toBeUndefined();
    });

    it("should accept custom port in credentials", async () => {
      const config: ChannelConfig = { id: "webchat-2", type: "webchat", enabled: true, credentials: { port: 18801 }, options: {}, allowlist: [], mentionGating: true, pairingEnabled: true };
      await expect(plugin.setupChannel(config)).resolves.toBeUndefined();
    });
  });
});
