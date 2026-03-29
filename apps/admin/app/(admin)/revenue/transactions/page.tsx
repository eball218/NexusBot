'use client';

import { useState } from 'react';

const transactions = [
  { date: '2026-03-27', tenant: 'Acme Gaming', amount: '$49.00', provider: 'Stripe', status: 'paid', invoiceId: 'INV-2026-0401' },
  { date: '2026-03-27', tenant: 'StreamPro Inc', amount: '$29.00', provider: 'PayPal', status: 'paid', invoiceId: 'INV-2026-0400' },
  { date: '2026-03-26', tenant: 'NightOwl Studios', amount: '$99.00', provider: 'Stripe', status: 'failed', invoiceId: 'INV-2026-0399' },
  { date: '2026-03-26', tenant: 'PixelForge', amount: '$29.00', provider: 'Stripe', status: 'paid', invoiceId: 'INV-2026-0398' },
  { date: '2026-03-25', tenant: 'CloudNine Streams', amount: '$49.00', provider: 'PayPal', status: 'refunded', invoiceId: 'INV-2026-0397' },
  { date: '2026-03-25', tenant: 'BotLab Co', amount: '$99.00', provider: 'Stripe', status: 'paid', invoiceId: 'INV-2026-0396' },
  { date: '2026-03-24', tenant: 'GameVault', amount: '$29.00', provider: 'PayPal', status: 'failed', invoiceId: 'INV-2026-0395' },
  { date: '2026-03-24', tenant: 'TurboChat', amount: '$49.00', provider: 'Stripe', status: 'paid', invoiceId: 'INV-2026-0394' },
];

const providerBadge = (provider: string) => {
  const cls =
    provider === 'Stripe'
      ? 'bg-accent-secondary/10 text-accent-secondary'
      : 'bg-accent-primary/10 text-accent-primary';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{provider}</span>;
};

const statusBadge = (status: string) => {
  const cls =
    status === 'paid'
      ? 'bg-success/10 text-success'
      : status === 'failed'
        ? 'bg-danger/10 text-danger'
        : 'bg-warning/10 text-warning';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
};

export default function TransactionsPage() {
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = transactions.filter((t) => {
    if (providerFilter !== 'all' && t.provider !== providerFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
        <p className="mt-1 text-sm text-text-secondary">All payment transactions across tenants.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="rounded-lg border border-white/5 bg-background-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
        >
          <option value="all">All Providers</option>
          <option value="Stripe">Stripe</option>
          <option value="PayPal">PayPal</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/5 bg-background-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-elevated">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-text-muted">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Tenant</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Provider</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Invoice ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 text-text-secondary">{t.date}</td>
                <td className="px-5 py-3 text-text-primary">{t.tenant}</td>
                <td className="px-5 py-3 text-text-primary">{t.amount}</td>
                <td className="px-5 py-3">{providerBadge(t.provider)}</td>
                <td className="px-5 py-3">{statusBadge(t.status)}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-muted">{t.invoiceId}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                  No transactions match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
