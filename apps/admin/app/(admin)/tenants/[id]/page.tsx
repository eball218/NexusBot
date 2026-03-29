'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TenantData {
  id: string;
  name: string;
  email: string;
  tier: string;
  status: string;
  signupDate: string;
  platform: string;
  botName: string;
  botStatus: string;
  botPlatform: string;
  botPersonality: string;
  moderationLevel: string;
  totalMessages: number;
  totalCommands: number;
  uptime: string;
  mrr: number;
}

const mockTenant: TenantData = {
  id: 't-001',
  name: 'StreamKing',
  email: 'admin@streamking.tv',
  tier: 'Pro',
  status: 'Active',
  signupDate: '2025-11-12',
  platform: 'Twitch, Discord',
  botName: 'StreamKingBot',
  botStatus: 'Online',
  botPlatform: 'Twitch',
  botPersonality: 'Friendly & Engaging',
  moderationLevel: 'Moderate',
  totalMessages: 48_230,
  totalCommands: 12_810,
  uptime: '99.7%',
  mrr: 29,
};

interface SubscriptionEntry {
  date: string;
  action: string;
  details: string;
}

const subscriptionHistory: SubscriptionEntry[] = [
  { date: '2026-02-01', action: 'Renewed', details: 'Pro plan - $29/mo' },
  { date: '2026-01-01', action: 'Renewed', details: 'Pro plan - $29/mo' },
  { date: '2025-12-15', action: 'Upgraded', details: 'Starter -> Pro' },
  { date: '2025-11-12', action: 'Signed Up', details: 'Starter plan - $9/mo' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-background-secondary p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Free: 'bg-text-muted/10 text-text-muted',
    Starter: 'bg-success/10 text-success',
    Pro: 'bg-accent-primary/10 text-accent-primary',
    Business: 'bg-accent-secondary/10 text-accent-secondary',
    Enterprise: 'bg-warning/10 text-warning',
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${colors[tier] ?? 'bg-white/5 text-text-secondary'}`}>
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: 'bg-success/10 text-success',
    Trial: 'bg-accent-primary/10 text-accent-primary',
    Suspended: 'bg-warning/10 text-warning',
    Cancelled: 'bg-danger/10 text-danger',
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${colors[status] ?? 'bg-white/5 text-text-secondary'}`}>
      {status}
    </span>
  );
}

export default function TenantDetailPage() {
  const params = useParams<{ id: string }>();
  const tenant = mockTenant;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/tenants" className="text-text-muted transition-colors hover:text-text-primary">
          Tenants
        </Link>
        <span className="text-text-muted">/</span>
        <span className="text-text-primary">{tenant.name}</span>
        <span className="ml-1 text-xs text-text-muted">({params.id})</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{tenant.name}</h1>
        <StatusBadge status={tenant.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Account Info */}
        <Card title="Account Information">
          <div>
            <InfoRow label="Name" value={tenant.name} />
            <InfoRow label="Email" value={tenant.email} />
            <InfoRow label="Tier" value={<TierBadge tier={tenant.tier} />} />
            <InfoRow label="Status" value={<StatusBadge status={tenant.status} />} />
            <InfoRow label="Signup Date" value={tenant.signupDate} />
            <InfoRow label="Platform(s)" value={tenant.platform} />
            <InfoRow label="Current MRR" value={`$${tenant.mrr}/mo`} />
          </div>
        </Card>

        {/* Subscription History */}
        <Card title="Subscription History">
          <div className="space-y-0">
            {subscriptionHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 py-2.5 last:border-0">
                <div>
                  <span className="text-sm font-medium text-text-primary">{entry.action}</span>
                  <span className="ml-2 text-xs text-text-muted">{entry.details}</span>
                </div>
                <span className="text-xs text-text-muted">{entry.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bot Configuration (read-only) */}
        <Card title="Bot Configuration">
          <div>
            <InfoRow label="Bot Name" value={tenant.botName} />
            <InfoRow
              label="Status"
              value={
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${tenant.botStatus === 'Online' ? 'bg-success' : 'bg-danger'}`} />
                  {tenant.botStatus}
                </span>
              }
            />
            <InfoRow label="Platform" value={tenant.botPlatform} />
            <InfoRow label="Personality" value={tenant.botPersonality} />
            <InfoRow label="Moderation" value={tenant.moderationLevel} />
          </div>
        </Card>

        {/* Usage Stats */}
        <Card title="Usage Statistics">
          <div>
            <InfoRow label="Total Messages" value={tenant.totalMessages.toLocaleString()} />
            <InfoRow label="Total Commands" value={tenant.totalCommands.toLocaleString()} />
            <InfoRow label="Bot Uptime" value={tenant.uptime} />
          </div>
          <div className="mt-4 flex h-28 items-center justify-center rounded-md border border-dashed border-white/10 bg-background">
            <span className="text-xs text-text-muted">Usage chart placeholder</span>
          </div>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card title="Admin Actions">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-primary/80"
          >
            Upgrade Plan
          </button>
          <button
            type="button"
            className="rounded-md border border-accent-primary/30 bg-transparent px-4 py-2 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary/10"
          >
            Downgrade Plan
          </button>
          <button
            type="button"
            className="rounded-md bg-success/10 px-4 py-2 text-sm font-medium text-success transition-colors hover:bg-success/20"
          >
            Extend Trial
          </button>
          <button
            type="button"
            className="rounded-md bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
          >
            Suspend Account
          </button>
          <button
            type="button"
            className="rounded-md border-2 border-warning/50 bg-warning/5 px-4 py-2 text-sm font-bold text-warning transition-colors hover:bg-warning/15"
          >
            Impersonate
          </button>
        </div>
      </Card>
    </div>
  );
}
