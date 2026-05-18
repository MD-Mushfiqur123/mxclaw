export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}
export declare class RateLimiter {
    private store;
    private config;
    private cleanupInterval;
    constructor(config?: Partial<RateLimitConfig>);
    check(key: string): {
        allowed: boolean;
        remaining: number;
        resetAt: number;
    };
    isRateLimited(key: string): boolean;
    getRemaining(key: string): number;
    reset(key: string): void;
    private cleanup;
    shutdown(): void;
}
export declare class ChannelRateLimiter {
    private limiters;
    get(channelId: string, config?: Partial<RateLimitConfig>): RateLimiter;
    shutdown(): void;
}
export declare class IPRateLimiter {
    private limiter;
    check(ip: string): {
        allowed: boolean;
        remaining: number;
    };
    shutdown(): void;
}
//# sourceMappingURL=rate-limiter.d.ts.map