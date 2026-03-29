interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function KpiCard({ title, value, change, changeType = 'neutral', icon }: KpiCardProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-success'
      : changeType === 'negative'
        ? 'text-danger'
        : 'text-text-muted';

  return (
    <div className="rounded-lg border border-white/5 bg-background-secondary p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{title}</span>
        <span className="text-text-muted">{icon}</span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-bold text-text-primary">{value}</span>
        {change && <span className={`text-xs font-medium ${changeColor}`}>{change}</span>}
      </div>
    </div>
  );
}

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-background-secondary p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">{title}</h3>
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-white/10 bg-background">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p className="mt-2 text-xs text-text-muted">Chart visualization</p>
        </div>
      </div>
    </div>
  );
}

interface ActivityEntry {
  id: number;
  type: 'signup' | 'upgrade' | 'cancel' | 'error' | 'ticket';
  message: string;
  time: string;
}

const activityFeed: ActivityEntry[] = [
  { id: 1, type: 'signup', message: 'New tenant "StreamKing" signed up for Pro plan', time: '2 min ago' },
  { id: 2, type: 'upgrade', message: '"GamerHQ" upgraded from Starter to Business', time: '14 min ago' },
  { id: 3, type: 'cancel', message: '"PixelPlay" cancelled their subscription', time: '32 min ago' },
  { id: 4, type: 'error', message: 'Bot "NightOwlBot" reported an API connection error', time: '1 hr ago' },
  { id: 5, type: 'ticket', message: 'Support ticket #1284 opened by "LunaStreams"', time: '2 hr ago' },
];

function ActivityBadge({ type }: { type: ActivityEntry['type'] }) {
  const styles: Record<ActivityEntry['type'], string> = {
    signup: 'bg-success/10 text-success',
    upgrade: 'bg-accent-primary/10 text-accent-primary',
    cancel: 'bg-danger/10 text-danger',
    error: 'bg-warning/10 text-warning',
    ticket: 'bg-accent-secondary/10 text-accent-secondary',
  };
  const labels: Record<ActivityEntry['type'], string> = {
    signup: 'Signup',
    upgrade: 'Upgrade',
    cancel: 'Cancel',
    error: 'Error',
    ticket: 'Ticket',
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">NexusBot platform overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Tenants"
          value="2,147"
          change="+12%"
          changeType="positive"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          }
        />
        <KpiCard
          title="Active Subs"
          value="1,423"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          }
        />
        <KpiCard
          title="MRR"
          value="$18,340"
          change="+8%"
          changeType="positive"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          }
        />
        <KpiCard
          title="Churn Rate"
          value="3.2%"
          change="-0.4%"
          changeType="positive"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
          }
        />
        <KpiCard
          title="Active Bots"
          value="1,891"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" fill="currentColor" /><circle cx="15" cy="10" r="1.5" fill="currentColor" /><path d="M9 15h6" /></svg>
          }
        />
        <KpiCard
          title="AI API Cost"
          value="$2,140"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPlaceholder title="Revenue Over Time (MRR)" />
        <ChartPlaceholder title="New Signups" />
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-white/5 bg-background-secondary p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Recent Activity</h3>
        <div className="space-y-3">
          {activityFeed.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-white/5 bg-background px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <ActivityBadge type={entry.type} />
                <span className="text-sm text-text-primary">{entry.message}</span>
              </div>
              <span className="flex-shrink-0 text-xs text-text-muted">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
