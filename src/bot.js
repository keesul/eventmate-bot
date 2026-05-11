import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { dbQueries } from './database.js';
import { format, addDays, parse } from 'date-fns';
import { uk } from 'date-fns/locale';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('webapp'));

// Logging setup
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `bot-${format(new Date(), 'yyyy-MM-dd')}.log`);

function log(message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message} ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logFile, logEntry);
}

// Start command
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || '';
    const firstName = ctx.from.first_name || '';

    await dbQueries.createUser(userId, username, firstName);
    log('👤 Новий користувач', { userId, username, firstName });

    ctx.reply(
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
  } catch (err) {
    log('❌ Помилка start', { error: err.message });
    ctx.reply('❌ Виникла помилка. Спробуйте ще раз.');
  }
});

// Callback handlers
bot.action('my_events', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    const events = await dbQueries.getUserEvents(ctx.from.id);

    if (events.length === 0) {
      ctx.reply(
        '📭 У вас поки немає подій.\n\nСтворіть свою першу подію!',
        Markup.inlineKeyboard([
          [Markup.button.webApp('➕ Створити подію', process.env.WEBAPP_URL)]
        ])
      );
      return;
    }

    let message = '📋 Ваші події:\n\n';
    events.forEach((event) => {
      const emoji = event.type === 'birthday' ? '🎂' : event.type === 'reminder' ? '⏰' : '🎊';
      const date = format(parse(event.event_date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy', { locale: uk });
      message += `${emoji} ${event.title}\n`;
      message += `📅 ${date}`;
      if (event.event_time) {
        message += ` о ${event.event_time}`;
      }
      message += '\n\n';
    });

    ctx.reply(message, Markup.inlineKeyboard([
      [Markup.button.webApp('📅 Відкрити EventMate', process.env.WEBAPP_URL)]
    ]));
  } catch (err) {
    log('❌ Помилка my_events', { error: err.message });
    ctx.reply('❌ Виникла помилка. Спробуйте ще раз.');
  }
});

bot.action('help', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply(
    `📖 Як користуватися EventMate:\n\n` +
    `1️⃣ Натисніть "Відкрити EventMate"\n` +
    `2️⃣ Оберіть тип події (День народження, Нагадування, Подія)\n` +
    `3️⃣ Заповніть деталі\n` +
    `4️⃣ Збережіть подію\n\n` +
    `✅ Ви отримаєте нагадування:\n` +
    `• За день до події\n` +
    `• В день події\n\n` +
    `🔔 Команди:\n` +
    `/start - Головне меню\n` +
    `/myevents - Мої події`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('📅 Відкрити EventMate', process.env.WEBAPP_URL)]
    ])
  );
});

// Web App Data handler
bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    log('📱 Дані з Mini App', { userId: ctx.from.id, action: data.action });

    if (data.action === 'create_event') {
      const { title, type, date, time, notes, reminderDays, reminderTime, birthYear } = data;

      // Для днів народження автоматично встановлюємо is_recurring = true
      const isRecurring = type === 'birthday';

      const result = await dbQueries.createEvent(
        ctx.from.id,
        title,
        type,
        date,
        time || null,
        notes || null,
        reminderDays || 1,
        reminderTime || '09:00',
        isRecurring,
        birthYear || null
      );

      const emoji = type === 'birthday' ? '🎂' : type === 'reminder' ? '⏰' : '🎊';
      const formattedDate = format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy', { locale: uk });

      let message = `✅ Подію створено!\n\n${emoji} ${title}\n📅 ${formattedDate}`;

      if (time) message += ` о ${time}`;
      if (notes) message += `\n📝 ${notes}`;
      if (isRecurring) message += `\n🔄 Щорічне нагадування`;
      if (birthYear) {
        const age = new Date().getFullYear() - birthYear;
        message += `\n🎈 Вік: ${age} років`;
      }
      message += `\n🔔 Нагадаємо за ${reminderDays} ${reminderDays === 1 ? 'день' : 'днів'} о ${reminderTime}`;

      await ctx.reply(
        message,
        Markup.inlineKeyboard([
          [Markup.button.webApp('📅 Відкрити EventMate', process.env.WEBAPP_URL)]
        ])
      );

      log('✅ Створено подію', { eventId: result.id, userId: ctx.from.id });
    }

    if (data.action === 'update_event') {
      const { id, title, type, date, time, notes, reminderDays, reminderTime, birthYear } = data;

      const isRecurring = type === 'birthday';

      await dbQueries.updateEvent(
        title,
        type,
        date,
        time || null,
        notes || null,
        id,
        ctx.from.id,
        reminderDays || 1,
        reminderTime || '09:00',
        isRecurring,
        birthYear || null
      );

      await ctx.reply('✅ Подію оновлено!');
      log('✅ Оновлено подію', { eventId: id, userId: ctx.from.id });
    }

    if (data.action === 'delete_event') {
      const { id } = data;

      await dbQueries.deleteEvent(id, ctx.from.id);

      await ctx.reply('🗑 Подію видалено');
      log('🗑 Видалено подію', { eventId: id, userId: ctx.from.id });
    }
  } catch (err) {
    log('❌ Помилка обробки даних Mini App', { error: err.message });
    ctx.reply('❌ Виникла помилка. Спробуйте ще раз.');
  }
});

// HTTP API для Mini App
app.get('/api/events/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const events = await dbQueries.getUserEvents(userId);
    res.json({ success: true, events });
  } catch (err) {
    log('❌ Помилка API /events', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { userId, title, type, date, time, notes, reminderDays, reminderTime, birthYear } = req.body;

    const isRecurring = type === 'birthday';

    const result = await dbQueries.createEvent(
      userId,
      title,
      type,
      date,
      time || null,
      notes || null,
      reminderDays || 1,
      reminderTime || '09:00',
      isRecurring,
      birthYear || null
    );

    log('✅ HTTP створення події', { eventId: result.id, userId });
    res.json({ success: true, eventId: result.id });
  } catch (err) {
    log('❌ Помилка API створення події', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, title, type, date, time, notes, reminderDays, reminderTime, birthYear } = req.body;

    const isRecurring = type === 'birthday';

    await dbQueries.updateEvent(
      title,
      type,
      date,
      time || null,
      notes || null,
      id,
      userId,
      reminderDays || 1,
      reminderTime || '09:00',
      isRecurring,
      birthYear || null
    );

    log('✅ HTTP оновлення події', { eventId: id, userId });
    res.json({ success: true });
  } catch (err) {
    log('❌ Помилка API оновлення події', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await dbQueries.deleteEvent(id, userId);

    log('🗑 HTTP видалення події', { eventId: id, userId });
    res.json({ success: true });
  } catch (err) {
    log('❌ Помилка API видалення події', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cron job для нагадувань (кожну годину перевіряємо)
cron.schedule('0 * * * *', async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  try {
    // Перевіряємо події на сьогодні та найближчі дні
    for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
      const targetDate = format(addDays(now, daysAhead), 'yyyy-MM-dd');
      const events = await dbQueries.getUpcomingEvents(targetDate);

      for (const event of events) {
        try {
          // Парсимо час нагадування
          const [reminderHour, reminderMinute] = (event.reminder_time || '09:00').split(':').map(Number);
          const reminderDays = event.reminder_days || 1;

          // Перевіряємо, чи зараз час для нагадування
          const shouldRemind = daysAhead === reminderDays &&
                               currentHour === reminderHour &&
                               currentMinute === 0;

          if (!shouldRemind) continue;

          const emoji = event.type === 'birthday' ? '🎂' : event.type === 'reminder' ? '⏰' : '🎊';
          const eventDate = new Date(event.event_date);
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

          await bot.telegram.sendMessage(event.telegram_id, message);
          log('🔔 Відправлено нагадування', {
            eventId: event.id,
            userId: event.telegram_id,
            daysAhead,
            reminderTime: event.reminder_time
          });
        } catch (err) {
          log('❌ Помилка відправки нагадування', { error: err.message, eventId: event.id });
        }
      }
    }
  } catch (err) {
    log('❌ Помилка cron job', { error: err.message });
  }
});

// Запуск Express сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 HTTP сервер запущено на порту ${PORT}`);
  log('🌐 HTTP сервер запущено', { port: PORT });
});

// Error handler
bot.catch((err, ctx) => {
  log('❌ Помилка бота', { error: err.message, userId: ctx?.from?.id });
  console.error('Bot error:', err);
});

// Launch bot
bot.launch().then(() => {
  log('✅ Бот успішно запущено!');
  console.log('✅ EventMate бот запущено!');
  console.log(`📁 Логи: ${logFile}`);
  console.log(`🌐 Сервер: http://localhost:${PORT}`);
  console.log(`💾 База даних: Supabase`);
}).catch((err) => {
  log('❌ Помилка запуску', { error: err.message });
  console.error('❌ Помилка запуску:', err);
});

// Graceful shutdown
process.once('SIGINT', () => {
  log('🛑 Бот зупиняється (SIGINT)');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  log('🛑 Бот зупиняється (SIGTERM)');
  bot.stop('SIGTERM');
});
