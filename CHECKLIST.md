# ✅ Чеклист запуску EventMate Bot

## 📋 Перед запуском

- [x] Проект створено в `/c/Users/kazmi/eventmate-bot`
- [x] Залежності встановлено (`npm install`)
- [x] База даних протестована (всі тести пройдено)
- [ ] Створено бота через @BotFather
- [ ] Отримано BOT_TOKEN
- [ ] Оновлено `.env` файл з токеном

## 🤖 Налаштування бота в BotFather

### 1. Створення бота
```
/newbot
Назва: EventMate
Username: eventmate_helper_bot (або інший доступний)
```

### 2. Налаштування Menu Button
```
/mybots → ваш бот → Bot Settings → Menu Button
URL: http://localhost:3000
Text: 📅 Відкрити EventMate
```

### 3. Опціонально: Опис бота
```
/setdescription
Опис: 🎉 EventMate — твій особистий помічник для управління подіями! Створюй нагадування, відзначай дні народження та не пропускай важливі події.
```

### 4. Опціонально: Команди
```
/setcommands
start - Головне меню
myevents - Мої події
```

## 🔧 Налаштування .env

Відредагуйте файл `.env`:

```env
BOT_TOKEN=ваш_токен_тут
WEBAPP_URL=http://localhost:3000
PORT=3000
DATABASE_PATH=./data/events.db
```

## 🚀 Запуск

```bash
cd /c/Users/kazmi/eventmate-bot
npm start
```

Очікуваний вивід:
```
✅ EventMate бот запущено!
📁 Логи: ./logs/bot-2026-05-11.log
🌐 Сервер: http://localhost:3000
```

## 🧪 Тестування

1. Відкрийте бота в Telegram
2. Натисніть `/start`
3. Натисніть кнопку меню або "📅 Відкрити EventMate"
4. Перевірте що Mini App відкривається
5. Створіть тестову подію
6. Перевірте що подія з'явилася в списку

## 📱 Тестування з телефону (через ngrok)

Якщо хочете протестувати з реального телефону:

```bash
# Термінал 1
npm start

# Термінал 2
ngrok http 3000
```

Оновіть в BotFather Menu Button URL на ngrok URL (https://xxx.ngrok.io)

## 🌐 Деплой на Railway

### Підготовка
```bash
git init
git add .
git commit -m "Initial commit: EventMate bot"
```

### Створення репозиторію на GitHub
1. Створіть новий репозиторій на github.com
2. Виконайте:
```bash
git remote add origin https://github.com/YOUR_USERNAME/eventmate-bot.git
git push -u origin main
```

### Деплой
1. Зайдіть на railway.app
2. New Project → Deploy from GitHub repo
3. Виберіть eventmate-bot
4. Додайте змінні в Variables:
   - BOT_TOKEN=ваш_токен
   - WEBAPP_URL=https://your-app.up.railway.app
   - PORT=3000
   - DATABASE_PATH=./data/events.db
5. Generate Domain в Settings → Networking
6. Оновіть WEBAPP_URL на згенерований домен
7. Оновіть Menu Button URL в BotFather

## 🔔 Перевірка нагадувань

Нагадування відправляються щодня о 9:00.

Для швидкого тесту змініть в `src/bot.js`:
```javascript
// Замість '0 9 * * *'
cron.schedule('*/2 * * * *', async () => { // кожні 2 хвилини
```

Створіть подію на сьогодні або завтра і перевірте що нагадування приходить.

## 📊 Структура проекту

```
eventmate-bot/
├── src/
│   ├── bot.js          ✅ Створено
│   └── database.js     ✅ Створено
├── webapp/
│   ├── index.html      ✅ Створено
│   ├── style.css       ✅ Створено
│   └── app.js          ✅ Створено
├── data/               ✅ Створюється автоматично
├── logs/               ✅ Створюється автоматично
├── .env                ⚠️ Потрібно додати токен
├── package.json        ✅ Створено
├── railway.json        ✅ Створено
├── Procfile           ✅ Створено
├── README.md          ✅ Створено
├── SETUP.md           ✅ Створено
└── test-db.js         ✅ Створено
```

## ✅ Готово до використання!

Всі файли створено, база даних працює, залишилось тільки:
1. Створити бота в BotFather
2. Додати токен в .env
3. Запустити npm start
4. Протестувати

## 🆘 Якщо щось не працює

1. Перевірте логи: `logs/bot-YYYY-MM-DD.log`
2. Перевірте що порт 3000 вільний
3. Перевірте що токен правильний
4. Перезапустіть бота
5. Перевірте що URL в BotFather співпадає з WEBAPP_URL
