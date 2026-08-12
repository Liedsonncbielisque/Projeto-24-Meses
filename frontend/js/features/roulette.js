// Roleta de experiências: desenho em canvas, sorteio e animação.
import { APP_CONFIG } from '../../config/app.config.js';
import { getState, updateOuting, addHistoryEntry } from '../state/state.js';
import { getCurrentMonthNumber } from '../calculations/financial.js';

const { roulette: CFG } = APP_CONFIG;

export function getAvailableOutings(state) {
  return state.outings.filter((o) => o.status === 'available');
}

export function getCompletedOutings(state) {
  return state.outings.filter((o) => o.status === 'completed');
}

export function getSelectedOuting(state) {
  return state.outings.find((o) => o.status === 'selected') || null;
}

// ---------- Desenho da roleta ----------
export function drawWheel(canvas, outings, rotation = 0) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 6;

  ctx.clearRect(0, 0, size, size);
  if (!outings.length) return;

  const slice = (Math.PI * 2) / outings.length;

  outings.forEach((outing, i) => {
    const start = rotation + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = CFG.colors[i % CFG.colors.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,180,200,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Nome ao longo do raio (abreviado para caber).
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e8dff0';
    ctx.font = `${Math.max(10, size / 34)}px 'DM Sans', sans-serif`;
    const label = outing.name.length > 14 ? `${outing.name.slice(0, 13)}…` : outing.name;
    ctx.fillText(label, radius - 10, 4);
    ctx.restore();
  });

  // Borda externa
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.strokeStyle = CFG.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
}

// ---------- Sorteio com animação ----------
// onResult recebe a experiência sorteada ao fim do giro.
export function spinWheel(canvas, onResult) {
  const state = getState();
  const available = getAvailableOutings(state);

  if (!available.length) {
    onResult(null);
    return;
  }

  const winnerIndex = Math.floor(Math.random() * available.length);
  const winner = available[winnerIndex];
  const slice = (Math.PI * 2) / available.length;

  // Alinha o meio da fatia vencedora com o ponteiro no topo (-90°).
  const targetAngle = -Math.PI / 2 - (winnerIndex + 0.5) * slice;
  const turns = CFG.minTurns + Math.random() * 2;
  const finalRotation = targetAngle + turns * Math.PI * 2;

  const start = performance.now();
  const duration = CFG.spinDurationMs;

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    // ease-out cúbico: giro rápido que desacelera suavemente.
    const eased = 1 - Math.pow(1 - t, 3);
    drawWheel(canvas, available, finalRotation * eased);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // Marca como selecionada (ainda não realizada).
      updateOuting(winner.id, { status: 'selected' });
      onResult(winner);
    }
  }

  requestAnimationFrame(frame);
}

// Registra a experiência sorteada como realizada.
export function completeOuting(outingId, notes = '', rating = null) {
  const state = getState();
  const current = getCurrentMonthNumber(state.financial);
  const today = new Date().toISOString().slice(0, 10);

  updateOuting(outingId, { status: 'completed', month: current, date: today, notes });

  const outing = state.outings.find((o) => o.id === outingId);
  addHistoryEntry({
    outingId,
    name: outing?.name || '',
    month: current,
    date: today,
    notes,
    rating,
  });
}

// Desfaz uma seleção (volta a experiência para disponível).
export function cancelSelection(outingId) {
  updateOuting(outingId, { status: 'available' });
}
