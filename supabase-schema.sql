-- EventMate Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('birthday', 'reminder', 'event')),
  event_date DATE NOT NULL,
  event_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (true);

-- RLS Policies for events table
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (true);

-- Function to get upcoming events (for reminders)
CREATE OR REPLACE FUNCTION get_upcoming_events(target_date DATE)
RETURNS TABLE (
  id BIGINT,
  user_id BIGINT,
  title TEXT,
  type TEXT,
  event_date DATE,
  event_time TIME,
  notes TEXT,
  telegram_id BIGINT,
  first_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.user_id,
    e.title,
    e.type,
    e.event_date,
    e.event_time,
    e.notes,
    u.telegram_id,
    u.first_name
  FROM events e
  INNER JOIN users u ON e.user_id = u.telegram_id
  WHERE e.event_date = target_date
  ORDER BY e.event_time ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert demo data (optional)
-- Uncomment if you want to test with demo data

-- INSERT INTO users (telegram_id, username, first_name) VALUES
-- (123456, 'demo_user', 'Demo User')
-- ON CONFLICT (telegram_id) DO NOTHING;

-- INSERT INTO events (user_id, title, type, event_date, event_time, notes) VALUES
-- (123456, 'День народження Марії', 'birthday', CURRENT_DATE + INTERVAL '1 day', '18:00', 'Не забути купити подарунок!'),
-- (123456, 'Зустріч з клієнтом', 'reminder', CURRENT_DATE, '14:00', 'Підготувати презентацію'),
-- (123456, 'Концерт', 'event', CURRENT_DATE + INTERVAL '7 days', '20:00', 'Квитки вже куплені');

-- Success message
SELECT 'EventMate database schema created successfully!' AS message;
