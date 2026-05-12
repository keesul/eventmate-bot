const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const BOT_TOKEN = process.env.BOT_TOKEN;

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  return response.json();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
                  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

async function getUpcomingEvents(date) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      users!inner (
        telegram_id,
        first_name,
        timezone
      )
    `)
    .or(`and(is_recurring.eq.true,event_date.gte.1900-01-01),and(is_recurring.eq.false,event_date.eq.${date})`)
    .order('event_time', { ascending: true });

  if (error) throw error;

  const targetDate = new Date(date);
  const targetMonth = targetDate.getMonth() + 1;
  const targetDay = targetDate.getDate();

  const filtered = (data || []).filter(event => {
    if (event.is_recurring) {
      const eventDate = new Date(event.event_date);
      return eventDate.getMonth() + 1 === targetMonth && eventDate.getDate() === targetDay;
    }
    return true;
  });

  return filtered.map(event => ({
    ...event,
    telegram_id: event.users.telegram_id,
    first_name: event.users.first_name,
    user_timezone: event.users.timezone || 'UTC'
  }));
}

module.exports = async function handler(req, res) {
  // Security: check secret token
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CRON_SECRET || 'your-secret-token';

  if (authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    let sentCount = 0;
    let checkedCount = 0;

    // Перевіряємо події на найближчі 7 днів
    for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const dateString = targetDate.toISOString().split('T')[0];

      const events = await getUpcomingEvents(dateString);
      checkedCount += events.length;

      for (const event of events) {
        try {
          const reminderTime = event.reminder_time || '09:00';
          const reminderDays = event.reminder_days || 1;
          const userTimezone = event.user_timezone || 'UTC';

          // Нормалізуємо час нагадування (видаляємо секунди якщо є)
          const normalizedReminderTime = reminderTime.substring(0, 5); // HH:MM

          // Конвертуємо поточний UTC час в timezone користувача
          const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
          const userHour = userTime.getHours();
          const userMinute = userTime.getMinutes();
          const userCurrentTime = `${String(userHour).padStart(2, '0')}:${String(userMinute).padStart(2, '0')}`;

          // Перевіряємо, чи зараз час для нагадування в timezone користувача
          const shouldRemind = daysAhead === reminderDays && userCurrentTime === normalizedReminderTime;

          if (!shouldRemind) continue;

          const emoji = event.type === 'birthday' ? '🎂' : event.type === 'reminder' ? '⏰' : '🎊';
          const currentYear = now.getFullYear();

          let message = '';

          if (daysAhead === 0) {
            message = `🔔 Сьогодні!\n\n${emoji} ${event.title}`;
          } else if (daysAhead === 1) {
            message = `🔔 Нагадування!\n\nЗавтра:\n${emoji} ${event.title}`;
          } else {
            message = `🔔 Нагадування!\n\nЧерез ${daysAhead} днів:\n${emoji} ${event.title}`;
          }

          if (event.event_time) {
            message += `\n⏰ ${event.event_time}`;
          }

          // Для днів народження показуємо вік
          if (event.type === 'birthday' && event.birth_year) {
            const age = currentYear - event.birth_year;
            message += `\n🎈 Виповнюється ${age} років`;
          }

          if (event.notes) {
            message += `\n📝 ${event.notes}`;
          }

          await sendMessage(event.telegram_id, message);
          sentCount++;

          console.log('✅ Sent reminder:', {
            eventId: event.id,
            userId: event.telegram_id,
            title: event.title,
            daysAhead,
            reminderTime: event.reminder_time,
            currentTime
          });
        } catch (err) {
          console.error('❌ Error sending reminder:', err.message, event.id);
        }
      }
    }

    res.status(200).json({
      success: true,
      timestamp: now.toISOString(),
      currentTime,
      checkedEvents: checkedCount,
      sentReminders: sentCount
    });
  } catch (error) {
    console.error('❌ Cron job error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
