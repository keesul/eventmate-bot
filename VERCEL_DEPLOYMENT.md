# 🚀 EventMate Bot - Деплой на Vercel + Supabase

## 📋 Архітектура (Тільки Vercel + Supabase)

```
┌─────────────────────────────────────────┐
│ Vercel                                  │
│ ├─ api/webhook.js (Telegram bot) ✓     │
│ ├─ api/check-reminders.js (Cron) ✓     │
│ ├─ api/events.js (CRUD API) ✓          │
│ └─ public/ (Mini App) ✓                │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Supabase (Database)                     │
│ ├─ users table ✓                        │
│ └─ events table ✓                       │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ cron-job.org (External Cron)            │
│ └─ Викликає /api/check-reminders        │
│    кожну хвилину ✓                      │
└─────────────────────────────────────────┘
```

## ✅ Переваги цього рішення

- ✅ **Безкоштовно** - Vercel Free tier + Supabase Free tier
- ✅ **Все в одному місці** - не потрібен окремий сервер
- ✅ **Автоматичний деплой** - push на GitHub = автодеплой
- ✅ **Serverless** - масштабується автоматично
- ✅ **Вже налаштовано** - Vercel і Supabase вже працюють

## 🔧 Крок 1: Налаштування Webhook в Telegram

### 1.1 Отримайте Vercel URL
Ваш проект вже задеплоєно на: `https://eventmate-bot.vercel.app`

### 1.2 Встановіть Webhook
Виконайте команду (замініть BOT_TOKEN на ваш):

```bash
curl -X POST "https://api.telegram.org/bot8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://eventmate-bot.vercel.app/api/webhook"}'
```

Відповідь:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### 1.3 Перевірте Webhook
```bash
curl "https://api.telegram.org/bot8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8/getWebhookInfo"
```

Повинно показати:
```json
{
  "ok": true,
  "result": {
    "url": "https://eventmate-bot.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## 🌐 Крок 2: Налаштування змінних середовища в Vercel

### 2.1 Відкрийте Vercel Dashboard
1. Зайдіть на [vercel.com](https://vercel.com)
2. Виберіть проект `eventmate-bot`
3. Settings → Environment Variables

### 2.2 Додайте змінні
```
BOT_TOKEN=8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8
WEBAPP_URL=https://eventmate-bot.vercel.app
SUPABASE_URL=https://djmfqkswwwcbaxgutygb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jRr48EwQaRsurF8TVqGLXg_rLwiaWBa
CRON_SECRET=eventmate_cron_secret_2026_change_this
```

### 2.3 Згенеруйте безпечний CRON_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Замініть `CRON_SECRET` на згенерований токен.

### 2.4 Redeploy
Після додавання змінних натисніть **Redeploy** в Vercel.

## ⏰ Крок 3: Налаштування External Cron (cron-job.org)

### 3.1 Реєстрація
1. Зайдіть на [cron-job.org](https://cron-job.org)
2. Створіть безкоштовний акаунт

### 3.2 Створення Cron Job
1. Натисніть **"Create cronjob"**
2. Заповніть форму:

**Title:** EventMate Reminders Check

**URL:** `https://eventmate-bot.vercel.app/api/check-reminders`

**Schedule:** 
- Execution: Every minute
- Pattern: `* * * * *`

**Request:**
- Method: `GET`
- Headers: Додайте header
  - Name: `Authorization`
  - Value: `Bearer [ваш-CRON_SECRET]`

**Notifications:**
- Enable "Notify on failure"
- Email: ваш email

3. Натисніть **"Create"**

### 3.3 Тестування
1. Натисніть "Execute now"
2. Перевірте Execution history
3. Статус повинен бути `200 OK`

## 📝 Крок 4: Оновлення коду (якщо потрібно)

### 4.1 Push змін на GitHub
```bash
cd /c/Users/kazmi/eventmate-bot
git add .
git commit -m "Switch to Vercel-only architecture"
git push
```

### 4.2 Автоматичний деплой
Vercel автоматично задеплоїть зміни після push.

## ✅ Крок 5: Тестування

### 5.1 Перевірте бота
1. Відкрийте бота в Telegram
2. Надішліть `/start`
3. Бот повинен відповісти миттєво

### 5.2 Перевірте cron endpoint
```bash
curl -H "Authorization: Bearer [ваш-CRON_SECRET]" \
     https://eventmate-bot.vercel.app/api/check-reminders
```

Відповідь:
```json
{
  "success": true,
  "timestamp": "2026-05-12T19:50:00.000Z",
  "currentTime": "19:50",
  "checkedEvents": 5,
  "sentReminders": 0
}
```

### 5.3 Тестування нагадувань

1. Відкрийте бота в Telegram
2. Натисніть `/start` → "📅 Відкрити EventMate"
3. Створіть тестову подію:
   - Тип: Нагадування
   - Назва: Тестове нагадування
   - Дата: Завтра
   - Час події: 10:00
   - Нагадати за: 1 день
   - Час нагадування: **19:53** (поточний час + 3 хвилини)

4. Через 3 хвилини ви отримаєте повідомлення від бота! 🔔

## 🔒 Безпека

### Змініть CRON_SECRET
1. Згенеруйте новий токен:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Оновіть в Vercel Environment Variables
3. Оновіть в cron-job.org → Edit job → Headers
4. Redeploy Vercel

## 📊 Моніторинг

### Vercel Logs
```
Dashboard → Project → Deployments → View Function Logs
```

Шукайте:
- `✅ Sent reminder` - успішно відправлено
- `❌ Error sending reminder` - помилка

### cron-job.org Dashboard
- Execution history
- Success/failure rate
- Response times
- Email notifications при помилках

### Telegram Bot
Надішліть `/start` - бот повинен відповісти миттєво

## 🐛 Troubleshooting

### Webhook не працює
```bash
# Перевірте webhook status
curl "https://api.telegram.org/bot8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8/getWebhookInfo"

# Якщо потрібно видалити webhook
curl -X POST "https://api.telegram.org/bot8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8/deleteWebhook"

# Встановити знову
curl -X POST "https://api.telegram.org/bot8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://eventmate-bot.vercel.app/api/webhook"}'
```

### Cron не викликається
1. Перевірте Authorization header в cron-job.org
2. Перевірте CRON_SECRET в Vercel Environment Variables
3. Перевірте Execution history в cron-job.org
4. Викличте endpoint вручну для тестування

### Нагадування не приходять
1. Перевірте Vercel Function Logs
2. Перевірте час нагадування в події (має збігатися з поточним часом)
3. Перевірте cron-job.org execution history
4. Викличте `/api/check-reminders` вручну

### Vercel Function Timeout
Якщо багато подій:
1. Vercel Free tier: 10s timeout
2. Оптимізуйте запити до Supabase
3. Або upgrade до Pro ($20/month) для 60s timeout

## 💰 Вартість

### Безкоштовно (Free Tier)
- ✅ Vercel: 100GB bandwidth, 100 function invocations/day
- ✅ Supabase: 500MB database, 2GB bandwidth
- ✅ cron-job.org: Unlimited cron jobs

### Якщо перевищите ліміти
- Vercel Pro: $20/month
- Supabase Pro: $25/month

**Для особистого використання Free tier більш ніж достатньо!**

## 🎉 Готово!

Ваш бот тепер працює автономно на Vercel + Supabase:
- ✅ Webhook для миттєвих відповідей
- ✅ External cron для нагадувань
- ✅ Serverless Mini App
- ✅ Supabase база даних
- ✅ Все безкоштовно!

Нагадування будуть приходити точно в зазначений час! 🔔
