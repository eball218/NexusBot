import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
dotenvConfig({ path: resolve(import.meta.dirname, '../../../.env') });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('API_PORT', '3001'), 10),
  logLevel: optional('LOG_LEVEL', 'info'),

  database: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },

  oauth: {
    discord: {
      clientId: optional('DISCORD_CLIENT_ID', ''),
      clientSecret: optional('DISCORD_CLIENT_SECRET', ''),
      redirectUri: optional('DISCORD_REDIRECT_URI', ''),
    },
    twitch: {
      clientId: optional('TWITCH_CLIENT_ID', ''),
      clientSecret: optional('TWITCH_CLIENT_SECRET', ''),
      redirectUri: optional('TWITCH_REDIRECT_URI', ''),
    },
  },

  email: {
    from: optional('EMAIL_FROM', 'noreply@nexusbot.io'),
    resendApiKey: optional('RESEND_API_KEY', ''),
  },

  encryption: {
    tokenKey: optional('TOKEN_ENCRYPTION_KEY', 'dev-key-change-in-production-32b'),
  },

  cors: {
    origins: optional('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3002,http://localhost:3003').split(','),
  },

  rateLimit: {
    user: { max: 100, timeWindow: '1 minute' },
    admin: { max: 1000, timeWindow: '1 minute' },
    auth: { max: 10, timeWindow: '1 minute' },
  },

  stripe: {
    secretKey: optional('STRIPE_SECRET_KEY', ''),
    webhookSecret: optional('STRIPE_WEBHOOK_SECRET', ''),
    prices: {
      proMonthly: optional('STRIPE_PRO_MONTHLY_PRICE_ID', ''),
      proAnnual: optional('STRIPE_PRO_ANNUAL_PRICE_ID', ''),
      ultimateMonthly: optional('STRIPE_ULTIMATE_MONTHLY_PRICE_ID', ''),
      ultimateAnnual: optional('STRIPE_ULTIMATE_ANNUAL_PRICE_ID', ''),
    },
  },

  paypal: {
    clientId: optional('PAYPAL_CLIENT_ID', ''),
    clientSecret: optional('PAYPAL_CLIENT_SECRET', ''),
    webhookId: optional('PAYPAL_WEBHOOK_ID', ''),
    plans: {
      proMonthly: optional('PAYPAL_PRO_MONTHLY_PLAN_ID', ''),
      proAnnual: optional('PAYPAL_PRO_ANNUAL_PLAN_ID', ''),
      ultimateMonthly: optional('PAYPAL_ULTIMATE_MONTHLY_PLAN_ID', ''),
      ultimateAnnual: optional('PAYPAL_ULTIMATE_ANNUAL_PLAN_ID', ''),
    },
  },

  superAdmin: {
    email: optional('SUPER_ADMIN_EMAIL', ''),
  },

  app: {
    webUrl: optional('WEB_URL', 'http://localhost:3000'),
    dashboardUrl: optional('DASHBOARD_URL', 'http://localhost:3002'),
  },
} as const;
