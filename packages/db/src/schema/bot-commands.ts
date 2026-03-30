import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const botCommands = pgTable(
  'bot_commands',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    command: text('command').notNull(),
    response: text('response').notNull(),
    cooldownSeconds: integer('cooldown_seconds').notNull().default(5),
    platform: text('platform').notNull().default('both'),
    enabled: boolean('enabled').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('bot_commands_tenant_command_idx').on(table.tenantId, table.command),
    index('idx_bot_commands_tenant').on(table.tenantId),
  ],
);
