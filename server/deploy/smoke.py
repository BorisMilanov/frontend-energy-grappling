#!/usr/bin/env python3
"""End-to-end check of a running Energy Grappling API.

    /opt/energygrappling/venv/bin/python server/deploy/smoke.py https://api.energygrappling.com

Checks health, CORS, register/login/me, chat history and a real WebSocket round trip
between two clients. Creates one throwaway user per run (smoke+<random>@example.com);
delete them with:

    sqlite3 /var/lib/energygrappling/app.db \
      "DELETE FROM messages WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'smoke+%');
       DELETE FROM users WHERE email LIKE 'smoke+%';"
"""

import asyncio
import json
import secrets
import sys
import urllib.error
import urllib.request

DEFAULT_BASE = "http://127.0.0.1:8000"
ORIGIN = "https://energygrappling.com"

failures: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> bool:
    print(f"[{'PASS' if ok else 'FAIL'}] {name}{f' - {detail}' if detail else ''}")
    if not ok:
        failures.append(name)
    return ok


def request(method, url, body=None, token=None, headers=None):
    req = urllib.request.Request(url, method=method)
    for key, value in (headers or {}).items():
        req.add_header(key, value)
    if body is not None:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(body).encode()
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    def decode(raw):
        # CORS preflights answer "OK" in plain text, so a non-JSON body is not an error.
        try:
            return json.loads(raw) if raw else None
        except json.JSONDecodeError:
            return raw.decode(errors="replace")

    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status, dict(res.headers), decode(res.read())
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), decode(e.read())
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        # Unreachable host, refused connection, TLS failure: status 0, reason in the body.
        reason = getattr(e, "reason", e)
        return 0, {}, f"{type(e).__name__}: {reason}"


async def websocket_round_trip(base: str, token_a: str, token_b: str) -> None:
    try:
        import websockets
    except ImportError:
        check("chat: websocket round trip", False, "the `websockets` package is missing")
        return

    ws_base = base.replace("https://", "wss://").replace("http://", "ws://")
    url = f"{ws_base}/api/chat/ws"

    try:
        async with websockets.connect(f"{url}?token=nonsense"):
            check("chat: bad token is rejected", False, "the socket was accepted")
    except Exception:
        check("chat: bad token is rejected", True)

    text = f"smoke test {secrets.token_hex(4)}"
    try:
        async with websockets.connect(f"{url}?token={token_a}") as a:
            async with websockets.connect(f"{url}?token={token_b}") as b:

                async def wait_for(sock, kind):
                    while True:
                        event = json.loads(await asyncio.wait_for(sock.recv(), 10))
                        if event["type"] == kind:
                            return event

                await wait_for(b, "presence")
                await a.send(json.dumps({"content": text}))
                seen_by_b = await wait_for(b, "message")

                check(
                    "chat: message reaches the other client",
                    seen_by_b["data"]["content"] == text,
                    seen_by_b["data"]["content"],
                )
    except Exception as e:
        check("chat: websocket round trip", False, f"{type(e).__name__}: {e}")


def main() -> int:
    base = (sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BASE).rstrip("/")
    print(f"Checking {base}\n")

    status, _, body = request("GET", f"{base}/api/health")
    if not check("health endpoint", status == 200 and body == {"status": "ok"}, str(body)):
        print("\nThe API is not answering; nothing else can be checked.")
        return 1

    # A browser preflight from the production origin must be allowed back by name.
    _, headers, _ = request(
        "OPTIONS",
        f"{base}/api/auth/login",
        headers={
            "Origin": ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    allowed = headers.get("access-control-allow-origin") or headers.get(
        "Access-Control-Allow-Origin"
    )
    check(f"CORS allows {ORIGIN}", allowed == ORIGIN, f"got {allowed!r}")

    password = secrets.token_urlsafe(16)
    users = []
    for label in ("a", "b"):
        email = f"smoke+{label}{secrets.token_hex(6)}@example.com"
        status, _, body = request(
            "POST",
            f"{base}/api/auth/register",
            {"email": email, "full_name": f"Smoke {label.upper()}", "password": password},
        )
        if not check(f"register user {label}", status == 201, str(body)[:120]):
            return 1
        users.append((email, body["access_token"]))

    email_a, token_a = users[0]
    _, token_b = users[1]

    status, _, body = request(
        "POST", f"{base}/api/auth/login", {"email": email_a, "password": password}
    )
    check("login with the right password", status == 200, str(status))

    status, _, _ = request(
        "POST", f"{base}/api/auth/login", {"email": email_a, "password": "wrong-password"}
    )
    check("login with a wrong password is refused", status == 401, str(status))

    status, _, body = request("GET", f"{base}/api/auth/me", token=token_a)
    check("token identifies the user", status == 200 and body["email"] == email_a, str(body))

    status, _, _ = request("GET", f"{base}/api/chat/messages")
    check("chat history needs auth", status == 401, str(status))

    status, _, body = request("GET", f"{base}/api/chat/messages", token=token_a)
    check("chat history with auth", status == 200 and isinstance(body, list), str(status))

    asyncio.run(websocket_round_trip(base, token_a, token_b))

    print()
    if failures:
        print(f"{len(failures)} check(s) failed: {', '.join(failures)}")
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
