export default function PayoutsPage() {
  const payouts = [
    { date: '2026-03-15', amount: '$4,280.00', provider: 'Stripe', status: 'Completed', referenceId: 'PO-20260315-001' },
    { date: '2026-03-01', amount: '$3,910.50', provider: 'Stripe', status: 'Completed', referenceId: 'PO-20260301-001' },
    { date: '2026-02-15', amount: '$4,102.00', provider: 'PayPal', status: 'Completed', referenceId: 'PO-20260215-001' },
    { date: '2026-02-01', amount: '$3,750.25', provider: 'Stripe', status: 'Completed', referenceId: 'PO-20260201-001' },
    { date: '2026-01-15', amount: '$3,680.00', provider: 'PayPal', status: 'Pending', referenceId: 'PO-20260115-001' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Payouts</h1>
        <p className="mt-1 text-sm text-text-secondary">Payout history and status tracking.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/5 bg-background-elevated">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-text-muted">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Provider</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Reference ID</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 text-text-secondary">{p.date}</td>
                <td className="px-5 py-3 text-text-primary font-medium">{p.amount}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.provider === 'Stripe'
                        ? 'bg-accent-secondary/10 text-accent-secondary'
                        : 'bg-accent-primary/10 text-accent-primary'
                    }`}
                  >
                    {p.provider}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'Completed'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-text-muted">{p.referenceId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
