'use client';

import { useState, useEffect } from 'react';
import { authApi, ApiError } from '@/lib/api';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  priceMonthly: number;
  currentPeriodEnd?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

interface TenantTier {
  name: string;
  limits: {
    aiMessagesPerHour: number;
    cronJobs: number;
    memoryEnabled: boolean;
  };
}

interface UserProfile {
  id: string;
  email: string;
  tenant: {
    id: string;
    tier: TenantTier;
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sub, user] = await Promise.all([
          authApi<Subscription | null>('/billing/subscription').catch(() => null),
          authApi<UserProfile>('/auth/me'),
        ]);
        setSubscription(sub);
        setProfile(user);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = 'http://localhost:3000/login';
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Billing</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your subscription and payments</p>
        </div>
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tierName = profile?.tenant?.tier?.name ?? 'Free';
  const planName = subscription?.plan ?? tierName;
  const isActive = subscription?.status === 'active';
  const price = subscription?.priceMonthly;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Billing</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your subscription and payments</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Current Plan */}
        <div className="rounded-xl border border-accent-primary/20 bg-background-elevated p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Current Plan</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'bg-text-muted/10 text-text-muted'
            }`}>
              {isActive ? 'Active' : subscription ? subscription.status : 'Free Trial'}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{planName}</p>
            {price != null && price > 0 ? (
              <p className="text-sm text-text-muted">
                <span className="text-lg font-semibold text-text-primary">${price}</span>/month
              </p>
            ) : (
              <p className="text-sm text-text-muted">No active subscription</p>
            )}
          </div>
          <div className="border-t border-white/5 pt-3 text-xs text-text-muted">
            {subscription?.currentPeriodEnd ? (
              <p>Next billing date: <span className="text-text-secondary">{formatDate(subscription.currentPeriodEnd)}</span></p>
            ) : (
              <p>Upgrade to get more features</p>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Payment Method</h2>
          {subscription?.paymentMethod ? (
            <>
              <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-4 py-3">
                <div className="flex h-8 w-12 items-center justify-center rounded bg-white/10 text-xs font-bold text-text-secondary">
                  {subscription.paymentMethod.brand.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-text-muted">
                    Expires {String(subscription.paymentMethod.expMonth).padStart(2, '0')}/{subscription.paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <button className="text-xs text-accent-primary hover:underline">Update payment method</button>
            </>
          ) : (
            <div className="rounded-lg bg-white/[0.03] px-4 py-3">
              <p className="text-sm text-text-muted">No payment method on file</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href="/billing/upgrade"
          className="rounded-xl border border-white/5 bg-background-elevated p-4 hover:border-white/10 transition-colors"
        >
          <h3 className="text-sm font-semibold text-text-primary">Upgrade Plan</h3>
          <p className="mt-1 text-xs text-text-muted">Compare plans and upgrade</p>
          <p className="mt-2 text-xs font-medium text-accent-primary">View plans &rarr;</p>
        </a>
        <a
          href="/billing/invoices"
          className="rounded-xl border border-white/5 bg-background-elevated p-4 hover:border-white/10 transition-colors"
        >
          <h3 className="text-sm font-semibold text-text-primary">Invoices</h3>
          <p className="mt-1 text-xs text-text-muted">View and download past invoices</p>
          <p className="mt-2 text-xs font-medium text-accent-primary">View invoices &rarr;</p>
        </a>
        <div className="rounded-xl border border-white/5 bg-background-elevated p-4">
          <h3 className="text-sm font-semibold text-text-primary">Manage Payment</h3>
          <p className="mt-1 text-xs text-text-muted">Update card or billing address</p>
          <button className="mt-2 text-xs font-medium text-accent-primary hover:underline">Manage &rarr;</button>
        </div>
      </div>
    </div>
  );
}
