// Camada de persistência. Hoje usa localStorage; a assinatura das funções
// permite trocar por Supabase/PostgreSQL/Firebase/API sem tocar no restante do app.
import { APP_CONFIG } from '../../config/app.config.js';

const KEY = APP_CONFIG.storageKey;

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Falha ao salvar estado:', err);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Falha ao carregar estado:', err);
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}

// Gera o arquivo de backup JSON para download.
export function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = APP_CONFIG.backupFileName;
  a.click();
  URL.revokeObjectURL(url);
}

// Lê um arquivo JSON de backup e retorna o objeto validado.
export function importState(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object' || !data.financial) {
          reject(new Error('Arquivo de backup inválido.'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Não foi possível ler o arquivo. Verifique se é um JSON válido.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsText(file);
  });
}
