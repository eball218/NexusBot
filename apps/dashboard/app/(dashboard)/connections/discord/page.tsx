'use client';

import { useState } from 'react';

const servers = [
  { id: '1', name: 'My Community Server', members: 1245, connected: true },
  { id: '2', name: 'Gaming Crew', members: 387, connected: false },
];

export default function DiscordSettingsPage() {
  const [selectedServer, setSelectedServer] = useState('1');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href="/connections" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Connections</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Discord Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your Discord integration</p>
      </div>

      {/* Connected Servers */}
      <div className="rounded-xl border border-[#5865F2]/20 bg-background-elevated p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Connected Servers</h2>
        <div className="space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className={`flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                selectedServer === server.id
                  ? 'bg-[#5865F2]/10 border border-[#5865F2]/30'
                  : 'bg-white/[0.03] border border-transparent hover:border-white/10'
              }`}
              onClick={() => setSelectedServer(server.id)}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#5865F2]">{server.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{server.name}</p>
                  <p className="text-xs text-text-muted">{server.members.toLocaleString()} members</p>
                </div>
              </div>
              {server.connected && (
                <span className="inline-flex items-center gap-1.5 text-xs text-success">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Server Selector */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Active Server</h2>
        <select
          value={selectedServer}
          onChange={(e) => setSelectedServer(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-[#5865F2] focus:outline-none"
        >
          {servers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Bot Invite Link */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Bot Invite Link</h2>
        <p className="text-xs text-text-muted">Use this link to add NexusBot to another Discord server.</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value="https://discord.com/oauth2/authorize?client_id=123456&scope=bot&permissions=8"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-text-secondary font-mono focus:outline-none"
          />
          <button className="rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90 shrink-0">
            Copy
          </button>
        </div>
      </div>

      {/* Disconnect */}
      <div className="rounded-xl border border-danger/20 bg-background-elevated p-6">
        <h2 className="text-sm font-semibold text-danger">Danger Zone</h2>
        <p className="mt-1 text-xs text-text-muted">Disconnecting will stop all Discord-related bot features.</p>
        <button className="mt-4 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10">
          Disconnect Discord
        </button>
      </div>
    </div>
  );
}
