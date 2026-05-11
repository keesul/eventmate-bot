# 🎉 EventMate — Telegram Mini App Bot

Повнофункціональний Telegram бот з Mini App для управління подіями.

## ✨ Функціонал

### Mini App
- ✅ Три типи подій: День народження / Нагадування / Подія
- ✅ Фільтрація по вкладках
- ✅ Сортування за найближчою датою
- ✅ Зворотний відлік ("За 5 дн.", "Завтра", "Сьогодні 🎉")
- ✅ Редагування та видалення подій
- ✅ Збереження у SQLite базі даних
- ✅ Тактильний зворотний зв'язок через Telegram API
- ✅ Підтримка Telegram тем (dark/light)
- ✅ Демо-дані при першому запуску

### Telegram Bot
- ✅ Автоматичні нагадування (за день до події та в день події)
- ✅ Команди: /start, /myevents
- ✅ Inline кнопки для швидкого доступу
- ✅ Логування всіх дій

## 🚀 Швидкий старт (локально)

### 1. Встановлення залежностей

```bash
cd /c/Users/kazmi/eventmate-bot
npm install
```

### 2. Налаштування .env

Створіть бота через [@BotFather](https://t.me/BotFather) та отримайте токен.

Відредагуйте файл `.env`:

```env
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=http://localhost:3000
PORT=3000
DATABASE_PATH=./data/events.db
```

### 3. Запуск

```bash
npm start
```

Або для розробки з автоперезавантаженням:

```bash
npm run dev
```

### 4. Налаштування Mini App в BotFather

1. Відкрийте [@BotFather](https://t.me/BotFather)
2. Виберіть `/mybots` → ваш бот → `Bot Settings` → `Menu Button`
3. Вкажіть URL: `http://localhost:3000` (для локального тестування)
4. Назва кнопки: `Відкрити EventMate`

### 5. Тестування

Відкрийте вашого бота в Telegram та натисніть кнопку меню або команду `/start`.

## 🌐 Деплой на Railway

### 1. Підготовка

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Деплой

1. Зайдіть на [railway.app](https://railway.app)
2. Натисніть `New Project` → `Deploy from GitHub repo`
3. Виберіть ваш репозиторій
4. Railway автоматично виявить `railway.json` та `Procfile`

### 3. Налаштування змінних середовища

В Railway Dashboard → Variables додайте:

```
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://your-app.railway.app
PORT=3000
DATABASE_PATH=./data/events.db
```

### 4. Оновлення Mini App URL

Після деплою оновіть URL в BotFather:
- `/mybots` → ваш бот → `Bot Settings` → `Menu Button`
- URL: `https://your-app.railway.app`

## 🎨 Деплой Mini App на Vercel (опціонально)

Якщо хочете розділити бота та Mini App:

### 1. Створіть vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "webapp/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/webapp/$1"
    }
  ]
}
```

### 2. Деплой

```bash
cd webapp
vercel
```

### 3. Оновіть WEBAPP_URL

В Railway змінних та в `.env` вкажіть Vercel URL.

## 📁 Структура проекту

```
eventmate-bot/
├── src/
│   ├── bot.js          # Головний файл бота
│   └── database.js     # База даних SQLite
├── webapp/
│   ├── index.html      # Mini App HTML
│   ├── style.css       # Стилі
│   └── app.js          # JavaScript логіка
├── data/               # База даних (створюється автоматично)
├── logs/               # Логи (створюється автоматично)
├── .env                # Змінні середовища
├── package.json
├── railway.json        # Конфігурація Railway
├── Procfile           # Команда запуску
└── README.md
```

## 🔧 Технології

- **Backend**: Node.js, Telegraf, Express
- **Database**: better-sqlite3
- **Frontend**: Vanilla JS, Telegram Web App API
- **Deployment**: Railway, Vercel
- **Cron**: node-cron (нагадування о 9:00 щодня)

## 📝 Команди бота

- `/start` — Головне меню
- `/myevents` — Список всіх подій
- Inline кнопки:
  - 📅 Відкрити EventMate — відкриває Mini App
  - 📋 Мої події — показує список подій
  - ℹ️ Допомога — інструкції

## 🔔 Нагадування

Бот автоматично відправляє нагадування:
- **За день до події** (о 9:00)
- **В день події** (о 9:00)

Налаштування часу в `src/bot.js`:

```javascript
// Змініть '0 9 * * *' на потрібний час (формат cron)
cron.schedule('0 9 * * *', async () => {
  // ...
});
```

## 🐛 Логування

Всі дії логуються в `logs/bot-YYYY-MM-DD.log`:
- Створення користувачів
- Створення/редагування/видалення подій
- Відправка нагадувань
- Помилки

## 🔒 Безпека

- `.env` файл в `.gitignore`
- База даних в `.gitignore`
- Логи в `.gitignore`
- Валідація даних на сервері

## 📱 Тестування локально через ngrok

Для тестування Mini App локально з реальним Telegram:

```bash
# Встановіть ngrok
npm install -g ngrok

# Запустіть бота
npm start

# В іншому терміналі
ngrok http 3000
```

Використайте ngrok URL в BotFather для Menu Button.

## 🎯 Наступні кроки

- [ ] Додати повторювані події (щорічні дні народження)
- [ ] Експорт подій в календар
- [ ] Групові події
- [ ] Кастомні нагадування (за 1 годину, за тиждень)
- [ ] Інтеграція з Google Calendar

## 📄 Ліцензія

MIT

## 👨‍💻 Автор

Створено для управління особистими подіями через Telegram.
