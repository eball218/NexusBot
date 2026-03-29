'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const tiers = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for trying out NexusBot',
    badge: null,
    cta: 'Start Free Trial',
    ctaHref: '/register',
    highlighted: false,
    features: [
      { text: '14-day free trial', included: true },
      { text: '1 platform (Twitch OR Discord)', included: true },
      { text: '5 AI messages per hour', included: true },
      { text: '3 cron jobs max', included: true },
      { text: 'Basic moderation filters', included: true },
      { text: 'AI memory', included: false },
      { text: 'Persona presets', included: false },
      { text: 'Cross-platform sync', included: false },
      { text: 'AI toxicity scoring', included: false },
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 12, annual: 120 },
    description: 'For serious streamers and server owners',
    badge: 'Most Popular',
    cta: 'Subscribe Now',
    ctaHref: '/register?plan=pro',
    highlighted: true,
    features: [
      { text: '1 platform (Twitch OR Discord)', included: true },
      { text: 'Unlimited AI messages', included: true },
      { text: '10 cron jobs max', included: true },
      { text: 'Full moderation + escalation', included: true },
      { text: 'Short-term AI memory', included: true },
      { text: '3 persona presets', included: true },
      { text: 'API access', included: true },
      { text: 'Cross-platform sync', included: false },
      { text: 'AI toxicity scoring', included: false },
    ],
  },
  {
    name: 'Nexus Ultimate',
    price: { monthly: 29, annual: 290 },
    description: 'The full NexusBot experience',
    badge: null,
    cta: 'Go Ultimate',
    ctaHref: '/register?plan=ultimate',
    highlighted: false,
    features: [
      { text: 'Both platforms (Twitch + Discord)', included: true },
      { text: 'Unlimited AI messages', included: true },
      { text: 'Unlimited cron jobs', included: true },
      { text: 'Full moderation + AI toxicity', included: true },
      { text: 'Long-term AI memory', included: true },
      { text: 'Unlimited persona presets', included: true },
      { text: 'Cross-platform ban sync', included: true },
      { text: 'Cross-platform context', included: true },
      { text: 'API access', included: true },
    ],
  },
];

export function PricingTable() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-text-primary sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            Start free, upgrade when you're ready. All paid plans include a 7-day money-back guarantee.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                !annual ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                annual ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Annual
              <span className="ml-1.5 inline-flex rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.highlighted
                  ? 'border-accent-primary/50 bg-accent-primary/[0.03] shadow-lg shadow-accent-primary/10'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              {/* Animated gradient border for highlighted */}
              {tier.highlighted && (
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-accent-primary/50 via-transparent to-accent-secondary/50 opacity-50" style={{ zIndex: -1 }} />
              )}

              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-1 text-xs font-semibold text-white">
                  {tier.badge}
                </span>
              )}

              <div>
                <h3 className="text-lg font-semibold text-text-primary">{tier.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{tier.description}</p>
              </div>

              <div className="mt-6">
                <span className="text-5xl font-bold text-text-primary">
                  ${annual ? Math.round(tier.price.annual / 12) : tier.price.monthly}
                </span>
                {tier.price.monthly > 0 && (
                  <span className="text-text-muted">/mo</span>
                )}
                {annual && tier.price.annual > 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    ${tier.price.annual}/year billed annually
                  </p>
                )}
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2">
                    {feature.included ? (
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={`text-sm ${feature.included ? 'text-text-secondary' : 'text-text-muted/50'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={`mt-8 flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30'
                    : 'border border-white/10 text-text-primary hover:bg-white/5'
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-muted">
          All plans include a 7-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
}
