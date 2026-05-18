import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createFixtureFile } from '../../helpers/fixtures.js';
import { setupTestEnvironment } from '../../helpers/test.utils.js';
import { spawn } from 'child_process';

describe('Storage Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    setupTestEnvironment();
    tempDir = createTempDir();
    
    // Create storage configuration
    const storageConfig = {
      type: 'jsonl',
      path: './data',
      adapters: {
        jsonl: {
          enabled: true,
          compression: true,
          maxFileSize: 1000000,
          retentionDays: 30
        },
        sqlite: {
          enabled: false, // Not implemented yet
          path: './data/sqlite.db',
          backup: true
        },
        redis: {
          enabled: false, // Not implemented yet
          url: 'redis://localhost:6379',
          ttl: 3600
        }
      },
      encryption: {
        enabled: true,
        algorithm: 'aes-256-gcm',
        key: 'test-encryption-key'
      }
    };
    
    createFixtureFile('storage.config.json', storageConfig);
  });

  afterEach(() => {
    // cleanupTempDir(tempDir);
  });

  describe('Storage Initialization', () => {
    test('should initialize JSONL storage', async () => {
      const result = await spawnStorageProcess(['init', '--type', 'jsonl'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Storage initialized');
      expect(result.stdout).toContain('Type: jsonl');
    });

    test('should validate storage configuration', async () => {
      const result = await spawnStorageProcess(['validate'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Storage configuration is valid');
    });

    test('should handle invalid storage configuration', async () => {
      const invalidConfig = {
        type: 'invalid-type',
        path: './data'
      };
      
      createFixtureFile('invalid-storage.config.json', invalidConfig);
      
      const result = await spawnStorageProcess(['validate', '--config', 'invalid-storage.config.json'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Invalid storage configuration');
    });
  });

  describe('Session Storage', () => {
    test('should create session', async () => {
      const sessionData = {
        id: 'test-session-123',
        agentId: 'main',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            timestamp: Date.now()
          }
        ],
        context: {
          budget: 4000,
          used: 1200,
          remaining: 2800
        },
        metadata: {
          created: Date.now(),
          lastUpdated: Date.now(),
          userAgent: 'test-agent'
        }
      };

      const result = await spawnStorageProcess([
        'session', 'create',
        '--id', 'test-session-123',
        '--data', JSON.stringify(sessionData)
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Session created');
      expect(result.stdout).toContain('test-session-123');
    });

    test('should retrieve session', async () => {
      await spawnStorageProcess([
        'session', 'create',
        '--id', 'test-session-123',
        '--data', JSON.stringify({
          id: 'test-session-123',
          agentId: 'main',
          messages: []
        })
      ], { cwd: tempDir });

      const result = await spawnStorageProcess([
        'session', 'get',
        '--id', 'test-session-123'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('test-session-123');
      expect(result.stdout).toContain('main');
    });

    test('should update session', async () => {
      // Create session first
      await spawnStorageProcess([
        'session', 'create',
        '--id', 'test-session-123',
        '--data', JSON.stringify({
          id: 'test-session-123',
          agentId: 'main',
          messages: []
        })
      ], { cwd: tempDir });

      // Update session
      const updatedData = {
        id: 'test-session-123',
        agentId: 'main',
        messages: [
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Hello!',
            timestamp: Date.now()
          }
        ],
        metadata: {
          lastUpdated: Date.now()
        }
      };

      const result = await spawnStorageProcess([
        'session', 'update',
        '--id', 'test-session-123',
        '--data', JSON.stringify(updatedData)
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Session updated');
    });

    test('should delete session', async () => {
      await spawnStorageProcess([
        'session', 'create',
        '--id', 'test-session-123',
        '--data', JSON.stringify({
          id: 'test-session-123',
          agentId: 'main',
          messages: []
        })
      ], { cwd: tempDir });

      const result = await spawnStorageProcess([
        'session', 'delete',
        '--id', 'test-session-123'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Session deleted');
    });

    test('should list sessions', async () => {
      // Create multiple sessions
      await spawnStorageProcess([
        'session', 'create',
        '--id', 'session-1',
        '--data', JSON.stringify({ id: 'session-1', agentId: 'main' })
      ], { cwd: tempDir });

      await spawnStorageProcess([
        'session', 'create',
        '--id', 'session-2',
        '--data', JSON.stringify({ id: 'session-2', agentId: 'test' })
      ], { cwd: tempDir });

      const result = await spawnStorageProcess([
        'session', 'list'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('session-1');
      expect(result.stdout).toContain('session-2');
    });

    test('should handle session not found', async () => {
      const result = await spawnStorageProcess([
        'session', 'get',
        '--id', 'non-existent-session'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Session not found');
    });
  });

  describe('Message Storage', () => {
    test('should store message', async () => {
      const messageData = {
        id: 'msg-123',
        sessionId: 'test-session-123',
        role: 'user',
        content: {
          type: 'text',
          text: 'Hello world'
        },
        metadata: {
          timestamp: Date.now(),
          source: 'discord',
          channelId: 'test-channel'
        }
      };

      const result = await spawnStorageProcess([
        'message', 'store',
        '--id', 'msg-123',
        '--data', JSON.stringify(messageData)
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Message stored');
    });

    test('should retrieve message', async () => {
      await spawnStorageProcess([
        'message', 'store',
        '--id', 'msg-123',
        '--data', JSON.stringify({
          id: 'msg-123',
          sessionId: 'test-session-123',
          role: 'user',
          content: {
            type: 'text',
            text: 'Hello world'
          }
        })
      ], { cwd: tempDir });

      const result = await spawnStorageProcess([
        'message', 'get',
        '--id', 'msg-123'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('msg-123');
      expect(result.stdout).toContain('Hello world');
    });

    test('should query messages by session', async () => {
      // Store multiple messages for same session
      await spawnStorageProcess([
        'message', 'store',
        '--id', 'msg-1',
        '--data', JSON.stringify({
          id: 'msg-1',
          sessionId: 'session-123',
          role: 'user',
          content: { type: 'text', text: 'Hello' }
        })
      ], { cwd: tempDir });

      await spawnStorageProcess([
        'message', 'store',
        '--id', 'msg-2',
        '--data', JSON.stringify({
          id: 'msg-2',
          sessionId: 'session-123',
          role: 'assistant',
          content: { type: 'text', text: 'Hi there!' }
        })
      ], { cwd: tempDir });

      const result = await spawnStorageProcess([
        'message', 'query',
        '--session', 'session-123'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('msg-1');
      expect(result.stdout).toContain('msg-2');
    });

    test('should handle message not found', async () => {
      const result = await spawnStorageProcess([
        'message', 'get',
        '--id', 'non-existent-message'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Message not found');
    });
  });

  describe('Storage Performance', () => {
    test('should handle bulk message storage', async () => {
      const messages = [];
      for (let i = 0; i < 100; i++) {
        messages.push({
          id: `msg-${i}`,
          sessionId: 'bulk-test-session',
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: {
            type: 'text',
            text: `Message ${i}`
          },
          metadata: {
            timestamp: Date.now() + i,
            source: 'test'
          }
        });
      }

      const result = await spawnStorageProcess([
        'message', 'bulk-store',
        '--data', JSON.stringify(messages)
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Messages stored');
      expect(result.stdout).toContain('100');
    });

    test('should optimize storage compression', async () => {
      const result = await spawnStorageProcess([
        'storage', 'compress',
        '--session', 'test-session-123'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Storage compressed');
    });

    test('should handle storage cleanup', async () => {
      const result = await spawnStorageProcess([
        'storage', 'cleanup',
        '--retention', '30'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Storage cleaned up');
    });
  });

  describe('Storage Security', () => {
    test('should encrypt sensitive data', async () => {
      const sensitiveData = {
        apiKey: 'test-secret-key',
        sessionData: {
          sensitiveInfo: 'confidential'
        }
      };

      const result = await spawnStorageProcess([
        'storage', 'encrypt',
        '--data', JSON.stringify(sensitiveData)
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Data encrypted');
    });

    test('should decrypt sensitive data', async () => {
      await spawnStorageProcess([
        'storage', 'encrypt',
        '--data', JSON.stringify({
          apiKey: 'test-secret-key'
        })
      ], { cwd: tempDir });

      const result = await spawnStorageProcess([
        'storage', 'decrypt',
        '--id', 'encrypted-data'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Data decrypted');
    });

    test('should handle decryption errors', async () => {
      const result = await spawnStorageProcess([
        'storage', 'decrypt',
        '--id', 'non-existent-encrypted-data'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Decryption failed');
    });
  });

  describe('Storage Backup and Recovery', () => {
    test('should create storage backup', async () => {
      const result = await spawnStorageProcess([
        'storage', 'backup',
        '--output', './backup.jsonl'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Backup created');
    });

    test('should restore from backup', async () => {
      // Create backup first
      await spawnStorageProcess([
        'storage', 'backup',
        '--output', './backup.jsonl'
      ], { cwd: tempDir });

      const result = await spawnStorageProcess([
        'storage', 'restore',
        '--input', './backup.jsonl'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Backup restored');
    });

    test('should handle backup errors', async () => {
      const result = await spawnStorageProcess([
        'storage', 'restore',
        '--input', './non-existent-backup.jsonl'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Backup not found');
    });
  });

  describe('Storage Monitoring', () => {
    test('should get storage statistics', async () => {
      const result = await spawnStorageProcess([
        'storage', 'stats'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Storage Statistics');
      expect(result.stdout).toContain('Total Sessions:');
      expect(result.stdout).toContain('Total Messages:');
    });

    test('should monitor storage health', async () => {
      const result = await spawnStorageProcess([
        'storage', 'health'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Storage Health');
      expect(result.stdout).toContain('Status: Healthy');
    });

    test('should handle storage errors', async () => {
      const result = await spawnStorageProcess([
        'storage', 'health',
        '--simulate-error': 'disk_full'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Storage error: disk_full');
    });
  });

  // Helper functions
  async function spawnStorageProcess(args: string[], options: any = {}) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/storage/dist/index.js', ...args], {
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