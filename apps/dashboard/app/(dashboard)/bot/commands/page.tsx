'use client';

import { useState } from 'react';

type Command = {
  id: string;
  command: string;
  response: string;
  cooldown: number;
  platform: 'Discord' | 'Twitch' | 'All';
  enabled: boolean;
};

const initialCommands: Command[] = [
  { id: '1', command: '!help', response: 'Here are the available commands: !help, !stats, !social, !uptime', cooldown: 5, platform: 'All', enabled: true },
  { id: '2', command: '!stats', response: 'Stream stats: {{viewers}} viewers, {{followers}} followers', cooldown: 30, platform: 'Twitch', enabled: true },
  { id: '3', command: '!social', response: 'Follow on Twitter: @nexusbot | Discord: discord.gg/nexus', cooldown: 60, platform: 'All', enabled: true },
  { id: '4', command: '!uptime', response: 'Bot has been online for {{uptime}}', cooldown: 10, platform: 'All', enabled: true },
  { id: '5', command: '!rank', response: 'Your rank: {{rank}} | XP: {{xp}}/{{next_xp}}', cooldown: 15, platform: 'Discord', enabled: false },
  { id: '6', command: '!quote', response: '{{random_quote}}', cooldown: 30, platform: 'All', enabled: true },
];

export default function CommandsPage() {
  const [commands, setCommands] = useState(initialCommands);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCmd, setNewCmd] = useState<{ command: string; response: string; cooldown: number; platform: 'Discord' | 'Twitch' | 'All' }>({ command: '', response: '', cooldown: 5, platform: 'All' });

  function toggleCommand(id: string) {
    setCommands(commands.map((cmd) =>
      cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
    ));
  }

  function addCommand() {
    if (!newCmd.command || !newCmd.response) return;
    const cmd: Command = {
      id: String(Date.now()),
      command: newCmd.command.startsWith('!') ? newCmd.command : `!${newCmd.command}`,
      response: newCmd.response,
      cooldown: newCmd.cooldown,
      platform: newCmd.platform,
      enabled: true,
    };
    setCommands([...commands, cmd]);
    setNewCmd({ command: '', response: '', cooldown: 5, platform: 'All' });
    setShowAddForm(false);
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
            className="rounded-lg bg-success/10 px-4 py-2 text-sm font-medium text-success hover:bg-success/20"
          >
            Save Command
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
              </tr>
            </thead>
            <tbody>
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
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
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
