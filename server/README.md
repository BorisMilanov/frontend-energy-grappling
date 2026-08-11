# Energy Grappling API (FastAPI)

JWT auth backend for the React frontend. SQLite by default — no extra services needed.

## Start

```bash
cd server
python -m venv .venv
.venv\Scripts\activate        # Windows;  source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
copy .env.example .env        # cp on macOS/Linux — then set a real JWT_SECRET
uvicorn main:app --reload --port 8000
```

Docs: http://localhost:8000/docs

## Endpoints

| Method | Path                 | Body                          | Returns                        |
| ------ | -------------------- | ----------------------------- | ------------------------------ |
| POST   | `/api/auth/register` | `email, full_name, password`  | `201` + token + user           |
| POST   | `/api/auth/login`    | `email, password`             | `200` + token + user           |
| GET    | `/api/auth/me`       | — (`Authorization: Bearer …`) | current user                   |
| GET    | `/api/health`        | —                             | `{"status": "ok"}`             |

Passwords are hashed with bcrypt; tokens are HS256 JWTs whose `sub` is the user id and
expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default 60).

## Group chat

| Method | Path                          | Notes                                                |
| ------ | ----------------------------- | ---------------------------------------------------- |
| GET    | `/api/chat/messages?limit=50` | Bearer auth; last N messages, oldest-first (max 100) |
| WS     | `/api/chat/ws?token=<jwt>`    | One shared room; closes with 1008 if the JWT is bad  |

Client sends `{"content": "..."}`. The server persists the message and broadcasts to everyone:

- `{"type": "message", "data": {id, content, created_at, author: {id, full_name}}}`
- `{"type": "presence", "data": {users: [...], count: n}}` — on every join and leave
- `{"type": "error", "data": {detail}}` — to the sender only, on an invalid payload

Two caveats worth knowing:

- The socket registry is **in-process**, so more than one uvicorn worker means clients only
  see messages from their own worker. Add Redis pub/sub before running multiple workers.
- The JWT travels as a **query param** because browsers cannot set headers on a WebSocket
  handshake. URLs land in access logs and proxy logs — use short-lived tokens, or switch to a
  cookie / post-connect auth message if that is a problem.

## Notes

- Tables are created on boot (`Base.metadata.create_all`). Add Alembic if the schema starts moving.
- Allowed browser origins are fixed in code: `ALLOWED_ORIGINS` at the top of `main.py`.
- The frontend stores the token in `localStorage` (`eg_token`), which is readable by any XSS on the
  page. For production, move to an httpOnly cookie plus a refresh token.
