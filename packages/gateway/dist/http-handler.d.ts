import type { MxClawConfig, MessageEnvelope, ReplyEnvelope, GatewayStatus, ProviderStatus, StorageAdapter } from "@mxclaw/core";
import type { MemoryAdapter } from "@mxclaw/memory";
import { createPluginRegistry } from "@mxclaw/plugin-system";
import { IPRateLimiter } from "./rate-limiter.js";
import { ApprovalManager } from "@mxclaw/tools";
import type { Logger } from "@mxclaw/logging";
import type { SkillLoader } from "@mxclaw/skills";
import * as http from "node:http";
/**
 * Shared gateway context passed to sub-handlers.
 */
export interface GatewayContext {
    config: MxClawConfig;
    registry: ReturnType<typeof createPluginRegistry>;
    storage: StorageAdapter;
    logger: Logger;
    approvalManager: ApprovalManager;
    rateLimiter: IPRateLimiter;
    channelMessageCounts: Map<string, number>;
    providerStatuses: Map<string, ProviderStatus>;
    outboundQueues: Map<string, ReplyEnvelope[]>;
    startTime: number;
    skillLoader?: SkillLoader;
    memory?: MemoryAdapter;
    /** Dispatch an inbound message into the routing engine. */
    handleInboundMessage: (envelope: MessageEnvelope) => Promise<void>;
    /** Send a WS message to all connected clients. */
    broadcastWs: (msg: unknown, exclude?: string) => void;
}
/**
 * Generate a cryptographically secure API token for gateway access.
 */
export declare function generateApiToken(): string;
/**
 * Master HTTP request handler — dispatches to the correct route.
 */
export declare function handleHttpRequest(ctx: GatewayContext, req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
export declare function getGatewayStatus(ctx: GatewayContext): Promise<GatewayStatus>;
//# sourceMappingURL=http-handler.d.ts.map