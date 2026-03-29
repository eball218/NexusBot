import 'dotenv/config';
import pino from 'pino';
import { BotManager } from './orchestrator/manager';
import { HealthMonitor } from './orchestrator/health-monitor';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});

const dbUrl = process.env.DATABASE_URL || '';
const manager = new BotManager(dbUrl);
const healthMonitor = new HealthMonitor();

async function main() {
  logger.info('NexusBot Engine starting...');

  const port = process.env.BOT_ENGINE_PORT || 4000;
  const healthCheckInterval = parseInt(process.env.BOT_HEALTH_CHECK_INTERVAL || '30000', 10);

  // TODO: Load active tenants from database and start their bots
  // const activeTenants = await loadActiveTenants();
  // for (const tenant of activeTenants) {
  //   await manager.startBot(tenant.id);
  // }

  // Start health monitoring
  // healthMonitor.start(manager, activeTenantIds, healthCheckInterval);

  logger.info({ port, healthCheckInterval }, 'Bot engine initialized');

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down bot engine...');
    healthMonitor.stop();
    // TODO: Stop all running bots gracefully
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.fatal(err, 'Bot engine failed to start');
  process.exit(1);
});

export { manager, healthMonitor };
