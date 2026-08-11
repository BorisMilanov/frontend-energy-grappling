/**
 * End-to-end check of a running Energy Grappling API.
 *
 *   node test/smoke.js                              # against http://127.0.0.1:8000
 *   node test/smoke.js https://api.energygrappling.com
 *
 * Creates one throwaway smoke+<random>@example.com user per run. Clean up with:
 *   sqlite3 app.db "DELETE FROM users WHERE email LIKE 'smoke+%';"
 */
import { randomBytes } from 'node:crypto';

const BASE = (process.argv[2] ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const ORIGIN = 'https://energygrappling.com';

const failures = [];

function check(name, ok, detail = '') {
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  if (!ok) failures.push(name);
  return ok;
}

async function call(method, path, { body, token, headers } = {}) {
  const init = { method, headers: { ...headers } };
  if (body !== undefined) {
    init.headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  if (token) init.headers.authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}${path}`, init);
    const text = await res.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    return { status: res.status, headers: res.headers, body: parsed };
  } catch (err) {
    // Unreachable host, refused connection, TLS failure.
    return { status: 0, headers: new Headers(), body: `${err.name}: ${err.message}` };
  }
}

const run = async () => {
  console.log(`Checking ${BASE}\n`);

  const health = await call('GET', '/api/health');
  if (!check('health endpoint', health.status === 200 && health.body?.status === 'ok', JSON.stringify(health.body))) {
    console.log('\nThe API is not answering; nothing else can be checked.');
    return 1;
  }

  const preflight = await call('OPTIONS', '/api/auth/login', {
    headers: {
      origin: ORIGIN,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
  });
  const allowed = preflight.headers.get('access-control-allow-origin');
  check(`CORS allows ${ORIGIN}`, allowed === ORIGIN, `got ${allowed}`);

  const evil = await call('OPTIONS', '/api/auth/login', {
    headers: { origin: 'https://evil.example.com', 'access-control-request-method': 'POST' },
  });
  const evilAllowed = evil.headers.get('access-control-allow-origin');
  check('CORS refuses an unknown origin', evilAllowed === null, `got ${evilAllowed}`);

  const password = randomBytes(12).toString('base64url');
  const email = `smoke+${randomBytes(6).toString('hex')}@example.com`;

  const registered = await call('POST', '/api/auth/register', {
    body: { email, full_name: 'Smoke Test', password },
  });
  if (!check('register', registered.status === 201, JSON.stringify(registered.body).slice(0, 90))) return 1;
  const token = registered.body.access_token;

  const duplicate = await call('POST', '/api/auth/register', {
    body: { email: email.toUpperCase(), full_name: 'Smoke Test', password },
  });
  check('duplicate email is refused (case-insensitively)', duplicate.status === 409, String(duplicate.status));

  const short = await call('POST', '/api/auth/register', {
    body: { email: `x${randomBytes(4).toString('hex')}@example.com`, full_name: 'AB', password: 'short' },
  });
  check('short password is refused', short.status === 422, String(short.status));

  const login = await call('POST', '/api/auth/login', { body: { email, password } });
  check('login with the right password', login.status === 200 && Boolean(login.body.access_token), String(login.status));

  const wrong = await call('POST', '/api/auth/login', { body: { email, password: 'wrong-password' } });
  check('login with a wrong password is refused', wrong.status === 401, String(wrong.status));

  const unknown = await call('POST', '/api/auth/login', {
    body: { email: 'nobody@example.com', password },
  });
  check('login for an unknown email is refused', unknown.status === 401, String(unknown.status));

  const me = await call('GET', '/api/auth/me', { token });
  check('token identifies the user', me.status === 200 && me.body.email === email, JSON.stringify(me.body));

  const noToken = await call('GET', '/api/auth/me');
  check('/me without a token is refused', noToken.status === 401, String(noToken.status));

  const badToken = await call('GET', '/api/auth/me', { token: 'garbage' });
  check('/me with a bad token is refused', badToken.status === 401, String(badToken.status));

  console.log();
  if (failures.length) {
    console.log(`${failures.length} check(s) failed: ${failures.join(', ')}`);
    return 1;
  }
  console.log('All checks passed.');
  return 0;
};

process.exit(await run());
