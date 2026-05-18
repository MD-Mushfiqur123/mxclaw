import type { LoggingConfig } from "@mxclaw/core";

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug" | "trace";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export interface Logger {
  error(subsystem: string, message: string, ...args: unknown[]): void;
  warn(subsystem: string, message: string, ...args: unknown[]): void;
  info(subsystem: string, message: string, ...args: unknown[]): void;
  debug(subsystem: string, message: string, ...args: unknown[]): void;
  trace(subsystem: string, message: string, ...args: unknown[]): void;
  child(subsystem: string): Logger;
}

class ConsoleLogger implements Logger {
  private globalLevel: LogLevel;
  private subsystemLevels: Record<string, LogLevel>;
  private prefix: string;

  constructor(config: LoggingConfig, prefix = "") {
    this.globalLevel = config.level;
    this.subsystemLevels = config.subsystems ?? {};
    this.prefix = prefix;
  }

  private shouldLog(subsystem: string, level: LogLevel): boolean {
    const effectiveLevel = this.subsystemLevels[subsystem] ?? this.globalLevel;
    return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[effectiveLevel];
  }

  private log(level: LogLevel, subsystem: string, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(subsystem, level)) return;
    const tag = this.prefix ? `[${this.prefix}:${subsystem}]` : `[${subsystem}]`;
    const ts = new Date().toISOString();
    const line = `${ts} ${level.toUpperCase()} ${tag} ${message}`;

    switch (level) {
      case "error":
        console.error(line, ...args);
        break;
      case "warn":
        console.warn(line, ...args);
        break;
      case "info":
        console.info(line, ...args);
        break;
      case "debug":
        console.debug(line, ...args);
        break;
      case "trace":
        console.trace(line, ...args);
        break;
    }
  }

  error(subsystem: string, message: string, ...args: unknown[]): void {
    this.log("error", subsystem, message, ...args);
  }
  warn(subsystem: string, message: string, ...args: unknown[]): void {
    this.log("warn", subsystem, message, ...args);
  }
  info(subsystem: string, message: string, ...args: unknown[]): void {
    this.log("info", subsystem, message, ...args);
  }
  debug(subsystem: string, message: string, ...args: unknown[]): void {
    this.log("debug", subsystem, message, ...args);
  }
  trace(subsystem: string, message: string, ...args: unknown[]): void {
    this.log("trace", subsystem, message, ...args);
  }

  child(subsystem: string): Logger {
    return new ConsoleLogger(
      { level: this.globalLevel, subsystems: this.subsystemLevels, otel: { enabled: false, headers: {} } },
      this.prefix ? `${this.prefix}:${subsystem}` : subsystem,
    );
  }
}

export function createLogger(config: LoggingConfig): Logger {
  return new ConsoleLogger(config);
}

export const noopLogger: Logger = {
  error() {},
  warn() {},
  info() {},
  debug() {},
  trace() {},
  child() {
    return noopLogger;
  },
};