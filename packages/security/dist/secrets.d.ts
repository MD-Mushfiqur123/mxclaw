/**
 * Encrypted secrets vault for MxClaw.
 * Stores API keys and credentials encrypted at rest using AES-256-GCM.
 *
 * Mirrors OpenClaw's `src/secrets/` module.
 */
export declare class SecretsManager {
    private vault;
    private vaultPath;
    private encryptionKey;
    constructor(workspacePath: string, masterPassword?: string);
    /** Load the vault from disk. */
    load(): Promise<void>;
    /** Save the vault to disk (encrypted). */
    save(): Promise<void>;
    /** Set a secret. */
    set(key: string, value: string): Promise<void>;
    /** Get a secret. */
    get(key: string): string | undefined;
    /** Delete a secret. */
    delete(key: string): Promise<boolean>;
    /** List all secret keys (not values). */
    listKeys(): string[];
    /** Check if a secret exists. */
    has(key: string): boolean;
    /**
     * Resolve a secret reference in config values.
     * Format: `$secret:KEY_NAME` → resolved value
     */
    resolve(value: string): string;
    private encrypt;
    private decrypt;
}
//# sourceMappingURL=secrets.d.ts.map