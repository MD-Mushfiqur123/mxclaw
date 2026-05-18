import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { JsonlStorageAdapter, deriveSessionKey, compactSession } from "@mxclaw/storage";
import { MxClawConfigSchema, type MxClawConfig, type SessionTurn } from "@mxclaw/core";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

const testWorkspace = path.join(os.tmpdir(), "mxclaw-test-" + Date.now());

function createTestConfig(): MxClawConfig {
  return MxClawConfigSchema.parse({
    version: 1,
    storage: { workspacePath: testWorkspace },
    gateway: { host: "127.0.0.1", port: 18700 },
    agents: {},
    channels: {},
    bindings: [],
    devices: [],
    plugins: [],
  });
}

describe("JsonlStorageAdapter", () => {
  let storage: JsonlStorageAdapter;

  beforeEach(async () => {
    storage = new JsonlStorageAdapter(createTestConfig());
    await storage.initialize();
  });

  afterEach(async () => {
    await storage.close();
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  it("should return empty transcript for new session", async () => {
    const turns = await storage.getSessionTranscript("agent1", "session1");
    expect(turns).toEqual([]);
  });

  it("should append and retrieve turns", async () => {
    const turn: SessionTurn = {
      role: "user",
      content: "Hello",
      timestamp: Date.now(),
    };
    await storage.appendTurn("agent1", "session1", turn);
    const turns = await storage.getSessionTranscript("agent1", "session1");
    expect(turns).toHaveLength(1);
    expect(turns[0]!.content).toBe("Hello");
    expect(turns[0]!.role).toBe("user");
  });

  it("should append multiple turns in order", async () => {
    await storage.appendTurn("agent1", "session1", { role: "user", content: "Q1", timestamp: 1000 });
    await storage.appendTurn("agent1", "session1", { role: "assistant", content: "A1", timestamp: 2000 });
    await storage.appendTurn("agent1", "session1", { role: "user", content: "Q2", timestamp: 3000 });

    const turns = await storage.getSessionTranscript("agent1", "session1");
    expect(turns).toHaveLength(3);
    expect(turns.map((t) => t.content)).toEqual(["Q1", "A1", "Q2"]);
  });

  it("should upsert and retrieve session manifest", async () => {
    const manifest = {
      sessionKey: "session1",
      agentId: "agent1",
      channelId: "discord-1",
      senderId: "user-1",
      conversationId: "conv-1",
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      turnCount: 0,
      compactionPoints: [],
    };
    await storage.upsertSessionManifest(manifest);
    const retrieved = await storage.getSessionManifest("agent1", "session1");
    expect(retrieved).not.toBeNull();
    expect(retrieved!.sessionKey).toBe("session1");
    expect(retrieved!.agentId).toBe("agent1");
  });

  it("should list sessions for an agent", async () => {
    await storage.upsertSessionManifest({
      sessionKey: "s1", agentId: "agent1", channelId: "ch1", senderId: "u1",
      conversationId: "c1", createdAt: 1000, lastActiveAt: 2000, turnCount: 5, compactionPoints: [],
    });
    await storage.upsertSessionManifest({
      sessionKey: "s2", agentId: "agent1", channelId: "ch2", senderId: "u2",
      conversationId: "c2", createdAt: 1000, lastActiveAt: 3000, turnCount: 10, compactionPoints: [],
    });

    const sessions = await storage.listSessions("agent1");
    expect(sessions).toHaveLength(2);
    // Most recent first
    expect(sessions[0]!.sessionKey).toBe("s2");
  });

  it("should delete a session", async () => {
    await storage.appendTurn("agent1", "session1", { role: "user", content: "test", timestamp: Date.now() });
    await storage.deleteSession("agent1", "session1");
    const turns = await storage.getSessionTranscript("agent1", "session1");
    expect(turns).toEqual([]);
  });

  it("should store and search embeddings", async () => {
    await storage.storeEmbedding("doc1", [1, 0, 0], { text: "hello" });
    await storage.storeEmbedding("doc2", [0, 1, 0], { text: "world" });
    await storage.storeEmbedding("doc3", [0.9, 0.1, 0], { text: "hi" });

    const results = await storage.searchEmbeddings([1, 0, 0], 2);
    expect(results).toHaveLength(2);
    expect(results[0]!.id).toBe("doc1"); // Closest match
    expect(results[0]!.distance).toBeLessThan(0.1);
  });
});

describe("deriveSessionKey", () => {
  it("should produce consistent keys", () => {
    const key1 = deriveSessionKey("discord-1", "user-1", "agent1");
    const key2 = deriveSessionKey("discord-1", "user-1", "agent1");
    expect(key1).toBe(key2);
  });

  it("should produce different keys for different inputs", () => {
    const key1 = deriveSessionKey("discord-1", "user-1", "agent1");
    const key2 = deriveSessionKey("discord-1", "user-2", "agent1");
    expect(key1).not.toBe(key2);
  });

  it("should return 16-character hex string", () => {
    const key = deriveSessionKey("ch", "user", "agent");
    expect(key).toHaveLength(16);
    expect(/^[a-f0-9]+$/.test(key)).toBe(true);
  });
});

describe("compactSession", () => {
  it("should not compact when under threshold", async () => {
    const mockStorage = {
      getSessionTranscript: async () => [
        { role: "user", content: "hi", timestamp: 1 },
        { role: "assistant", content: "hello", timestamp: 2 },
      ] as SessionTurn[],
    } as any;

    const result = await compactSession(mockStorage, "a", "s", 10, async () => "summary");
    expect(result).toHaveLength(2);
  });

  it("should compact when over threshold", async () => {
    const turns: SessionTurn[] = [];
    for (let i = 0; i < 60; i++) {
      turns.push({ role: i % 2 === 0 ? "user" : "assistant", content: `msg${i}`, timestamp: i });
    }

    const mockStorage = {
      getSessionTranscript: async () => turns,
    } as any;

    const result = await compactSession(mockStorage, "a", "s", 50, async () => "This is a summary");
    expect(result[0]!.role).toBe("system");
    expect(result[0]!.content).toContain("This is a summary");
    expect(result.length).toBeLessThan(turns.length);
  });
});