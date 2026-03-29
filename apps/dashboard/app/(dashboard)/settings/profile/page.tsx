'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState('StreamerPro');
  const [timezone, setTimezone] = useState('America/New_York');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href="/settings" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Settings</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Profile</h1>
        <p className="mt-1 text-sm text-text-muted">Update your account information</p>
      </div>

      <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-5">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Avatar</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <span className="text-xl font-bold text-accent-primary">SP</span>
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
            value="streamer@example.com"
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
          <button className="rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
