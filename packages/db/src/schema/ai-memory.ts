import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  real,
  index,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { communityUsers } from './moderation';

export const aiConversations = pgTable(
  'ai_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    communityUserId: uuid('community_user_id').references(() => communityUsers.id),
    platform: text('platform').notNull(),
    channel: text('channel').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    messageCount: integer('message_count').notNull().default(0),
    isImportant: boolean('is_important').notNull().default(false),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => [index('idx_ai_conversations_tenant').on(table.tenantId)],
);

export const aiMessages = pgTable(
  'ai_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => aiConversations.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    content: text('content').notNull(),
    platform: text('platform').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
    tokenCount: integer('token_count'),
  },
  (table) => [index('idx_ai_messages_conversation').on(table.conversationId)],
);

export const aiMemories = pgTable(
  'ai_memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    communityUserId: uuid('community_user_id').references(() => communityUsers.id),
    memoryType: text('memory_type', {
      enum: ['user_fact', 'community', 'relationship', 'preference'],
    }).notNull(),
    content: text('content').notNull(),
    sourceConversationId: uuid('source_conversation_id').references(() => aiConversations.id),
    confidence: real('confidence').notNull().default(1.0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    accessCount: integer('access_count').notNull().default(0),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_ai_memories_tenant').on(table.tenantId),
    index('idx_ai_memories_user').on(table.communityUserId),
  ],
);
