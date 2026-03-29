'use client';

import { useState } from 'react';

const initialFlags = [
  { key: 'ai_toxicity_scoring', description: 'Enable AI-powered toxicity scoring for moderation.', enabled: true, appliesTo: 'pro', updated: '2026-03-25' },
  { key: 'cross_platform_sync', description: 'Sync bot state across Discord and Twitch.', enabled: true, appliesTo: 'ultimate', updated: '2026-03-20' },
  { key: 'new_onboarding_flow', description: 'Use the redesigned onboarding wizard for new tenants.', enabled: false, appliesTo: 'all', updated: '2026-03-18' },
  { key: 'maintenance_mode', description: 'Enable platform-wide maintenance mode.', enabled: false, appliesTo: 'all', updated: '2026-03-15' },
  { key: 'beta_features', description: 'Unlock beta features for eligible accounts.', enabled: true, appliesTo: 'ultimate', updated: '2026-03-12' },
  { key: 'enhanced_analytics', description: 'Show enhanced analytics dashboard with AI insights.', enabled: false, appliesTo: 'pro', updated: '2026-03-10' },
];

const appliesToBadge = (appliesTo: string) => {
  const cls =
    appliesTo === 'all'
      ? 'bg-accent-primary/10 text-accent-primary'
      : appliesTo === 'pro'
        ? 'bg-warning/10 text-warning'
        : appliesTo === 'ultimate'
          ? 'bg-accent-secondary/10 text-accent-secondary'
          : 'bg-white/5 text-text-muted';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{appliesTo}</span>;
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(initialFlags);

  const toggleFlag = (key: string) => {
    setFlags(flags.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Feature Flags</h1>
        <p className="mt-1 text-sm text-text-secondary">Toggle features across the platform.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-elevated">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-text-muted">
              <th className="px-5 py-3 font-medium">Key</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Enabled</th>
              <th className="px-5 py-3 font-medium">Applies To</th>
              <th className="px-5 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.key} className="border-b border-white/5 last:border-0">
                <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-accent-primary">{f.key}</td>
                <td className="max-w-md px-5 py-3 text-text-secondary">{f.description}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleFlag(f.key)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      f.enabled ? 'bg-success' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        f.enabled ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-3">{appliesToBadge(f.appliesTo)}</td>
                <td className="whitespace-nowrap px-5 py-3 text-text-muted">{f.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
