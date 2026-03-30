import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { botCommands } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';
import { validate } from '../utils/validation';

const createCommandSchema = z.object({
  command: z.string().min(1).startsWith('!', 'Command must start with !'),
  response: z.string().min(1),
  cooldownSeconds: z.number().int().min(0).default(5),
  platform: z.string().min(1).default('both'),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const updateCommandSchema = createCommandSchema.partial();

export async function commandsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/commands
  app.get('/', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const commands = await db
      .select()
      .from(botCommands)
      .where(eq(botCommands.tenantId, tenantId))
      .orderBy(botCommands.sortOrder);

    reply.send({ data: commands });
  });

  // POST /api/v1/commands
  app.post('/', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const body = validate(createCommandSchema, request.body);

    const [command] = await db
      .insert(botCommands)
      .values({ ...body, tenantId })
      .returning();

    reply.status(201).send({ data: command });
  });

  // PUT /api/v1/commands/:id
  app.put('/:id', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };
    const body = validate(updateCommandSchema, request.body);

    const existing = await db
      .select()
      .from(botCommands)
      .where(and(eq(botCommands.id, id), eq(botCommands.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Command not found', code: 'NOT_FOUND' });
      return;
    }

    const [updated] = await db
      .update(botCommands)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(botCommands.id, id), eq(botCommands.tenantId, tenantId)))
      .returning();

    reply.send({ data: updated });
  });

  // DELETE /api/v1/commands/:id
  app.delete('/:id', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };

    const existing = await db
      .select()
      .from(botCommands)
      .where(and(eq(botCommands.id, id), eq(botCommands.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Command not found', code: 'NOT_FOUND' });
      return;
    }

    await db
      .delete(botCommands)
      .where(and(eq(botCommands.id, id), eq(botCommands.tenantId, tenantId)));

    reply.send({ data: { message: 'Command deleted' } });
  });

  // PATCH /api/v1/commands/:id/toggle
  app.patch('/:id/toggle', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;
    const { id } = request.params as { id: string };

    const existing = await db
      .select()
      .from(botCommands)
      .where(and(eq(botCommands.id, id), eq(botCommands.tenantId, tenantId)))
      .limit(1);

    if (!existing.length) {
      reply.status(404).send({ error: 'Command not found', code: 'NOT_FOUND' });
      return;
    }

    const [updated] = await db
      .update(botCommands)
      .set({ enabled: !existing[0].enabled, updatedAt: new Date() })
      .where(and(eq(botCommands.id, id), eq(botCommands.tenantId, tenantId)))
      .returning();

    reply.send({ data: updated });
  });
}
