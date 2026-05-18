import type { MessageEnvelope, ChannelConfig, AgentConfig } from "@mxclaw/core";
export interface PairingCode {
    code: string;
    channelId: string;
    senderId: string;
    createdAt: number;
    expiresAt: number;
}
export declare function generatePairingCode(channelId: string, senderId: string): PairingCode;
export declare function validatePairingCode(code: string): PairingCode | null;
export declare function isSenderAllowed(envelope: MessageEnvelope, channelConfig: ChannelConfig): boolean;
export declare function addToAllowlist(channelConfig: ChannelConfig, senderId: string): ChannelConfig;
export declare function shouldRespondToMessage(envelope: MessageEnvelope, agentConfig: AgentConfig, channelConfig: ChannelConfig): boolean;
export interface DeviceSession {
    deviceId: string;
    token: string;
    tokenHash: string;
    createdAt: number;
    lastRotatedAt: number;
}
export declare function generateDeviceToken(): string;
export declare function hashToken(token: string): string;
export declare function pairDevice(deviceId: string, deviceName: string): DeviceSession;
export declare function rotateDeviceToken(deviceId: string): DeviceSession | null;
export declare function validateDeviceToken(deviceId: string, token: string): boolean;
export declare function unpairDevice(deviceId: string): void;
export declare function getDeviceSession(deviceId: string): DeviceSession | undefined;
export declare function generatePairingQRData(gatewayHost: string, gatewayPort: number): string;
export declare function requiresApproval(toolName: string, agentConfig: AgentConfig, senderId: string, ownerId: string): boolean;
export interface SandboxConfig {
    enabled: boolean;
    type: "docker" | "ssh";
    image?: string;
    host?: string;
    port?: number;
    username?: string;
}
export declare function getSandboxCommand(sandbox: SandboxConfig, command: string): string;
//# sourceMappingURL=index.d.ts.map