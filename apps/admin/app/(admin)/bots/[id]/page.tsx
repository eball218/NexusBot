export default function BotDetailPage({ params }: { params: { id: string } }) {
  const bot = {
    tenant: 'Acme Gaming',
    platform: 'Discord',
    status: 'running',
    uptime: '14d 6h 32m',
    processId: 'proc-a1b2c3d4',
    messagesPerHour: 1240,
    memoryMb: 128,
    cpuPercent: 12.4,
    personalityName: 'Friendly Gamer Bot',
    ruleCount: 8,
    cronCount: 3,
  };

  const errors = [
    { timestamp: '2026-03-25 14:32:01', level: 'error', message: 'WebSocket reconnect failed — retrying in 5s' },
    { timestamp: '2026-03-24 09:11:44', level: 'warn', message: 'Rate limit approaching on /api/messages endpoint' },
    { timestamp: '2026-03-22 18:05:12', level: 'error', message: 'AI response timeout after 30000ms' },
    { timestamp: '2026-03-20 03:22:58', level: 'error', message: 'Memory threshold exceeded — restarting worker' },
    { timestamp: '2026-03-18 11:45:33', level: 'warn', message: 'Duplicate message ID detected — skipping' },
  ];

  const statusColor =
    bot.status === 'running' ? 'text-success' : bot.status === 'starting' ? 'text-warning' : 'text-danger';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-text-muted">Bot #{params.id}</p>
        <h1 className="text-2xl font-bold text-text-primary">{bot.tenant}</h1>
      </div>

      {/* Bot Info Card */}
      <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Bot Info</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <p className="text-xs text-text-muted">Tenant</p>
            <p className="mt-0.5 text-sm text-text-primary">{bot.tenant}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Platform</p>
            <p className="mt-0.5 text-sm text-text-primary">
              <span className={bot.platform === 'Discord' ? 'text-discord' : 'text-twitch'}>
                {bot.platform}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Status</p>
            <p className={`mt-0.5 text-sm font-medium capitalize ${statusColor}`}>{bot.status}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Uptime</p>
            <p className="mt-0.5 text-sm text-text-primary">{bot.uptime}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Process ID</p>
            <p className="mt-0.5 font-mono text-sm text-text-secondary">{bot.processId}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
          <p className="text-sm text-text-muted">Messages / hr</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">{bot.messagesPerHour.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
          <p className="text-sm text-text-muted">Memory</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">{bot.memoryMb} MB</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
          <p className="text-sm text-text-muted">CPU</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">{bot.cpuPercent}%</p>
        </div>
      </div>

      {/* Error History */}
      <div className="rounded-lg border border-white/5 bg-background-elevated">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Error History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-text-muted">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Level</th>
                <th className="px-5 py-3 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-text-muted">{e.timestamp}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.level === 'error' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {e.level}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Configuration Summary</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-text-muted">Personality</p>
            <p className="mt-0.5 text-sm text-text-primary">{bot.personalityName}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Moderation Rules</p>
            <p className="mt-0.5 text-sm text-text-primary">{bot.ruleCount} active</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Scheduled Jobs</p>
            <p className="mt-0.5 text-sm text-text-primary">{bot.cronCount} active</p>
          </div>
        </div>
      </div>

      {/* Manual Controls */}
      <div className="flex flex-wrap gap-3">
        <button className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/80">
          Restart Bot
        </button>
        <button className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20">
          Stop Bot
        </button>
        <button className="rounded-lg border border-white/5 bg-background-elevated px-4 py-2 text-sm font-medium text-text-primary hover:bg-white/5">
          View Logs
        </button>
      </div>
    </div>
  );
}
