// Gráficos Chart.js — cada função (re)cria apenas o próprio canvas.
import { APP_CONFIG } from '../../config/app.config.js';
import { getTotalSaved } from '../calculations/financial.js';

const C = APP_CONFIG.chart;
const instances = new Map();

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: C.text, font: { family: 'DM Sans' } } },
    },
    scales: {
      x: { ticks: { color: C.text }, grid: { color: C.grid } },
      y: { ticks: { color: C.text }, grid: { color: C.grid } },
    },
  };
}

function mount(canvas, config) {
  if (!canvas || typeof Chart === 'undefined') return;
  instances.get(canvas.id)?.destroy();
  instances.set(canvas.id, new Chart(canvas, config));
}

// Planejado x Realizado, mês a mês.
export function renderPlannedVsActualChart(canvas, months) {
  mount(canvas, {
    type: 'line',
    data: {
      labels: months.map((m) => `Mês ${m.number}`),
      datasets: [
        {
          label: 'Planejado',
          data: months.map((m) => m.planned),
          borderColor: C.planned,
          borderDash: [6, 4],
          pointRadius: 2,
          tension: 0.35,
        },
        {
          label: 'Realizado',
          data: months.map((m) => m.saved),
          borderColor: C.realized,
          backgroundColor: 'rgba(232,180,200,0.12)',
          fill: true,
          pointRadius: 3,
          tension: 0.35,
          spanGaps: true,
        },
      ],
    },
    options: baseOptions(),
  });
}

// Evolução acumulada do valor guardado.
export function renderCumulativeChart(canvas, months, valorInicial = 0) {
  let acc = valorInicial;
  const cumulative = months.map((m) => {
    if (m.saved !== null && m.saved !== undefined) acc += m.saved;
    return acc;
  });

  mount(canvas, {
    type: 'line',
    data: {
      labels: months.map((m) => `Mês ${m.number}`),
      datasets: [
        {
          label: 'Acumulado',
          data: cumulative,
          borderColor: C.positive,
          backgroundColor: 'rgba(74,222,128,0.10)',
          fill: true,
          pointRadius: 2,
          tension: 0.35,
        },
      ],
    },
    options: baseOptions(),
  });
}

// Comparação ritmo atual x ritmo necessário (dashboard).
export function renderPaceChart(canvas, state, summary) {
  const labels = ['No ritmo atual', 'Meta'];
  const projected = summary.totalSaved + summary.realAverage * summary.monthsRemaining;

  mount(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: [projected, state.financial.metaTotal],
          backgroundColor: ['rgba(232,180,200,0.55)', 'rgba(233,196,106,0.55)'],
          borderColor: [C.realized, '#e9c46a'],
          borderWidth: 1.5,
          borderRadius: 10,
        },
      ],
    },
    options: {
      ...baseOptions(),
      plugins: { legend: { display: false } },
    },
  });
}
