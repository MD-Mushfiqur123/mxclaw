import * as crypto from "node:crypto";
const pairingCodes = new Map();
export function generatePairingCode(channelId, senderId) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const pairing = {
        code,
        channelId,
        senderId,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minute expiry
    };
    pairingCodes.set(code, pairing);
    return pairing;
}
export function validatePairingCode(code) {
    const pairing = pairingCodes.get(code);
    if (!pairing)
        return null;
    if (Date.now() > pairing.expiresAt) {
        pairingCodes.delete(code);
        return null;
    }
    pairingCodes.delete(code);
    return pairing;
}
// ── Allowlist Check ───────────────────────────────────────────────
export function isSenderAllowed(envelope, channelConfig) {
    const allowlist = channelConfig.allowlist ?? [];
    if (allowlist.length === 0) {
        // If pairing is enabled and no allowlist, unknown senders need pairing
        return !channelConfig.pairingEnabled;
    }
    return allowlist.includes(envelope.sender.id);
}
export function addToAllowlist(channelConfig, senderId) {
    const allowlist = [...(channelConfig.allowlist ?? [])];
    if (!allowlist.includes(senderId)) {
        allowlist.push(senderId);
    }
    return { ...channelConfig, allowlist };
}
// ── Mention Gating ────────────────────────────────────────────────
export function shouldRespondToMessage(envelope, agentConfig, channelConfig) {
    // Direct messages always respond
    if (!envelope.isGroupMessage)
        return true;
    // Check channel-level mention gating
    const channelMentionGating = channelConfig.mentionGating ?? true;
    if (!channelMentionGating)
        return true;
    // Check agent-level mention gating
    const agentMentionGating = agentConfig.mentionGating ?? true;
    if (!agentMentionGating)
        return true;
    // Must be mentioned
    return envelope.isMentioned;
}
const deviceSessions = new Map();
export function generateDeviceToken() {
    return crypto.randomBytes(32).toString("base64url");
}
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export function pairDevice(deviceId, deviceName) {
    const token = generateDeviceToken();
    const session = {
        deviceId,
        token,
        tokenHash: hashToken(token),
        createdAt: Date.now(),
        lastRotatedAt: Date.now(),
    };
    deviceSessions.set(deviceId, session);
    return session;
}
export function rotateDeviceToken(deviceId) {
    const existing = deviceSessions.get(deviceId);
    if (!existing)
        return null;
    const newToken = generateDeviceToken();
    const session = {
        ...existing,
        token: newToken,
        tokenHash: hashToken(newToken),
        lastRotatedAt: Date.now(),
    };
    deviceSessions.set(deviceId, session);
    return session;
}
export function validateDeviceToken(deviceId, token) {
    const session = deviceSessions.get(deviceId);
    if (!session)
        return false;
    return hashToken(token) === session.tokenHash;
}
export function unpairDevice(deviceId) {
    deviceSessions.delete(deviceId);
}
export function getDeviceSession(deviceId) {
    return deviceSessions.get(deviceId);
}
// ── QR Code Data (for mobile pairing) ─────────────────────────────
export function generatePairingQRData(gatewayHost, gatewayPort) {
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
export function requiresApproval(toolName, agentConfig, senderId, ownerId) {
    const toolConfig = agentConfig.tools?.[toolName];
    if (!toolConfig?.enabled)
        return false;
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
export function getSandboxCommand(sandbox, command) {
    if (!sandbox.enabled)
        return command;
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
//# sourceMappingURL=index.js.map