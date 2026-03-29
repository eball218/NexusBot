import type { FastifyInstance } from 'fastify';
import { eq, desc, sql, count } from 'drizzle-orm';
import { users, tenants, subscriptions, botInstances, invoices, featureFlags, systemConfig, announcements } from '@nexusbot/db';
import { getDb } from '../db';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorize';
import { validate } from '../utils/validation';
import { signAccessToken } from '../utils/jwt';
import { z } from 'zod';

const updateTenantSchema = z.object({
  tier: z.enum(['free', 'pro', 'ultimate']).optional(),
  status: z.enum(['active', 'trial', 'past_due', 'cancelled', 'suspended']).optional(),
  notes: z.string().max(1000).optional(),
});

const updateFeatureFlagsSchema = z.object({
  flags: z.array(z.object({
    key: z.string(),
    enabled: z.boolean(),
    appliesTo: z.enum(['all', 'free', 'pro', 'ultimate']).optional(),
  })),
});

const announcementSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(['info', 'warning', 'maintenance', 'feature']).default('info'),
  expiresAt: z.string().datetime().optional(),
});

export async function adminRoutes(app: FastifyInstance) {
  const db = getDb();

  // All admin routes require auth + super_admin role
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireRole('super_admin'));

  // GET /api/v1/admin/dashboard
  app.get('/dashboard', async (_request, reply) => {
    const [tenantCount] = await db.select({ count: count() }).from(tenants);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [activeBots] = await db.select({ count: count() }).from(botInstances).where(eq(botInstances.status, 'running'));

    const activeSubscriptions = await db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, 'active'));

    reply.send({
      data: {
        totalTenants: tenantCount.count,
        totalUsers: userCount.count,
        activeBots: activeBots.count,
        activeSubscriptions: activeSubscriptions[0].count,
      },
    });
  });

  // GET /api/v1/admin/tenants
  app.get('/tenants', async (request, reply) => {
    const query = request.query as { page?: string; perPage?: string; tier?: string; status?: string };
    const page = parseInt(query.page || '1', 10);
    const perPage = parseInt(query.perPage || '20', 10);

    const tenantList = await db.query.tenants.findMany({
      limit: perPage,
      offset: (page - 1) * perPage,
      orderBy: [desc(tenants.createdAt)],
    });

    reply.send({ data: tenantList });
  });

  // GET /api/v1/admin/tenants/:id
  app.get('/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });
    if (!tenant) {
      reply.status(404).send({ error: 'Tenant not found', code: 'NOT_FOUND' });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, tenant.userId),
    });

    const sub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, id),
      orderBy: [desc(subscriptions.createdAt)],
    });

    reply.send({ data: { tenant, user, subscription: sub } });
  });

  // PUT /api/v1/admin/tenants/:id
  app.put('/tenants/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = validate(updateTenantSchema, request.body);

    await db
      .update(tenants)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(tenants.id, id));

    reply.send({ data: { message: 'Tenant updated' } });
  });

  // POST /api/v1/admin/tenants/:id/impersonate
  app.post('/tenants/:id/impersonate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, id),
    });
    if (!tenant) {
      reply.status(404).send({ error: 'Tenant not found', code: 'NOT_FOUND' });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, tenant.userId),
    });
    if (!user) {
      reply.status(404).send({ error: 'User not found', code: 'NOT_FOUND' });
      return;
    }

    // Generate a short-lived impersonation token
    const impersonationToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
    });

    reply.send({ data: { token: impersonationToken, tenantId: id } });
  });

  // GET /api/v1/admin/revenue
  app.get('/revenue', async (_request, reply) => {
    const paidInvoices = await db.query.invoices.findMany({
      where: eq(invoices.status, 'paid'),
      orderBy: [desc(invoices.createdAt)],
      limit: 100,
    });

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amountCents, 0);

    reply.send({
      data: {
        totalRevenueCents: totalRevenue,
        invoiceCount: paidInvoices.length,
        recentInvoices: paidInvoices.slice(0, 20),
      },
    });
  });

  // GET /api/v1/admin/revenue/transactions
  app.get('/revenue/transactions', async (_request, reply) => {
    const allInvoices = await db.query.invoices.findMany({
      orderBy: [desc(invoices.createdAt)],
      limit: 100,
    });
    reply.send({ data: allInvoices });
  });

  // GET /api/v1/admin/bots
  app.get('/bots', async (_request, reply) => {
    const bots = await db.query.botInstances.findMany({
      orderBy: [desc(botInstances.startedAt)],
    });
    reply.send({ data: bots });
  });

  // GET /api/v1/admin/bots/:id
  app.get('/bots/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const bot = await db.query.botInstances.findFirst({
      where: eq(botInstances.id, id),
    });
    if (!bot) {
      reply.status(404).send({ error: 'Bot not found', code: 'NOT_FOUND' });
      return;
    }
    reply.send({ data: bot });
  });

  // POST /api/v1/admin/bots/:id/restart
  app.post('/bots/:id/restart', async (request, reply) => {
    const { id } = request.params as { id: string };
    // TODO: Signal bot engine to restart this instance
    app.log.info({ botId: id }, 'Admin requested bot restart');
    reply.send({ data: { message: 'Bot restart requested' } });
  });

  // GET /api/v1/admin/users
  app.get('/users', async (request, reply) => {
    const query = request.query as { page?: string; perPage?: string };
    const page = parseInt(query.page || '1', 10);
    const perPage = parseInt(query.perPage || '20', 10);

    const userList = await db.query.users.findMany({
      limit: perPage,
      offset: (page - 1) * perPage,
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        isSuspended: true,
      },
    });

    reply.send({ data: userList });
  });

  // GET /api/v1/admin/users/:id
  app.get('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        isSuspended: true,
        emailVerified: true,
        timezone: true,
      },
    });
    if (!user) {
      reply.status(404).send({ error: 'User not found', code: 'NOT_FOUND' });
      return;
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.userId, id),
    });

    reply.send({ data: { user, tenant } });
  });

  // GET /api/v1/admin/system/health
  app.get('/system/health', async (_request, reply) => {
    // TODO: Actually ping services
    reply.send({
      data: {
        postgres: { status: 'healthy', responseTime: 12 },
        redis: { status: 'healthy', responseTime: 3 },
        botEngine: { status: 'healthy', activeBots: 0 },
        api: { status: 'healthy', uptime: process.uptime() },
      },
    });
  });

  // GET /api/v1/admin/system/feature-flags
  app.get('/system/feature-flags', async (_request, reply) => {
    const flags = await db.query.featureFlags.findMany();
    reply.send({ data: flags });
  });

  // PUT /api/v1/admin/system/feature-flags
  app.put('/system/feature-flags', async (request, reply) => {
    const { flags } = validate(updateFeatureFlagsSchema, request.body);

    for (const flag of flags) {
      await db
        .update(featureFlags)
        .set({
          enabled: flag.enabled,
          ...(flag.appliesTo && { appliesTo: flag.appliesTo }),
          updatedAt: new Date(),
        })
        .where(eq(featureFlags.key, flag.key));
    }

    reply.send({ data: { message: 'Feature flags updated' } });
  });

  // POST /api/v1/admin/announcements
  app.post('/announcements', async (request, reply) => {
    const body = validate(announcementSchema, request.body);

    const [announcement] = await db
      .insert(announcements)
      .values({
        ...body,
        createdBy: request.user!.sub,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      })
      .returning();

    reply.status(201).send({ data: announcement });
  });
}
