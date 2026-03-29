'use client';

const bots = [
  { tenant: 'Acme Gaming', platform: 'Discord', status: 'running', uptime: '14d 6h', memory: '128 MB', throughput: '1,240 msg/hr', lastError: null },
  { tenant: 'StreamPro Inc', platform: 'Twitch', status: 'running', uptime: '7d 12h', memory: '96 MB', throughput: '890 msg/hr', lastError: null },
  { tenant: 'NightOwl Studios', platform: 'Discord', status: 'error', uptime: '0d 0h', memory: '0 MB', throughput: '0 msg/hr', lastError: 'ECONNREFUSED: Gateway connection failed at ws://discord.gg...' },
  { tenant: 'PixelForge', platform: 'Twitch', status: 'running', uptime: '3d 18h', memory: '112 MB', throughput: '2,100 msg/hr', lastError: null },
  { tenant: 'CloudNine Streams', platform: 'Discord', status: 'starting', uptime: '0d 0h', memory: '64 MB', throughput: '0 msg/hr', lastError: null },
  { tenant: 'BotLab Co', platform: 'Discord', status: 'running', uptime: '21d 3h', memory: '142 MB', throughput: '560 msg/hr', lastError: null },
  { tenant: 'GameVault', platform: 'Twitch', status: 'running', uptime: '10d 8h', memory: '88 MB', throughput: '1,780 msg/hr', lastError: null },
  { tenant: 'TurboChat', platform: 'Discord', status: 'error', uptime: '0d 0h', memory: '0 MB', throughput: '0 msg/hr', lastError: 'RateLimitError: 429 Too Many Requests from API endpoint...' },
  { tenant: 'Stellar Bots', platform: 'Twitch', status: 'running', uptime: '5d 22h', memory: '104 MB', throughput: '670 msg/hr', lastError: null },
];

const statusLight = (status: string) => {
  const color =
    status === 'running' ? 'bg-success' : status === 'starting' ? 'bg-warning' : 'bg-danger';
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
};

const platformBadge = (platform: string) => {
  const cls = platform === 'Discord' ? 'bg-discord/10 text-discord' : 'bg-twitch/10 text-twitch';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{platform}</span>;
};

export default function BotsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Bot Fleet</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage all running bot instances.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-white/5 bg-background-elevated px-4 py-2 text-sm font-medium text-text-primary hover:bg-white/5">
            Restart All
          </button>
          <button className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20">
            Stop All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bots.map((bot, i) => (
          <a
            key={i}
            href={`/bots/${i + 1}`}
            className="block rounded-lg border border-white/5 bg-background-elevated p-5 transition-colors hover:border-accent-primary/30"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-text-primary">{bot.tenant}</h3>
              <div className="flex items-center gap-2">
                {platformBadge(bot.platform)}
                {statusLight(bot.status)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-text-muted">Uptime</p>
                <p className="mt-0.5 text-sm font-medium text-text-primary">{bot.uptime}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Memory</p>
                <p className="mt-0.5 text-sm font-medium text-text-primary">{bot.memory}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Throughput</p>
                <p className="mt-0.5 text-sm font-medium text-text-primary">{bot.throughput}</p>
              </div>
            </div>
            {bot.lastError && (
              <p className="mt-3 truncate rounded bg-danger/5 px-2 py-1 text-xs text-danger">
                {bot.lastError}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
