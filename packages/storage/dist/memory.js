import { getWorkspacePath } from "@mxclaw/core";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
export class MemoryManager {
    memories = new Map();
    memoryPath;
    dirty = false;
    constructor(workspacePath) {
        this.memoryPath = path.join(workspacePath, "memory.jsonl");
    }
    async load() {
        try {
            const raw = await fs.readFile(this.memoryPath, "utf-8");
            const lines = raw.trim().split("\n").filter(Boolean);
            for (const line of lines) {
                try {
                    const entry = JSON.parse(line);
                    this.memories.set(entry.id, entry);
                }
                catch { }
            }
        }
        catch { }
    }
    async save() {
        if (!this.dirty)
            return;
        const dir = path.dirname(this.memoryPath);
        fsSync.mkdirSync(dir, { recursive: true });
        const lines = Array.from(this.memories.values()).map(e => JSON.stringify(e)).join("\n");
        await fs.writeFile(this.memoryPath, lines + "\n", "utf-8");
        this.dirty = false;
    }
    store(content, type = "general", tags = [], source) {
        const id = crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
        const existing = this.memories.get(id);
        if (existing) {
            existing.content = content;
            existing.tags = [...new Set([...existing.tags, ...tags])];
            existing.updatedAt = Date.now();
            existing.accessCount++;
            this.dirty = true;
            return existing;
        }
        const entry = {
            id,
            type,
            content,
            tags,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            accessCount: 0,
            source,
        };
        this.memories.set(id, entry);
        this.dirty = true;
        return entry;
    }
    recall(id) {
        const entry = this.memories.get(id);
        if (entry) {
            entry.accessCount++;
            entry.updatedAt = Date.now();
            this.dirty = true;
        }
        return entry;
    }
    forget(id) {
        const deleted = this.memories.delete(id);
        if (deleted)
            this.dirty = true;
        return deleted;
    }
    search(query, type, limit = 10) {
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(Boolean);
        const results = [];
        for (const entry of this.memories.values()) {
            if (type && entry.type !== type)
                continue;
            const contentLower = entry.content.toLowerCase();
            const tagsLower = entry.tags.map(t => t.toLowerCase());
            let score = 0;
            for (const word of queryWords) {
                if (contentLower.includes(word))
                    score += 1;
                if (tagsLower.some(t => t.includes(word)))
                    score += 2;
            }
            // Boost recently accessed / frequently accessed
            if (score > 0) {
                const recencyBonus = Math.max(0, 1 - (Date.now() - entry.updatedAt) / (7 * 24 * 3600_000));
                const freqBonus = Math.min(entry.accessCount * 0.1, 1);
                score += recencyBonus + freqBonus;
                results.push({ entry, score });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit).map(r => r.entry);
    }
    listAll(type) {
        const entries = Array.from(this.memories.values());
        const filtered = type ? entries.filter(e => e.type === type) : entries;
        return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    getStats() {
        const byType = {};
        for (const entry of this.memories.values()) {
            byType[entry.type] = (byType[entry.type] ?? 0) + 1;
        }
        return { total: this.memories.size, byType };
    }
    buildMemoryPrompt(query, maxTokens = 2000) {
        let entries;
        if (query) {
            entries = this.search(query, undefined, 20);
        }
        else {
            entries = this.listAll().slice(0, 20);
        }
        if (entries.length === 0)
            return "";
        const lines = ["[MEMORY — Relevant stored knowledge:]"];
        let tokenEstimate = 10;
        for (const entry of entries) {
            const line = `- [${entry.type}] ${entry.content}${entry.tags.length ? ` (tags: ${entry.tags.join(", ")})` : ""}`;
            const lineTokens = Math.ceil(line.length / 4);
            if (tokenEstimate + lineTokens > maxTokens)
                break;
            lines.push(line);
            tokenEstimate += lineTokens;
        }
        return lines.join("\n");
    }
    get size() {
        return this.memories.size;
    }
}
//# sourceMappingURL=memory.js.map