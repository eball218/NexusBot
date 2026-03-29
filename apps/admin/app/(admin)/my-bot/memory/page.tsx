'use client';

import { useState } from 'react';

const allMemories = [
  { id: 'mem-001', key: 'user:alex_streams', content: 'Prefers short responses. Streams Valorant on Tuesdays.', source: 'conversation', createdAt: '2026-03-26' },
  { id: 'mem-002', key: 'channel:general', content: 'No politics rule enforced. Emote-only mode on weekends.', source: 'moderation', createdAt: '2026-03-25' },
  { id: 'mem-003', key: 'user:bot_tester', content: 'Beta tester — ok to share unreleased features.', source: 'manual', createdAt: '2026-03-24' },
  { id: 'mem-004', key: 'server:config', content: 'Welcome message uses casual tone with emojis.', source: 'system', createdAt: '2026-03-23' },
  { id: 'mem-005', key: 'user:mod_sarah', content: 'Moderator since Jan 2026. Handles appeals.', source: 'conversation', createdAt: '2026-03-22' },
  { id: 'mem-006', key: 'channel:support', content: 'Auto-create tickets for messages with "bug" keyword.', source: 'moderation', createdAt: '2026-03-20' },
  { id: 'mem-007', key: 'user:nightowl', content: 'Timezone: PST. Active between 10pm-3am.', source: 'conversation', createdAt: '2026-03-18' },
  { id: 'mem-008', key: 'server:events', content: 'Weekly community game night on Fridays at 8pm EST.', source: 'manual', createdAt: '2026-03-15' },
];

export default function MemoryPage() {
  const [search, setSearch] = useState('');

  const filtered = allMemories.filter(
    (m) =>
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Memory Browser</h1>
        <p className="mt-1 text-sm text-text-secondary">Search and manage stored bot memories.</p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search memories by key or content..."
        className="w-full rounded-lg border border-white/5 bg-background-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
      />

      <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-elevated">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-text-muted">
              <th className="px-5 py-3 font-medium">Key</th>
              <th className="px-5 py-3 font-medium">Content</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-white/5 last:border-0">
                <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-accent-primary">{m.key}</td>
                <td className="max-w-md px-5 py-3 text-text-secondary">{m.content}</td>
                <td className="px-5 py-3">
                  <span className="inline-block rounded-full bg-accent-primary/10 px-2 py-0.5 text-xs font-medium text-accent-primary">
                    {m.source}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-text-muted">{m.createdAt}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-text-muted">
                  No memories match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
