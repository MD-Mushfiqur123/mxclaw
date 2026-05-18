import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createFixtureFile } from '../../helpers/fixtures.js';
import { setupTestEnvironment } from '../../helpers/test.utils.js';
import { spawn } from 'child_process';

describe('Setup Wizard and Configuration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    setupTestEnvironment();
    tempDir = createTempDir();
    
    // Create minimal initial config for testing
    const minimalConfig = {
      version: '1.0.0',
      setup: {
        completed: false,
        step: 0
      }
    };
    
    createFixtureFile('config.json', minimalConfig);
  });

  afterEach(() => {
    // cleanupTempDir(tempDir);
  });

  describe('Setup Wizard Flow', () => {
    test('should start setup wizard', async () => {
      const result = await spawnSetupProcess(['start'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Setup wizard started');
      expect(result.stdout).toContain('Welcome to MxClaw');
    });

    test('should guide through setup steps', async () => {
      const steps = [
        { step: 1, action: 'provider', input: 'openai' },
        { step: 2, action: 'model', input: 'gpt-4' },
        { step: 3, action: 'channels', input: 'discord,telegram' },
        { step: 4, action: 'skills', input: 'github,notion' },
        { step: 5, action: 'storage', input: 'jsonl' }
      ];

      let currentResult = await spawnSetupProcess(['start'], { cwd: tempDir });
      
      for (const step of steps) {
        currentResult = await spawnSetupProcess([
          'step',
          '--current', step.step.toString(),
          '--action', step.action,
          '--input', step.input
        ], { cwd: tempDir });
        
        expect(currentResult.code).toBe(0);
        expect(currentResult.stdout).toContain(`Step ${step.step} completed`);
      }
      
      // Complete setup
      const finalResult = await spawnSetupProcess(['complete'], { cwd: tempDir });
      expect(finalResult.code).toBe(0);
      expect(finalResult.stdout).toContain('Setup completed successfully');
    });

    test('should handle setup validation', async () => {
      const result = await spawnSetupProcess(['validate'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Setup not completed');
    });

    test('should allow setup restart', async () => {
      const result = await spawnSetupProcess(['restart'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Setup restarted');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate complete configuration', async () => {
      createFixtureFile('complete-config.json', {
        agent: {
          model: 'openai/gpt-4',
          sessionTimeout: 300000,
          tools: ['bash', 'read', 'write']
        },
        channels: {
          discord: {
            enabled: true,
            token: 'test-token',
            guildId: 'test-guild'
          },
          telegram: {
            enabled: true,
            token: 'test-token'
          }
        },
        skills: {
          github: {
            enabled: true,
            token: 'test-token'
          },
          notion: {
            enabled: true,
            token: 'test-token'
          }
        },
        security: {
          rateLimit: {
            enabled: true,
            windowMs: 60000,
            max: 100
          }
        },
        storage: {
          type: 'jsonl',
          path: './data'
        }
      });

      const result = await spawnSetupProcess(['validate', '--config', 'complete-config.json'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration is valid');
    });

    test('should detect missing required fields', async () => {
      createFixtureFile('incomplete-config.json', {
        // Missing required fields
        security: {
          rateLimit: {
            enabled: true
          }
        }
      });

      const result = await spawnSetupProcess(['validate', '--config', 'incomplete-config.json'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Missing required fields');
    });

    test('should validate configuration types', async () => {
      createFixtureFile('invalid-config.json', {
        agent: {
          model: 123, // Should be string
          sessionTimeout: 'invalid', // Should be number
          tools: 'bash' // Should be array
        }
      });

      const result = await spawnSetupProcess(['validate', '--config', 'invalid-config.json'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Invalid configuration types');
    });
  });

  describe('Configuration Migration', () => {
    test('should migrate from old configuration format', async () => {
      createFixtureFile('old-config.json', {
        // Old format
        model: 'openai/gpt-4',
        timeout: 300000,
        channels: ['discord', 'telegram'],
        skills: ['github', 'notion']
      });

      const result = await spawnSetupProcess(['migrate', '--config', 'old-config.json'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration migrated successfully');
    });

    test('should handle migration errors', async () => {
      createFixtureFile('invalid-old-config.json', {
        // Invalid old format
        model: 123,
        timeout: 'invalid'
      });

      const result = await spawnSetupProcess(['migrate', '--config', 'invalid-old-config.json'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Migration failed');
    });

    test('should backup original configuration', async () => {
      createFixtureFile('old-config.json', {
        model: 'openai/gpt-4',
        timeout: 300000
      });

      const result = await spawnSetupProcess(['migrate', '--config', 'old-config.json', '--backup'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration backed up');
    });
  });

  describe('Configuration Hot Reload', () => {
    test('should enable configuration hot reload', async () => {
      const result = await spawnSetupProcess(['hot-reload', 'enable'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Hot reload enabled');
    });

    test('should handle configuration changes', async () => {
      await spawnSetupProcess(['hot-reload', 'enable'], { cwd: tempDir });
      
      // Simulate configuration change
      createFixtureFile('config.json', {
        version: '1.0.0',
        setup: {
          completed: true,
          step: 5
        },
        agent: {
          model: 'openai/gpt-4',
          sessionTimeout: 600000 // Changed from default
        }
      });

      const result = await spawnSetupProcess(['hot-reload', 'detect'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration change detected');
    });

    test('should revert on invalid configuration', async () => {
      await spawnSetupProcess(['hot-reload', 'enable'], { cwd: tempDir });
      
      // Create invalid configuration
      createFixtureFile('config.json', {
        version: '1.0.0',
        agent: {
          model: 123 // Invalid type
        }
      });

      const result = await spawnSetupProcess(['hot-reload', 'detect'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Configuration invalid, reverted');
    });
  });

  describe('Configuration Templates', () => {
    test('should create configuration template', async () => {
      const result = await spawnSetupProcess(['template', 'create', '--name', 'minimal'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Template created: minimal');
    });

    test('should list available templates', async () => {
      await spawnSetupProcess(['template', 'create', '--name', 'minimal'], { cwd: tempDir });
      await spawnSetupProcess(['template', 'create', '--name', 'full'], { cwd: tempDir });

      const result = await spawnSetupProcess(['template', 'list'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('minimal');
      expect(result.stdout).toContain('full');
    });

    test('should apply configuration template', async () => {
      await spawnSetupProcess(['template', 'create', '--name', 'minimal'], { cwd: tempDir });
      
      const result = await spawnSetupProcess(['template', 'apply', '--name', 'minimal'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Template applied: minimal');
    });
  });

  describe('Configuration Environment Variables', () => {
    test('should load configuration from environment variables', async () => {
      const env = {
        ...process.env,
        MXCLAW_AGENT_MODEL: 'openai/gpt-4',
        MXCLAW_SESSION_TIMEOUT: '300000',
        MXCLAW_CHANNELS_DISCORD_ENABLED: 'true'
      };

      const result = await spawnSetupProcess(['env', 'load'], {
        cwd: tempDir,
        env
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Environment variables loaded');
    });

    test('should validate environment variables', async () => {
      const env = {
        ...process.env,
        MXCLAW_AGENT_MODEL: 'openai/gpt-4',
        MXCLAW_SESSION_TIMEOUT: 'invalid' // Invalid number
      };

      const result = await spawnSetupProcess(['env', 'validate'], {
        cwd: tempDir,
        env
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Invalid environment variables');
    });
  });

  describe('Configuration Security', () => {
    test('should encrypt sensitive configuration', async () => {
      createFixtureFile('sensitive-config.json', {
        agent: {
          model: 'openai/gpt-4',
          apiKey: 'test-secret-key',
          sessionTimeout: 300000
        }
      });

      const result = await spawnSetupProcess(['encrypt', '--config', 'sensitive-config.json'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration encrypted');
    });

    test('should decrypt sensitive configuration', async () => {
      await spawnSetupProcess(['encrypt', '--config', 'sensitive-config.json'], { cwd: tempDir });
      
      const result = await spawnSetupProcess(['decrypt', '--config', 'sensitive-config.json'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration decrypted');
    });

    test('should handle decryption errors', async () => {
      const result = await spawnSetupProcess(['decrypt', '--config', 'sensitive-config.json'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Decryption failed');
    });
  });

  // Helper functions
  async function spawnSetupProcess(args: string[], options: any = {}) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/setup/dist/index.js', ...args], {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => stdout += data.toString());
      child.stderr?.on('data', (data) => stderr += data.toString());

      child.on('close', (code) => resolve({ stdout, stderr, code }));
      child.on('error', (error) => resolve({ stdout, stderr, code: -1, error }));
    });
  }
});