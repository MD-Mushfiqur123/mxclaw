import { type MxClawConfig } from "./types.js";
export declare function getConfigPath(): string;
export declare function getConfigDir(): string;
export declare function getWorkspacePath(config?: MxClawConfig): string;
export declare function getLanceDbPath(config?: MxClawConfig): string;
export declare function getSqlitePath(config?: MxClawConfig): string;
export declare function loadConfig(configPath?: string): MxClawConfig;
export declare function saveConfig(config: MxClawConfig, configPath?: string): void;
export declare function loadSnapshot(): MxClawConfig;
export declare function watchConfig(onConfigChange: (config: MxClawConfig) => void, configPath?: string): () => void;
export declare function generateDefaultConfig(): MxClawConfig;
//# sourceMappingURL=config.d.ts.map