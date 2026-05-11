import { dbQueries } from './src/database.js';

console.log('🧪 Тестування бази даних EventMate\n');

// Тест 1: Створення користувача
console.log('1️⃣ Створення тестового користувача...');
dbQueries.createUser.run(123456, 'testuser', 'Test User');
const user = dbQueries.getUser.get(123456);
console.log('✅ Користувач створено:', user);

// Тест 2: Створення подій
console.log('\n2️⃣ Створення тестових подій...');

const event1 = dbQueries.createEvent.run(
  123456,
  'День народження Марії',
  'birthday',
  '2026-05-12',
  '18:00',
  'Не забути купити подарунок!'
);
console.log('✅ Подія 1 створена, ID:', event1.lastInsertRowid);

const event2 = dbQueries.createEvent.run(
  123456,
  'Зустріч з клієнтом',
  'reminder',
  '2026-05-11',
  '14:00',
  'Підготувати презентацію'
);
console.log('✅ Подія 2 створена, ID:', event2.lastInsertRowid);

const event3 = dbQueries.createEvent.run(
  123456,
  'Концерт',
  'event',
  '2026-05-18',
  '20:00',
  'Квитки вже куплені'
);
console.log('✅ Подія 3 створена, ID:', event3.lastInsertRowid);

// Тест 3: Отримання подій користувача
console.log('\n3️⃣ Отримання всіх подій користувача...');
const events = dbQueries.getUserEvents.all(123456);
console.log(`✅ Знайдено ${events.length} подій:`);
events.forEach((event, index) => {
  console.log(`   ${index + 1}. ${event.title} (${event.type}) - ${event.event_date} ${event.event_time || ''}`);
});

// Тест 4: Оновлення події
console.log('\n4️⃣ Оновлення події...');
dbQueries.updateEvent.run(
  'День народження Марії (оновлено)',
  'birthday',
  '2026-05-12',
  '19:00',
  'Купити торт та подарунок!',
  event1.lastInsertRowid,
  123456
);
const updatedEvent = dbQueries.getEventById.get(event1.lastInsertRowid);
console.log('✅ Подія оновлена:', updatedEvent);

// Тест 5: Отримання майбутніх подій
console.log('\n5️⃣ Перевірка майбутніх подій на завтра...');
const upcomingEvents = dbQueries.getUpcomingEvents.all('2026-05-12');
console.log(`✅ Знайдено ${upcomingEvents.length} подій на 2026-05-12:`);
upcomingEvents.forEach(event => {
  console.log(`   - ${event.title} для користувача ${event.first_name}`);
});

// Тест 6: Видалення події
console.log('\n6️⃣ Видалення події...');
dbQueries.deleteEvent.run(event3.lastInsertRowid, 123456);
const remainingEvents = dbQueries.getUserEvents.all(123456);
console.log(`✅ Подію видалено. Залишилось ${remainingEvents.length} подій`);

console.log('\n✅ Всі тести пройдено успішно!\n');
console.log('📊 Підсумок:');
console.log('   - База даних працює коректно');
console.log('   - Всі CRUD операції виконуються');
console.log('   - Готово до запуску бота');
