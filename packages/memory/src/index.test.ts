import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryMemoryAdapter } from "./index.js";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";

describe("InMemoryMemoryAdapter", () => {
  let mem: InMemoryMemoryAdapter;

  beforeEach(() => {
    mem = new InMemoryMemoryAdapter();
  });

  describe("store", () => {
    it("should store a new entry", async () => {
      const entry = await mem.store({ type: "fact", content: "Paris is the capital of France", tags: ["geography", "france"] });
      expect(entry.id).toBeDefined();
      expect(entry.type).toBe("fact");
      expect(entry.content).toBe("Paris is the capital of France");
      expect(entry.createdAt).toBeGreaterThan(0);
      expect(entry.accessCount).toBe(0);
    });

    it("should update existing entry with same content", async () => {
      const e1 = await mem.store({ type: "fact", content: "hello", tags: [] });
      const e2 = await mem.store({ type: "fact", content: "hello", tags: ["updated"] });
      expect(e1.id).toBe(e2.id);
      expect(e2.tags).toContain("updated");
      expect(e2.accessCount).toBeGreaterThan(0);
    });
  });

  describe("recall", () => {
    it("should return null for unknown id", async () => {
      const result = await mem.recall("nonexistent");
      expect(result).toBeNull();
    });

    it("should return stored entry by id", async () => {
      const stored = await mem.store({ type: "general", content: "test memory", tags: [] });
      const recalled = await mem.recall(stored.id);
      expect(recalled).not.toBeNull();
      expect(recalled!.content).toBe("test memory");
    });

    it("should increment access count on recall", async () => {
      const stored = await mem.store({ type: "general", content: "count test", tags: [] });
      await mem.recall(stored.id);
      await mem.recall(stored.id);
      const recalled = await mem.recall(stored.id);
      expect(recalled!.accessCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      await mem.store({ type: "fact", content: "Python is a programming language", tags: ["python"] });
      await mem.store({ type: "fact", content: "TypeScript compiles to JavaScript", tags: ["typescript"] });
      await mem.store({ type: "preference", content: "User likes dark mode", tags: ["ui"] });
    });

    it("should return all entries when no query", async () => {
      const results = await mem.search({});
      expect(results.length).toBe(3);
    });

    it("should filter by type", async () => {
      const results = await mem.search({ type: "preference" });
      expect(results.length).toBe(1);
      expect(results[0].content).toContain("dark mode");
    });

    it("should search by text content", async () => {
      const results = await mem.search({ query: "Python" });
      expect(results.length).toBe(1);
      expect(results[0].content).toContain("Python");
    });

    it("should respect limit", async () => {
      const results = await mem.search({ limit: 1 });
      expect(results.length).toBe(1);
    });
  });

  describe("forget", () => {
    it("should delete existing entry", async () => {
      const stored = await mem.store({ type: "general", content: "delete me", tags: [] });
      const deleted = await mem.forget(stored.id);
      expect(deleted).toBe(true);
      const recalled = await mem.recall(stored.id);
      expect(recalled).toBeNull();
    });

    it("should return false for unknown id", async () => {
      const result = await mem.forget("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("list", () => {
    it("should list all entries sorted by update time", async () => {
      await mem.store({ type: "fact", content: "first", tags: [] });
      await mem.store({ type: "fact", content: "second", tags: [] });
      const entries = await mem.list();
      expect(entries.length).toBe(2);
    });

    it("should filter by type", async () => {
      await mem.store({ type: "fact", content: "a fact", tags: [] });
      await mem.store({ type: "event", content: "an event", tags: [] });
      const facts = await mem.list("fact");
      expect(facts.length).toBe(1);
    });
  });

  describe("stats", () => {
    it("should return total count and breakdown", async () => {
      await mem.store({ type: "fact", content: "f1", tags: [] });
      await mem.store({ type: "fact", content: "f2", tags: [] });
      await mem.store({ type: "preference", content: "p1", tags: [] });
      const s = await mem.stats();
      expect(s.total).toBe(3);
      expect(s.byType.fact).toBe(2);
      expect(s.byType.preference).toBe(1);
    });

    it("should return empty stats for no entries", async () => {
      const s = await mem.stats();
      expect(s.total).toBe(0);
      expect(s.byType).toEqual({});
    });
  });

  describe("buildMemoryPrompt", () => {
    it("should return empty string when no entries", async () => {
      const prompt = mem.buildMemoryPrompt();
      expect(prompt).toBe("");
    });

    it("should format entries into prompt", async () => {
      await mem.store({ type: "fact", content: "Earth orbits the Sun", tags: ["astronomy"] });
      const prompt = mem.buildMemoryPrompt();
      expect(prompt).toContain("[MEMORY");
      expect(prompt).toContain("Earth orbits the Sun");
      expect(prompt).toContain("astronomy");
    });

    it("should filter by query", async () => {
      await mem.store({ type: "fact", content: "cats are furry", tags: ["animals"] });
      await mem.store({ type: "fact", content: "dogs are loyal", tags: ["animals"] });
      const prompt = mem.buildMemoryPrompt("cats");
      expect(prompt).toContain("cats");
      expect(prompt).not.toContain("dogs");
    });
  });

  describe("persistence", () => {
    it("should load from file if persistPath set", async () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mem-test-"));
      const p = path.join(dir, "memory.jsonl");
      fs.writeFileSync(p, JSON.stringify({ id: "persisted-1", type: "fact", content: "loaded from disk", tags: [], createdAt: 0, updatedAt: 0, accessCount: 0 }) + "\n", "utf-8");
      const mem2 = new InMemoryMemoryAdapter(p);
      await mem2.load();
      const entry = await mem2.recall("persisted-1");
      expect(entry).not.toBeNull();
      expect(entry!.content).toBe("loaded from disk");
      fs.rmSync(dir, { recursive: true, force: true });
    });
  });
});
