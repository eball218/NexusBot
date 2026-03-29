export interface CronJob {
  id: string;
  tenantId: string;
  name: string;
  cronExpression: string;
  timezone: string;
  platform: 'discord' | 'twitch' | 'both';
  actionType: string;
  actionParams: Record<string, unknown>;
  enabled: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  runCount: number;
  errorCount: number;
  lastError: string | null;
}

export interface CronJobLog {
  id: string;
  jobId: string;
  tenantId: string;
  startedAt: Date;
  completedAt: Date | null;
  status: 'running' | 'success' | 'failed' | 'skipped';
  result: string | null;
  error: string | null;
}
