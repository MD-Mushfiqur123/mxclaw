import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createFixtureFile } from '../../helpers/fixtures.js';
import { setupTestEnvironment } from '../../helpers/test.utils.js';
import { spawn } from 'child_process';

describe('Skills Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    setupTestEnvironment();
    tempDir = createTempDir();
    
    // Create skills configuration
    const skillsConfig = {
      skills: [
        {
          id: 'github',
          name: 'GitHub Integration',
          description: 'GitHub repository management and issue tracking',
          triggers: ['github', 'repo', 'issue', 'pr'],
          enabled: true,
          config: {
            token: 'test-github-token',
            defaultRepo: 'test/repo'
          }
        },
        {
          id: 'notion',
          name: 'Notion Integration',
          description: 'Notion database and page management',
          triggers: ['notion', 'page', 'database'],
          enabled: true,
          config: {
            token: 'test-notion-token',
            databaseId: 'test-database-id'
          }
        },
        {
          id: 'spotify',
          name: 'Spotify Integration',
          description: 'Spotify music and playlist management',
          triggers: ['spotify', 'music', 'playlist', 'song'],
          enabled: true,
          config: {
            clientId: 'test-spotify-client-id',
            clientSecret: 'test-spotify-client-secret',
            redirectUri: 'http://localhost:3000/callback'
          }
        },
        {
          id: 'slack',
          name: 'Slack Integration',
          description: 'Slack messaging and channel management',
          triggers: ['slack', 'message', 'channel'],
          enabled: true,
          config: {
            token: 'test-slack-token',
            defaultChannel: '#general'
          }
        }
      ],
      settings: {
        autoLoad: true,
        skillTimeout: 30000,
        maxSkillsPerSession: 10,
        skillCacheSize: 100
      }
    };
    
    createFixtureFile('skills.config.json', skillsConfig);
  });

  afterEach(() => {
    // cleanupTempDir(tempDir);
  });

  describe('Skills Registration', () => {
    test('should load all enabled skills', async () => {
      const result = await spawnSkillsProcess(['load'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Skills loaded: 4');
      expect(result.stdout).toContain('github, notion, spotify, slack');
    });

    test('should validate skill configurations', async () => {
      const result = await spawnSkillsProcess(['validate'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('All skill configurations are valid');
    });

    test('should handle missing skill dependencies', async () => {
      const result = await spawnSkillsProcess(['load'], {
        cwd: tempDir,
        env: { ...process.env, SKILL_CONFIG: 'missing.json' }
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Skill configuration not found');
    });
  });

  describe('Skills Execution', () => {
    test('should execute GitHub skill', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'list-repos',
        '--params', JSON.stringify({ owner: 'test-owner' })
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('GitHub skill executed');
      expect(result.stdout).toContain('Repositories found');
    });

    test('should execute Notion skill', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'notion',
        '--action', 'query-database',
        '--params', JSON.stringify({ databaseId: 'test-db' })
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Notion skill executed');
      expect(result.stdout).toContain('Database queried');
    });

    test('should execute Spotify skill', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'spotify',
        '--action', 'search',
        '--params', JSON.stringify({ query: 'test song' })
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Spotify skill executed');
      expect(result.stdout).toContain('Search results');
    });

    test('should execute Slack skill', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'slack',
        '--action', 'send-message',
        '--params', JSON.stringify({ channel: '#general', text: 'Hello Slack' })
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Slack skill executed');
      expect(result.stdout).toContain('Message sent');
    });

    test('should handle unknown skill execution', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'unknown-skill',
        '--action', 'test-action'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Unknown skill: unknown-skill');
    });
  });

  describe('Skills Configuration Management', () => {
    test('should update skill configuration', async () => {
      const result = await spawnSkillsProcess([
        'update',
        '--skill', 'github',
        '--config', JSON.stringify({ 
          token: 'updated-token',
          defaultRepo: 'updated/repo'
        })
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Configuration updated');
    });

    test('should handle invalid skill configuration', async () => {
      const result = await spawnSkillsProcess([
        'update',
        '--skill', 'github',
        '--config', JSON.stringify({ invalid: 'config' })
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Invalid configuration');
    });

    test('should enable/disable skills', async () => {
      const result = await spawnSkillsProcess([
        'disable',
        '--skill', 'github'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Skill disabled: github');
    });
  });

  describe('Skills Trigger Matching', () => {
    test('should match skill triggers', async () => {
      const result = await spawnSkillsProcess([
        'trigger',
        '--text', 'I need help with GitHub issues'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Matched skills: github');
    });

    test('should handle ambiguous trigger matching', async () => {
      const result = await spawnSkillsProcess([
        'trigger',
        '--text', 'I need help with music and playlists'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Matched skills: spotify');
    });

    test('should handle no trigger matching', async () => {
      const result = await spawnSkillsProcess([
        'trigger',
        '--text', 'I need help with something else'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('No matching skills found');
    });
  });

  describe('Skills Error Handling', () => {
    test('should handle skill execution errors', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'invalid-action',
        '--simulate-error', 'api_error'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Skill execution failed');
    });

    test('should handle skill timeouts', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'slow-action',
        '--timeout', '1000'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Skill timeout');
    });

    test('should handle skill rate limiting', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'rate-limited-action',
        '--simulate-rate-limit': 'true'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Rate limit exceeded');
    });
  });

  describe('Skills Performance', () => {
    test('should handle concurrent skill execution', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(spawnSkillsProcess([
          'execute',
          '--skill', 'github',
          '--action', 'list-repos',
          '--params', JSON.stringify({ owner: `test-owner-${i}` })
        ], {
          cwd: tempDir
        }));
      }
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.code).toBe(0);
      });
    });

    test('should implement skill caching', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'list-repos',
        '--params', JSON.stringify({ owner: 'test-owner' }),
        '--cache': 'true'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Result cached');
    });

    test('should handle skill memory management', async () => {
      const result = await spawnSkillsProcess([
        'memory',
        '--action', 'cleanup',
        '--threshold', '100'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Memory cleaned up');
    });
  });

  describe('Skills Security', () => {
    test('should validate skill permissions', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'admin-action',
        '--simulate-permission-error': 'true'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Permission denied');
    });

    test('should sanitize skill input', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'create-repo',
        '--params', JSON.stringify({ name: 'test<script>alert(1)</script>' })
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Input sanitized');
    });

    test('should handle skill authentication', async () => {
      const result = await spawnSkillsProcess([
        'execute',
        '--skill', 'github',
        '--action', 'auth-test',
        '--simulate-auth-error': 'true'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Authentication failed');
    });
  });

  // Helper functions
  async function spawnSkillsProcess(args: string[], options: any = {}) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/skills/dist/index.js', ...args], {
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