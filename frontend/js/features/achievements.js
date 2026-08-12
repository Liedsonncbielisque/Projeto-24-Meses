// Avaliação automática de conquistas com base no estado atual.
import { ACHIEVEMENTS } from '../data/achievements.js';
import { calcFinancialSummary } from '../calculations/financial.js';

function buildContext(state) {
  const summary = calcFinancialSummary(state);
  return {
    completed: state.outings.filter((o) => o.status === 'completed').length,
    saved: summary.totalSaved,
    percent: summary.percent,
    currentMonth: summary.currentMonth,
    goalReached: summary.goalReached,
  };
}

const TESTS = {
  'primeiro-passo':  (c) => c.completed >= 1,
  'cinco-momentos':  (c) => c.completed >= 5,
  'dez-momentos':    (c) => c.completed >= 10,
  'vinte-momentos':  (c) => c.completed >= 20,
  'dez-mil':         (c) => c.saved >= 10000,
  'metade-da-meta':  (c) => c.percent >= 50,
  'um-ano':          (c) => c.currentMonth >= 12,
  'conseguimos':     (c) => c.goalReached,
};

// Retorna as definições das conquistas que passaram no teste
// mas ainda não foram marcadas como desbloqueadas no estado.
export function evaluateAchievements(state) {
  const ctx = buildContext(state);
  const unlockedIds = new Set(state.achievements.filter((a) => a.unlocked).map((a) => a.id));
  return ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id) && TESTS[a.id]?.(ctx));
}

// Lista completa mesclada para exibição (desbloqueadas e bloqueadas).
export function getAchievementList(state) {
  const byId = new Map(state.achievements.map((a) => [a.id, a]));
  return ACHIEVEMENTS.map((def) => ({
    ...def,
    unlocked: byId.get(def.id)?.unlocked || false,
    unlockedAt: byId.get(def.id)?.unlockedAt || null,
  }));
}

export function getAchievementProgress(state) {
  const unlocked = state.achievements.filter((a) => a.unlocked).length;
  return { unlocked, total: ACHIEVEMENTS.length };
}
