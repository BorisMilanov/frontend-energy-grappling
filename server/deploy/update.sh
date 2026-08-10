#!/usr/bin/env bash
# Pull the latest code and restart the API. Run inside the container:
#   sudo bash /opt/energygrappling/server/deploy/update.sh
set -euo pipefail

APP_DIR=/opt/energygrappling

if [[ $EUID -ne 0 ]]; then
	echo "Run with sudo." >&2
	exit 1
fi

git -C "$APP_DIR" pull --ff-only
"$APP_DIR/venv/bin/pip" install --quiet -r "$APP_DIR/server/requirements.txt"
systemctl restart energygrappling-api

sleep 2
systemctl is-active --quiet energygrappling-api || {
	journalctl -u energygrappling-api -n 30 --no-pager >&2
	exit 1
}
curl -fsS http://127.0.0.1:8000/api/health && echo
