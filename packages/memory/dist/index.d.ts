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
    stats(): Promise<{
        total: number;
        byType: Record<string, number>;
    }>;
    buildMemoryPrompt(query?: string, maxTokens?: number): string;
}
export declare class InMemoryMemoryAdapter implements MemoryAdapter {
    private entries;
    private persistPath?;
    private dirty;
    constructor(persistPath?: string);
    load(): Promise<void>;
    persist(): Promise<void>;
    store(entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt" | "accessCount">): Promise<MemoryEntry>;
    recall(id: string): Promise<MemoryEntry | null>;
    search(query: MemoryQuery): Promise<MemoryEntry[]>;
    forget(id: string): Promise<boolean>;
    list(type?: MemoryType): Promise<MemoryEntry[]>;
    stats(): Promise<{
        total: number;
        byType: Record<string, number>;
    }>;
    buildMemoryPrompt(query?: string, maxTokens?: number): string;
}
//# sourceMappingURL=index.d.ts.map