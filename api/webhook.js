const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

// Helper to send Telegram messages
async function sendMessage(chatId, text, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  return response.json();
}

async function answerCallbackQuery(callbackQueryId) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;

    // Handle /start command
    if (update.message?.text === '/start') {
      const userId = update.message.from.id;
      const username = update.message.from.username || '';
      const firstName = update.message.from.first_name || '';

      // Create user in database with default timezone (will be updated from Mini App)
      await supabase
        .from('users')
        .upsert({
          telegram_id: userId,
          username: username,
          first_name: firstName,
          timezone: 'UTC' // Default, will be updated from Mini App
        }, {
          onConflict: 'telegram_id'
        });

      await sendMessage(
        userId,
        `darova chelik`
      );
    }

    // Handle callback queries
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const userId = update.callback_query.from.id;

      await answerCallbackQuery(update.callback_query.id);

      if (callbackData === 'my_events') {
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', userId)
          .order('event_date', { ascending: true });

        if (!events || events.length === 0) {
          await sendMessage(
            userId,
            '📭 У вас поки немає подій.\n\nСтворіть свою першу подію!',
            {
              inline_keyboard: [
                [{ text: '➕ Створити подію', web_app: { url: WEBAPP_URL } }]
              ]
            }
          );
        } else {
          let message = '📋 Ваші події:\n\n';
          events.forEach((event) => {
            const emoji = event.type === 'birthday' ? '🎂' : event.type === 'reminder' ? '⏰' : '🎊';
            const date = new Date(event.event_date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
            message += `${emoji} ${event.title}\n`;
            message += `📅 ${date}`;
            if (event.event_time) {
              message += ` о ${event.event_time}`;
            }
            message += '\n\n';
          });

          await sendMessage(
            userId,
            message,
            {
              inline_keyboard: [
                [{ text: '📅 Відкрити EventMate', web_app: { url: WEBAPP_URL } }]
              ]
            }
          );
        }
      }

      if (callbackData === 'help') {
        await sendMessage(
          userId,
          `📖 Як користуватися EventMate:\n\n` +
          `1️⃣ Натисніть "Відкрити EventMate"\n` +
          `2️⃣ Оберіть тип події (День народження, Нагадування, Подія)\n` +
          `3️⃣ Заповніть деталі\n` +
          `4️⃣ Збережіть подію\n\n` +
          `✅ Ви отримаєте нагадування:\n` +
          `• За день до події\n` +
          `• В день події\n\n` +
          `🔔 Команди:\n` +
          `/start - Головне меню`,
          {
            inline_keyboard: [
              [{ text: '📅 Відкрити EventMate', web_app: { url: WEBAPP_URL } }]
            ]
          }
        );
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
}
