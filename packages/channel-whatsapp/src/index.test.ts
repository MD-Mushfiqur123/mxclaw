import { describe, it, expect, beforeEach } from "vitest";
import type { ChannelPlugin, ChannelConfig } from "@mxclaw/core";

import defaultPlugin from "./index.js";

describe("whatsapp channel", () => {
  let plugin: ChannelPlugin;

  beforeEach(() => {
    plugin = defaultPlugin as unknown as ChannelPlugin;
  });

  describe("manifest", () => {
    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("whatsapp");
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
      expect(caps).toContain("media");
      expect(caps).toContain("groups");
      expect(caps).toContain("qr-auth");
    });
  });
});
