# 🎉 EventMate — Telegram Mini App Bot

Telegram бот з Mini App для управління подіями та автоматичними нагадуваннями.

## ✨ Функціонал

### Mini App
- ✅ Три типи подій: День народження / Нагадування / Подія
- ✅ Фільтрація по вкладках
- ✅ Сортування за найближчою датою
- ✅ Зворотний відлік ("За 5 дн.", "Завтра", "Сьогодні 🎉")
- ✅ Редагування та видалення подій
- ✅ Збереження в Supabase
- ✅ Тактильний зворотний зв'язок через Telegram API
- ✅ Підтримка Telegram тем (dark/light)

### Telegram Bot
- ✅ Автоматичні нагадування в зазначений час
- ✅ Підтримка будь-якого часу (09:00, 09:30, 14:45 тощо)
- ✅ Команди: /start
- ✅ Inline кнопки для швидкого доступу
- ✅ Webhook для миттєвих відповідей

## 🚀 Архітектура

```
┌─────────────────────────────────────────┐
│ Vercel (Serverless)                     │
│ ├─ api/webhook.js (Telegram bot)       │
│ ├─ api/check-reminders.js (Cron)       │
│ ├─ api/events.js (CRUD API)            │
│ └─ public/ (Mini App)                   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Supabase (Database)                     │
│ ├─ users table                          │
│ └─ events table                         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ cron-job.org (External Cron)            │
│ └─ Викликає check-reminders щохвилини   │
└─────────────────────────────────────────┘
```

## 📋 Деплой

**Детальні інструкції:** [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)

### Швидкий старт

1. **Встановіть Webhook:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://eventmate-bot.vercel.app/api/webhook"}'
```

2. **Додайте змінні в Vercel:**
   - `BOT_TOKEN`
   - `WEBAPP_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CRON_SECRET`

3. **Налаштуйте cron-job.org:**
   - URL: `https://eventmate-bot.vercel.app/api/check-reminders`
   - Schedule: Every minute (`* * * * *`)
   - Header: `Authorization: Bearer <CRON_SECRET>`

## 🔧 Технології

- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vanilla JS, Telegram Web App API
- **Cron**: cron-job.org (external)
- **Deployment**: Vercel

## 📝 Команди бота

- `/start` — Головне меню
- Inline кнопки:
  - 📅 Відкрити EventMate — відкриває Mini App
  - 📋 Мої події — показує список подій
  - ℹ️ Допомога — інструкції

## 🔔 Нагадування

Бот автоматично відправляє нагадування в зазначений час:
- Підтримка будь-якого часу (09:00, 09:30, 14:45 тощо)
- Налаштовується при створенні події
- Працює автономно через external cron

**Приклад:**
- Подія: 15 травня 2026 о 18:00
- Нагадати за: 1 день
- Час нагадування: 14:30
- Результат: 14 травня о 14:30 прийде повідомлення

## 💰 Вартість

**Безкоштовно (Free Tier):**
- ✅ Vercel: 100GB bandwidth, 100 function invocations/day
- ✅ Supabase: 500MB database, 2GB bandwidth
- ✅ cron-job.org: Unlimited cron jobs

## 📁 Структура проекту

```
eventmate-bot/
├── api/
│   ├── webhook.js           # Telegram bot webhook
│   ├── check-reminders.js   # Cron endpoint
│   ├── events.js            # CRUD API
│   └── [id].js              # Dynamic routes
├── public/
│   ├── index.html           # Mini App
│   ├── style.css            # Стилі
│   └── app.js               # JavaScript логіка
├── .env                     # Змінні середовища
├── package.json
├── vercel.json              # Vercel config
├── VERCEL_DEPLOYMENT.md     # Інструкції деплою
└── README.md
```

## 🐛 Troubleshooting

### Webhook не працює
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Нагадування не приходять
1. Перевірте Vercel Function Logs
2. Перевірте cron-job.org execution history
3. Викличте `/api/check-reminders` вручну:
```bash
curl -H "Authorization: Bearer <CRON_SECRET>" \
     https://eventmate-bot.vercel.app/api/check-reminders
```

## 📄 Ліцензія

MIT

## 👨‍💻 Автор

Створено для управління особистими подіями через Telegram.

---

**Повні інструкції з деплою:** [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md)
