import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Test fixtures for common scenarios
 */
export const Fixtures = {
  // Basic gateway configuration
  gatewayConfig: {
    port: 18700,
    host: 'localhost',
    logLevel: 'info',
    security: {
      rateLimit: {
        enabled: true,
        windowMs: 60000,
        max: 100
      }
    },
    agents: {
      defaults: {
        model: 'openai/gpt-4',
        sessionTimeout: 300000,
        tools: ['bash', 'read', 'write']
      }
    }
  },

  // Test session data
  sessionData: {
    id: 'test-session-123',
    agentId: 'main',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now()
      },
      {
        id: 'msg-2', 
        role: 'assistant',
        content: 'Hello! How can I help you?',
        timestamp: Date.now()
      }
    ],
    context: {
      budget: 4000,
      used: 1200,
      remaining: 2800
    }
  },

  // Test message envelope
  messageEnvelope: {
    id: 'msg-123',
    type: 'text',
    content: {
      type: 'text',
      text: 'Hello world'
    },
    metadata: {
      timestamp: Date.now(),
      source: 'discord',
      channelId: 'test-channel'
    }
  },

  // Test provider configuration
  providerConfig: {
    openai: {
      apiKey: 'test-key',
      model: 'gpt-4',
      maxTokens: 2048,
      temperature: 0.7
    },
    claude: {
      apiKey: 'test-key',
      model: 'claude-3-opus',
      maxTokens: 2048
    }
  }
};

/**
 * Create test fixture file
 */
export function createFixtureFile(name: string, data: any): string {
  const fixturesDir = join(process.cwd(), 'test', 'fixtures');
  if (!existsSync(fixturesDir)) {
    mkdirSync(fixturesDir, { recursive: true });
  }
  
  const filePath = join(fixturesDir, `${name}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

/**
 * Load test fixture
 */
export function loadFixture<T>(name: string): T {
  const filePath = join(process.cwd(), 'test', 'fixtures', `${name}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Fixture not found: ${name}`);
  }
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}