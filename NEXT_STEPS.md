# ✅ Наступні кроки для завершення міграції

## 1️⃣ Створіть таблиці в Supabase (ЗАРАЗ)

**Виконайте SQL скрипт:**

1. Відкрийте https://supabase.com/dashboard
2. Виберіть ваш проект
3. Ліва панель → **SQL Editor**
4. Натисніть **New Query**
5. Скопіюйте і вставте весь вміст з файлу `supabase-schema.sql`
6. Натисніть **Run** або **F5**

**Очікуваний результат:**
```
EventMate database schema created successfully!
```

## 2️⃣ Оновіть змінні в Railway

**Railway Dashboard:**

1. Відкрийте https://railway.app
2. Знайдіть проект `eventmate-bot`
3. Вкладка **Variables**

**Видаліть:**
```
DATABASE_PATH=./data/events.db
```

**Додайте:**
```
SUPABASE_URL=https://djmfqkswwwcbaxgutygb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_jRr48EwQaRsurF8TVqGLXg_rLwiaWBa
```

**Railway автоматично:**
- Виявить новий коміт на GitHub
- Перезапустить деплой
- Встановить нові залежності (@supabase/supabase-js)
- Запустить бота з Supabase

## 3️⃣ Перевірте логи Railway

**Deployments → View Logs:**

Ви маєте побачити:
```
🌐 HTTP сервер запущено на порту 3000
✅ EventMate бот запущено!
💾 База даних: Supabase
```

## 4️⃣ Тестування

1. Відкрийте бота в Telegram
2. `/start`
3. Відкрийте Mini App
4. Створіть тестову подію
5. Перевірте в Supabase → Table Editor → `events`

## 📊 Що відбувається зараз

- ✅ Код з Supabase на GitHub
- ⏳ Railway виявляє новий коміт
- ⏳ Railway перезапускає деплой
- ⏳ Чекаємо на створення таблиць в Supabase

## 🔗 Швидкі посилання

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Railway Dashboard:** https://railway.app
- **GitHub:** https://github.com/keesul/eventmate-bot

---

**Виконайте кроки 1 і 2, і бот запрацює з Supabase!** 🚀
