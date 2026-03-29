'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setTokens } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tokens = await api<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setTokens(tokens.accessToken, tokens.refreshToken);
      // Pass tokens via URL params since dashboard is on a different port (different localStorage)
      window.location.href = `http://localhost:3002?token=${encodeURIComponent(tokens.accessToken)}&refresh=${encodeURIComponent(tokens.refreshToken)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'discord' | 'twitch') => {
    const clientId = provider === 'discord'
      ? process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1487664355901177977'
      : process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || 'f5u2x188rr9bvkel95ly333z65vh5w';

    if (provider === 'discord') {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: 'http://localhost:3000/api/auth/callback/discord',
        response_type: 'code',
        scope: 'identify email guilds',
      });
      window.location.href = `https://discord.com/api/oauth2/authorize?${params}`;
    } else {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: 'http://localhost:3000/api/auth/callback/twitch',
        response_type: 'code',
        scope: 'user:read:email',
      });
      window.location.href = `https://id.twitch.tv/oauth2/authorize?${params}`;
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-center text-2xl font-bold text-text-primary">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-text-muted">
        Log in to manage your bot
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-accent-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-text-muted">or continue with</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleOAuth('discord')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/10"
        >
          <svg className="h-4 w-4 text-discord" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
          </svg>
          Discord
        </button>
        <button
          onClick={() => handleOAuth('twitch')}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/10"
        >
          <svg className="h-4 w-4 text-twitch" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
          </svg>
          Twitch
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-accent-primary hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
