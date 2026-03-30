import type { FastifyInstance } from 'fastify';
import { eq, and, or, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { aiPersonalities, personalityPresets } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';
import { validate } from '../utils/validation';

const upsertPersonalitySchema = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.unknown()),
});

export async function personalityRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/personality
  app.get('/', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const personalities = await db
      .select()
      .from(aiPersonalities)
      .where(
        and(
          eq(aiPersonalities.tenantId, tenantId),
          eq(aiPersonalities.isActive, true),
        ),
      )
      .limit(1);

    reply.send({ data: personalities[0] ?? null });
  });

  // PUT /api/v1/personality
  app.put('/', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const body = validate(upsertPersonalitySchema, request.body);

    const existing = await db
      .select()
      .from(aiPersonalities)
      .where(eq(aiPersonalities.tenantId, tenantId))
      .limit(1);

    if (existing.length) {
      const [updated] = await db
        .update(aiPersonalities)
        .set({
          name: body.name,
          config: body.config,
          updatedAt: new Date(),
        })
        .where(eq(aiPersonalities.id, existing[0].id))
        .returning();

      reply.send({ data: updated });
    } else {
      const [created] = await db
        .insert(aiPersonalities)
        .values({
          tenantId,
          name: body.name,
          config: body.config,
          isActive: true,
        })
        .returning();

      reply.status(201).send({ data: created });
    }
  });

  // GET /api/v1/personality/presets
  app.get('/presets', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const presets = await db
      .select()
      .from(personalityPresets)
      .where(
        or(
          eq(personalityPresets.isSystem, true),
          eq(personalityPresets.tenantId, tenantId),
        ),
      );

    reply.send({ data: presets });
  });
}
