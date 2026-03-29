'use client';

import { useState } from 'react';

const initialKeys = [
  { id: 1, name: 'Production Bot', prefix: 'nxb_prod_xxxx...a4f2', created: 'Jan 10, 2026', lastUsed: '2 hours ago', scopes: ['read', 'write', 'admin'] },
  { id: 2, name: 'Development', prefix: 'nxb_dev_xxxx...b7e1', created: 'Feb 22, 2026', lastUsed: '3 days ago', scopes: ['read', 'write'] },
  { id: 3, name: 'Analytics Export', prefix: 'nxb_exp_xxxx...c9d3', created: 'Mar 05, 2026', lastUsed: 'Never', scopes: ['read'] },
];

export default function APIKeysPage() {
  const [keys, setKeys] = useState(initialKeys);

  function revokeKey(id: number) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <a href="/settings" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Settings</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">API Keys</h1>
        <p className="mt-1 text-sm text-text-muted">Manage API keys for external integrations</p>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          Generate New Key
        </button>
      </div>

      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Last Used</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Scopes</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-text-primary">{key.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{key.prefix}</td>
                <td className="px-4 py-3 text-text-muted">{key.created}</td>
                <td className="px-4 py-3 text-text-muted">{key.lastUsed}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-text-muted"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="text-xs text-danger hover:underline"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">
                  No API keys. Generate one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
