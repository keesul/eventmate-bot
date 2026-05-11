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

  const { id } = req.query; // Vercel автоматично парсить [id] з URL

  try {
    // GET /api/events/[userId] - Get all events for user
    if (req.method === 'GET') {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', id)
        .order('event_date', { ascending: true })
        .order('event_time', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ success: true, events: events || [] });
    }

    // PUT /api/events/[eventId] - Update event
    if (req.method === 'PUT') {
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
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    // DELETE /api/events/[eventId] - Delete event
    if (req.method === 'DELETE') {
      const { userId } = req.body;

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
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
