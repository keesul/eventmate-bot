# ✅ EventMate Bot — Готово до запуску!

## 🎯 Ваш Railway URL
```
https://web-production-70677.up.railway.app
```

## 📋 Фінальні кроки

### 1. Перевірте змінні в Railway

Зайдіть на https://railway.app → ваш проект → **Variables**

Переконайтеся що є всі змінні:
```
BOT_TOKEN=8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8
WEBAPP_URL=https://web-production-70677.up.railway.app
PORT=3000
DATABASE_PATH=./data/events.db
```

### 2. Перевірте логи

Railway Dashboard → **Deployments** → **View Logs**

Ви маєте побачити:
```
🌐 HTTP сервер запущено на порту 3000
✅ EventMate бот запущено!
📁 Логи: ./logs/bot-2026-05-11.log
🌐 Сервер: http://localhost:3000
```

### 3. Налаштуйте BotFather

1. Відкрийте [@BotFather](https://t.me/BotFather) в Telegram
2. Відправте `/mybots`
3. Виберіть вашого бота
4. Натисніть **Bot Settings**
5. Натисніть **Menu Button**
6. Виберіть **Edit menu button URL**
7. Введіть:
   ```
   https://web-production-70677.up.railway.app
   ```
8. Виберіть **Edit menu button text**
9. Введіть: `📅 Відкрити EventMate`

### 4. Тестування

1. Знайдіть вашого бота в Telegram
2. Натисніть `/start`
3. Натисніть кнопку меню (📅 Відкрити EventMate)
4. Mini App має відкритися з демо-подіями
5. Створіть тестову подію
6. Перевірте що подія зберігається

### 5. Перевірте нагадування

Нагадування відправляються щодня о 9:00 ранку.

Для швидкого тесту:
1. Створіть подію на сьогодні або завтра
2. Зачекайте до 9:00 наступного дня
3. Ви отримаєте нагадування в Telegram

## 🔗 Посилання

- **GitHub:** https://github.com/keesul/eventmate-bot
- **Railway:** https://railway.app
- **Railway URL:** https://web-production-70677.up.railway.app
- **BotFather:** https://t.me/BotFather

## 🎯 Токен бота

```
8580673971:AAEkJYiGUf5lCniw6bUoN5tEro2x8MxU5E8
```

## ✅ Готово!

Ваш бот тепер працює 24/7 на Railway з HTTPS URL!

## 🐛 Якщо щось не працює

1. **Бот не відповідає:**
   - Перевірте логи в Railway
   - Перевірте що BOT_TOKEN правильний
   - Перезапустіть деплой в Railway

2. **Mini App не відкривається:**
   - Перевірте що WEBAPP_URL в Railway співпадає з доменом
   - Перевірте що Menu Button URL в BotFather правильний
   - Перевірте що URL починається з `https://`

3. **Події не зберігаються:**
   - Перевірте логи в Railway
   - Перевірте що DATABASE_PATH встановлено
   - Перевірте що директорія `data/` створюється

4. **Нагадування не приходять:**
   - Перевірте що бот працює (логи в Railway)
   - Перевірте що події створені на правильну дату
   - Нагадування відправляються о 9:00 за вашим часовим поясом

## 📱 Команди бота

- `/start` — Головне меню
- `/myevents` — Показати всі події
- Inline кнопки:
  - 📅 Відкрити EventMate
  - 📋 Мої події
  - ℹ️ Допомога

---

**Проект готовий до використання!** 🎉

Відкрийте бота в Telegram і почніть додавати події!
