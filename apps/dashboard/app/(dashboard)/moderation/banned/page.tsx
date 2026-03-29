'use client';

import { useState } from 'react';

interface BannedUser {
  id: number;
  username: string;
  platforms: ('twitch' | 'discord')[];
  banDate: string;
  reason: string;
  type: 'permanent' | 'temporary';
  expires: string | null;
}

const initialBanned: BannedUser[] = [
  { id: 1, username: 'toxic_user42', platforms: ['twitch', 'discord'], banDate: '2025-03-28', reason: 'Repeated hate speech', type: 'permanent', expires: null },
  { id: 2, username: 'raid_bot_7', platforms: ['discord'], banDate: '2025-03-28', reason: 'Bot raid detected', type: 'permanent', expires: null },
  { id: 3, username: 'scammer_link', platforms: ['discord'], banDate: '2025-03-28', reason: 'Phishing link detected', type: 'permanent', expires: null },
  { id: 4, username: 'night_troll', platforms: ['discord'], banDate: '2025-03-27', reason: 'Slurs and harassment', type: 'temporary', expires: '2025-04-27' },
  { id: 5, username: 'spam_king', platforms: ['twitch'], banDate: '2025-03-26', reason: 'Excessive link spam', type: 'temporary', expires: '2025-04-02' },
  { id: 6, username: 'hate_account_99', platforms: ['twitch', 'discord'], banDate: '2025-03-25', reason: 'Hate raid participation', type: 'permanent', expires: null },
  { id: 7, username: 'bot_network_3', platforms: ['discord'], banDate: '2025-03-24', reason: 'Automated spam network', type: 'permanent', expires: null },
  { id: 8, username: 'troll_streamer', platforms: ['twitch'], banDate: '2025-03-22', reason: 'Stream sniping + harassment', type: 'temporary', expires: '2025-04-22' },
];

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-500/10 text-purple-400',
  discord: 'bg-indigo-500/10 text-indigo-400',
};

export default function BannedUsersPage() {
  const [banned, setBanned] = useState<BannedUser[]>(initialBanned);

  const handleUnban = (id: number) => {
    setBanned((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Banned Users</h1>
        <p className="mt-1 text-sm text-text-muted">
          {banned.length} user{banned.length !== 1 ? 's' : ''} currently banned across all platforms.
        </p>
      </div>

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
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                    >
                      Unban
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
