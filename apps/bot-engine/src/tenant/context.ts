import { TIERS, type TierKey } from '@nexusbot/shared';

export interface TenantContext {
  tenantId: string;
  tier: 'free' | 'pro' | 'ultimate';
  platforms: ('twitch' | 'discord')[];
  connections: {
    twitch?: { channelId: string; accessToken: string; refreshToken: string };
    discord?: { guildId: string; botToken: string };
  };
  personality: Record<string, unknown>;
  moderationRules: Array<{
    id: string;
    ruleType: string;
    pattern: string | null;
    severity: number;
    action: string;
    platforms: string;
    enabled: boolean;
    sortOrder: number;
  }>;
  cronJobs: Array<{
    id: string;
    name: string;
    cronExpression: string;
    timezone: string;
    platform: string;
    actionType: string;
    actionParams: Record<string, unknown>;
    enabled: boolean;
  }>;
  limits: {
    aiMessagesPerHour: number;
    maxCronJobs: number;
    maxMemories: number;
    aiMemoryEnabled: boolean;
    crossPlatformSync: boolean;
    aiToxicityScoring: boolean;
    personaPresets: number;
  };
}

export function computeLimitsFromTier(tier: TierKey): TenantContext['limits'] {
  const tierConfig = TIERS[tier];

  return {
    aiMessagesPerHour: tierConfig.aiMessagesPerHour,
    maxCronJobs: tierConfig.maxCronJobs,
    maxMemories: tierConfig.maxMemories,
    aiMemoryEnabled: tierConfig.aiMemoryEnabled,
    crossPlatformSync: tierConfig.crossPlatformSync,
    aiToxicityScoring: tierConfig.aiToxicityScoring,
    personaPresets: tierConfig.personaPresets,
  };
}
