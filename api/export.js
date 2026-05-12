const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function generateICS(events, userTimezone = 'UTC') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventMate//Telegram Bot//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:EventMate Events',
    'X-WR-TIMEZONE:' + userTimezone
  ];

  events.forEach(event => {
    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const uid = `event-${event.id}@eventmate-bot.vercel.app`;
    const summary = event.title;
    const description = event.notes || '';
    const rrule = event.is_recurring ? 'RRULE:FREQ=YEARLY' : '';

    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + uid);
    lines.push('DTSTAMP:' + dateStr);
    lines.push('DTSTART:' + dateStr);
    lines.push('SUMMARY:' + summary);
    if (description) {
      lines.push('DESCRIPTION:' + description.replace(/\n/g, '\\n'));
    }
    if (rrule) {
      lines.push(rrule);
    }

    // Add alarm/reminder
    if (event.reminder_days && event.reminder_time) {
      const reminderMinutes = event.reminder_days * 24 * 60;
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT' + reminderMinutes + 'M');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:Reminder: ' + summary);
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.url.split('/').pop().split('?')[0];

    if (!userId || userId === 'export') {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    // Get user timezone
    const { data: user } = await supabase
      .from('users')
      .select('timezone')
      .eq('telegram_id', userId)
      .single();

    const userTimezone = user?.timezone || 'UTC';

    // Get all events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true });

    if (error) throw error;

    if (!events || events.length === 0) {
      return res.status(404).json({ success: false, error: 'No events found' });
    }

    // Generate ICS file
    const icsContent = generateICS(events, userTimezone);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="eventmate-events.ics"');
    res.status(200).send(icsContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
