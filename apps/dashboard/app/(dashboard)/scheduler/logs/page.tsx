'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

type LogEntryRaw = {
  id: string;
  jobId: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  error: string | null;
  result: string | null;
};

type LogEntry = {
  id: string;
  job: string;
  startedAt: string;
  duration: string;
  status: string;
  error: string | null;
};

function formatDuration(start: string, end: string | null): string {
  if (!end) return 'Running...';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

function mapLog(raw: LogEntryRaw): LogEntry {
  return {
    id: raw.id,
    job: raw.jobId.slice(0, 8) + '...',
    startedAt: formatTimestamp(raw.startedAt),
    duration: formatDuration(raw.startedAt, raw.completedAt),
    status: raw.status,
    error: raw.error,
  };
}

export default function SchedulerLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await authApi<LogEntryRaw[]>('/scheduler/logs');
      setLogs(data.map(mapLog));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

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
        <a href="/scheduler" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Scheduler</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Execution Logs</h1>
        <p className="mt-1 text-sm text-text-muted">History of cron job executions</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Job Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Started At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <>
                <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-text-primary">{log.job}</td>
                  <td className="px-4 py-3 text-text-secondary font-mono text-xs">{log.startedAt}</td>
                  <td className="px-4 py-3 text-text-secondary">{log.duration}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        log.status === 'success'
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {log.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.error ? (
                      <button
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        className="text-xs text-danger hover:underline"
                      >
                        {expandedId === log.id ? 'Hide' : 'View error'}
                      </button>
                    ) : (
                      <span className="text-xs text-text-muted">&mdash;</span>
                    )}
                  </td>
                </tr>
                {expandedId === log.id && log.error && (
                  <tr key={`${log.id}-error`}>
                    <td colSpan={5} className="bg-danger/5 px-4 py-3">
                      <p className="text-xs font-mono text-danger">{log.error}</p>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {logs.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-text-muted">
                  No execution logs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
