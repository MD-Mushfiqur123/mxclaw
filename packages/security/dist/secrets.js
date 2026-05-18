// @ts-nocheck
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
/**
 * Encrypted secrets vault for MxClaw.
 * Stores API keys and credentials encrypted at rest using AES-256-GCM.
 *
 * Mirrors OpenClaw's `src/secrets/` module.
 */
export class SecretsManager {
    vault = new Map();
    vaultPath;
    encryptionKey;
    constructor(workspacePath, masterPassword) {
        this.vaultPath = path.join(workspacePath, ".secrets.vault");
        // Derive a 256-bit key from the master password (or machine ID)
        const seed = masterPassword ?? `mxclaw-${process.env.USER ?? "default"}`;
        this.encryptionKey = crypto.scryptSync(seed, "mxclaw-vault-salt", 32);
    }
    /** Load the vault from disk. */
    async load() {
        try {
            const raw = await fs.readFile(this.vaultPath, "utf-8");
            const decrypted = this.decrypt(raw);
            const parsed = JSON.parse(decrypted);
            this.vault = new Map(Object.entries(parsed));
        }
        catch {
            // No vault file yet — start empty
            this.vault = new Map();
        }
    }
    /** Save the vault to disk (encrypted). */
    async save() {
        const obj = Object.fromEntries(this.vault);
        const encrypted = this.encrypt(JSON.stringify(obj));
        await fs.writeFile(this.vaultPath, encrypted, "utf-8");
    }
    /** Set a secret. */
    async set(key, value) {
        this.vault.set(key, value);
        await this.save();
    }
    /** Get a secret. */
    get(key) {
        return this.vault.get(key);
    }
    /** Delete a secret. */
    async delete(key) {
        const existed = this.vault.delete(key);
        if (existed)
            await this.save();
        return existed;
    }
    /** List all secret keys (not values). */
    listKeys() {
        return Array.from(this.vault.keys());
    }
    /** Check if a secret exists. */
    has(key) {
        return this.vault.has(key);
    }
    /**
     * Resolve a secret reference in config values.
     * Format: `$secret:KEY_NAME` → resolved value
     */
    resolve(value) {
        if (!value.startsWith("$secret:"))
            return value;
        const key = value.slice("$secret:".length);
        return this.vault.get(key) ?? value;
    }
    // ── Encryption helpers ─────────────────────────────────────────────
    encrypt(plaintext) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-gcm", this.encryptionKey, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
        const tag = cipher.getAuthTag();
        // Format: iv:tag:ciphertext (hex-encoded)
        return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
    }
    decrypt(data) {
        const parts = data.split(":");
        if (parts.length !== 3)
            throw new Error("Invalid vault format");
        const iv = Buffer.from(parts[0], "hex");
        const tag = Buffer.from(parts[1], "hex");
        const encrypted = Buffer.from(parts[2], "hex");
        const decipher = crypto.createDecipheriv("aes-256-gcm", this.encryptionKey, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final("utf-8");
    }
}
//# sourceMappingURL=secrets.js.map