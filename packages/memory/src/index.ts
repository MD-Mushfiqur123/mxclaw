import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

export type MemoryType = "fact" | "preference" | "entity" | "event" | "instruction" | "general";

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  content: string;
  tags: string[];
  embedding?: number[];
  createdAt: number;
  updatedAt: number;
  accessCount: number;
  source?: string;
}

export interface MemoryQuery {
  query?: string;
  type?: MemoryType;
  limit?: number;
}

export interface MemoryAdapter {
  store(entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt" | "accessCount">): Promise<MemoryEntry>;
  recall(id: string): Promise<MemoryEntry | null>;
  search(query: MemoryQuery): Promise<MemoryEntry[]>;
  forget(id: string): Promise<boolean>;
  list(type?: MemoryType): Promise<MemoryEntry[]>;
  stats(): Promise<{ total: number; byType: Record<string, number> }>;
  buildMemoryPrompt(query?: string, maxTokens?: number): string;
}

export class InMemoryMemoryAdapter implements MemoryAdapter {
  private entries = new Map<string, MemoryEntry>();
  private persistPath?: string;
  private dirty = false;

  constructor(persistPath?: string) {
    this.persistPath = persistPath;
  }

  async load(): Promise<void> {
    if (!this.persistPath) return;
    try {
      const raw = await fs.readFile(this.persistPath, "utf-8");
      const lines = raw.trim().split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as MemoryEntry;
          this.entries.set(entry.id, entry);
        } catch { /* skip corrupt lines */ }
      }
    } catch { /* no file yet */ }
  }

  async persist(): Promise<void> {
    if (!this.dirty || !this.persistPath) return;
    const dir = path.dirname(this.persistPath);
    fsSync.mkdirSync(dir, { recursive: true });
    const lines = Array.from(this.entries.values()).map(e => JSON.stringify(e)).join("\n");
    await fs.writeFile(this.persistPath, lines + "\n", "utf-8");
    this.dirty = false;
  }

  async store(entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt" | "accessCount">): Promise<MemoryEntry> {
    const id = crypto.createHash("sha256").update(entry.content).digest("hex").slice(0, 16);
    const existing = this.entries.get(id);
    if (existing) {
      existing.content = entry.content;
      existing.tags = [...new Set([...existing.tags, ...entry.tags])];
      existing.updatedAt = Date.now();
      existing.accessCount++;
      this.dirty = true;
      await this.persist();
      return existing;
    }

    const now = Date.now();
    const newEntry: MemoryEntry = {
      id,
      type: entry.type,
      content: entry.content,
      tags: entry.tags,
      embedding: entry.embedding,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      source: entry.source,
    };
    this.entries.set(id, newEntry);
    this.dirty = true;
    await this.persist();
    return newEntry;
  }

  async recall(id: string): Promise<MemoryEntry | null> {
    const entry = this.entries.get(id);
    if (!entry) return null;
    entry.accessCount++;
    entry.updatedAt = Date.now();
    this.dirty = true;
    await this.persist();
    return entry;
  }

  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    const { query: text, type, limit = 10 } = query;
    const entries = Array.from(this.entries.values());

    const filtered = type ? entries.filter(e => e.type === type) : entries;

    if (!text) {
      return filtered.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
    }

    const queryLower = text.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);
    const scored: Array<{ entry: MemoryEntry; score: number }> = [];

    for (const entry of filtered) {
      const contentLower = entry.content.toLowerCase();
      const tagsLower = entry.tags.map(t => t.toLowerCase());
      let score = 0;

      for (const word of queryWords) {
        if (contentLower.includes(word)) score += 1;
        if (tagsLower.some(t => t.includes(word))) score += 2;
      }

      if (score > 0) {
        const recencyBonus = Math.max(0, 1 - (Date.now() - entry.updatedAt) / (7 * 24 * 3600_000));
        const freqBonus = Math.min(entry.accessCount * 0.1, 1);
        score += recencyBonus + freqBonus;
        scored.push({ entry, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(r => r.entry);
  }

  async forget(id: string): Promise<boolean> {
    const deleted = this.entries.delete(id);
    if (deleted) {
      this.dirty = true;
      await this.persist();
    }
    return deleted;
  }

  async list(type?: MemoryType): Promise<MemoryEntry[]> {
    const entries = Array.from(this.entries.values());
    const filtered = type ? entries.filter(e => e.type === type) : entries;
    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async stats(): Promise<{ total: number; byType: Record<string, number> }> {
    const byType: Record<string, number> = {};
    for (const entry of this.entries.values()) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1;
    }
    return { total: this.entries.size, byType };
  }

  buildMemoryPrompt(query?: string, maxTokens = 2000): string {
    let entries: MemoryEntry[];

    if (query) {
      entries = Array.from(this.entries.values()).filter(e => {
        const q = query.toLowerCase();
        return e.content.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q));
      }).slice(0, 20);
    } else {
      entries = Array.from(this.entries.values())
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 20);
    }

    if (entries.length === 0) return "";

    const lines: string[] = ["[MEMORY — Relevant stored knowledge:]"];
    let tokenEstimate = 10;

    for (const entry of entries) {
      const line = `- [${entry.type}] ${entry.content}${entry.tags.length ? ` (tags: ${entry.tags.join(", ")})` : ""}`;
      const lineTokens = Math.ceil(line.length / 4);
      if (tokenEstimate + lineTokens > maxTokens) break;
      lines.push(line);
      tokenEstimate += lineTokens;
    }

    return lines.join("\n");
  }
}
