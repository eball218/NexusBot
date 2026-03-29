'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent-primary/[0.03] to-background" />
      <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-text-primary sm:text-6xl">
            Your Community Is Waiting.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary">
            Start your free 14-day trial. No credit card required. Your bot is ready to go live in under 2 minutes.
          </p>

          <div className="mt-10">
            <Link
              href="/register"
              className="group relative inline-flex h-16 items-center overflow-hidden rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary px-12 text-xl font-bold text-white shadow-2xl shadow-blue-500/30 transition-all hover:shadow-3xl hover:shadow-blue-500/40"
            >
              <span className="relative z-10">Start Free Trial &rarr;</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>

          <p className="mt-6 text-sm text-text-muted">
            Join <span className="font-semibold text-text-secondary">2,000+</span> creators who trust NexusBot
          </p>
        </motion.div>
      </div>
    </section>
  );
}
