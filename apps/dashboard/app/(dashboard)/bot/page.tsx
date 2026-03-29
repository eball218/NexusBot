'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi, ApiError } from '@/lib/api';
import { WEB_URL } from '@/lib/constants';

interface BotStatus {
  status: string;
  platform?: string;
  uptime?: number;
  lastActivity?: string;
  messagesHandled?: number;
  activeUsers?: number;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function BotManagementPage() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOnline = botStatus?.status === 'running' || botStatus?.status === 'online';

  const fetchStatus = useCallback(async () => {
    try {
      const status = await authApi<BotStatus>('/bot/status');
      setBotStatus(status);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = `${WEB_URL}/login`;
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load bot status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleAction(action: 'start' | 'stop' | 'restart') {
    setActionLoading(action);
    try {
      await authApi(`/bot/${action}`, { method: 'POST' });
      // Re-fetch status after action completes
      await fetchStatus();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = `${WEB_URL}/login`;
        return;
      }
      setError(err instanceof Error ? err.message : `Failed to ${action} bot`);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  if (error && !botStatus) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Bot Management</h1>
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); fetchStatus(); }}
            className="mt-3 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Bot Management</h1>

      {error && (
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Status Card */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`h-4 w-4 rounded-full ${isOnline ? 'bg-success' : 'bg-text-muted'}`} />
              {isOnline && (
                <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-success/50" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isOnline ? 'Online' : 'Offline'}
              </h2>
              <p className="text-sm text-text-muted">
                {isOnline
                  ? `Connected to ${botStatus?.platform ?? 'platform'}`
                  : 'Bot is not running'}
              </p>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={() => handleAction(isOnline ? 'stop' : 'start')}
            disabled={actionLoading !== null}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              isOnline ? 'bg-success' : 'bg-white/10'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isOnline ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Platform', value: botStatus?.platform ?? '--' },
          { label: 'Uptime', value: isOnline && botStatus?.uptime != null ? formatUptime(botStatus.uptime) : '--' },
          { label: 'Last Activity', value: botStatus?.lastActivity ?? '--' },
          { label: 'Messages Handled', value: botStatus?.messagesHandled?.toLocaleString() ?? '--' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-background-elevated p-4">
            <p className="text-xs font-medium text-text-muted">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-text-primary">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => handleAction('start')}
            disabled={isOnline || actionLoading !== null}
            className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading === 'start' ? 'Starting...' : 'Start Bot'}
          </button>
          <button
            onClick={() => handleAction('stop')}
            disabled={!isOnline || actionLoading !== null}
            className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading === 'stop' ? 'Stopping...' : 'Stop Bot'}
          </button>
          <button
            onClick={() => handleAction('restart')}
            disabled={!isOnline || actionLoading !== null}
            className="rounded-lg bg-warning/10 px-4 py-2 text-sm font-medium text-warning hover:bg-warning/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading === 'restart' ? 'Restarting...' : 'Restart Bot'}
          </button>
        </div>
      </div>

      {/* Recent Events */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
        <h3 className="text-sm font-semibold text-text-primary">Recent Events</h3>
        <div className="mt-4">
          <p className="text-sm text-text-muted">No recent events to display.</p>
        </div>
      </div>
    </div>
  );
}
