import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MxClawConfig, MessageEnvelope, ChannelConfig, AgentConfig } from "@mxclaw/core";
import {
  generatePairingCode,
  validatePairingCode,
  isSenderAllowed,
  shouldRespondToMessage,
  pairDevice,
  validateDeviceToken,
  rotateDeviceToken,
  unpairDevice,
  requiresApproval,
  getSandboxCommand,
} from "@mxclaw/security";

describe("Pairing Code System", () => {
  it("should generate a valid pairing code", () => {
    const pairing = generatePairingCode("discord-1", "user-1");
    expect(pairing.code).toHaveLength(8);
    expect(pairing.channelId).toBe("discord-1");
    expect(pairing.senderId).toBe("user-1");
    expect(pairing.expiresAt).toBeGreaterThan(Date.now());
  });

  it("should validate and consume a pairing code", () => {
    const pairing = generatePairingCode("telegram-1", "user-2");
    const result = validatePairingCode(pairing.code);
    expect(result).not.toBeNull();
    expect(result!.channelId).toBe("telegram-1");
    // Second validation should fail (code consumed)
    const result2 = validatePairingCode(pairing.code);
    expect(result2).toBeNull();
  });

  it("should reject invalid pairing codes", () => {
    expect(validatePairingCode("INVALID")).toBeNull();
    expect(validatePairingCode("")).toBeNull();
  });
});

describe("Allowlist Check", () => {
  it("should allow sender in allowlist", () => {
    const env = { sender: { id: "user-1" } } as MessageEnvelope;
    const config = { allowlist: ["user-1", "user-2"], pairingEnabled: false } as ChannelConfig;
    expect(isSenderAllowed(env, config)).toBe(true);
  });

  it("should deny sender not in allowlist", () => {
    const env = { sender: { id: "user-3" } } as MessageEnvelope;
    const config = { allowlist: ["user-1"], pairingEnabled: false } as ChannelConfig;
    expect(isSenderAllowed(env, config)).toBe(false);
  });

  it("should allow all when no allowlist and no pairing", () => {
    const env = { sender: { id: "anyone" } } as MessageEnvelope;
    const config = { allowlist: [], pairingEnabled: false } as ChannelConfig;
    expect(isSenderAllowed(env, config)).toBe(true);
  });

  it("should deny unknown when pairing is enabled and no allowlist", () => {
    const env = { sender: { id: "unknown" } } as MessageEnvelope;
    const config = { allowlist: [], pairingEnabled: true } as ChannelConfig;
    expect(isSenderAllowed(env, config)).toBe(false);
  });
});

describe("Mention Gating", () => {
  it("should always respond to DMs", () => {
    const env = { isGroupMessage: false, isMentioned: false } as MessageEnvelope;
    const agent = { mentionGating: true } as AgentConfig;
    const channel = { mentionGating: true } as ChannelConfig;
    expect(shouldRespondToMessage(env, agent, channel)).toBe(true);
  });

  it("should require mention in groups when gating enabled", () => {
    const agent = { mentionGating: true } as AgentConfig;
    const channel = { mentionGating: true } as ChannelConfig;
    expect(shouldRespondToMessage({ isGroupMessage: true, isMentioned: false } as MessageEnvelope, agent, channel)).toBe(false);
    expect(shouldRespondToMessage({ isGroupMessage: true, isMentioned: true } as MessageEnvelope, agent, channel)).toBe(true);
  });

  it("should respond to all group messages when gating disabled", () => {
    const agent = { mentionGating: false } as AgentConfig;
    const channel = { mentionGating: true } as ChannelConfig;
    expect(shouldRespondToMessage({ isGroupMessage: true, isMentioned: false } as MessageEnvelope, agent, channel)).toBe(true);
  });
});

describe("Device Pairing & Token Rotation", () => {
  it("should pair a device and validate token", () => {
    const session = pairDevice("device-test-1", "Test Device");
    expect(session.deviceId).toBe("device-test-1");
    expect(session.token).toBeTruthy();
    expect(validateDeviceToken("device-test-1", session.token)).toBe(true);
  });

  it("should reject invalid tokens", () => {
    pairDevice("device-test-2", "Test");
    expect(validateDeviceToken("device-test-2", "wrong-token")).toBe(false);
    expect(validateDeviceToken("nonexistent", "any-token")).toBe(false);
  });

  it("should rotate tokens", () => {
    const session = pairDevice("device-test-3", "Test");
    const oldToken = session.token;
    const newSession = rotateDeviceToken("device-test-3");
    expect(newSession).not.toBeNull();
    expect(newSession!.token).not.toBe(oldToken);
    expect(validateDeviceToken("device-test-3", newSession!.token)).toBe(true);
    expect(validateDeviceToken("device-test-3", oldToken)).toBe(false);
  });

  it("should unpair devices", () => {
    const session = pairDevice("device-test-4", "Test");
    unpairDevice("device-test-4");
    expect(validateDeviceToken("device-test-4", session.token)).toBe(false);
  });
});

describe("Approval Gating", () => {
  it("should never require approval in yolo mode", () => {
    const agent = { tools: { bash: { enabled: true, approval: "yolo" } } } as unknown as AgentConfig;
    expect(requiresApproval("bash", agent, "anyone", "owner")).toBe(false);
  });

  it("should always require approval in always-require mode", () => {
    const agent = { tools: { bash: { enabled: true, approval: "always-require-approval" } } } as unknown as AgentConfig;
    expect(requiresApproval("bash", agent, "owner", "owner")).toBe(true);
    expect(requiresApproval("bash", agent, "user", "owner")).toBe(true);
  });

  it("should only require approval for non-owners in owner-only mode", () => {
    const agent = { tools: { bash: { enabled: true, approval: "owner-only" } } } as unknown as AgentConfig;
    expect(requiresApproval("bash", agent, "owner", "owner")).toBe(false);
    expect(requiresApproval("bash", agent, "other-user", "owner")).toBe(true);
  });

  it("should not require approval for disabled tools", () => {
    const agent = { tools: { bash: { enabled: false, approval: "always-require-approval" } } } as unknown as AgentConfig;
    expect(requiresApproval("bash", agent, "anyone", "owner")).toBe(false);
  });
});

describe("Sandbox Command", () => {
  it("should wrap command in Docker", () => {
    const cmd = getSandboxCommand({ enabled: true, type: "docker" }, "echo hello");
    expect(cmd).toContain("docker run");
    expect(cmd).toContain("--network none");
    expect(cmd).toContain("echo hello");
  });

  it("should wrap command in SSH", () => {
    const cmd = getSandboxCommand({ enabled: true, type: "ssh", host: "sandbox.local", port: 2222, username: "agent" }, "ls");
    expect(cmd).toContain("ssh");
    expect(cmd).toContain("sandbox.local");
    expect(cmd).toContain("2222");
    expect(cmd).toContain("agent");
  });

  it("should return raw command when disabled", () => {
    const cmd = getSandboxCommand({ enabled: false, type: "docker" }, "echo hello");
    expect(cmd).toBe("echo hello");
  });
});
