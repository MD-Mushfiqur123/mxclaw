import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { VoicePlugin, PluginManifest } from "@mxclaw/core";

class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: ((e: { code: number; reason: string }) => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: ((e: Error) => void) | null = null;
  readyState = 1;
  static OPEN = 1;
  static CONNECTING = 0;
  send = vi.fn();
  close = vi.fn((code?: number) => { this.onclose?.({ code: code ?? 1000, reason: "" }); });
  addEventListener = vi.fn((_event: string, _handler: unknown) => {});
  removeEventListener = vi.fn();
}

vi.stubGlobal("WebSocket", MockWebSocket);

import {
  openaiRealtimeVoice,
  elevenlabsVoice,
  geminiLiveVoice,
  systemTtsVoice,
  VoiceManager,
  textToSpeech,
  speakText,
} from "./index.js";

describe("Voice Plugin Interface Compliance", () => {
  describe("openaiRealtimeVoice", () => {
    let plugin: VoicePlugin;

    beforeEach(() => {
      plugin = openaiRealtimeVoice as VoicePlugin;
      vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("openai-realtime");
      expect(m.version).toBe("0.2.0");
      expect(m.type).toBe("voice");
      expect(m.capabilities).toContain("voice-input");
      expect(m.capabilities).toContain("voice-output");
      expect(m.capabilities).toContain("streaming");
    });

    it("should initialize with apiKey from env", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should initialize with apiKey from config", async () => {
      await expect(plugin.initialize({ apiKey: "sk-direct" })).resolves.toBeUndefined();
    });

    it("should throw when no apiKey available", async () => {
      vi.unstubAllEnvs();
      await expect(plugin.initialize({})).rejects.toThrow(/api key/i);
    });

    it("should fail to startSession when not initialized", async () => {
      await expect(openaiRealtimeVoice.startSession()).rejects.toThrow();
    });

    it("should fail sendAudio with no active session", async () => {
      await expect(plugin.sendAudio("nonexistent", Buffer.from([]))).rejects.toThrow(/no active session/i);
    });

    it("should fail receiveAudio with no active session", async () => {
      const gen = plugin.receiveAudio("nonexistent");
      const results: Buffer[] = [];
      for await (const chunk of gen) {
        results.push(chunk);
      }
      expect(results).toHaveLength(0);
    });

    it("should stopSession gracefully for unknown session", async () => {
      await expect(plugin.stopSession("nonexistent")).resolves.toBeUndefined();
    });
  });

  describe("elevenlabsVoice", () => {
    let plugin: VoicePlugin;

    beforeEach(() => {
      plugin = elevenlabsVoice as VoicePlugin;
      vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("elevenlabs");
      expect(m.type).toBe("voice");
      expect(m.capabilities).toContain("voice-output");
      expect(m.capabilities).toContain("streaming");
    });

    it("should initialize with apiKey from env", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should initialize with apiKey from config", async () => {
      await expect(plugin.initialize({ apiKey: "key-from-config" })).resolves.toBeUndefined();
    });

    it("should throw when no apiKey available", async () => {
      vi.unstubAllEnvs();
      await expect(plugin.initialize({})).rejects.toThrow(/api key/i);
    });

    it("should start a session", async () => {
      await plugin.initialize({ apiKey: "test" });
      const { sessionId } = await plugin.startSession();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe("string");
    });

    it("should stop a session", async () => {
      await plugin.initialize({ apiKey: "test" });
      const { sessionId } = await plugin.startSession();
      await expect(plugin.stopSession(sessionId)).resolves.toBeUndefined();
    });

    it("should accept voiceId config", async () => {
      await plugin.initialize({ apiKey: "test", voiceId: "custom-voice-id" });
      await expect(plugin.startSession()).resolves.toBeDefined();
    });

    it("sendAudio should be no-op for output-only TTS", async () => {
      await plugin.initialize({ apiKey: "test" });
      await expect(plugin.sendAudio("any", Buffer.from([]))).resolves.toBeUndefined();
    });
  });

  describe("geminiLiveVoice", () => {
    let plugin: VoicePlugin;

    beforeEach(() => {
      plugin = geminiLiveVoice as VoicePlugin;
      vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("gemini-live");
      expect(m.type).toBe("voice");
      expect(m.capabilities).toContain("voice-input");
      expect(m.capabilities).toContain("voice-output");
    });

    it("should initialize with apiKey from env", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should throw when no apiKey", async () => {
      vi.unstubAllEnvs();
      await expect(plugin.initialize({})).rejects.toThrow(/api key/i);
    });

    it("should fail sendAudio with no active session", async () => {
      await plugin.initialize({ apiKey: "test" });
      await expect(plugin.sendAudio("nonexistent", Buffer.from([]))).rejects.toThrow(/no active gemini session/i);
    });
  });

  describe("systemTtsVoice", () => {
    let plugin: VoicePlugin;

    beforeEach(() => {
      plugin = systemTtsVoice as VoicePlugin;
    });

    it("should have valid manifest", () => {
      const m = plugin.manifest;
      expect(m.name).toBe("system-tts");
      expect(m.type).toBe("voice");
      expect(m.capabilities).toContain("voice-output");
    });

    it("should initialize without error", async () => {
      await expect(plugin.initialize({})).resolves.toBeUndefined();
    });

    it("should start a session with a UUID", async () => {
      const { sessionId } = await plugin.startSession();
      expect(sessionId).toBeTruthy();
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it("should stop gracefully", async () => {
      const { sessionId } = await plugin.startSession();
      await expect(plugin.stopSession(sessionId)).resolves.toBeUndefined();
    });

    it("sendAudio should be no-op", async () => {
      await expect(plugin.sendAudio("s1", Buffer.from([1, 2, 3]))).resolves.toBeUndefined();
    });

    it("receiveAudio should yield empty buffer", async () => {
      const gen = plugin.receiveAudio("s1");
      const results: Buffer[] = [];
      for await (const chunk of gen) {
        results.push(chunk);
      }
      expect(results).toHaveLength(1);
      expect(results[0].length).toBe(0);
    });
  });
});

describe("VoiceManager", () => {
  let manager: VoiceManager;

  beforeEach(() => {
    manager = new VoiceManager();
  });

  it("should register a voice plugin", () => {
    manager.register(systemTtsVoice);
    expect(manager.getActiveSessions()).toEqual([]);
  });

  it("should initialize with default provider", async () => {
    manager.register(systemTtsVoice);
    await expect(manager.initialize({ defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: {}, systemTts: {} })).resolves.toBeUndefined();
  });

  it("should throw on unknown provider", async () => {
    await expect(manager.initialize({ defaultProvider: "unknown", openaiRealtime: {}, geminiLive: {}, elevenlabs: {}, systemTts: {} })).rejects.toThrow(/not registered/i);
  });

  it("should start and stop a voice session", async () => {
    manager.register(systemTtsVoice);
    await manager.initialize({ defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: {}, systemTts: {} });
    const sessionId = await manager.startVoiceSession("system-tts");
    expect(sessionId).toBeTruthy();
    expect(manager.getActiveSessions()).toContain(sessionId);
    await manager.stopSession(sessionId);
    expect(manager.getActiveSessions()).not.toContain(sessionId);
  });

  it("should throw on sending audio to unknown session", async () => {
    await expect(manager.sendAudio("unknown", Buffer.from([]))).rejects.toThrow(/no active session/i);
  });

  it("should throw on receiving audio from unknown session", async () => {
    const gen = manager.receiveAudio("unknown");
    await expect(gen.next()).rejects.toThrow(/no active session/i);
  });

  it("should track multiple sessions", async () => {
    manager.register(systemTtsVoice);
    await manager.initialize({ defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: {}, systemTts: {} });
    const s1 = await manager.startVoiceSession("system-tts");
    const s2 = await manager.startVoiceSession("system-tts");
    expect(manager.getActiveSessions()).toHaveLength(2);
    await manager.stopSession(s1);
    expect(manager.getActiveSessions()).toHaveLength(1);
    await manager.stopSession(s2);
    expect(manager.getActiveSessions()).toHaveLength(0);
  });
});

describe("textToSpeech", () => {
  it("should throw for unsupported provider", async () => {
    await expect(textToSpeech("hello", "unknown")).rejects.toThrow(/unsupported/i);
  });

  it("should throw for system-tts without error (returns empty)", async () => {
    const result = await textToSpeech("hello", "system-tts");
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should throw for openai TTS without apiKey", async () => {
    await expect(textToSpeech("hello", "openai", {})).rejects.toThrow(/api key/i);
  });

  it("should throw for elevenlabs TTS without apiKey", async () => {
    await expect(textToSpeech("hello", "elevenlabs", {})).rejects.toThrow(/api key/i);
  });
});

describe("speakText", () => {
  it("should use default provider from config", async () => {
    await expect(speakText("hello", { defaultProvider: "system-tts", openaiRealtime: {}, geminiLive: {}, elevenlabs: {}, systemTts: {} })).resolves.toBeUndefined();
  });
});
