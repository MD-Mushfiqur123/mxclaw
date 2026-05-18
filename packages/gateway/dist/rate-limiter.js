export class RateLimiter {
    store = new Map();
    config;
    cleanupInterval;
    constructor(config) {
        this.config = {
            windowMs: config?.windowMs ?? 60000,
            maxRequests: config?.maxRequests ?? 60,
        };
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
    check(key) {
        const now = Date.now();
        let entry = this.store.get(key);
        if (!entry || now > entry.resetAt) {
            entry = { count: 0, resetAt: now + this.config.windowMs };
            this.store.set(key, entry);
        }
        entry.count++;
        const remaining = Math.max(0, this.config.maxRequests - entry.count);
        const allowed = entry.count <= this.config.maxRequests;
        return { allowed, remaining, resetAt: entry.resetAt };
    }
    isRateLimited(key) {
        return !this.check(key).allowed;
    }
    getRemaining(key) {
        return this.check(key).remaining;
    }
    reset(key) {
        this.store.delete(key);
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (now > entry.resetAt) {
                this.store.delete(key);
            }
        }
    }
    shutdown() {
        clearInterval(this.cleanupInterval);
        this.store.clear();
    }
}
// Per-channel rate limiter
export class ChannelRateLimiter {
    limiters = new Map();
    get(channelId, config) {
        let limiter = this.limiters.get(channelId);
        if (!limiter) {
            limiter = new RateLimiter(config);
            this.limiters.set(channelId, limiter);
        }
        return limiter;
    }
    shutdown() {
        for (const limiter of this.limiters.values()) {
            limiter.shutdown();
        }
        this.limiters.clear();
    }
}
// Per-IP rate limiter
export class IPRateLimiter {
    limiter = new RateLimiter({ windowMs: 60000, maxRequests: 100 });
    check(ip) {
        const result = this.limiter.check(ip);
        return { allowed: result.allowed, remaining: result.remaining };
    }
    shutdown() {
        this.limiter.shutdown();
    }
}
//# sourceMappingURL=rate-limiter.js.map