import { CronJob } from 'cron';
import pino from 'pino';
import { JobRunner } from './job-runner';

const logger = pino({ name: 'cron-manager' });

interface JobConfig {
  name: string;
  actionType: string;
  actionParams: Record<string, unknown>;
}

interface StoredJob {
  cronJob: CronJob;
  config: JobConfig;
}

export interface ScheduledJobDefinition {
  id: string;
  name: string;
  cronExpression: string;
  timezone: string;
  actionType: string;
  actionParams: Record<string, unknown>;
  enabled: boolean;
}

export class CronManager {
  private readonly tenantId: string;
  private jobs: Map<string, StoredJob> = new Map();
  private readonly jobRunner: JobRunner;

  constructor(config: { tenantId: string }) {
    this.tenantId = config.tenantId;
    this.jobRunner = new JobRunner();
  }

  loadJobs(jobs: ScheduledJobDefinition[]): void {
    for (const job of jobs) {
      if (!job.enabled) {
        logger.debug({ jobId: job.id, name: job.name }, 'Skipping disabled job');
        continue;
      }

      this.addJob({
        id: job.id,
        name: job.name,
        cronExpression: job.cronExpression,
        timezone: job.timezone,
        actionType: job.actionType,
        actionParams: job.actionParams,
      });
    }

    logger.info(
      { tenantId: this.tenantId, loadedCount: this.jobs.size },
      'Loaded cron jobs'
    );
  }

  start(): void {
    for (const [jobId, stored] of this.jobs.entries()) {
      stored.cronJob.start();
      logger.info({ jobId, name: stored.config.name }, 'Started cron job');
    }
  }

  stop(): void {
    for (const [jobId, stored] of this.jobs.entries()) {
      stored.cronJob.stop();
      logger.info({ jobId, name: stored.config.name }, 'Stopped cron job');
    }
  }

  addJob(job: {
    id: string;
    name: string;
    cronExpression: string;
    timezone: string;
    actionType: string;
    actionParams: Record<string, unknown>;
  }): void {
    // Remove existing job with same ID if present
    this.removeJob(job.id);

    const cronJob = new CronJob(
      job.cronExpression,
      async () => {
        logger.info({ jobId: job.id, name: job.name }, 'Executing scheduled job');

        const result = await this.jobRunner.run({
          tenantId: this.tenantId,
          jobId: job.id,
          jobName: job.name,
          actionType: job.actionType,
          actionParams: job.actionParams,
        });

        if (result.success) {
          logger.info({ jobId: job.id, result: result.result }, 'Job completed successfully');
        } else {
          logger.error({ jobId: job.id, error: result.error }, 'Job failed');
        }
      },
      null,
      false,
      job.timezone
    );

    this.jobs.set(job.id, {
      cronJob,
      config: {
        name: job.name,
        actionType: job.actionType,
        actionParams: job.actionParams,
      },
    });

    logger.info({ jobId: job.id, name: job.name, cron: job.cronExpression }, 'Added cron job');
  }

  removeJob(jobId: string): void {
    const existing = this.jobs.get(jobId);
    if (existing) {
      existing.cronJob.stop();
      this.jobs.delete(jobId);
      logger.info({ jobId }, 'Removed cron job');
    }
  }
}
