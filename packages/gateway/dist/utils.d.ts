import * as http from "node:http";
/**
 * Read the request body as a string (10MB limit).
 */
export declare function readBody(req: http.IncomingMessage): Promise<string>;
/**
 * Safely parse a JSON string; returns null on failure.
 */
export declare function tryParseJson(str: string): Record<string, unknown> | null;
export declare function redactConfig(config: unknown): unknown;
/**
 * Build standard CORS headers from config origins.
 * Fixed: returns "*" when the origin isn't in the allowlist and "*" is configured.
 */
export declare function buildCorsHeaders(corsOrigins: string[], requestOrigin: string): Record<string, string>;
/**
 * Retry a function with exponential backoff + jitter.
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelayMs?: number): Promise<T>;
/**
 * Truncate a string to a maximum length, adding an ellipsis marker.
 */
export declare function truncateOutput(output: string, maxLen?: number): string;
/**
 * Format bytes to human-readable string.
 */
export declare function formatBytes(bytes: number): string;
//# sourceMappingURL=utils.d.ts.map