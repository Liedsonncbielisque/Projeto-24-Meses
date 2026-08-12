// Projeções financeiras — sem acesso ao DOM.
import { getTotalSaved, getRealMonthlyAverage, getMonthsRemaining, getCurrentMonthNumber } from './financial.js';

// Se a média mensal real continuar, onde chegamos ao fim dos 24 meses?
export function projectFinalAmount(state) {
  const saved = getTotalSaved(state);
  const avg = getRealMonthlyAverage(state);
  const monthsLeft = getMonthsRemaining(state);
  return saved + avg * monthsLeft;
}

// Diferença entre a projeção no ritmo atual e a meta.
export function projectDifference(state) {
  return projectFinalAmount(state) - state.financial.metaTotal;
}

// Estima em qual mês do projeto a meta será atingida no ritmo atual.
// Retorna null se o ritmo atual não alcança a meta dentro do prazo.
export function projectArrivalMonth(state) {
  const saved = getTotalSaved(state);
  const avg = getRealMonthlyAverage(state);
  if (avg <= 0) return null;

  const remaining = state.financial.metaTotal - saved;
  if (remaining <= 0) return getCurrentMonthNumber(state.financial);

  const monthsNeeded = Math.ceil(remaining / avg);
  const arrival = getCurrentMonthNumber(state.financial) + monthsNeeded;
  return arrival <= state.financial.totalMeses ? arrival : null;
}

export function calcProjection(state) {
  const projected = projectFinalAmount(state);
  const difference = projectDifference(state);
  return {
    projected,
    difference,
    arrivalMonth: projectArrivalMonth(state),
    onTrack: difference >= 0,
  };
}
