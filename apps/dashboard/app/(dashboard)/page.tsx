'use client';

import { useState, useEffect } from 'react';
import { authApi, ApiError } from '@/lib/api';
import { WEB_URL } from '@/lib/constants';

interface BotStatus {
  status: string;
  platform?: string;
  uptime?: number;
}

interface AnalyticsOverview {
  messages24h: number;
  modActions24h: number;
  aiConversations24h: number;
  cronRuns24h: number;
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

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function DashboardHome() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bot, stats, user] = await Promise.all([
          authApi<BotStatus>('/bot/status').catch(() => ({ status: 'not_configured' }) as BotStatus),
          authApi<AnalyticsOverview>('/analytics/overview').catch(() => ({
            messages24h: 0,
            modActions24h: 0,
            aiConversations24h: 0,
            cronRuns24h: 0,
          }) as AnalyticsOverview),
          authApi<UserProfile>('/auth/me'),
        ]);
        setBotStatus(bot);
        setAnalytics(stats);
        setProfile(user);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = `${WEB_URL}/login`;
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
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
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
        <p className="text-sm text-danger">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/20"
        >
          Retry
        </button>
      </div>
    );
  }

  const isOnline = botStatus?.status === 'online' || botStatus?.status === 'running';
  const isNotConfigured = botStatus?.status === 'not_configured';
  const tier = profile?.tenant?.tier;

  const stats = [
    { label: 'Messages (24h)', value: (analytics?.messages24h ?? 0).toLocaleString() },
    { label: 'Mod Actions (24h)', value: (analytics?.modActions24h ?? 0).toLocaleString() },
    { label: 'AI Conversations (24h)', value: (analytics?.aiConversations24h ?? 0).toLocaleString() },
    { label: 'Cron Runs (24h)', value: (analytics?.cronRuns24h ?? 0).toLocaleString() },
  ];

  const usageItems = [
    {
      label: 'AI Messages',
      used: 0,
      max: tier?.limits?.aiMessagesPerHour ?? 0,
      unit: '/hr',
    },
    {
      label: 'Cron Jobs',
      used: 0,
      max: tier?.limits?.cronJobs ?? 0,
      unit: '',
    },
    {
      label: 'Memory',
      used: 0,
      max: tier?.limits?.memoryEnabled ? 1 : 0,
      unit: tier?.limits?.memoryEnabled ? '' : ' (upgrade required)',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      {/* Bot Status Card */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-success' : isNotConfigured ? 'bg-text-muted' : 'bg-danger'}`} />
              {isOnline && (
                <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-success/50" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Bot Status: {isNotConfigured ? 'Not Configured' : isOnline ? 'Online' : 'Offline'}
              </h2>
              <p className="text-sm text-text-muted">
                {isNotConfigured
                  ? 'Set up your bot in Connections'
                  : isOnline
                    ? `Connected to ${botStatus?.platform ?? 'platform'}${botStatus?.uptime ? ` \u00b7 Uptime: ${formatUptime(botStatus.uptime)}` : ''}`
                    : 'Bot is currently offline'}
              </p>
            </div>
          </div>
          {!isNotConfigured && (
            <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-secondary hover:bg-white/5">
              Restart Bot
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-background-elevated p-4">
            <p className="text-xs font-medium text-text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Activity Feed + Usage */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Feed (placeholder — requires WebSocket) */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {[
              { time: '2m ago', event: 'Moderated spam message from user123', type: 'mod' },
              { time: '5m ago', event: 'AI responded to @viewer_fan in #general', type: 'ai' },
              { time: '12m ago', event: 'Cron job "daily-stats" executed successfully', type: 'cron' },
              { time: '18m ago', event: 'Timeout applied to toxic_user (30min)', type: 'mod' },
              { time: '25m ago', event: 'AI conversation started with @newbie_gamer', type: 'ai' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className={`mt-0.5 h-2 w-2 rounded-full ${
                  item.type === 'mod' ? 'bg-warning' : item.type === 'ai' ? 'bg-accent-primary' : 'bg-success'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">{item.event}</p>
                  <p className="text-xs text-text-muted">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Meter */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Usage</h3>
          <p className="mt-1 text-xs text-text-muted">
            Plan: {tier?.name ?? 'Free'}
          </p>
          <div className="mt-4 space-y-4">
            {usageItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="text-text-secondary">{item.max > 0 ? `${item.used}/${item.max}${item.unit}` : `N/A${item.unit}`}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/5">
                  {item.max > 0 && (
                    <div
                      className="h-full rounded-full bg-accent-primary"
                      style={{ width: `${(item.used / item.max) * 100}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <a href="/billing/upgrade" className="mt-4 block text-center text-xs font-medium text-accent-primary hover:underline">
            Upgrade for more
          </a>
        </div>
      </div>
    </div>
  );
}
