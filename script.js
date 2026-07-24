const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const message = document.getElementById('message');
const plannerSection = document.getElementById('plannerSection');
const optionsGrid = document.getElementById('optionsGrid');
const plannerForm = document.getElementById('plannerForm');
const freeTextInput = document.getElementById('freeText');
const notesInput = document.getElementById('notes');
const savedSummary = document.getElementById('savedSummary');
const invitationCard = document.getElementById('invitationCard');
const locationText = document.getElementById('locationText');
const locationRadios = document.querySelectorAll('input[name="locationChoice"]');

const responses = [
  'Andale, no me hagas eso 😅',
  'Pero si ya casi me convenciste...',
  'No seas así, anda, dale una oportunidad 💖',
  'Yo sé que quieres decir que sí, así que inténtalo otra vez'
];

const options = [
  { id: 'cine', title: 'Ir al cine', icon: '🎬', placeholder: '¿Qué película te gustaría ver?' },
  { id: 'comer', title: 'Comer algo', icon: '🍜', placeholder: '¿Qué tipo de comida te gusta?' },
  { id: 'parque', title: 'Ir al parque', icon: '🌳', placeholder: '¿Qué te gustaría hacer ahí?' },
  { id: 'correr', title: 'Salir a correr', icon: '🏃', placeholder: '¿Qué ruta o lugar te gustaría?' },
  { id: 'biblioteca', title: 'Ir a la biblioteca', icon: '📚', placeholder: '¿Qué libros o ambientes te llaman?' },
  { id: 'pintar', title: 'Pintar o hacer manualidades', icon: '🎨', placeholder: '¿Qué te gustaría crear?' },
  { id: 'cafe', title: 'Tomar café o un smoothie', icon: '☕', placeholder: '¿Qué te gustaría pedir?' },
  { id: 'caminar', title: 'Caminar por la ciudad', icon: '🚶', placeholder: '¿Qué lugar te gustaría recorrer?' },
  { id: 'museo', title: 'Ir a un museo', icon: '🖼️', placeholder: '¿Qué tipo de museo te interesa?' },
  { id: 'picnic', title: 'Hacer un picnic', icon: '🧺', placeholder: '¿Qué llevarías?' },
  { id: 'atardecer', title: 'Ver el atardecer', icon: '🌅', placeholder: '¿Dónde te gustaría verlo?' },
  { id: 'cocinar', title: 'Cocinar juntos', icon: '🍳', placeholder: '¿Qué comida prepararían?' },
  { id: 'antro', title: 'Ir a un antro o salir a bailar', icon: '🕺', placeholder: '¿Qué estilo de música te gustaría bailar?' }
];

let clicks = 0;
let selectedOptions = new Set();
let selectedPreference = '';

const dateSection = document.getElementById('dateSection');
const transportSection = document.getElementById('transportSection');
const dateForm = document.getElementById('dateForm');
const dateInput = document.getElementById('dateInput');
const timeSelect = document.getElementById('timeSelect');
const dateSummary = document.getElementById('dateSummary');
const transportSummary = document.getElementById('transportSummary');
const continueToDate = document.getElementById('continueToDate');
const voucherSection = document.getElementById('voucherSection');
const voucherContent = document.getElementById('voucherContent');
const reviewSection = document.getElementById('reviewSection');
const reviewBtn = document.getElementById('reviewBtn');
const transportRadios = document.querySelectorAll('input[name="transport"]');

function moveNoButton() {
  const zone = document.querySelector('.button-zone');
  if (!zone) return;
  const zoneRect = zone.getBoundingClientRect();
  const buttonRect = noBtn.getBoundingClientRect();

  const maxX = Math.max(zoneRect.width - buttonRect.width - 24, 0);
  const maxY = Math.max(zoneRect.height - buttonRect.height - 24, 0);

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function renderOptions() {
  if (!optionsGrid) return;
  optionsGrid.innerHTML = '';

  options.forEach((option) => {
    const card = document.createElement('div');
    card.className = 'option-card';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-pill';
    button.dataset.option = option.id;
    button.innerHTML = `<span>${option.title}</span><span>${option.icon}</span>`;
    button.addEventListener('click', () => toggleOption(option.id));

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-detail-input';
    input.placeholder = option.placeholder;
    input.dataset.option = option.id;
    input.autocomplete = 'off';
    input.disabled = true;
    input.addEventListener('input', persistDraft);

    card.append(button, input);
    optionsGrid.appendChild(card);
  });
}

function toggleOption(optionId) {
  if (selectedOptions.has(optionId)) {
    selectedOptions.delete(optionId);
  } else {
    selectedOptions.add(optionId);
  }

  const buttons = optionsGrid.querySelectorAll('.option-pill');
  buttons.forEach((button) => {
    const buttonId = button.dataset.option;
    const cardEl = button.closest('.option-card');
    if (buttonId === optionId) {
      const isActive = selectedOptions.has(optionId);
      cardEl.classList.toggle('active', isActive);
      const detailInput = cardEl.querySelector('.option-detail-input');
      if (detailInput) {
        detailInput.disabled = !isActive;
      }
    }
  });

  persistDraft();
}

function persistDraft() {
  const details = {};
  document.querySelectorAll('.option-detail-input').forEach((input) => {
    if (input.value.trim()) {
      details[input.dataset.option] = input.value.trim();
    }
  });

  const selectedLocation = Array.from(locationRadios).find((input) => input.checked)?.value || '';

  const draft = {
    selected: Array.from(selectedOptions),
    details,
    preference: selectedPreference,
    locationChoice: selectedLocation,
    locationText: locationText ? locationText.value.trim() : '',
    freeText: freeTextInput ? freeTextInput.value.trim() : '',
    notes: notesInput ? notesInput.value.trim() : ''
  };

  renderSummary(draft);
}

function renderSummary(draft) {
  if (!savedSummary) return;
  if (!draft.selected.length && !draft.freeText && !draft.notes && !draft.preference) {
    savedSummary.innerHTML = '<p>Aún no hay detalles guardados. Cuando elijas opciones y llenes los campos, aparecerán aquí.</p>';
    return;
  }

  const selectedTitles = draft.selected.map((id) => options.find((item) => item.id === id)?.title || id);
  const detailsList = selectedTitles.map((title, index) => {
    const id = draft.selected[index];
    const detail = draft.details ? draft.details[id] : null;
    return detail ? `<li>${title}: ${detail}</li>` : `<li>${title}</li>`;
  }).join('');

  savedSummary.innerHTML = `
    <p><strong>Plan guardado ✔</strong></p>
    <ul>${detailsList}</ul>
    ${draft.preference ? `<p><strong>Extra:</strong> ${draft.preference}</p>` : ''}
    ${draft.locationChoice ? `<p><strong>Lugar:</strong> ${draft.locationChoice.replace(/-/g, ' ')}</p>` : ''}
    ${draft.locationText ? `<p><strong>Ubicación:</strong> ${draft.locationText}</p>` : ''}
    ${draft.freeText ? `<p><strong>En específico:</strong> ${draft.freeText}</p>` : ''}
    ${draft.notes ? `<p><strong>Notas:</strong> ${draft.notes}</p>` : ''}
  `;
}

function restoreDraft() {
  if (plannerForm) plannerForm.reset();
  if (dateForm) dateForm.reset();
  document.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
  document.querySelectorAll('input[type="text"], textarea').forEach((field) => { field.value = ''; });
  document.querySelectorAll('.option-card .option-detail-input').forEach((input) => { input.disabled = true; });
  document.querySelectorAll('.option-card.active').forEach((card) => { card.classList.remove('active'); });
  document.querySelectorAll('.preference-pill.active').forEach((button) => { button.classList.remove('active'); });

  selectedOptions.clear();
  selectedPreference = '';

  renderSummary({ selected: [], details: {}, preference: '', freeText: '', notes: '' });
  renderDateSummary({ date: '', time: '' });
  renderTransportSummary('');

  if (voucherContent) voucherContent.innerHTML = '';
}

function updateTimeOptions() {
  if (!dateInput || !timeSelect) return;
  const dateValue = dateInput.value;
  const selectedDate = dateValue ? new Date(dateValue) : null;
  const isWeekday = selectedDate ? selectedDate.getDay() >= 1 && selectedDate.getDay() <= 5 : false;

  const times = isWeekday
    ? ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00']
    : ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  timeSelect.innerHTML = '';
  times.forEach((time) => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
  });

  timeSelect.disabled = !dateValue;
}

function renderDateSummary(draft) {
  if (!dateSummary) return;
  if (!draft.date && !draft.time) {
    dateSummary.innerHTML = '<p>Elige el día y la hora para que todo quede listo.</p>';
    return;
  }

  dateSummary.innerHTML = `
    <p><strong>Fecha confirmada:</strong></p>
    ${draft.date ? `<p>🗓️ ${draft.date}</p>` : ''}
    ${draft.time ? `<p>⏰ ${draft.time}</p>` : ''}
  `;
}

function renderTransportSummary(value) {
  if (!transportSummary) return;
  const summaryByValue = {
    recojo: 'Quiero que me recojas y vayamos juntos al lugar.',
    encontramos: 'Prefiero que nos veamos directamente en el lugar de la cita.'
  };

  transportSummary.innerHTML = value
    ? `<p><strong>Transporte:</strong> ${summaryByValue[value] || value}</p>`
    : '<p>Elige cómo te gustaría que sea nuestra primera llegada.</p>';
}

function renderVoucherSummary(draft) {
  if (!voucherContent) return;
  const selectedTitles = draft.selected.map((id) => options.find((item) => item.id === id)?.title || id);
  voucherContent.innerHTML = `
    <div class="voucher-item"><strong>Plan:</strong>${selectedTitles.length ? `<span>${selectedTitles.join(', ')}</span>` : '<span>Sin plan seleccionado</span>'}</div>
    ${draft.preference ? `<div class="voucher-item"><strong>Extra:</strong><span>${draft.preference}</span></div>` : ''}
    ${draft.locationChoice ? `<div class="voucher-item"><strong>Lugar:</strong><span>${draft.locationChoice.replace(/-/g, ' ')}</span></div>` : ''}
    ${draft.locationText ? `<div class="voucher-item"><strong>Ubicación elegida:</strong><span>${draft.locationText}</span></div>` : ''}
    ${draft.date ? `<div class="voucher-item"><strong>Fecha:</strong><span>${draft.date}</span></div>` : ''}
    ${draft.time ? `<div class="voucher-item"><strong>Hora:</strong><span>${draft.time} hrs</span></div>` : ''}
    ${draft.transport ? `<div class="voucher-item"><strong>Transporte:</strong><span>${draft.transport === 'recojo' ? 'Te recojo' : 'Nos vemos allá'}</span></div>` : ''}
    ${draft.notes ? `<div class="voucher-item"><strong>Notas finales:</strong><span>${draft.notes}</span></div>` : ''}
  `;
  voucherSection.classList.add('burst');
  setTimeout(() => voucherSection.classList.remove('burst'), 1200);
}

function generateShareText(draft) {
  const selectedTitles = draft.selected.map((id) => options.find((item) => item.id === id)?.title || id);
  const lines = [
    'Vale de cita para Andrea',
    '',
    `Plan: ${selectedTitles.length ? selectedTitles.join(', ') : 'Sin plan seleccionado'}`,
    draft.preference ? `Extra: ${draft.preference}` : '',
    draft.locationChoice ? `Lugar: ${draft.locationChoice.replace(/-/g, ' ')}` : '',
    draft.locationText ? `Ubicación: ${draft.locationText}` : '',
    draft.date ? `Fecha: ${draft.date}` : '',
    draft.time ? `Hora: ${draft.time}` : '',
    draft.transport ? `Transporte: ${draft.transport === 'recojo' ? 'Te recojo' : 'Nos vemos allá'}` : '',
    draft.notes ? `Notas: ${draft.notes}` : ''
  ].filter(Boolean);
  return lines.join('\n');
}

function getCurrentDraft() {
  const details = {};
  document.querySelectorAll('.option-detail-input').forEach((input) => {
    if (input.value.trim()) {
      details[input.dataset.option] = input.value.trim();
    }
  });

  return {
    selected: Array.from(selectedOptions),
    preference: selectedPreference,
    locationChoice: Array.from(locationRadios).find((radio) => radio.checked)?.value || '',
    locationText: locationText ? locationText.value.trim() : '',
    date: dateInput ? dateInput.value : '',
    time: timeSelect ? timeSelect.value : '',
    transport: Array.from(transportRadios).find((radio) => radio.checked)?.value || '',
    notes: notesInput ? notesInput.value.trim() : '',
    details
  };
}

async function sendEmail(draft) {
  const response = await fetch('/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(draft)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error al enviar el correo');
  }

  return response.json();
}

if (noBtn) {
  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('click', (event) => {
    event.preventDefault();
    clicks += 1;
    message.textContent = responses[Math.min(clicks - 1, responses.length - 1)];
    moveNoButton();
  });
}

if (yesBtn) {
  yesBtn.addEventListener('click', () => {
    message.textContent = '¡Sí! Entonces vamos a planear nuestra cita 💕';
    plannerSection.classList.remove('hidden');
    plannerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.body.classList.add('celebrate');
    setTimeout(() => document.body.classList.remove('celebrate'), 1400);
  });
}

if (plannerForm) {
  plannerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    persistDraft();
    message.textContent = 'Perfecto, ya quedó guardado nuestro plan 💖';
    dateSection.classList.remove('hidden');
    if (continueToDate) continueToDate.classList.remove('hidden');
    dateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (continueToDate) {
  continueToDate.addEventListener('click', () => {
    dateSection.classList.remove('hidden');
    dateSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (dateForm) {
  dateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const dateValue = dateInput.value;
    const timeValue = timeSelect.value;

    if (!dateValue || !timeValue) {
      dateSummary.innerHTML = '<p>Por favor selecciona día y hora antes de seguir.</p>';
      return;
    }

    const minDate = dateInput.min;
    if (dateValue < minDate) {
      dateSummary.innerHTML = `<p>Debes elegir una fecha a partir del ${minDate}.</p>`;
      return;
    }

    persistDraft();
    renderDateSummary({ date: dateValue, time: timeValue });
    message.textContent = 'Ya está lista la fecha y la hora ✨';
    transportSection.classList.remove('hidden');
    transportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    reviewSection.classList.remove('hidden');
  });
}

if (dateInput) {
  dateInput.addEventListener('change', () => {
    updateTimeOptions();
    persistDraft();
  });
}

if (timeSelect) {
  timeSelect.addEventListener('change', persistDraft);
}

if (reviewBtn) {
  reviewBtn.addEventListener('click', () => {
    const draft = getCurrentDraft();
    draft.selectedLabels = draft.selected.map((id) => options.find((item) => item.id === id)?.title || id);
    sessionStorage.setItem('finalValeDraft', JSON.stringify(draft));
    window.location.href = 'vale-final.html';
  });
}

transportRadios.forEach((input) => {
  input.addEventListener('change', () => {
    persistDraft();
    renderTransportSummary(input.value);
    reviewSection.classList.remove('hidden');
    message.textContent = 'Perfecto, ya elegimos cómo llegar 👌';
  });
});

if (freeTextInput) freeTextInput.addEventListener('input', persistDraft);
if (notesInput) notesInput.addEventListener('input', persistDraft);

window.addEventListener('resize', moveNoButton);
window.addEventListener('load', () => {
  renderOptions();
  if (dateInput) dateInput.min = '2026-07-27';
  updateTimeOptions();
  moveNoButton();

  document.querySelectorAll('.preference-pill').forEach((button) => {
    button.addEventListener('click', () => {
      selectedPreference = button.dataset.preference;
      document.querySelectorAll('.preference-pill').forEach((btn) => btn.classList.toggle('active', btn === button));
      persistDraft();
      message.textContent = `Elegiste: ${selectedPreference}. Buenísimo, eso hace el plan aún más especial.`;
      button.classList.add('burst');
      setTimeout(() => button.classList.remove('burst'), 600);
    });
  });

  locationRadios.forEach((input) => {
    input.addEventListener('change', persistDraft);
  });

  if (locationText) locationText.addEventListener('input', persistDraft);
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    restoreDraft();
    updateTimeOptions();
    moveNoButton();
  }
});