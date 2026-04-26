// ===== STATE =====
const state = {
  temp: { value: 19, min: -20, max: 50 },
  fan:  { value: 3,  min: 0,   max: 10 },
  hum:  { value: 53, min: 0,   max: 100 },
};

// ===== DOM REFS =====
const els = {
  temp: {
    val: document.getElementById('val-temp'),
    bar: document.getElementById('bar-temp'),
  },
  fan: {
    val:  document.getElementById('val-fan'),
    bar:  document.getElementById('bar-fan'),
    icon: document.getElementById('fan-icon'),
  },
  hum: {
    val: document.getElementById('val-hum'),
    bar: document.getElementById('bar-hum'),
  },
};

const statusText = document.getElementById('status-text');

// ===== FAN SPIN =====
let fanAngle = 0;
let fanAnimId = null;

function animateFan() {
  const speed = state.fan.value;
  if (speed === 0) {
    cancelAnimationFrame(fanAnimId);
    fanAnimId = null;
    return;
  }
  fanAngle = (fanAngle + speed * 0.6) % 360;
  els.fan.icon.style.transform = `rotate(${fanAngle}deg)`;
  fanAnimId = requestAnimationFrame(animateFan);
}

function syncFanSpin() {
  if (state.fan.value > 0 && !fanAnimId) {
    fanAnimId = requestAnimationFrame(animateFan);
  } else if (state.fan.value === 0) {
    cancelAnimationFrame(fanAnimId);
    fanAnimId = null;
  }
}

// ===== BAR WIDTH =====
function barPercent(key) {
  const { value, min, max } = state[key];
  return ((value - min) / (max - min)) * 100;
}

// ===== RENDER =====
function render(key) {
  const { value } = state[key];
  const valEl = els[key].val;
  const barEl = els[key].bar;

  valEl.textContent = value;
  barEl.style.width = barPercent(key) + '%';

  // bump animation
  valEl.classList.remove('bump');
  void valEl.offsetWidth; // reflow
  valEl.classList.add('bump');

  renderStatus();
  if (key === 'fan') syncFanSpin();
}

function renderStatus() {
  const { temp, fan, hum } = state;
  statusText.textContent =
    `Температура: ${temp.value}°C  ·  Вентилятор: ${fan.value} об/с  ·  Вологість: ${hum.value}%`;
}

// ===== INITIAL RENDER =====
function init() {
  Object.keys(state).forEach(key => {
    els[key].bar.style.width = barPercent(key) + '%';
  });
  renderStatus();
  syncFanSpin();
}

// ===== BUTTON HANDLERS =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key    = btn.dataset.target;
    const isPlus = btn.classList.contains('btn-plus');
    const s      = state[key];

    if (isPlus && s.value < s.max) {
      s.value++;
      render(key);
    } else if (!isPlus && s.value > s.min) {
      s.value--;
      render(key);
    }
  });
});

// ===== BOOT =====
init();
