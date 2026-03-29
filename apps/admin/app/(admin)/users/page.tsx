'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { authApi, ApiError } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  status: string;
  signupDate: string;
  lastLogin: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  perPage: number;
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi<UsersResponse>(`/admin/users?page=${page}&perPage=${perPage}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / perPage);

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

      {loading && (
        <div className="flex items-center justify-center rounded-lg border border-white/5 bg-background-elevated py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            <span className="text-sm text-text-muted">Loading users...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-5 py-4">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 text-sm font-medium text-accent-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total} users
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/5 bg-background-elevated px-3 py-1.5 text-text-secondary hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/5 bg-background-elevated px-3 py-1.5 text-text-secondary hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
