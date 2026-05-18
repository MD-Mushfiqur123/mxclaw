/**
 * MxClaw Sandbox Executor
 *
 * Wraps the Docker and process sandbox backends.
 * Usage:
 *   const executor = await SandboxExecutor.create(agentConfig, logger);
 *   const result = await executor.run({ command: "ls -la", sessionKey });
 */

import type { Logger } from "@mxclaw/logging";
import {
  DEFAULT_SANDBOX_IMAGE,
  DEFAULT_SANDBOX_CONTAINER_PREFIX,
  DEFAULT_SANDBOX_WORKDIR,
  detectDockerAvailable,
  ensureSandboxContainer,
  runInDockerSandbox,
  type SandboxRunResult,
} from "./docker.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type SandboxMode = "docker" | "process" | "none";

export interface SandboxConfig {
  enabled: boolean;
  type?: "docker" | "process";
  image?: string;
  workdir?: string;
  env?: Record<string, string>;
}

export interface SandboxRunInput {
  command: string;
  sessionKey: string;
  workdir?: string;
  env?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * SandboxExecutor — resolves the correct backend (Docker or process fallback)
 * and runs commands in an isolated environment.
 */
export class SandboxExecutor {
  private mode: SandboxMode;
  private containerName: string;
  private image: string;
  private workdir: string;
  private baseEnv: Record<string, string>;
  private logger: Logger;
  private initialized = false;

  private constructor(params: {
    mode: SandboxMode;
    containerName: string;
    image: string;
    workdir: string;
    env: Record<string, string>;
    logger: Logger;
  }) {
    this.mode = params.mode;
    this.containerName = params.containerName;
    this.image = params.image;
    this.workdir = params.workdir;
    this.baseEnv = params.env;
    this.logger = params.logger;
  }

  /**
   * Create and initialize a SandboxExecutor.
   * Detects Docker availability; falls back to process mode.
   */
  static async create(
    cfg: SandboxConfig,
    sessionKey: string,
    logger: Logger,
  ): Promise<SandboxExecutor> {
    if (!cfg.enabled) {
      return new SandboxExecutor({
        mode: "none",
        containerName: "",
        image: "",
        workdir: cfg.workdir ?? DEFAULT_SANDBOX_WORKDIR,
        env: cfg.env ?? {},
        logger,
      });
    }

    const image = cfg.image ?? DEFAULT_SANDBOX_IMAGE;
    const workdir = cfg.workdir ?? DEFAULT_SANDBOX_WORKDIR;
    const env = cfg.env ?? {};

    // Slug the session key for container naming
    const slug = sessionKey.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 32);
    const containerName = `${DEFAULT_SANDBOX_CONTAINER_PREFIX}${slug}`;

    if (cfg.type === "docker" || cfg.type === undefined) {
      const dockerAvailable = await detectDockerAvailable();

      if (dockerAvailable) {
        // Ensure container is running
        await ensureSandboxContainer({ containerName, image, workdir, env, logger });

        return new SandboxExecutor({
          mode: "docker",
          containerName,
          image,
          workdir,
          env,
          logger,
        });
      }

      logger.warn(
        "sandbox",
        "Docker not available — falling back to process sandbox. " +
          "Install Docker for proper isolation.",
      );
    }

    // Process fallback
    return new SandboxExecutor({
      mode: "process",
      containerName: "",
      image,
      workdir,
      env,
      logger,
    });
  }

  get isEnabled(): boolean {
    return this.mode !== "none";
  }

  get activeMode(): SandboxMode {
    return this.mode;
  }

  /**
   * Run a command in the sandbox. Returns stdout, stderr, exitCode.
   */
  async run(input: SandboxRunInput): Promise<SandboxRunResult> {
    if (this.mode === "none") {
      throw new Error("Sandbox is disabled — cannot run in sandbox");
    }

    if (this.mode === "docker") {
      return runInDockerSandbox({
        command: input.command,
        containerName: this.containerName,
        workdir: input.workdir ?? this.workdir,
        env: { ...this.baseEnv, ...(input.env ?? {}) },
        signal: input.signal,
        logger: this.logger,
      });
    }

    // Process fallback — restricted subprocess
    return this.runInProcess(input);
  }

  private async runInProcess(input: SandboxRunInput): Promise<SandboxRunResult> {
    this.logger.debug("sandbox", `process exec: ${input.command.slice(0, 100)}`);

    try {
      const { stdout, stderr } = await execFileAsync("sh", ["-c", input.command], {
        timeout: 30_000,
        maxBuffer: 10 * 1024 * 1024, // 10MB
        cwd: input.workdir ?? this.workdir,
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          USER: process.env.USER,
          LANG: process.env.LANG,
          NODE_ENV: process.env.NODE_ENV,
          ...input.env,
        },
        signal: input.signal,
      });
      return { stdout, stderr, exitCode: 0 };
    } catch (err: unknown) {
      const error = err as { stdout?: string; stderr?: string; code?: number; message?: string };
      return {
        stdout: error.stdout ?? "",
        stderr: error.stderr ?? error.message ?? String(err),
        exitCode: error.code ?? 1,
        error: error.message ?? String(err),
      };
    }
  }
}

export { DEFAULT_SANDBOX_IMAGE, detectDockerAvailable } from "./docker.js";
export type { SandboxRunResult } from "./docker.js";
