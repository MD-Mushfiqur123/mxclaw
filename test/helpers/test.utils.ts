import { describe, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Global test setup and teardown
 */
export function setupTestEnvironment() {
  // Store original environment variables
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.TESTING = 'true';
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });
}

/**
 * Create test suite with common patterns
 */
export function createTestSuite(name: string, tests: () => void) {
  describe(name, () => {
    setupTestEnvironment();
    tests();
  });
}

/**
 * Async test helper with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Test timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Error testing helper
 */
export async function expectToThrow(
  fn: () => Promise<any> | any,
  expectedError?: RegExp | string | Function
) {
  try {
    await fn();
    // If we get here, no error was thrown
    throw new Error('Expected function to throw, but it didn\'t');
  } catch (error) {
    if (expectedError) {
      if (expectedError instanceof RegExp) {
        expect(error.message).toMatch(expectedError);
      } else if (typeof expectedError === 'string') {
        expect(error.message).toContain(expectedError);
      } else if (typeof expectedError === 'function') {
        expect(error).toBeInstanceOf(expectedError);
      }
    }
    return error;
  }
}