'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LogEntry = {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  platform: string;
};

const levelStyles: Record<LogLevel, string> = {
  info: 'bg-accent-primary/10 text-accent-primary',
  warn: 'bg-warning/10 text-warning',
  error: 'bg-danger/10 text-danger',
  debug: 'bg-white/5 text-text-muted',
};

export default function LogViewerPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());

  const fetchLogs = useCallback(async () => {
    try {
      const data = await authApi<LogEntry[]>('/moderation/actions');
      // Map mod actions to log entries, normalizing fields as needed
      const mapped: LogEntry[] = data.map((entry: Record<string, unknown>, i: number) => ({
        id: (entry.id as string) || String(i),
        timestamp: (entry.timestamp as string) || (entry.createdAt as string) || '',
        level: (entry.level as LogLevel) || 'info',
        message: (entry.message as string) || (entry.reason as string) || (entry.action as string) || '',
        platform: (entry.platform as string) || 'System',
      }));
      setLogs(mapped);
    } catch {
      // keep existing logs on error
    } finally {
      setLoading(false);
      setLastRefresh(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const filtered = logs.filter((log) => {
    const matchesSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) || log.platform.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

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
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${levelStyles[log.level] || levelStyles.info}`}>
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
