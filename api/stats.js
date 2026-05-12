const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.url.split('/').pop();

    if (!userId || userId === 'stats') {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    // Get all events for user
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Calculate statistics
    const stats = {
      total: events.length,
      byType: {
        birthday: events.filter(e => e.type === 'birthday').length,
        reminder: events.filter(e => e.type === 'reminder').length,
        event: events.filter(e => e.type === 'event').length
      },
      upcoming: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      nextEvent: null
    };

    // Find upcoming events
    const upcomingEvents = events
      .map(event => {
        const eventDate = new Date(event.event_date);
        eventDate.setHours(0, 0, 0, 0);

        // For recurring events, adjust to current year
        if (event.is_recurring) {
          eventDate.setFullYear(now.getFullYear());
          if (eventDate < now) {
            eventDate.setFullYear(now.getFullYear() + 1);
          }
        }

        return { ...event, adjustedDate: eventDate };
      })
      .filter(e => e.adjustedDate >= now)
      .sort((a, b) => a.adjustedDate - b.adjustedDate);

    // Count by period
    upcomingEvents.forEach(event => {
      const diffDays = Math.ceil((event.adjustedDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) stats.upcoming.today++;
      if (diffDays <= 7) stats.upcoming.thisWeek++;
      if (diffDays <= 30) stats.upcoming.thisMonth++;
    });

    // Next event
    if (upcomingEvents.length > 0) {
      const next = upcomingEvents[0];
      const diffDays = Math.ceil((next.adjustedDate - now) / (1000 * 60 * 60 * 24));

      stats.nextEvent = {
        id: next.id,
        title: next.title,
        type: next.type,
        date: next.event_date,
        time: next.event_time,
        daysUntil: diffDays
      };
    }

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
