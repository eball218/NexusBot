import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { BillingService } from '../services/billing.service';
import { authenticate } from '../middleware/auth';
import { requireTenant } from '../middleware/authorize';
import { validate } from '../utils/validation';
import type { PlanId } from '@nexusbot/shared';

const subscribeSchema = z.object({
  planId: z.enum(['pro_monthly', 'pro_annual', 'ultimate_monthly', 'ultimate_annual']),
  provider: z.enum(['stripe', 'paypal']),
});

const upgradeSchema = z.object({
  planId: z.enum(['pro_monthly', 'pro_annual', 'ultimate_monthly', 'ultimate_annual']),
});

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function billingRoutes(app: FastifyInstance) {
  const billing = new BillingService();

  // All billing routes require auth + tenant
  app.addHook('preHandler', authenticate);
  app.addHook('preHandler', requireTenant());

  // GET /api/v1/billing/plans
  app.get('/plans', async (_request, reply) => {
    const plans = await billing.getPlans();
    reply.send({ data: plans });
  });

  // GET /api/v1/billing/subscription
  app.get('/subscription', async (request, reply) => {
    const sub = await billing.getSubscription(request.user!.tenantId!);
    reply.send({ data: sub || null });
  });

  // POST /api/v1/billing/subscribe
  app.post('/subscribe', async (request, reply) => {
    const { planId, provider } = validate(subscribeSchema, request.body);
    const tenantId = request.user!.tenantId!;

    if (provider === 'stripe') {
      const result = await billing.createStripeCheckout(
        tenantId,
        planId as PlanId,
        request.user!.email,
        request.user!.email, // name fallback
      );
      reply.send({ data: result });
    } else {
      const result = await billing.createPayPalSubscription(tenantId, planId as PlanId);
      reply.send({ data: result });
    }
  });

  // POST /api/v1/billing/upgrade
  app.post('/upgrade', async (request, reply) => {
    const { planId } = validate(upgradeSchema, request.body);
    await billing.upgradeSubscription(request.user!.tenantId!, planId as PlanId);
    reply.send({ data: { message: 'Subscription upgraded successfully' } });
  });

  // POST /api/v1/billing/downgrade
  app.post('/downgrade', async (request, reply) => {
    const { planId } = validate(upgradeSchema, request.body);
    await billing.upgradeSubscription(request.user!.tenantId!, planId as PlanId);
    reply.send({ data: { message: 'Subscription change will take effect at end of current period' } });
  });

  // POST /api/v1/billing/cancel
  app.post('/cancel', async (request, reply) => {
    const { reason } = validate(cancelSchema, request.body);
    await billing.cancelSubscription(request.user!.tenantId!, reason);
    reply.send({ data: { message: 'Subscription will be cancelled at end of current period' } });
  });

  // POST /api/v1/billing/reactivate
  app.post('/reactivate', async (request, reply) => {
    await billing.reactivateSubscription(request.user!.tenantId!);
    reply.send({ data: { message: 'Subscription reactivated' } });
  });

  // GET /api/v1/billing/invoices
  app.get('/invoices', async (request, reply) => {
    const invoiceList = await billing.getInvoices(request.user!.tenantId!);
    reply.send({ data: invoiceList });
  });

  // GET /api/v1/billing/payment-methods
  app.get('/payment-methods', async (request, reply) => {
    const methods = await billing.getPaymentMethods(request.user!.tenantId!);
    reply.send({ data: methods });
  });

  // POST /api/v1/billing/stripe/portal
  app.post('/stripe/portal', async (request, reply) => {
    const result = await billing.createStripePortalSession(request.user!.tenantId!);
    reply.send({ data: result });
  });
}
