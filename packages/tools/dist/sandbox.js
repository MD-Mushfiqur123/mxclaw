import * as child_process from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
export async function executeInSandbox(command, options) {
    if (options.type === "none") {
        return executeLocal(command, options);
    }
    if (options.type === "docker") {
        return executeDocker(command, options);
    }
    if (options.type === "ssh") {
        return executeSSH(command, options);
    }
    return executeLocal(command, options);
}
async function executeLocal(command, options) {
    return new Promise((resolve) => {
        let timedOut = false;
        const timeout = options.timeout ?? 30000;
        const proc = child_process.exec(command, {
            cwd: options.workspacePath,
            timeout,
            maxBuffer: 10 * 1024 * 1024,
            shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash",
            env: {
                ...process.env,
                HOME: os.homedir(),
                MXCLAW_WORKSPACE: options.workspacePath,
            },
        }, (error, stdout, stderr) => {
            if (timedOut)
                return;
            resolve({
                success: !error,
                stdout: stdout || "",
                stderr: stderr || "",
                exitCode: error ? error.code ? 1 : 0 : 0,
                timedOut: error?.killed ?? false,
            });
        });
        if (options.signal) {
            options.signal.addEventListener("abort", () => {
                timedOut = true;
                proc.kill("SIGKILL");
                resolve({
                    success: false, stdout: "", stderr: "Command timed out or was aborted",
                    exitCode: -1, timedOut: true,
                });
            });
        }
    });
}
async function executeDocker(command, options) {
    const image = options.image ?? "mxclaw-sandbox:latest";
    const containerName = `mxclaw-sandbox-${crypto.randomBytes(4).toString("hex")}`;
    const workspacePath = options.workspacePath;
    // Write command to a temp script
    const scriptPath = path.join(os.tmpdir(), `mxclaw-sandbox-${crypto.randomBytes(8).toString("hex")}.sh`);
    fs.writeFileSync(scriptPath, `#!/bin/bash\nset -e\n${command}\n`, { mode: 0o755 });
    const dockerCmd = [
        "docker", "run", "--rm",
        "--name", containerName,
        "--network", "none",
        "--memory", "512m",
        "--cpus", "1",
        "--pids-limit", "100",
        "--read-only",
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=100m",
        "-v", `${workspacePath}:/workspace:rw`,
        "-v", `${scriptPath}:/tmp/script.sh:ro`,
        "-w", "/workspace",
        image,
        "/bin/bash", "/tmp/script.sh",
    ].join(" ");
    try {
        const result = await executeLocal(dockerCmd, { ...options, type: "none" });
        // Cleanup
        try {
            fs.unlinkSync(scriptPath);
        }
        catch { }
        return result;
    }
    catch (err) {
        try {
            fs.unlinkSync(scriptPath);
        }
        catch { }
        return {
            success: false,
            stdout: "",
            stderr: err instanceof Error ? err.message : String(err),
            exitCode: -1,
            timedOut: false,
        };
    }
}
async function executeSSH(command, options) {
    const host = options.host ?? "localhost";
    const port = options.port ?? 22;
    const username = options.username ?? "mxclaw";
    const escapedCommand = command.replace(/'/g, "'\\''");
    const sshCmd = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -p ${port} ${username}@${host} '${escapedCommand}'`;
    return executeLocal(sshCmd, { ...options, type: "none" });
}
export function isDockerAvailable() {
    try {
        child_process.execSync("docker info", { stdio: "ignore", timeout: 5000 });
        return true;
    }
    catch {
        return false;
    }
}
export function buildSandboxImage() {
    return new Promise((resolve) => {
        const dockerfile = path.join(os.tmpdir(), "mxclaw-dockerfile");
        fs.writeFileSync(dockerfile, `
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends \\
    curl wget git python3 python3-pip nodejs npm \\
    && rm -rf /var/lib/apt/lists/*
RUN useradd -m -s /bin/bash mxclaw
USER mxclaw
WORKDIR /workspace
`);
        const proc = child_process.exec(`docker build -t mxclaw-sandbox:latest -f "${dockerfile}" "${os.tmpdir()}"`, { timeout: 120000 }, (error) => {
            try {
                fs.unlinkSync(dockerfile);
            }
            catch { }
            resolve(!error);
        });
    });
}
//# sourceMappingURL=sandbox.js.map