#!/bin/bash
# NexusBot Production Deployment Script
# Run this on a fresh Ubuntu 24.04 server

set -e

echo "=== NexusBot Deployment ==="

# 1. Install Docker
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "Docker installed."
fi

# 2. Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
  echo "Installing Docker Compose..."
  apt-get install -y docker-compose-plugin
fi

# 3. Install Node.js 22 + pnpm (needed for building)
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  corepack enable
  corepack prepare pnpm@10.10.0 --activate
  echo "Node.js + pnpm installed."
fi

# 4. Install Nginx
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  apt-get install -y nginx
  systemctl enable nginx
fi

# 5. Clone repo (if not already cloned)
if [ ! -d "/opt/nexusbot" ]; then
  echo "Cloning NexusBot..."
  git clone https://github.com/eball218/NexusBot.git /opt/nexusbot
else
  echo "Updating NexusBot..."
  cd /opt/nexusbot && git pull
fi

cd /opt/nexusbot

# 6. Check for .env
if [ ! -f ".env" ]; then
  echo ""
  echo "ERROR: .env file not found!"
  echo "Copy .env.example to .env and fill in your credentials:"
  echo "  cp .env.example .env"
  echo "  nano .env"
  echo ""
  exit 1
fi

# 7. Install dependencies and build
echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building all packages..."
pnpm build

# 8. Start services with PM2 or direct node
echo "Starting API server..."
nohup node apps/api/dist/index.js > /var/log/nexusbot-api.log 2>&1 &

echo "Starting web server..."
cd apps/web && nohup npx next start -p 3000 > /var/log/nexusbot-web.log 2>&1 &
cd /opt/nexusbot

echo "Starting dashboard..."
cd apps/dashboard && nohup npx next start -p 3002 > /var/log/nexusbot-dashboard.log 2>&1 &
cd /opt/nexusbot

echo "Starting admin..."
cd apps/admin && nohup npx next start -p 3003 > /var/log/nexusbot-admin.log 2>&1 &
cd /opt/nexusbot

echo ""
echo "=== NexusBot Deployed ==="
echo "Web:       http://YOUR_IP:3000"
echo "API:       http://YOUR_IP:3001"
echo "Dashboard: http://YOUR_IP:3002"
echo "Admin:     http://YOUR_IP:3003"
