import { SessionManager } from "./session-manager.js";
export { SessionManager } from "./session-manager.js";
export type { GatewayContext } from "./http-handler.js";
export type { WsClient } from "./ws-handler.js";
/**
 * MxClaw Gateway — the central orchestrator.
 *
 * Architecture mirrors OpenClaw's modular `src/` layout:
 *   - http-handler.ts  → HTTP route dispatch
 *   - ws-handler.ts    → WebSocket auth + messaging
 *   - agent-runner.ts  → LLM completion with fallback chain
 *   - tool-executor.ts → Tool dispatch, approval, timeout
 *   - session-manager  → Session lifecycle, spawn, compaction
 *   - utils.ts         → Pure helpers (readBody, redact, retry)
 */
export declare class MxClawGateway {
    private config;
    private registry;
    private storage;
    private logger;
    private approvalManager;
    private voiceManager;
    private sessionManager;
    private server;
    private wss;
    private wsClients;
    private outboundQueues;
    private startTime;
    private configWatcherDispose?;
    private channelMessageCounts;
    private providerStatuses;
    private rateLimiter;
    private skillLoader?;
    private contextEngine?;
    private secretsManager?;
    private memory?;
    constructor(configPath?: string);
    start(): Promise<void>;
    stop(): Promise<void>;
    private startChannels;
    private startServer;
    private handleInboundMessage;
    private resolveAgentBinding;
    private processMessage;
    private resolveConfigSecrets;
    private buildContext;
    /** Expose session manager for tool integration. */
    getSessionManager(): SessionManager;
}
//# sourceMappingURL=index.d.ts.map