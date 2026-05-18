import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createFixtureFile, loadFixture } from '../../helpers/fixtures.js';
import { setupTestEnvironment } from '../../helpers/test.utils.js';
import { spawn } from 'child_process';

describe('Gateway E2E Tests', () => {
  let gatewayProcess: any;
  let gatewayPort = 18701; // Use different port to avoid conflicts

  beforeEach(async () => {
    setupTestEnvironment();
    
    // Create test configuration
    const config = {
      port: gatewayPort,
      agents: {
        defaults: {
          model: 'openai/gpt-4',
          sessionTimeout: 300000
        },
        agents: {
          main: {
            model: 'openai/gpt-4',
            tools: ['bash', 'read', 'write']
          },
          test: {
            model: 'claude/claude-3-opus',
            tools: ['bash']
          }
        }
      }
    };

    createFixtureFile('gateway.config.json', config);
  });

  afterEach(async () => {
    if (gatewayProcess) {
      gatewayProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  describe('Multi-Agent Routing', () => {
    test('should start gateway with multiple agents', async () => {
      const result = await spawnGatewayProcess();
      
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Gateway started');
      expect(result.stdout).toContain('Agents registered: main, test');
    });

    test('should route messages to correct agent', async () => {
      await startGateway();
      
      // Test routing to main agent
      const mainResult = await sendAgentMessage('main', 'Hello main agent');
      expect(mainResult.stdout).toContain('Agent: main');
      
      // Test routing to test agent
      const testResult = await sendAgentMessage('test', 'Hello test agent');
      expect(testResult.stdout).toContain('Agent: test');
    });

    test('should handle unknown agent routing', async () => {
      await startGateway();
      
      const result = await sendAgentMessage('unknown', 'Hello unknown');
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Unknown agent');
    });
  });

  describe('Session Management', () => {
    test('should create and manage sessions', async () => {
      await startGateway();
      
      const sessionResult = await createSession('main', 'test-session-123');
      expect(sessionResult.stdout).toContain('Session created');
      expect(sessionResult.stdout).toContain('test-session-123');
      
      const listResult = await listSessions();
      expect(listResult.stdout).toContain('test-session-123');
    });

    test('should handle session timeouts', async () => {
      await startGateway();
      
      // Create session with short timeout
      const config = {
        port: gatewayPort,
        agents: {
          defaults: {
            sessionTimeout: 1000 // 1 second
          }
        }
      };
      
      createFixtureFile('gateway.config.json', config);
      await startGateway();
      
      await createSession('main', 'timeout-test');
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await listSessions();
      expect(result.stdout).not.toContain('timeout-test');
    });
  });

  describe('WebSocket Communication', () => {
    test('should establish WebSocket connection', async () => {
      await startGateway();
      
      // Simulate WebSocket connection
      const ws = new WebSocket(`ws://localhost:${gatewayPort}`);
      
      return new Promise((resolve) => {
        ws.onopen = () => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          ws.close();
          resolve();
        };
        
        ws.onerror = (error) => {
          throw new Error('WebSocket connection failed');
        };
      });
    });

    test('should handle WebSocket message routing', async () => {
      await startGateway();
      
      return new Promise((resolve) => {
        const ws = new WebSocket(`ws://localhost:${gatewayPort}`);
        
        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'message',
            agent: 'main',
            content: 'Hello WebSocket'
          }));
        };
        
        ws.onmessage = (event) => {
          const response = JSON.parse(event.data);
          expect(response.type).toBe('response');
          expect(response.agent).toBe('main');
          ws.close();
          resolve();
        };
      });
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      await startGateway();
      
      // Send multiple messages quickly
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(sendAgentMessage('main', `Message ${i}`));
      }
      
      const results = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimited = results.filter(r => r.code === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  // Helper functions
  async function spawnGatewayProcess() {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/gateway/dist/index.js', 'start', '--config', 'test/fixtures/gateway.config.json'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => stdout += data.toString());
      child.stderr?.on('data', (data) => stderr += data.toString());

      child.on('close', (code) => resolve({ stdout, stderr, code }));
      child.on('error', (error) => resolve({ stdout, stderr, code: -1, error }));

      gatewayProcess = child;
    });
  }

  async function startGateway() {
    await spawnGatewayProcess();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for startup
  }

  async function sendAgentMessage(agent: string, message: string) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/message/dist/index.js', 'send', '--agent', agent, '--message', message], {
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

  async function createSession(agent: string, sessionId: string) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/session/dist/index.js', 'create', '--agent', agent, '--id', sessionId], {
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

  async function listSessions() {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/session/dist/index.js', 'list'], {
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