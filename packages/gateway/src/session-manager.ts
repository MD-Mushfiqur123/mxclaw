import type {
  MxClawConfig,
  SessionTurn,
  SessionManifest,
  MessageEnvelope,
  StorageAdapter,
} from "@mxclaw/core";
import { deriveSessionKey, compactSession } from "@mxclaw/storage";
import type { Logger } from "@mxclaw/logging";
import { v4 as uuidv4 } from "uuid";

/**
 * Manages the lifecycle of agent sessions — creation, isolation,
 * cross-session messaging, and compaction.
 *
 * This mirrors OpenClaw's `src/sessions/` module.
 */
export class SessionManager {
  private activeSessions = new Map<string, ActiveSession>();
  private compactionLocks = new Set<string>(); // Tracks sessions currently undergoing compaction

  constructor(
    private storage: StorageAdapter,
    private logger: Logger,
  ) {}

  // ── Session Lifecycle ─────────────────────────────────────────────

  /**
   * Get or create a session for the given channel/sender/agent triple.
   */
  async getOrCreate(
    channelId: string,
    senderId: string,
    agentId: string,
    conversationId: string,
  ): Promise<ActiveSession> {
    const sessionKey = deriveSessionKey(channelId, senderId, agentId);

    if (this.activeSessions.has(sessionKey)) {
      return this.activeSessions.get(sessionKey)!;
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

    const session: ActiveSession = {
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
  async spawnSession(
    parentSessionKey: string,
    targetAgentId: string,
    initialMessage: string,
    context?: Record<string, unknown>,
  ): Promise<SpawnedSession> {
    const spawnId = uuidv4().slice(0, 8);
    const sessionKey = `spawn:${targetAgentId}:${spawnId}`;

    const manifest: SessionManifest = {
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
    const userTurn: SessionTurn = {
      role: "user",
      content: initialMessage,
      timestamp: Date.now(),
    };
    await this.storage.appendTurn(targetAgentId, sessionKey, userTurn);

    // If context is provided, prepend it as a system note
    if (context && Object.keys(context).length > 0) {
      const contextTurn: SessionTurn = {
        role: "system",
        content: `Context from parent session: ${JSON.stringify(context)}`,
        timestamp: Date.now(),
      };
      await this.storage.appendTurn(targetAgentId, sessionKey, contextTurn);
    }

    this.logger.info(
      "session",
      `Spawned session ${sessionKey} from parent ${parentSessionKey}`,
    );

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
  async sendToSession(
    targetSessionKey: string,
    targetAgentId: string,
    message: string,
  ): Promise<void> {
    const turn: SessionTurn = {
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
  async listSessions(agentId: string): Promise<SessionManifest[]> {
    return this.storage.listSessions(agentId);
  }

  /**
   * Get the full transcript for a session.
   */
  async getTranscript(agentId: string, sessionKey: string): Promise<SessionTurn[]> {
    return this.storage.getSessionTranscript(agentId, sessionKey);
  }

  /**
   * Reset (delete) a session.
   */
  async resetSession(agentId: string, sessionKey: string): Promise<void> {
    await this.storage.deleteSession(agentId, sessionKey);
    this.activeSessions.delete(sessionKey);
    this.logger.info("session", `Session reset: ${sessionKey}`);
  }

  /**
   * Append a turn to a session and update the manifest.
   */
  async appendTurn(
    agentId: string,
    sessionKey: string,
    turn: SessionTurn,
  ): Promise<void> {
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
  async maybeCompact(
    agentId: string,
    sessionKey: string,
    threshold: number,
    summarizer: (turns: SessionTurn[]) => Promise<string>,
  ): Promise<SessionTurn[]> {
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
      const summaryTurn: SessionTurn = {
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
    } catch (err) {
      this.logger.error("session", `Compaction failed for session ${sessionKey}`, err);
      return session.turns;
    } finally {
      this.compactionLocks.delete(sessionKey);
    }
  }

  /**
   * Get the count of currently tracked sessions.
   */
  get activeCount(): number {
    return this.activeSessions.size;
  }
}

// ── Types ────────────────────────────────────────────────────────────

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
