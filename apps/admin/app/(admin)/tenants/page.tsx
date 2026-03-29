'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  botStatus: 'online' | 'offline';
  platforms: string[];
  signupDate: string;
  mrr: number;
}

const tenants: Tenant[] = [
  { id: 't-001', name: 'StreamKing', email: 'admin@streamking.tv', tier: 'pro', status: 'active', botStatus: 'online', platforms: ['Twitch', 'Discord'], signupDate: '2025-11-12', mrr: 29 },
  { id: 't-002', name: 'GamerHQ', email: 'hello@gamerhq.gg', tier: 'business', status: 'active', botStatus: 'online', platforms: ['Twitch'], signupDate: '2025-09-03', mrr: 79 },
  { id: 't-003', name: 'PixelPlay', email: 'info@pixelplay.io', tier: 'starter', status: 'cancelled', botStatus: 'offline', platforms: ['Discord'], signupDate: '2025-12-01', mrr: 0 },
  { id: 't-004', name: 'LunaStreams', email: 'luna@lunastreams.com', tier: 'pro', status: 'active', botStatus: 'online', platforms: ['Twitch', 'Discord'], signupDate: '2026-01-15', mrr: 29 },
  { id: 't-005', name: 'NightOwl Gaming', email: 'owl@nightowlgaming.net', tier: 'enterprise', status: 'active', botStatus: 'online', platforms: ['Twitch', 'Discord', 'YouTube'], signupDate: '2025-06-20', mrr: 199 },
  { id: 't-006', name: 'CasualCrew', email: 'crew@casualcrew.tv', tier: 'free', status: 'trial', botStatus: 'online', platforms: ['Twitch'], signupDate: '2026-03-10', mrr: 0 },
  { id: 't-007', name: 'ProStreamers United', email: 'contact@prostreamers.gg', tier: 'business', status: 'active', botStatus: 'offline', platforms: ['Twitch', 'YouTube'], signupDate: '2025-08-22', mrr: 79 },
  { id: 't-008', name: 'VortexLive', email: 'admin@vortexlive.tv', tier: 'pro', status: 'suspended', botStatus: 'offline', platforms: ['Twitch'], signupDate: '2025-10-05', mrr: 0 },
];

const tierColors: Record<Tenant['tier'], string> = {
  free: 'bg-text-muted/10 text-text-muted',
  starter: 'bg-success/10 text-success',
  pro: 'bg-accent-primary/10 text-accent-primary',
  business: 'bg-accent-secondary/10 text-accent-secondary',
  enterprise: 'bg-warning/10 text-warning',
};

const statusColors: Record<Tenant['status'], string> = {
  active: 'bg-success/10 text-success',
  trial: 'bg-accent-primary/10 text-accent-primary',
  suspended: 'bg-warning/10 text-warning',
  cancelled: 'bg-danger/10 text-danger',
};

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || t.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Tenants</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage all tenant accounts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-white/5 bg-background-secondary py-2 pl-9 pr-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="rounded-md border border-white/5 bg-background-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary/50"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-white/5 bg-background-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary/50"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-secondary">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Tier</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Bot</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Platform(s)</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Signup Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">MRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((tenant) => (
              <tr key={tenant.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/tenants/${tenant.id}`} className="font-medium text-text-primary hover:text-accent-primary">
                    {tenant.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-text-secondary">{tenant.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${tierColors[tenant.tier]}`}>
                    {tenant.tier}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${statusColors[tenant.status]}`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        tenant.botStatus === 'online' ? 'bg-success' : 'bg-danger'
                      }`}
                    />
                    <span className="text-xs text-text-secondary capitalize">{tenant.botStatus}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{tenant.platforms.join(', ')}</td>
                <td className="px-4 py-3 text-text-secondary">{tenant.signupDate}</td>
                <td className="px-4 py-3 font-medium text-text-primary">
                  {tenant.mrr > 0 ? `$${tenant.mrr}` : '--'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-text-muted">
                  No tenants match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
