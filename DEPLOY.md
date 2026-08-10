# Deploying energygrappling.com

Two halves, deployed independently:

| Part                        | Runs on                              | Public hostname                                     |
| --------------------------- | ------------------------------------ | --------------------------------------------------- |
| `client/` — React SPA       | Cloudflare Workers (static assets)   | `energygrappling.com`, `www.energygrappling.com`     |
| `server/` — FastAPI + chat  | Ubuntu LXC on Proxmox                | `api.energygrappling.com`                            |

The frontend calls the API by absolute URL (`VITE_API_URL`), so the two never need to
share a host.

---

## 1. Backend — Ubuntu container on Proxmox

### 1.1 Create the container

On the Proxmox host (adjust storage, bridge and the template name you have downloaded):

```bash
pct create 110 local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst \
  --hostname energygrappling-api \
  --cores 2 --memory 2048 --swap 512 \
  --rootfs local-lvm:8 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 --features nesting=1 \
  --onboot 1 --start 1

pct enter 110
```

Inside the container:

```bash
apt update && apt install -y git
git clone <your-repo-url> /opt/energygrappling
```

### 1.2 Install the API

```bash
sudo bash /opt/energygrappling/server/deploy/install.sh
```

The script is idempotent and does not overwrite an existing `.env` or database. It:

- installs Python and creates `/opt/energygrappling/venv`,
- creates the unprivileged `energygrappling` service user,
- puts the SQLite file in `/var/lib/energygrappling/app.db` — outside the code tree, so
  `git pull` and redeploys can never clobber it,
- writes `server/.env` with `ENVIRONMENT=production`, a **random** `JWT_SECRET`, and the
  production `CORS_ORIGINS`,
- installs and starts the `energygrappling-api` systemd unit, listening on `127.0.0.1:8000`,
- checks `/api/health` before reporting success.

Useful afterwards:

```bash
systemctl status energygrappling-api
journalctl -u energygrappling-api -f
sudo bash /opt/energygrappling/server/deploy/update.sh   # pull + reinstall deps + restart
```

### 1.3 Publish it — pick one

**Option A — Cloudflare Tunnel (recommended).** No open ports, no router
port-forwarding, no certificates to renew; the container dials out to Cloudflare.

```bash
# in the container
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
  | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared

cloudflared tunnel login                 # opens a URL; authorise energygrappling.com
cloudflared tunnel create energygrappling
cloudflared tunnel route dns energygrappling api.energygrappling.com

sudo cp /opt/energygrappling/server/deploy/cloudflared-config.yml /etc/cloudflared/config.yml
sudo nano /etc/cloudflared/config.yml     # paste the tunnel id in both places
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

`tunnel route dns` creates the proxied `api` record for you — nothing to add by hand.

**Option B — Caddy with a real certificate.** Only if you want the container reachable
directly. Forward ports 80 and 443 to it on your router, and set the `api` DNS record to
**DNS only** (grey cloud) so Let's Encrypt can validate.

```bash
sudo apt install -y caddy
sudo cp /opt/energygrappling/server/deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

---

## 2. DNS in Cloudflare

In the `energygrappling.com` zone:

| Type  | Name  | Content                     | Proxy                            |
| ----- | ----- | --------------------------- | -------------------------------- |
| —     | `@`   | created by `wrangler deploy`| Proxied                          |
| —     | `www` | created by `wrangler deploy`| Proxied                          |
| CNAME | `api` | tunnel target               | Proxied (Tunnel) / DNS only (Caddy) |

The apex and `www` records are created automatically the first time you deploy the Worker
with `custom_domain: true` — you do not add them manually. Set SSL/TLS mode to **Full
(strict)**.

---

## 3. Frontend — Cloudflare Workers

Once, on your machine:

```bash
cd client
npx wrangler login
```

Then deploy:

```bash
cd client
npm run deploy        # = vite build + wrangler deploy
```

`npm run build` reads [client/.env.production](client/.env.production), so the bundle is
compiled against `https://api.energygrappling.com`. Change that file if the API lands on a
different hostname — these values are baked into the JS at build time, so a change needs a
rebuild, and only public values belong there.

[client/wrangler.jsonc](client/wrangler.jsonc) names the Worker `energygrappling` and
attaches both hostnames. `not_found_handling: single-page-application` is what makes deep
links like `/chat` work on refresh.

---

## 4. Verify

```bash
curl https://api.energygrappling.com/api/health          # {"status":"ok"}
curl -i https://energygrappling.com                      # 200, HTML
```

Then in a browser: register at `https://energygrappling.com/register`, open the chat, and
open it a second time in another browser to confirm messages and the online count move
between them.

---

## Operational notes

- **CORS is exact-match.** `CORS_ORIGINS` in `server/.env` must list the scheme and host
  with no trailing slash. Miss `https://www.energygrappling.com` and the www visitors get
  blocked in the browser while everything looks fine in `curl`.
- **The API refuses to boot in production with the default `JWT_SECRET`** — deliberate, so a
  repo-visible key can never sign real tokens. Rotating the secret logs everyone out.
- **Restart both after a domain change**: the SPA needs a rebuild (baked-in URL), the API
  needs `systemctl restart` (env-read at boot).
- **WebSockets** work through both the Cloudflare proxy and the Tunnel. uvicorn sends
  protocol-level pings every 20s which keeps intermediaries from dropping idle chats, and
  the client reconnects on its own 2s after any drop.
- **One worker only.** The chat's socket registry is in-process; adding `--workers 2` would
  split the room silently. Scaling out needs Redis pub/sub first.
- **Backups.** The whole state is one file:
  ```bash
  sqlite3 /var/lib/energygrappling/app.db ".backup /root/app-$(date +%F).db"
  ```
  Proxmox `vzdump` of the container covers it too — plus schedule one, since a container
  snapshot is the fastest way back from a bad deploy.
- **Schema changes** currently rely on `create_all`, which creates missing tables but never
  alters existing ones. The first time you change a column, add Alembic.
