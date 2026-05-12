-- EventMate Database Schema Update
-- Add new columns for features: language, theme, reminder settings

-- Add language and theme columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'uk' CHECK (language IN ('uk', 'en'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark'));

-- Add reminder settings to events table (if not already added)
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_days INTEGER DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00';
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS birth_year INTEGER;

-- Success message
SELECT 'EventMate schema updated with new features!' AS message;
