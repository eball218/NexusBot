import type { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { botInstances, aiPersonalities } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';
import { validate } from '../utils/validation';

const configSchema = z.object({
  config: z.record(z.unknown()),
});

export async function botRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/bot/status
  app.get('/status', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const instances = await db
      .select()
      .from(botInstances)
      .where(eq(botInstances.tenantId, tenantId))
      .limit(1);

    reply.send({ data: instances[0] ?? { status: 'not_configured' } });
  });

  // POST /api/v1/bot/start
  app.post('/start', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    await db
      .update(botInstances)
      .set({ status: 'starting', updatedAt: new Date() })
      .where(eq(botInstances.tenantId, tenantId));

    reply.send({ data: { message: 'Bot starting' } });
  });

  // POST /api/v1/bot/stop
  app.post('/stop', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    await db
      .update(botInstances)
      .set({ status: 'stopped', stoppedAt: new Date(), updatedAt: new Date() })
      .where(eq(botInstances.tenantId, tenantId));

    reply.send({ data: { message: 'Bot stopped' } });
  });

  // POST /api/v1/bot/restart
  app.post('/restart', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    await db
      .update(botInstances)
      .set({
        status: 'starting',
        restartCount: sql`${botInstances.restartCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(botInstances.tenantId, tenantId));

    reply.send({ data: { message: 'Bot restarting' } });
  });

  // GET /api/v1/bot/config
  app.get('/config', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const configs = await db
      .select()
      .from(aiPersonalities)
      .where(eq(aiPersonalities.tenantId, tenantId));

    reply.send({ data: configs });
  });

  // PUT /api/v1/bot/config
  app.put('/config', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { config } = validate(configSchema, request.body);

    await db
      .update(aiPersonalities)
      .set({ config, updatedAt: new Date() })
      .where(eq(aiPersonalities.tenantId, tenantId));

    reply.send({ data: { message: 'Config updated' } });
  });
}
