'use client';

import { useState } from 'react';

type MemoryEntry = {
  id: string;
  type: 'fact' | 'preference' | 'context' | 'interaction';
  content: string;
  user: string;
  confidence: number;
  created: string;
};

const initialMemories: MemoryEntry[] = [
  { id: '1', type: 'fact', content: 'User is a software engineer working on React projects', user: 'viewer_fan', confidence: 0.95, created: '2026-03-28 09:12' },
  { id: '2', type: 'preference', content: 'Prefers dark mode and minimal UI', user: 'gamer_pro', confidence: 0.88, created: '2026-03-28 08:45' },
  { id: '3', type: 'context', content: 'Currently working on a Discord bot project', user: 'viewer_fan', confidence: 0.92, created: '2026-03-27 22:30' },
  { id: '4', type: 'interaction', content: 'Asked about moderation features three times', user: 'mod_helper', confidence: 0.78, created: '2026-03-27 18:15' },
  { id: '5', type: 'fact', content: 'Timezone is PST, usually active evenings', user: 'night_owl', confidence: 0.85, created: '2026-03-27 14:00' },
  { id: '6', type: 'preference', content: 'Dislikes overly formal responses', user: 'casual_chatter', confidence: 0.91, created: '2026-03-26 11:20' },
  { id: '7', type: 'context', content: 'Mentioned upcoming birthday on April 5th', user: 'gamer_pro', confidence: 0.72, created: '2026-03-25 16:45' },
];

const typeColors: Record<string, string> = {
  fact: 'bg-accent-primary/10 text-accent-primary',
  preference: 'bg-success/10 text-success',
  context: 'bg-warning/10 text-warning',
  interaction: 'bg-danger/10 text-danger',
};

export default function MemoryBrowserPage() {
  const [memories, setMemories] = useState(initialMemories);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const uniqueUsers = [...new Set(initialMemories.map((m) => m.user))];

  const filtered = memories.filter((m) => {
    const matchesSearch = !search || m.content.toLowerCase().includes(search.toLowerCase()) || m.user.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesUser = userFilter === 'all' || m.user === userFilter;
    return matchesSearch && matchesType && matchesUser;
  });

  function deleteMemory(id: string) {
    setMemories(memories.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Memory Browser</h1>

      {/* Search & Filters */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          >
            <option value="all" className="bg-background-elevated">All Types</option>
            <option value="fact" className="bg-background-elevated">Fact</option>
            <option value="preference" className="bg-background-elevated">Preference</option>
            <option value="context" className="bg-background-elevated">Context</option>
            <option value="interaction" className="bg-background-elevated">Interaction</option>
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          >
            <option value="all" className="bg-background-elevated">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user} value={user} className="bg-background-elevated">
                {user}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-text-muted">
        Showing {filtered.length} of {memories.length} memories
      </p>

      {/* Table */}
      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Content</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Created</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-muted"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((memory) => (
                <tr key={memory.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[memory.type]}`}>
                      {memory.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary max-w-md truncate">
                    {memory.content}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{memory.user}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-accent-primary"
                          style={{ width: `${memory.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted">{Math.round(memory.confidence * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">{memory.created}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      className="rounded px-2 py-1 text-xs text-danger hover:bg-danger/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">
                    No memories found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
