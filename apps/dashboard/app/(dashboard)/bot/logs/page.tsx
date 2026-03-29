'use client';

import { useState, useEffect } from 'react';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogEntry = {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  platform: string;
};

const sampleLogs: LogEntry[] = [
  { id: '1', timestamp: '2026-03-28 10:15:32', level: 'info', message: 'Bot connected to Discord gateway', platform: 'Discord' },
  { id: '2', timestamp: '2026-03-28 10:15:30', level: 'info', message: 'Loaded 6 custom commands', platform: 'System' },
  { id: '3', timestamp: '2026-03-28 10:14:58', level: 'warn', message: 'Rate limit approaching for AI responses (4/5 per hour)', platform: 'System' },
  { id: '4', timestamp: '2026-03-28 10:14:12', level: 'info', message: 'AI response generated for user viewer_fan in #general', platform: 'Discord' },
  { id: '5', timestamp: '2026-03-28 10:13:45', level: 'error', message: 'Failed to fetch user profile: API timeout after 5000ms', platform: 'Twitch' },
  { id: '6', timestamp: '2026-03-28 10:12:30', level: 'debug', message: 'Memory store: 7 entries cached, 2 pending sync', platform: 'System' },
  { id: '7', timestamp: '2026-03-28 10:11:15', level: 'info', message: 'Cron job "daily-stats" executed successfully', platform: 'System' },
  { id: '8', timestamp: '2026-03-28 10:10:02', level: 'warn', message: 'Message from banned_user blocked by automod', platform: 'Discord' },
  { id: '9', timestamp: '2026-03-28 10:09:18', level: 'info', message: 'Command !help executed by gamer_pro', platform: 'Discord' },
  { id: '10', timestamp: '2026-03-28 10:08:44', level: 'error', message: 'Twitch EventSub subscription expired, re-subscribing', platform: 'Twitch' },
  { id: '11', timestamp: '2026-03-28 10:07:33', level: 'debug', message: 'Heartbeat sent to Discord gateway (ack: 42ms)', platform: 'Discord' },
  { id: '12', timestamp: '2026-03-28 10:06:10', level: 'info', message: 'User night_owl joined voice channel "Gaming"', platform: 'Discord' },
];

const levelStyles: Record<LogLevel, string> = {
  info: 'bg-accent-primary/10 text-accent-primary',
  warn: 'bg-warning/10 text-warning',
  error: 'bg-danger/10 text-danger',
  debug: 'bg-white/5 text-text-muted',
};

export default function LogViewerPage() {
  const [logs] = useState(sampleLogs);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filtered = logs.filter((log) => {
    const matchesSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) || log.platform.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Log Viewer</h1>
        <p className="text-xs text-text-muted">Last refresh: {lastRefresh}</p>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          >
            <option value="all" className="bg-background-elevated">All Levels</option>
            <option value="info" className="bg-background-elevated">Info</option>
            <option value="warn" className="bg-background-elevated">Warning</option>
            <option value="error" className="bg-background-elevated">Error</option>
            <option value="debug" className="bg-background-elevated">Debug</option>
          </select>

          {/* Auto-refresh toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Auto-refresh</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                autoRefresh ? 'bg-accent-primary' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  autoRefresh ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted">
        Showing {filtered.length} of {logs.length} entries
      </p>

      {/* Log Table */}
      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Platform</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap font-mono">
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${levelStyles[log.level]}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{log.message}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-muted">{log.platform}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-text-muted">
                    No log entries match your filters.
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
