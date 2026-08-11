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

#### "cloudflared service is already installed"

Not a failure — the service exists, so `service install` is simply unnecessary. Which mode
it runs in decides where you configure the hostname:

```bash
systemctl cat cloudflared | grep ExecStart
```

- **`... tunnel run --token eyJ…`** — a *remotely managed* tunnel. `/etc/cloudflared/config.yml`
  is **ignored**; the ingress lives in the dashboard. Add it at Cloudflare **Zero Trust →
  Networks → Tunnels →** your tunnel **→ Public Hostnames → Add**: subdomain `api`, domain
  `energygrappling.com`, service `HTTP` → `127.0.0.1:8000`. That also creates the DNS record.
  Nothing to do on the box.

- **`... --config /etc/cloudflared/config.yml tunnel run`** — a *locally managed* tunnel.
  Edit that file (the repo copy is the template), then:

  ```bash
  cloudflared tunnel ingress validate                          # syntax + rule order
  cloudflared tunnel ingress rule https://api.energygrappling.com  # shows the matching rule
  sudo systemctl restart cloudflared
  ```

To start over instead — only if the existing tunnel is a leftover you do not want:

```bash
sudo systemctl stop cloudflared
sudo cloudflared service uninstall
sudo cloudflared service install        # or: ... install <TOKEN>
sudo systemctl enable --now cloudflared
```

Either way, confirm the path end to end:

```bash
curl -fsS http://127.0.0.1:8000/api/health        # the API itself
journalctl -u cloudflared -n 30 --no-pager        # expect "Registered tunnel connection"
curl -fsS https://api.energygrappling.com/api/health
```

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

### Before deploying (on your machine)

```bash
cd client && npx tsc -b && npx eslint src && npm run build
```

All three must be silent/zero-exit. Then confirm the built bundle points at the right API —
this is the single most common deploy mistake:

```bash
grep -o "https://api.energygrappling.com" client/dist/assets/*.js | head -1
```

### After deploying (one command)

[server/deploy/smoke.py](server/deploy/smoke.py) checks the whole stack — health, CORS from
the production origin, register/login/wrong-password/me, chat history auth, and a real
two-client WebSocket round trip. Exit code 0 means everything passed.

```bash
# in the container, against the local service
/opt/energygrappling/venv/bin/python /opt/energygrappling/server/deploy/smoke.py

# from anywhere, against the public hostname (this is the one that matters —
# it exercises Cloudflare, TLS and the tunnel too)
python server/deploy/smoke.py https://api.energygrappling.com
```

Expected output:

```
[PASS] health endpoint - {'status': 'ok'}
[PASS] CORS allows https://energygrappling.com - got 'https://energygrappling.com'
[PASS] register user a / b
[PASS] login with the right password - 200
[PASS] login with a wrong password is refused - 401
[PASS] token identifies the user
[PASS] chat history needs auth - 401
[PASS] chat history with auth - 200
[PASS] chat: bad token is rejected
[PASS] chat: message reaches the other client
All checks passed.
```

Each run creates two throwaway `smoke+…@example.com` users; the docstring in the script has
the SQL to delete them.

### Service health in the container

```bash
systemctl status energygrappling-api          # active (running)
journalctl -u energygrappling-api -n 50       # no tracebacks at boot
systemctl status cloudflared                  # if using the tunnel
ls -l /var/lib/energygrappling/app.db         # exists, owned by energygrappling
```

### In a browser (the part no script covers)

1. `https://energygrappling.com` loads and the nav shows **Вход / Регистрация**.
2. Register — you land on `/chat` and the nav switches to **Чат / Изход**.
3. Reload `/chat` directly: it must stay on the chat, not 404 (proves SPA routing).
4. Open it in a second browser, log in as another user: messages appear on both sides
   within a second and the online counter goes to 2.
5. DevTools → Network → WS: the socket is `101 Switching Protocols`, not repeatedly
   reconnecting.
6. DevTools → Console: no CORS errors. Check `https://www.energygrappling.com` too — the
   www origin is the one people forget in `CORS_ORIGINS`.

### When something fails

| Symptom                                      | Look at                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `health endpoint` FAIL, connection refused    | `systemctl status energygrappling-api`, then `journalctl -u …`      |
| health OK from the container, not from public | tunnel/DNS: `systemctl status cloudflared`, Cloudflare DNS tab      |
| CORS check FAIL                               | `CORS_ORIGINS` in `server/.env`, then restart the service           |
| Site loads, every API call fails in browser   | bundle built with the wrong `VITE_API_URL` — rebuild and redeploy   |
| Chat reconnects in a loop                     | expired token (log out and back in) or the tunnel dropping the WS   |
| 404 on refreshing `/chat`                     | `not_found_handling` in `client/wrangler.jsonc`                     |

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
