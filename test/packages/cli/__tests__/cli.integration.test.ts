import { describe, expect, test, vi } from 'vitest';
import { runCommand, createTempDir, cleanupTempDir } from '../helpers/cli.test.helper.js';
import { createFixtureFile } from '../helpers/fixtures.js';
import { spawn } from 'child_process';

describe('CLI Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Gateway Commands', () => {
    test('should start gateway with default configuration', async () => {
      const result = await runCommand(['node', 'packages/gateway/dist/index.js', 'start'], {
        cwd: tempDir,
        timeout: 5000
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Gateway started');
    });

    test('should show gateway status', async () => {
      const result = await runCommand(['node', 'packages/gateway/dist/index.js', 'status'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Gateway status');
    });

    test('should handle invalid commands gracefully', async () => {
      const result = await runCommand(['node', 'packages/gateway/dist/index.js', 'invalid-command'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Unknown command');
    });
  });

  describe('Agent Commands', () => {
    test('should list available agents', async () => {
      const result = await runCommand(['node', 'packages/agent/dist/index.js', 'list'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Available agents');
    });

    test('should create new agent session', async () => {
      createFixtureFile('config.json', {
        agent: { model: 'openai/gpt-4' }
      });

      const result = await runCommand([
        'node', 'packages/agent/dist/index.js', 'create', 'test-agent'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Agent created');
    });
  });

  describe('Message Commands', () => {
    test('should send message to agent', async () => {
      const result = await runCommand([
        'node', 'packages/message/dist/index.js', 'send',
        '--agent', 'main',
        '--message', 'Hello test'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Message sent');
    });

    test('should validate message format', async () => {
      const result = await runCommand([
        'node', 'packages/message/dist/index.js', 'send',
        '--agent', 'main'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Missing required parameter');
    });
  });

  describe('Setup Commands', () => {
    test('should run setup wizard', async () => {
      const result = await runCommand(['node', 'packages/cli/dist/index.js', 'setup'], {
        cwd: tempDir,
        timeout: 10000
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Setup completed');
    });

    test('should validate configuration after setup', async () => {
      createFixtureFile('config.json', {
        agent: { model: 'openai/gpt-4' },
        security: { rateLimit: { enabled: true } }
      });

      const result = await runCommand(['node', 'packages/cli/dist/index.js', 'config', 'validate'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration is valid');
    });
  });
});