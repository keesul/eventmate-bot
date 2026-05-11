import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbDir = './data';
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(process.env.DATABASE_PATH || './data/events.db');

// Створення таблиць
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('birthday', 'reminder', 'event')),
    event_date TEXT NOT NULL,
    event_time TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(telegram_id)
  );

  CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
`);

// Prepared statements
export const dbQueries = {
  // Users
  createUser: db.prepare(`
    INSERT OR IGNORE INTO users (telegram_id, username, first_name)
    VALUES (?, ?, ?)
  `),

  getUser: db.prepare(`
    SELECT * FROM users WHERE telegram_id = ?
  `),

  // Events
  createEvent: db.prepare(`
    INSERT INTO events (user_id, title, type, event_date, event_time, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  getUserEvents: db.prepare(`
    SELECT * FROM events
    WHERE user_id = ?
    ORDER BY event_date ASC, event_time ASC
  `),

  getEventById: db.prepare(`
    SELECT * FROM events WHERE id = ?
  `),

  updateEvent: db.prepare(`
    UPDATE events
    SET title = ?, type = ?, event_date = ?, event_time = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `),

  deleteEvent: db.prepare(`
    DELETE FROM events WHERE id = ? AND user_id = ?
  `),

  getUpcomingEvents: db.prepare(`
    SELECT e.*, u.telegram_id, u.first_name
    FROM events e
    JOIN users u ON e.user_id = u.telegram_id
    WHERE e.event_date = ?
    ORDER BY e.event_time ASC
  `)
};

export default db;
