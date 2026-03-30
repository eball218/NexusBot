'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

type Profile = {
  email: string;
  displayName: string;
  timezone: string;
};

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await authApi<Profile>('/settings/profile');
        setDisplayName(data.displayName || '');
        setEmail(data.email || '');
        setTimezone(data.timezone || 'America/New_York');
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await authApi('/settings/profile', {
        method: 'PUT',
        body: { displayName, timezone },
      });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
    );
  }

  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href="/settings" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Settings</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Profile</h1>
        <p className="mt-1 text-sm text-text-muted">Update your account information</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-5">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Avatar</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-accent-primary">{initials}</span>
            </div>
            <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-text-secondary hover:bg-white/5">
              Change avatar
            </button>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          />
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-text-muted cursor-not-allowed"
          />
          <p className="mt-1 text-[10px] text-text-muted">Email cannot be changed</p>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="America/New_York">Eastern Time (US & Canada)</option>
            <option value="America/Chicago">Central Time (US & Canada)</option>
            <option value="America/Denver">Mountain Time (US & Canada)</option>
            <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Berlin">Berlin (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Australia/Sydney">Sydney (AEST)</option>
          </select>
        </div>

        {/* Save */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
