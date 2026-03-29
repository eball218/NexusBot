'use client';

import { useState } from 'react';
import Link from 'next/link';

const users = [
  { id: '1', name: 'Alex Rivera', email: 'alex@acmegaming.gg', role: 'admin', tier: 'Ultimate', status: 'active', signupDate: '2025-08-14', lastLogin: '2026-03-28' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@streampro.io', role: 'owner', tier: 'Pro', status: 'active', signupDate: '2025-09-02', lastLogin: '2026-03-27' },
  { id: '3', name: 'Marcus Johnson', email: 'marcus@nightowl.tv', role: 'owner', tier: 'Pro', status: 'active', signupDate: '2025-10-11', lastLogin: '2026-03-26' },
  { id: '4', name: 'Yuki Tanaka', email: 'yuki@pixelforge.dev', role: 'member', tier: 'Free', status: 'active', signupDate: '2025-11-22', lastLogin: '2026-03-25' },
  { id: '5', name: 'Emma Wilson', email: 'emma@cloudnine.gg', role: 'owner', tier: 'Ultimate', status: 'suspended', signupDate: '2025-12-01', lastLogin: '2026-03-10' },
  { id: '6', name: 'Raj Patel', email: 'raj@botlab.co', role: 'admin', tier: 'Pro', status: 'active', signupDate: '2026-01-05', lastLogin: '2026-03-28' },
  { id: '7', name: 'Lina Gomez', email: 'lina@gamevault.io', role: 'member', tier: 'Free', status: 'active', signupDate: '2026-01-18', lastLogin: '2026-03-24' },
  { id: '8', name: 'Jake Turner', email: 'jake@turbochat.gg', role: 'owner', tier: 'Pro', status: 'inactive', signupDate: '2026-02-10', lastLogin: '2026-02-28' },
];

const roleBadge = (role: string) => {
  const cls =
    role === 'admin'
      ? 'bg-accent-secondary/10 text-accent-secondary'
      : role === 'owner'
        ? 'bg-accent-primary/10 text-accent-primary'
        : 'bg-white/5 text-text-muted';
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{role}</span>;
};

const statusDot = (status: string) => {
  const color = status === 'active' ? 'bg-success' : status === 'suspended' ? 'bg-danger' : 'bg-warning';
  return (
    <span className="flex items-center gap-1.5 text-sm capitalize text-text-secondary">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {status}
    </span>
  );
};

export default function UsersPage() {
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="mt-1 text-sm text-text-secondary">All registered platform users.</p>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full max-w-md rounded-lg border border-white/5 bg-background-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none"
      />

      <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-elevated">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-text-muted">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Tier</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Signup Date</th>
              <th className="px-5 py-3 font-medium">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <Link href={`/users/${u.id}`} className="font-medium text-accent-primary hover:underline">
                    {u.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                <td className="px-5 py-3">{roleBadge(u.role)}</td>
                <td className="px-5 py-3 text-text-primary">{u.tier}</td>
                <td className="px-5 py-3">{statusDot(u.status)}</td>
                <td className="px-5 py-3 text-text-muted">{u.signupDate}</td>
                <td className="px-5 py-3 text-text-muted">{u.lastLogin}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-text-muted">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
