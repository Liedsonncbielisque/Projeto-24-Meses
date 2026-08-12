// Página Meta 24 Meses: edição do planejamento, timeline e registro mensal.
import { getState, updateFinancial, recordMonth } from '../state/state.js';
import { calcFinancialSummary, formatBRL, formatSigned } from '../calculations/financial.js';
import { buildTimeline } from '../features/timeline.js';
import { renderPlannedVsActualChart, renderCumulativeChart } from '../charts/charts.js';
import { showToast } from './feedback.js';

let selectedMonth = null;

export function renderMeta(root) {
  const state = getState();
  const s = calcFinancialSummary(state);

  root.querySelector('#meta-total').textContent = formatBRL(state.financial.metaTotal);
  root.querySelector('#meta-summary').textContent =
    `${s.percent.toFixed(1).replace('.', ',')}% concluído · faltam ${formatBRL(s.remaining)}`;

  paintTimeline(root, state);
  renderPlannedVsActualChart(root.querySelector('#chart-planned-actual'), state.months);
  renderCumulativeChart(root.querySelector('#chart-cumulative'), state.months, state.financial.valorInicial);

  wireMetaForm(root, state);
  wireMonthForm(root, state);
}

// ---------- Formulário da meta ----------
function wireMetaForm(root, state) {
  const form = root.querySelector('#meta-form');
  form.elements.metaTotal.value = state.financial.metaTotal;
  form.elements.valorInicial.value = state.financial.valorInicial;
  form.elements.startMonth.value = state.financial.startMonth;
  form.elements.totalMeses.value = state.financial.totalMeses;
  form.elements.valorMensalPlanejado.value = state.financial.valorMensalPlanejado;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const metaTotal = Number(data.get('metaTotal'));
    const totalMeses = Number(data.get('totalMeses'));
    if (metaTotal <= 0 || totalMeses <= 0) {
      showToast('Meta e duração devem ser maiores que zero.', 'error');
      return;
    }
    updateFinancial({
      metaTotal,
      valorInicial: Number(data.get('valorInicial')) || 0,
      startMonth: data.get('startMonth'),
      totalMeses,
      valorMensalPlanejado: Number(data.get('valorMensalPlanejado')) || 0,
    });
    showToast('✓ Meta atualizada com sucesso', 'success');
    renderMeta(root);
  }, { once: true });
}

// ---------- Timeline ----------
function paintTimeline(root, state) {
  const timeline = buildTimeline(state);
  const list = root.querySelector('#month-timeline');

  list.innerHTML = timeline
    .map((m) => {
      const badgeClass = { future: 'badge--future', current: 'badge--current', done: 'badge--done', above: 'badge--above', below: 'badge--below' }[m.status];
      const savedText = m.saved !== null && m.saved !== undefined
        ? `${formatBRL(m.saved)} <small>planejado ${formatBRL(m.planned)}${m.difference !== null ? ` · ${formatSigned(m.difference)}` : ''}</small>`
        : `<small>planejado ${formatBRL(m.planned)}</small>`;
      const experience = m.experience ? `<p class="timeline-item__note">♥ ${m.experience}</p>` : '';
      const note = m.note ? `<p class="timeline-item__note">“${m.note}”</p>` : '';

      return `
        <li class="timeline-item ${m.status === 'current' ? 'timeline-item--current' : ''}"
            data-month="${m.number}" tabindex="0" role="button"
            aria-label="Registrar mês ${m.number} (${m.monthName} de ${m.year})">
          <div>
            <span class="timeline-item__num">MÊS ${String(m.number).padStart(2, '0')}</span>
            <span class="timeline-item__date">${m.monthName} ${m.year}</span>
          </div>
          <div class="timeline-item__values">${savedText}</div>
          <span class="badge ${badgeClass}">${m.statusLabel}</span>
          ${experience}${note}
        </li>`;
    })
    .join('');

  list.querySelectorAll('.timeline-item').forEach((item) => {
    const open = () => openMonthForm(root, state, Number(item.dataset.month));
    item.addEventListener('click', open);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}

// ---------- Registro mensal ----------
function openMonthForm(root, state, monthNumber) {
  selectedMonth = monthNumber;
  const month = state.months.find((m) => m.number === monthNumber);
  const panel = root.querySelector('#month-record');
  const form = root.querySelector('#month-form');

  root.querySelector('#month-record-title').textContent =
    `Mês ${String(month.number).padStart(2, '0')} — ${monthName(month)}`;
  form.elements.planned.value = month.planned;
  form.elements.saved.value = month.saved ?? '';
  form.elements.note.value = month.note || '';

  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  form.elements.saved.focus();
}

function wireMonthForm(root, state) {
  const form = root.querySelector('#month-form');
  const panel = root.querySelector('#month-record');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (selectedMonth === null) return;
    const data = new FormData(form);
    const saved = data.get('saved');
    const planned = data.get('planned');

    if (saved !== '' && Number(saved) < 0) {
      showToast('O valor guardado não pode ser negativo.', 'error');
      return;
    }

    recordMonth(selectedMonth, {
      planned: planned === '' ? undefined : Number(planned),
      saved: saved === '' ? null : Number(saved),
      note: data.get('note').trim(),
    });

    showToast('✓ Valor salvo com sucesso', 'success');
    panel.hidden = true;
    selectedMonth = null;
    renderMeta(root);
  }, { once: true });

  root.querySelector('#month-cancel').addEventListener('click', () => {
    panel.hidden = true;
    selectedMonth = null;
  }, { once: true });
}

function monthName(month) {
  const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${names[month.month - 1]}/${month.year}`;
}
