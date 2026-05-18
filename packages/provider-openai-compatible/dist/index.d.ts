import type { ProviderPlugin } from "@mxclaw/core";
export declare const PROVIDER_PRESETS: Record<string, {
    baseUrl: string;
    envKey: string;
    defaultModel: string;
    headers?: Record<string, string>;
}>;
export declare function getPreset(name: string): {
    baseUrl: string;
    envKey: string;
    defaultModel: string;
    headers?: Record<string, string>;
} | undefined;
export declare function listPresets(): string[];
declare const plugin: ProviderPlugin;
export default plugin;
//# sourceMappingURL=index.d.ts.map