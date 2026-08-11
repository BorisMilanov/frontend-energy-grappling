# Energy Grappling API (Express)

JWT auth backend for the React frontend. SQLite via `node:sqlite` — built into Node, so
there is no native module to compile and no database server to run.

Requires **Node 22.5+** (24+ recommended, where `node:sqlite` is stable).

## Start

```bash
cd server
npm install
cp .env.example .env      # then set a real JWT_SECRET
npm run dev               # node --watch, http://127.0.0.1:8000
```

## Endpoints

| Method | Path                 | Body                          | Returns                    |
| ------ | -------------------- | ----------------------------- | -------------------------- |
| POST   | `/api/auth/register` | `email, full_name, password`  | `201` + token + user       |
| POST   | `/api/auth/login`    | `email, password`             | `200` + token + user       |
| GET    | `/api/auth/me`       | — (`Authorization: Bearer …`) | current user               |
| GET    | `/api/health`        | —                             | `{"status": "ok", …}`      |

Errors come back as `{"detail": "..."}`, or `{"detail": [{loc, msg}]}` for field validation
(422) — the shape the client already parses.

## Check it works

```bash
npm run smoke                                    # against 127.0.0.1:8000
node test/smoke.js https://api.energygrappling.com
```

12 checks: health, CORS allow + refuse, register, duplicate email, weak password, login
right/wrong/unknown, and `/me` with a good, missing and bad token.

## Notes

- **CORS is fixed in code** — `ALLOWED_ORIGINS` in `src/config.js`. There is deliberately no
  environment variable for it, so a `.env` edit on the server cannot widen it. The localhost
  entries are added only when `NODE_ENV !== 'production'`.
- **The server refuses to boot in production with the default `JWT_SECRET`.**
- Passwords: bcrypt, 12 rounds. Login compares against a dummy hash for unknown emails so the
  timing does not reveal which addresses are registered.
- Tables are created on boot with `CREATE TABLE IF NOT EXISTS`; there is no migration step
  yet. Add one before changing an existing column.
- The frontend stores the token in `localStorage` (`eg_token`), which is readable by any XSS
  on the page. For a hardening pass, move to an httpOnly cookie plus a refresh token.
- It listens on `127.0.0.1` only — reach it through Caddy or the Cloudflare Tunnel, never by
  exposing the port.
