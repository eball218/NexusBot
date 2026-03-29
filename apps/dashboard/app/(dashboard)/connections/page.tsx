'use client';

import { useState, useEffect } from 'react';
import { authApi, ApiError } from '@/lib/api';

interface Connection {
  id: string;
  platform: 'twitch' | 'discord';
  platformUsername?: string;
  platformId?: string;
  status: string;
}

const OAUTH_URLS: Record<string, string> = {
  discord:
    'https://discord.com/api/oauth2/authorize?client_id=1487664355901177977&redirect_uri=http://localhost:3000/api/auth/callback/discord&response_type=code&scope=identify+email+guilds+bot',
  twitch:
    'https://id.twitch.tv/oauth2/authorize?client_id=f5u2x188rr9bvkel95ly333z65vh5w&redirect_uri=http://localhost:3000/api/auth/callback/twitch&response_type=code&scope=user:read:email',
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConnections() {
      try {
        const data = await authApi<Connection[]>('/connections');
        setConnections(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.href = 'http://localhost:3000/login';
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load connections');
      } finally {
        setLoading(false);
      }
    }
    fetchConnections();
  }, []);

  async function handleDisconnect(platform: string) {
    setDisconnecting(platform);
    try {
      await authApi(`/connections/${platform}`, { method: 'DELETE' });
      setConnections((prev) => prev.filter((c) => c.platform !== platform));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = 'http://localhost:3000/login';
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  }

  const twitchConnection = connections.find((c) => c.platform === 'twitch');
  const discordConnection = connections.find((c) => c.platform === 'discord');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Connections</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your platform integrations</p>
        </div>
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Connections</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your platform integrations</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Twitch Card */}
        <div className="rounded-xl border border-[#9146FF]/20 bg-background-elevated p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9146FF]/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#9146FF]" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Twitch</h2>
              {twitchConnection ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-success">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-text-muted" />
                  <span className="text-xs text-text-muted">Not connected</span>
                </div>
              )}
            </div>
          </div>

          {twitchConnection ? (
            <>
              <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-text-muted">Channel</p>
                <p className="text-sm font-medium text-text-primary">
                  {twitchConnection.platformUsername ?? 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a href="/connections/twitch" className="rounded-lg bg-[#9146FF] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                  Settings
                </a>
                <button
                  onClick={() => handleDisconnect('twitch')}
                  disabled={disconnecting === 'twitch'}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 disabled:opacity-50"
                >
                  {disconnecting === 'twitch' ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </>
          ) : (
            <a
              href={OAUTH_URLS.twitch}
              className="inline-block rounded-lg bg-[#9146FF] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Connect Twitch
            </a>
          )}
        </div>

        {/* Discord Card */}
        <div className="rounded-xl border border-[#5865F2]/20 bg-background-elevated p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2]/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#5865F2]" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Discord</h2>
              {discordConnection ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-success">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-text-muted" />
                  <span className="text-xs text-text-muted">Not connected</span>
                </div>
              )}
            </div>
          </div>

          {discordConnection ? (
            <>
              <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-text-muted">Server</p>
                <p className="text-sm font-medium text-text-primary">
                  {discordConnection.platformUsername ?? 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a href="/connections/discord" className="rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                  Settings
                </a>
                <button
                  onClick={() => handleDisconnect('discord')}
                  disabled={disconnecting === 'discord'}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-text-secondary hover:bg-white/5 disabled:opacity-50"
                >
                  {disconnecting === 'discord' ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </>
          ) : (
            <a
              href={OAUTH_URLS.discord}
              className="inline-block rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Connect Discord
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
