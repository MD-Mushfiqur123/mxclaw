import * as http from "node:http";

/**
 * Read the request body as a string (10MB limit).
 */
export function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

/**
 * Safely parse a JSON string; returns null on failure.
 */
export function tryParseJson(str: string): Record<string, unknown> | null {
  try {
    return JSON.parse(str) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Recursively redact sensitive fields from a config object.
 */
const SENSITIVE_KEYS = new Set([
  "token", "apiKey", "api_key", "secret", "password",
  "webhookSecret", "signingSecret", "botPassword", "apiToken",
]);

export function redactConfig(config: unknown): unknown {
  if (config === null || config === undefined) return config;
  if (typeof config === "string") return config;
  if (typeof config !== "object") return config;
  if (Array.isArray(config)) return config.map(redactConfig);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key) && typeof value === "string" && value.length > 0) {
      result[key] = "***REDACTED***";
    } else if (typeof value === "object" && value !== null) {
      result[key] = redactConfig(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Build standard CORS headers from config origins.
 * Fixed: returns "*" when the origin isn't in the allowlist and "*" is configured.
 */
export function buildCorsHeaders(
  corsOrigins: string[],
  requestOrigin: string,
): Record<string, string> {
  let allowedOrigin: string;

  if (corsOrigins.length === 0) {
    // No origins configured — allow all
    allowedOrigin = "*";
  } else if (corsOrigins.includes("*")) {
    // Wildcard configured — allow all
    allowedOrigin = "*";
  } else if (corsOrigins.includes(requestOrigin)) {
    // Request origin is explicitly allowed
    allowedOrigin = requestOrigin;
  } else {
    // Origin not allowed — return first configured origin
    // This will cause the browser to block the request (correct behavior)
    allowedOrigin = corsOrigins[0] ?? "*";
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Retry a function with exponential backoff + jitter.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Truncate a string to a maximum length, adding an ellipsis marker.
 */
export function truncateOutput(output: string, maxLen = 50_000): string {
  if (output.length <= maxLen) return output;
  const half = Math.floor(maxLen / 2);
  return output.slice(0, half) + `\n\n... [truncated ${output.length - maxLen} characters] ...\n\n` + output.slice(-half);
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}
