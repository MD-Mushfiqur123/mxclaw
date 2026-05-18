/**
 * Docker sandbox execution layer.
 *
 * Adapted from OpenClaw (MIT License) — openclaw/openclaw
 * src/agents/sandbox/docker.ts
 *
 * Changes vs upstream:
 *  - Removed OpenClaw-internal imports (logging/subsystem, plugin-sdk/windows-spawn,
 *    registry, config-hash, workspace-mounts, infra/openclaw-exec-env)
 *  - Uses @mxclaw/logging instead of subsystem logger
 *  - Uses Node's spawn('docker') directly (cross-platform)
 *  - Default image: node:20-alpine (no custom build step required)
 *  - Adds runInDockerSandbox() — the primary entry point for tool-executor
 */

import { spawn } from "node:child_process";
import type { Logger } from "@mxclaw/logging";
import { sanitizeExplicitSandboxEnvVars } from "./sanitize-env-vars.js";

// ── Types ─────────────────────────────────────────────────────────────

export const DEFAULT_SANDBOX_IMAGE = "node:20-alpine";
export const DEFAULT_SANDBOX_CONTAINER_PREFIX = "mxclaw-sbx-";
export const DEFAULT_SANDBOX_WORKDIR = "/workspace";

export type ExecDockerRawOptions = {
  allowFailure?: boolean;
  input?: Buffer | string;
  signal?: AbortSignal;
};

export type ExecDockerRawResult = {
  stdout: Buffer;
  stderr: Buffer;
  code: number;
};

type ExecDockerRawError = Error & {
  code: number;
  stdout: Buffer;
  stderr: Buffer;
};

export type SandboxRunOptions = {
  /** Shell command to run inside the container */
  command: string;
  /** Working directory inside container */
  workdir?: string;
  /** Extra env vars to pass in (secrets stripped automatically) */
  env?: Record<string, string>;
  /** AbortSignal for timeout / cancellation */
  signal?: AbortSignal;
  /** Name of the container to exec into (must already be running) */
  containerName: string;
};

export type SandboxRunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
};

// ── Abort helper ──────────────────────────────────────────────────────

function createAbortError(): Error {
  const err = new Error("Aborted");
  err.name = "AbortError";
  return err;
}

// ── Core Docker exec ─────────────────────────────────────────────────

/**
 * Low-level Docker spawn — returns raw Buffers.
 * Adapted from OpenClaw's execDockerRaw().
 */
export function execDockerRaw(
  args: string[],
  opts?: ExecDockerRawOptions,
): Promise<ExecDockerRawResult> {
  return new Promise<ExecDockerRawResult>((resolve, reject) => {
    const child = spawn("docker", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let aborted = false;

    const signal = opts?.signal;
    const handleAbort = () => {
      if (aborted) return;
      aborted = true;
      child.kill("SIGTERM");
    };

    if (signal) {
      if (signal.aborted) {
        handleAbort();
      } else {
        signal.addEventListener("abort", handleAbort, { once: true });
      }
    }

    child.stdout?.on("data", (chunk) => {
      stdoutChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    child.stderr?.on("data", (chunk) => {
      stderrChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    child.on("error", (error) => {
      if (signal) signal.removeEventListener("abort", handleAbort);
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        const friendly = Object.assign(
          new Error(
            'Sandbox mode requires Docker, but the "docker" command was not found in PATH. ' +
              'Install Docker or set sandbox.enabled=false to disable sandboxing.',
          ),
          { code: "INVALID_CONFIG", cause: error },
        );
        reject(friendly);
        return;
      }
      reject(error);
    });

    child.on("close", (code) => {
      if (signal) signal.removeEventListener("abort", handleAbort);
      const stdout = Buffer.concat(stdoutChunks);
      const stderr = Buffer.concat(stderrChunks);

      if (aborted || signal?.aborted) {
        reject(createAbortError());
        return;
      }

      const exitCode = code ?? 0;
      if (exitCode !== 0 && !opts?.allowFailure) {
        const message = stderr.length > 0 ? stderr.toString("utf8").trim() : "";
        const error: ExecDockerRawError = Object.assign(
          new Error(message || `docker ${args.join(" ")} failed`),
          { code: exitCode, stdout, stderr },
        );
        reject(error);
        return;
      }
      resolve({ stdout, stderr, code: exitCode });
    });

    const stdin = child.stdin;
    if (stdin) {
      if (opts?.input !== undefined) {
        stdin.end(opts.input);
      } else {
        stdin.end();
      }
    }
  });
}

/**
 * Higher-level exec that returns UTF-8 strings.
 */
export async function execDocker(
  args: string[],
  opts?: ExecDockerRawOptions,
): Promise<{ stdout: string; stderr: string; code: number }> {
  const result = await execDockerRaw(args, opts);
  return {
    stdout: result.stdout.toString("utf8"),
    stderr: result.stderr.toString("utf8"),
    code: result.code,
  };
}

// ── Daemon availability ───────────────────────────────────────────────

const DOCKER_DAEMON_UNAVAILABLE_MARKERS = [
  "cannot connect to the docker daemon",
  "dial unix",
  "docker daemon is not running",
  "connection refused",
];

export function isDockerDaemonUnavailable(stderr: string): boolean {
  return DOCKER_DAEMON_UNAVAILABLE_MARKERS.some((marker) =>
    stderr.toLowerCase().includes(marker),
  );
}

export function formatDockerDaemonUnavailableError(stderr: string): string {
  const detail = stderr.trim();
  return [
    "Sandbox mode requires Docker, but the Docker daemon is not available.",
    "Start Docker, or set sandbox.enabled=false to disable sandboxing.",
    detail ? `Docker said: ${detail}` : undefined,
  ]
    .filter((line): line is string => Boolean(line))
    .join(" ");
}

/**
 * Check if Docker is available and the daemon is running.
 */
export async function detectDockerAvailable(): Promise<boolean> {
  try {
    const result = await execDocker(["info"], { allowFailure: true });
    return result.code === 0;
  } catch {
    return false;
  }
}

// ── Container lifecycle ───────────────────────────────────────────────

export async function dockerContainerState(name: string) {
  const result = await execDocker(["inspect", "-f", "{{.State.Running}}", name], {
    allowFailure: true,
  });
  if (result.code !== 0) {
    return { exists: false, running: false };
  }
  return { exists: true, running: result.stdout.trim() === "true" };
}

async function inspectDockerImage(image: string): Promise<"exists" | "missing"> {
  const result = await execDocker(["image", "inspect", image], { allowFailure: true });
  if (result.code === 0) return "exists";

  const stderr = result.stderr.trim();
  if (stderr.toLowerCase().includes("no such image")) return "missing";
  if (isDockerDaemonUnavailable(stderr)) {
    throw new Error(formatDockerDaemonUnavailableError(stderr));
  }
  throw new Error(`Failed to inspect sandbox image: ${stderr}`);
}

export async function ensureDockerImage(image: string): Promise<void> {
  const state = await inspectDockerImage(image);
  if (state === "exists") return;

  if (image === DEFAULT_SANDBOX_IMAGE) {
    // Pull the default image automatically
    await execDocker(["pull", image]);
    return;
  }
  throw new Error(
    `Sandbox image not found: ${image}. Pull it with: docker pull ${image}`,
  );
}

/**
 * Ensure a long-lived sandbox container exists and is running.
 * Creates it if missing; starts it if stopped.
 */
export async function ensureSandboxContainer(params: {
  containerName: string;
  image: string;
  workdir: string;
  env?: Record<string, string>;
  logger: Logger;
}): Promise<void> {
  const { containerName, image, workdir, env, logger } = params;

  await ensureDockerImage(image);

  const state = await dockerContainerState(containerName);

  if (!state.exists) {
    logger.debug("sandbox", `Creating container: ${containerName}`);
    const args = ["create", "--name", containerName];

    // Labels
    args.push("--label", "mxclaw.sandbox=1");
    args.push("--label", `mxclaw.container=${containerName}`);

    // Network isolation
    args.push("--network", "none");

    // Security hardening
    args.push("--security-opt", "no-new-privileges");
    args.push("--cap-drop", "ALL");
    args.push("--read-only");
    args.push("--tmpfs", `${workdir}:rw,size=512m`);
    args.push("--tmpfs", "/tmp:rw,size=128m");

    // Resource limits
    args.push("--memory", "512m");
    args.push("--cpus", "1.0");
    args.push("--pids-limit", "256");

    // Workdir
    args.push("--workdir", workdir);

    // Env vars (sanitized)
    if (env && Object.keys(env).length > 0) {
      const sanitized = sanitizeExplicitSandboxEnvVars(env);
      if (sanitized.blocked.length > 0) {
        logger.warn("sandbox", `Blocked sandbox env vars: ${sanitized.blocked.join(", ")}`);
      }
      for (const [key, value] of Object.entries(sanitized.allowed)) {
        args.push("--env", `${key}=${value}`);
      }
    }

    args.push(image, "sleep", "infinity");
    await execDocker(args);
    await execDocker(["start", containerName]);
    logger.info("sandbox", `Sandbox container started: ${containerName}`);
  } else if (!state.running) {
    logger.debug("sandbox", `Restarting stopped container: ${containerName}`);
    await execDocker(["start", containerName]);
  }
}

// ── Main entry point ─────────────────────────────────────────────────

/**
 * Run a shell command inside a Docker sandbox container.
 * This is the primary function called by tool-executor.ts.
 */
export async function runInDockerSandbox(
  opts: SandboxRunOptions & { logger: Logger },
): Promise<SandboxRunResult> {
  const { containerName, command, workdir, env, signal, logger } = opts;

  const execArgs = ["exec", "-i"];

  if (workdir) {
    execArgs.push("--workdir", workdir);
  }

  if (env) {
    const sanitized = sanitizeExplicitSandboxEnvVars(env);
    for (const [key, value] of Object.entries(sanitized.allowed)) {
      execArgs.push("--env", `${key}=${value}`);
    }
  }

  execArgs.push(containerName, "sh", "-c", command);

  logger.debug("sandbox", `exec in ${containerName}: ${command.slice(0, 100)}`);

  try {
    const result = await execDockerRaw(execArgs, { signal, allowFailure: true });
    return {
      stdout: result.stdout.toString("utf8"),
      stderr: result.stderr.toString("utf8"),
      exitCode: result.code,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      stdout: "",
      stderr: errorMsg,
      exitCode: 1,
      error: errorMsg,
    };
  }
}
