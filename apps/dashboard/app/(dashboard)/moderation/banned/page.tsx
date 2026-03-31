'use client';

import { useState, useEffect } from 'react';
import { authApi, ApiError } from '@/lib/api';

interface BannedUserRaw {
  id: string;
  twitchUsername: string | null;
  discordUsername: string | null;
  twitchId: string | null;
  discordId: string | null;
  isBanned: boolean;
  notes: string | null;
  firstSeenAt: string;
  lastSeenAt: string | null;
}

interface BannedUser {
  id: string;
  username: string;
  platforms: ('twitch' | 'discord')[];
  banDate: string;
  reason: string;
  type: 'permanent';
  expires: string | null;
}

function mapBannedUser(raw: BannedUserRaw): BannedUser {
  const platforms: ('twitch' | 'discord')[] = [];
  if (raw.twitchId) platforms.push('twitch');
  if (raw.discordId) platforms.push('discord');
  return {
    id: raw.id,
    username: raw.twitchUsername || raw.discordUsername || 'Unknown',
    platforms,
    banDate: new Date(raw.firstSeenAt).toLocaleDateString(),
    reason: raw.notes || 'No reason provided',
    type: 'permanent',
    expires: null,
  };
}

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-500/10 text-purple-400',
  discord: 'bg-indigo-500/10 text-indigo-400',
};

export default function BannedUsersPage() {
  const [banned, setBanned] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unbanningId, setUnbanningId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanned = async () => {
      try {
        setError(null);
        const data = await authApi<BannedUserRaw[]>('/moderation/banned');
        setBanned(data.map(mapBannedUser));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load banned users');
      } finally {
        setLoading(false);
      }
    };
    fetchBanned();
  }, []);

  const handleUnban = async (id: string) => {
    setUnbanningId(id);
    try {
      await authApi(`/moderation/banned/${id}/unban`, { method: 'POST' });
      setBanned((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to unban user');
    } finally {
      setUnbanningId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Banned Users</h1>
          <p className="mt-1 text-sm text-text-muted">Loading banned users...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Banned Users</h1>
        <p className="mt-1 text-sm text-text-muted">
          {banned.length} user{banned.length !== 1 ? 's' : ''} currently banned across all platforms.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Username</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Platform(s)</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Ban Date</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Reason</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted">Expires</th>
                <th className="px-4 py-3 text-xs font-medium text-text-muted"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {banned.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{user.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {user.platforms.map((p) => (
                        <span key={p} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[p]}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted font-mono whitespace-nowrap">{user.banDate}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">{user.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.type === 'permanent'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {user.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted font-mono whitespace-nowrap">
                    {user.expires ?? '--'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUnban(user.id)}
                      disabled={unbanningId === user.id}
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors disabled:opacity-50"
                    >
                      {unbanningId === user.id ? 'Unbanning...' : 'Unban'}
                    </button>
                  </td>
                </tr>
              ))}
              {banned.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-text-muted">
                    No banned users.
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
