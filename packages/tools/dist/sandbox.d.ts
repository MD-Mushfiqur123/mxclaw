export interface SandboxOptions {
    type: "docker" | "ssh" | "none";
    image?: string;
    host?: string;
    port?: number;
    username?: string;
    workspacePath: string;
    timeout?: number;
    signal?: AbortSignal;
}
export interface SandboxResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
}
export declare function executeInSandbox(command: string, options: SandboxOptions): Promise<SandboxResult>;
export declare function isDockerAvailable(): boolean;
export declare function buildSandboxImage(): Promise<boolean>;
//# sourceMappingURL=sandbox.d.ts.map