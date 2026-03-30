import type { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import {
  modRules,
  modActions,
  modAppeals,
  communityUsers,
} from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';
import { validate } from '../utils/validation';

const createRuleSchema = z.object({
  ruleType: z.string().min(1),
  pattern: z.string().nullable().optional(),
  severity: z.number().int().min(1).max(10),
  action: z.string().min(1),
  platforms: z.string().min(1),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const updateRuleSchema = createRuleSchema.partial();

const updateAppealSchema = z.object({
  status: z.enum(['approved', 'denied']),
  resolutionNote: z.string().max(2000).optional(),
});

export async function moderationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/moderation/rules
  app.get('/rules', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const rules = await db
      .select()
      .from(modRules)
      .where(eq(modRules.tenantId, tenantId))
      .orderBy(modRules.sortOrder);

    reply.send({ data: rules });
  });

  // POST /api/v1/moderation/rules
  app.post('/rules', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const body = validate(createRuleSchema, request.body);

    const [rule] = await db
      .insert(modRules)
      .values({ ...body, tenantId })
      .returning();

    reply.status(201).send({ data: rule });
  });

  // PUT /api/v1/moderation/rules/:id
  app.put('/rules/:id', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };
    const body = validate(updateRuleSchema, request.body);

    const existing = await db
      .select()
      .from(modRules)
      .where(and(eq(modRules.id, id), eq(modRules.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Rule not found', code: 'NOT_FOUND' });
      return;
    }

    const [updated] = await db
      .update(modRules)
      .set(body)
      .where(and(eq(modRules.id, id), eq(modRules.tenantId, tenantId)))
      .returning();

    reply.send({ data: updated });
  });

  // DELETE /api/v1/moderation/rules/:id
  app.delete('/rules/:id', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };

    const existing = await db
      .select()
      .from(modRules)
      .where(and(eq(modRules.id, id), eq(modRules.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Rule not found', code: 'NOT_FOUND' });
      return;
    }

    await db
      .delete(modRules)
      .where(and(eq(modRules.id, id), eq(modRules.tenantId, tenantId)));

    reply.send({ data: { message: 'Rule deleted' } });
  });

  // PATCH /api/v1/moderation/rules/:id/toggle
  app.patch('/rules/:id/toggle', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };

    const existing = await db
      .select()
      .from(modRules)
      .where(and(eq(modRules.id, id), eq(modRules.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Rule not found', code: 'NOT_FOUND' });
      return;
    }

    const [updated] = await db
      .update(modRules)
      .set({ enabled: !existing[0].enabled })
      .where(and(eq(modRules.id, id), eq(modRules.tenantId, tenantId)))
      .returning();

    reply.send({ data: updated });
  });

  // GET /api/v1/moderation/banned
  app.get('/banned', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const banned = await db
      .select()
      .from(communityUsers)
      .where(
        and(
          eq(communityUsers.tenantId, tenantId),
          eq(communityUsers.isBanned, true),
        ),
      );

    reply.send({ data: banned });
  });

  // POST /api/v1/moderation/banned/:id/unban
  app.post('/banned/:id/unban', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };

    const existing = await db
      .select()
      .from(communityUsers)
      .where(
        and(
          eq(communityUsers.id, id),
          eq(communityUsers.tenantId, tenantId),
        ),
      )
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'User not found', code: 'NOT_FOUND' });
      return;
    }

    await db
      .update(communityUsers)
      .set({ isBanned: false })
      .where(eq(communityUsers.id, id));

    await db
      .update(modActions)
      .set({ active: false })
      .where(
        and(
          eq(modActions.communityUserId, id),
          eq(modActions.tenantId, tenantId),
          eq(modActions.active, true),
        ),
      );

    reply.send({ data: { message: 'User unbanned' } });
  });

  // GET /api/v1/moderation/actions
  app.get('/actions', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const actions = await db
      .select()
      .from(modActions)
      .where(eq(modActions.tenantId, tenantId))
      .orderBy(desc(modActions.performedAt))
      .limit(50);

    reply.send({ data: actions });
  });

  // GET /api/v1/moderation/appeals
  app.get('/appeals', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const appeals = await db
      .select({
        appeal: modAppeals,
        communityUser: communityUsers,
      })
      .from(modAppeals)
      .innerJoin(communityUsers, eq(modAppeals.communityUserId, communityUsers.id))
      .where(eq(modAppeals.tenantId, tenantId))
      .orderBy(desc(modAppeals.createdAt));

    reply.send({ data: appeals });
  });

  // PUT /api/v1/moderation/appeals/:id
  app.put('/appeals/:id', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };
    const body = validate(updateAppealSchema, request.body);

    const existing = await db
      .select()
      .from(modAppeals)
      .where(and(eq(modAppeals.id, id), eq(modAppeals.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Appeal not found', code: 'NOT_FOUND' });
      return;
    }

    const [updated] = await db
      .update(modAppeals)
      .set({
        status: body.status,
        resolvedBy: request.user!.sub,
        resolvedAt: new Date(),
        resolutionNote: body.resolutionNote ?? null,
      })
      .where(and(eq(modAppeals.id, id), eq(modAppeals.tenantId, tenantId)))
      .returning();

    // If approved, unban the community user and deactivate related mod actions
    if (body.status === 'approved') {
      const appeal = existing[0];

      await db
        .update(communityUsers)
        .set({ isBanned: false })
        .where(eq(communityUsers.id, appeal.communityUserId));

      await db
        .update(modActions)
        .set({ active: false })
        .where(eq(modActions.id, appeal.modActionId));
    }

    reply.send({ data: updated });
  });
}
