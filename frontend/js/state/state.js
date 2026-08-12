// Estado central do aplicativo + API de mutação.
// Nenhum módulo de UI mantém estado próprio: tudo passa por aqui.
import { buildDefaultState, buildDefaultMonths, buildDefaultOutings, buildDefaultAchievements } from '../data/defaults.js';
import * as storage from './storage.js';

let state = null;
const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn(state));
}

export function getState() {
  return state;
}

// Carrega do storage, valida e preenche defaults onde faltar.
export function loadState() {
  const stored = storage.loadState();
  const defaults = buildDefaultState();

  if (!stored || typeof stored !== 'object') {
    state = defaults;
    storage.saveState(state);
    return state;
  }

  state = {
    settings: { ...defaults.settings, ...(stored.settings || {}) },
    financial: { ...defaults.financial, ...(stored.financial || {}) },
    months: Array.isArray(stored.months) && stored.months.length ? stored.months : defaults.months,
    outings: Array.isArray(stored.outings) && stored.outings.length ? stored.outings : defaults.outings,
    achievements: Array.isArray(stored.achievements) && stored.achievements.length ? stored.achievements : defaults.achievements,
    history: Array.isArray(stored.history) ? stored.history : [],
  };

  applyTheme();
  return state;
}

export function saveState(nextState = state) {
  state = nextState;
  storage.saveState(state);
}

// ---------- Mutações ----------

export function updateSettings(patch) {
  state = { ...state, settings: { ...state.settings, ...patch } };
  applyTheme();
  emit();
}

// Atualiza configurações financeiras; regenera os meses se a estrutura mudar.
export function updateFinancial(patch) {
  const prev = state.financial;
  const next = { ...prev, ...patch };
  const structureChanged =
    patch.totalMeses !== undefined && patch.totalMeses !== prev.totalMeses ||
    patch.startMonth !== undefined && patch.startMonth !== prev.startMonth;

  let months = state.months;
  if (structureChanged) {
    const fresh = buildDefaultMonths(next);
    // Preserva registros já feitos sempre que o número do mês ainda existir.
    months = fresh.map((m) => {
      const existing = state.months.find((old) => old.number === m.number);
      return existing ? { ...m, saved: existing.saved, note: existing.note, outingId: existing.outingId } : m;
    });
  }

  state = { ...state, financial: next, months };
  emit();
}

// Registro mensal: valor guardado + observação de um mês específico.
export function recordMonth(monthNumber, { saved, note }) {
  const months = state.months.map((m) =>
    m.number === monthNumber
      ? { ...m, saved: saved === null || saved === '' ? null : Number(saved), note: note ?? m.note }
      : m
  );
  state = { ...state, months };
  emit();
}

export function updateOuting(id, patch) {
  const outings = state.outings.map((o) => (o.id === id ? { ...o, ...patch } : o));
  state = { ...state, outings };
  emit();
}

export function addHistoryEntry(entry) {
  state = { ...state, history: [...state.history, entry] };
  emit();
}

export function unlockAchievement(id) {
  const achievements = state.achievements.map((a) =>
    a.id === id && !a.unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
  );
  state = { ...state, achievements };
  emit();
}

export function resetState() {
  state = buildDefaultState();
  storage.clearState();
  storage.saveState(state);
  applyTheme();
  emit();
}

export function importState(data) {
  const defaults = buildDefaultState();
  state = {
    settings: { ...defaults.settings, ...(data.settings || {}) },
    financial: { ...defaults.financial, ...(data.financial || {}) },
    months: Array.isArray(data.months) && data.months.length ? data.months : buildDefaultMonths(),
    outings: Array.isArray(data.outings) && data.outings.length ? data.outings : buildDefaultOutings(),
    achievements: Array.isArray(data.achievements) && data.achievements.length ? data.achievements : buildDefaultAchievements(),
    history: Array.isArray(data.history) ? data.history : [],
  };
  storage.saveState(state);
  applyTheme();
  emit();
}

export function exportState() {
  return storage.exportState(state);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme || 'dark';
}
