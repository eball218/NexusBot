import { eq, and, desc } from 'drizzle-orm';
import { tenants, subscriptions, invoices, paymentMethods } from '@nexusbot/db';
import { TIERS, PLAN_IDS, type PlanId, formatCents } from '@nexusbot/shared';
import { getDb } from '../db';
import { config } from '../config';
import { StripeService } from './stripe.service';
import { PayPalService } from './paypal.service';
import { EmailService } from './email.service';
import { BadRequestError, NotFoundError } from '../utils/errors';

type PaymentProvider = 'stripe' | 'paypal';

export class BillingService {
  private db = getDb();
  private _stripe?: StripeService;
  private _paypal?: PayPalService;
  private _email?: EmailService;

  private get stripe() { return this._stripe ??= new StripeService(); }
  private get paypal() { return this._paypal ??= new PayPalService(); }
  private get email() { return this._email ??= new EmailService(); }

  async getPlans() {
    return Object.entries(PLAN_IDS).map(([id, plan]) => {
      const tier = TIERS[plan.tier];
      return {
        id,
        tier: plan.tier,
        billing: plan.billing,
        name: tier.name,
        price: plan.billing === 'monthly' ? tier.price.monthly : tier.price.annual,
        currency: 'usd',
        features: tier.features,
      };
    });
  }

  async getSubscription(tenantId: string) {
    return this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.tenantId, tenantId),
      orderBy: [desc(subscriptions.createdAt)],
    });
  }

  async createStripeCheckout(tenantId: string, planId: PlanId, email: string, name: string) {
    const priceId = this.stripe.getPriceId(planId);
    if (!priceId) throw new BadRequestError('Invalid plan');

    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });
    if (!tenant) throw new NotFoundError('Tenant');

    // Get or create Stripe customer
    const existingSub = await this.getSubscription(tenantId);
    let customerId = existingSub?.stripeCustomerId;

    if (!customerId) {
      customerId = await this.stripe.createCustomer(email, name, tenantId);
    }

    const checkoutUrl = await this.stripe.createCheckoutSession({
      customerId,
      priceId,
      tenantId,
      successUrl: `${config.app.dashboardUrl}/billing?success=true`,
      cancelUrl: `${config.app.dashboardUrl}/billing?cancelled=true`,
    });

    return { checkoutUrl };
  }

  async createPayPalSubscription(tenantId: string, planId: PlanId) {
    const paypalPlanId = this.paypal.getPlanId(planId);
    if (!paypalPlanId) throw new BadRequestError('Invalid plan');

    const result = await this.paypal.createSubscription({
      planId: paypalPlanId,
      tenantId,
      returnUrl: `${config.app.dashboardUrl}/billing?paypal_success=true`,
      cancelUrl: `${config.app.dashboardUrl}/billing?paypal_cancelled=true`,
    });

    return { approvalUrl: result.approvalUrl, subscriptionId: result.subscriptionId };
  }

  async activateSubscription(params: {
    tenantId: string;
    provider: PaymentProvider;
    providerSubscriptionId: string;
    providerCustomerId?: string;
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }) {
    const planConfig = PLAN_IDS[params.planId as PlanId];
    if (!planConfig) throw new BadRequestError('Invalid plan ID');

    // Upsert subscription
    const existing = await this.getSubscription(params.tenantId);

    if (existing) {
      await this.db
        .update(subscriptions)
        .set({
          paymentProvider: params.provider,
          stripeSubscriptionId: params.provider === 'stripe' ? params.providerSubscriptionId : existing.stripeSubscriptionId,
          stripeCustomerId: params.providerCustomerId || existing.stripeCustomerId,
          paypalSubscriptionId: params.provider === 'paypal' ? params.providerSubscriptionId : existing.paypalSubscriptionId,
          planId: params.planId,
          status: 'active',
          currentPeriodStart: params.currentPeriodStart,
          currentPeriodEnd: params.currentPeriodEnd,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existing.id));
    } else {
      await this.db.insert(subscriptions).values({
        tenantId: params.tenantId,
        paymentProvider: params.provider,
        stripeSubscriptionId: params.provider === 'stripe' ? params.providerSubscriptionId : null,
        stripeCustomerId: params.providerCustomerId || null,
        paypalSubscriptionId: params.provider === 'paypal' ? params.providerSubscriptionId : null,
        planId: params.planId,
        status: 'active',
        currentPeriodStart: params.currentPeriodStart,
        currentPeriodEnd: params.currentPeriodEnd,
      });
    }

    // Update tenant tier
    await this.db
      .update(tenants)
      .set({
        tier: planConfig.tier,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, params.tenantId));
  }

  async recordPayment(params: {
    tenantId: string;
    subscriptionId?: string;
    provider: PaymentProvider;
    providerInvoiceId: string;
    amountCents: number;
    currency: string;
  }) {
    // Find subscription by tenant
    const sub = params.subscriptionId
      ? await this.db.query.subscriptions.findFirst({
          where: eq(subscriptions.id, params.subscriptionId),
        })
      : await this.getSubscription(params.tenantId);

    await this.db.insert(invoices).values({
      tenantId: params.tenantId,
      subscriptionId: sub?.id,
      stripeInvoiceId: params.provider === 'stripe' ? params.providerInvoiceId : null,
      paypalTransactionId: params.provider === 'paypal' ? params.providerInvoiceId : null,
      amountCents: params.amountCents,
      currency: params.currency,
      status: 'paid',
      paymentProvider: params.provider,
      paidAt: new Date(),
    });
  }

  async handlePaymentFailed(tenantId: string) {
    await this.db
      .update(tenants)
      .set({ status: 'past_due', updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));

    const sub = await this.getSubscription(tenantId);
    if (sub) {
      await this.db
        .update(subscriptions)
        .set({ status: 'past_due', updatedAt: new Date() })
        .where(eq(subscriptions.id, sub.id));
    }
  }

  async cancelSubscription(tenantId: string, reason?: string) {
    const sub = await this.getSubscription(tenantId);
    if (!sub) throw new NotFoundError('Subscription');

    // Cancel with provider
    if (sub.paymentProvider === 'stripe' && sub.stripeSubscriptionId) {
      await this.stripe.cancelSubscription(sub.stripeSubscriptionId);
    } else if (sub.paymentProvider === 'paypal' && sub.paypalSubscriptionId) {
      await this.paypal.cancelSubscription(sub.paypalSubscriptionId, reason || 'User cancelled');
    }

    await this.db
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: true, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));

    await this.db
      .update(tenants)
      .set({
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));
  }

  async reactivateSubscription(tenantId: string) {
    const sub = await this.getSubscription(tenantId);
    if (!sub) throw new NotFoundError('Subscription');
    if (!sub.cancelAtPeriodEnd) throw new BadRequestError('Subscription is not scheduled for cancellation');

    if (sub.paymentProvider === 'stripe' && sub.stripeSubscriptionId) {
      await this.stripe.reactivateSubscription(sub.stripeSubscriptionId);
    }

    await this.db
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: false, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));

    await this.db
      .update(tenants)
      .set({ cancelledAt: null, cancellationReason: null, status: 'active', updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));
  }

  async upgradeSubscription(tenantId: string, newPlanId: PlanId) {
    const sub = await this.getSubscription(tenantId);
    if (!sub) throw new NotFoundError('Subscription');

    if (sub.paymentProvider === 'stripe' && sub.stripeSubscriptionId) {
      const priceId = this.stripe.getPriceId(newPlanId);
      if (!priceId) throw new BadRequestError('Invalid plan');
      await this.stripe.updateSubscription(sub.stripeSubscriptionId, priceId);
    }

    const planConfig = PLAN_IDS[newPlanId];
    await this.db
      .update(subscriptions)
      .set({ planId: newPlanId, updatedAt: new Date() })
      .where(eq(subscriptions.id, sub.id));

    await this.db
      .update(tenants)
      .set({ tier: planConfig.tier, updatedAt: new Date() })
      .where(eq(tenants.id, tenantId));
  }

  async getInvoices(tenantId: string) {
    return this.db.query.invoices.findMany({
      where: eq(invoices.tenantId, tenantId),
      orderBy: [desc(invoices.createdAt)],
    });
  }

  async getPaymentMethods(tenantId: string) {
    return this.db.query.paymentMethods.findMany({
      where: eq(paymentMethods.tenantId, tenantId),
    });
  }

  async createStripePortalSession(tenantId: string) {
    const sub = await this.getSubscription(tenantId);
    if (!sub?.stripeCustomerId) throw new BadRequestError('No Stripe customer found');

    const url = await this.stripe.createPortalSession(
      sub.stripeCustomerId,
      `${config.app.dashboardUrl}/billing`,
    );
    return { url };
  }
}
