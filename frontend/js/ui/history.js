// Página Nossa História: timeline de memórias com filtros por ano.
import { getState } from '../state/state.js';
import { APP_CONFIG } from '../../config/app.config.js';

const FILTERS = ['Todos', '2026', '2027', '2028'];
let activeFilter = 'Todos';

export function renderHistory(root) {
  const state = getState();
  paintFilters(root);
  paintTimeline(root, state);
}

function paintFilters(root) {
  const row = root.querySelector('#history-filters');
  row.innerHTML = FILTERS
    .map(
      (f) => `
      <button class="filter-chip ${f === activeFilter ? 'is-active' : ''}"
              data-filter="${f}" type="button" aria-pressed="${f === activeFilter}">
        ${f}
      </button>`
    )
    .join('');

  row.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      renderHistory(root.closest('.view-container') || document.getElementById('view-container'));
    });
  });
}

function paintTimeline(root, state) {
  const container = root.querySelector('#history-timeline');

  let entries = [...state.history].sort((a, b) => (a.date < b.date ? 1 : -1));
  if (activeFilter !== 'Todos') {
    entries = entries.filter((e) => e.date?.startsWith(activeFilter));
  }

  if (!entries.length) {
    container.innerHTML = `
      <div class="empty">
        <p>Nenhuma memória por aqui ainda.</p>
        <p style="margin-top:8px;">Girem a roleta em <a href="#/saidas">Nossas Saídas</a> e comecem a escrever essa história ♥</p>
      </div>`;
    return;
  }

  container.innerHTML = entries
    .map((e) => {
      const [year, monthNum] = (e.date || '').split('-').map(Number);
      const monthLabel = year
        ? `${APP_CONFIG.monthNames[monthNum - 1]} ${year}`.toUpperCase()
        : `MÊS ${String(e.month).padStart(2, '0')}`;
      const stars = e.rating ? `<p class="history-entry__rating">${'★'.repeat(e.rating)}${'☆'.repeat(5 - e.rating)}</p>` : '';
      const note = e.notes ? `<p class="history-entry__note">${e.notes}</p>` : '';

      return `
        <article class="history-entry">
          <p class="history-entry__month">${monthLabel}</p>
          <h3 class="history-entry__name">${e.name}</h3>
          ${note}${stars}
        </article>`;
    })
    .join('');
}
