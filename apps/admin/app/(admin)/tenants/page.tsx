'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { authApi, ApiError } from '@/lib/api';

interface Tenant {
  id: string;
  userId: string;
  displayName: string;
  tier: 'free' | 'pro' | 'ultimate';
  status: 'active' | 'trial' | 'past_due' | 'cancelled' | 'suspended';
  selectedPlatform: string | null;
  createdAt: string;
  updatedAt: string;
  trialStartedAt: string | null;
  trialExpiresAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  notes: string | null;
}

const tierColors: Record<Tenant['tier'], string> = {
  free: 'bg-text-muted/10 text-text-muted',
  pro: 'bg-accent-primary/10 text-accent-primary',
  ultimate: 'bg-warning/10 text-warning',
};

const statusColors: Record<Tenant['status'], string> = {
  active: 'bg-success/10 text-success',
  trial: 'bg-accent-primary/10 text-accent-primary',
  past_due: 'bg-warning/10 text-warning',
  cancelled: 'bg-danger/10 text-danger',
  suspended: 'bg-danger/10 text-danger',
};

const statusLabels: Record<Tenant['status'], string> = {
  active: 'Active',
  trial: 'Trial',
  past_due: 'Past Due',
  cancelled: 'Cancelled',
  suspended: 'Suspended',
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi<Tenant[]>(
        `/admin/tenants?page=${page}&perPage=${perPage}`
      );
      setTenants(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load tenants. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      search === '' ||
      t.displayName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
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
            placeholder="Search by name or ID..."
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
          <option value="pro">Pro</option>
          <option value="ultimate">Ultimate</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-white/5 bg-background-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary/50"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="past_due">Past Due</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          <p>{error}</p>
          <button
            onClick={fetchTenants}
            className="mt-1 text-xs font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
          <span className="ml-3 text-sm text-text-secondary">Loading tenants...</span>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-secondary">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Tier</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Platform</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/tenants/${tenant.id}`} className="font-medium text-text-primary hover:text-accent-primary">
                        {tenant.displayName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${tierColors[tenant.tier]}`}>
                        {tenant.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${statusColors[tenant.status]}`}>
                        {statusLabels[tenant.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary capitalize">
                      {tenant.selectedPlatform || '--'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-muted">
                      No tenants match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              Showing {filtered.length} tenant{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-white/5 bg-background-secondary px-3 py-1.5 text-text-secondary transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="flex items-center px-2 text-text-muted">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={tenants.length < perPage}
                className="rounded-md border border-white/5 bg-background-secondary px-3 py-1.5 text-text-secondary transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
