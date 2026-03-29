interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface AIRateLimiterConfig {
  maxPerHour: number;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export class AIRateLimiter {
  private readonly maxPerHour: number;
  private counts: Map<string, RateLimitEntry> = new Map();

  constructor(config: AIRateLimiterConfig) {
    this.maxPerHour = config.maxPerHour;
  }

  canSend(tenantId: string): boolean {
    if (this.maxPerHour === -1) return true;

    const entry = this.getOrCreateEntry(tenantId);
    return entry.count < this.maxPerHour;
  }

  record(tenantId: string): void {
    if (this.maxPerHour === -1) return;

    const entry = this.getOrCreateEntry(tenantId);
    entry.count += 1;
    this.counts.set(tenantId, entry);
  }

  getRemainingQuota(tenantId: string): number {
    if (this.maxPerHour === -1) return Infinity;

    const entry = this.getOrCreateEntry(tenantId);
    return Math.max(0, this.maxPerHour - entry.count);
  }

  private getOrCreateEntry(tenantId: string): RateLimitEntry {
    const now = Date.now();
    const existing = this.counts.get(tenantId);

    if (existing && now < existing.resetAt) {
      return existing;
    }

    const entry: RateLimitEntry = {
      count: 0,
      resetAt: now + ONE_HOUR_MS,
    };
    this.counts.set(tenantId, entry);
    return entry;
  }
}
