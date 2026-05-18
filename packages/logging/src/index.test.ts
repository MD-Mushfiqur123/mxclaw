import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLogger, noopLogger } from "./index.js";

describe("logging", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("createLogger", () => {
    it("should create a logger with default config", () => {
      const log = createLogger({ level: "info", otel: { enabled: false, headers: {} } });
      expect(log).toHaveProperty("info");
      expect(log).toHaveProperty("error");
      expect(log).toHaveProperty("warn");
      expect(log).toHaveProperty("debug");
      expect(log).toHaveProperty("trace");
      expect(log).toHaveProperty("child");
    });

    it("should call console.info for info level", () => {
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});
      const log = createLogger({ level: "info", otel: { enabled: false, headers: {} } });
      log.info("test", "hello");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should not call console.debug when level is info", () => {
      const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
      const log = createLogger({ level: "info", otel: { enabled: false, headers: {} } });
      log.debug("test", "should not appear");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should filter by subsystem level override", () => {
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});
      const log = createLogger({ level: "silent", subsystems: { chat: "info" }, otel: { enabled: false, headers: {} } });
      log.info("chat", "visible");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("should call console.error for error level", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const log = createLogger({ level: "error", otel: { enabled: false, headers: {} } });
      log.error("crash", "something broke");
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("child", () => {
    it("should create child logger with prefixed subsystem", () => {
      const log = createLogger({ level: "info", otel: { enabled: false, headers: {} } });
      const child = log.child("db");
      expect(child).toHaveProperty("info");
      expect(child).toHaveProperty("error");
    });
  });

  describe("noopLogger", () => {
    it("should be callable without errors", () => {
      noopLogger.error("x", "y");
      noopLogger.warn("x", "y");
      noopLogger.info("x", "y");
      noopLogger.debug("x", "y");
      noopLogger.trace("x", "y");
      expect(() => noopLogger.child("x")).not.toThrow();
    });
  });
});
