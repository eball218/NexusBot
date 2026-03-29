'use client';

import { useState } from 'react';

const allLogs = [
  { timestamp: '2026-03-28 12:04:22', service: 'API', level: 'info', message: 'GET /api/v1/tenants 200 OK (12ms)', tenantId: '--' },
  { timestamp: '2026-03-28 12:03:58', service: 'Bot', level: 'error', message: 'WebSocket connection lost for tenant t-004, reconnecting...', tenantId: 't-004' },
  { timestamp: '2026-03-28 12:03:45', service: 'Redis', level: 'warn', message: 'Memory usage at 78% — consider scaling', tenantId: '--' },
  { timestamp: '2026-03-28 12:03:30', service: 'DB', level: 'info', message: 'Migration 20260328_add_index applied successfully', tenantId: '--' },
  { timestamp: '2026-03-28 12:02:11', service: 'API', level: 'error', message: 'POST /api/v1/messages 500 Internal Server Error', tenantId: 't-007' },
  { timestamp: '2026-03-28 12:01:44', service: 'Bot', level: 'info', message: 'Bot instance started for tenant t-002', tenantId: 't-002' },
  { timestamp: '2026-03-28 12:01:02', service: 'API', level: 'warn', message: 'Rate limit threshold reached for tenant t-008', tenantId: 't-008' },
  { timestamp: '2026-03-28 12:00:30', service: 'DB', level: 'info', message: 'Connection pool: 12/50 active connections', tenantId: '--' },
  { timestamp: '2026-03-28 11:59:58', service: 'Bot', level: 'error', message: 'AI response timeout for tenant t-003 after 30000ms', tenantId: 't-003' },
  { timestamp: '2026-03-28 11:59:12', service: 'Redis', level: 'info', message: 'Cache hit ratio: 94.2% over last hour', tenantId: '--' },
];

const levelBadge = (level: string) => {
  const cls =
    level === 'error'
      ? 'bg-danger/10 text-danger'
      : level === 'warn'
        ? 'bg-warning/10 text-warning'
        : 'bg-accent-primary/10 text-accent-primary';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{level}</span>;
};

const serviceBadge = (service: string) => {
  const colors: Record<string, string> = {
    API: 'bg-accent-primary/10 text-accent-primary',
    Bot: 'bg-accent-secondary/10 text-accent-secondary',
    Redis: 'bg-danger/10 text-danger',
    DB: 'bg-success/10 text-success',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[service] || 'bg-white/5 text-text-muted'}`}>
      {service}
    </span>
  );
};

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const filtered = allLogs.filter((l) => {
    if (serviceFilter !== 'all' && l.service !== serviceFilter) return false;
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">System Logs</h1>
        <p className="mt-1 text-sm text-text-secondary">Aggregated logs across all services.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search log messages..."
          className="flex-1 rounded-lg border border-white/5 bg-background-elevated px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-lg border border-white/5 bg-background-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
        >
          <option value="all">All Services</option>
          <option value="API">API</option>
          <option value="Bot">Bot</option>
          <option value="Redis">Redis</option>
          <option value="DB">DB</option>
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="rounded-lg border border-white/5 bg-background-elevated px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
        >
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-elevated">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-text-muted">
              <th className="px-5 py-3 font-medium">Timestamp</th>
              <th className="px-5 py-3 font-medium">Service</th>
              <th className="px-5 py-3 font-medium">Level</th>
              <th className="px-5 py-3 font-medium">Message</th>
              <th className="px-5 py-3 font-medium">Tenant ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0">
                <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-text-muted">{l.timestamp}</td>
                <td className="px-5 py-3">{serviceBadge(l.service)}</td>
                <td className="px-5 py-3">{levelBadge(l.level)}</td>
                <td className="px-5 py-3 text-text-secondary">{l.message}</td>
                <td className="px-5 py-3 font-mono text-xs text-text-muted">{l.tenantId}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                  No logs match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
