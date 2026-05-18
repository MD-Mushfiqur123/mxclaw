/**
 * DM send-policy engine.
 *
 * Adapted from OpenClaw (MIT License) — openclaw/openclaw
 * src/sessions/send-policy.ts
 *
 * Resolves whether to allow or deny sending/processing a message
 * from a given sender on a given channel, based on dmPolicy config.
 *
 * dmPolicy values per channel:
 *   "open"    — accept all DMs (no pairing required)
 *   "pairing" — unknown senders get a pairing code (default)
 *   "closed"  — reject all DMs from unknown senders silently
 */

import type { MxClawConfig, ChannelConfig, MessageEnvelope } from "@mxclaw/core";

export type DmPolicy = "open" | "pairing" | "closed";
export type SendPolicyDecision = "allow" | "pairing" | "deny";

/**
 * Normalize raw dmPolicy config string to a canonical DmPolicy value.
 */
export function normalizeDmPolicy(raw?: string | null): DmPolicy {
  if (!raw) return "pairing"; // safe default
  const key = raw.toLowerCase().trim();
  if (key === "open" || key === "public") return "open";
  if (key === "closed" || key === "deny" || key === "block") return "closed";
  return "pairing";
}

/**
 * Resolve the send policy decision for an inbound message.
 *
 * Returns:
 *   "allow"   — process the message normally
 *   "pairing" — send pairing code, do not process
 *   "deny"    — silently drop
 */
export function resolveSendPolicy(params: {
  envelope: MessageEnvelope;
  channelConfig: ChannelConfig;
  cfg: MxClawConfig;
}): SendPolicyDecision {
  const { envelope, channelConfig } = params;

  // Wildcard allowlist ("*") means open to all
  const allowlist = channelConfig.allowlist ?? [];
  if (allowlist.includes("*")) return "allow";

  // Sender explicitly in allowlist → always allow
  if (allowlist.includes(envelope.sender.id)) return "allow";

  // Sender not in allowlist — apply dmPolicy
  const rawPolicy = (channelConfig as { dmPolicy?: string }).dmPolicy;
  const policy = normalizeDmPolicy(rawPolicy ?? (channelConfig.pairingEnabled ? "pairing" : "open"));

  switch (policy) {
    case "open":
      return "allow";
    case "closed":
      return "deny";
    case "pairing":
    default:
      // Empty allowlist + pairing = unknown senders need pairing
      if (allowlist.length === 0 && !channelConfig.pairingEnabled) {
        // pairingEnabled=false + no allowlist = open
        return "allow";
      }
      return "pairing";
  }
}

/**
 * Check if a channel has a risky open DM policy for doctor linting.
 * Returns a warning string or null.
 */
export function checkDmPolicySecurity(
  channelId: string,
  channelConfig: ChannelConfig,
): string | null {
  const allowlist = channelConfig.allowlist ?? [];
  const rawPolicy = (channelConfig as { dmPolicy?: string }).dmPolicy;
  const policy = normalizeDmPolicy(rawPolicy ?? (channelConfig.pairingEnabled ? "pairing" : "open"));

  if (allowlist.includes("*")) {
    return `Channel "${channelId}" (${channelConfig.type}) has wildcard allowlist ("*") — all senders accepted without pairing`;
  }

  if (policy === "open" && allowlist.length === 0) {
    return `Channel "${channelId}" (${channelConfig.type}) has dmPolicy="open" with no allowlist — all DMs accepted`;
  }

  if (!channelConfig.pairingEnabled && allowlist.length === 0 && policy !== "closed") {
    return `Channel "${channelId}" (${channelConfig.type}) has pairingEnabled=false with no allowlist — effectively open`;
  }

  return null;
}
