// Custom Date Picker
class CustomDatePicker {
  constructor(inputElement) {
    this.input = inputElement;
    this.selectedDate = null;
    this.currentMonth = new Date();
    this.init();
  }

  init() {
    // Create modal
    this.modal = this.createModal();
    document.body.appendChild(this.modal);

    // Wrap input
    const wrapper = document.createElement('div');
    wrapper.className = 'date-input-wrapper';
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);

    // Add click handler
    this.input.addEventListener('click', () => this.open());
    this.input.readOnly = true;

    // Set initial value if exists
    if (this.input.value) {
      this.selectedDate = new Date(this.input.value);
      this.updateDisplay();
    }
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'calendar-modal';

    const content = document.createElement('div');
    content.className = 'calendar-content';

    const header = document.createElement('div');
    header.className = 'calendar-header';

    const title = document.createElement('div');
    title.className = 'calendar-title';

    const nav = document.createElement('div');
    nav.className = 'calendar-nav';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'calendar-nav-btn prev-month';
    prevBtn.textContent = '‹';
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevMonth();
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'calendar-nav-btn next-month';
    nextBtn.textContent = '›';
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextMonth();
    });

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    header.appendChild(title);
    header.appendChild(nav);

    const weekdays = document.createElement('div');
    weekdays.className = 'calendar-weekdays';

    const days = document.createElement('div');
    days.className = 'calendar-days';

    content.appendChild(header);
    content.appendChild(weekdays);
    content.appendChild(days);
    modal.appendChild(content);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    return modal;
  }

  open() {
    this.currentMonth = this.selectedDate ? new Date(this.selectedDate) : new Date();
    this.render();
    this.modal.classList.add('active');
  }

  close() {
    this.modal.classList.remove('active');

    // Trigger change event when closing
    if (this.selectedDate) {
      const event = new Event('change', { bubbles: true });
      this.input.dispatchEvent(event);
    }
  }

  prevMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.render();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.render();
  }

  render() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Update title
    const months = userSettings.language === 'en'
      ? ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December']
      : ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
         'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
    this.modal.querySelector('.calendar-title').textContent = `${months[month]} ${year}`;

    // Render weekdays
    const weekdays = userSettings.language === 'en'
      ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
      : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const weekdaysContainer = this.modal.querySelector('.calendar-weekdays');
    weekdaysContainer.textContent = '';
    weekdays.forEach(day => {
      const div = document.createElement('div');
      div.className = 'calendar-weekday';
      div.textContent = day;
      weekdaysContainer.appendChild(div);
    });

    // Render days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    const daysContainer = this.modal.querySelector('.calendar-days');
    daysContainer.textContent = '';

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const btn = this.createDayButton(day, true, year, month - 1);
      daysContainer.appendChild(btn);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const btn = this.createDayButton(day, false, year, month);
      daysContainer.appendChild(btn);
    }

    // Next month days
    const totalCells = daysContainer.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const btn = this.createDayButton(day, true, year, month + 1);
      daysContainer.appendChild(btn);
    }
  }

  createDayButton(day, otherMonth, year, month) {
    const btn = document.createElement('button');
    btn.className = 'calendar-day';
    btn.textContent = day;

    if (otherMonth) {
      btn.classList.add('other-month');
    }

    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      btn.classList.add('today');
    }

    if (this.selectedDate &&
        date.getDate() === this.selectedDate.getDate() &&
        date.getMonth() === this.selectedDate.getMonth() &&
        date.getFullYear() === this.selectedDate.getFullYear()) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectDate(date);
    });

    return btn;
  }

  selectDate(date) {
    this.selectedDate = date;
    this.updateDisplay();
    this.render(); // Re-render to show selected date
    // Don't close modal - let user confirm or click outside
  }

  updateDisplay() {
    if (this.selectedDate) {
      const year = this.selectedDate.getFullYear();
      const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectedDate.getDate()).padStart(2, '0');
      this.input.value = `${year}-${month}-${day}`;
    }
  }
}

// Custom Time Picker
class CustomTimePicker {
  constructor(inputElement) {
    this.input = inputElement;
    this.hours = 9;
    this.minutes = 0;
    this.init();
  }

  init() {
    this.modal = this.createModal();
    document.body.appendChild(this.modal);

    const wrapper = document.createElement('div');
    wrapper.className = 'time-input-wrapper';
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);

    this.input.addEventListener('click', () => this.open());
    this.input.readOnly = true;

    if (this.input.value) {
      const [h, m] = this.input.value.split(':');
      this.hours = parseInt(h);
      this.minutes = parseInt(m);
      this.updateDisplay();
    }
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'time-picker-modal';

    const content = document.createElement('div');
    content.className = 'time-picker-content';

    const header = document.createElement('div');
    header.className = 'time-picker-header';
    const title = document.createElement('div');
    title.className = 'time-picker-title';
    title.textContent = window.t ? window.t('timePickerTitle') : 'Виберіть час';
    header.appendChild(title);

    const display = document.createElement('div');
    display.className = 'time-picker-display';
    const hoursSpan = document.createElement('span');
    hoursSpan.className = 'hours-display';
    hoursSpan.textContent = '09';
    hoursSpan.contentEditable = 'true';
    hoursSpan.addEventListener('input', (e) => this.handleHoursInput(e));
    hoursSpan.addEventListener('focus', (e) => e.target.select());
    const separator = document.createElement('span');
    separator.textContent = ':';
    const minutesSpan = document.createElement('span');
    minutesSpan.className = 'minutes-display';
    minutesSpan.textContent = '00';
    minutesSpan.contentEditable = 'true';
    minutesSpan.addEventListener('input', (e) => this.handleMinutesInput(e));
    minutesSpan.addEventListener('focus', (e) => e.target.select());
    display.appendChild(hoursSpan);
    display.appendChild(separator);
    display.appendChild(minutesSpan);

    const controls = document.createElement('div');
    controls.className = 'time-picker-controls';

    const hoursCol = document.createElement('div');
    hoursCol.className = 'time-picker-column';
    const hoursUp = document.createElement('button');
    hoursUp.className = 'time-picker-btn hours-up';
    hoursUp.textContent = '▲';
    hoursUp.addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeHours(1);
    });
    const hoursDown = document.createElement('button');
    hoursDown.className = 'time-picker-btn hours-down';
    hoursDown.textContent = '▼';
    hoursDown.addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeHours(-1);
    });
    hoursCol.appendChild(hoursUp);
    hoursCol.appendChild(hoursDown);

    const minutesCol = document.createElement('div');
    minutesCol.className = 'time-picker-column';
    const minutesUp = document.createElement('button');
    minutesUp.className = 'time-picker-btn minutes-up';
    minutesUp.textContent = '▲';
    minutesUp.addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeMinutes(5);
    });
    const minutesDown = document.createElement('button');
    minutesDown.className = 'time-picker-btn minutes-down';
    minutesDown.textContent = '▼';
    minutesDown.addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeMinutes(-5);
    });
    minutesCol.appendChild(minutesUp);
    minutesCol.appendChild(minutesDown);

    controls.appendChild(hoursCol);
    controls.appendChild(minutesCol);

    const actions = document.createElement('div');
    actions.className = 'time-picker-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary cancel-time';
    const cancelSpan = document.createElement('span');
    cancelSpan.textContent = window.t ? window.t('cancelBtn') : 'Скасувати';
    cancelBtn.appendChild(cancelSpan);
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary confirm-time';
    const confirmSpan = document.createElement('span');
    confirmSpan.textContent = window.t ? window.t('confirmBtn') : 'Підтвердити';
    confirmBtn.appendChild(confirmSpan);
    confirmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.confirm();
    });
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    content.appendChild(header);
    content.appendChild(display);
    content.appendChild(controls);
    content.appendChild(actions);
    modal.appendChild(content);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    return modal;
  }

  open() {
    if (this.input.value) {
      const [h, m] = this.input.value.split(':');
      this.hours = parseInt(h);
      this.minutes = parseInt(m);
    }
    this.render();
    this.modal.classList.add('active');
  }

  close() {
    this.modal.classList.remove('active');
  }

  changeHours(delta) {
    this.hours = (this.hours + delta + 24) % 24;
    this.render();
  }

  changeMinutes(delta) {
    this.minutes = (this.minutes + delta + 60) % 60;
    this.render();
  }

  render() {
    const hoursStr = String(this.hours).padStart(2, '0');
    const minutesStr = String(this.minutes).padStart(2, '0');
    this.modal.querySelector('.hours-display').textContent = hoursStr;
    this.modal.querySelector('.minutes-display').textContent = minutesStr;
  }

  handleHoursInput(e) {
    const value = e.target.textContent.replace(/\D/g, '');
    if (value === '') return;

    let hours = parseInt(value);
    if (hours > 23) hours = 23;
    if (hours < 0) hours = 0;

    this.hours = hours;
    e.target.textContent = String(hours).padStart(2, '0');

    // Move cursor to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(e.target);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  handleMinutesInput(e) {
    const value = e.target.textContent.replace(/\D/g, '');
    if (value === '') return;

    let minutes = parseInt(value);
    if (minutes > 59) minutes = 59;
    if (minutes < 0) minutes = 0;

    this.minutes = minutes;
    e.target.textContent = String(minutes).padStart(2, '0');

    // Move cursor to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(e.target);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  confirm() {
    this.updateDisplay();
    this.close();

    const event = new Event('change', { bubbles: true });
    this.input.dispatchEvent(event);
  }

  updateDisplay() {
    const hoursStr = String(this.hours).padStart(2, '0');
    const minutesStr = String(this.minutes).padStart(2, '0');
    this.input.value = `${hoursStr}:${minutesStr}`;
  }
}

function initCustomInputs() {
  document.querySelectorAll('input[type="date"]').forEach(input => {
    new CustomDatePicker(input);
  });

  document.querySelectorAll('input[type="time"]').forEach(input => {
    new CustomTimePicker(input);
  });

  document.querySelectorAll('select').forEach(select => {
    if (!select.parentElement.classList.contains('custom-select-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
      select.classList.add('custom-select');
    }
  });
}

window.initCustomInputs = initCustomInputs;
