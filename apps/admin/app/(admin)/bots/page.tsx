'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

interface Bot {
  id: string;
  tenant: string;
  platform: string;
  status: string;
  uptime: string;
  memory: string;
  throughput: string;
  lastError: string | null;
}

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
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBots() {
      try {
        setLoading(true);
        setError(null);
        const data = await authApi<Bot[]>('/admin/bots');
        if (!cancelled) {
          setBots(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load bots');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBots();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Bot Fleet</h1>
            <p className="mt-1 text-sm text-text-secondary">Manage all running bot instances.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-white/5 bg-background-elevated p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded bg-white/5" />
                <div className="h-5 w-20 rounded bg-white/5" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="h-8 rounded bg-white/5" />
                <div className="h-8 rounded bg-white/5" />
                <div className="h-8 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Bot Fleet</h1>
            <p className="mt-1 text-sm text-text-secondary">Manage all running bot instances.</p>
          </div>
        </div>
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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

      {bots.length === 0 ? (
        <div className="rounded-lg border border-white/5 bg-background-elevated p-10 text-center">
          <p className="text-sm text-text-muted">No bot instances found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bots.map((bot) => (
            <a
              key={bot.id}
              href={`/bots/${bot.id}`}
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
      )}
    </div>
  );
}
