// Telegram Web App API
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// State
let events = [];
let currentFilter = 'all';
let editingEventId = null;
let selectedType = 'birthday';
let userSettings = { language: 'uk', theme: 'light' };

// DOM Elements
const eventsList = document.getElementById('eventsList');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const eventForm = document.getElementById('eventForm');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const tabs = document.querySelectorAll('.tab');
const typeButtons = document.querySelectorAll('.type-btn');

// Get user ID and timezone from Telegram
const userId = tg.initDataUnsafe?.user?.id || 123456;
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const timezoneOffset = new Date().getTimezoneOffset(); // minutes

console.log('User timezone:', userTimezone);
console.log('Timezone offset:', timezoneOffset, 'minutes');

// API Base URL - same domain as Mini App
const API_BASE_URL = '';

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createElement(tag, className, content) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (content) el.textContent = content;
  return el;
}

// Initialize
init();

async function init() {
  // Load user settings
  await loadSettings();

  // Apply theme
  applyTheme();

  // Update user timezone
  await updateUserTimezone();

  await loadEvents();
  setupEventListeners();
  renderEvents();

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').setAttribute('min', today);
}

async function updateUserTimezone() {
  try {
    await fetch(`${API_BASE_URL}/api/update-timezone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        timezone: userTimezone
      })
    });
    console.log('Timezone updated:', userTimezone);
  } catch (err) {
    console.error('Error updating timezone:', err);
  }
}

function setupEventListeners() {
  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.type;
      renderEvents();
      tg.HapticFeedback.impactOccurred('light');
    });
  });

  // Type buttons
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type;
      toggleBirthYearField();
      tg.HapticFeedback.impactOccurred('light');
    });
  });

  // Add button
  addBtn.addEventListener('click', openAddModal);

  // Close modal
  closeModal.addEventListener('click', closeModalHandler);
  cancelBtn.addEventListener('click', closeModalHandler);

  // Form submit
  eventForm.addEventListener('submit', handleSubmit);

  // Delete button
  deleteBtn.addEventListener('click', handleDelete);

  // Close modal on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModalHandler();
    }
  });
}

function toggleBirthYearField() {
  const birthYearGroup = document.getElementById('birthYearGroup');
  if (birthYearGroup) {
    birthYearGroup.style.display = selectedType === 'birthday' ? 'block' : 'none';
  }
}

async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events/${userId}`);
    const data = await response.json();
    if (data.success) {
      events = data.events || [];
    }
  } catch (err) {
    console.error('Error loading events:', err);
    events = [];
  }
}

function renderEvents() {
  const filteredEvents = currentFilter === 'all'
    ? events
    : events.filter(e => e.type === currentFilter);

  if (filteredEvents.length === 0) {
    renderEmptyState();
    return;
  }

  // Sort by date
  filteredEvents.sort((a, b) => {
    const dateA = new Date(a.event_date + (a.event_time ? 'T' + a.event_time : ''));
    const dateB = new Date(b.event_date + (b.event_time ? 'T' + b.event_time : ''));
    return dateA - dateB;
  });

  // Clear list
  eventsList.innerHTML = '';

  // Render events
  filteredEvents.forEach(event => {
    const card = createEventCard(event);
    eventsList.appendChild(card);
  });
}

function renderEmptyState() {
  const emptyState = createElement('div', 'empty-state');

  const icon = createElement('div', 'empty-state-icon', '📭');
  const text = createElement('div', 'empty-state-text', 'Немає подій');
  const hint = createElement('div', 'empty-state-hint', 'Натисніть + щоб додати нову подію');

  emptyState.appendChild(icon);
  emptyState.appendChild(text);
  emptyState.appendChild(hint);

  eventsList.innerHTML = '';
  eventsList.appendChild(emptyState);
}

function createEventCard(event) {
  const card = createElement('div', 'event-card');
  card.dataset.id = event.id;

  const header = createElement('div', 'event-header');

  const icon = createElement('div', 'event-icon', getEventEmoji(event.type));

  const info = createElement('div', 'event-info');

  const title = createElement('div', 'event-title');
  title.textContent = event.title;

  const dateDiv = createElement('div', 'event-date');
  const dateText = document.createTextNode(`📅 ${formatDate(event.event_date)}`);
  dateDiv.appendChild(dateText);

  if (event.event_time) {
    const timeText = document.createTextNode(` ⏰ ${event.event_time}`);
    dateDiv.appendChild(timeText);
  }

  const countdown = createCountdown(event.event_date);
  if (countdown) {
    dateDiv.appendChild(document.createTextNode(' '));
    dateDiv.appendChild(countdown);
  }

  info.appendChild(title);
  info.appendChild(dateDiv);

  header.appendChild(icon);
  header.appendChild(info);

  card.appendChild(header);

  if (event.notes) {
    const notes = createElement('div', 'event-notes');
    notes.textContent = `📝 ${event.notes}`;
    card.appendChild(notes);
  }

  card.addEventListener('click', () => {
    openEditModal(event.id);
    tg.HapticFeedback.impactOccurred('medium');
  });

  return card;
}

function getEventEmoji(type) {
  const emojis = {
    birthday: '🎂',
    reminder: '⏰',
    event: '🎊'
  };
  return emojis[type] || '📅';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
                  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function createCountdown(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let countdown;

  if (diffDays === 0) {
    countdown = createElement('span', 'event-countdown countdown-today', 'Сьогодні 🎉');
  } else if (diffDays === 1) {
    countdown = createElement('span', 'event-countdown countdown-tomorrow', 'Завтра');
  } else if (diffDays > 1 && diffDays <= 7) {
    countdown = createElement('span', 'event-countdown countdown-soon', `За ${diffDays} дн.`);
  } else if (diffDays > 7) {
    countdown = createElement('span', 'event-countdown countdown-future', `За ${diffDays} дн.`);
  } else {
    countdown = createElement('span', 'event-countdown countdown-future', 'Минуло');
  }

  return countdown;
}

function openAddModal() {
  editingEventId = null;
  modalTitle.textContent = 'Нова подія';
  eventForm.reset();
  deleteBtn.style.display = 'none';

  // Set default type
  typeButtons.forEach(btn => btn.classList.remove('active'));
  typeButtons[0].classList.add('active');
  selectedType = 'birthday';

  // Set today as default date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;

  // Set default reminder settings
  document.getElementById('reminderDays').value = '1';
  document.getElementById('reminderTime').value = '09:00';

  // Show/hide birth year field
  toggleBirthYearField();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  tg.HapticFeedback.impactOccurred('medium');
}

function openEditModal(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  editingEventId = eventId;
  modalTitle.textContent = 'Редагувати подію';

  document.getElementById('title').value = event.title;
  document.getElementById('date').value = event.event_date;
  document.getElementById('time').value = event.event_time || '';
  document.getElementById('notes').value = event.notes || '';
  document.getElementById('reminderDays').value = event.reminder_days || 1;
  document.getElementById('reminderTime').value = event.reminder_time || '09:00';
  document.getElementById('birthYear').value = event.birth_year || '';

  // Set type
  typeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === event.type);
  });
  selectedType = event.type;

  // Show/hide birth year field
  toggleBirthYearField();

  deleteBtn.style.display = 'block';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  eventForm.reset();
  editingEventId = null;
  tg.HapticFeedback.impactOccurred('light');
}

async function handleSubmit(e) {
  e.preventDefault();

  const formData = {
    userId: userId,
    title: document.getElementById('title').value.trim(),
    type: selectedType,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    notes: document.getElementById('notes').value.trim(),
    reminderDays: parseInt(document.getElementById('reminderDays').value) || 1,
    reminderTime: document.getElementById('reminderTime').value || '09:00',
    birthYear: selectedType === 'birthday' ? (parseInt(document.getElementById('birthYear').value) || null) : null
  };

  if (!formData.title || !formData.date) {
    tg.showAlert('Будь ласка, заповніть обов\'язкові поля');
    return;
  }

  tg.HapticFeedback.notificationOccurred('success');

  try {
    if (editingEventId) {
      // Update existing event via API
      const response = await fetch(`${API_BASE_URL}/api/events/${editingEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        tg.showAlert('✅ Подію оновлено!');
        await loadEvents();
        renderEvents();
      } else {
        tg.showAlert('❌ Помилка оновлення події');
      }
    } else {
      // Create new event via API
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        tg.showAlert('✅ Подію створено!');
        await loadEvents();
        renderEvents();
      } else {
        tg.showAlert('❌ Помилка створення події');
      }
    }
  } catch (err) {
    console.error('Error saving event:', err);
    tg.showAlert('❌ Помилка з\'єднання з сервером');
  }

  closeModalHandler();
}

async function handleDelete() {
  if (!editingEventId) return;

  tg.showConfirm('Ви впевнені, що хочете видалити цю подію?', async (confirmed) => {
    if (confirmed) {
      tg.HapticFeedback.notificationOccurred('warning');

      try {
        const response = await fetch(`${API_BASE_URL}/api/events/${editingEventId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId })
        });

        const result = await response.json();

        if (result.success) {
          tg.showAlert('🗑 Подію видалено');
          await loadEvents();
          renderEvents();
        } else {
          tg.showAlert('❌ Помилка видалення події');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        tg.showAlert('❌ Помилка з\'єднання з сервером');
      }

      closeModalHandler();
    }
  });
}

// Handle back button
tg.BackButton.onClick(() => {
  if (modal.classList.contains('active')) {
    closeModalHandler();
  } else {
    tg.close();
  }
});

// Show back button when modal is open
const observer = new MutationObserver(() => {
  if (modal.classList.contains('active')) {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
});

observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

// Settings and theme functions
async function loadSettings() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings/${userId}`);
    const data = await response.json();
    if (data.success) {
      userSettings = data.settings;
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

function applyTheme() {
  document.body.setAttribute('data-theme', userSettings.theme);
  tg.setHeaderColor(userSettings.theme === 'dark' ? '#1a1a1a' : '#ffffff');
  tg.setBackgroundColor(userSettings.theme === 'dark' ? '#1a1a1a' : '#ffffff');
}

async function toggleTheme() {
  const newTheme = userSettings.theme === 'light' ? 'dark' : 'light';

  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, theme: newTheme })
    });

    const data = await response.json();
    if (data.success) {
      userSettings.theme = newTheme;
      applyTheme();
      tg.HapticFeedback.impactOccurred('medium');
    }
  } catch (err) {
    console.error('Error updating theme:', err);
  }
}

async function toggleLanguage() {
  const newLang = userSettings.language === 'uk' ? 'en' : 'uk';

  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, language: newLang })
    });

    const data = await response.json();
    if (data.success) {
      userSettings.language = newLang;
      tg.HapticFeedback.impactOccurred('medium');
      tg.showAlert(newLang === 'uk' ? 'Мова змінена на українську' : 'Language changed to English');
      // Reload to apply translations
      setTimeout(() => location.reload(), 1000);
    }
  } catch (err) {
    console.error('Error updating language:', err);
  }
}

async function showStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats/${userId}`);
    const data = await response.json();

    if (data.success) {
      const stats = data.stats;
      let message = userSettings.language === 'uk'
        ? `📊 Статистика\n\n` +
          `Всього подій: ${stats.total}\n` +
          `🎂 Дні народження: ${stats.byType.birthday}\n` +
          `⏰ Нагадування: ${stats.byType.reminder}\n` +
          `🎊 Події: ${stats.byType.event}\n\n` +
          `Найближчі:\n` +
          `Сьогодні: ${stats.upcoming.today}\n` +
          `Цього тижня: ${stats.upcoming.thisWeek}\n` +
          `Цього місяця: ${stats.upcoming.thisMonth}`
        : `📊 Statistics\n\n` +
          `Total events: ${stats.total}\n` +
          `🎂 Birthdays: ${stats.byType.birthday}\n` +
          `⏰ Reminders: ${stats.byType.reminder}\n` +
          `🎊 Events: ${stats.byType.event}\n\n` +
          `Upcoming:\n` +
          `Today: ${stats.upcoming.today}\n` +
          `This week: ${stats.upcoming.thisWeek}\n` +
          `This month: ${stats.upcoming.thisMonth}`;

      if (stats.nextEvent) {
        message += userSettings.language === 'uk'
          ? `\n\n⏭️ Наступна подія:\n${stats.nextEvent.title}\n📅 Через ${stats.nextEvent.daysUntil} дн.`
          : `\n\n⏭️ Next event:\n${stats.nextEvent.title}\n📅 In ${stats.nextEvent.daysUntil} days`;
      }

      tg.showAlert(message);
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function exportEvents() {
  const exportUrl = `${API_BASE_URL}/api/export/${userId}`;
  window.open(exportUrl, '_blank');
  tg.showAlert(userSettings.language === 'uk'
    ? '📥 Завантаження файлу .ics...'
    : '📥 Downloading .ics file...');
}

// Expose functions to window for button clicks
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.showStats = showStats;
window.exportEvents = exportEvents;

