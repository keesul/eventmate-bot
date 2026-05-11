# 🎯 Інструкція з налаштування EventMate Bot

## Крок 1: Створення бота в Telegram

1. Відкрийте [@BotFather](https://t.me/BotFather) в Telegram
2. Відправте команду `/newbot`
3. Введіть назву бота (наприклад: `EventMate`)
4. Введіть username бота (наприклад: `eventmate_helper_bot`)
5. **Збережіть токен** який надасть BotFather (виглядає як `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Крок 2: Налаштування .env файлу

Відкрийте файл `.env` та замініть `your_bot_token_here` на ваш токен:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
WEBAPP_URL=http://localhost:3000
PORT=3000
DATABASE_PATH=./data/events.db
```

## Крок 3: Запуск бота

Відкрийте термінал в директорії проекту:

```bash
cd /c/Users/kazmi/eventmate-bot
npm start
```

Ви побачите:
```
✅ EventMate бот запущено!
📁 Логи: ./logs/bot-2026-05-11.log
🌐 Сервер: http://localhost:3000
```

## Крок 4: Налаштування Mini App кнопки

1. Відкрийте [@BotFather](https://t.me/BotFather)
2. Відправте `/mybots`
3. Виберіть вашого бота
4. Натисніть `Bot Settings`
5. Натисніть `Menu Button`
6. Виберіть `Edit menu button URL`
7. Введіть: `http://localhost:3000`
8. Виберіть `Edit menu button text`
9. Введіть: `📅 Відкрити EventMate`

## Крок 5: Тестування

1. Знайдіть вашого бота в Telegram (за username)
2. Натисніть `/start`
3. Натисніть кнопку меню (📅 Відкрити EventMate) або inline кнопку
4. Mini App має відкритися з демо-подіями

## 🔧 Налаштування для публічного доступу (ngrok)

Якщо хочете протестувати з телефону:

1. Встановіть ngrok:
```bash
npm install -g ngrok
```

2. В одному терміналі запустіть бота:
```bash
npm start
```

3. В іншому терміналі запустіть ngrok:
```bash
ngrok http 3000
```

4. Скопіюйте HTTPS URL (наприклад: `https://abc123.ngrok.io`)

5. Оновіть в BotFather Menu Button URL на ngrok URL

6. Оновіть `.env`:
```env
WEBAPP_URL=https://abc123.ngrok.io
```

7. Перезапустіть бота

## 🚀 Деплой на Railway (для постійної роботи)

### 1. Створіть GitHub репозиторій

```bash
cd /c/Users/kazmi/eventmate-bot
git init
git add .
git commit -m "Initial commit: EventMate bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/eventmate-bot.git
git push -u origin main
```

### 2. Деплой на Railway

1. Зайдіть на [railway.app](https://railway.app)
2. Натисніть `Login with GitHub`
3. Натисніть `New Project`
4. Виберіть `Deploy from GitHub repo`
5. Виберіть репозиторій `eventmate-bot`
6. Railway автоматично почне деплой

### 3. Додайте змінні середовища

1. В Railway Dashboard відкрийте ваш проект
2. Перейдіть на вкладку `Variables`
3. Додайте змінні:

```
BOT_TOKEN=ваш_токен_з_botfather
WEBAPP_URL=https://your-app.up.railway.app
PORT=3000
DATABASE_PATH=./data/events.db
```

4. Railway автоматично перезапустить бота

### 4. Отримайте публічний URL

1. В Railway Dashboard → `Settings`
2. Прокрутіть до `Networking`
3. Натисніть `Generate Domain`
4. Скопіюйте URL (наприклад: `https://eventmate-bot-production.up.railway.app`)

### 5. Оновіть WEBAPP_URL

1. В Railway Variables змініть `WEBAPP_URL` на ваш Railway URL
2. В BotFather оновіть Menu Button URL на Railway URL

## ✅ Готово!

Тепер ваш бот працює 24/7 і доступний з будь-якого пристрою!

## 🔔 Перевірка нагадувань

Нагадування відправляються щодня о 9:00 ранку.

Для тестування можете змінити час в `src/bot.js`:

```javascript
// Замість '0 9 * * *' (9:00 щодня)
// Використайте '*/5 * * * *' (кожні 5 хвилин для тесту)
cron.schedule('*/5 * * * *', async () => {
  // ...
});
```

## 📱 Команди бота

- `/start` — Головне меню
- `/myevents` — Показати всі події
- Inline кнопки:
  - 📅 Відкрити EventMate
  - 📋 Мої події
  - ℹ️ Допомога

## 🐛 Якщо щось не працює

1. Перевірте що бот запущений (`npm start`)
2. Перевірте `.env` файл (правильний токен)
3. Перевірте логи в `logs/bot-YYYY-MM-DD.log`
4. Перевірте що порт 3000 вільний
5. Перевірте що URL в BotFather співпадає з WEBAPP_URL

## 📞 Підтримка

Якщо виникли проблеми:
1. Перевірте логи
2. Перезапустіть бота
3. Перевірте налаштування в BotFather
