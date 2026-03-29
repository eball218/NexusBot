# NexusBot

A production-grade, multi-tenant SaaS platform selling AI-powered moderation and chatbot services for Twitch streamers and Discord server owners.

## Architecture

```
nexusbot/
├── apps/
│   ├── web/          # Marketing site (Next.js 14, Tailwind, Framer Motion)
│   ├── dashboard/    # Customer dashboard (Next.js 14, Tailwind)
│   ├── admin/        # Super admin panel (Next.js 14, Tailwind)
│   ├── api/          # REST API (Fastify, Drizzle ORM)
│   └── bot-engine/   # Bot orchestration (discord.js, @twurple, Anthropic SDK)
├── packages/
│   ├── db/           # Database schema (Drizzle ORM, PostgreSQL)
│   ├── shared/       # Types, constants, utilities
│   └── ui/           # Shared UI components
```

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 14 (App Router) + Tailwind CSS + Framer Motion |
| Backend API | Fastify + TypeScript + Zod validation |
| Database | PostgreSQL 16 (27 tables via Drizzle ORM) |
| Cache/Queue | Redis (rate limiting, usage tracking) |
| Payments | Stripe + PayPal |
| Bot Runtime | discord.js v14, @twurple/chat, Anthropic SDK |
| Email | Resend (transactional) |
| Auth | JWT (access + refresh tokens), Discord/Twitch OAuth |

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose (for local PostgreSQL + Redis)
- Stripe account (for payments)
- Anthropic API key (for AI features)

## Quick Start

```bash
# Clone and install
git clone <repo-url> nexusbot
cd nexusbot
pnpm install

# Start infrastructure
docker compose up -d

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Generate and run database migrations
pnpm db:generate
pnpm db:migrate

# Build all packages
pnpm build

# Start development servers
pnpm dev
```

## Development

```bash
# Start all dev servers (Turborepo runs them in parallel)
pnpm dev

# Build everything
pnpm build

# Typecheck
pnpm typecheck

# Database commands
pnpm db:generate    # Generate migrations from schema
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema directly (dev only)
```

### Service Ports

| Service | Port | URL |
|---|---|---|
| Marketing Site | 3000 | http://localhost:3000 |
| API | 3001 | http://localhost:3001 |
| Customer Dashboard | 3002 | http://localhost:3002 |
| Admin Panel | 3003 | http://localhost:3003 |
| Bot Engine | 4000 | http://localhost:4000 |
| PostgreSQL | 5432 | - |
| Redis | 6379 | - |

## Database

27 tables organized into domains:

- **Auth**: users, oauth_accounts, sessions, email_verifications, password_resets
- **Tenants**: tenants, subscriptions, invoices, payment_methods
- **Bot**: bot_instances, platform_connections, ai_personalities, personality_presets
- **Moderation**: community_users, mod_rules, mod_actions, mod_appeals
- **AI**: ai_conversations, ai_messages, ai_memories
- **Scheduler**: cron_jobs, cron_job_logs
- **System**: feature_flags, system_config, announcements, api_keys, audit_log

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Email/password signup
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Current user profile
- `POST /api/v1/auth/oauth/discord` - Discord OAuth
- `POST /api/v1/auth/oauth/twitch` - Twitch OAuth

### Billing
- `GET /api/v1/billing/plans` - Available plans
- `GET /api/v1/billing/subscription` - Current subscription
- `POST /api/v1/billing/subscribe` - Create subscription
- `POST /api/v1/billing/upgrade` - Upgrade plan
- `POST /api/v1/billing/cancel` - Cancel subscription
- `POST /api/v1/billing/reactivate` - Reactivate
- `GET /api/v1/billing/invoices` - Invoice history
- `POST /api/v1/billing/stripe/portal` - Stripe customer portal

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe events
- `POST /api/v1/webhooks/paypal` - PayPal events

### Admin (super_admin only)
- `GET /api/v1/admin/dashboard` - KPI data
- `GET/PUT /api/v1/admin/tenants/:id` - Tenant management
- `POST /api/v1/admin/tenants/:id/impersonate` - Impersonate tenant
- `GET /api/v1/admin/revenue` - Revenue analytics
- `GET /api/v1/admin/bots` - Bot fleet status
- `GET/PUT /api/v1/admin/system/feature-flags` - Feature flags
- `POST /api/v1/admin/announcements` - Push announcements

## Subscription Tiers

| Tier | Price | Platforms | AI | Cron Jobs | Moderation |
|---|---|---|---|---|---|
| Starter (Free) | $0 (14-day trial) | 1 | 5 msg/hr, no memory | 3 max | Basic filters |
| Pro | $12/mo | 1 | Unlimited, short-term memory | 10 max | Full + escalation |
| Nexus Ultimate | $29/mo | Both | Unlimited + long-term memory | Unlimited | Full + ban sync + toxicity |

## Production Deployment

```bash
# Build and start with Docker Compose
docker compose -f docker-compose.prod.yml up -d --build

# Or build individual images
docker build -f Dockerfile.api -t nexusbot-api .
docker build -f Dockerfile.web -t nexusbot-web .
docker build -f Dockerfile.dashboard -t nexusbot-dashboard .
docker build -f Dockerfile.admin -t nexusbot-admin .
docker build -f Dockerfile.bot-engine -t nexusbot-bot-engine .
```

## Environment Variables

See `.env.example` for the full list. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Auth secrets
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe
- `ANTHROPIC_API_KEY` - AI features
- `RESEND_API_KEY` - Transactional emails
- `DISCORD_CLIENT_ID` / `TWITCH_CLIENT_ID` - OAuth

## License

Private. All rights reserved.
