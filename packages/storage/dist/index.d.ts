import type { StorageAdapter, SessionTurn, SessionManifest } from "@mxclaw/core";
import type { MxClawConfig } from "@mxclaw/core";
export { MemoryManager } from "./memory.js";
export type { MemoryEntry } from "./memory.js";
export { SqliteStorageAdapter } from "./sqlite-adapter.js";
export declare class JsonlStorageAdapter implements StorageAdapter {
    private workspacePath;
    private manifestsPath;
    private embeddingsPath;
    private pairingPath;
    private devicesPath;
    private queuePath;
    constructor(config: MxClawConfig);
    initialize(): Promise<void>;
    getSessionPath(agentId: string, sessionKey: string): string;
    private ensureSessionDir;
    private ensureManifestDir;
    getManifestPath(agentId: string, sessionKey: string): string;
    getSessionTranscript(agentId: string, sessionKey: string): Promise<SessionTurn[]>;
    appendTurn(agentId: string, sessionKey: string, turn: SessionTurn): Promise<void>;
    getSessionManifest(agentId: string, sessionKey: string): Promise<SessionManifest | null>;
    upsertSessionManifest(manifest: SessionManifest): Promise<void>;
    listSessions(agentId: string): Promise<SessionManifest[]>;
    deleteSession(agentId: string, sessionKey: string): Promise<void>;
    storeEmbedding(id: string, vector: number[], metadata: Record<string, unknown>): Promise<void>;
    searchEmbeddings(vector: number[], limit?: number): Promise<Array<{
        id: string;
        metadata: Record<string, unknown>;
        distance: number;
    }>>;
    rewriteSession(agentId: string, sessionKey: string, turns: SessionTurn[]): Promise<void>;
    close(): Promise<void>;
}
export declare function deriveSessionKey(channelId: string, senderId: string, agentId: string): string;
export declare function compactSession(storage: StorageAdapter, agentId: string, sessionKey: string, compactionThreshold: number, summarizer: (turns: SessionTurn[]) => Promise<string>): Promise<SessionTurn[]>;
//# sourceMappingURL=index.d.ts.map