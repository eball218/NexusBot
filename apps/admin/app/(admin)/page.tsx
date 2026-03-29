'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function KpiCard({ title, value, change, changeType = 'neutral', icon }: KpiCardProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-success'
      : changeType === 'negative'
        ? 'text-danger'
        : 'text-text-muted';

  return (
    <div className="rounded-lg border border-white/5 bg-background-secondary p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{title}</span>
        <span className="text-text-muted">{icon}</span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-bold text-text-primary">{value}</span>
        {change && <span className={`text-xs font-medium ${changeColor}`}>{change}</span>}
      </div>
    </div>
  );
}

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-background-secondary p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">{title}</h3>
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-white/10 bg-background">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p className="mt-2 text-xs text-text-muted">Chart visualization</p>
        </div>
      </div>
    </div>
  );
}

interface ActivityEntry {
  id: string;
  type: 'signup' | 'upgrade' | 'cancel' | 'error' | 'ticket';
  message: string;
  time: string;
}

function ActivityBadge({ type }: { type: ActivityEntry['type'] }) {
  const styles: Record<ActivityEntry['type'], string> = {
    signup: 'bg-success/10 text-success',
    upgrade: 'bg-accent-primary/10 text-accent-primary',
    cancel: 'bg-danger/10 text-danger',
    error: 'bg-warning/10 text-warning',
    ticket: 'bg-accent-secondary/10 text-accent-secondary',
  };
  const labels: Record<ActivityEntry['type'], string> = {
    signup: 'Signup',
    upgrade: 'Upgrade',
    cancel: 'Cancel',
    error: 'Error',
    ticket: 'Ticket',
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg
          className="h-8 w-8 animate-spin text-accent-primary"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm text-text-muted">Loading dashboard...</span>
      </div>
    </div>
  );
}

interface DashboardData {
  totalTenants: number;
  totalUsers: number;
  activeBots: number;
  activeSubscriptions: number;
}

interface RevenueData {
  totalRevenueCents: number;
  invoiceCount: number;
  recentInvoices: unknown[];
}

interface TenantEntry {
  id: string;
  name: string;
  tier: string;
  createdAt: string;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [recentTenants, setRecentTenants] = useState<TenantEntry[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashboardData, revenueData, tenantData] = await Promise.all([
          authApi<DashboardData>('/admin/dashboard'),
          authApi<RevenueData>('/admin/revenue'),
          authApi<TenantEntry[]>('/admin/tenants?page=1&perPage=10'),
        ]);

        setDashboard(dashboardData);
        setRevenue(revenueData);
        setRecentTenants(tenantData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">NexusBot platform overview</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">NexusBot platform overview</p>
        </div>
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-md bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activityFeed: ActivityEntry[] = recentTenants.map((tenant) => ({
    id: tenant.id,
    type: 'signup' as const,
    message: `New tenant "${tenant.name}" signed up${tenant.tier !== 'free' ? ` for ${tenant.tier} plan` : ''}`,
    time: timeAgo(tenant.createdAt),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">NexusBot platform overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          title="Total Tenants"
          value={formatNumber(dashboard?.totalTenants ?? 0)}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          }
        />
        <KpiCard
          title="Total Users"
          value={formatNumber(dashboard?.totalUsers ?? 0)}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          }
        />
        <KpiCard
          title="Active Subs"
          value={formatNumber(dashboard?.activeSubscriptions ?? 0)}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          }
        />
        <KpiCard
          title="MRR"
          value={revenue ? formatCurrency(revenue.totalRevenueCents) : '$0'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          }
        />
        <KpiCard
          title="Active Bots"
          value={formatNumber(dashboard?.activeBots ?? 0)}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" fill="currentColor" /><circle cx="15" cy="10" r="1.5" fill="currentColor" /><path d="M9 15h6" /></svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPlaceholder title="Revenue Over Time (MRR)" />
        <ChartPlaceholder title="New Signups" />
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-white/5 bg-background-secondary p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Recent Activity</h3>
        <div className="space-y-3">
          {activityFeed.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">No recent activity</p>
          ) : (
            activityFeed.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-md border border-white/5 bg-background px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <ActivityBadge type={entry.type} />
                  <span className="text-sm text-text-primary">{entry.message}</span>
                </div>
                <span className="flex-shrink-0 text-xs text-text-muted">{entry.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
