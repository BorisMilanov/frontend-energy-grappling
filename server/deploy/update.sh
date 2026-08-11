#!/usr/bin/env bash
# Pull the latest code and restart the API. Run inside the container:
#   sudo bash /opt/energygrappling/server/deploy/update.sh
set -euo pipefail

APP_DIR=/opt/energygrappling
SERVICE=energygrappling-api

if [[ $EUID -ne 0 ]]; then
	echo "Run with sudo." >&2
	exit 1
fi

git -C "$APP_DIR" pull --ff-only

cd "$APP_DIR/server"
if [[ -f package-lock.json ]]; then
	npm ci --omit=dev --silent
else
	npm install --omit=dev --silent
fi

# Pick up unit-file changes that came with the pull.
install -m 644 "$APP_DIR/server/deploy/$SERVICE.service" /etc/systemd/system/
systemctl daemon-reload
systemctl restart "$SERVICE"

for _ in {1..15}; do
	if curl -fsS --max-time 2 http://127.0.0.1:8000/api/health; then
		echo
		exit 0
	fi
	sleep 1
done

journalctl -u "$SERVICE" -n 40 --no-pager >&2
exit 1
