// Página Início: cards de resumo, evolução, projeção, próxima saída e conquistas.
import { getState, unlockAchievement } from '../state/state.js';
import { calcFinancialSummary, formatBRL, formatSigned } from '../calculations/financial.js';
import { calcProjection } from '../calculations/projections.js';
import { getSelectedOuting, getAvailableOutings } from '../features/roulette.js';
import { evaluateAchievements, getAchievementList, getAchievementProgress } from '../features/achievements.js';
import { renderPaceChart } from '../charts/charts.js';
import { showToast } from './feedback.js';

export function renderDashboard(root) {
  const state = getState();
  checkNewAchievements(state);
  paint(root, state);
}

// Desbloqueia conquistas pendentes e avisa com toast.
function checkNewAchievements(state) {
  evaluateAchievements(state).forEach((a) => {
    unlockAchievement(a.id);
    showToast(`${a.icon} Conquista desbloqueada: ${a.title}`, 'gold', 5000);
  });
}

function paint(root, state) {
  const s = calcFinancialSummary(state);
  const proj = calcProjection(state);
  const { financial } = state;

  setText(root, 'dash-month', String(s.currentMonth).padStart(2, '0'));
  setText(root, 'dash-month-total', `de ${financial.totalMeses}`);
  setText(root, 'dash-saved', formatBRL(s.totalSaved));
  setText(root, 'dash-saved-month', `+ ${formatBRL(s.savedThisMonth)} este mês`);
  setText(root, 'dash-goal', formatBRL(financial.metaTotal));
  setText(root, 'dash-goal-percent', `${s.percent.toFixed(2).replace('.', ',')}% concluído`);
  setText(root, 'dash-remaining', formatBRL(s.remaining));

  // Evolução
  setText(root, 'evo-saved', formatBRL(s.totalSaved));
  setText(root, 'evo-goal', `de ${formatBRL(financial.metaTotal)}`);
  setText(root, 'evo-percent', `${s.percent.toFixed(2).replace('.', ',')}%`);
  setText(root, 'evo-missing', `Faltam ${formatBRL(s.remaining)}`);
  root.querySelector('#evo-bar').style.width = `${Math.min(s.percent, 100)}%`;

  // Métricas
  setText(root, 'metric-avg', formatBRL(s.realAverage));
  setText(root, 'metric-needed', formatBRL(s.requiredMonthly));
  setText(root, 'metric-months-left', String(s.monthsRemaining));
  setText(root, 'metric-arrival', proj.arrivalMonth ? `Mês ${proj.arrivalMonth}` : 'Fora do prazo');

  // Projeção
  setText(root, 'proj-current', formatBRL(proj.projected));
  setText(root, 'proj-goal', formatBRL(financial.metaTotal));
  const diffEl = root.querySelector('#proj-diff');
  diffEl.textContent = formatSigned(proj.difference);
  diffEl.classList.toggle('metric__value--green', proj.onTrack);
  diffEl.classList.toggle('metric__value--rose', !proj.onTrack);

  // Próxima experiência
  const selected = getSelectedOuting(state);
  const nextBox = root.querySelector('#next-outing');
  if (selected) {
    nextBox.querySelector('.next-outing__name').textContent = selected.name;
    nextBox.querySelector('.next-outing__text').textContent = 'Esse mês é dia de viver essa experiência.';
  } else if (getAvailableOutings(state).length) {
    nextBox.querySelector('.next-outing__name').textContent = 'Ainda um mistério ♥';
    nextBox.querySelector('.next-outing__text').textContent = 'Girem a roleta e descubram a próxima saída.';
  } else {
    nextBox.querySelector('.next-outing__name').textContent = 'Todas vividas!';
    nextBox.querySelector('.next-outing__text').textContent = 'Vocês completaram todas as 44 experiências.';
  }

  // Conquistas
  const list = getAchievementList(state);
  const progress = getAchievementProgress(state);
  setText(root, 'ach-progress', `${progress.unlocked} de ${progress.total} conquistas desbloqueadas`);
  root.querySelector('#achievement-list').innerHTML = list
    .map(
      (a) => `
      <li class="${a.unlocked ? '' : 'is-locked'}">
        <span class="ach-icon" aria-hidden="true">${a.unlocked ? a.icon : '🔒'}</span>
        <span>${a.title}</span>
      </li>`
    )
    .join('');

  // Citação do mês
  setText(root, 'quote-month', `Mês ${String(s.currentMonth).padStart(2, '0')}`);

  renderPaceChart(root.querySelector('#pace-chart'), state, s);
}

function setText(root, id, value) {
  const el = root.querySelector(`#${id}`);
  if (el) el.textContent = value;
}
