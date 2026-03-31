'use client';

import { useState, useEffect } from 'react';
import { authApi, ApiError } from '@/lib/api';

interface AppealRaw {
  appeal: {
    id: string;
    modActionId: string;
    communityUserId: string;
    appealMessage: string;
    status: 'pending' | 'approved' | 'denied';
    resolvedBy: string | null;
    resolvedAt: string | null;
    resolutionNote: string | null;
    createdAt: string;
  };
  communityUser: {
    id: string;
    twitchUsername: string | null;
    discordUsername: string | null;
    twitchId: string | null;
    discordId: string | null;
  };
}

interface Appeal {
  id: string;
  username: string;
  platform: 'twitch' | 'discord';
  banDate: string;
  banReason: string;
  appealMessage: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
}

function mapAppeal(raw: AppealRaw): Appeal {
  const cu = raw.communityUser;
  return {
    id: raw.appeal.id,
    username: cu.twitchUsername || cu.discordUsername || 'Unknown',
    platform: cu.twitchId ? 'twitch' : 'discord',
    banDate: new Date(raw.appeal.createdAt).toLocaleDateString(),
    banReason: raw.appeal.resolutionNote || 'Moderation action',
    appealMessage: raw.appeal.appealMessage,
    status: raw.appeal.status,
    submittedAt: new Date(raw.appeal.createdAt).toLocaleDateString(),
  };
}

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
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setError(null);
        const data = await authApi<AppealRaw[]>('/moderation/appeals');
        setAppeals(data.map(mapAppeal));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load appeals');
      } finally {
        setLoading(false);
      }
    };
    fetchAppeals();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'denied') => {
    setUpdatingId(id);
    try {
      await authApi(`/moderation/appeals/${id}`, {
        method: 'PUT',
        body: { status: action },
      });
      setAppeals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: action } : a))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update appeal');
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = appeals.filter((a) => a.status === 'pending');
  const resolved = appeals.filter((a) => a.status !== 'pending');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ban Appeals</h1>
          <p className="mt-1 text-sm text-text-muted">Loading appeals...</p>
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
        <h1 className="text-2xl font-bold text-text-primary">Ban Appeals</h1>
        <p className="mt-1 text-sm text-text-muted">
          {pending.length} pending appeal{pending.length !== 1 ? 's' : ''} to review.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

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
                  disabled={updatingId === appeal.id}
                  className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-1.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                >
                  Deny
                </button>
                <button
                  onClick={() => handleAction(appeal.id, 'approved')}
                  disabled={updatingId === appeal.id}
                  className="rounded-lg bg-success px-4 py-1.5 text-xs font-medium text-white hover:bg-success/90 transition-colors disabled:opacity-50"
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
