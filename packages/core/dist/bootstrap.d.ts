import type { ProviderRef } from "./types.js";
export declare function getBootstrapEnvPath(): string;
export declare function getBootstrapJsonPath(): string;
export declare const PROVIDER_ENV_KEYS: Record<string, string>;
export declare function loadBootstrapEnv(): Record<string, string>;
export declare function loadBootstrapJson(): Record<string, string>;
export declare function loadBootstrap(): Record<string, string>;
export declare function saveBootstrap(entries: Record<string, string>): void;
export declare function resolveApiKey(providerRef: ProviderRef): string | undefined;
export declare function getBootstrapSummary(): {
    keyCount: number;
    files: string[];
};
//# sourceMappingURL=bootstrap.d.ts.map