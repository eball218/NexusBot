import pino from 'pino';
import type { Redis } from 'ioredis';

const logger = pino({ name: 'usage-tracker' });

const HOUR_TTL = 3600; // seconds

function getHourKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}`;
}

export class UsageTracker {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  /**
   * Tracks an AI message for a tenant. Returns false if the limit has been exceeded.
   * A limit of -1 means unlimited.
   */
  async trackAIMessage(tenantId: string, limit: number): Promise<boolean> {
    const hourKey = getHourKey();
    const redisKey = `usage:ai:${tenantId}:${hourKey}`;

    // If unlimited, just increment and return true
    if (limit === -1) {
      await this.redis.incr(redisKey);
      await this.redis.expire(redisKey, HOUR_TTL);
      return true;
    }

    const current = await this.redis.incr(redisKey);
    await this.redis.expire(redisKey, HOUR_TTL);

    if (current > limit) {
      logger.warn({ tenantId, current, limit }, 'AI message limit exceeded');
      return false;
    }

    return true;
  }

  /**
   * Gets the current AI message count for the current hour.
   */
  async getAIMessageCount(tenantId: string): Promise<number> {
    const hourKey = getHourKey();
    const redisKey = `usage:ai:${tenantId}:${hourKey}`;

    const count = await this.redis.get(redisKey);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Tracks a moderation action for a tenant.
   */
  async trackModAction(tenantId: string): Promise<void> {
    const hourKey = getHourKey();
    const redisKey = `usage:mod:${tenantId}:${hourKey}`;

    await this.redis.incr(redisKey);
    await this.redis.expire(redisKey, HOUR_TTL);

    logger.debug({ tenantId }, 'Moderation action tracked');
  }
}
