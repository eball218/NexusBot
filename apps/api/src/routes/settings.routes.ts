import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { users, tenants } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';
import { validate } from '../utils/validation';

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  timezone: z.string().min(1).max(100).optional(),
});

export async function settingsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/settings/profile
  app.get('/profile', async (request, reply) => {
    const db = getDb();
    const userId = request.user!.sub;
    const tenantId = request.user!.tenantId!;

    const user = await db
      .select({
        displayName: users.displayName,
        email: users.email,
        timezone: users.timezone,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      reply.status(404).send({ error: 'User not found', code: 'NOT_FOUND' });
      return;
    }

    const tenant = await db
      .select({
        tier: tenants.tier,
        status: tenants.status,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    reply.send({
      data: {
        ...user[0],
        tenant: tenant[0] ?? null,
      },
    });
  });

  // PUT /api/v1/settings/profile
  app.put('/profile', async (request, reply) => {
    const db = getDb();
    const userId = request.user!.sub;
    const body = validate(updateProfileSchema, request.body);

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.displayName !== undefined) updates.displayName = body.displayName;
    if (body.timezone !== undefined) updates.timezone = body.timezone;

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning({
        displayName: users.displayName,
        email: users.email,
        timezone: users.timezone,
        avatarUrl: users.avatarUrl,
      });

    reply.send({ data: updated });
  });
}
