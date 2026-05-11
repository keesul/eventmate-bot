// Telegram Web App API
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// State
let events = [];
let currentFilter = 'all';
let editingEventId = null;
let selectedType = 'birthday';

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

// Get user ID from Telegram
const userId = tg.initDataUnsafe?.user?.id || 123456;

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
  await loadEvents();
  setupEventListeners();
  renderEvents();

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').setAttribute('min', today);
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
    const response = await fetch(`/api/events/${userId}`);
    const data = await response.json();
    if (data.success) {
      events = data.events || [];

      // Add demo events if empty
      if (events.length === 0) {
        events = getDemoEvents();
      }
    }
  } catch (err) {
    console.error('Error loading events:', err);
    events = getDemoEvents();
  }
}

function getDemoEvents() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: 1,
      title: 'День народження Марії',
      type: 'birthday',
      event_date: tomorrow.toISOString().split('T')[0],
      event_time: '18:00',
      notes: 'Не забути купити подарунок!'
    },
    {
      id: 2,
      title: 'Зустріч з клієнтом',
      type: 'reminder',
      event_date: today.toISOString().split('T')[0],
      event_time: '14:00',
      notes: 'Підготувати презентацію'
    },
    {
      id: 3,
      title: 'Концерт улюбленої групи',
      type: 'event',
      event_date: nextWeek.toISOString().split('T')[0],
      event_time: '20:00',
      notes: 'Квитки вже куплені'
    }
  ];
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

  if (editingEventId) {
    // Update existing event
    const data = {
      action: 'update_event',
      id: editingEventId,
      ...formData
    };
    tg.sendData(JSON.stringify(data));
  } else {
    // Create new event
    const data = {
      action: 'create_event',
      ...formData
    };
    tg.sendData(JSON.stringify(data));
  }

  closeModalHandler();
}

async function handleDelete() {
  if (!editingEventId) return;

  tg.showConfirm('Ви впевнені, що хочете видалити цю подію?', (confirmed) => {
    if (confirmed) {
      tg.HapticFeedback.notificationOccurred('warning');

      const data = {
        action: 'delete_event',
        id: editingEventId
      };

      tg.sendData(JSON.stringify(data));
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
