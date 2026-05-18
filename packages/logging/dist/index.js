const LEVEL_PRIORITY = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
class ConsoleLogger {
    globalLevel;
    subsystemLevels;
    prefix;
    constructor(config, prefix = "") {
        this.globalLevel = config.level;
        this.subsystemLevels = config.subsystems ?? {};
        this.prefix = prefix;
    }
    shouldLog(subsystem, level) {
        const effectiveLevel = this.subsystemLevels[subsystem] ?? this.globalLevel;
        return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[effectiveLevel];
    }
    log(level, subsystem, message, ...args) {
        if (!this.shouldLog(subsystem, level))
            return;
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
    error(subsystem, message, ...args) {
        this.log("error", subsystem, message, ...args);
    }
    warn(subsystem, message, ...args) {
        this.log("warn", subsystem, message, ...args);
    }
    info(subsystem, message, ...args) {
        this.log("info", subsystem, message, ...args);
    }
    debug(subsystem, message, ...args) {
        this.log("debug", subsystem, message, ...args);
    }
    trace(subsystem, message, ...args) {
        this.log("trace", subsystem, message, ...args);
    }
    child(subsystem) {
        return new ConsoleLogger({ level: this.globalLevel, subsystems: this.subsystemLevels, otel: { enabled: false, headers: {} } }, this.prefix ? `${this.prefix}:${subsystem}` : subsystem);
    }
}
export function createLogger(config) {
    return new ConsoleLogger(config);
}
export const noopLogger = {
    error() { },
    warn() { },
    info() { },
    debug() { },
    trace() { },
    child() {
        return noopLogger;
    },
};
//# sourceMappingURL=index.js.map