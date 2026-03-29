'use client';

import { useEffect, useState } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const token = localStorage.getItem('nexusbot_access_token');
    if (token) {
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
      window.location.href = 'http://localhost:3000/login';
    }
  }, []);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-500" />
      </div>
    );
  }

  return <>{children}</>;
}
