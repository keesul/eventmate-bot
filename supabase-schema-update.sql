-- EventMate Database Schema Update
-- Add reminder settings for events

-- Add new columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS reminder_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS birth_year INTEGER;

-- Add comment
COMMENT ON COLUMN events.reminder_days IS 'За скільки днів нагадувати (0 = в день події, 1 = за день, тощо)';
COMMENT ON COLUMN events.reminder_time IS 'О котрій годині відправляти нагадування';
COMMENT ON COLUMN events.is_recurring IS 'Чи повторюється подія щороку (для днів народження)';
COMMENT ON COLUMN events.birth_year IS 'Рік народження (для розрахунку віку)';

-- Update function to get upcoming events with reminder settings
CREATE OR REPLACE FUNCTION get_upcoming_events_with_reminders(target_date DATE, target_time TIME)
RETURNS TABLE (
  id BIGINT,
  user_id BIGINT,
  title TEXT,
  type TEXT,
  event_date DATE,
  event_time TIME,
  notes TEXT,
  telegram_id BIGINT,
  first_name TEXT,
  reminder_days INTEGER,
  reminder_time TIME,
  is_recurring BOOLEAN,
  birth_year INTEGER
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
    u.first_name,
    e.reminder_days,
    e.reminder_time,
    e.is_recurring,
    e.birth_year
  FROM events e
  INNER JOIN users u ON e.user_id = u.telegram_id
  WHERE
    -- Для щорічних подій (дні народження) перевіряємо місяць і день
    (e.is_recurring = true AND
     EXTRACT(MONTH FROM e.event_date) = EXTRACT(MONTH FROM target_date) AND
     EXTRACT(DAY FROM e.event_date) = EXTRACT(DAY FROM target_date))
    OR
    -- Для звичайних подій перевіряємо точну дату
    (e.is_recurring = false AND e.event_date = target_date)
  ORDER BY e.event_time ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'EventMate schema updated successfully! New columns: reminder_days, reminder_time, is_recurring, birth_year' AS message;
