import pino from 'pino';
import { eq } from 'drizzle-orm';
import {
  createDb,
  type Database,
  tenants,
  platformConnections,
  aiPersonalities,
  modRules,
  cronJobs,
} from '@nexusbot/db';
import { TIERS, type TierKey } from '@nexusbot/shared';
import { type TenantContext, computeLimitsFromTier } from './context';

const logger = pino({ name: 'config-loader' });

export class ConfigLoader {
  private db: Database;

  constructor(connectionString: string) {
    this.db = createDb(connectionString);
  }

  async loadContext(tenantId: string): Promise<TenantContext> {
    logger.info({ tenantId }, 'Loading tenant context');

    // Load tenant record
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    if (tenant.status === 'suspended' || tenant.status === 'cancelled') {
      throw new Error(`Tenant ${tenantId} is ${tenant.status}`);
    }

    const tier = tenant.tier as TierKey;

    // Load platform connections
    const connections = await this.db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.tenantId, tenantId));

    // Load active AI personality
    const [personality] = await this.db
      .select()
      .from(aiPersonalities)
      .where(eq(aiPersonalities.tenantId, tenantId))
      .limit(1);

    // Load moderation rules ordered by sort_order
    const rules = await this.db
      .select()
      .from(modRules)
      .where(eq(modRules.tenantId, tenantId))
      .orderBy(modRules.sortOrder);

    // Load enabled cron jobs
    const jobs = await this.db
      .select()
      .from(cronJobs)
      .where(eq(cronJobs.tenantId, tenantId));

    const enabledJobs = jobs.filter((j) => j.enabled);

    // Build connections map
    const connectionsMap: TenantContext['connections'] = {};
    const platformList: ('twitch' | 'discord')[] = [];

    for (const conn of connections) {
      if (!conn.isActive) continue;

      const platform = conn.platform as 'twitch' | 'discord';
      platformList.push(platform);

      if (platform === 'twitch') {
        connectionsMap.twitch = {
          channelId: conn.platformUserId,
          accessToken: conn.accessTokenEncrypted, // Encrypted; decryption handled elsewhere
          refreshToken: conn.refreshTokenEncrypted ?? '',
        };
      } else if (platform === 'discord') {
        connectionsMap.discord = {
          guildId: conn.platformUserId,
          botToken: conn.accessTokenEncrypted, // Encrypted; decryption handled elsewhere
        };
      }
    }

    const context: TenantContext = {
      tenantId,
      tier,
      platforms: platformList,
      connections: connectionsMap,
      personality: (personality?.config as Record<string, unknown>) ?? {},
      moderationRules: rules.map((r) => ({
        id: r.id,
        ruleType: r.ruleType,
        pattern: r.pattern,
        severity: r.severity,
        action: r.action,
        platforms: r.platforms,
        enabled: r.enabled,
        sortOrder: r.sortOrder,
      })),
      cronJobs: enabledJobs.map((j) => ({
        id: j.id,
        name: j.name,
        cronExpression: j.cronExpression,
        timezone: j.timezone,
        platform: j.platform,
        actionType: j.actionType,
        actionParams: j.actionParams as Record<string, unknown>,
        enabled: j.enabled,
      })),
      limits: computeLimitsFromTier(tier),
    };

    logger.info(
      {
        tenantId,
        tier,
        platforms: platformList,
        ruleCount: rules.length,
        cronJobCount: enabledJobs.length,
      },
      'Tenant context loaded',
    );

    return context;
  }
}
