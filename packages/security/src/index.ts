import type { MessageEnvelope, ChannelConfig, AgentConfig, MxClawConfig } from "@mxclaw/core";
import * as crypto from "node:crypto";

// ── Send-Policy Engine (adapted from OpenClaw) ────────────────────
export {
  resolveSendPolicy,
  normalizeDmPolicy,
  checkDmPolicySecurity,
  type DmPolicy,
  type SendPolicyDecision,
} from "./send-policy.js";

// ── Pairing Code System ───────────────────────────────────────────

export interface PairingCode {
  code: string;
  channelId: string;
  senderId: string;
  createdAt: number;
  expiresAt: number;
}

const pairingCodes = new Map<string, PairingCode>();

export function generatePairingCode(channelId: string, senderId: string): PairingCode {
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  const pairing: PairingCode = {
    code,
    channelId,
    senderId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minute expiry
  };
  pairingCodes.set(code, pairing);
  return pairing;
}

export function validatePairingCode(code: string): PairingCode | null {
  const pairing = pairingCodes.get(code);
  if (!pairing) return null;
  if (Date.now() > pairing.expiresAt) {
    pairingCodes.delete(code);
    return null;
  }
  pairingCodes.delete(code);
  return pairing;
}

export function listPairingCodes(): PairingCode[] {
  const now = Date.now();
  const valid: PairingCode[] = [];
  for (const [code, pairing] of pairingCodes.entries()) {
    if (now > pairing.expiresAt) {
      pairingCodes.delete(code);
    } else {
      valid.push(pairing);
    }
  }
  return valid;
}

// ── Allowlist Check ───────────────────────────────────────────────

export function isSenderAllowed(
  envelope: MessageEnvelope,
  channelConfig: ChannelConfig,
): boolean {
  const allowlist = channelConfig.allowlist ?? [];
  // Wildcard — allow everyone
  if (allowlist.includes("*")) return true;
  if (allowlist.length === 0) {
    // If pairing is enabled and no allowlist, unknown senders need pairing
    return !channelConfig.pairingEnabled;
  }
  return allowlist.includes(envelope.sender.id);
}

export function addToAllowlist(
  channelConfig: ChannelConfig,
  senderId: string,
): ChannelConfig {
  const allowlist = [...(channelConfig.allowlist ?? [])];
  if (!allowlist.includes(senderId)) {
    allowlist.push(senderId);
  }
  return { ...channelConfig, allowlist };
}

// ── Mention Gating ────────────────────────────────────────────────

export function shouldRespondToMessage(
  envelope: MessageEnvelope,
  agentConfig: AgentConfig,
  channelConfig: ChannelConfig,
): boolean {
  // Direct messages always respond
  if (!envelope.isGroupMessage) return true;

  // Check channel-level mention gating
  const channelMentionGating = channelConfig.mentionGating ?? true;
  if (!channelMentionGating) return true;

  // Check agent-level mention gating
  const agentMentionGating = agentConfig.mentionGating ?? true;
  if (!agentMentionGating) return true;

  // Must be mentioned
  return envelope.isMentioned;
}

// ── Device Pairing & Token Rotation ───────────────────────────────

export interface DeviceSession {
  deviceId: string;
  token: string;
  tokenHash: string;
  createdAt: number;
  lastRotatedAt: number;
}

const deviceSessions = new Map<string, DeviceSession>();

export function generateDeviceToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function pairDevice(deviceId: string, deviceName: string): DeviceSession {
  const token = generateDeviceToken();
  const session: DeviceSession = {
    deviceId,
    token,
    tokenHash: hashToken(token),
    createdAt: Date.now(),
    lastRotatedAt: Date.now(),
  };
  deviceSessions.set(deviceId, session);
  return session;
}

export function rotateDeviceToken(deviceId: string): DeviceSession | null {
  const existing = deviceSessions.get(deviceId);
  if (!existing) return null;

  const newToken = generateDeviceToken();
  const session: DeviceSession = {
    ...existing,
    token: newToken,
    tokenHash: hashToken(newToken),
    lastRotatedAt: Date.now(),
  };
  deviceSessions.set(deviceId, session);
  return session;
}

export function validateDeviceToken(deviceId: string, token: string): boolean {
  const session = deviceSessions.get(deviceId);
  if (!session) return false;
  return hashToken(token) === session.tokenHash;
}

export function unpairDevice(deviceId: string): void {
  deviceSessions.delete(deviceId);
}

export function getDeviceSession(deviceId: string): DeviceSession | undefined {
  return deviceSessions.get(deviceId);
}

// ── QR Code Data (for mobile pairing) ─────────────────────────────

export function generatePairingQRData(gatewayHost: string, gatewayPort: number): string {
  const token = generateDeviceToken();
  const data = {
    type: "mxclaw-pairing",
    host: gatewayHost,
    port: gatewayPort,
    token,
    timestamp: Date.now(),
  };
  return JSON.stringify(data);
}

// ── Approval Gating ───────────────────────────────────────────────

export function requiresApproval(
  toolName: string,
  agentConfig: AgentConfig,
  senderId: string,
  ownerId: string,
): boolean {
  const toolConfig = agentConfig.tools?.[toolName as keyof typeof agentConfig.tools];
  if (!toolConfig?.enabled) return false;

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

// ── Sandbox Execution ─────────────────────────────────────────────

export interface SandboxConfig {
  enabled: boolean;
  type: "docker" | "ssh";
  image?: string;
  host?: string;
  port?: number;
  username?: string;
}

export function getSandboxCommand(
  sandbox: SandboxConfig,
  command: string,
): string {
  if (!sandbox.enabled) return command;

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