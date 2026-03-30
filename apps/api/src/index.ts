import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { AppError } from './utils/errors';
import { authRoutes } from './routes/auth.routes';
import { oauthRoutes } from './routes/oauth.routes';
import { billingRoutes } from './routes/billing.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { adminRoutes } from './routes/admin.routes';
import { botRoutes } from './routes/bot.routes';
import { connectionsRoutes } from './routes/connections.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { moderationRoutes } from './routes/moderation.routes';
import { personalityRoutes } from './routes/personality.routes';
import { commandsRoutes } from './routes/commands.routes';
import { schedulerRoutes } from './routes/scheduler.routes';
import { settingsRoutes } from './routes/settings.routes';

async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      ...(config.env === 'development' && {
        transport: { target: 'pino-pretty', options: { colorize: true } },
      }),
    },
    trustProxy: true,
  });

  // --- Plugins ---
  await app.register(cors, {
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // Let frontends handle CSP
  });

  await app.register(rateLimit, {
    max: config.rateLimit.user.max,
    timeWindow: config.rateLimit.user.timeWindow,
  });

  // --- Error handler ---
  app.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown }, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        error: error.message,
        code: error.code,
        details: error.details,
      });
      return;
    }

    // Fastify validation errors
    if (error.validation) {
      reply.status(400).send({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.validation,
      });
      return;
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      reply.status(429).send({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
      });
      return;
    }

    // Unexpected errors
    app.log.error(error, 'Unhandled error');
    reply.status(500).send({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  });

  // --- Health check ---
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // --- API Routes ---
  await app.register(
    async (api) => {
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(oauthRoutes, { prefix: '/auth' });
      await api.register(billingRoutes, { prefix: '/billing' });
      await api.register(webhookRoutes, { prefix: '/webhooks' });
      await api.register(adminRoutes, { prefix: '/admin' });
      await api.register(botRoutes, { prefix: '/bot' });
      await api.register(connectionsRoutes, { prefix: '/connections' });
      await api.register(analyticsRoutes, { prefix: '/analytics' });
      await api.register(moderationRoutes, { prefix: '/moderation' });
      await api.register(personalityRoutes, { prefix: '/personality' });
      await api.register(commandsRoutes, { prefix: '/commands' });
      await api.register(schedulerRoutes, { prefix: '/scheduler' });
      await api.register(settingsRoutes, { prefix: '/settings' });
    },
    { prefix: '/api/v1' },
  );

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    app.log.info(`API server listening on port ${config.port}`);
  } catch (err) {
    app.log.fatal(err, 'Failed to start server');
    process.exit(1);
  }
}

start();

export { buildApp };
