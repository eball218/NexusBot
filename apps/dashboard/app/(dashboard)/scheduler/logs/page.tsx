'use client';

import { useState } from 'react';

const logs = [
  { id: 1, job: 'Daily Stats Post', startedAt: '2026-03-28 09:00:02', duration: '1.2s', status: 'success', error: null },
  { id: 2, job: 'Weekly Recap', startedAt: '2026-03-24 12:00:01', duration: '3.8s', status: 'success', error: null },
  { id: 3, job: 'Hourly Chat Purge', startedAt: '2026-03-28 15:00:00', duration: '0.4s', status: 'failed', error: 'Channel not found: #old-chat. The channel may have been deleted or the bot lacks permission.' },
  { id: 4, job: 'Stream Reminder', startedAt: '2026-03-28 18:00:01', duration: '0.9s', status: 'success', error: null },
  { id: 5, job: 'Follower Milestone Check', startedAt: '2026-03-28 16:00:00', duration: '2.1s', status: 'success', error: null },
  { id: 6, job: 'Daily Stats Post', startedAt: '2026-03-27 09:00:03', duration: '1.1s', status: 'success', error: null },
  { id: 7, job: 'Hourly Chat Purge', startedAt: '2026-03-28 14:00:00', duration: '0.3s', status: 'failed', error: 'Channel not found: #old-chat. The channel may have been deleted or the bot lacks permission.' },
  { id: 8, job: 'Nightly Backup Export', startedAt: '2026-03-28 03:00:00', duration: '12.4s', status: 'success', error: null },
];

export default function SchedulerLogsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <a href="/scheduler" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Scheduler</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Execution Logs</h1>
        <p className="mt-1 text-sm text-text-muted">History of cron job executions</p>
      </div>

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
          </tbody>
        </table>
      </div>
    </div>
  );
}
