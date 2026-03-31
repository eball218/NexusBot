'use client';

import { useState, useEffect } from 'react';
import { authApi, ApiError } from '@/lib/api';

interface Rule {
  id: string;
  ruleType: string;
  pattern: string | null;
  severity: number;
  action: 'warn' | 'timeout' | 'ban';
  platforms: string;
  enabled: boolean;
}

const actionColors: Record<string, string> = {
  warn: 'bg-warning/10 text-warning border-warning/20',
  timeout: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ban: 'bg-danger/10 text-danger border-danger/20',
};

const platformLabels: Record<string, string[]> = {
  both: ['twitch', 'discord'],
  twitch: ['twitch'],
  discord: ['discord'],
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

const emptyForm = {
  ruleType: 'spam' as string,
  pattern: '',
  severity: 3,
  action: 'warn' as 'warn' | 'timeout' | 'ban',
  platforms: 'both' as string,
  enabled: true,
};

export default function ModerationRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      setError(null);
      const data = await authApi<Rule[]>('/moderation/rules');
      setRules(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const toggleRule = async (id: string) => {
    setTogglingId(id);
    try {
      const updated = await authApi<Rule>(`/moderation/rules/${id}/toggle`, { method: 'PATCH' });
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to toggle rule');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteRule = async (id: string) => {
    setDeletingId(id);
    try {
      await authApi(`/moderation/rules/${id}`, { method: 'DELETE' });
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete rule');
    } finally {
      setDeletingId(null);
    }
  };

  const addRule = async () => {
    setSubmitting(true);
    try {
      const created = await authApi<Rule>('/moderation/rules', {
        method: 'POST',
        body: {
          ruleType: form.ruleType,
          pattern: form.pattern,
          severity: form.severity,
          action: form.action,
          platforms: form.platforms,
          enabled: form.enabled,
        },
      });
      setRules((prev) => [...prev, created]);
      setShowAddForm(false);
      setForm({ ...emptyForm });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add rule');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Moderation Rules</h1>
          <p className="mt-1 text-sm text-text-muted">Configure auto-moderation rules and filters.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Moderation Rules</h1>
          <p className="mt-1 text-sm text-text-muted">Configure auto-moderation rules and filters.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 transition-colors"
        >
          + Add Rule
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Add Rule Form */}
      {showAddForm && (
        <div className="rounded-xl border border-white/10 bg-background-elevated p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">New Rule</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Rule Type</label>
              <select
                value={form.ruleType}
                onChange={(e) => setForm((f) => ({ ...f, ruleType: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="spam">Spam</option>
                <option value="links">Links</option>
                <option value="toxicity">Toxicity</option>
                <option value="caps_emotes">Caps / Emotes</option>
                <option value="custom_words">Custom Words</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Pattern (regex)</label>
              <input
                type="text"
                value={form.pattern}
                onChange={(e) => setForm((f) => ({ ...f, pattern: e.target.value }))}
                placeholder="/pattern/i"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Severity (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: Number(e.target.value) }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Action</label>
              <select
                value={form.action}
                onChange={(e) => setForm((f) => ({ ...f, action: e.target.value as 'warn' | 'timeout' | 'ban' }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="warn">Warn</option>
                <option value="timeout">Timeout</option>
                <option value="ban">Ban</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Platforms</label>
              <select
                value={form.platforms}
                onChange={(e) => setForm((f) => ({ ...f, platforms: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="both">Both</option>
                <option value="discord">Discord</option>
                <option value="twitch">Twitch</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowAddForm(false); setForm({ ...emptyForm }); }}
              className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-text-secondary hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addRule}
              disabled={submitting || !form.pattern}
              className="rounded-lg bg-accent-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Rule'}
            </button>
          </div>
        </div>
      )}

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
                    {rule.ruleType}
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
                    {(platformLabels[rule.platforms] || [rule.platforms]).map((p) => (
                      <span key={p} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[p] || ''}`}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteRule(rule.id)}
                disabled={deletingId === rule.id}
                className="rounded-lg border border-white/10 px-3 py-1 text-xs text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
              >
                {deletingId === rule.id ? '...' : 'Delete'}
              </button>

              {/* Toggle */}
              <button
                onClick={() => toggleRule(rule.id)}
                disabled={togglingId === rule.id}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-50 ${
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

        {rules.length === 0 && !loading && (
          <div className="rounded-xl border border-white/5 bg-background-elevated p-8 text-center">
            <p className="text-sm text-text-muted">No moderation rules configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
