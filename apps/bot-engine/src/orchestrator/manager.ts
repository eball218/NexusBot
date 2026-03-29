import pino from 'pino';
import { ConfigLoader } from '../tenant/config-loader';
import type { TenantContext } from '../tenant/context';

const logger = pino({ name: 'bot-manager' });

export interface BotWorker {
  status: string;
  startedAt: Date | null;
}

interface TenantBots {
  discord?: BotWorker;
  twitch?: BotWorker;
}

export class BotManager {
  tenantBots: Map<string, TenantBots> = new Map();
  private configLoader: ConfigLoader;
  private configs: Map<string, TenantContext> = new Map();

  constructor(connectionString: string) {
    this.configLoader = new ConfigLoader(connectionString);
  }

  async startBot(tenantId: string): Promise<void> {
    logger.info({ tenantId }, 'Starting bot');

    const context = await this.configLoader.loadContext(tenantId);
    this.configs.set(tenantId, context);

    const workers: TenantBots = {};

    for (const platform of context.platforms) {
      // TODO: Spawn actual platform worker processes via BotSpawner
      logger.info({ tenantId, platform }, 'Creating platform worker');

      workers[platform] = {
        status: 'running',
        startedAt: new Date(),
      };
    }

    this.tenantBots.set(tenantId, workers);
    logger.info({ tenantId, platforms: context.platforms }, 'Bot started');
  }

  async stopBot(tenantId: string): Promise<void> {
    logger.info({ tenantId }, 'Stopping bot');

    const workers = this.tenantBots.get(tenantId);
    if (!workers) {
      logger.warn({ tenantId }, 'No active bot to stop');
      return;
    }

    // TODO: Kill actual platform worker processes via BotSpawner
    for (const platform of ['discord', 'twitch'] as const) {
      if (workers[platform]) {
        workers[platform]!.status = 'stopped';
        workers[platform]!.startedAt = null;
      }
    }

    this.tenantBots.delete(tenantId);
    this.configs.delete(tenantId);
    logger.info({ tenantId }, 'Bot stopped');
  }

  async restartBot(tenantId: string): Promise<void> {
    logger.info({ tenantId }, 'Restarting bot');
    await this.stopBot(tenantId);
    await this.startBot(tenantId);
    logger.info({ tenantId }, 'Bot restarted');
  }

  async updateConfig(tenantId: string): Promise<void> {
    logger.info({ tenantId }, 'Updating bot config');

    const context = await this.configLoader.loadContext(tenantId);
    this.configs.set(tenantId, context);

    // TODO: Push updated config to running workers without full restart
    logger.info({ tenantId, tier: context.tier }, 'Bot config updated');
  }

  getStatus(tenantId: string): { tenantId: string; workers: TenantBots | null } {
    const workers = this.tenantBots.get(tenantId) ?? null;

    return {
      tenantId,
      workers,
    };
  }
}
