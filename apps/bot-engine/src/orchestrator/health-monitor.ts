import pino from 'pino';

const logger = pino({ name: 'health-monitor' });

interface ManagerLike {
  getStatus(id: string): unknown;
}

export interface HealthCheckResult {
  healthy: boolean;
  lastHeartbeat: Date | null;
}

export class HealthMonitor {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Starts periodic health checks for the given tenant IDs.
   */
  start(manager: ManagerLike, tenantIds: string[], intervalMs: number): void {
    if (this.intervalId) {
      logger.warn('Health monitor already running, stopping previous instance');
      this.stop();
    }

    logger.info(
      { tenantCount: tenantIds.length, intervalMs },
      'Starting health monitor',
    );

    this.intervalId = setInterval(async () => {
      for (const tenantId of tenantIds) {
        try {
          const result = await this.checkHealth(tenantId);
          if (!result.healthy) {
            logger.warn({ tenantId, result }, 'Unhealthy bot detected');
          }

          // Access manager status for logging purposes
          const status = manager.getStatus(tenantId);
          logger.debug({ tenantId, status, health: result }, 'Health check complete');
        } catch (err) {
          logger.error({ tenantId, err }, 'Health check failed');
        }
      }
    }, intervalMs);
  }

  /**
   * Stops the periodic health checks.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Health monitor stopped');
    }
  }

  /**
   * Checks the health of a single tenant's bot.
   *
   * TODO: Implement actual health checking (heartbeat verification, process alive check).
   */
  async checkHealth(tenantId: string): Promise<HealthCheckResult> {
    logger.debug({ tenantId }, 'Checking bot health (skeleton)');

    // TODO: Query last heartbeat from bot instance table or Redis
    // TODO: Verify process is alive via BotSpawner.isAlive()
    // TODO: Check for error thresholds

    return {
      healthy: true,
      lastHeartbeat: null,
    };
  }
}
