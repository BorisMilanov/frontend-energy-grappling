import express from 'express';
import cors from 'cors';

import { ALLOWED_ORIGINS, config, isProduction } from './config.js';
import { authRouter } from './routes/auth.routes.js';

const app = express();

// Behind Caddy / a Cloudflare Tunnel: trust the proxy so req.ip and req.protocol are real.
app.set('trust proxy', 1);

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    maxAge: 86400,
  }),
);

app.use(express.json({ limit: '100kb' }));

app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Energy Grappling API', version: '1.0.0' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Energy Grappling API', health: '/api/health' });
});

app.use((_req, res) => {
  res.status(404).json({ detail: 'Не е намерено.' });
});

// Four-arg signature: this is Express's error handler, do not shorten it.
app.use((err, _req, res, _next) => {
  // A malformed JSON body arrives here as a SyntaxError from express.json().
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ detail: 'Невалиден JSON.' });
  }
  console.error(err);
  res.status(500).json({ detail: 'Вътрешна грешка.' });
});

app.listen(config.port, '127.0.0.1', () => {
  console.log(
    `API listening on http://127.0.0.1:${config.port} (${config.environment}), ` +
      `CORS: ${ALLOWED_ORIGINS.join(', ')}`,
  );
  if (!isProduction) console.log(`SQLite: ${config.databaseFile}`);
});
