'use client';

import { useState } from 'react';

export default function TwitchSettingsPage() {
  const [channel, setChannel] = useState('yourchannel');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href="/connections" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Connections</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Twitch Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your Twitch integration</p>
      </div>

      {/* Connected Account */}
      <div className="rounded-xl border border-[#9146FF]/20 bg-background-elevated p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Connected Account</h2>
        <div className="flex items-center gap-4 rounded-lg bg-white/[0.03] px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-[#9146FF]/20 flex items-center justify-center">
            <span className="text-sm font-bold text-[#9146FF]">YC</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">yourchannel</p>
            <p className="text-xs text-text-muted">Connected since Mar 15, 2026</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-success">
            <span className="h-2 w-2 rounded-full bg-success" />
            Active
          </span>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Channel</h2>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Select channel to monitor</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-[#9146FF] focus:outline-none"
          >
            <option value="yourchannel">yourchannel</option>
            <option value="yourchannel_alt">yourchannel_alt</option>
          </select>
        </div>
      </div>

      {/* Bot Permissions */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Bot Permissions</h2>
        <div className="space-y-2">
          {[
            { perm: 'Read Chat Messages', granted: true },
            { perm: 'Send Chat Messages', granted: true },
            { perm: 'Moderate Chat (Timeout/Ban)', granted: true },
            { perm: 'Manage Predictions', granted: false },
            { perm: 'Edit Stream Info', granted: true },
            { perm: 'Read Subscribers', granted: true },
            { perm: 'Read Followers', granted: true },
          ].map((p) => (
            <div key={p.perm} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
              <span className="text-sm text-text-secondary">{p.perm}</span>
              <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${
                p.granted ? 'bg-success/10 text-success' : 'bg-white/5 text-text-muted'
              }`}>
                {p.granted ? 'Granted' : 'Not granted'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disconnect */}
      <div className="rounded-xl border border-danger/20 bg-background-elevated p-6">
        <h2 className="text-sm font-semibold text-danger">Danger Zone</h2>
        <p className="mt-1 text-xs text-text-muted">Disconnecting will stop all Twitch-related bot features.</p>
        <button className="mt-4 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10">
          Disconnect Twitch
        </button>
      </div>
    </div>
  );
}
