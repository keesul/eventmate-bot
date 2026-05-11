# 🚂 Оновлення Railway Variables

## Крок 1: Відкрийте Railway Dashboard

1. Перейдіть на https://railway.app
2. Знайдіть проект **eventmate-bot**
3. Натисніть на проект

## Крок 2: Перейдіть у Variables

1. Зверху знайдіть вкладку **Variables** (або **Settings** → **Variables**)
2. Ви побачите список змінних оточення

## Крок 3: Видаліть стару змінну

Знайдіть і **видаліть**:
```
DATABASE_PATH=./data/events.db
```

Натисніть на іконку кошика (🗑️) або кнопку Delete біля цієї змінної.

## Крок 4: Додайте нові змінні

Натисніть **"+ New Variable"** і додайте:

**Змінна 1:**
```
SUPABASE_URL
```
**Значення:**
```
https://djmfqkswwwcbaxgutygb.supabase.co
```

**Змінна 2:**
```
SUPABASE_ANON_KEY
```
**Значення:**
```
sb_publishable_jRr48EwQaRsurF8TVqGLXg_rLwiaWBa
```

## Крок 5: Збережіть зміни

Railway автоматично:
- Виявить зміни
- Перезапустить деплой
- Встановить `@supabase/supabase-js`
- Запустить бота з Supabase

## Крок 6: Перевірте логи

1. Перейдіть у **Deployments**
2. Натисніть на останній деплой
3. Відкрийте **View Logs**

Ви маєте побачити:
```
🌐 HTTP сервер запущено на порту 3000
✅ EventMate бот запущено!
💾 База даних: Supabase
```

---

**Після цього бот працюватиме з Supabase!** 🎉
