import type { LoggingConfig } from "@mxclaw/core";
export type LogLevel = "silent" | "error" | "warn" | "info" | "debug" | "trace";
export interface Logger {
    error(subsystem: string, message: string, ...args: unknown[]): void;
    warn(subsystem: string, message: string, ...args: unknown[]): void;
    info(subsystem: string, message: string, ...args: unknown[]): void;
    debug(subsystem: string, message: string, ...args: unknown[]): void;
    trace(subsystem: string, message: string, ...args: unknown[]): void;
    child(subsystem: string): Logger;
}
export declare function createLogger(config: LoggingConfig): Logger;
export declare const noopLogger: Logger;
//# sourceMappingURL=index.d.ts.map