// =====================
// Стан програми
// =====================
const state = {
  temp: { value: 19, min: -20, max: 50 },
  fan:  { value: 3,  min: 0,   max: 10 },
  hum:  { value: 53, min: 0,   max: 100 },
};

// =====================
// Оновлення інтерфейсу
// =====================
function updateUI() {
  // Температура
  document.getElementById('val-temp').innerHTML =
    state.temp.value + '<span class="card__unit">°C</span>';

  // Вентилятор
  document.getElementById('val-fan').innerHTML =
    state.fan.value + '<span class="card__unit"> / 10</span>';

  // Вологість
  document.getElementById('val-hum').innerHTML =
    state.hum.value + '<span class="card__unit">%</span>';

  // Рядок статусу
  document.getElementById('status-line').textContent =
    'Температура: ' + state.temp.value + '°C' +
    '   |   Вентилятор: ' + state.fan.value + '/10' +
    '   |   Вологість: ' + state.hum.value + '%';

  // Анімація вентилятора
  updateFan();
}

// =====================
// Зміна значення
// =====================
function change(param, delta) {
  const p = state[param];
  const newValue = p.value + delta;

  // Перевіряємо межі
  if (newValue < p.min || newValue > p.max) return;

  p.value = newValue;
  updateUI();
}

// =====================
// Анімація вентилятора
// =====================
function updateFan() {
  const fanBlades = document.getElementById('fan-blades');
  const speed = state.fan.value;

  if (speed === 0) {
    // Зупиняємо вентилятор плавно:
    // встановлюємо дуже великий час — обертання сповільниться до нуля
    fanBlades.style.animationDuration = '999s';
  } else {
    // Чим більше speed — тим менший час оберту (швидше)
    // speed=1 → 3s, speed=10 → 0.3s
    const duration = (3 / speed).toFixed(2) + 's';
    fanBlades.style.animationDuration = duration;
  }
}

// =====================
// Перший рендер
// =====================
updateUI();
