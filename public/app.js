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

// Translations
const translations = {
  uk: {
    headerSubtitle: 'Ваші події завжди під контролем',
    tabAll: 'Всі',
    tabBirthdays: '🎂 Дні народження',
    tabReminders: '⏰ Нагадування',
    tabEvents: '🎊 Події',
    modalTitleNew: 'Нова подія',
    modalTitleEdit: 'Редагувати подію',
    typeLabel: 'Тип події',
    typeBirthday: 'День народження',
    typeReminder: 'Нагадування',
    typeEvent: 'Подія',
    titleLabel: 'Назва події *',
    titlePlaceholder: 'Наприклад: День народження Марії',
    dateLabel: 'Дата *',
    timeLabel: 'Час (необов\'язково)',
    birthYearLabel: 'Рік народження (необов\'язково)',
    birthYearPlaceholder: 'Наприклад: 1990',
    birthYearHint: 'Для розрахунку віку в нагадуваннях',
    reminderDaysLabel: 'Нагадати за',
    reminderDays0: 'В день події',
    reminderDays1: 'За 1 день',
    reminderDays2: 'За 2 дні',
    reminderDays3: 'За 3 дні',
    reminderDays7: 'За тиждень',
    reminderTimeLabel: 'Час нагадування',
    reminderTimeHint: 'О котрій годині відправити нагадування',
    notesLabel: 'Нотатки (необов\'язково)',
    notesPlaceholder: 'Додаткова інформація про подію...',
    btnSave: 'Зберегти',
    btnCancel: 'Скасувати',
    btnDelete: 'Видалити',
    emptyStateText: 'Немає подій',
    emptyStateHint: 'Натисніть + щоб додати нову подію',
    calendarTitle: 'Виберіть дату',
    timePickerTitle: 'Виберіть час',
    confirmBtn: 'Підтвердити',
    cancelBtn: 'Скасувати'
  },
  en: {
    headerSubtitle: 'Your events always under control',
    tabAll: 'All',
    tabBirthdays: '🎂 Birthdays',
    tabReminders: '⏰ Reminders',
    tabEvents: '🎊 Events',
    modalTitleNew: 'New Event',
    modalTitleEdit: 'Edit Event',
    typeLabel: 'Event Type',
    typeBirthday: 'Birthday',
    typeReminder: 'Reminder',
    typeEvent: 'Event',
    titleLabel: 'Event Title *',
    titlePlaceholder: 'For example: Maria\'s Birthday',
    dateLabel: 'Date *',
    timeLabel: 'Time (optional)',
    birthYearLabel: 'Birth Year (optional)',
    birthYearPlaceholder: 'For example: 1990',
    birthYearHint: 'For age calculation in reminders',
    reminderDaysLabel: 'Remind',
    reminderDays0: 'On event day',
    reminderDays1: '1 day before',
    reminderDays2: '2 days before',
    reminderDays3: '3 days before',
    reminderDays7: 'A week before',
    reminderTimeLabel: 'Reminder Time',
    reminderTimeHint: 'What time to send the reminder',
    notesLabel: 'Notes (optional)',
    notesPlaceholder: 'Additional information about the event...',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    btnDelete: 'Delete',
    emptyStateText: 'No events',
    emptyStateHint: 'Press + to add a new event',
    calendarTitle: 'Select date',
    timePickerTitle: 'Select time',
    confirmBtn: 'Confirm',
    cancelBtn: 'Cancel'
  }
};

function t(key) {
  return translations[userSettings.language]?.[key] || translations['uk'][key];
}

// Expose t function globally for custom inputs
window.t = t;

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

  // Apply language to UI
  updateUILanguage();

  // Update user timezone
  await updateUserTimezone();

  await loadEvents();
  setupEventListeners();
  renderEvents();

  // Initialize custom inputs
  if (window.initCustomInputs) {
    window.initCustomInputs();
  }

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
  const text = createElement('div', 'empty-state-text', t('emptyStateText'));
  const hint = createElement('div', 'empty-state-hint', t('emptyStateHint'));

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

  const countdown = createCountdown(event.event_date, event.type, event.is_recurring);
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

function createCountdown(dateStr, eventType, isRecurring) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);

  let diffDays;

  // For birthdays (recurring), calculate days until next occurrence
  if (eventType === 'birthday' || isRecurring) {
    const eventMonth = eventDate.getMonth();
    const eventDay = eventDate.getDate();
    const currentYear = today.getFullYear();

    // Create date for this year's birthday
    const thisYearBirthday = new Date(currentYear, eventMonth, eventDay);
    thisYearBirthday.setHours(0, 0, 0, 0);

    // If birthday already passed this year, use next year
    if (thisYearBirthday < today) {
      const nextYearBirthday = new Date(currentYear + 1, eventMonth, eventDay);
      nextYearBirthday.setHours(0, 0, 0, 0);
      diffDays = Math.ceil((nextYearBirthday - today) / (1000 * 60 * 60 * 24));
    } else {
      diffDays = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
    }
  } else {
    const diffTime = eventDate - today;
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  let countdown;

  if (diffDays === 0) {
    countdown = createElement('span', 'event-countdown countdown-today', 'Сьогодні 🎉');
  } else if (diffDays === 1) {
    countdown = createElement('span', 'event-countdown countdown-tomorrow', 'Завтра');
  } else if (diffDays > 1 && diffDays <= 7) {
    countdown = createElement('span', 'event-countdown countdown-soon', `За ${diffDays} дн.`);
  } else if (diffDays > 7) {
    countdown = createElement('span', 'event-countdown countdown-future', `За ${diffDays} дн.`);
  } else if (diffDays < 0 && (eventType !== 'birthday' && !isRecurring)) {
    // Only show "Минуло" for non-recurring events
    countdown = createElement('span', 'event-countdown countdown-past', 'Минуло');
  } else {
    countdown = null;
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

  // Re-initialize custom inputs for modal
  if (window.initCustomInputs) {
    window.initCustomInputs();
  }
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

  // Re-initialize custom inputs for modal
  if (window.initCustomInputs) {
    window.initCustomInputs();
  }
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
    birthYear: selectedType === 'birthday' ? (parseInt(document.getElementById('birthYear').value) || null) : null,
    isRecurring: selectedType === 'birthday' // Birthdays repeat every year
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
  updateThemeIcon();
}

function updateThemeIcon() {
  // Theme icons are handled by CSS based on data-theme attribute
}

function updateLanguageUI() {
  const langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(option => {
    if (option.dataset.lang === userSettings.language) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
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
      updateUILanguage();
      tg.HapticFeedback.impactOccurred('medium');
    } else {
      console.error('Failed to update language:', data.error);
    }
  } catch (err) {
    console.error('Error updating language:', err);
  }
}

function updateUILanguage() {
  // Update header
  document.querySelector('.header-subtitle').textContent = t('headerSubtitle');

  // Update tabs
  const tabsData = [
    { type: 'all', key: 'tabAll' },
    { type: 'birthday', key: 'tabBirthdays' },
    { type: 'reminder', key: 'tabReminders' },
    { type: 'event', key: 'tabEvents' }
  ];

  tabs.forEach((tab, i) => {
    if (tabsData[i]) {
      tab.textContent = t(tabsData[i].key);
    }
  });

  // Update form labels
  const labels = {
    'typeLabel': document.querySelector('label[for="title"]')?.previousElementSibling?.previousElementSibling,
    'titleLabel': document.querySelector('label[for="title"]'),
    'dateLabel': document.querySelector('label[for="date"]'),
    'timeLabel': document.querySelector('label[for="time"]'),
    'birthYearLabel': document.querySelector('label[for="birthYear"]'),
    'reminderDaysLabel': document.querySelector('label[for="reminderDays"]'),
    'reminderTimeLabel': document.querySelector('label[for="reminderTime"]'),
    'notesLabel': document.querySelector('label[for="notes"]')
  };

  Object.keys(labels).forEach(key => {
    if (labels[key]) {
      labels[key].textContent = t(key);
    }
  });

  // Update placeholders
  const titleInput = document.getElementById('title');
  if (titleInput) titleInput.placeholder = t('titlePlaceholder');

  const birthYearInput = document.getElementById('birthYear');
  if (birthYearInput) birthYearInput.placeholder = t('birthYearPlaceholder');

  const notesInput = document.getElementById('notes');
  if (notesInput) notesInput.placeholder = t('notesPlaceholder');

  // Update type buttons
  const typeBtns = document.querySelectorAll('.type-btn');
  typeBtns.forEach(btn => {
    const type = btn.dataset.type;
    const span = btn.querySelector('span:last-child');
    if (span) {
      if (type === 'birthday') span.textContent = t('typeBirthday');
      if (type === 'reminder') span.textContent = t('typeReminder');
      if (type === 'event') span.textContent = t('typeEvent');
    }
  });

  // Update select options
  const reminderDaysSelect = document.getElementById('reminderDays');
  if (reminderDaysSelect) {
    reminderDaysSelect.options[0].text = t('reminderDays0');
    reminderDaysSelect.options[1].text = t('reminderDays1');
    reminderDaysSelect.options[2].text = t('reminderDays2');
    reminderDaysSelect.options[3].text = t('reminderDays3');
    reminderDaysSelect.options[4].text = t('reminderDays7');
  }

  // Update buttons
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.querySelector('span').textContent = t('btnSave');

  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) cancelBtn.querySelector('span').textContent = t('btnCancel');

  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) deleteBtn.querySelector('span').textContent = t('btnDelete');

  // Update modal if open
  if (modal.classList.contains('active')) {
    if (editingEventId) {
      modalTitle.textContent = t('modalTitleEdit');
    } else {
      modalTitle.textContent = t('modalTitleNew');
    }
  }

  // Update language toggle UI
  updateLanguageUI();

  // Re-render events to update empty state text
  renderEvents();
}

// Remove stats and export functions
// Expose functions to window for button clicks
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;

