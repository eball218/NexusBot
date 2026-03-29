export interface Subscription {
  id: string;
  tenantId: string;
  paymentProvider: 'stripe' | 'paypal' | 'none';
  planId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'trialing';
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  tenantId: string;
  amountCents: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  paymentProvider: string;
  invoicePdfUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal';
  cardBrand: string | null;
  cardLastFour: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  paypalEmail: string | null;
  isDefault: boolean;
}
