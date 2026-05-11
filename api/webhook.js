import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

const bot = new Telegraf(process.env.BOT_TOKEN);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Telegram webhook handler
export default async function handler(req, res) {
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

      // Create user in database
      await supabase
        .from('users')
        .upsert({
          telegram_id: userId,
          username: username,
          first_name: firstName
        }, {
          onConflict: 'telegram_id'
        });

      await bot.telegram.sendMessage(
        userId,
        `👋 Привіт, ${firstName}!\n\n` +
        `🎉 EventMate — твій особистий помічник для управління подіями!\n\n` +
        `📅 Створюй події трьох типів:\n` +
        `🎂 День народження\n` +
        `⏰ Нагадування\n` +
        `🎊 Подія\n\n` +
        `✨ Отримуй нагадування вчасно!\n` +
        `📱 Зручний інтерфейс Mini App`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('📅 Відкрити EventMate', process.env.WEBAPP_URL)],
          [Markup.button.callback('📋 Мої події', 'my_events')],
          [Markup.button.callback('ℹ️ Допомога', 'help')]
        ])
      );
    }

    // Handle callback queries
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const userId = update.callback_query.from.id;

      await bot.telegram.answerCbQuery(update.callback_query.id);

      if (callbackData === 'my_events') {
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', userId)
          .order('event_date', { ascending: true });

        if (!events || events.length === 0) {
          await bot.telegram.sendMessage(
            userId,
            '📭 У вас поки немає подій.\n\nСтворіть свою першу подію!',
            Markup.inlineKeyboard([
              [Markup.button.webApp('➕ Створити подію', process.env.WEBAPP_URL)]
            ])
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

          await bot.telegram.sendMessage(
            userId,
            message,
            Markup.inlineKeyboard([
              [Markup.button.webApp('📅 Відкрити EventMate', process.env.WEBAPP_URL)]
            ])
          );
        }
      }

      if (callbackData === 'help') {
        await bot.telegram.sendMessage(
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
          Markup.inlineKeyboard([
            [Markup.button.webApp('📅 Відкрити EventMate', process.env.WEBAPP_URL)]
          ])
        );
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
}
