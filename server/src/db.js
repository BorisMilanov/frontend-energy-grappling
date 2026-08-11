import { DatabaseSync } from 'node:sqlite';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

import { config } from './config.js';

// node:sqlite is built into Node (stable since v24) — no native module to compile.
mkdirSync(dirname(config.databaseFile), { recursive: true });

export const db = new DatabaseSync(config.databaseFile);

// WAL survives a crash better and lets reads run while a write is in flight.
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT    NOT NULL UNIQUE,
    full_name       TEXT    NOT NULL,
    hashed_password TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Emails are stored lowercased; this keeps lookups on the unique index.
export const queries = {
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findById: db.prepare('SELECT id, email, full_name, created_at FROM users WHERE id = ?'),
  insert: db.prepare(
    'INSERT INTO users (email, full_name, hashed_password) VALUES (?, ?, ?) RETURNING id, email, full_name, created_at',
  ),
};
