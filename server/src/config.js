const DEFAULT_DEV_SECRET = 'dev-secret-change-me';

export const config = {
  environment: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8000),
  jwtSecret: process.env.JWT_SECRET ?? DEFAULT_DEV_SECRET,
  // jsonwebtoken accepts "1h", "60m", "7d"...
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  databaseFile: process.env.DATABASE_FILE ?? './app.db',
};

export const isProduction = config.environment === 'production';

// CORS — the only allow-list there is. Fixed in code, not configurable by environment
// variables, so a stray .env edit on the server cannot expose logged-in users' tokens to
// another site. To add a domain, edit this list and redeploy.
// Exact matches: scheme + host (+ port), no trailing slash, no wildcards.
export const ALLOWED_ORIGINS = [
  'https://energygrappling.com',
  'https://www.energygrappling.com',
];

if (!isProduction) {
  // Local dev only. These never reach production: a page on a developer's own
  // localhost:3000 must not be able to call the live API with their credentials.
  ALLOWED_ORIGINS.push(
    'http://localhost:3000', // vite dev server
    'http://127.0.0.1:3000',
    'http://localhost:5173', // vite's own default, if the port is ever changed back
    'http://127.0.0.1:5173',
  );
}

if (isProduction && config.jwtSecret === DEFAULT_DEV_SECRET) {
  // Refuse to boot rather than sign real tokens with a secret that is in the repo.
  throw new Error(
    'JWT_SECRET is still the development default. Set a random value in .env ' +
      '(node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))").',
  );
}
