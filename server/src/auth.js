import jwt from 'jsonwebtoken';

import { config } from './config.js';
import { queries } from './db.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user.id) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** Express middleware: requires a valid `Authorization: Bearer <jwt>` header. */
export function requireAuth(req, res, next) {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ detail: 'Липсва токен.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    // Expired, tampered, or signed with an old secret — all the same to the client.
    return res.status(401).json({ detail: 'Невалиден или изтекъл токен.' });
  }

  const user = queries.findById.get(Number(payload.sub));
  if (!user) {
    return res.status(401).json({ detail: 'Невалиден или изтекъл токен.' });
  }

  req.user = user;
  next();
}
