# ✅ GitHub репозиторій створено!

## 📦 Репозиторій
https://github.com/keesul/eventmate-bot

## 🚀 Наступний крок: Деплой на Railway

### Автоматичний деплой (рекомендовано)

1. Відкрийте https://railway.app
2. Натисніть "Login with GitHub"
3. Натисніть "New Project"
4. Виберіть "Deploy from GitHub repo"
5. Знайдіть та виберіть `keesul/eventmate-bot`
6. Railway автоматично:
   - Виявить `railway.json` та `Procfile`
   - Встановить залежності
   - Запустить бота

### Додайте змінні середовища

Після створення проекту:

1. Перейдіть на вкладку **Variables**
2. Додайте змінні **ПО ЧЕРЗІ**:

**Крок 1 - Додайте ці 3 змінні:**
```
BOT_TOKEN=8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8
PORT=3000
DATABASE_PATH=./data/events.db
```

**Крок 2 - Згенеруйте домен:**
1. Перейдіть в **Settings** → **Networking**
2. Натисніть **Generate Domain**
3. Скопіюйте URL (наприклад: `eventmate-bot-production.up.railway.app`)

**Крок 3 - Додайте WEBAPP_URL:**
```
WEBAPP_URL=https://eventmate-bot-production.up.railway.app
```
(замініть на ваш згенерований домен)

Railway автоматично перезапустить бота.

### Перевірте логи

В Railway Dashboard → **Deployments** → **View Logs**

Ви маєте побачити:
```
🌐 HTTP сервер запущено на порту 3000
✅ EventMate бот запущено!
```

### Налаштуйте BotFather

1. Відкрийте [@BotFather](https://t.me/BotFather)
2. `/mybots` → ваш бот → `Bot Settings` → `Menu Button`
3. `Edit menu button URL` → введіть ваш Railway URL
4. `Edit menu button text` → `📅 Відкрити EventMate`

### Тестування

1. Відкрийте бота в Telegram
2. Натисніть `/start`
3. Натисніть кнопку меню
4. Mini App має відкритися!

---

## 🎯 Швидкі посилання

- **GitHub:** https://github.com/keesul/eventmate-bot
- **Railway:** https://railway.app (після логіну знайдіть проект)
- **BotFather:** https://t.me/BotFather

## 📝 Токен бота

```
8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8
```

## ✅ Готово!

Після деплою на Railway ваш бот працюватиме 24/7 з HTTPS URL!
