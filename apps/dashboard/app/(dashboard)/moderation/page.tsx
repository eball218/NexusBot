'use client';

const stats = [
  { label: 'Total Actions (24h)', value: '147', change: '+8%', up: true },
  { label: 'Active Bans', value: '23', change: '+2', up: true },
  { label: 'Pending Appeals', value: '5', change: '-1', up: false },
  { label: 'Auto-filtered Messages', value: '312', change: '+15%', up: true },
];

const recentActions = [
  {
    id: 1,
    user: 'toxic_user42',
    platform: 'twitch',
    action: 'ban',
    reason: 'Repeated hate speech',
    rule: 'Hate Speech Filter',
    time: '2m ago',
  },
  {
    id: 2,
    user: 'spammer99',
    platform: 'discord',
    action: 'timeout',
    reason: 'Posting invite links',
    rule: 'Link Spam',
    time: '8m ago',
  },
  {
    id: 3,
    user: 'new_viewer',
    platform: 'twitch',
    action: 'warn',
    reason: 'Excessive caps',
    rule: 'Caps Lock Filter',
    time: '14m ago',
  },
  {
    id: 4,
    user: 'raid_bot_7',
    platform: 'discord',
    action: 'ban',
    reason: 'Bot raid detected',
    rule: 'Raid Protection',
    time: '21m ago',
  },
  {
    id: 5,
    user: 'annoying_guy',
    platform: 'twitch',
    action: 'timeout',
    reason: 'Symbol spam in chat',
    rule: 'Symbol Spam',
    time: '35m ago',
  },
  {
    id: 6,
    user: 'promo_account',
    platform: 'discord',
    action: 'warn',
    reason: 'Self-promotion in #general',
    rule: 'Self-Promo Filter',
    time: '42m ago',
  },
];

const actionColors: Record<string, string> = {
  warn: 'bg-warning/10 text-warning',
  timeout: 'bg-orange-500/10 text-orange-400',
  ban: 'bg-danger/10 text-danger',
};

const platformColors: Record<string, string> = {
  twitch: 'bg-purple-500/10 text-purple-400',
  discord: 'bg-indigo-500/10 text-indigo-400',
};

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Moderation</h1>
        <p className="mt-1 text-sm text-text-muted">Overview of moderation activity across platforms.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/5 bg-background-elevated p-4">
            <p className="text-xs font-medium text-text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className={`mt-1 text-xs ${stat.up ? 'text-success' : 'text-danger'}`}>
              {stat.change} vs yesterday
            </p>
          </div>
        ))}
      </div>

      {/* Recent Mod Actions */}
      <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Recent Mod Actions</h3>
          <a href="/moderation/actions" className="text-xs font-medium text-accent-primary hover:underline">
            View all
          </a>
        </div>
        <div className="mt-4 space-y-3">
          {recentActions.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">{item.user}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformColors[item.platform]}`}>
                    {item.platform}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {item.reason} &middot; Rule: {item.rule}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${actionColors[item.action]}`}>
                {item.action}
              </span>
              <span className="text-xs text-text-muted whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
