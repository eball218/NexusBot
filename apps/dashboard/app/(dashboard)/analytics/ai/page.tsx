'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

type AIStat = {
  label: string;
  value: string;
};

type Topic = {
  topic: string;
  count: number;
  pct: number;
};

type AIAnalytics = {
  stats: AIStat[];
  topics: Topic[];
};

export default function AIAnalyticsPage() {
  const [data, setData] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await authApi<AIAnalytics>('/analytics/ai');
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

  const stats = data?.stats ?? [];
  const topics = data?.topics ?? [];

  return (
    <div className="space-y-6">
      <div>
        <a href="/analytics" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Analytics</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">AI Analytics</h1>
        <p className="mt-1 text-sm text-text-muted">AI conversation and usage metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/5 bg-background-elevated p-8 text-center">
            <p className="text-sm text-text-muted">No AI analytics data available yet.</p>
          </div>
        ) : (
          stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-background-elevated p-4">
              <p className="text-xs font-medium text-text-muted">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversations Per Day */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Conversations Per Day</h3>
          <p className="mt-1 text-xs text-text-muted">Last 14 days</p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Conversations per day (bar chart)</p>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Average Response Time</h3>
          <p className="mt-1 text-xs text-text-muted">Latency trend over time</p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Avg response time (line chart)</p>
          </div>
        </div>

        {/* Token Usage */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Token Usage</h3>
          <p className="mt-1 text-xs text-text-muted">Input vs output tokens over time</p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Token usage (stacked area chart)</p>
          </div>
        </div>

        {/* Most Discussed Topics */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Most Discussed Topics</h3>
          <p className="mt-1 text-xs text-text-muted">Popular conversation themes</p>
          <div className="mt-4 space-y-2">
            {topics.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">No topic data available yet.</p>
            ) : (
              topics.map((t) => (
                <div key={t.topic}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{t.topic}</span>
                    <span className="text-text-muted">{t.count} convos</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-accent-primary" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
