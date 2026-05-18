import type { StorageAdapter, SessionTurn, SessionManifest, MxClawConfig } from "@mxclaw/core";
export declare class SqliteStorageAdapter implements StorageAdapter {
    private db;
    private dbPath;
    constructor(config: MxClawConfig);
    initialize(): Promise<void>;
    getSessionTranscript(agentId: string, sessionKey: string): Promise<SessionTurn[]>;
    appendTurn(agentId: string, sessionKey: string, turn: SessionTurn): Promise<void>;
    getSessionManifest(agentId: string, sessionKey: string): Promise<SessionManifest | null>;
    upsertSessionManifest(manifest: SessionManifest): Promise<void>;
    listSessions(agentId: string): Promise<SessionManifest[]>;
    deleteSession(agentId: string, sessionKey: string): Promise<void>;
    storeEmbedding(id: string, vector: number[], metadata: Record<string, unknown>): Promise<void>;
    searchEmbeddings(queryVector: number[], limit?: number): Promise<Array<{
        id: string;
        metadata: Record<string, unknown>;
        distance: number;
    }>>;
    rewriteSession(agentId: string, sessionKey: string, turns: SessionTurn[]): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=sqlite-adapter.d.ts.map