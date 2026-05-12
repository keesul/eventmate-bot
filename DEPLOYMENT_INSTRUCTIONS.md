# 🚀 Інструкції з деплою EventMate Bot (Автономна робота)

## 📋 Огляд архітектури

```
┌─────────────────────────────────────────┐
│ Railway (Bot + API)                     │
│ ├─ Webhook ✓                            │
│ ├─ Express API ✓                        │
│ └─ /api/check-reminders endpoint ✓     │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Vercel (Mini App)                       │
│ ├─ Static files ✓                       │
│ └─ Serverless functions ✓               │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ cron-job.org (External Cron)            │
│ └─ Викликає /api/check-reminders        │
│    кожну хвилину ✓                      │
└─────────────────────────────────────────┘
```

## 🔧 Крок 1: Деплой на Railway

### 1.1 Підготовка
```bash
cd /c/Users/kazmi/eventmate-bot
git add .
git commit -m "Add webhook support and external cron endpoint"
git push
```

### 1.2 Деплой на Railway
1. Зайдіть на [railway.app](https://railway.app)
2. Створіть новий проект з GitHub репозиторію
3. Railway автоматично виявить Node.js проект

### 1.3 Налаштування змінних середовища
Додайте в Railway Settings → Variables:

```
BOT_TOKEN=8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8
WEBAPP_URL=https://eventmate-bot.vercel.app
PORT=3000
SUPABASE_URL=https://djmfqkswwwcbaxgutygb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jRr48EwQaRsurF8TVqGLXg_rLwiaWBa
WEBHOOK_DOMAIN=https://your-app.railway.app
CRON_SECRET=eventmate_cron_secret_2026_change_this
```

### 1.4 Отримайте Railway URL
Після деплою скопіюйте URL (наприклад: `https://eventmate-bot-production.up.railway.app`)

### 1.5 Оновіть WEBHOOK_DOMAIN
Поверніться в Variables та оновіть:
```
WEBHOOK_DOMAIN=https://eventmate-bot-production.up.railway.app
```

Redeploy проект після зміни.

## 🌐 Крок 2: Налаштування External Cron (cron-job.org)

### 2.1 Реєстрація
1. Зайдіть на [cron-job.org](https://cron-job.org)
2. Створіть безкоштовний акаунт

### 2.2 Створення Cron Job
1. Натисніть **"Create cronjob"**
2. Заповніть форму:

**Title:** EventMate Reminders Check

**URL:** `https://your-app.railway.app/api/check-reminders`
(замініть на ваш Railway URL)

**Schedule:** 
- Execution: Every minute
- Pattern: `* * * * *`

**Request:**
- Method: `GET`
- Headers: Додайте header
  - Name: `Authorization`
  - Value: `Bearer eventmate_cron_secret_2026_change_this`

**Notifications:**
- Enable "Notify on failure"
- Email: ваш email

3. Натисніть **"Create"**

### 2.3 Перевірка
Після створення cron job:
1. Натисніть "Execute now" для тестування
2. Перевірте Execution history
3. Статус повинен бути `200 OK`

## 📱 Крок 3: Деплой Mini App на Vercel (вже зроблено)

Mini App вже задеплоєно на Vercel: `https://eventmate-bot.vercel.app`

Якщо потрібно оновити:
```bash
cd /c/Users/kazmi/eventmate-bot
vercel --prod
```

## ✅ Крок 4: Перевірка роботи

### 4.1 Перевірте webhook
```bash
curl https://your-app.railway.app/webhook
```

### 4.2 Перевірте cron endpoint
```bash
curl -H "Authorization: Bearer eventmate_cron_secret_2026_change_this" \
     https://your-app.railway.app/api/check-reminders
```

Відповідь:
```json
{
  "success": true,
  "timestamp": "2026-05-12T19:45:00.000Z",
  "currentTime": "19:45",
  "checkedEvents": 5,
  "sentReminders": 0
}
```

### 4.3 Тестування нагадувань

1. Відкрийте бота в Telegram
2. Натисніть `/start`
3. Створіть тестову подію:
   - Тип: Нагадування
   - Дата: Завтра
   - Час: 10:00
   - Нагадати за: 1 день
   - Час нагадування: **поточний час + 2 хвилини** (наприклад, якщо зараз 19:45, встановіть 19:47)

4. Через 2 хвилини ви отримаєте повідомлення від бота!

## 🔒 Безпека

### Змініть CRON_SECRET
Згенеруйте випадковий токен:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Оновіть в:
1. Railway Variables → `CRON_SECRET`
2. cron-job.org → Edit job → Headers → Authorization

## 📊 Моніторинг

### Railway Logs
```
Settings → Deployments → View Logs
```

Шукайте:
- `✅ Webhook встановлено`
- `🌐 HTTP сервер запущено`

### cron-job.org Dashboard
- Execution history
- Success/failure rate
- Response times

### Telegram Bot
Надішліть `/start` - бот повинен відповісти миттєво

## 🐛 Troubleshooting

### Webhook не працює
```bash
# Перевірте webhook status
curl https://api.telegram.org/bot8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8/getWebhookInfo
```

### Cron не викликається
1. Перевірте Authorization header в cron-job.org
2. Перевірте CRON_SECRET в Railway
3. Перевірте Execution history в cron-job.org

### Нагадування не приходять
1. Перевірте логи Railway
2. Перевірте час нагадування в події
3. Перевірте cron-job.org execution history
4. Викличте endpoint вручну для тестування

## 📝 Альтернативи cron-job.org

Якщо cron-job.org не підходить:

1. **EasyCron** - https://www.easycron.com
2. **Uptime Robot** - https://uptimerobot.com (Monitor + Heartbeat)
3. **GitHub Actions** (безкоштовно для публічних репо)

## 🎉 Готово!

Ваш бот тепер працює автономно:
- ✅ Webhook для миттєвих відповідей
- ✅ External cron для нагадувань
- ✅ Serverless Mini App
- ✅ Supabase база даних

Нагадування будуть приходити точно в зазначений час! 🔔
