import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { subscriptions, tenants } from '@nexusbot/db';
import { getDb } from '../db';
import { StripeService } from '../services/stripe.service';
import { BillingService } from '../services/billing.service';
import { EmailService } from '../services/email.service';

export async function webhookRoutes(app: FastifyInstance) {
  const stripeService = new StripeService();
  const billing = new BillingService();
  const email = new EmailService();
  const db = getDb();

  // POST /api/v1/webhooks/stripe
  app.post('/stripe', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string;
    if (!signature) {
      reply.status(400).send({ error: 'Missing stripe-signature header' });
      return;
    }

    let event;
    try {
      event = await stripeService.constructWebhookEvent(
        request.body as string,
        signature,
      );
    } catch (err) {
      app.log.error(err, 'Stripe webhook signature verification failed');
      reply.status(400).send({ error: 'Invalid signature' });
      return;
    }

    app.log.info({ type: event.type }, 'Stripe webhook received');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as unknown as {
          subscription: string;
          customer: string;
          metadata: { tenantId: string };
        };
        const tenantId = session.metadata.tenantId;

        // Fetch the subscription to get plan details
        const stripeSub = await stripeService.getSubscription(session.subscription);
        const priceId = stripeSub.items.data[0]?.price.id;

        // Map price ID back to plan ID
        const planId = Object.entries({
          pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
          pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
          ultimate_monthly: process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID,
          ultimate_annual: process.env.STRIPE_ULTIMATE_ANNUAL_PRICE_ID,
        }).find(([, v]) => v === priceId)?.[0] || 'pro_monthly';

        await billing.activateSubscription({
          tenantId,
          provider: 'stripe',
          providerSubscriptionId: session.subscription,
          providerCustomerId: session.customer,
          planId,
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        });

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as {
          subscription: string;
          customer: string;
          amount_paid: number;
          currency: string;
          id: string;
          subscription_details?: { metadata?: { tenantId?: string } };
        };

        // Find tenant by stripe subscription
        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, invoice.subscription),
        });

        if (sub) {
          await billing.recordPayment({
            tenantId: sub.tenantId,
            provider: 'stripe',
            providerInvoiceId: invoice.id,
            amountCents: invoice.amount_paid,
            currency: invoice.currency,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as {
          subscription: string;
        };

        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, invoice.subscription),
        });

        if (sub) {
          await billing.handlePaymentFailed(sub.tenantId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as {
          id: string;
          cancel_at_period_end: boolean;
          current_period_start: number;
          current_period_end: number;
          status: string;
        };

        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, stripeSub.id),
        });

        if (sub) {
          await db
            .update(subscriptions)
            .set({
              status: stripeSub.status === 'active' ? 'active' : 'past_due',
              cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
              currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, sub.id));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as { id: string };

        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, stripeSub.id),
        });

        if (sub) {
          await db
            .update(subscriptions)
            .set({ status: 'cancelled', updatedAt: new Date() })
            .where(eq(subscriptions.id, sub.id));

          await db
            .update(tenants)
            .set({ status: 'cancelled', tier: 'free', updatedAt: new Date() })
            .where(eq(tenants.id, sub.tenantId));
        }
        break;
      }
    }

    reply.send({ received: true });
  });

  // POST /api/v1/webhooks/paypal
  app.post('/paypal', async (request, reply) => {
    const body = request.body as {
      event_type: string;
      resource: Record<string, unknown>;
    };

    app.log.info({ type: body.event_type }, 'PayPal webhook received');

    switch (body.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.CREATED': {
        const resource = body.resource as {
          id: string;
          plan_id: string;
          custom_id: string;
          subscriber: { payer_id: string };
          billing_info?: {
            next_billing_time?: string;
          };
        };

        const tenantId = resource.custom_id;

        // Map PayPal plan ID to our plan ID
        const planId = Object.entries({
          pro_monthly: process.env.PAYPAL_PRO_MONTHLY_PLAN_ID,
          pro_annual: process.env.PAYPAL_PRO_ANNUAL_PLAN_ID,
          ultimate_monthly: process.env.PAYPAL_ULTIMATE_MONTHLY_PLAN_ID,
          ultimate_annual: process.env.PAYPAL_ULTIMATE_ANNUAL_PLAN_ID,
        }).find(([, v]) => v === resource.plan_id)?.[0] || 'pro_monthly';

        const now = new Date();
        const periodEnd = resource.billing_info?.next_billing_time
          ? new Date(resource.billing_info.next_billing_time)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await billing.activateSubscription({
          tenantId,
          provider: 'paypal',
          providerSubscriptionId: resource.id,
          planId,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        });
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const resource = body.resource as { id: string };

        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.paypalSubscriptionId, resource.id),
        });

        if (sub) {
          const newStatus = body.event_type.includes('CANCELLED') ? 'cancelled' : 'past_due';
          await db
            .update(subscriptions)
            .set({ status: newStatus, updatedAt: new Date() })
            .where(eq(subscriptions.id, sub.id));

          if (newStatus === 'cancelled') {
            await db
              .update(tenants)
              .set({ status: 'cancelled', tier: 'free', updatedAt: new Date() })
              .where(eq(tenants.id, sub.tenantId));
          } else {
            await billing.handlePaymentFailed(sub.tenantId);
          }
        }
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const resource = body.resource as {
          billing_agreement_id: string;
          id: string;
          amount: { total: string; currency: string };
        };

        const sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.paypalSubscriptionId, resource.billing_agreement_id),
        });

        if (sub) {
          await billing.recordPayment({
            tenantId: sub.tenantId,
            provider: 'paypal',
            providerInvoiceId: resource.id,
            amountCents: Math.round(parseFloat(resource.amount.total) * 100),
            currency: resource.amount.currency.toLowerCase(),
          });
        }
        break;
      }
    }

    reply.send({ received: true });
  });
}
