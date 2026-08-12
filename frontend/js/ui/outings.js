// Página Nossas Saídas: roleta, resultado e lista das 44 experiências.
import { getState } from '../state/state.js';
import {
  getAvailableOutings,
  getCompletedOutings,
  getSelectedOuting,
  drawWheel,
  spinWheel,
  completeOuting,
  cancelSelection,
} from '../features/roulette.js';
import { showToast } from './feedback.js';

let spinning = false;

export function renderOutings(root) {
  const state = getState();
  const canvas = root.querySelector('#wheel-canvas');

  sizeCanvas(canvas);
  paintStats(root, state);
  paintList(root, state);
  paintResult(root, state);

  // Desenha a roleta com as experiências disponíveis.
  drawWheel(canvas, getAvailableOutings(state));

  root.querySelector('#spin-button').addEventListener('click', () => {
    if (spinning) return;
    const available = getAvailableOutings(getState());
    if (!available.length) {
      showToast('Vocês já viveram todas as 44 experiências! 🏆', 'gold');
      return;
    }

    spinning = true;
    const btn = root.querySelector('#spin-button');
    btn.disabled = true;
    btn.textContent = 'Girando…';

    spinWheel(canvas, (winner) => {
      spinning = false;
      btn.disabled = false;
      btn.textContent = 'SORTEAR NOSSA SAÍDA';
      if (!winner) return;

      showToast('♥ Nossa escolha foi definida!', 'love');
      renderOutings(root); // repinta contadores, lista e resultado
      const nameEl = root.querySelector('.roulette-result__name');
      nameEl?.classList.add('is-revealed');
    });
  });

  root.querySelector('#complete-button')?.addEventListener('click', () => {
    const selected = getSelectedOuting(getState());
    if (!selected) return;
    completeOuting(selected.id);
    showToast('✦ Experiência registrada!', 'gold');
    renderOutings(root);
  });

  root.querySelector('#cancel-selection')?.addEventListener('click', () => {
    const selected = getSelectedOuting(getState());
    if (!selected) return;
    cancelSelection(selected.id);
    showToast('Escolha desfeita. A roleta está livre de novo.', 'success');
    renderOutings(root);
  });
}

function sizeCanvas(canvas) {
  // Resolução interna fixa; o CSS cuida do tamanho visual responsivo.
  canvas.width = 640;
  canvas.height = 640;
}

function paintStats(root, state) {
  const total = state.outings.length;
  const done = getCompletedOutings(state).length;
  root.querySelector('#stat-total').textContent = total;
  root.querySelector('#stat-done').textContent = done;
  root.querySelector('#stat-left').textContent = total - done;
}

function paintList(root, state) {
  root.querySelector('#outing-list').innerHTML = state.outings
    .map((o) => {
      const cls = o.status === 'completed' ? 'outing-chip--done' : o.status === 'selected' ? 'outing-chip--selected' : '';
      const mark = o.status === 'completed' ? '✓' : o.status === 'selected' ? '♥' : '';
      return `<div class="outing-chip ${cls}"><span>${o.name}</span><span aria-hidden="true">${mark}</span></div>`;
    })
    .join('');
}

function paintResult(root, state) {
  const selected = getSelectedOuting(state);
  const box = root.querySelector('#roulette-result');

  if (selected) {
    box.innerHTML = `
      <p class="roulette-result__label">♥ Nossa escolha</p>
      <p class="roulette-result__name">${selected.name}</p>
      <p class="roulette-result__text">Esse mês é dia de viver essa experiência.</p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:inherit;">
        <button class="btn btn--gold" id="complete-button" type="button">Registrar como realizada</button>
        <button class="btn btn--ghost" id="cancel-selection" type="button">Sortear de novo</button>
      </div>`;
  } else {
    box.innerHTML = `
      <p class="roulette-result__label">♥ Nossa escolha</p>
      <p class="roulette-result__name" style="color:var(--text-muted)">?</p>
      <p class="roulette-result__text">Girem a roleta para descobrir a próxima experiência de vocês.</p>`;
  }
}
