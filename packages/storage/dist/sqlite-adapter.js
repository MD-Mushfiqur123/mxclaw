import { getSqlitePath } from "@mxclaw/core";
import * as path from "node:path";
import * as fs from "node:fs";
export class SqliteStorageAdapter {
    db;
    dbPath;
    constructor(config) {
        this.dbPath = getSqlitePath(config);
        fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    }
    async initialize() {
        const Database = (await import("better-sqlite3")).default;
        this.db = new Database(this.dbPath);
        this.db.pragma("journal_mode = WAL");
        this.db.pragma("foreign_keys = ON");
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        agent_id TEXT NOT NULL,
        session_key TEXT NOT NULL,
        turn_index INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT,
        tool_results TEXT,
        timestamp INTEGER NOT NULL,
        token_count INTEGER,
        PRIMARY KEY (agent_id, session_key, turn_index)
      );

      CREATE TABLE IF NOT EXISTS session_manifests (
        agent_id TEXT NOT NULL,
        session_key TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        conversation_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_active_at INTEGER NOT NULL,
        turn_count INTEGER NOT NULL DEFAULT 0,
        compaction_points TEXT NOT NULL DEFAULT '[]',
        PRIMARY KEY (agent_id, session_key)
      );

      CREATE TABLE IF NOT EXISTS embeddings (
        id TEXT PRIMARY KEY,
        vector BLOB NOT NULL,
        metadata TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS memory (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        embedding BLOB,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        access_count INTEGER NOT NULL DEFAULT 0,
        last_accessed_at INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id, session_key);
      CREATE INDEX IF NOT EXISTS idx_manifests_agent ON session_manifests(agent_id);
      CREATE INDEX IF NOT EXISTS idx_manifests_active ON session_manifests(last_active_at DESC);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory(type);
      CREATE INDEX IF NOT EXISTS idx_memory_updated ON memory(updated_at DESC);
    `);
    }
    async getSessionTranscript(agentId, sessionKey) {
        const rows = this.db.prepare("SELECT role, content, tool_calls, tool_results, timestamp, token_count FROM sessions WHERE agent_id = ? AND session_key = ? ORDER BY turn_index ASC").all(agentId, sessionKey);
        return rows.map(row => ({
            role: row.role,
            content: row.content,
            toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
            toolResults: row.tool_results ? JSON.parse(row.tool_results) : undefined,
            timestamp: row.timestamp,
            tokenCount: row.token_count ?? undefined,
        }));
    }
    async appendTurn(agentId, sessionKey, turn) {
        const maxIndex = this.db.prepare("SELECT COALESCE(MAX(turn_index), -1) as max_idx FROM sessions WHERE agent_id = ? AND session_key = ?").get(agentId, sessionKey);
        this.db.prepare("INSERT INTO sessions (agent_id, session_key, turn_index, role, content, tool_calls, tool_results, timestamp, token_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(agentId, sessionKey, maxIndex.max_idx + 1, turn.role, turn.content, turn.toolCalls ? JSON.stringify(turn.toolCalls) : null, turn.toolResults ? JSON.stringify(turn.toolResults) : null, turn.timestamp, turn.tokenCount ?? null);
        this.db.prepare("UPDATE session_manifests SET last_active_at = ?, turn_count = turn_count + 1 WHERE agent_id = ? AND session_key = ?").run(Date.now(), agentId, sessionKey);
    }
    async getSessionManifest(agentId, sessionKey) {
        const row = this.db.prepare("SELECT * FROM session_manifests WHERE agent_id = ? AND session_key = ?").get(agentId, sessionKey);
        if (!row)
            return null;
        return {
            agentId: row.agent_id,
            sessionKey: row.session_key,
            channelId: row.channel_id,
            senderId: row.sender_id,
            conversationId: row.conversation_id,
            createdAt: row.created_at,
            lastActiveAt: row.last_active_at,
            turnCount: row.turn_count,
            compactionPoints: JSON.parse(row.compaction_points),
        };
    }
    async upsertSessionManifest(manifest) {
        this.db.prepare(`
      INSERT INTO session_manifests (agent_id, session_key, channel_id, sender_id, conversation_id, created_at, last_active_at, turn_count, compaction_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(agent_id, session_key) DO UPDATE SET
        last_active_at = excluded.last_active_at,
        turn_count = excluded.turn_count,
        compaction_points = excluded.compaction_points
    `).run(manifest.agentId, manifest.sessionKey, manifest.channelId, manifest.senderId, manifest.conversationId, manifest.createdAt, manifest.lastActiveAt, manifest.turnCount, JSON.stringify(manifest.compactionPoints));
    }
    async listSessions(agentId) {
        const rows = this.db.prepare("SELECT * FROM session_manifests WHERE agent_id = ? ORDER BY last_active_at DESC").all(agentId);
        return rows.map(row => ({
            agentId: row.agent_id,
            sessionKey: row.session_key,
            channelId: row.channel_id,
            senderId: row.sender_id,
            conversationId: row.conversation_id,
            createdAt: row.created_at,
            lastActiveAt: row.last_active_at,
            turnCount: row.turn_count,
            compactionPoints: JSON.parse(row.compaction_points),
        }));
    }
    async deleteSession(agentId, sessionKey) {
        this.db.prepare("DELETE FROM sessions WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
        this.db.prepare("DELETE FROM session_manifests WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
    }
    async storeEmbedding(id, vector, metadata) {
        const buf = Buffer.from(new Float32Array(vector).buffer);
        this.db.prepare("INSERT OR REPLACE INTO embeddings (id, vector, metadata) VALUES (?, ?, ?)").run(id, buf, JSON.stringify(metadata));
    }
    async searchEmbeddings(queryVector, limit = 10) {
        const rows = this.db.prepare("SELECT id, vector, metadata FROM embeddings").all();
        const query = new Float32Array(queryVector);
        const results = rows.map(row => {
            const stored = new Float32Array(row.vector.buffer, row.vector.byteOffset, row.vector.byteLength / 4);
            return {
                id: row.id,
                metadata: JSON.parse(row.metadata),
                distance: cosineDistance(query, stored),
            };
        });
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, limit);
    }
    async rewriteSession(agentId, sessionKey, turns) {
        const tx = this.db.transaction(() => {
            this.db.prepare("DELETE FROM sessions WHERE agent_id = ? AND session_key = ?").run(agentId, sessionKey);
            for (let i = 0; i < turns.length; i++) {
                const t = turns[i];
                this.db.prepare("INSERT INTO sessions (agent_id, session_key, turn_index, role, content, tool_calls, tool_results, timestamp, token_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(agentId, sessionKey, i, t.role, t.content, t.toolCalls ? JSON.stringify(t.toolCalls) : null, t.toolResults ? JSON.stringify(t.toolResults) : null, t.timestamp, t.tokenCount ?? null);
            }
        });
        tx();
    }
    async close() {
        this.db.close();
    }
}
function cosineDistance(a, b) {
    let dot = 0, normA = 0, normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        dot += (a[i] ?? 0) * (b[i] ?? 0);
        normA += (a[i] ?? 0) * (a[i] ?? 0);
        normB += (b[i] ?? 0) * (b[i] ?? 0);
    }
    if (normA === 0 || normB === 0)
        return 1;
    return 1 - dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
//# sourceMappingURL=sqlite-adapter.js.map