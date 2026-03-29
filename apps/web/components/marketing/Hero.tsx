'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-accent-primary/20 blur-[100px]" />
      <div className="absolute -right-40 top-20 h-80 w-80 rounded-full bg-accent-secondary/20 blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[80px]" />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16 text-center">
      <GridBackground />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-text-secondary backdrop-blur-sm"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
          Now with cross-platform ban sync
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl md:text-8xl"
        >
          <span className="text-text-primary">Your Community Deserves</span>
          <br />
          <span className="bg-gradient-to-r from-accent-primary via-purple-400 to-accent-secondary bg-clip-text text-transparent">
            An AI That Actually Gets It.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary sm:text-xl"
        >
          NexusBot is the AI-powered moderation and engagement platform for Twitch and Discord.
          It learns your community. It protects your space. It never sleeps.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/register"
            className="group relative inline-flex h-14 items-center overflow-hidden rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-10 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
          >
            <span className="relative z-10">Start Your Free 14-Day Trial &rarr;</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <button className="inline-flex h-14 items-center gap-2 rounded-xl border border-white/10 px-8 text-lg font-semibold text-slate-200 transition-all hover:bg-white/5 hover:border-white/20">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Watch Demo
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-12 flex flex-col items-center gap-3"
        >
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-accent-primary/60 to-accent-secondary/60"
              />
            ))}
          </div>
          <p className="text-sm text-text-muted">
            Trusted by <span className="font-semibold text-text-secondary">2,000+</span> streamers and server owners
          </p>
        </motion.div>
      </div>
    </section>
  );
}
