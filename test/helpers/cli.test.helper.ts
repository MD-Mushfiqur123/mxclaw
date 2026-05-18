import { spawn } from 'child_process';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Test helper for running CLI commands with proper isolation
 */
export async function runCommand(cmd: string[], options: {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
} = {}) {
  const { cwd = process.cwd(), env = {}, timeout = 10000 } = options;
  
  return new Promise<{ stdout: string; stderr: string; code: number | null }>(resolve => {
    const child = spawn(cmd[0], cmd.slice(1), {
      cwd,
      env: { ...process.env, ...env },
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => stdout += data.toString());
    child.stderr?.on('data', (data) => stderr += data.toString());

    child.on('close', (code) => resolve({ stdout, stderr, code }));
    child.on('error', (error) => resolve({ stdout, stderr, code: -1, error }));

    if (timeout) {
      setTimeout(() => {
        child.kill('SIGTERM');
        resolve({ stdout, stderr, code: 'timeout' as any });
      }, timeout);
    }
  });
}

/**
 * Create temporary directory for testing
 */
export function createTempDir(): string {
  const tempDir = join(process.cwd(), 'test', 'temp', Date.now().toString());
  mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 */
export function cleanupTempDir(dirPath: string): void {
  if (existsSync(dirPath)) {
    require('fs').rmSync(dirPath, { recursive: true, force: true });
  }
}