import { Router } from 'express';
import bcrypt from 'bcryptjs';

import { queries } from '../db.js';
import { requireAuth, signToken } from '../auth.js';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const BCRYPT_ROUNDS = 12;

/** Mirrors the shape FastAPI used, so the client's error handling is unchanged. */
function validationError(res, field, message) {
  return res.status(422).json({ detail: [{ loc: ['body', field], msg: message }] });
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    created_at: user.created_at,
  };
}

authRouter.post('/register', async (req, res) => {
  const { email, full_name: fullName, password } = req.body ?? {};

  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return validationError(res, 'email', 'Невалиден имейл.');
  }
  if (typeof fullName !== 'string' || fullName.trim().length < 2) {
    return validationError(res, 'full_name', 'Името трябва да е поне 2 символа.');
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
    return validationError(res, 'password', `Паролата трябва да е поне ${MIN_PASSWORD} символа.`);
  }
  if (password.length > MAX_PASSWORD) {
    return validationError(res, 'password', `Паролата е най-много ${MAX_PASSWORD} символа.`);
  }

  const normalisedEmail = email.trim().toLowerCase();
  if (queries.findByEmail.get(normalisedEmail)) {
    return res.status(409).json({ detail: 'Вече има регистрация с този имейл.' });
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = queries.insert.get(normalisedEmail, fullName.trim(), hashed);

  return res.status(201).json({
    access_token: signToken(user),
    token_type: 'bearer',
    user: publicUser(user),
  });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return validationError(res, 'email', 'Въведи имейл и парола.');
  }

  const user = queries.findByEmail.get(email.trim().toLowerCase());
  // Compare even when the user is missing, so a wrong email and a wrong password take
  // the same time and the endpoint does not leak which emails are registered.
  const ok = await bcrypt.compare(password, user?.hashed_password ?? '$2a$12$invalidsaltinvalidsaltuO');

  if (!user || !ok) {
    return res.status(401).json({ detail: 'Грешен имейл или парола.' });
  }

  return res.json({
    access_token: signToken(user),
    token_type: 'bearer',
    user: publicUser(user),
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});
