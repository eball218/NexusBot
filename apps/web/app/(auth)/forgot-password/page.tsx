'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API /auth/forgot-password
    setSent(true);
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Check your email</h1>
        <p className="mt-2 text-sm text-text-muted">
          If an account exists with that email, we&apos;ve sent a password reset link.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-accent-primary hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-center text-2xl font-bold text-text-primary">Reset your password</h1>
      <p className="mt-2 text-center text-sm text-text-muted">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary py-2.5 text-sm font-semibold text-white"
        >
          Send Reset Link
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/login" className="text-accent-primary hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
