'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi, ApiError } from '@/lib/api';

type Command = {
  id: string;
  command: string;
  response: string;
  cooldown: number;
  cooldownSeconds?: number;
  platform: 'Discord' | 'Twitch' | 'All';
  enabled: boolean;
};

export default function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCmd, setNewCmd] = useState<{ command: string; response: string; cooldown: number; platform: 'Discord' | 'Twitch' | 'All' }>({ command: '', response: '', cooldown: 5, platform: 'All' });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCmd, setAddingCmd] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const loadCommands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi<Command[]>('/commands');
      setCommands(
        (data || []).map((cmd) => ({
          ...cmd,
          cooldown: cmd.cooldownSeconds ?? cmd.cooldown ?? 0,
        }))
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setCommands([]);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load commands');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommands();
  }, [loadCommands]);

  async function toggleCommand(id: string) {
    setTogglingIds((prev) => new Set(prev).add(id));
    try {
      await authApi(`/commands/${id}/toggle`, { method: 'PATCH' });
      setCommands((prev) =>
        prev.map((cmd) => (cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle command');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function deleteCommand(id: string) {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await authApi(`/commands/${id}`, { method: 'DELETE' });
      setCommands((prev) => prev.filter((cmd) => cmd.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete command');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function addCommand() {
    if (!newCmd.command || !newCmd.response) return;
    setAddingCmd(true);
    setError(null);
    try {
      const commandName = newCmd.command.startsWith('!') ? newCmd.command : `!${newCmd.command}`;
      const created = await authApi<Command>('/commands', {
        method: 'POST',
        body: {
          command: commandName,
          response: newCmd.response,
          cooldownSeconds: newCmd.cooldown,
          platform: newCmd.platform,
          enabled: true,
        },
      });
      setCommands((prev) => [
        ...prev,
        {
          ...created,
          cooldown: created.cooldownSeconds ?? created.cooldown ?? newCmd.cooldown,
        },
      ]);
      setNewCmd({ command: '', response: '', cooldown: 5, platform: 'All' });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add command');
    } finally {
      setAddingCmd(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <span className="ml-3 text-sm text-text-muted">Loading commands...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Commands</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90"
        >
          {showAddForm ? 'Cancel' : 'Add Command'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Add Command Form */}
      {showAddForm && (
        <div className="rounded-xl border border-accent-primary/20 bg-background-elevated p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">New Command</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-muted">Command</label>
              <input
                type="text"
                value={newCmd.command}
                onChange={(e) => setNewCmd({ ...newCmd, command: e.target.value })}
                placeholder="!command"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted">Response</label>
              <input
                type="text"
                value={newCmd.response}
                onChange={(e) => setNewCmd({ ...newCmd, response: e.target.value })}
                placeholder="Bot response message"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted">Cooldown (seconds)</label>
              <input
                type="number"
                value={newCmd.cooldown}
                onChange={(e) => setNewCmd({ ...newCmd, cooldown: Number(e.target.value) })}
                min={0}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted">Platform</label>
              <select
                value={newCmd.platform}
                onChange={(e) => setNewCmd({ ...newCmd, platform: e.target.value as 'Discord' | 'Twitch' | 'All' })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              >
                <option value="All" className="bg-background-elevated">All</option>
                <option value="Discord" className="bg-background-elevated">Discord</option>
                <option value="Twitch" className="bg-background-elevated">Twitch</option>
              </select>
            </div>
          </div>
          <button
            onClick={addCommand}
            disabled={addingCmd}
            className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success hover:bg-success/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingCmd ? 'Saving...' : 'Save Command'}
          </button>
        </div>
      )}

      {/* Commands Table */}
      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Command</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Response</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Cooldown</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Platform</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Enabled</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commands.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-text-muted">
                    No commands yet. Click &quot;Add Command&quot; to create one.
                  </td>
                </tr>
              )}
              {commands.map((cmd) => (
                <tr key={cmd.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <code className="rounded bg-white/5 px-2 py-0.5 text-sm font-mono text-accent-primary">
                      {cmd.command}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary max-w-sm truncate">{cmd.response}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{cmd.cooldown}s</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      cmd.platform === 'Discord'
                        ? 'bg-[#5865F2]/10 text-[#5865F2]'
                        : cmd.platform === 'Twitch'
                          ? 'bg-[#9146FF]/10 text-[#9146FF]'
                          : 'bg-white/5 text-text-secondary'
                    }`}>
                      {cmd.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleCommand(cmd.id)}
                      disabled={togglingIds.has(cmd.id)}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors disabled:opacity-50 ${
                        cmd.enabled ? 'bg-success' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          cmd.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteCommand(cmd.id)}
                      disabled={deletingIds.has(cmd.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingIds.has(cmd.id) ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Use {'{{variable}}'} syntax in responses for dynamic values. Available: {'{{viewers}}, {{followers}}, {{uptime}}, {{rank}}, {{xp}}, {{random_quote}}'}
      </p>
    </div>
  );
}
