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

const actionTypeColors: Record<string, string> = {
  warn: 'bg-warning/10 text-warning',
  timeout: 'bg-orange-500/10 text-orange-400',
  ban: 'bg-danger/10 text-danger',
};

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-500/10 text-purple-400',
  discord: 'bg-indigo-500/10 text-indigo-400',
};

export default function ModerationActionsPage() {
  const [allActions, setAllActions] = useState<ModAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setError(null);
        const data = await authApi<ModAction[]>('/moderation/actions');
        setAllActions(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load actions');
      } finally {
        setLoading(false);
      }
    };
    fetchActions();
  }, []);

  const filtered = allActions.filter((a) => {
    if (platformFilter !== 'all' && a.platform !== platformFilter) return false;
    if (actionFilter !== 'all' && a.actionType !== actionFilter) return false;
    if (dateFrom && a.timestamp < dateFrom) return false;
    if (dateTo && a.timestamp > dateTo + ' 23:59') return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mod Action Log</h1>
          <p className="mt-1 text-sm text-text-muted">Complete history of all moderation actions.</p>
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
        <h1 className="text-2xl font-bold text-text-primary">Mod Action Log</h1>
        <p className="mt-1 text-sm text-text-muted">Complete history of all moderation actions.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-white/5 bg-background-elevated p-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Platform</label>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="twitch">Twitch</option>
            <option value="discord">Discord</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Action Type</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="warn">Warn</option>
            <option value="timeout">Timeout</option>
            <option value="ban">Ban</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Timestamp</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">User</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Platform</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Action</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Reason</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((action) => (
                <tr key={action.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap font-mono">{action.timestamp}</td>
                  <td className="px-4 py-3 text-sm text-text-primary font-medium">{action.user}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[action.platform]}`}>
                      {action.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${actionTypeColors[action.actionType]}`}>
                      {action.actionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">{action.reason}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{action.rule}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">
                    No actions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
