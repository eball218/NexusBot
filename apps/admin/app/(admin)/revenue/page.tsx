'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

interface Invoice {
  id: string;
  tenantName: string;
  amountCents: number;
  status: string;
  createdAt: string;
}

interface RevenueData {
  totalRevenueCents: number;
  invoiceCount: number;
  recentInvoices: Invoice[];
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RevenueDashboardPage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [transactions, setTransactions] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [revenue, txns] = await Promise.all([
          authApi<RevenueData>('/admin/revenue'),
          authApi<Invoice[]>('/admin/revenue/transactions'),
        ]);
        setRevenueData(revenue);
        setTransactions(txns);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const kpis = revenueData
    ? [
        {
          label: 'Total Revenue',
          value: formatCents(revenueData.totalRevenueCents),
        },
        {
          label: 'Invoice Count',
          value: revenueData.invoiceCount.toLocaleString(),
        },
        {
          label: 'Avg per Invoice',
          value:
            revenueData.invoiceCount > 0
              ? formatCents(Math.round(revenueData.totalRevenueCents / revenueData.invoiceCount))
              : '$0.00',
        },
        {
          label: 'Recent Invoices',
          value: revenueData.recentInvoices.length.toString(),
        },
      ]
    : [];

  const failedPayments = transactions.filter(
    (t) => t.status === 'failed' || t.status === 'past_due' || t.status === 'uncollectible',
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Revenue</h1>
          <p className="mt-1 text-sm text-text-secondary">Financial overview and payment analytics.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-white/5 bg-background-elevated p-5"
            >
              <div className="h-4 w-20 rounded bg-white/5" />
              <div className="mt-3 h-7 w-28 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Revenue</h1>
          <p className="mt-1 text-sm text-text-secondary">Financial overview and payment analytics.</p>
        </div>
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-md bg-danger/10 px-4 py-2 text-xs font-medium text-danger hover:bg-danger/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Revenue</h1>
        <p className="mt-1 text-sm text-text-secondary">Financial overview and payment analytics.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-white/5 bg-background-elevated p-5"
          >
            <p className="text-sm text-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-background-elevated">
          <div className="text-center">
            <div className="text-3xl text-text-muted">&#9776;</div>
            <p className="mt-2 text-sm text-text-muted">MRR by Tier</p>
            <p className="text-xs text-text-muted">Chart placeholder</p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-background-elevated">
          <div className="text-center">
            <div className="text-3xl text-text-muted">&#9776;</div>
            <p className="mt-2 text-sm text-text-muted">Churn Analysis</p>
            <p className="text-xs text-text-muted">Chart placeholder</p>
          </div>
        </div>
      </div>

      {/* Failed Payments */}
      <div className="rounded-lg border border-white/5 bg-background-elevated">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Failed Payments</h2>
        </div>
        {failedPayments.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-text-muted">
            No failed payments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-text-muted">
                  <th className="px-5 py-3 font-medium">Tenant</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {failedPayments.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 text-text-primary">{p.tenantName}</td>
                    <td className="px-5 py-3 text-text-primary">{formatCents(p.amountCents)}</td>
                    <td className="px-5 py-3 text-text-secondary">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === 'failed'
                            ? 'bg-danger/10 text-danger'
                            : p.status === 'past_due'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-accent-primary/10 text-accent-primary'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
