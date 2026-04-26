const PARAMS = [
  {
    id:      'temp',
    name:    'Температура',
    unit:    '°C',
    value:   19,
    min:     -20,
    max:     50,
    step:    1,
    icon:    () => '<span class="param-icon">🌡️</span>',
  },
  {
    id:      'fan',
    name:    'Вентилятор',
    unit:    '',
    value:   3,
    min:     0,
    max:     10,
    step:    1,
    icon:    buildFanIcon,
    onUpdate: updateFanSpeed,
  },
  {
    id:      'humidity',
    name:    'Вологість',
    unit:    '%',
    value:   53,
    min:     0,
    max:     100,
    step:    1,
    icon:    () => '<span class="param-icon">💧</span>',
  },
];

function buildCard(param) {
  const card = document.createElement('div');
  card.className = 'param-card';
  card.id = `card-${param.id}`;
  const pct = valueToPct(param.value, param.min, param.max);

  card.innerHTML = `
    ${param.icon(param)}
    <div class="param-name">${param.name}</div>
    <div class="param-value" id="val-${param.id}">
      ${param.value}<span class="param-unit">${param.unit}</span>
    </div>
    <div class="param-controls">
      <button class="btn" id="dec-${param.id}" aria-label="Зменшити ${param.name}">−</button>
      <button class="btn" id="inc-${param.id}" aria-label="Збільшити ${param.name}">+</button>
    </div>
    <div class="param-bar-wrap">
      <div class="param-bar" id="bar-${param.id}" style="width:${pct}%"></div>
    </div>
  `;
  return card;
}

function buildFanIcon() {
  return `
    <div class="fan-icon" id="fan-anim">
      <div class="fan-blade" id="fan-blade" style="--fan-duration: 99999s;">
        <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 22 C22 14 28 8 36 10 C38 18 32 24 22 22Z" fill="#00ffe7" opacity="0.8"/>
          <path d="M22 22 C30 22 36 28 34 36 C26 38 20 32 22 22Z" fill="#00ffe7" opacity="0.8"/>
          <path d="M22 22 C22 30 16 36 8 34 C6 26 12 20 22 22Z" fill="#00ffe7" opacity="0.8"/>
          <path d="M22 22 C14 22 8 16 10 8 C18 6 24 12 22 22Z" fill="#00ffe7" opacity="0.8"/>
        </svg>
      </div>
      <div class="fan-center"></div>
    </div>
  `;
}

function updateFanSpeed(param) {
  const blade = document.getElementById('fan-blade');
  if (!blade) return;
  if (param.value === 0) {
    blade.style.setProperty('--fan-duration', '99999s');
    return;
  }
  const duration = (4.4 - param.value * 0.4).toFixed(2) + 's';
  blade.style.setProperty('--fan-duration', duration);
}

function valueToPct(value, min, max) {
  return Math.round(((value - min) / (max - min)) * 100);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateParam(param, delta) {
  const newValue = clamp(param.value + delta, param.min, param.max);
  if (newValue === param.value) return;
  param.value = newValue;

  const valEl = document.getElementById(`val-${param.id}`);
  valEl.innerHTML = `${newValue}<span class="param-unit">${param.unit}</span>`;
  valEl.classList.remove('pop');
  void valEl.offsetWidth;
  valEl.classList.add('pop');
  setTimeout(() => valEl.classList.remove('pop'), 120);

  document.getElementById(`bar-${param.id}`).style.width =
    `${valueToPct(newValue, param.min, param.max)}%`;

  updateButtonStates(param);
  if (typeof param.onUpdate === 'function') param.onUpdate(param);
  renderStatusLine();
}

function updateButtonStates(param) {
  const dec = document.getElementById(`dec-${param.id}`);
  const inc = document.getElementById(`inc-${param.id}`);
  if (dec) dec.disabled = param.value <= param.min;
  if (inc) inc.disabled = param.value >= param.max;
}

function renderStatusLine() {
  const parts = PARAMS.map(p => `${p.name}: ${p.value}${p.unit}`);
  document.getElementById('status-line').textContent = parts.join('  ·  ');
}

function init() {
  const grid = document.getElementById('controls-grid');
  PARAMS.forEach(param => {
    grid.appendChild(buildCard(param));
    document.getElementById(`dec-${param.id}`)
      .addEventListener('click', () => updateParam(param, -param.step));
    document.getElementById(`inc-${param.id}`)
      .addEventListener('click', () => updateParam(param, +param.step));
    updateButtonStates(param);
    if (typeof param.onUpdate === 'function') param.onUpdate(param);
  });
  renderStatusLine();
}

document.addEventListener('DOMContentLoaded', init);
