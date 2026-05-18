import type { WsServerMessage, MessageEnvelope } from "@mxclaw/core";
import type { Logger } from "@mxclaw/logging";
import type { ApprovalManager } from "@mxclaw/tools";
import type { VoiceManager } from "@mxclaw/voice";
import { WebSocket } from "ws";
export interface WsClient {
    ws: WebSocket;
    deviceId: string;
    clientId: string;
    /** Sliding window rate limiter state */
    msgTimestamps: number[];
}
export interface WsHandlerDeps {
    logger: Logger;
    approvalManager: ApprovalManager;
    voiceManager: VoiceManager;
    wsClients: Map<string, WsClient>;
    wsHeartbeatIntervalMs: number;
    voiceDefaultProvider: string;
    handleInboundMessage: (envelope: MessageEnvelope) => Promise<void>;
    /** Maximum messages per second per client */
    wsRateLimit: number;
}
/**
 * Handle a new WebSocket connection: auth, heartbeat, rate limiting, message dispatch.
 */
export declare function handleWebSocketConnection(deps: WsHandlerDeps, ws: WebSocket): void;
export declare function sendWs(ws: WebSocket, msg: WsServerMessage): void;
export declare function broadcastWs(clients: Map<string, WsClient>, msg: WsServerMessage, excludeClientId?: string): void;
//# sourceMappingURL=ws-handler.d.ts.map