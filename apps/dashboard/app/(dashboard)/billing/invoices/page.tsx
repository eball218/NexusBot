export default function InvoicesPage() {
  const invoices = [
    { id: 'INV-2026-003', date: 'Mar 15, 2026', amount: '$12.00', status: 'paid', provider: 'Stripe' },
    { id: 'INV-2026-002', date: 'Feb 15, 2026', amount: '$12.00', status: 'paid', provider: 'Stripe' },
    { id: 'INV-2026-001', date: 'Jan 15, 2026', amount: '$12.00', status: 'paid', provider: 'Stripe' },
    { id: 'INV-2025-012', date: 'Dec 15, 2025', amount: '$12.00', status: 'paid', provider: 'Stripe' },
    { id: 'INV-2025-011', date: 'Nov 15, 2025', amount: '$9.00', status: 'paid', provider: 'Stripe' },
    { id: 'INV-2025-010', date: 'Oct 15, 2025', amount: '$9.00', status: 'paid', provider: 'PayPal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <a href="/billing" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Billing</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Invoices</h1>
        <p className="mt-1 text-sm text-text-muted">Your payment history</p>
      </div>

      <div className="rounded-xl border border-white/5 bg-background-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Invoice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Provider</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-text-secondary">{inv.date}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-primary">{inv.id}</td>
                <td className="px-4 py-3 font-medium text-text-primary">{inv.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      inv.status === 'paid'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {inv.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">{inv.provider}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-accent-primary hover:underline">Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
