# 🚀 Швидкий деплой на Railway

## Статус проекту
✅ Git репозиторій ініціалізовано
✅ Коміт створено (872d458)
✅ Всі файли готові до деплою

## Крок 1: Створіть GitHub репозиторій

1. Зайдіть на https://github.com/new
2. Назва: `eventmate-bot`
3. Приватний або публічний (на ваш вибір)
4. **НЕ** додавайте README, .gitignore, license
5. Натисніть "Create repository"

## Крок 2: Підключіть локальний репозиторій

Скопіюйте команди з GitHub (замініть YOUR_USERNAME):

```bash
cd /c/Users/kazmi/eventmate-bot
git remote add origin https://github.com/YOUR_USERNAME/eventmate-bot.git
git branch -M main
git push -u origin main
```

## Крок 3: Деплой на Railway

1. Зайдіть на https://railway.app
2. Натисніть "Login with GitHub"
3. Натисніть "New Project"
4. Виберіть "Deploy from GitHub repo"
5. Виберіть `eventmate-bot`
6. Railway автоматично почне деплой

## Крок 4: Додайте змінні середовища

1. В Railway Dashboard відкрийте ваш проект
2. Перейдіть на вкладку "Variables"
3. Додайте змінні:

```
BOT_TOKEN=8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8
WEBAPP_URL=https://your-app.up.railway.app
PORT=3000
DATABASE_PATH=./data/events.db
```

**ВАЖЛИВО:** Спочатку додайте всі змінні КРІМ WEBAPP_URL

## Крок 5: Отримайте публічний URL

1. В Railway Dashboard → Settings
2. Прокрутіть до "Networking"
3. Натисніть "Generate Domain"
4. Скопіюйте згенерований URL (наприклад: `https://eventmate-bot-production.up.railway.app`)

## Крок 6: Оновіть WEBAPP_URL

1. Поверніться до Variables
2. Оновіть `WEBAPP_URL` на ваш Railway URL
3. Railway автоматично перезапустить бота

## Крок 7: Налаштуйте Menu Button в BotFather

1. Відкрийте [@BotFather](https://t.me/BotFather)
2. Відправте `/mybots`
3. Виберіть вашого бота
4. Натисніть `Bot Settings`
5. Натисніть `Menu Button`
6. Виберіть `Edit menu button URL`
7. Введіть ваш Railway URL: `https://your-app.up.railway.app`
8. Виберіть `Edit menu button text`
9. Введіть: `📅 Відкрити EventMate`

## Крок 8: Тестування

1. Відкрийте вашого бота в Telegram
2. Натисніть `/start`
3. Натисніть кнопку меню або inline кнопку "📅 Відкрити EventMate"
4. Mini App має відкритися з демо-подіями
5. Створіть тестову подію

## ✅ Готово!

Ваш бот тепер працює 24/7 на Railway з HTTPS URL!

## 🔍 Перевірка логів

В Railway Dashboard → Deployments → View Logs

Ви маєте побачити:
```
🌐 HTTP сервер запущено на порту 3000
✅ EventMate бот запущено!
```

## 🐛 Якщо щось не працює

1. Перевірте логи в Railway
2. Перевірте що всі змінні середовища додані
3. Перевірте що WEBAPP_URL співпадає з Railway URL
4. Перевірте що Menu Button URL в BotFather співпадає з Railway URL
5. Спробуйте перезапустити деплой в Railway

## 💡 Альтернатива: Vercel для Mini App

Якщо хочете розділити бота (Railway) та Mini App (Vercel):

1. Створіть `vercel.json`:
```json
{
  "version": 2,
  "builds": [{ "src": "webapp/**", "use": "@vercel/static" }],
  "routes": [{ "src": "/(.*)", "dest": "/webapp/$1" }]
}
```

2. Деплой webapp на Vercel:
```bash
cd webapp
vercel
```

3. Оновіть WEBAPP_URL на Vercel URL

---

**Проект готовий до деплою!** 🎉
