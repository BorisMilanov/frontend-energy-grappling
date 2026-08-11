#!/usr/bin/env bash
# Provision the API inside a fresh Ubuntu LXC container. Idempotent: safe to re-run.
#
#   git clone <repo> /opt/energygrappling
#   sudo bash /opt/energygrappling/server/deploy/install.sh
#
# Does NOT touch an existing .env or database.
set -euo pipefail

APP_DIR=/opt/energygrappling
SERVER_DIR="$APP_DIR/server"
DATA_DIR=/var/lib/energygrappling
APP_USER=energygrappling
SERVICE=energygrappling-api
NODE_MAJOR=24 # node:sqlite is stable from 24; the app requires >= 22.5

if [[ $EUID -ne 0 ]]; then
	echo "Run with sudo." >&2
	exit 1
fi

if [[ ! -f "$SERVER_DIR/src/index.js" ]]; then
	echo "Expected the repo at $APP_DIR (missing $SERVER_DIR/src/index.js)." >&2
	exit 1
fi

echo "==> Packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl ca-certificates git sqlite3

# Ubuntu's own nodejs package is too old for node:sqlite; use NodeSource.
if ! command -v node >/dev/null || [[ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]]; then
	echo "==> Installing Node $NODE_MAJOR"
	curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
	apt-get install -y -qq nodejs
fi
node --version

echo "==> Service user and data dir"
id -u "$APP_USER" &>/dev/null || useradd --system --no-create-home --shell /usr/sbin/nologin "$APP_USER"
install -d -o "$APP_USER" -g "$APP_USER" -m 750 "$DATA_DIR"

echo "==> Dependencies"
cd "$SERVER_DIR"
# npm ci needs a lockfile; fall back to install on a fresh checkout without one.
if [[ -f package-lock.json ]]; then
	npm ci --omit=dev --silent
else
	npm install --omit=dev --silent
fi

if [[ ! -f "$SERVER_DIR/.env" ]]; then
	echo "==> Generating .env with a random JWT secret"
	secret=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")
	# base64url emits only [A-Za-z0-9_-], safe unquoted in an EnvironmentFile.
	cat >"$SERVER_DIR/.env" <<EOF
NODE_ENV=production
PORT=8000
JWT_SECRET=$secret
JWT_EXPIRES_IN=1h
DATABASE_FILE=/var/lib/energygrappling/app.db
# No CORS setting: the allowed origins are fixed in code (ALLOWED_ORIGINS in src/config.js).
EOF
else
	echo "==> Keeping existing .env"
fi

chown root:"$APP_USER" "$SERVER_DIR/.env"
chmod 640 "$SERVER_DIR/.env"

echo "==> systemd unit"
install -m 644 "$SERVER_DIR/deploy/$SERVICE.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --quiet "$SERVICE"
# restart, not `enable --now`: on a re-run the service is already active and would keep
# running the old unit file and the old code.
systemctl restart "$SERVICE"

echo "==> Waiting for the API to answer"
for _ in {1..15}; do
	if curl -fsS --max-time 2 http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
		echo "==> Healthy: $(curl -fsS http://127.0.0.1:8000/api/health)"
		echo "==> Done. Expose it with Cloudflare Tunnel or Caddy (see server/deploy/)."
		exit 0
	fi
	# A crash loop keeps the unit in "activating", so check the state as well as the port.
	if [[ "$(systemctl is-failed "$SERVICE" || true)" == "failed" ]]; then
		break
	fi
	sleep 1
done

echo "Service did not become healthy. Recent logs:" >&2
journalctl -u "$SERVICE" -n 40 --no-pager >&2
exit 1
