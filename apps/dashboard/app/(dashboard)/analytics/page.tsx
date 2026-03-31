'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

type OverviewData = {
  messages24h: number;
  modActions24h: number;
  aiConversations24h: number;
  cronRuns24h: number;
  activeCronJobs: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await authApi<OverviewData>('/analytics/overview');
        setData(res);
      } catch {
        // silently fall back to empty
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  const stats = data
    ? [
        { label: 'Messages (24h)', value: String(data.messages24h) },
        { label: 'Mod Actions (24h)', value: String(data.modActions24h) },
        { label: 'AI Conversations (24h)', value: String(data.aiConversations24h) },
        { label: 'Cron Runs (24h)', value: String(data.cronRuns24h) },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="mt-1 text-sm text-text-muted">Overview of your bot activity and performance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-background-elevated p-4">
            <p className="text-xs font-medium text-text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="col-span-full rounded-xl border border-white/5 bg-background-elevated p-8 text-center">
            <p className="text-sm text-text-muted">No analytics data available yet.</p>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Chat Activity</h3>
          <p className="mt-1 text-xs text-text-muted">Messages over time</p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Messages over time</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Moderation Activity</h3>
          <p className="mt-1 text-xs text-text-muted">Actions taken over time</p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Moderation actions over time</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Chat Analytics', href: '/analytics/chat', description: 'Detailed message and chat statistics' },
          { label: 'Moderation Analytics', href: '/analytics/moderation', description: 'Rule triggers and enforcement data' },
          { label: 'AI Analytics', href: '/analytics/ai', description: 'Conversation and token usage metrics' },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-xl border border-white/5 bg-background-elevated p-4 hover:border-white/10 transition-colors"
          >
            <h3 className="text-sm font-semibold text-text-primary">{link.label}</h3>
            <p className="mt-1 text-xs text-text-muted">{link.description}</p>
            <p className="mt-2 text-xs font-medium text-accent-primary">View details &rarr;</p>
          </a>
        ))}
      </div>
    </div>
  );
}
