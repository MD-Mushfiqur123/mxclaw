import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createFixtureFile } from '../../helpers/fixtures.js';
import { setupTestEnvironment } from '../../helpers/test.utils.js';
import { spawn } from 'child_process';

describe('Channel Plugin Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    setupTestEnvironment();
    tempDir = createTempDir();
    
    // Create test configuration for channel plugins
    const config = {
      channels: {
        discord: {
          enabled: true,
          token: 'test-discord-token',
          guildId: 'test-guild',
          commands: {
            prefix: '!',
            channels: {
              general: 'general-channel-id',
              dm: true
            }
          }
        },
        telegram: {
          enabled: true,
          token: 'test-telegram-token',
          commands: {
            prefix: '/'
          }
        },
        whatsapp: {
          enabled: true,
          businessAccountId: 'test-whatsapp-id',
          phoneNumber: '+1234567890'
        }
      }
    };
    
    createFixtureFile('channel.config.json', config);
  });

  afterEach(() => {
    // cleanupTempDir(tempDir);
  });

  describe('Channel Registration', () => {
    test('should register all enabled channels', async () => {
      const result = await spawnChannelProcess(['register'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Channels registered: discord, telegram, whatsapp');
    });

    test('should validate channel configuration', async () => {
      const result = await spawnChannelProcess(['validate'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('All channel configurations are valid');
    });

    test('should handle missing channel configurations', async () => {
      const result = await spawnChannelProcess(['register'], {
        cwd: tempDir,
        env: { ...process.env, CHANNEL_CONFIG: 'missing.json' }
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Channel configuration not found');
    });
  });

  describe('Message Routing', () => {
    test('should route Discord messages to gateway', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: 'Hello from Discord'
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Message routed to gateway');
    });

    test('should route Telegram messages to gateway', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('telegram', {
        chatId: 'test-chat',
        from: 'user456',
        text: 'Hello from Telegram'
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Message routed to gateway');
    });

    test('should handle WhatsApp business messages', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('whatsapp', {
        from: 'number789',
        type: 'text',
        text: { body: 'Hello from WhatsApp' }
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Message routed to gateway');
    });

    test('should validate incoming message format', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123'
        // Missing content field
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Invalid message format');
    });
  });

  describe('Command Processing', () => {
    test('should process Discord commands', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: '!help'
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Command processed: help');
    });

    test('should process Telegram commands', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('telegram', {
        chatId: 'test-chat',
        from: 'user456',
        text: '/start'
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Command processed: start');
    });

    test('should handle unknown commands', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: '!unknown-command'
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Unknown command');
    });
  });

  describe('Authentication & Authorization', () => {
    test('should validate Discord webhook signature', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: 'Hello',
        signature: 'test-signature'
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Webhook signature validated');
    });

    test('should handle invalid Discord signature', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: 'Hello',
        signature: 'invalid-signature'
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Invalid webhook signature');
    });

    test('should enforce rate limiting per channel', async () => {
      await startChannels();
      
      // Send multiple messages quickly
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(simulateChannelMessage('discord', {
          channel: 'general',
          author: 'user123',
          content: `Message ${i}`
        }));
      }
      
      const results = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimited = results.filter(r => r.code === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Channel-Specific Features', () => {
    test('should handle Discord thread replies', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: 'Hello thread',
        threadId: 'thread-123'
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Thread reply processed');
    });

    test('should handle Telegram inline queries', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('telegram', {
        chatId: 'test-chat',
        from: 'user456',
        text: '/search',
        inlineQuery: { query: 'test search' }
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Inline query processed');
    });

    test('should handle WhatsApp business templates', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('whatsapp', {
        from: 'number789',
        type: 'template',
        template: {
          name: 'welcome_message',
          language: 'en'
        }
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('WhatsApp template processed');
    });
  });

  describe('Error Handling', () => {
    test('should handle channel connection failures', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: 'Hello',
        simulateError: 'connection_failed'
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Channel connection failed');
    });

    test('should handle message delivery failures', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('discord', {
        channel: 'general',
        author: 'user123',
        content: 'Hello',
        simulateError: 'delivery_failed'
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Message delivery failed');
    });

    test('should provide fallback channel handling', async () => {
      await startChannels();
      
      const result = await simulateChannelMessage('unknown-channel', {
        channel: 'general',
        author: 'user123',
        content: 'Hello'
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Unknown channel type');
    });
  });

  // Helper functions
  async function spawnChannelProcess(args: string[], options: any = {}) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/channel/dist/index.js', ...args], {
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

  async function startChannels() {
    const result = await spawnChannelProcess(['start'], { cwd: tempDir });
    expect(result.code).toBe(0);
    
    // Wait for channels to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async function simulateChannelMessage(channel: string, message: any) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', [
        'packages/channel/dist/index.js', 
        'simulate',
        '--channel', channel,
        '--message', JSON.stringify(message)
      ], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => stdout += data.toString());
      child.stderr?.on('data', (data) => stderr += data.toString());

      child.on('close', (code) => resolve({ stdout, stderr, code }));
    });
  }
});