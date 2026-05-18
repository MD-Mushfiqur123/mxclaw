import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/helpers/test.utils.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.test.ts',
        '**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@test': resolve(__dirname, '.')
    }
  }
});