import pino from 'pino';
import { TIERS, type TierKey } from '@nexusbot/shared';
import type { UsageTracker } from '../tenant/usage-tracker';

const logger = pino({ name: 'resource-limiter' });

export class ResourceLimiter {
  /**
   * Checks whether a tenant can send an AI message based on their tier's hourly limit.
   */
  async canSendAIMessage(
    tenantId: string,
    tier: string,
    tracker: UsageTracker,
  ): Promise<boolean> {
    const tierConfig = TIERS[tier as TierKey];
    if (!tierConfig) {
      logger.error({ tenantId, tier }, 'Unknown tier');
      return false;
    }

    const limit = tierConfig.aiMessagesPerHour;

    // -1 means unlimited
    if (limit === -1) {
      return true;
    }

    const currentCount = await tracker.getAIMessageCount(tenantId);
    const allowed = currentCount < limit;

    if (!allowed) {
      logger.warn(
        { tenantId, tier, currentCount, limit },
        'AI message limit reached',
      );
    }

    return allowed;
  }

  /**
   * Checks whether a tenant can create another cron job based on their tier's max.
   */
  canCreateCronJob(currentCount: number, tier: string): boolean {
    const tierConfig = TIERS[tier as TierKey];
    if (!tierConfig) {
      logger.error({ tier }, 'Unknown tier');
      return false;
    }

    const max = tierConfig.maxCronJobs;

    // -1 means unlimited
    if (max === -1) {
      return true;
    }

    const allowed = currentCount < max;

    if (!allowed) {
      logger.warn({ tier, currentCount, max }, 'Cron job limit reached');
    }

    return allowed;
  }

  /**
   * Checks whether a tenant can store another memory based on their tier's max.
   */
  canStoreMemory(currentCount: number, tier: string): boolean {
    const tierConfig = TIERS[tier as TierKey];
    if (!tierConfig) {
      logger.error({ tier }, 'Unknown tier');
      return false;
    }

    const max = tierConfig.maxMemories as number;

    // -1 means unlimited; 0 means disabled
    if (max === -1) {
      return true;
    }

    const allowed = currentCount < max;

    if (!allowed) {
      logger.warn({ tier, currentCount, max }, 'Memory storage limit reached');
    }

    return allowed;
  }
}
