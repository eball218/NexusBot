'use client';

import { useState } from 'react';

interface Appeal {
  id: number;
  username: string;
  platform: 'twitch' | 'discord';
  banDate: string;
  banReason: string;
  appealMessage: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
}

const initialAppeals: Appeal[] = [
  {
    id: 1,
    username: 'night_troll',
    platform: 'discord',
    banDate: '2025-03-27',
    banReason: 'Slurs and harassment',
    appealMessage: 'I sincerely apologize for my behavior. I was frustrated after a bad day and took it out on others in the chat. I understand my words were harmful and I promise to follow community guidelines going forward.',
    status: 'pending',
    submittedAt: '2025-03-28 10:15',
  },
  {
    id: 2,
    username: 'spam_king',
    platform: 'twitch',
    banDate: '2025-03-26',
    banReason: 'Excessive link spam',
    appealMessage: 'I was sharing links to a community project and didn\'t realize I was breaking rules. I\'ll limit my link sharing if unbanned.',
    status: 'pending',
    submittedAt: '2025-03-28 08:42',
  },
  {
    id: 3,
    username: 'troll_streamer',
    platform: 'twitch',
    banDate: '2025-03-22',
    banReason: 'Stream sniping + harassment',
    appealMessage: 'I want to appeal my ban. I was not stream sniping -- I happened to be in the same game. The harassment accusation was a misunderstanding. Please review the VODs.',
    status: 'pending',
    submittedAt: '2025-03-27 22:30',
  },
  {
    id: 4,
    username: 'old_user123',
    platform: 'discord',
    banDate: '2025-03-15',
    banReason: 'Posting NSFW content in SFW channel',
    appealMessage: 'I accidentally posted in the wrong channel. It was not intentional. I have been a community member for 2 years.',
    status: 'approved',
    submittedAt: '2025-03-16 09:00',
  },
  {
    id: 5,
    username: 'bad_actor_55',
    platform: 'discord',
    banDate: '2025-03-10',
    banReason: 'Doxxing attempt',
    appealMessage: 'It was just a joke bro, I didn\'t actually share real info.',
    status: 'denied',
    submittedAt: '2025-03-11 14:20',
  },
];

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  denied: 'bg-danger/10 text-danger',
};

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-500/10 text-purple-400',
  discord: 'bg-indigo-500/10 text-indigo-400',
};

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>(initialAppeals);

  const handleAction = (id: number, action: 'approved' | 'denied') => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: action } : a))
    );
  };

  const pending = appeals.filter((a) => a.status === 'pending');
  const resolved = appeals.filter((a) => a.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Ban Appeals</h1>
        <p className="mt-1 text-sm text-text-muted">
          {pending.length} pending appeal{pending.length !== 1 ? 's' : ''} to review.
        </p>
      </div>

      {/* Pending Appeals */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary">Pending Review</h2>
          {pending.map((appeal) => (
            <div key={appeal.id} className="rounded-xl border border-white/5 bg-background-elevated p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-text-primary">
                    {appeal.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{appeal.username}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[appeal.platform]}`}>
                        {appeal.platform}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[appeal.status]}`}>
                        {appeal.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Banned {appeal.banDate} &middot; Submitted {appeal.submittedAt}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">Ban Reason</p>
                  <p className="text-sm text-danger">{appeal.banReason}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-muted mb-1">Appeal Message</p>
                  <p className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-sm text-text-secondary leading-relaxed">
                    {appeal.appealMessage}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => handleAction(appeal.id, 'denied')}
                  className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-1.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
                >
                  Deny
                </button>
                <button
                  onClick={() => handleAction(appeal.id, 'approved')}
                  className="rounded-lg bg-success px-4 py-1.5 text-xs font-medium text-white hover:bg-success/90 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved Appeals */}
      {resolved.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-secondary">Resolved</h2>
          {resolved.map((appeal) => (
            <div key={appeal.id} className="rounded-xl border border-white/5 bg-background-elevated p-5 opacity-60">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-text-primary">
                    {appeal.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{appeal.username}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[appeal.platform]}`}>
                        {appeal.platform}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[appeal.status]}`}>
                        {appeal.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Banned {appeal.banDate} &middot; {appeal.banReason}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="rounded-lg bg-white/[0.03] border border-white/5 p-3 text-sm text-text-muted leading-relaxed">
                  {appeal.appealMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {appeals.length === 0 && (
        <div className="rounded-xl border border-white/5 bg-background-elevated p-8 text-center">
          <p className="text-sm text-text-muted">No appeals to display.</p>
        </div>
      )}
    </div>
  );
}
