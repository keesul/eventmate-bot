// Custom Date Picker
class CustomDatePicker {
  constructor(inputElement) {
    this.input = inputElement;
    this.selectedDate = null;
    this.currentMonth = new Date();
    this.init();
  }

  init() {
    this.modal = this.createModal();
    document.body.appendChild(this.modal);

    const wrapper = document.createElement('div');
    wrapper.className = 'date-input-wrapper';
    this.input.parentNode.insertBefore(wrapper, this.input);
    wrapper.appendChild(this.input);

    this.input.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.open();
    });
    this.input.readOnly = true;

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
    prevBtn.type = 'button';
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.prevMonth();
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'calendar-nav-btn next-month';
    nextBtn.textContent = '›';
    nextBtn.type = 'button';
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
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

    // Close on backdrop click only
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('calendar-modal')) {
        this.close();
      }
    });

    return modal;
  }

  open() {
    this.currentMonth = this.selectedDate ? new Date(this.selectedDate) : new Date();
    this.render();
    this.modal.style.display = 'flex';
    setTimeout(() => this.modal.classList.add('active'), 10);
  }

  close() {
    this.modal.style.display = 'none';
    this.modal.classList.remove('active');
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

    const months = userSettings.language === 'en'
      ? ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December']
      : ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
         'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

    const titleEl = this.modal.querySelector('.calendar-title');
    titleEl.innerHTML = `${months[month]} <span class="calendar-year-btn">${year}</span>`;

    // Add year picker click handler
    const yearBtn = titleEl.querySelector('.calendar-year-btn');
    yearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showYearPicker();
    });

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

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    const daysContainer = this.modal.querySelector('.calendar-days');
    daysContainer.textContent = '';

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const btn = this.createDayButton(day, true, year, month - 1);
      daysContainer.appendChild(btn);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const btn = this.createDayButton(day, false, year, month);
      daysContainer.appendChild(btn);
    }

    const totalCells = daysContainer.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const btn = this.createDayButton(day, true, year, month + 1);
      daysContainer.appendChild(btn);
    }
  }

  showYearPicker() {
    const currentYear = this.currentMonth.getFullYear();
    const yearPickerContainer = document.createElement('div');
    yearPickerContainer.className = 'calendar-year-picker';

    const yearScroll = document.createElement('div');
    yearScroll.className = 'calendar-year-scroll';

    const startYear = 1900;
    const endYear = 2100;

    for (let y = startYear; y <= endYear; y++) {
      const yearItem = document.createElement('div');
      yearItem.className = 'calendar-year-item';
      yearItem.textContent = y;
      yearItem.dataset.year = y;
      if (y === currentYear) {
        yearItem.classList.add('selected');
      }
      yearItem.addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentMonth.setFullYear(parseInt(yearItem.dataset.year));
        this.hideYearPicker();
        this.render();
      });
      yearScroll.appendChild(yearItem);
    }

    yearPickerContainer.appendChild(yearScroll);

    const content = this.modal.querySelector('.calendar-content');
    content.appendChild(yearPickerContainer);

    setTimeout(() => {
      const selectedYear = yearScroll.querySelector('.selected');
      if (selectedYear) {
        selectedYear.scrollIntoView({ block: 'center' });
      }
    }, 10);
  }

  hideYearPicker() {
    const yearPicker = this.modal.querySelector('.calendar-year-picker');
    if (yearPicker) {
      yearPicker.remove();
    }
  }

  createDayButton(day, otherMonth, year, month) {
    const btn = document.createElement('button');
    btn.className = 'calendar-day';
    btn.textContent = day;
    btn.type = 'button';

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
      e.preventDefault();
      e.stopPropagation();
      this.selectDate(date);
    });

    return btn;
  }

  selectDate(date) {
    this.selectedDate = date;
    this.updateDisplay();
    this.render();
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

    this.input.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.open();
    });
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

    const scrollPickers = document.createElement('div');
    scrollPickers.className = 'time-scroll-pickers';

    // Hours scroll picker
    const hoursWrapper = document.createElement('div');
    hoursWrapper.className = 'time-scroll-wrapper';
    const hoursScroll = document.createElement('div');
    hoursScroll.className = 'time-scroll-column';
    hoursScroll.dataset.type = 'hours';
    for (let i = 0; i < 24; i++) {
      const item = document.createElement('div');
      item.className = 'time-scroll-item';
      item.textContent = String(i).padStart(2, '0');
      item.dataset.value = i;
      hoursScroll.appendChild(item);
    }
    hoursWrapper.appendChild(hoursScroll);

    const separator = document.createElement('div');
    separator.className = 'time-scroll-separator';
    separator.textContent = ':';

    // Minutes scroll picker
    const minutesWrapper = document.createElement('div');
    minutesWrapper.className = 'time-scroll-wrapper';
    const minutesScroll = document.createElement('div');
    minutesScroll.className = 'time-scroll-column';
    minutesScroll.dataset.type = 'minutes';
    for (let i = 0; i < 60; i++) {
      const item = document.createElement('div');
      item.className = 'time-scroll-item';
      item.textContent = String(i).padStart(2, '0');
      item.dataset.value = i;
      minutesScroll.appendChild(item);
    }
    minutesWrapper.appendChild(minutesScroll);

    scrollPickers.appendChild(hoursWrapper);
    scrollPickers.appendChild(separator);
    scrollPickers.appendChild(minutesWrapper);

    // Setup scroll handlers
    this.setupScrollPicker(hoursScroll, 'hours');
    this.setupScrollPicker(minutesScroll, 'minutes');

    const actions = document.createElement('div');
    actions.className = 'time-picker-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary cancel-time';
    cancelBtn.type = 'button';
    const cancelSpan = document.createElement('span');
    cancelSpan.textContent = window.t ? window.t('cancelBtn') : 'Скасувати';
    cancelBtn.appendChild(cancelSpan);
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary confirm-time';
    confirmBtn.type = 'button';
    const confirmSpan = document.createElement('span');
    confirmSpan.textContent = window.t ? window.t('confirmBtn') : 'Підтвердити';
    confirmBtn.appendChild(confirmSpan);
    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.confirm();
    });
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);

    content.appendChild(header);
    content.appendChild(scrollPickers);
    content.appendChild(actions);
    modal.appendChild(content);

    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('time-picker-modal')) {
        this.close();
      }
    });

    return modal;
  }

  setupScrollPicker(column, type) {
    const itemHeight = 48;
    let startY = 0;
    let startScroll = 0;
    let isDragging = false;

    const updateSelection = () => {
      const scrollTop = column.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const value = parseInt(column.children[index]?.dataset.value || 0);

      if (type === 'hours') {
        this.hours = value;
      } else {
        this.minutes = value;
      }

      // Update selected class
      Array.from(column.children).forEach((item, i) => {
        item.classList.toggle('selected', i === index);
      });
    };

    const snapToNearest = () => {
      const scrollTop = column.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      column.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      });
      updateSelection();
    };

    column.addEventListener('touchstart', (e) => {
      isDragging = true;
      startY = e.touches[0].clientY;
      startScroll = column.scrollTop;
    });

    column.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.touches[0].clientY;
      column.scrollTop = startScroll + deltaY;
      updateSelection();
    });

    column.addEventListener('touchend', () => {
      isDragging = false;
      snapToNearest();
    });

    column.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startScroll = column.scrollTop;
      e.preventDefault();
    });

    column.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      column.scrollTop = startScroll + deltaY;
      updateSelection();
    });

    column.addEventListener('mouseup', () => {
      isDragging = false;
      snapToNearest();
    });

    column.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        snapToNearest();
      }
    });

    column.addEventListener('wheel', (e) => {
      e.preventDefault();
      column.scrollTop += e.deltaY;
      clearTimeout(column.snapTimeout);
      column.snapTimeout = setTimeout(snapToNearest, 150);
    });

    column.addEventListener('scroll', updateSelection);
  }

  open() {
    if (this.input.value) {
      const [h, m] = this.input.value.split(':');
      this.hours = parseInt(h);
      this.minutes = parseInt(m);
    }
    this.modal.style.display = 'flex';
    setTimeout(() => {
      this.modal.classList.add('active');
      this.scrollToTime();
    }, 10);
  }

  scrollToTime() {
    const hoursColumn = this.modal.querySelector('[data-type="hours"]');
    const minutesColumn = this.modal.querySelector('[data-type="minutes"]');
    const itemHeight = 48;

    hoursColumn.scrollTop = this.hours * itemHeight;
    minutesColumn.scrollTop = this.minutes * itemHeight;

    // Update selected class
    Array.from(hoursColumn.children).forEach((item, i) => {
      item.classList.toggle('selected', i === this.hours);
    });
    Array.from(minutesColumn.children).forEach((item, i) => {
      item.classList.toggle('selected', i === this.minutes);
    });
  }

  close() {
    this.modal.style.display = 'none';
    this.modal.classList.remove('active');
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

// Custom Select Dropdown
class CustomSelect {
  constructor(selectElement) {
    this.select = selectElement;
    this.selectedValue = selectElement.value;
    this.init();
  }

  init() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'custom-select-container';
    this.select.parentNode.insertBefore(this.wrapper, this.select);
    this.wrapper.appendChild(this.select);
    this.select.style.display = 'none';

    this.display = document.createElement('div');
    this.display.className = 'custom-select-display';
    this.updateDisplay();
    this.wrapper.appendChild(this.display);

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'custom-select-dropdown';
    this.wrapper.appendChild(this.dropdown);

    this.renderOptions();

    this.display.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    document.addEventListener('click', () => {
      this.close();
    });

    this.select.addEventListener('change', () => {
      this.selectedValue = this.select.value;
      this.updateDisplay();
      this.renderOptions();
    });
  }

  renderOptions() {
    this.dropdown.innerHTML = '';
    Array.from(this.select.options).forEach(option => {
      const item = document.createElement('div');
      item.className = 'custom-select-item';
      item.textContent = option.textContent;
      item.dataset.value = option.value;

      if (option.value === this.selectedValue) {
        item.classList.add('selected');
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectOption(option.value);
      });

      this.dropdown.appendChild(item);
    });
  }

  selectOption(value) {
    this.selectedValue = value;
    this.select.value = value;
    this.updateDisplay();
    this.renderOptions();
    this.close();

    const event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);
  }

  updateDisplay() {
    const selectedOption = Array.from(this.select.options).find(opt => opt.value === this.selectedValue);
    this.display.textContent = selectedOption ? selectedOption.textContent : '';
  }

  toggle() {
    const isOpen = this.wrapper.classList.contains('open');
    document.querySelectorAll('.custom-select-container.open').forEach(el => {
      el.classList.remove('open');
    });
    if (!isOpen) {
      this.wrapper.classList.add('open');
    }
  }

  close() {
    this.wrapper.classList.remove('open');
  }
}

function initCustomInputs() {
  document.querySelectorAll('input[type="date"]').forEach(input => {
    if (!input.dataset.customPicker) {
      input.dataset.customPicker = 'true';
      new CustomDatePicker(input);
    }
  });

  document.querySelectorAll('input[type="time"]').forEach(input => {
    if (!input.dataset.customPicker) {
      input.dataset.customPicker = 'true';
      new CustomTimePicker(input);
    }
  });

  document.querySelectorAll('select').forEach(select => {
    if (!select.dataset.customSelect) {
      select.dataset.customSelect = 'true';
      new CustomSelect(select);
    }
  });
}

window.initCustomInputs = initCustomInputs;
