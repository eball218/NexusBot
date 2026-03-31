import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { platformConnections } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';

export async function connectionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/connections
  app.get('/', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    const connections = await db
      .select({
        id: platformConnections.id,
        platform: platformConnections.platform,
        platformUserId: platformConnections.platformUserId,
        platformUsername: platformConnections.platformUsername,
        isActive: platformConnections.isActive,
        connectedAt: platformConnections.connectedAt,
      })
      .from(platformConnections)
      .where(eq(platformConnections.tenantId, tenantId));

    reply.send({ data: connections });
  });

  // GET /api/v1/connections/twitch/channels
  app.get('/twitch/channels', async (_request, reply) => {
    // TODO: Call Twitch API to list joined channels
    reply.send({ data: { channels: [] } });
  });

  // GET /api/v1/connections/discord/servers
  app.get('/discord/servers', async (_request, reply) => {
    // TODO: Call Discord API to list joined servers
    reply.send({ data: { servers: [] } });
  });

  // DELETE /api/v1/connections/twitch
  app.delete('/twitch', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    await db
      .delete(platformConnections)
      .where(
        and(
          eq(platformConnections.tenantId, tenantId),
          eq(platformConnections.platform, 'twitch'),
        ),
      );

    reply.send({ data: { message: 'Twitch disconnected' } });
  });

  // DELETE /api/v1/connections/discord
  app.delete('/discord', async (request, reply) => {
    const db = getDb();
    const tenantId = request.user!.tenantId!;

    await db
      .delete(platformConnections)
      .where(
        and(
          eq(platformConnections.tenantId, tenantId),
          eq(platformConnections.platform, 'discord'),
        ),
      );

    reply.send({ data: { message: 'Discord disconnected' } });
  });
}
