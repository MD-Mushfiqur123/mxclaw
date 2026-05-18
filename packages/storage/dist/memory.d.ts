export interface MemoryEntry {
    id: string;
    type: "fact" | "preference" | "entity" | "event" | "instruction" | "general";
    content: string;
    tags: string[];
    embedding?: number[];
    createdAt: number;
    updatedAt: number;
    accessCount: number;
    source?: string;
}
export declare class MemoryManager {
    private memories;
    private memoryPath;
    private dirty;
    constructor(workspacePath: string);
    load(): Promise<void>;
    save(): Promise<void>;
    store(content: string, type?: MemoryEntry["type"], tags?: string[], source?: string): MemoryEntry;
    recall(id: string): MemoryEntry | undefined;
    forget(id: string): boolean;
    search(query: string, type?: MemoryEntry["type"], limit?: number): MemoryEntry[];
    listAll(type?: MemoryEntry["type"]): MemoryEntry[];
    getStats(): {
        total: number;
        byType: Record<string, number>;
    };
    buildMemoryPrompt(query?: string, maxTokens?: number): string;
    get size(): number;
}
//# sourceMappingURL=memory.d.ts.map