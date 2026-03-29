import type { TierKey } from '../constants/tiers.js';

export interface Tenant {
  id: string;
  userId: string;
  displayName: string;
  tier: TierKey;
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'suspended';
  trialStartedAt: Date | null;
  trialExpiresAt: Date | null;
  selectedPlatform: 'twitch' | 'discord' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantContext {
  tenantId: string;
  tier: TierKey;
  platforms: ('twitch' | 'discord')[];
  connections: {
    twitch?: { channelId: string; accessToken: string; refreshToken: string };
    discord?: { guildId: string; botToken: string };
  };
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
