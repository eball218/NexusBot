'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'Is my data safe?',
    a: 'Yes. All data is encrypted in transit and at rest. We never share your data with third parties. GDPR deletion requests are honored within 48 hours.',
  },
  {
    q: 'What happens after my free trial?',
    a: 'Your bot disconnects automatically. No charge, no surprise bills. Your configuration and data are preserved for 30 days so you can upgrade and pick up where you left off.',
  },
  {
    q: 'Can I switch between Twitch and Discord on the Basic plan?',
    a: 'Yes, you can switch your connected platform once per billing cycle from the Connections page in your dashboard.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Absolutely. All paid plans come with a 7-day money-back guarantee. No questions asked. Contact support or cancel from your dashboard.',
  },
  {
    q: 'Can I have multiple bots?',
    a: 'Each subscription covers one bot instance. Need more? Contact us for volume pricing — we offer discounts for multi-bot setups.',
  },
  {
    q: 'How does the AI memory work?',
    a: "NexusBot uses a three-tier memory system: short-term (current conversation context), long-term (facts about users and your community stored across sessions), and personality memory (your bot's configured traits and lore). Pro users get short-term memory; Ultimate users get the full system.",
  },
  {
    q: 'Can I use my own API key?',
    a: "Not yet, but it's on our roadmap for power users. Currently all AI is powered through our managed infrastructure for the best experience.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-text-primary sm:text-base">{q}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-text-secondary">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQAccordion() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-text-primary sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        <div className="mt-12">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
