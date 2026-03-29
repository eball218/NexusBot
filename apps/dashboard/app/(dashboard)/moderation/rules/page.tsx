'use client';

import { useState } from 'react';

interface Rule {
  id: number;
  type: string;
  pattern: string;
  severity: number;
  action: 'warn' | 'timeout' | 'ban';
  platforms: ('twitch' | 'discord')[];
  enabled: boolean;
}

const initialRules: Rule[] = [
  { id: 1, type: 'Regex', pattern: '/(n|i|g){3,}/i', severity: 5, action: 'ban', platforms: ['twitch', 'discord'], enabled: true },
  { id: 2, type: 'Contains', pattern: 'discord.gg/', severity: 4, action: 'timeout', platforms: ['twitch'], enabled: true },
  { id: 3, type: 'Regex', pattern: '/[A-Z\\s]{20,}/', severity: 2, action: 'warn', platforms: ['twitch', 'discord'], enabled: true },
  { id: 4, type: 'Contains', pattern: 'buy followers', severity: 3, action: 'ban', platforms: ['twitch', 'discord'], enabled: true },
  { id: 5, type: 'Regex', pattern: '/(.{1,3})\\1{5,}/', severity: 2, action: 'timeout', platforms: ['discord'], enabled: false },
  { id: 6, type: 'Contains', pattern: 'free nitro', severity: 4, action: 'ban', platforms: ['discord'], enabled: true },
];

const actionColors: Record<string, string> = {
  warn: 'bg-warning/10 text-warning border-warning/20',
  timeout: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ban: 'bg-danger/10 text-danger border-danger/20',
};

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-500/10 text-purple-400',
  discord: 'bg-indigo-500/10 text-indigo-400',
};

function SeverityDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-2 w-2 rounded-full ${
            n <= level
              ? level >= 4
                ? 'bg-danger'
                : level >= 3
                  ? 'bg-warning'
                  : 'bg-success'
              : 'bg-white/10'
          }`}
        />
      ))}
    </div>
  );
}

export default function ModerationRulesPage() {
  const [rules, setRules] = useState<Rule[]>(initialRules);

  const toggleRule = (id: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Moderation Rules</h1>
          <p className="mt-1 text-sm text-text-muted">Configure auto-moderation rules and filters.</p>
        </div>
        <button className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 transition-colors">
          + Add Rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`rounded-xl border bg-background-elevated p-4 transition-colors ${
              rule.enabled ? 'border-white/5' : 'border-white/5 opacity-50'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Drag Handle */}
              <div className="flex flex-col gap-0.5 cursor-grab text-text-muted hover:text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <circle cx="4" cy="3" r="1.5" fill="currentColor" />
                  <circle cx="10" cy="3" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="7" r="1.5" fill="currentColor" />
                  <circle cx="10" cy="7" r="1.5" fill="currentColor" />
                  <circle cx="4" cy="11" r="1.5" fill="currentColor" />
                  <circle cx="10" cy="11" r="1.5" fill="currentColor" />
                </svg>
              </div>

              {/* Rule Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-text-secondary">
                    {rule.type}
                  </span>
                  <code className="text-sm text-text-primary font-mono truncate">{rule.pattern}</code>
                </div>
                <div className="mt-2 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">Severity:</span>
                    <SeverityDots level={rule.severity} />
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${actionColors[rule.action]}`}>
                    {rule.action}
                  </span>
                  <div className="flex gap-1">
                    {rule.platforms.map((p) => (
                      <span key={p} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[p]}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  rule.enabled ? 'bg-accent-primary' : 'bg-white/10'
                }`}
                role="switch"
                aria-checked={rule.enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    rule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
