import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as users from './schema/users';
import * as tenants from './schema/tenants';
import * as botInstances from './schema/bot-instances';
import * as moderation from './schema/moderation';
import * as aiMemory from './schema/ai-memory';
import * as cronJobs from './schema/cron-jobs';
import * as systemConfig from './schema/system-config';

const schema = {
  ...users,
  ...tenants,
  ...botInstances,
  ...moderation,
  ...aiMemory,
  ...cronJobs,
  ...systemConfig,
};

export function createDb(connectionString: string) {
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
