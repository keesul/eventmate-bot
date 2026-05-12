# ✅ EventMate Bot - Виправлення системи нагадувань

## 🔧 Що було виправлено

### Проблема
Нагадування не приходили, тому що:
- Бот використовував Long Polling (не працює на serverless)
- Cron job запускався тільки раз на годину о :00 хвилин
- Не підтримував хвилини (09:30, 14:45 тощо)

### Рішення
✅ **Webhook замість Long Polling** - бот працює автономно на Railway
✅ **External Cron Service** - cron-job.org викликає endpoint кожну хвилину
✅ **Serverless endpoint** - `/api/check-reminders` перевіряє нагадування
✅ **Підтримка будь-якого часу** - 09:00, 09:30, 14:45 тощо

## 📁 Нові файли

- `api/check-reminders.js` - Serverless endpoint для перевірки нагадувань
- `DEPLOYMENT_INSTRUCTIONS.md` - Повні інструкції з деплою

## 🚀 Швидкий старт

### 1. Встановіть залежності
```bash
npm install
```

### 2. Налаштуйте .env
```env
BOT_TOKEN=your-bot-token
WEBAPP_URL=https://eventmate-bot.vercel.app
WEBHOOK_DOMAIN=https://your-app.railway.app
CRON_SECRET=your-random-secret
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

### 3. Задеплойте на Railway
Дивіться `DEPLOYMENT_INSTRUCTIONS.md` для детальних інструкцій

### 4. Налаштуйте cron-job.org
1. Створіть акаунт на [cron-job.org](https://cron-job.org)
2. Створіть job з URL: `https://your-app.railway.app/api/check-reminders`
3. Schedule: Every minute (`* * * * *`)
4. Header: `Authorization: Bearer your-cron-secret`

## 🎯 Як це працює

```
┌─────────────────────────────────────────┐
│ cron-job.org                            │
│ Викликає кожну хвилину                  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Railway: /api/check-reminders           │
│ 1. Перевіряє події на 7 днів вперед    │
│ 2. Порівнює час нагадування             │
│ 3. Відправляє повідомлення через бота  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Telegram Bot                            │
│ Користувач отримує нагадування          │
└─────────────────────────────────────────┘
```

## 📝 Приклад використання

1. Створіть подію в боті
2. Встановіть:
   - Дата: 15 травня 2026
   - Час події: 18:00
   - Нагадати за: 1 день
   - Час нагадування: 14:30

3. Результат: 14 травня о 14:30 ви отримаєте повідомлення:
```
🔔 Нагадування!

Завтра:
⏰ Назва події
⏰ 18:00
```

## 🔒 Безпека

- `CRON_SECRET` захищає endpoint від несанкціонованого доступу
- Тільки запити з правильним токеном обробляються
- Згенеруйте випадковий токен для production

## 📊 Моніторинг

### Перевірка роботи endpoint
```bash
curl -H "Authorization: Bearer your-cron-secret" \
     https://your-app.railway.app/api/check-reminders
```

Відповідь:
```json
{
  "success": true,
  "timestamp": "2026-05-12T19:46:00.000Z",
  "currentTime": "19:46",
  "checkedEvents": 10,
  "sentReminders": 2
}
```

## 🎉 Готово!

Тепер нагадування працюють автономно і приходять точно в зазначений час!

Детальні інструкції: `DEPLOYMENT_INSTRUCTIONS.md`
