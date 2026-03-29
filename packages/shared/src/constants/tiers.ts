export const TIERS = {
  free: {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    trialDays: 14,
    platforms: 1,
    aiMessagesPerHour: 5,
    aiMemoryEnabled: false,
    maxCronJobs: 3,
    maxMemories: 0,
    crossPlatformSync: false,
    aiToxicityScoring: false,
    personaPresets: 1,
    moderationLevel: 'basic' as const,
    features: {
      longTermMemory: false,
      personaPresets: false,
      crossPlatformContext: false,
      banSync: false,
      apiAccess: false,
    },
  },
  pro: {
    name: 'Pro',
    price: { monthly: 1200, annual: 12000 }, // cents
    trialDays: 0,
    platforms: 1,
    aiMessagesPerHour: -1, // unlimited
    aiMemoryEnabled: true,
    maxCronJobs: 10,
    maxMemories: 500,
    crossPlatformSync: false,
    aiToxicityScoring: false,
    personaPresets: 3,
    moderationLevel: 'full' as const,
    features: {
      longTermMemory: false,
      personaPresets: true,
      crossPlatformContext: false,
      banSync: false,
      apiAccess: true,
    },
  },
  ultimate: {
    name: 'Nexus Ultimate',
    price: { monthly: 2900, annual: 29000 }, // cents
    trialDays: 0,
    platforms: 2,
    aiMessagesPerHour: -1, // unlimited
    aiMemoryEnabled: true,
    maxCronJobs: -1, // unlimited
    maxMemories: 5000,
    crossPlatformSync: true,
    aiToxicityScoring: true,
    personaPresets: -1, // unlimited
    moderationLevel: 'full' as const,
    features: {
      longTermMemory: true,
      personaPresets: true,
      crossPlatformContext: true,
      banSync: true,
      apiAccess: true,
    },
  },
} as const;

export type TierKey = keyof typeof TIERS;
export type Tier = (typeof TIERS)[TierKey];

export const PLAN_IDS = {
  pro_monthly: { tier: 'pro' as TierKey, billing: 'monthly' as const },
  pro_annual: { tier: 'pro' as TierKey, billing: 'annual' as const },
  ultimate_monthly: { tier: 'ultimate' as TierKey, billing: 'monthly' as const },
  ultimate_annual: { tier: 'ultimate' as TierKey, billing: 'annual' as const },
} as const;

export type PlanId = keyof typeof PLAN_IDS;
