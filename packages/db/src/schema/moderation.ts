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

export const communityUsers = pgTable(
  'community_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    discordId: text('discord_id'),
    twitchId: text('twitch_id'),
    twitchUsername: text('twitch_username'),
    discordUsername: text('discord_username'),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    isBanned: boolean('is_banned').notNull().default(false),
    notes: text('notes'),
  },
  (table) => [
    uniqueIndex('community_users_tenant_discord_idx').on(table.tenantId, table.discordId),
    uniqueIndex('community_users_tenant_twitch_idx').on(table.tenantId, table.twitchId),
    index('idx_community_users_tenant').on(table.tenantId),
  ],
);

export const modRules = pgTable(
  'mod_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    ruleType: text('rule_type').notNull(),
    pattern: text('pattern'),
    severity: integer('severity').notNull().default(1),
    action: text('action').notNull().default('warn'),
    platforms: text('platforms').notNull().default('both'),
    enabled: boolean('enabled').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_mod_rules_tenant').on(table.tenantId)],
);

export const modActions = pgTable(
  'mod_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    communityUserId: uuid('community_user_id')
      .notNull()
      .references(() => communityUsers.id),
    platform: text('platform').notNull(),
    actionType: text('action_type').notNull(),
    reason: text('reason'),
    durationSeconds: integer('duration_seconds'),
    performedBy: text('performed_by').notNull(),
    performedAt: timestamp('performed_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    active: boolean('active').notNull().default(true),
    ruleId: uuid('rule_id').references(() => modRules.id),
    originalMessage: text('original_message'),
    metadata: jsonb('metadata'),
  },
  (table) => [
    index('idx_mod_actions_tenant').on(table.tenantId, table.performedAt),
    index('idx_mod_actions_user').on(table.communityUserId),
  ],
);

export const modAppeals = pgTable(
  'mod_appeals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    modActionId: uuid('mod_action_id')
      .notNull()
      .references(() => modActions.id),
    communityUserId: uuid('community_user_id')
      .notNull()
      .references(() => communityUsers.id),
    appealMessage: text('appeal_message').notNull(),
    status: text('status', { enum: ['pending', 'approved', 'denied'] })
      .notNull()
      .default('pending'),
    resolvedBy: text('resolved_by'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolutionNote: text('resolution_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_mod_appeals_tenant').on(table.tenantId, table.status)],
);
