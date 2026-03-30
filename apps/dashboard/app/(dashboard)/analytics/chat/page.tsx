'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

type TopChatter = {
  name: string;
  messages: number;
  platform: string;
};

type ChatAnalytics = {
  topChatters: TopChatter[];
};

export default function ChatAnalyticsPage() {
  const [data, setData] = useState<ChatAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await authApi<ChatAnalytics>('/analytics/chat');
        setData(res);
      } catch {
        // silently fall back to empty
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  const topChatters = data?.topChatters ?? [];

  return (
    <div className="space-y-6">
      <div>
        <a href="/analytics" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Analytics</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Chat Analytics</h1>
        <p className="mt-1 text-sm text-text-muted">Detailed messaging statistics across platforms</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages Over Time */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Messages Over Time</h3>
          <p className="mt-1 text-xs text-text-muted">Last 30 days</p>
          <div className="mt-4 flex h-56 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Messages over time (line chart)</p>
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Peak Hours</h3>
          <p className="mt-1 text-xs text-text-muted">Activity heatmap by hour and day</p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Peak hours heatmap</p>
          </div>
        </div>

        {/* Top Chatters */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Top Chatters</h3>
          <p className="mt-1 text-xs text-text-muted">Most active users this month</p>
          <div className="mt-4 space-y-2">
            {topChatters.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">No chat data available yet.</p>
            ) : (
              topChatters.map((user, i) => (
                <div key={user.name} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-text-muted w-4">{i + 1}</span>
                    <span className="text-sm text-text-primary">{user.name}</span>
                    <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-medium ${
                      user.platform === 'Discord' ? 'bg-[#5865F2]/10 text-[#5865F2]' : 'bg-[#9146FF]/10 text-[#9146FF]'
                    }`}>{user.platform}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{user.messages} msgs</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Platform Split */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Platform Split</h3>
          <p className="mt-1 text-xs text-text-muted">Message distribution by platform</p>
          <div className="mt-4 flex h-40 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Platform split (pie/donut chart)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
