export default function UpgradePage() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      priceNote: 'forever',
      current: false,
      features: [
        '1 platform connection',
        '5 AI messages/hr',
        '3 cron jobs',
        'Basic moderation rules',
        'Community support',
        '7-day log retention',
      ],
    },
    {
      name: 'Pro',
      price: '$12',
      priceNote: '/month',
      current: true,
      features: [
        '2 platform connections',
        '25 AI messages/hr',
        '15 cron jobs',
        'Advanced moderation + AI',
        'Priority support',
        '30-day log retention',
        'Custom commands',
        'Analytics dashboard',
      ],
    },
    {
      name: 'Ultimate',
      price: '$29',
      priceNote: '/month',
      current: false,
      features: [
        'Unlimited connections',
        'Unlimited AI messages',
        'Unlimited cron jobs',
        'Full moderation suite',
        'Dedicated support',
        '90-day log retention',
        'Custom commands',
        'Advanced analytics + export',
        'API access',
        'Memory / knowledge base',
        'White-label options',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <a href="/billing" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Billing</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Choose Your Plan</h1>
        <p className="mt-1 text-sm text-text-muted">Select the plan that fits your needs</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border p-6 space-y-5 ${
              plan.current
                ? 'border-accent-primary/40 bg-accent-primary/5'
                : 'border-white/5 bg-background-elevated'
            }`}
          >
            {plan.current && (
              <span className="absolute -top-2.5 left-4 rounded-full bg-accent-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                CURRENT PLAN
              </span>
            )}

            <div>
              <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
              <p className="mt-1">
                <span className="text-2xl font-bold text-text-primary">{plan.price}</span>
                <span className="text-sm text-text-muted">{plan.priceNote}</span>
              </p>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-0.5 text-success">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium ${
                plan.current
                  ? 'border border-white/10 text-text-muted cursor-default'
                  : plan.name === 'Ultimate'
                  ? 'bg-accent-primary text-white hover:opacity-90'
                  : 'border border-white/10 text-text-secondary hover:bg-white/5'
              }`}
              disabled={plan.current}
            >
              {plan.current ? 'Current Plan' : plan.name === 'Starter' ? 'Downgrade' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
