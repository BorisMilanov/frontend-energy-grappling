# Deploying energygrappling.com

Two halves, deployed independently:

| Part                        | Runs on                              | Public hostname                                     |
| --------------------------- | ------------------------------------ | --------------------------------------------------- |
| `client/` — React SPA       | Cloudflare Workers (static assets)   | `energygrappling.com`, `www.energygrappling.com`     |
| `server/` — Express API     | Ubuntu LXC on Proxmox                | `api.energygrappling.com`                            |

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

- installs Node (NodeSource, v24+ — `node:sqlite` needs it) and runs `npm ci --omit=dev`,
- creates the unprivileged `energygrappling` service user,
- puts the SQLite file in `/var/lib/energygrappling/app.db` — outside the code tree, so
  `git pull` and redeploys can never clobber it,
- writes `server/.env` with `NODE_ENV=production` (which is what makes the fixed CORS
  list in `src/config.js` drop its localhost entries) and a **random** `JWT_SECRET`,
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
links like `/login` work on refresh.

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

[server/test/smoke.js](server/test/smoke.js) checks the whole stack — health, CORS from the
production origin (and refusal of an unknown one), register, duplicate email, weak password,
login right/wrong/unknown, and `/me` with a good, missing and bad token. Exit code 0 means
everything passed.

```bash
# in the container, against the local service
node /opt/energygrappling/server/test/smoke.js

# from anywhere, against the public hostname (this is the one that matters —
# it exercises Cloudflare, TLS and the tunnel too)
node server/test/smoke.js https://api.energygrappling.com
```

Expected output:

```
[PASS] health endpoint
[PASS] CORS allows https://energygrappling.com
[PASS] CORS refuses an unknown origin
[PASS] register
[PASS] duplicate email is refused (case-insensitively) - 409
[PASS] short password is refused - 422
[PASS] login with the right password - 200
[PASS] login with a wrong password is refused - 401
[PASS] login for an unknown email is refused - 401
[PASS] token identifies the user
[PASS] /me without a token is refused - 401
[PASS] /me with a bad token is refused - 401
All checks passed.
```

Each run creates one throwaway `smoke+…@example.com` user; the comment at the top of the
script has the SQL to delete them.

### Service health in the container

```bash
systemctl status energygrappling-api          # active (running)
journalctl -u energygrappling-api -n 50       # no stack traces at boot
systemctl status cloudflared                  # if using the tunnel
ls -l /var/lib/energygrappling/app.db         # exists, owned by energygrappling
```

### In a browser (the part no script covers)

1. `https://energygrappling.com` loads and the nav shows **Вход / Регистрация**.
2. Register — you land back on the home page and the nav switches to **Изход**.
3. Reload `/login` directly: it must render the form, not 404 (proves SPA routing).
4. Log out, then log in again with the same credentials.
5. DevTools → Application → Local Storage: `eg_token` and `eg_user` appear on login and
   disappear on logout.
6. DevTools → Console: no CORS errors. Check `https://www.energygrappling.com` too — the
   www origin is the one people forget in `ALLOWED_ORIGINS`.

### When something fails

| Symptom                                      | Look at                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `health endpoint` FAIL, connection refused    | `systemctl status energygrappling-api`, then `journalctl -u …`      |
| health OK from the container, not from public | tunnel/DNS: `systemctl status cloudflared`, Cloudflare DNS tab      |
| CORS check FAIL                               | `ALLOWED_ORIGINS` in `server/src/config.js`, then redeploy          |
| Site loads, every API call fails in browser   | bundle built with the wrong `VITE_API_URL` — rebuild and redeploy   |
| Login works, then 401s soon after             | `JWT_EXPIRES_IN` is short, or the secret changed (that logs all out) |
| 404 on refreshing `/login`                    | `not_found_handling` in `client/wrangler.jsonc`                     |

---

## Operational notes

- **CORS is pinned in code**, in `ALLOWED_ORIGINS` in
  `server/src/config.js`. There is no environment variable for it, so a
  mistaken `.env` edit on the server cannot expose logged-in users' tokens to another site.
  Adding a domain means editing that list and redeploying. Matching is exact — scheme +
  host, no trailing slash, no wildcards — so `www` needs its own entry.
- **The API refuses to boot in production with the default `JWT_SECRET`** — deliberate, so a
  repo-visible key can never sign real tokens. Rotating the secret logs everyone out.
- **Restart both after a domain change**: the SPA needs a rebuild (baked-in URL), the API
  needs `systemctl restart` (env-read at boot).
- **Passwords** are bcrypt (12 rounds) via `bcryptjs`; login compares against a dummy hash
  when the email is unknown, so a wrong email and a wrong password take the same time and
  the endpoint does not leak which addresses are registered.
- **One process.** SQLite in WAL mode is fine for a single Node process. Do not add a
  cluster/PM2 fork setup without moving the database somewhere that tolerates concurrent
  writers.
- **Backups.** The whole state is one file:
  ```bash
  sqlite3 /var/lib/energygrappling/app.db ".backup /root/app-$(date +%F).db"
  ```
  Proxmox `vzdump` of the container covers it too — plus schedule one, since a container
  snapshot is the fastest way back from a bad deploy.
- **Schema changes** currently rely on `CREATE TABLE IF NOT EXISTS`, which creates missing
  tables but never alters existing ones. The first time you change a column, add a real
  migration step.
