import type { FastifyInstance } from 'fastify';
import { eq, and, gt, count, sql, desc } from 'drizzle-orm';
import { modActions, aiConversations, aiMessages, cronJobLogs, cronJobs } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/analytics/overview
  app.get('/overview', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [messagesResult] = await db
      .select({ count: count() })
      .from(aiMessages)
      .innerJoin(aiConversations, eq(aiMessages.conversationId, aiConversations.id))
      .where(
        and(
          eq(aiConversations.tenantId, tenantId),
          gt(aiMessages.sentAt, since),
        ),
      );

    const [modActionsResult] = await db
      .select({ count: count() })
      .from(modActions)
      .where(
        and(
          eq(modActions.tenantId, tenantId),
          gt(modActions.performedAt, since),
        ),
      );

    const [aiConversationsResult] = await db
      .select({ count: count() })
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.tenantId, tenantId),
          gt(aiConversations.startedAt, since),
        ),
      );

    const [cronRunsResult] = await db
      .select({ count: count() })
      .from(cronJobLogs)
      .where(
        and(
          eq(cronJobLogs.tenantId, tenantId),
          gt(cronJobLogs.startedAt, since),
        ),
      );

    const [activeCronResult] = await db
      .select({ count: count() })
      .from(cronJobs)
      .where(
        and(
          eq(cronJobs.tenantId, tenantId),
          eq(cronJobs.enabled, true),
        ),
      );

    reply.send({
      data: {
        messages24h: messagesResult.count,
        modActions24h: modActionsResult.count,
        aiConversations24h: aiConversationsResult.count,
        cronRuns24h: cronRunsResult.count,
        activeCronJobs: activeCronResult.count,
      },
    });
  });

  // GET /api/v1/analytics/recent-activity
  app.get('/recent-activity', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    // Fetch recent mod actions
    const recentMod = await db
      .select({
        id: modActions.id,
        actionType: modActions.actionType,
        reason: modActions.reason,
        platform: modActions.platform,
        performedAt: modActions.performedAt,
      })
      .from(modActions)
      .where(eq(modActions.tenantId, tenantId))
      .orderBy(desc(modActions.performedAt))
      .limit(10);

    // Fetch recent cron job runs
    const recentCron = await db
      .select({
        id: cronJobLogs.id,
        status: cronJobLogs.status,
        startedAt: cronJobLogs.startedAt,
        jobName: cronJobs.name,
      })
      .from(cronJobLogs)
      .innerJoin(cronJobs, eq(cronJobLogs.jobId, cronJobs.id))
      .where(eq(cronJobLogs.tenantId, tenantId))
      .orderBy(desc(cronJobLogs.startedAt))
      .limit(10);

    // Fetch recent AI conversations
    const recentAi = await db
      .select({
        id: aiConversations.id,
        platform: aiConversations.platform,
        channel: aiConversations.channel,
        startedAt: aiConversations.startedAt,
        messageCount: aiConversations.messageCount,
      })
      .from(aiConversations)
      .where(eq(aiConversations.tenantId, tenantId))
      .orderBy(desc(aiConversations.startedAt))
      .limit(10);

    // Merge and sort by time
    const items = [
      ...recentMod.map((m) => ({
        id: m.id,
        type: 'mod' as const,
        event: `${m.actionType}${m.reason ? `: ${m.reason}` : ''} (${m.platform})`,
        timestamp: m.performedAt.toISOString(),
      })),
      ...recentCron.map((c) => ({
        id: c.id,
        type: 'cron' as const,
        event: `Cron "${c.jobName}" ${c.status}`,
        timestamp: c.startedAt.toISOString(),
      })),
      ...recentAi.map((a) => ({
        id: a.id,
        type: 'ai' as const,
        event: `AI conversation in ${a.channel} (${a.platform}, ${a.messageCount} messages)`,
        timestamp: a.startedAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);

    reply.send({ data: items });
  });

  // GET /api/v1/analytics/chat
  app.get('/chat', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Messages over time (last 7 days, grouped by day)
    const messagesOverTime = await db
      .select({
        date: sql<string>`date_trunc('day', ${aiMessages.sentAt})::date`.as('date'),
        count: count(),
      })
      .from(aiMessages)
      .innerJoin(aiConversations, eq(aiMessages.conversationId, aiConversations.id))
      .where(
        and(
          eq(aiConversations.tenantId, tenantId),
          gt(aiMessages.sentAt, since),
        ),
      )
      .groupBy(sql`date_trunc('day', ${aiMessages.sentAt})::date`)
      .orderBy(sql`date_trunc('day', ${aiMessages.sentAt})::date`);

    // Platform split for conversations in the last 7 days
    const platformSplitRows = await db
      .select({
        platform: aiConversations.platform,
        count: count(),
      })
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.tenantId, tenantId),
          gt(aiConversations.startedAt, since),
        ),
      )
      .groupBy(aiConversations.platform);

    const platformSplit: Record<string, number> = {};
    for (const row of platformSplitRows) {
      platformSplit[row.platform] = row.count;
    }

    reply.send({
      data: {
        messagesOverTime,
        topChatters: [],
        platformSplit,
      },
    });
  });

  // GET /api/v1/analytics/moderation
  app.get('/moderation', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Actions over time (last 7 days, grouped by day)
    const actionsOverTime = await db
      .select({
        date: sql<string>`date_trunc('day', ${modActions.performedAt})::date`.as('date'),
        count: count(),
      })
      .from(modActions)
      .where(
        and(
          eq(modActions.tenantId, tenantId),
          gt(modActions.performedAt, since),
        ),
      )
      .groupBy(sql`date_trunc('day', ${modActions.performedAt})::date`)
      .orderBy(sql`date_trunc('day', ${modActions.performedAt})::date`);

    // Action type frequency
    const ruleFrequency = await db
      .select({
        actionType: modActions.actionType,
        count: count(),
      })
      .from(modActions)
      .where(
        and(
          eq(modActions.tenantId, tenantId),
          gt(modActions.performedAt, since),
        ),
      )
      .groupBy(modActions.actionType)
      .orderBy(desc(count()));

    // Repeat offenders (community users with multiple actions)
    const repeatOffenders = await db
      .select({
        communityUserId: modActions.communityUserId,
        count: count(),
      })
      .from(modActions)
      .where(
        and(
          eq(modActions.tenantId, tenantId),
          gt(modActions.performedAt, since),
        ),
      )
      .groupBy(modActions.communityUserId)
      .having(sql`count(*) > 1`)
      .orderBy(desc(count()))
      .limit(10);

    reply.send({
      data: {
        actionsOverTime,
        ruleFrequency,
        repeatOffenders,
      },
    });
  });

  // GET /api/v1/analytics/ai
  app.get('/ai', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Conversations per day (last 7 days)
    const conversationsPerDay = await db
      .select({
        date: sql<string>`date_trunc('day', ${aiConversations.startedAt})::date`.as('date'),
        count: count(),
      })
      .from(aiConversations)
      .where(
        and(
          eq(aiConversations.tenantId, tenantId),
          gt(aiConversations.startedAt, since),
        ),
      )
      .groupBy(sql`date_trunc('day', ${aiConversations.startedAt})::date`)
      .orderBy(sql`date_trunc('day', ${aiConversations.startedAt})::date`);

    // Total token usage in the last 7 days
    const [tokenResult] = await db
      .select({
        total: sql<number>`coalesce(sum(${aiMessages.tokenCount}), 0)`.as('total'),
      })
      .from(aiMessages)
      .innerJoin(aiConversations, eq(aiMessages.conversationId, aiConversations.id))
      .where(
        and(
          eq(aiConversations.tenantId, tenantId),
          gt(aiMessages.sentAt, since),
        ),
      );

    reply.send({
      data: {
        conversationsPerDay,
        avgResponseTime: 0,
        tokenUsage: tokenResult.total,
        topics: [],
      },
    });
  });
}
