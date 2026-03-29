export default function UserDetailPage({ params }: { params: { id: string } }) {
  const user = {
    name: 'Alex Rivera',
    email: 'alex@acmegaming.gg',
    role: 'admin',
    tier: 'Ultimate',
    status: 'active',
    signupDate: '2025-08-14',
    avatarInitial: 'AR',
  };

  const loginHistory = [
    { date: '2026-03-28 10:14:02', ip: '192.168.1.42', device: 'Chrome / macOS', location: 'San Francisco, CA' },
    { date: '2026-03-27 08:32:11', ip: '192.168.1.42', device: 'Chrome / macOS', location: 'San Francisco, CA' },
    { date: '2026-03-25 19:05:44', ip: '10.0.0.15', device: 'Safari / iOS', location: 'San Francisco, CA' },
    { date: '2026-03-24 09:22:18', ip: '192.168.1.42', device: 'Chrome / macOS', location: 'San Francisco, CA' },
    { date: '2026-03-22 14:48:33', ip: '172.16.0.8', device: 'Firefox / Windows', location: 'Los Angeles, CA' },
  ];

  const subscriptionHistory = [
    { date: '2026-01-01', event: 'Upgraded to Ultimate', amount: '$99/mo' },
    { date: '2025-10-15', event: 'Upgraded to Pro', amount: '$49/mo' },
    { date: '2025-08-14', event: 'Started Free trial', amount: '$0' },
  ];

  const tickets = [
    { id: 'TK-1042', subject: 'Bot not responding in #gaming channel', status: 'resolved', date: '2026-03-20' },
    { id: 'TK-0987', subject: 'Billing discrepancy on January invoice', status: 'resolved', date: '2026-02-03' },
    { id: 'TK-0834', subject: 'Feature request: Custom emoji reactions', status: 'open', date: '2026-01-15' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-text-muted">User #{params.id}</p>
        <h1 className="text-2xl font-bold text-text-primary">{user.name}</h1>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border border-white/5 bg-background-elevated p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary/10 text-lg font-bold text-accent-primary">
            {user.avatarInitial}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary">{user.name}</h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-full bg-accent-secondary/10 px-3 py-1 text-xs font-medium text-accent-secondary">
              {user.role}
            </span>
            <span className="inline-block rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-medium text-accent-primary">
              {user.tier}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-success">
              <span className="inline-block h-2 w-2 rounded-full bg-success" />
              {user.status}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-text-muted">Member since {user.signupDate}</p>
      </div>

      {/* Login History */}
      <div className="rounded-lg border border-white/5 bg-background-elevated">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Login History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-text-muted">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">IP Address</th>
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((l, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-text-muted">{l.date}</td>
                  <td className="px-5 py-3 font-mono text-xs text-text-secondary">{l.ip}</td>
                  <td className="px-5 py-3 text-text-secondary">{l.device}</td>
                  <td className="px-5 py-3 text-text-secondary">{l.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription History */}
      <div className="rounded-lg border border-white/5 bg-background-elevated">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Subscription History</h2>
        </div>
        <div className="divide-y divide-white/5">
          {subscriptionHistory.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm text-text-primary">{s.event}</p>
                <p className="text-xs text-text-muted">{s.date}</p>
              </div>
              <p className="text-sm font-medium text-text-primary">{s.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Tickets */}
      <div className="rounded-lg border border-white/5 bg-background-elevated">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Support Tickets</h2>
        </div>
        <div className="divide-y divide-white/5">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm text-text-primary">
                  <span className="font-mono text-xs text-text-muted">{t.id}</span>{' '}
                  {t.subject}
                </p>
                <p className="text-xs text-text-muted">{t.date}</p>
              </div>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  t.status === 'open' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                }`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
