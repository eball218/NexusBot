import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const cronJobs = pgTable(
  'cron_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    cronExpression: text('cron_expression').notNull(),
    timezone: text('timezone').notNull().default('UTC'),
    platform: text('platform', { enum: ['discord', 'twitch', 'both'] }).notNull(),
    actionType: text('action_type').notNull(),
    actionParams: jsonb('action_params').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastRunAt: timestamp('last_run_at', { withTimezone: true }),
    nextRunAt: timestamp('next_run_at', { withTimezone: true }),
    runCount: integer('run_count').notNull().default(0),
    maxRuns: integer('max_runs'),
    errorCount: integer('error_count').notNull().default(0),
    lastError: text('last_error'),
    retryOnFailure: boolean('retry_on_failure').notNull().default(true),
    maxRetries: integer('max_retries').notNull().default(3),
  },
  (table) => [
    uniqueIndex('cron_jobs_tenant_name_idx').on(table.tenantId, table.name),
    index('idx_cron_jobs_tenant').on(table.tenantId),
  ],
);

export const cronJobLogs = pgTable(
  'cron_job_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id')
      .notNull()
      .references(() => cronJobs.id, { onDelete: 'cascade' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    status: text('status', {
      enum: ['running', 'success', 'failed', 'skipped'],
    }).notNull(),
    result: text('result'),
    error: text('error'),
  },
  (table) => [index('idx_cron_job_logs_job').on(table.jobId)],
);
