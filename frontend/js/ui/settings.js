// Modal de configurações: edição da meta, tema, export/import e reset.
import { getState, updateSettings, updateFinancial, resetState, exportState, importState } from '../state/state.js';
import { importState as parseBackup } from '../state/storage.js';
import { showToast, confirmAction } from './feedback.js';

let modal = null;
let form = null;

export function initSettings() {
  modal = document.getElementById('settings-modal');
  form = document.getElementById('settings-form');

  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeSettings);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeSettings();
  });

  form.addEventListener('submit', handleSubmit);

  document.getElementById('export-data').addEventListener('click', () => {
    exportState();
    showToast('Backup exportado com sucesso.', 'success');
  });

  document.getElementById('import-data-input').addEventListener('change', handleImport);

  document.getElementById('reset-project').addEventListener('click', () => {
    if (!confirmAction('Tem certeza? Todos os dados do projeto serão apagados. Considere exportar um backup antes.')) return;
    resetState();
    closeSettings();
    showToast('Projeto resetado. Uma nova jornada começa.', 'love');
    location.reload();
  });
}

export function openSettings() {
  const { settings, financial } = getState();
  form.elements.metaTotal.value = financial.metaTotal;
  form.elements.valorInicial.value = financial.valorInicial;
  form.elements.startMonth.value = financial.startMonth;
  form.elements.totalMeses.value = financial.totalMeses;
  form.elements.valorMensalPlanejado.value = financial.valorMensalPlanejado;
  form.elements.theme.value = settings.theme;
  modal.hidden = false;
  form.elements.metaTotal.focus();
}

function closeSettings() {
  modal.hidden = true;
}

function handleSubmit(e) {
  e.preventDefault();
  const data = new FormData(form);

  const metaTotal = Number(data.get('metaTotal'));
  const totalMeses = Number(data.get('totalMeses'));
  if (metaTotal <= 0 || totalMeses <= 0) {
    showToast('Verifique os valores: meta e duração devem ser maiores que zero.', 'error');
    return;
  }

  updateFinancial({
    metaTotal,
    valorInicial: Number(data.get('valorInicial')) || 0,
    startMonth: data.get('startMonth'),
    totalMeses,
    valorMensalPlanejado: Number(data.get('valorMensalPlanejado')) || 0,
  });
  updateSettings({ theme: data.get('theme') });

  closeSettings();
  showToast('✓ Configurações salvas com sucesso', 'success');
  location.hash === '#/meta' ? window.dispatchEvent(new HashChangeEvent('hashchange')) : null;
}

async function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = await parseBackup(file);
    if (!confirmAction('Importar este backup substituirá todos os dados atuais. Continuar?')) return;
    importState(data);
    closeSettings();
    showToast('Backup importado com sucesso.', 'success');
    location.reload();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    e.target.value = '';
  }
}
