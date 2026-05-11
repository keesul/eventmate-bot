# 🗄️ Міграція на Supabase — Інструкція

## ✅ Що змінено

**Замінено:**
- ❌ SQLite (better-sqlite3) → ✅ Supabase (PostgreSQL)

**Переваги Supabase:**
- ✅ Хмарна база даних (не потрібно зберігати локально)
- ✅ Автоматичні бекапи
- ✅ Real-time підписки (можна додати в майбутньому)
- ✅ Row Level Security (RLS)
- ✅ Безкоштовний план (500 MB, 2GB bandwidth)

## 📋 Крок 1: Створення таблиць в Supabase

1. Зайдіть на https://supabase.com
2. Відкрийте ваш проект
3. Перейдіть в **SQL Editor** (ліва панель)
4. Натисніть **New Query**
5. Скопіюйте весь вміст файлу `supabase-schema.sql`
6. Вставте в SQL Editor
7. Натисніть **Run** (або F5)

Ви маєте побачити:
```
EventMate database schema created successfully!
```

## 📋 Крок 2: Перевірка таблиць

1. Перейдіть в **Table Editor** (ліва панель)
2. Ви маєте побачити дві таблиці:
   - `users` (4 колонки)
   - `events` (7 колонок)

## 📋 Крок 3: Оновлення Railway змінних

1. Зайдіть на https://railway.app
2. Відкрийте проект `eventmate-bot`
3. Перейдіть на вкладку **Variables**
4. **Видаліть** змінну:
   ```
   DATABASE_PATH
   ```
5. **Додайте** нові змінні:
   ```
   SUPABASE_URL=https://djmfqkswwwcbaxgutygb.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_jRr48EwQaRsurF8TVqGLXg_rLwiaWBa
   ```

Railway автоматично перезапустить бота.

## 📋 Крок 4: Перевірка логів

1. В Railway Dashboard → **Deployments** → **View Logs**
2. Ви маєте побачити:
   ```
   🌐 HTTP сервер запущено на порту 3000
   ✅ EventMate бот запущено!
   💾 База даних: Supabase
   ```

## 🧪 Тестування

1. Відкрийте бота в Telegram
2. Натисніть `/start`
3. Відкрийте Mini App
4. Створіть тестову подію
5. Перевірте в Supabase Table Editor → `events` → ви маєте побачити нову подію

## 🔍 Перевірка даних в Supabase

**Table Editor:**
1. Відкрийте `users` таблицю
2. Ви маєте побачити вашого користувача з telegram_id

**SQL Editor:**
```sql
-- Перевірити всіх користувачів
SELECT * FROM users;

-- Перевірити всі події
SELECT * FROM events;

-- Перевірити події конкретного користувача
SELECT * FROM events WHERE user_id = YOUR_TELEGRAM_ID;

-- Перевірити майбутні події
SELECT * FROM get_upcoming_events(CURRENT_DATE);
```

## 📊 Структура таблиць

### users
```
id            BIGSERIAL PRIMARY KEY
telegram_id   BIGINT UNIQUE NOT NULL
username      TEXT
first_name    TEXT
created_at    TIMESTAMP
```

### events
```
id            BIGSERIAL PRIMARY KEY
user_id       BIGINT (FK → users.telegram_id)
title         TEXT NOT NULL
type          TEXT ('birthday', 'reminder', 'event')
event_date    DATE NOT NULL
event_time    TIME
notes         TEXT
created_at    TIMESTAMP
```

## 🔒 Безпека (RLS)

Row Level Security увімкнено для обох таблиць.

**Політики:**
- ✅ Користувачі можуть читати свої дані
- ✅ Користувачі можуть створювати свої дані
- ✅ Користувачі можуть оновлювати свої дані
- ✅ Користувачі можуть видаляти свої події

## 🚀 Переваги міграції

**До (SQLite):**
- ❌ Локальна база даних
- ❌ Втрата даних при перезапуску Railway
- ❌ Немає бекапів
- ❌ Складно масштабувати

**Після (Supabase):**
- ✅ Хмарна база даних
- ✅ Дані зберігаються назавжди
- ✅ Автоматичні бекапи
- ✅ Легко масштабувати
- ✅ Real-time можливості
- ✅ Безкоштовний план

## 📝 Що змінилось в коді

**database.js:**
- Замінено `better-sqlite3` на `@supabase/supabase-js`
- Всі запити тепер async/await
- Використання Supabase client

**bot.js:**
- Всі функції тепер async
- Додано try/catch для обробки помилок
- Оновлено логування

**.env:**
- Видалено `DATABASE_PATH`
- Додано `SUPABASE_URL` та `SUPABASE_ANON_KEY`

## ✅ Готово!

Після виконання всіх кроків ваш бот працюватиме з Supabase! 🎉

**Перевірте:**
1. Бот запустився без помилок
2. Події створюються в Supabase
3. Нагадування працюють

---

**Дата міграції:** 2026-05-11  
**База даних:** Supabase PostgreSQL  
**Статус:** ✅ Готово до використання
