import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0e1a',
          secondary: '#111827',
          elevated: '#1a1f36',
        },
        border: {
          DEFAULT: '#1e293b',
          glow: 'rgba(59, 130, 246, 0.2)',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        accent: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        twitch: '#9146ff',
        discord: '#5865f2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
