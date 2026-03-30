import type { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { cronJobs, cronJobLogs } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';
import { validate } from '../utils/validation';

const createJobSchema = z.object({
  name: z.string().min(1).max(200),
  cronExpression: z.string().min(1),
  timezone: z.string().min(1).default('UTC'),
  platform: z.enum(['discord', 'twitch', 'both']),
  actionType: z.string().min(1),
  actionParams: z.record(z.unknown()),
  enabled: z.boolean().default(true),
  retryOnFailure: z.boolean().default(true),
  maxRetries: z.number().int().min(0).max(10).default(3),
  maxRuns: z.number().int().min(1).nullable().optional(),
});

const updateJobSchema = createJobSchema.partial();

export async function schedulerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/scheduler/jobs
  app.get('/jobs', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const jobs = await db
      .select()
      .from(cronJobs)
      .where(eq(cronJobs.tenantId, tenantId));

    reply.send({ data: jobs });
  });

  // POST /api/v1/scheduler/jobs
  app.post('/jobs', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const body = validate(createJobSchema, request.body);

    const [job] = await db
      .insert(cronJobs)
      .values({
        ...body,
        tenantId,
        createdBy: request.user!.sub,
      })
      .returning();

    reply.status(201).send({ data: job });
  });

  // PUT /api/v1/scheduler/jobs/:id
  app.put('/jobs/:id', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };
    const body = validate(updateJobSchema, request.body);

    const existing = await db
      .select()
      .from(cronJobs)
      .where(and(eq(cronJobs.id, id), eq(cronJobs.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Job not found', code: 'NOT_FOUND' });
      return;
    }

    const [updated] = await db
      .update(cronJobs)
      .set(body)
      .where(and(eq(cronJobs.id, id), eq(cronJobs.tenantId, tenantId)))
      .returning();

    reply.send({ data: updated });
  });

  // DELETE /api/v1/scheduler/jobs/:id
  app.delete('/jobs/:id', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };

    const existing = await db
      .select()
      .from(cronJobs)
      .where(and(eq(cronJobs.id, id), eq(cronJobs.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Job not found', code: 'NOT_FOUND' });
      return;
    }

    // Delete logs first (cascade should handle this, but be explicit)
    await db
      .delete(cronJobLogs)
      .where(eq(cronJobLogs.jobId, id));

    await db
      .delete(cronJobs)
      .where(and(eq(cronJobs.id, id), eq(cronJobs.tenantId, tenantId)));

    reply.send({ data: { message: 'Job deleted' } });
  });

  // PATCH /api/v1/scheduler/jobs/:id/toggle
  app.patch('/jobs/:id/toggle', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };

    const existing = await db
      .select()
      .from(cronJobs)
      .where(and(eq(cronJobs.id, id), eq(cronJobs.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Job not found', code: 'NOT_FOUND' });
      return;
    }

    const [updated] = await db
      .update(cronJobs)
      .set({ enabled: !existing[0].enabled })
      .where(and(eq(cronJobs.id, id), eq(cronJobs.tenantId, tenantId)))
      .returning();

    reply.send({ data: updated });
  });

  // GET /api/v1/scheduler/logs
  app.get('/logs', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const logs = await db
      .select()
      .from(cronJobLogs)
      .where(eq(cronJobLogs.tenantId, tenantId))
      .orderBy(desc(cronJobLogs.startedAt))
      .limit(50);

    reply.send({ data: logs });
  });
}
