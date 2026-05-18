import type { SessionTurn, SessionManifest, StorageAdapter } from "@mxclaw/core";
import type { Logger } from "@mxclaw/logging";
/**
 * Manages the lifecycle of agent sessions — creation, isolation,
 * cross-session messaging, and compaction.
 *
 * This mirrors OpenClaw's `src/sessions/` module.
 */
export declare class SessionManager {
    private storage;
    private logger;
    private activeSessions;
    private compactionLocks;
    constructor(storage: StorageAdapter, logger: Logger);
    /**
     * Get or create a session for the given channel/sender/agent triple.
     */
    getOrCreate(channelId: string, senderId: string, agentId: string, conversationId: string): Promise<ActiveSession>;
    /**
     * Spawn a new isolated session for a sub-agent task.
     * Returns the new session key.
     */
    spawnSession(parentSessionKey: string, targetAgentId: string, initialMessage: string, context?: Record<string, unknown>): Promise<SpawnedSession>;
    /**
     * Send a message to an existing session (cross-session communication).
     */
    sendToSession(targetSessionKey: string, targetAgentId: string, message: string): Promise<void>;
    /**
     * List all sessions for an agent.
     */
    listSessions(agentId: string): Promise<SessionManifest[]>;
    /**
     * Get the full transcript for a session.
     */
    getTranscript(agentId: string, sessionKey: string): Promise<SessionTurn[]>;
    /**
     * Reset (delete) a session.
     */
    resetSession(agentId: string, sessionKey: string): Promise<void>;
    /**
     * Append a turn to a session and update the manifest.
     */
    appendTurn(agentId: string, sessionKey: string, turn: SessionTurn): Promise<void>;
    /**
     * Run compaction if the session exceeds the threshold.
     */
    /**
     * Run compaction if the session exceeds the threshold.
     * Safe from concurrent write race conditions.
     */
    maybeCompact(agentId: string, sessionKey: string, threshold: number, summarizer: (turns: SessionTurn[]) => Promise<string>): Promise<SessionTurn[]>;
    /**
     * Get the count of currently tracked sessions.
     */
    get activeCount(): number;
}
export interface ActiveSession {
    sessionKey: string;
    agentId: string;
    channelId: string;
    senderId: string;
    manifest: SessionManifest;
    turns: SessionTurn[];
}
export interface SpawnedSession {
    sessionKey: string;
    agentId: string;
    parentSessionKey: string;
    manifest: SessionManifest;
}
//# sourceMappingURL=session-manager.d.ts.map