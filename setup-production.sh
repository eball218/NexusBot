#!/bin/bash
# NexusBot Production Setup Script
# Run on a fresh Ubuntu 24.04 server
# Usage: bash setup-production.sh <SERVER_IP>

set -e

SERVER_IP="${1:-$(curl -s ifconfig.me)}"
echo "=== NexusBot Production Setup ==="
echo "Server IP: $SERVER_IP"

# 1. Install system dependencies
echo "[1/8] Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq curl git nginx > /dev/null

# 2. Install Node.js 22
if ! command -v node &> /dev/null; then
  echo "[2/8] Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs > /dev/null
  corepack enable
  corepack prepare pnpm@10.10.0 --activate
  npm install -g tsx pm2 > /dev/null 2>&1
else
  echo "[2/8] Node.js already installed: $(node --version)"
fi

# 3. Clone repo
if [ ! -d "/opt/nexusbot" ]; then
  echo "[3/8] Cloning NexusBot..."
  git clone https://github.com/eball218/NexusBot.git /opt/nexusbot
else
  echo "[3/8] Updating NexusBot..."
  cd /opt/nexusbot && git pull
fi
cd /opt/nexusbot

# 4. Create .env for API
echo "[4/8] Creating API .env..."
cat > .env << ENVEOF
DATABASE_URL=postgresql://postgres.zzphjmjytnbzcdphgpws:d3gUwSeiANS6jcRNs8dn0BCkRnQMut9B@aws-1-us-east-1.pooler.supabase.com:5432/postgres
REDIS_URL=redis://localhost:6379
JWT_SECRET=nexusbot-prod-jwt-k8x9m2p4v7q1w3e6
JWT_REFRESH_SECRET=nexusbot-prod-refresh-j5n8r1t4y7u2i9o3
NEXTAUTH_SECRET=nexusbot-prod-nextauth-b6c9f2h5k8l1n4p7
NEXTAUTH_URL=https://$SERVER_IP
DISCORD_CLIENT_ID=1487664355901177977
DISCORD_CLIENT_SECRET=79lsTXtd-HQhy_RyLNfJlaaIvKDpsRgD
DISCORD_REDIRECT_URI=https://$SERVER_IP/api/auth/callback/discord
TWITCH_CLIENT_ID=f5u2x188rr9bvkel95ly333z65vh5w
TWITCH_CLIENT_SECRET=k7p6zkizjj2sds2swt31qronv47q2e
TWITCH_REDIRECT_URI=https://$SERVER_IP/api/auth/callback/twitch
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
AI_MODEL=claude-sonnet-4-20250514
AI_MAX_TOKENS=1024
RESEND_API_KEY=
EMAIL_FROM=noreply@nexusbot.io
BOT_ENGINE_PORT=4000
BOT_HEALTH_CHECK_INTERVAL=30000
SUPER_ADMIN_EMAIL=admin@nexusbot.io
ADMIN_TOTP_ISSUER=NexusBot
NODE_ENV=production
LOG_LEVEL=info
API_PORT=3001
WEB_PORT=3000
DASHBOARD_PORT=3002
ADMIN_PORT=3003
TOKEN_ENCRYPTION_KEY=nexusbot-prod-enc-m3k7p1r5t9v2x6z0
CORS_ORIGINS=https://$SERVER_IP,https://$SERVER_IP:8443,https://$SERVER_IP:8444
WEB_URL=https://$SERVER_IP
DASHBOARD_URL=https://$SERVER_IP:8443
ENVEOF

# 5. Create Next.js .env.production files (CRITICAL - these get baked into JS at build time)
echo "[5/8] Creating Next.js env files..."
cat > apps/web/.env.production << ENVEOF
NEXT_PUBLIC_API_URL=https://$SERVER_IP/api/v1
NEXT_PUBLIC_WEB_URL=https://$SERVER_IP
NEXT_PUBLIC_DASHBOARD_URL=https://$SERVER_IP:8443
NEXT_PUBLIC_DISCORD_CLIENT_ID=1487664355901177977
NEXT_PUBLIC_TWITCH_CLIENT_ID=f5u2x188rr9bvkel95ly333z65vh5w
ENVEOF

cat > apps/dashboard/.env.production << ENVEOF
NEXT_PUBLIC_API_URL=https://$SERVER_IP/api/v1
NEXT_PUBLIC_WEB_URL=https://$SERVER_IP
NEXT_PUBLIC_DASHBOARD_URL=https://$SERVER_IP:8443
ENVEOF

cat > apps/admin/.env.production << ENVEOF
NEXT_PUBLIC_API_URL=https://$SERVER_IP/api/v1
NEXT_PUBLIC_WEB_URL=https://$SERVER_IP
NEXT_PUBLIC_DASHBOARD_URL=https://$SERVER_IP:8443
NEXT_PUBLIC_ADMIN_URL=https://$SERVER_IP:8444
ENVEOF

# 6. Install and build
echo "[6/8] Installing dependencies and building (this takes ~2 minutes)..."
pnpm install --frozen-lockfile 2>&1 | tail -1
NODE_ENV=production pnpm build 2>&1 | tail -3

# 7. SSL + Nginx
echo "[7/8] Setting up SSL and Nginx..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nexusbot.key \
  -out /etc/ssl/certs/nexusbot.crt \
  -subj "/CN=$SERVER_IP" 2>/dev/null

cat > /etc/nginx/sites-available/nexusbot << 'NGINXEOF'
server {
    listen 80;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/nexusbot.crt;
    ssl_certificate_key /etc/ssl/private/nexusbot.key;
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /health {
        proxy_pass http://127.0.0.1:3001;
    }
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
server {
    listen 8443 ssl;
    ssl_certificate /etc/ssl/certs/nexusbot.crt;
    ssl_certificate_key /etc/ssl/private/nexusbot.key;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
server {
    listen 8444 ssl;
    ssl_certificate /etc/ssl/certs/nexusbot.crt;
    ssl_certificate_key /etc/ssl/private/nexusbot.key;
    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/nexusbot /etc/nginx/sites-enabled/nexusbot
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 8. Start services with PM2
echo "[8/8] Starting services..."
cd /opt/nexusbot
pm2 delete all 2>/dev/null || true
pm2 start tsx --name "nexusbot-api" -- apps/api/src/index.ts
pm2 start npx --name "nexusbot-web" -- next start -p 3000 --prefix apps/web
pm2 start npx --name "nexusbot-dashboard" -- next start -p 3002 --prefix apps/dashboard
pm2 start npx --name "nexusbot-admin" -- next start -p 3003 --prefix apps/admin
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

sleep 5

echo ""
echo "========================================="
echo "  NexusBot Deployment Complete!"
echo "========================================="
echo ""
echo "  Marketing Site:  https://$SERVER_IP"
echo "  Dashboard:       https://$SERVER_IP:8443"
echo "  Admin Panel:     https://$SERVER_IP:8444"
echo "  API Health:      https://$SERVER_IP/health"
echo ""
echo "  Note: Self-signed SSL cert - browser will"
echo "  show a warning. Click 'Advanced' then"
echo "  'Proceed' to continue."
echo ""
echo "  Test API: curl -sk https://$SERVER_IP/health"
echo "========================================="

# Verify
curl -sk https://localhost/health && echo " API OK" || echo " API FAILED - check: pm2 logs nexusbot-api"
