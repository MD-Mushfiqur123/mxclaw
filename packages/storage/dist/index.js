import { getWorkspacePath, getSqlitePath } from "@mxclaw/core";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
export { MemoryManager } from "./memory.js";
export { SqliteStorageAdapter } from "./sqlite-adapter.js";
export class JsonlStorageAdapter {
    workspacePath;
    manifestsPath;
    embeddingsPath;
    pairingPath;
    devicesPath;
    queuePath;
    constructor(config) {
        this.workspacePath = getWorkspacePath(config);
        this.manifestsPath = path.join(this.workspacePath, "manifests");
        this.embeddingsPath = path.join(this.workspacePath, "embeddings");
        this.pairingPath = path.join(this.workspacePath, "pairing.json");
        this.devicesPath = path.join(this.workspacePath, "devices.json");
        this.queuePath = path.join(this.workspacePath, "queue.json");
    }
    async initialize() {
        await fs.mkdir(this.workspacePath, { recursive: true });
        await fs.mkdir(this.manifestsPath, { recursive: true });
        await fs.mkdir(this.embeddingsPath, { recursive: true });
        // Initialize JSON files if they don't exist
        for (const p of [this.pairingPath, this.devicesPath, this.queuePath]) {
            try {
                await fs.access(p);
            }
            catch {
                await fs.writeFile(p, "[]", "utf-8");
            }
        }
    }
    getSessionPath(agentId, sessionKey) {
        const dir = path.join(this.workspacePath, agentId, "sessions");
        fsSync.mkdirSync(dir, { recursive: true });
        return path.join(dir, `${sessionKey}.jsonl`);
    }
    async ensureSessionDir(agentId) {
        const dir = path.join(this.workspacePath, agentId, "sessions");
        await fs.mkdir(dir, { recursive: true });
        return dir;
    }
    async ensureManifestDir(agentId) {
        const dir = path.join(this.manifestsPath, agentId);
        await fs.mkdir(dir, { recursive: true });
        return dir;
    }
    getManifestPath(agentId, sessionKey) {
        fsSync.mkdirSync(path.join(this.manifestsPath, agentId), { recursive: true });
        return path.join(this.manifestsPath, agentId, `${sessionKey}.json`);
    }
    async getSessionTranscript(agentId, sessionKey) {
        await this.ensureSessionDir(agentId);
        const filePath = path.join(this.workspacePath, agentId, "sessions", `${sessionKey}.jsonl`);
        try {
            const content = await fs.readFile(filePath, "utf-8");
            const lines = content.trim().split("\n").filter(Boolean);
            return lines.map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    }
    async appendTurn(agentId, sessionKey, turn) {
        await this.ensureSessionDir(agentId);
        const filePath = path.join(this.workspacePath, agentId, "sessions", `${sessionKey}.jsonl`);
        const line = JSON.stringify(turn) + "\n";
        await fs.appendFile(filePath, line, "utf-8");
        // Update manifest
        await this.ensureManifestDir(agentId);
        const manifestPath = path.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
            const raw = await fs.readFile(manifestPath, "utf-8");
            const manifest = JSON.parse(raw);
            manifest.lastActiveAt = Date.now();
            manifest.turnCount += 1;
            await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
        }
        catch {
            // Manifest doesn't exist yet — that's fine
        }
    }
    async getSessionManifest(agentId, sessionKey) {
        await this.ensureManifestDir(agentId);
        const manifestPath = path.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
            const raw = await fs.readFile(manifestPath, "utf-8");
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    async upsertSessionManifest(manifest) {
        await this.ensureManifestDir(manifest.agentId);
        const manifestPath = path.join(this.manifestsPath, manifest.agentId, `${manifest.sessionKey}.json`);
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    }
    async listSessions(agentId) {
        const dir = path.join(this.manifestsPath, agentId);
        try {
            await fs.access(dir);
        }
        catch {
            return [];
        }
        const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
        const manifests = [];
        for (const f of files) {
            try {
                const raw = await fs.readFile(path.join(dir, f), "utf-8");
                manifests.push(JSON.parse(raw));
            }
            catch {
                // skip corrupted files
            }
        }
        return manifests.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
    }
    async deleteSession(agentId, sessionKey) {
        const sessionDir = path.join(this.workspacePath, agentId, "sessions");
        const filePath = path.join(sessionDir, `${sessionKey}.jsonl`);
        try {
            await fs.unlink(filePath);
        }
        catch { }
        const manifestPath = path.join(this.manifestsPath, agentId, `${sessionKey}.json`);
        try {
            await fs.unlink(manifestPath);
        }
        catch { }
    }
    async storeEmbedding(id, vector, metadata) {
        const embPath = path.join(this.embeddingsPath, `${id}.json`);
        await fs.writeFile(embPath, JSON.stringify({ id, vector, metadata }), "utf-8");
    }
    async searchEmbeddings(vector, limit = 10) {
        try {
            await fs.access(this.embeddingsPath);
        }
        catch {
            return [];
        }
        const files = (await fs.readdir(this.embeddingsPath)).filter((f) => f.endsWith(".json"));
        const queryVec = new Float32Array(vector);
        const results = [];
        for (const file of files) {
            try {
                const raw = await fs.readFile(path.join(this.embeddingsPath, file), "utf-8");
                const data = JSON.parse(raw);
                const storedVec = new Float32Array(data.vector);
                const distance = cosineDistance(queryVec, storedVec);
                results.push({ id: data.id, metadata: data.metadata, distance });
            }
            catch {
                // skip corrupted files
            }
        }
        results.sort((a, b) => a.distance - b.distance);
        return results.slice(0, limit);
    }
    async rewriteSession(agentId, sessionKey, turns) {
        const filePath = this.getSessionPath(agentId, sessionKey);
        await fs.writeFile(filePath, turns.map((t) => JSON.stringify(t) + "\n").join(""), "utf-8");
    }
    async close() {
        // No-op for JSON-based storage
    }
}
function cosineDistance(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
        normA += (a[i] ?? 0) * (a[i] ?? 0);
        normB += (b[i] ?? 0) * (b[i] ?? 0);
    }
    if (normA === 0 || normB === 0)
        return 1;
    return 1 - dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
export function deriveSessionKey(channelId, senderId, agentId) {
    const hash = crypto.createHash("sha256");
    hash.update(`${channelId}:${senderId}:${agentId}`);
    return hash.digest("hex").slice(0, 16);
}
export async function compactSession(storage, agentId, sessionKey, compactionThreshold, summarizer) {
    const turns = await storage.getSessionTranscript(agentId, sessionKey);
    if (turns.length <= compactionThreshold)
        return turns;
    const recentTurns = turns.slice(-Math.floor(compactionThreshold / 2));
    const olderTurns = turns.slice(0, -Math.floor(compactionThreshold / 2));
    const summary = await summarizer(olderTurns);
    const summaryTurn = {
        role: "system",
        content: `[SESSION COMPACTION] Previous conversation summary:\n${summary}`,
        timestamp: Date.now(),
    };
    return [summaryTurn, ...recentTurns];
}
//# sourceMappingURL=index.js.map