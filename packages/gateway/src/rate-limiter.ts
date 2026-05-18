export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      windowMs: config?.windowMs ?? 60000,
      maxRequests: config?.maxRequests ?? 60,
    };
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
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

  isRateLimited(key: string): boolean {
    return !this.check(key).allowed;
  }

  getRemaining(key: string): number {
    return this.check(key).remaining;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  shutdown(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Per-channel rate limiter
export class ChannelRateLimiter {
  private limiters = new Map<string, RateLimiter>();

  get(channelId: string, config?: Partial<RateLimitConfig>): RateLimiter {
    let limiter = this.limiters.get(channelId);
    if (!limiter) {
      limiter = new RateLimiter(config);
      this.limiters.set(channelId, limiter);
    }
    return limiter;
  }

  shutdown(): void {
    for (const limiter of this.limiters.values()) {
      limiter.shutdown();
    }
    this.limiters.clear();
  }
}

// Per-IP rate limiter
export class IPRateLimiter {
  private limiter = new RateLimiter({ windowMs: 60000, maxRequests: 100 });

  check(ip: string): { allowed: boolean; remaining: number } {
    const result = this.limiter.check(ip);
    return { allowed: result.allowed, remaining: result.remaining };
  }

  shutdown(): void {
    this.limiter.shutdown();
  }
}