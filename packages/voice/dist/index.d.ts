import type { VoiceConfig, VoicePlugin } from "@mxclaw/core";
export declare const openaiRealtimeVoice: VoicePlugin;
export declare const elevenlabsVoice: VoicePlugin;
export declare const geminiLiveVoice: VoicePlugin;
export declare const systemTtsVoice: VoicePlugin;
export declare class VoiceManager {
    private plugins;
    private activeSessions;
    register(plugin: VoicePlugin): void;
    initialize(config: VoiceConfig): Promise<void>;
    startVoiceSession(provider: string): Promise<string>;
    sendAudio(sessionId: string, audio: Buffer): Promise<void>;
    receiveAudio(sessionId: string): AsyncGenerator<Buffer>;
    stopSession(sessionId: string): Promise<void>;
    getActiveSessions(): string[];
}
export declare function textToSpeech(text: string, provider: string, config?: Record<string, unknown>): Promise<Buffer>;
export declare function speakText(text: string, config: VoiceConfig): Promise<void>;
//# sourceMappingURL=index.d.ts.map