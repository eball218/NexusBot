'use client';

import { useState, useEffect } from 'react';
import { authApi, ApiError } from '@/lib/api';

interface ModAction {
  id: number;
  timestamp: string;
  user: string;
  platform: 'twitch' | 'discord';
  actionType: 'warn' | 'timeout' | 'ban';
  reason: string;
  rule: string;
}

interface BannedUser {
  id: number;
}

interface Appeal {
  id: number;
  status: 'pending' | 'approved' | 'denied';
}

const actionColors: Record<string, string> = {
  warn: 'bg-warning/10 text-warning',
  timeout: 'bg-orange-500/10 text-orange-400',
  ban: 'bg-danger/10 text-danger',
};

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-500/10 text-purple-400',
  discord: 'bg-indigo-500/10 text-indigo-400',
};

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function ModerationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<ModAction[]>([]);
  const [bannedCount, setBannedCount] = useState(0);
  const [pendingAppeals, setPendingAppeals] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setError(null);
        const [actionsData, bannedData, appealsData] = await Promise.all([
          authApi<ModAction[]>('/moderation/actions'),
          authApi<BannedUser[]>('/moderation/banned'),
          authApi<Appeal[]>('/moderation/appeals'),
        ]);
        setActions(actionsData);
        setBannedCount(bannedData.length);
        setPendingAppeals(appealsData.filter((a) => a.status === 'pending').length);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load moderation data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = [
    { label: 'Total Actions (24h)', value: String(actions.length) },
    { label: 'Active Bans', value: String(bannedCount) },
    { label: 'Pending Appeals', value: String(pendingAppeals) },
    { label: 'Auto-filtered Messages', value: String(actions.filter((a) => a.actionType === 'warn').length) },
  ];

  const recentActions = actions.slice(0, 6);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Moderation</h1>
          <p className="mt-1 text-sm text-text-muted">Overview of moderation activity across platforms.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Moderation</h1>
        <p className="mt-1 text-sm text-text-muted">Overview of moderation activity across platforms.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-background-elevated p-4">
            <p className="text-xs font-medium text-text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Mod Actions */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Recent Mod Actions</h3>
          <a href="/moderation/actions" className="text-xs font-medium text-accent-primary hover:underline">
            View all
          </a>
        </div>
        <div className="mt-4 space-y-3">
          {recentActions.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">{item.user}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[item.platform]}`}>
                    {item.platform}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {item.reason} &middot; Rule: {item.rule}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${actionColors[item.actionType]}`}>
                {item.actionType}
              </span>
              <span className="text-xs text-text-muted whitespace-nowrap">{timeAgo(item.timestamp)}</span>
            </div>
          ))}
          {recentActions.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">No recent actions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
