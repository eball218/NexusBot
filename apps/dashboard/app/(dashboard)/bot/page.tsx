'use client';

import { useState } from 'react';

const initialStatus = {
  online: true,
  platform: 'Discord',
  uptime: '14h 32m',
  lastActivity: '2 minutes ago',
  messagesHandled: 1247,
  activeUsers: 38,
};

export default function BotManagementPage() {
  const [botStatus, setBotStatus] = useState(initialStatus);
  const [isOnline, setIsOnline] = useState(botStatus.online);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function simulateAction(action: string) {
    setActionLoading(action);
    setTimeout(() => {
      if (action === 'stop') setIsOnline(false);
      if (action === 'start') setIsOnline(true);
      if (action === 'restart') {
        setIsOnline(false);
        setTimeout(() => setIsOnline(true), 600);
      }
      setActionLoading(null);
    }, 800);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Bot Management</h1>

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
                  ? `Connected to ${botStatus.platform}`
                  : 'Bot is not running'}
              </p>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={() => simulateAction(isOnline ? 'stop' : 'start')}
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
          { label: 'Platform', value: botStatus.platform },
          { label: 'Uptime', value: isOnline ? botStatus.uptime : '--' },
          { label: 'Last Activity', value: botStatus.lastActivity },
          { label: 'Messages Handled', value: botStatus.messagesHandled.toLocaleString() },
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
            onClick={() => simulateAction('start')}
            disabled={isOnline || actionLoading !== null}
            className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading === 'start' ? 'Starting...' : 'Start Bot'}
          </button>
          <button
            onClick={() => simulateAction('stop')}
            disabled={!isOnline || actionLoading !== null}
            className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionLoading === 'stop' ? 'Stopping...' : 'Stop Bot'}
          </button>
          <button
            onClick={() => simulateAction('restart')}
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
        <div className="mt-4 space-y-3">
          {[
            { time: '2m ago', event: 'Responded to @viewer_fan in #general', type: 'ai' },
            { time: '5m ago', event: 'Auto-moderated spam message', type: 'mod' },
            { time: '12m ago', event: 'Cron job "daily-stats" completed', type: 'cron' },
            { time: '30m ago', event: 'Bot reconnected after brief disconnect', type: 'system' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div className={`mt-0.5 h-2 w-2 rounded-full ${
                item.type === 'mod' ? 'bg-warning' : item.type === 'ai' ? 'bg-accent-primary' : item.type === 'cron' ? 'bg-success' : 'bg-text-muted'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-text-secondary">{item.event}</p>
                <p className="text-xs text-text-muted">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
