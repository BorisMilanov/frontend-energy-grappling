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
VENV_DIR="$APP_DIR/venv"
DATA_DIR=/var/lib/energygrappling
APP_USER=energygrappling

if [[ $EUID -ne 0 ]]; then
	echo "Run with sudo." >&2
	exit 1
fi

if [[ ! -f "$SERVER_DIR/main.py" ]]; then
	echo "Expected the repo at $APP_DIR (missing $SERVER_DIR/main.py)." >&2
	exit 1
fi

echo "==> Packages"
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip

echo "==> Service user and data dir"
id -u "$APP_USER" &>/dev/null || useradd --system --no-create-home --shell /usr/sbin/nologin "$APP_USER"
install -d -o "$APP_USER" -g "$APP_USER" -m 750 "$DATA_DIR"

echo "==> Virtualenv"
[[ -d "$VENV_DIR" ]] || python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/pip" install --quiet --upgrade pip
"$VENV_DIR/bin/pip" install --quiet -r "$SERVER_DIR/requirements.txt"

if [[ ! -f "$SERVER_DIR/.env" ]]; then
	echo "==> Generating .env with a random JWT secret"
	secret=$("$VENV_DIR/bin/python" -c "import secrets; print(secrets.token_urlsafe(48))")
	cat >"$SERVER_DIR/.env" <<EOF
ENVIRONMENT=production
JWT_SECRET=$secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:////var/lib/energygrappling/app.db
CORS_ORIGINS=https://energygrappling.com,https://www.energygrappling.com
EOF
else
	echo "==> Keeping existing .env"
fi

chown root:"$APP_USER" "$SERVER_DIR/.env"
chmod 640 "$SERVER_DIR/.env"

echo "==> systemd unit"
install -m 644 "$SERVER_DIR/deploy/energygrappling-api.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now energygrappling-api

sleep 2
systemctl is-active --quiet energygrappling-api && echo "==> Service is running" || {
	echo "Service failed to start. Logs:" >&2
	journalctl -u energygrappling-api -n 30 --no-pager >&2
	exit 1
}

curl -fsS http://127.0.0.1:8000/api/health && echo
echo "==> Done. Expose it with Cloudflare Tunnel or Caddy (see server/deploy/)."
