const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse URL: /api/events/123 or /api/events
  const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
  const userId = urlParts[2] || null; // /api/events/[userId]
  const eventId = urlParts[2] || null; // Same position, context determines usage

  try {
    // GET /api/events/[userId] - Get all events for user
    if (req.method === 'GET' && userId) {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ success: true, events: events || [] });
    }

    // POST /api/events - Create new event
    if (req.method === 'POST') {
      const { userId, title, type, date, time, notes, reminderDays, reminderTime, birthYear } = req.body;

      const isRecurring = type === 'birthday';

      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: userId,
          title: title,
          type: type,
          event_date: date,
          event_time: time || null,
          notes: notes || null,
          reminder_days: reminderDays || 1,
          reminder_time: reminderTime || '09:00',
          is_recurring: isRecurring,
          birth_year: birthYear || null
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, eventId: data.id });
    }

    // PUT /api/events/[eventId] - Update event
    if (req.method === 'PUT' && eventId) {
      const { userId, title, type, date, time, notes, reminderDays, reminderTime, birthYear } = req.body;

      const isRecurring = type === 'birthday';

      const { data, error } = await supabase
        .from('events')
        .update({
          title: title,
          type: type,
          event_date: date,
          event_time: time || null,
          notes: notes || null,
          reminder_days: reminderDays || 1,
          reminder_time: reminderTime || '09:00',
          is_recurring: isRecurring,
          birth_year: birthYear || null
        })
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    // DELETE /api/events/[eventId] - Delete event
    if (req.method === 'DELETE' && eventId) {
      const { userId } = req.body;

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ success: false, error: 'Invalid request' });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
