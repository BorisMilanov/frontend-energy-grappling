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
SERVICE=energygrappling-api

if [[ $EUID -ne 0 ]]; then
	echo "Run with sudo." >&2
	exit 1
fi

if [[ ! -f "$SERVER_DIR/main.py" ]]; then
	echo "Expected the repo at $APP_DIR (missing $SERVER_DIR/main.py)." >&2
	exit 1
fi

echo "==> Packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
# curl is used by the health check below and by the cloudflared install; a minimal LXC
# template does not ship it. sqlite3 is for backups, git for deploy/update.sh.
apt-get install -y -qq python3 python3-venv python3-pip curl ca-certificates git sqlite3

# The codebase uses PEP 604 unions (`User | None`), so 3.10 is the floor.
python3 - <<'PY' || { echo "Python 3.10+ required." >&2; exit 1; }
import sys
sys.exit(0 if sys.version_info >= (3, 10) else 1)
PY

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
	# token_urlsafe emits only [A-Za-z0-9_-], so it is safe unquoted in an EnvironmentFile.
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
install -m 644 "$SERVER_DIR/deploy/$SERVICE.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --quiet "$SERVICE"
# restart, not `enable --now`: on a re-run the service is already active and would keep
# running the old unit file and the old code.
systemctl restart "$SERVICE"

echo "==> Waiting for the API to answer"
for attempt in {1..15}; do
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
