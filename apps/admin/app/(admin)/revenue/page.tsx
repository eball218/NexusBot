export default function RevenueDashboardPage() {
  const kpis = [
    { label: 'MRR', value: '$18,340', change: '+4.2%', up: true },
    { label: 'ARR', value: '$220K', change: '+12.1%', up: true },
    { label: 'Avg Revenue Per User', value: '$12.89', change: '-0.3%', up: false },
    { label: 'LTV', value: '$154', change: '+6.8%', up: true },
  ];

  const failedPayments = [
    { tenant: 'Acme Gaming', amount: '$49.00', date: '2026-03-26', retryStatus: 'Scheduled' },
    { tenant: 'StreamPro Inc', amount: '$29.00', date: '2026-03-25', retryStatus: 'Failed' },
    { tenant: 'NightOwl Studios', amount: '$99.00', date: '2026-03-24', retryStatus: 'Retrying' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Revenue</h1>
        <p className="mt-1 text-sm text-text-secondary">Financial overview and payment analytics.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-white/5 bg-background-elevated p-5"
          >
            <p className="text-sm text-text-muted">{kpi.label}</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{kpi.value}</p>
            <p className={`mt-1 text-xs font-medium ${kpi.up ? 'text-success' : 'text-danger'}`}>
              {kpi.change} vs last month
            </p>
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-background-elevated">
          <div className="text-center">
            <div className="text-3xl text-text-muted">&#9776;</div>
            <p className="mt-2 text-sm text-text-muted">MRR by Tier</p>
            <p className="text-xs text-text-muted">Chart placeholder</p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-background-elevated">
          <div className="text-center">
            <div className="text-3xl text-text-muted">&#9776;</div>
            <p className="mt-2 text-sm text-text-muted">Churn Analysis</p>
            <p className="text-xs text-text-muted">Chart placeholder</p>
          </div>
        </div>
      </div>

      {/* Failed Payments */}
      <div className="rounded-lg border border-white/5 bg-background-elevated">
        <div className="border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-semibold text-text-primary">Failed Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-text-muted">
                <th className="px-5 py-3 font-medium">Tenant</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Retry Status</th>
              </tr>
            </thead>
            <tbody>
              {failedPayments.map((p, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 text-text-primary">{p.tenant}</td>
                  <td className="px-5 py-3 text-text-primary">{p.amount}</td>
                  <td className="px-5 py-3 text-text-secondary">{p.date}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.retryStatus === 'Scheduled'
                          ? 'bg-warning/10 text-warning'
                          : p.retryStatus === 'Failed'
                            ? 'bg-danger/10 text-danger'
                            : 'bg-accent-primary/10 text-accent-primary'
                      }`}
                    >
                      {p.retryStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
