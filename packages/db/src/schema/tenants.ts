import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    tier: text('tier', { enum: ['free', 'pro', 'ultimate'] })
      .notNull()
      .default('free'),
    status: text('status', {
      enum: ['active', 'trial', 'past_due', 'cancelled', 'suspended'],
    })
      .notNull()
      .default('active'),
    trialStartedAt: timestamp('trial_started_at', { withTimezone: true }),
    trialExpiresAt: timestamp('trial_expires_at', { withTimezone: true }),
    selectedPlatform: text('selected_platform', { enum: ['twitch', 'discord'] }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),
    notes: text('notes'),
  },
  (table) => [
    index('idx_tenants_user').on(table.userId),
    index('idx_tenants_status').on(table.status),
  ],
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripeCustomerId: text('stripe_customer_id'),
    paypalSubscriptionId: text('paypal_subscription_id').unique(),
    paypalPayerId: text('paypal_payer_id'),
    paymentProvider: text('payment_provider', {
      enum: ['stripe', 'paypal', 'none'],
    }).notNull(),
    planId: text('plan_id').notNull(),
    status: text('status', {
      enum: ['active', 'past_due', 'cancelled', 'expired', 'trialing'],
    })
      .notNull()
      .default('active'),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_subscriptions_tenant').on(table.tenantId),
    index('idx_subscriptions_stripe').on(table.stripeSubscriptionId),
  ],
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
    stripeInvoiceId: text('stripe_invoice_id').unique(),
    paypalTransactionId: text('paypal_transaction_id').unique(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('usd'),
    status: text('status', {
      enum: ['draft', 'open', 'paid', 'void', 'uncollectible'],
    }).notNull(),
    paymentProvider: text('payment_provider').notNull(),
    invoicePdfUrl: text('invoice_pdf_url'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_invoices_tenant').on(table.tenantId)],
);

export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  provider: text('provider', { enum: ['stripe', 'paypal'] }).notNull(),
  stripePaymentMethodId: text('stripe_payment_method_id'),
  paypalEmail: text('paypal_email'),
  cardBrand: text('card_brand'),
  cardLastFour: text('card_last_four'),
  cardExpMonth: integer('card_exp_month'),
  cardExpYear: integer('card_exp_year'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
