'use client';

import { useState } from 'react';

const initialRules = [
  { id: 1, name: 'Spam Filter', description: 'Auto-delete repeated messages and link spam.', severity: 'high', action: 'Delete + Warn', enabled: true },
  { id: 2, name: 'Toxicity Detection', description: 'AI-powered toxicity scoring for hateful content.', severity: 'high', action: 'Mute 10m', enabled: true },
  { id: 3, name: 'Caps Lock Abuse', description: 'Flag messages with >70% uppercase characters.', severity: 'low', action: 'Warn', enabled: false },
  { id: 4, name: 'External Links', description: 'Require approval for links from unknown domains.', severity: 'medium', action: 'Hold for Review', enabled: true },
  { id: 5, name: 'Raid Protection', description: 'Auto-lockdown when join rate exceeds threshold.', severity: 'high', action: 'Lockdown', enabled: true },
  { id: 6, name: 'Slur Filter', description: 'Instant ban for known slur patterns.', severity: 'high', action: 'Ban', enabled: true },
];

const severityColor: Record<string, string> = {
  low: 'bg-accent-primary/10 text-accent-primary',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-danger/10 text-danger',
};

export default function ModerationPage() {
  const [rules, setRules] = useState(initialRules);

  const toggleRule = (id: number) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Moderation Rules</h1>
        <p className="mt-1 text-sm text-text-secondary">Configure auto-moderation behavior for your bot.</p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-start justify-between rounded-lg border border-white/5 bg-background-elevated p-5"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-text-primary">{rule.name}</h3>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${severityColor[rule.severity]}`}>
                  {rule.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-secondary">{rule.description}</p>
              <p className="mt-2 text-xs text-text-muted">
                Action: <span className="text-text-secondary">{rule.action}</span>
              </p>
            </div>
            <button
              onClick={() => toggleRule(rule.id)}
              className={`relative ml-4 h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                rule.enabled ? 'bg-success' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  rule.enabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
