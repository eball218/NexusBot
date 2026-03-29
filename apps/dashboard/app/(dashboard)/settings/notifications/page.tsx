'use client';

import { useState } from 'react';

const defaultPrefs = [
  { key: 'bot_offline', label: 'Bot offline alerts', description: 'Get notified when your bot goes offline unexpectedly', enabled: true },
  { key: 'trial_expiring', label: 'Trial expiring', description: 'Reminder before your trial period ends', enabled: true },
  { key: 'mod_alerts', label: 'Moderation alerts', description: 'Notifications for high-severity moderation events', enabled: true },
  { key: 'weekly_digest', label: 'Weekly digest', description: 'Weekly summary of bot activity and stats', enabled: false },
  { key: 'payment_notifications', label: 'Payment notifications', description: 'Receipts and billing-related notifications', enabled: true },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState(defaultPrefs);

  function toggle(key: string) {
    setPrefs((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p))
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href="/settings" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Settings</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Notifications</h1>
        <p className="mt-1 text-sm text-text-muted">Choose what notifications you receive</p>
      </div>

      <div className="rounded-xl border border-white/5 bg-background-elevated divide-y divide-white/5">
        {prefs.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between p-5">
            <div>
              <h3 className="text-sm font-medium text-text-primary">{pref.label}</h3>
              <p className="mt-0.5 text-xs text-text-muted">{pref.description}</p>
            </div>
            <button
              onClick={() => toggle(pref.key)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                pref.enabled ? 'bg-accent-primary' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ${
                  pref.enabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
