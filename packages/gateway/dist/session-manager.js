import { deriveSessionKey, compactSession } from "@mxclaw/storage";
import { v4 as uuidv4 } from "uuid";
/**
 * Manages the lifecycle of agent sessions — creation, isolation,
 * cross-session messaging, and compaction.
 *
 * This mirrors OpenClaw's `src/sessions/` module.
 */
export class SessionManager {
    storage;
    logger;
    activeSessions = new Map();
    compactionLocks = new Set(); // Tracks sessions currently undergoing compaction
    constructor(storage, logger) {
        this.storage = storage;
        this.logger = logger;
    }
    // ── Session Lifecycle ─────────────────────────────────────────────
    /**
     * Get or create a session for the given channel/sender/agent triple.
     */
    async getOrCreate(channelId, senderId, agentId, conversationId) {
        const sessionKey = deriveSessionKey(channelId, senderId, agentId);
        if (this.activeSessions.has(sessionKey)) {
            return this.activeSessions.get(sessionKey);
        }
        // Load or create manifest
        let manifest = await this.storage.getSessionManifest(agentId, sessionKey);
        if (!manifest) {
            manifest = {
                sessionKey,
                agentId,
                channelId,
                senderId,
                conversationId,
                createdAt: Date.now(),
                lastActiveAt: Date.now(),
                turnCount: 0,
                compactionPoints: [],
            };
            await this.storage.upsertSessionManifest(manifest);
            this.logger.debug("session", `Created new session: ${sessionKey}`);
        }
        // Load transcript
        const turns = await this.storage.getSessionTranscript(agentId, sessionKey);
        const session = {
            sessionKey,
            agentId,
            channelId,
            senderId,
            manifest,
            turns,
        };
        this.activeSessions.set(sessionKey, session);
        return session;
    }
    /**
     * Spawn a new isolated session for a sub-agent task.
     * Returns the new session key.
     */
    async spawnSession(parentSessionKey, targetAgentId, initialMessage, context) {
        const spawnId = uuidv4().slice(0, 8);
        const sessionKey = `spawn:${targetAgentId}:${spawnId}`;
        const manifest = {
            sessionKey,
            agentId: targetAgentId,
            channelId: "internal",
            senderId: `session:${parentSessionKey}`,
            conversationId: `spawn-${spawnId}`,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
            turnCount: 0,
            compactionPoints: [],
        };
        await this.storage.upsertSessionManifest(manifest);
        // Seed with the initial message
        const userTurn = {
            role: "user",
            content: initialMessage,
            timestamp: Date.now(),
        };
        await this.storage.appendTurn(targetAgentId, sessionKey, userTurn);
        // If context is provided, prepend it as a system note
        if (context && Object.keys(context).length > 0) {
            const contextTurn = {
                role: "system",
                content: `Context from parent session: ${JSON.stringify(context)}`,
                timestamp: Date.now(),
            };
            await this.storage.appendTurn(targetAgentId, sessionKey, contextTurn);
        }
        this.logger.info("session", `Spawned session ${sessionKey} from parent ${parentSessionKey}`);
        return {
            sessionKey,
            agentId: targetAgentId,
            parentSessionKey,
            manifest,
        };
    }
    /**
     * Send a message to an existing session (cross-session communication).
     */
    async sendToSession(targetSessionKey, targetAgentId, message) {
        const turn = {
            role: "user",
            content: message,
            timestamp: Date.now(),
        };
        await this.storage.appendTurn(targetAgentId, targetSessionKey, turn);
        this.logger.debug("session", `Sent message to session ${targetSessionKey}`);
    }
    /**
     * List all sessions for an agent.
     */
    async listSessions(agentId) {
        return this.storage.listSessions(agentId);
    }
    /**
     * Get the full transcript for a session.
     */
    async getTranscript(agentId, sessionKey) {
        return this.storage.getSessionTranscript(agentId, sessionKey);
    }
    /**
     * Reset (delete) a session.
     */
    async resetSession(agentId, sessionKey) {
        await this.storage.deleteSession(agentId, sessionKey);
        this.activeSessions.delete(sessionKey);
        this.logger.info("session", `Session reset: ${sessionKey}`);
    }
    /**
     * Append a turn to a session and update the manifest.
     */
    async appendTurn(agentId, sessionKey, turn) {
        await this.storage.appendTurn(agentId, sessionKey, turn);
        // Update manifest
        const session = this.activeSessions.get(sessionKey);
        if (session) {
            session.turns.push(turn);
            session.manifest.lastActiveAt = Date.now();
            session.manifest.turnCount = session.turns.length;
            await this.storage.upsertSessionManifest(session.manifest);
        }
    }
    /**
     * Run compaction if the session exceeds the threshold.
     */
    /**
     * Run compaction if the session exceeds the threshold.
     * Safe from concurrent write race conditions.
     */
    async maybeCompact(agentId, sessionKey, threshold, summarizer) {
        const session = this.activeSessions.get(sessionKey);
        if (!session || session.turns.length < threshold) {
            return session?.turns ?? [];
        }
        if (this.compactionLocks.has(sessionKey)) {
            this.logger.debug("session", `Compaction already in progress for session ${sessionKey}, skipping`);
            return session.turns;
        }
        this.compactionLocks.add(sessionKey);
        try {
            this.logger.debug("session", `Compacting session ${sessionKey} (${session.turns.length} turns)`);
            // 1. Snapshot the exact turns and length at this moment
            const snapshotLength = session.turns.length;
            const olderTurnsCount = Math.floor(threshold / 2);
            const olderTurns = session.turns.slice(0, -olderTurnsCount);
            const recentTurns = session.turns.slice(-olderTurnsCount, snapshotLength);
            // 2. Perform the async summarization (which yields the event loop)
            const summary = await summarizer(olderTurns);
            const summaryTurn = {
                role: "system",
                content: `[SESSION COMPACTION] Previous conversation summary:\n${summary}`,
                timestamp: Date.now(),
            };
            // 3. Retrieve any concurrent turns that were appended during the async yield
            const concurrentTurns = session.turns.slice(snapshotLength);
            // 4. Merge the compacted segment with the fresh concurrent turns
            const compacted = [summaryTurn, ...recentTurns, ...concurrentTurns];
            // 5. Atomic rewrite
            await this.storage.rewriteSession(agentId, sessionKey, compacted);
            session.turns = compacted;
            return compacted;
        }
        catch (err) {
            this.logger.error("session", `Compaction failed for session ${sessionKey}`, err);
            return session.turns;
        }
        finally {
            this.compactionLocks.delete(sessionKey);
        }
    }
    /**
     * Get the count of currently tracked sessions.
     */
    get activeCount() {
        return this.activeSessions.size;
    }
}
//# sourceMappingURL=session-manager.js.map