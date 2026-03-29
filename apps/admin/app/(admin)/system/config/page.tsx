'use client';

import { useState } from 'react';

export default function ConfigPage() {
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-****************************WxYz');
  const [stripeKey, setStripeKey] = useState('sk_live_****************************AbCd');
  const [emailFrom, setEmailFrom] = useState('noreply@nexusbot.io');
  const [resendKey, setResendKey] = useState('re_****************************MnOp');
  const [personalityTemplate, setPersonalityTemplate] = useState(
    'You are a helpful community bot. Be friendly, concise, and follow the channel rules at all times.'
  );
  const [defaultModRules, setDefaultModRules] = useState(
    'spam_filter: enabled\ntoxicity_detection: enabled\ncaps_lock_abuse: disabled\nexternal_links: hold_for_review'
  );
  const [announcement, setAnnouncement] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Platform Configuration</h1>
        <p className="mt-1 text-sm text-text-secondary">Global settings, API keys, and templates.</p>
      </div>

      {/* API Keys */}
      <section className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">API Keys</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-text-primary">Anthropic API Key</label>
            <input
              type="text"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/5 bg-background-secondary px-4 py-2.5 font-mono text-sm text-text-secondary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary">Stripe Secret Key</label>
            <input
              type="text"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/5 bg-background-secondary px-4 py-2.5 font-mono text-sm text-text-secondary focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Email Settings */}
      <section className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Email Settings</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-text-primary">From Address</label>
            <input
              type="email"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/5 bg-background-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary">Resend API Key</label>
            <input
              type="text"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/5 bg-background-secondary px-4 py-2.5 font-mono text-sm text-text-secondary focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Default Templates */}
      <section className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Default Templates</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-text-primary">Personality Template</label>
            <textarea
              value={personalityTemplate}
              onChange={(e) => setPersonalityTemplate(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-white/5 bg-background-secondary px-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary">Default Moderation Rules</label>
            <textarea
              value={defaultModRules}
              onChange={(e) => setDefaultModRules(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-white/5 bg-background-secondary px-4 py-2.5 font-mono text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Announcements</h2>
        <div className="max-w-xl space-y-3">
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={3}
            placeholder="Write an announcement to push to all tenants..."
            className="w-full rounded-lg border border-white/5 bg-background-secondary px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
          />
          <button className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/80">
            Push Announcement
          </button>
        </div>
      </section>

      {/* Save All */}
      <div>
        <button className="rounded-lg bg-accent-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-primary/80">
          Save Configuration
        </button>
      </div>
    </div>
  );
}
