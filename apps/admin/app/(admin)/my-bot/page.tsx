import Link from 'next/link';

export default function MyBotPage() {
  const stats = [
    { label: 'Messages Processed', value: '48,291' },
    { label: 'Mod Actions', value: '1,204' },
    { label: 'AI Conversations', value: '6,832' },
  ];

  const subPages = [
    { href: '/my-bot/personality', title: 'Personality', description: 'Configure your bot identity, traits, and tone.' },
    { href: '/my-bot/memory', title: 'Memory', description: 'Browse and manage stored conversation memories.' },
    { href: '/my-bot/moderation', title: 'Moderation', description: 'Set up moderation rules and auto-actions.' },
    { href: '/my-bot/scheduler', title: 'Scheduler', description: 'Manage scheduled messages and cron jobs.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Bot</h1>
        <p className="mt-1 text-sm text-text-secondary">Your personal admin bot configuration.</p>
      </div>

      {/* Status Card */}
      <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Bot Status</h2>
            <p className="mt-1 text-sm text-text-secondary">Always active with Ultimate tier privileges.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-full bg-accent-secondary/10 px-3 py-1 text-xs font-medium text-accent-secondary">
              Ultimate
            </span>
            <span className="flex items-center gap-1.5 text-sm text-success">
              <span className="inline-block h-2 w-2 rounded-full bg-success" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Connected Platforms</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-background-secondary px-4 py-2">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-discord">Discord</span>
            <span className="text-xs text-text-muted">Connected</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-background-secondary px-4 py-2">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            <span className="text-sm font-medium text-twitch">Twitch</span>
            <span className="text-xs text-text-muted">Connected</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-white/5 bg-background-elevated p-5">
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-page Links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {subPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="block rounded-lg border border-white/5 bg-background-elevated p-5 transition-colors hover:border-accent-primary/30"
          >
            <h3 className="text-base font-semibold text-text-primary">{page.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{page.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
