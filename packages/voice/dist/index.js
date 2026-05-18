import * as crypto from "node:crypto";
// ── OpenAI Realtime Voice ─────────────────────────────────────────
let openaiApiKey = "";
const openaiSessions = new Map();
export const openaiRealtimeVoice = {
    manifest: {
        name: "openai-realtime",
        version: "0.2.0",
        type: "voice",
        description: "OpenAI Realtime API voice integration (WebSocket-based)",
        author: "mxclaw",
        main: "index.js",
        capabilities: ["voice-input", "voice-output", "streaming"],
    },
    initialize: async (config) => {
        openaiApiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? "";
        if (!openaiApiKey)
            throw new Error("OpenAI API key required for realtime voice");
    },
    startSession: async () => {
        const sessionId = crypto.randomUUID();
        const ws = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", {
            headers: {
                "Authorization": `Bearer ${openaiApiKey}`,
                "OpenAI-Beta": "realtime=v1",
            },
        });
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("OpenAI Realtime connection timeout")), 10_000);
            ws.onopen = () => {
                clearTimeout(timeout);
                ws.send(JSON.stringify({
                    type: "session.update",
                    session: {
                        modalities: ["text", "audio"],
                        voice: "alloy",
                        input_audio_format: "pcm16",
                        output_audio_format: "pcm16",
                        turn_detection: { type: "server_vad", threshold: 0.5 },
                    },
                }));
                resolve();
            };
            ws.onerror = (err) => {
                clearTimeout(timeout);
                reject(new Error(`OpenAI Realtime connection failed: ${err}`));
            };
        });
        openaiSessions.set(sessionId, ws);
        return { sessionId };
    },
    sendAudio: async (sessionId, audio) => {
        const ws = openaiSessions.get(sessionId);
        if (!ws || ws.readyState !== WebSocket.OPEN)
            throw new Error("No active session");
        ws.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: audio.toString("base64"),
        }));
    },
    receiveAudio: async function* (sessionId) {
        const ws = openaiSessions.get(sessionId);
        if (!ws)
            return;
        const audioChunks = [];
        let resolveNext = null;
        const handler = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "response.audio.delta" && msg.delta) {
                    const chunk = Buffer.from(msg.delta, "base64");
                    if (resolveNext) {
                        const r = resolveNext;
                        resolveNext = null;
                        r(chunk);
                    }
                    else {
                        audioChunks.push(chunk);
                    }
                }
                if (msg.type === "response.audio.done") {
                    if (resolveNext) {
                        resolveNext(null);
                        resolveNext = null;
                    }
                }
            }
            catch { /* skip malformed */ }
        };
        ws.addEventListener("message", handler);
        try {
            while (true) {
                const chunk = audioChunks.shift();
                if (chunk) {
                    yield chunk;
                    continue;
                }
                const next = await new Promise((resolve) => {
                    resolveNext = resolve;
                    setTimeout(() => resolve(null), 30_000);
                });
                if (!next)
                    break;
                yield next;
            }
        }
        finally {
            ws.removeEventListener("message", handler);
        }
    },
    stopSession: async (sessionId) => {
        const ws = openaiSessions.get(sessionId);
        if (ws) {
            ws.close(1000, "Session ended");
            openaiSessions.delete(sessionId);
        }
    },
};
// ── ElevenLabs Voice (real TTS implementation) ───────────────────
let elevenLabsKey = "";
let elevenLabsVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel
const elevenLabsSessions = new Map();
export const elevenlabsVoice = {
    manifest: {
        name: "elevenlabs",
        version: "0.2.0",
        type: "voice",
        description: "ElevenLabs TTS voice integration with streaming",
        author: "mxclaw",
        main: "index.js",
        capabilities: ["voice-output", "streaming"],
    },
    initialize: async (config) => {
        elevenLabsKey = config.apiKey ?? process.env.ELEVENLABS_API_KEY ?? "";
        if (!elevenLabsKey)
            throw new Error("ElevenLabs API key required");
        elevenLabsVoiceId = config.voiceId ?? elevenLabsVoiceId;
    },
    startSession: async () => {
        const sessionId = crypto.randomUUID();
        elevenLabsSessions.set(sessionId, { chunks: [] });
        return { sessionId };
    },
    sendAudio: async () => {
        // ElevenLabs is output-only TTS
    },
    receiveAudio: async function* (sessionId) {
        const session = elevenLabsSessions.get(sessionId);
        if (!session)
            return;
        for (const chunk of session.chunks) {
            yield chunk;
        }
    },
    stopSession: async (sessionId) => {
        elevenLabsSessions.delete(sessionId);
    },
};
// ── Gemini Live Voice ─────────────────────────────────────────────
let geminiApiKey = "";
const geminiSessions = new Map();
export const geminiLiveVoice = {
    manifest: {
        name: "gemini-live",
        version: "0.2.0",
        type: "voice",
        description: "Google Gemini Live API voice integration",
        author: "mxclaw",
        main: "index.js",
        capabilities: ["voice-input", "voice-output", "streaming"],
    },
    initialize: async (config) => {
        geminiApiKey = config.apiKey ?? process.env.GEMINI_API_KEY ?? "";
        if (!geminiApiKey)
            throw new Error("Gemini API key required for live voice");
    },
    startSession: async () => {
        const sessionId = crypto.randomUUID();
        const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${geminiApiKey}`;
        const ws = new WebSocket(wsUrl);
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Gemini Live connection timeout")), 10_000);
            ws.onopen = () => {
                clearTimeout(timeout);
                ws.send(JSON.stringify({
                    setup: {
                        model: "models/gemini-2.0-flash-exp",
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } },
                        },
                    },
                }));
                resolve();
            };
            ws.onerror = () => {
                clearTimeout(timeout);
                reject(new Error("Gemini Live connection failed"));
            };
        });
        geminiSessions.set(sessionId, ws);
        return { sessionId };
    },
    sendAudio: async (sessionId, audio) => {
        const ws = geminiSessions.get(sessionId);
        if (!ws || ws.readyState !== WebSocket.OPEN)
            throw new Error("No active Gemini session");
        ws.send(JSON.stringify({
            realtimeInput: {
                mediaChunks: [{ mimeType: "audio/pcm", data: audio.toString("base64") }],
            },
        }));
    },
    receiveAudio: async function* (sessionId) {
        const ws = geminiSessions.get(sessionId);
        if (!ws)
            return;
        let resolveNext = null;
        const buffer = [];
        const handler = (event) => {
            try {
                const msg = JSON.parse(event.data);
                const parts = msg.serverContent?.modelTurn?.parts ?? [];
                for (const part of parts) {
                    if (part.inlineData?.data) {
                        const chunk = Buffer.from(part.inlineData.data, "base64");
                        if (resolveNext) {
                            const r = resolveNext;
                            resolveNext = null;
                            r(chunk);
                        }
                        else {
                            buffer.push(chunk);
                        }
                    }
                }
            }
            catch { /* skip */ }
        };
        ws.addEventListener("message", handler);
        try {
            while (true) {
                const chunk = buffer.shift();
                if (chunk) {
                    yield chunk;
                    continue;
                }
                const next = await new Promise((resolve) => {
                    resolveNext = resolve;
                    setTimeout(() => resolve(null), 30_000);
                });
                if (!next)
                    break;
                yield next;
            }
        }
        finally {
            ws.removeEventListener("message", handler);
        }
    },
    stopSession: async (sessionId) => {
        const ws = geminiSessions.get(sessionId);
        if (ws) {
            ws.close(1000, "Session ended");
            geminiSessions.delete(sessionId);
        }
    },
};
// ── System TTS Voice ──────────────────────────────────────────────
export const systemTtsVoice = {
    manifest: {
        name: "system-tts",
        version: "0.2.0",
        type: "voice",
        description: "System-native TTS (say on macOS, espeak on Linux, SAPI on Windows)",
        author: "mxclaw",
        main: "index.js",
        capabilities: ["voice-output"],
    },
    initialize: async () => { },
    startSession: async () => ({ sessionId: crypto.randomUUID() }),
    sendAudio: async () => { },
    receiveAudio: async function* () {
        yield Buffer.from([]);
    },
    stopSession: async () => { },
};
// ── Voice Manager ─────────────────────────────────────────────────
export class VoiceManager {
    plugins = new Map();
    activeSessions = new Map(); // sessionId -> provider
    register(plugin) {
        this.plugins.set(plugin.manifest.name, plugin);
    }
    async initialize(config) {
        const provider = config.defaultProvider;
        const plugin = this.plugins.get(provider);
        if (!plugin)
            throw new Error(`Voice provider "${provider}" not registered`);
        const providerConfig = config[provider] ?? {};
        await plugin.initialize(providerConfig);
    }
    async startVoiceSession(provider) {
        const plugin = this.plugins.get(provider);
        if (!plugin)
            throw new Error(`Voice provider "${provider}" not found`);
        const { sessionId } = await plugin.startSession();
        this.activeSessions.set(sessionId, provider);
        return sessionId;
    }
    async sendAudio(sessionId, audio) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
            throw new Error(`No active session: ${sessionId}`);
        const plugin = this.plugins.get(provider);
        if (!plugin)
            throw new Error(`Provider not found: ${provider}`);
        await plugin.sendAudio(sessionId, audio);
    }
    async *receiveAudio(sessionId) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
            throw new Error(`No active session: ${sessionId}`);
        const plugin = this.plugins.get(provider);
        if (!plugin)
            throw new Error(`Provider not found: ${provider}`);
        yield* plugin.receiveAudio(sessionId);
    }
    async stopSession(sessionId) {
        const provider = this.activeSessions.get(sessionId);
        if (!provider)
            return;
        const plugin = this.plugins.get(provider);
        if (plugin)
            await plugin.stopSession(sessionId);
        this.activeSessions.delete(sessionId);
    }
    getActiveSessions() {
        return Array.from(this.activeSessions.keys());
    }
}
// ── TTS Utility ───────────────────────────────────────────────────
export async function textToSpeech(text, provider, config = {}) {
    switch (provider) {
        case "elevenlabs": {
            const apiKey = config.apiKey ?? process.env.ELEVENLABS_API_KEY;
            const voiceId = config.voiceId ?? "21m00Tcm4TlvDq8ikWAM";
            if (!apiKey)
                throw new Error("ElevenLabs API key required");
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_turbo_v2_5",
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
                }),
            });
            if (!response.ok) {
                throw new Error(`ElevenLabs TTS failed: ${response.status} ${response.statusText}`);
            }
            return Buffer.from(await response.arrayBuffer());
        }
        case "openai": {
            const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;
            if (!apiKey)
                throw new Error("OpenAI API key required");
            const response = await fetch("https://api.openai.com/v1/audio/speech", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "tts-1",
                    input: text,
                    voice: config.voice ?? "alloy",
                    response_format: "mp3",
                }),
            });
            if (!response.ok) {
                throw new Error(`OpenAI TTS failed: ${response.status} ${response.statusText}`);
            }
            return Buffer.from(await response.arrayBuffer());
        }
        case "system-tts": {
            const platform = process.platform;
            if (platform === "darwin") {
                const { execFile } = await import("node:child_process");
                execFile("say", [text]);
            }
            else if (platform === "linux") {
                const { execFile } = await import("node:child_process");
                execFile("espeak", [text]);
            }
            else if (platform === "win32") {
                const { spawn } = await import("node:child_process");
                // Spawn powershell securely with -NoProfile -Command - to execute code from stdin
                const child = spawn("powershell", [
                    "-NoProfile",
                    "-Command",
                    "[Console]::InputEncoding = [System.Text.Encoding]::UTF8; Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Speak([Console]::In.ReadToEnd())"
                ]);
                child.stdin.write(text, "utf-8");
                child.stdin.end();
            }
            return Buffer.from([]);
        }
        default:
            throw new Error(`Unsupported TTS provider: ${provider}`);
    }
}
export async function speakText(text, config) {
    const provider = config.defaultProvider;
    const providerConfig = config[provider] ?? {};
    await textToSpeech(text, provider, providerConfig);
}
//# sourceMappingURL=index.js.map