import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createFixtureFile } from '../../helpers/fixtures.js';
import { setupTestEnvironment } from '../../helpers/test.utils.js';
import { spawn } from 'child_process';

describe('Voice Plugin Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    setupTestEnvironment();
    tempDir = createTempDir();
    
    // Create voice configuration
    const voiceConfig = {
      providers: {
        openai: {
          enabled: true,
          apiKey: 'test-openai-key',
          model: 'tts-1',
          voice: 'alloy',
          rate: 1.0,
          volume: 1.0
        },
        azure: {
          enabled: true,
          apiKey: 'test-azure-key',
          region: 'eastus',
          voiceName: 'en-US-JennyNeural',
          language: 'en-US'
        },
        elevenlabs: {
          enabled: true,
          apiKey: 'test-elevenlabs-key',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          model: 'eleven_monolingual_v1',
          voiceConfig: {
            stability: 0.5,
            similarity: 0.5
          }
        }
      },
      settings: {
        defaultProvider: 'openai',
        fallbackProvider: 'azure',
        maxRetries: 3,
        timeout: 30000,
        outputFormat: 'mp3',
        sampleRate: 24000
      }
    };
    
    createFixtureFile('voice.config.json', voiceConfig);
  });

  afterEach(() => {
    // cleanupTempDir(tempDir);
  });

  describe('Voice Provider Registration', () => {
    test('should register all enabled voice providers', async () => {
      const result = await spawnVoiceProcess(['providers', 'list'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Available providers: openai, azure, elevenlabs');
    });

    test('should validate voice provider configuration', async () => {
      const result = await spawnVoiceProcess(['providers', 'validate'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('All provider configurations are valid');
    });

    test('should handle missing provider configuration', async () => {
      const result = await spawnVoiceProcess(['providers', 'validate'], {
        cwd: tempDir,
        env: { ...process.env, VOICE_CONFIG: 'missing.json' }
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Voice configuration not found');
    });
  });

  describe('Text-to-Speech Processing', () => {
    test('should convert text to speech using OpenAI', async () => {
      const result = await spawnVoiceProcess(['tts', '--provider', 'openai', '--text', 'Hello world'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Audio generated successfully');
      expect(result.stdout).toContain('Duration:');
    });

    test('should convert text to speech using Azure', async () => {
      const result = await spawnVoiceProcess(['tts', '--provider', 'azure', '--text', 'Hello Azure'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Azure audio generated successfully');
    });

    test('should convert text to speech using ElevenLabs', async () => {
      const result = await spawnVoiceProcess(['tts', '--provider', 'elevenlabs', '--text', 'Hello ElevenLabs'], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('ElevenLabs audio generated successfully');
    });

    test('should handle text validation', async () => {
      const result = await spawnVoiceProcess(['tts', '--text'], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Missing required parameter');
    });

    test('should handle text length limits', async () => {
      const longText = 'a'.repeat(5000); // Exceed typical limits
      const result = await spawnVoiceProcess(['tts', '--text', longText], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Text exceeds maximum length');
    });
  });

  describe('Voice Configuration', () => {
    test('should apply voice settings', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--rate', '1.2',
        '--volume', '0.8'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Rate applied: 1.2');
      expect(result.stdout).toContain('Volume applied: 0.8');
    });

    test('should handle invalid voice settings', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--rate', 'invalid-rate'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Invalid rate parameter');
    });

    test('should apply voice selection', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--voice', 'nova'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Voice applied: nova');
    });
  });

  describe('Error Handling and Fallbacks', () => {
    test('should handle provider failures gracefully', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--simulate-error', 'api_error'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('Provider error: api_error');
    });

    test('should use fallback provider on primary failure', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--simulate-error', 'api_error',
        '--use-fallback'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Using fallback provider: azure');
    });

    test('should handle fallback failures', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--simulate-error', 'api_error',
        '--simulate-fallback-error', 'rate_limit'
      ], {
        cwd: tempDir
      });

      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain('All providers failed');
    });

    test('should implement retry logic', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--simulate-error', 'temporary_error',
        '--retries', '2'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Retry attempt 1');
      expect(result.stdout).toContain('Retry attempt 2');
    });
  });

  describe('Audio Processing', () => {
    test('should generate audio in multiple formats', async () => {
      const formats = ['mp3', 'wav', 'ogg'];
      
      for (const format of formats) {
        const result = await spawnVoiceProcess([
          'tts',
          '--provider', 'openai',
          '--text', 'Hello world',
          '--format', format
        ], {
          cwd: tempDir
        });

        expect(result.code).toBe(0);
        expect(result.stdout).toContain(`Format: ${format}`);
      }
    });

    test('should handle audio conversion', async () => {
      const result = await spawnVoiceProcess([
        'convert',
        '--input', 'test.mp3',
        '--output', 'test.wav',
        '--format', 'wav'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Audio converted successfully');
    });

    test('should validate audio quality', async () => {
      const result = await spawnVoiceProcess([
        'validate-audio',
        '--file', 'test.mp3'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Audio quality validated');
      expect(result.stdout).toContain('Sample rate:');
      expect(result.stdout).toContain('Bitrate:');
    });
  });

  describe('Streaming and Real-time Processing', () => {
    test('should handle streaming TTS', async () => {
      const result = await spawnVoiceProcess([
        'stream-tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--chunk-size', '100'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Stream started');
      expect(result.stdout).toContain('Chunk processed');
    });

    test('should handle real-time audio streaming', async () => {
      const result = await spawnVoiceProcess([
        'realtime-audio',
        '--provider', 'openai',
        '--input-device', 'default',
        '--output-device', 'default'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Real-time audio started');
    });

    test('should handle audio buffer management', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--buffer-size', '1024'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Buffer configured: 1024');
    });
  });

  describe('Performance and Optimization', () => {
    test('should optimize audio bitrate', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--bitrate', '128'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Bitrate optimized: 128');
    });

    test('should optimize audio quality', async () => {
      const result = await spawnVoiceProcess([
        'tts',
        '--provider', 'openai',
        '--text', 'Hello world',
        '--quality', 'high'
      ], {
        cwd: tempDir
      });

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Quality optimized: high');
    });

    test('should handle concurrent audio generation', async () => {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(spawnVoiceProcess([
          'tts',
          '--provider', 'openai',
          '--text', `Hello world ${i}`
        ], {
          cwd: tempDir
        }));
      }
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.code).toBe(0);
      });
    });
  });

  // Helper functions
  async function spawnVoiceProcess(args: string[], options: any = {}) {
    return new Promise<{ stdout: string; stderr: string; code: number }>((resolve) => {
      const child = spawn('node', ['packages/voice/dist/index.js', ...args], {
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