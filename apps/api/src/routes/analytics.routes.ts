import type { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/analytics/overview
  app.get('/overview', async (_request, reply) => {
    // TODO: Query actual counts from mod_actions, ai_conversations, cron_job_logs
    reply.send({
      data: {
        messages24h: 0,
        modActions24h: 0,
        aiConversations24h: 0,
        cronRuns24h: 0,
      },
    });
  });

  // GET /api/v1/analytics/chat
  app.get('/chat', async (_request, reply) => {
    reply.send({
      data: {
        messagesOverTime: [],
        topChatters: [],
        platformSplit: {},
      },
    });
  });

  // GET /api/v1/analytics/moderation
  app.get('/moderation', async (_request, reply) => {
    reply.send({
      data: {
        actionsOverTime: [],
        ruleFrequency: [],
        repeatOffenders: [],
      },
    });
  });

  // GET /api/v1/analytics/ai
  app.get('/ai', async (_request, reply) => {
    reply.send({
      data: {
        conversationsPerDay: [],
        avgResponseTime: 0,
        tokenUsage: 0,
        topics: [],
      },
    });
  });
}
