'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    // TODO: Call API /auth/verify-email
    // Simulate for now
    const timer = setTimeout(() => setStatus('success'), 1500);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="w-full max-w-sm text-center">
      {status === 'verifying' && (
        <>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
          <h1 className="text-2xl font-bold text-text-primary">Verifying your email...</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Email verified!</h1>
          <p className="mt-2 text-sm text-text-muted">Your account is now active.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-2.5 text-sm font-semibold text-white"
          >
            Continue to Login
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
            <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Verification failed</h1>
          <p className="mt-2 text-sm text-text-muted">The link may have expired or is invalid.</p>
          <Link href="/login" className="mt-6 inline-block text-sm text-accent-primary hover:underline">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
        <h1 className="text-2xl font-bold text-text-primary">Loading...</h1>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
