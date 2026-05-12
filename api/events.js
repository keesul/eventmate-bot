const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  // Enable CORS - restrict to webapp only
  const allowedOrigin = process.env.WEBAPP_URL || 'https://eventmate-bot.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET /api/events/:userId - List all events for user
    if (req.method === 'GET') {
      const userId = req.url.split('/').pop();

      if (!userId || userId === 'events') {
        return res.status(400).json({ success: false, error: 'User ID required' });
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ success: true, events: data || [] });
    }

    // POST /api/events - Create new event
    if (req.method === 'POST') {
      const { userId, title, type, date, time, notes, reminderDays, reminderTime, birthYear } = req.body;

      // Validation
      if (!userId || !title || !date) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (!['birthday', 'reminder', 'event'].includes(type)) {
        return res.status(400).json({ success: false, error: 'Invalid event type' });
      }

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

    // PUT /api/events/:eventId - Update event
    if (req.method === 'PUT') {
      const eventId = req.url.split('/').pop();
      const { userId, title, type, date, time, notes, reminderDays, reminderTime, birthYear } = req.body;

      if (!eventId || !userId) {
        return res.status(400).json({ success: false, error: 'Event ID and User ID required' });
      }

      if (!title || !date) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (type && !['birthday', 'reminder', 'event'].includes(type)) {
        return res.status(400).json({ success: false, error: 'Invalid event type' });
      }

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

      if (!data) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }

      return res.status(200).json({ success: true, event: data });
    }

    // DELETE /api/events/:eventId - Delete event
    if (req.method === 'DELETE') {
      const eventId = req.url.split('/').pop();
      const { userId } = req.body;

      if (!eventId || !userId) {
        return res.status(400).json({ success: false, error: 'Event ID and User ID required' });
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
