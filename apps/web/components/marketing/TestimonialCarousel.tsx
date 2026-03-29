'use client';

import { motion } from 'framer-motion';

// Placeholder testimonials — marked for replacement with real ones
const testimonials = [
  {
    quote: 'NexusBot completely changed how I moderate my stream. I can finally focus on content instead of chat policing.',
    name: 'Alex Rivera',
    handle: '@alexstreams',
    platform: 'twitch' as const,
    rating: 5,
  },
  {
    quote: "The AI memory is insane. My bot remembers regulars and their inside jokes. It feels like a real community member.",
    name: 'Jordan Patel',
    handle: '@jordanp',
    platform: 'discord' as const,
    rating: 5,
  },
  {
    quote: "Cross-platform ban sync alone is worth the price. Someone acts up on Twitch? Gone from Discord too. Instant.",
    name: 'Sam Nguyen',
    handle: '@samnguyen_live',
    platform: 'twitch' as const,
    rating: 5,
  },
  {
    quote: "I tried 4 other bots before NexusBot. None of them had the personality editor or the scheduling features. This is the one.",
    name: 'Casey Brooks',
    handle: '@caseyb',
    platform: 'discord' as const,
    rating: 5,
  },
];

export function TestimonialCarousel() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-text-primary sm:text-5xl">
            Loved by Creators
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            Hear from streamers and server owners who transformed their communities.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-primary/40 to-accent-secondary/40" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-text-muted">
                    {t.handle}
                    <span className={`inline-block h-3 w-3 rounded-sm ${t.platform === 'twitch' ? 'bg-twitch' : 'bg-discord'}`} />
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
