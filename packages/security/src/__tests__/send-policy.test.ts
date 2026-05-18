import { describe, it, expect } from "vitest";
import { resolveSendPolicy, normalizeDmPolicy, checkDmPolicySecurity } from "../send-policy.js";
import type { ChannelConfig, MessageEnvelope, MxClawConfig } from "@mxclaw/core";

describe("Send Policy Engine", () => {
  describe("normalizeDmPolicy", () => {
    it("normalizes policy strings correctly", () => {
      expect(normalizeDmPolicy("open")).toBe("open");
      expect(normalizeDmPolicy("public")).toBe("open");
      expect(normalizeDmPolicy("closed")).toBe("closed");
      expect(normalizeDmPolicy("deny")).toBe("closed");
      expect(normalizeDmPolicy("block")).toBe("closed");
      expect(normalizeDmPolicy("pairing")).toBe("pairing");
      expect(normalizeDmPolicy(undefined)).toBe("pairing");
      expect(normalizeDmPolicy(null)).toBe("pairing");
      expect(normalizeDmPolicy("unknown")).toBe("pairing");
    });
  });

  describe("resolveSendPolicy", () => {
    const createEnvelope = (senderId: string): MessageEnvelope => ({
      id: "msg-1",
      channel: "test-channel",
      timestamp: Date.now(),
      sender: { id: senderId, name: "Test User" },
      content: [],
      isMentioned: true,
      isGroupMessage: false,
    });

    const createConfig = (): MxClawConfig => ({
      version: 1,
      gateway: { host: "127.0.0.1", port: 3000 },
      storage: { type: "jsonl" },
      voice: { defaultProvider: "none" },
      channels: {},
      agents: {},
    });

    it("allows sender explicitly in allowlist", () => {
      const envelope = createEnvelope("user-1");
      const channelConfig: ChannelConfig = {
        type: "discord",
        enabled: true,
        allowlist: ["user-1"],
        pairingEnabled: true,
      };

      const result = resolveSendPolicy({ envelope, channelConfig, cfg: createConfig() });
      expect(result).toBe("allow");
    });

    it("allows any sender if allowlist contains wildcard", () => {
      const envelope = createEnvelope("unknown-user");
      const channelConfig: ChannelConfig = {
        type: "discord",
        enabled: true,
        allowlist: ["*"],
        pairingEnabled: true,
      };

      const result = resolveSendPolicy({ envelope, channelConfig, cfg: createConfig() });
      expect(result).toBe("allow");
    });

    it("enforces pairing policy for unknown senders when pairingEnabled is true", () => {
      const envelope = createEnvelope("unknown-user");
      const channelConfig: ChannelConfig = {
        type: "discord",
        enabled: true,
        allowlist: ["user-1"],
        pairingEnabled: true,
      };

      const result = resolveSendPolicy({ envelope, channelConfig, cfg: createConfig() });
      expect(result).toBe("pairing");
    });

    it("enforces closed policy for unknown senders when dmPolicy=closed", () => {
      const envelope = createEnvelope("unknown-user");
      const channelConfig: ChannelConfig = {
        type: "discord",
        enabled: true,
        allowlist: ["user-1"],
        pairingEnabled: true,
      } as ChannelConfig;
      // Inject dmPolicy
      (channelConfig as any).dmPolicy = "closed";

      const result = resolveSendPolicy({ envelope, channelConfig, cfg: createConfig() });
      expect(result).toBe("deny");
    });

    it("defaults to open if no allowlist and pairingEnabled=false", () => {
      const envelope = createEnvelope("unknown-user");
      const channelConfig: ChannelConfig = {
        type: "discord",
        enabled: true,
        allowlist: [],
        pairingEnabled: false,
      };

      const result = resolveSendPolicy({ envelope, channelConfig, cfg: createConfig() });
      expect(result).toBe("allow");
    });
  });

  describe("checkDmPolicySecurity", () => {
    it("warns on wildcard allowlist", () => {
      const config: ChannelConfig = { type: "discord", enabled: true, allowlist: ["*"] };
      expect(checkDmPolicySecurity("chan1", config)).toMatch(/wildcard allowlist/);
    });

    it("warns on open policy with no allowlist", () => {
      const config: ChannelConfig = { type: "discord", enabled: true, allowlist: [] };
      (config as any).dmPolicy = "open";
      expect(checkDmPolicySecurity("chan1", config)).toMatch(/dmPolicy="open"/);
    });

    it("warns on pairingEnabled=false with no allowlist", () => {
      const config: ChannelConfig = { type: "discord", enabled: true, allowlist: [], pairingEnabled: false };
      expect(checkDmPolicySecurity("chan1", config)).toMatch(/effectively open/);
    });

    it("returns null for secure configs", () => {
      const config1: ChannelConfig = { type: "discord", enabled: true, allowlist: ["user-1"], pairingEnabled: true };
      expect(checkDmPolicySecurity("chan1", config1)).toBeNull();

      const config2: ChannelConfig = { type: "discord", enabled: true, allowlist: [], pairingEnabled: true };
      expect(checkDmPolicySecurity("chan2", config2)).toBeNull();
    });
  });
});
