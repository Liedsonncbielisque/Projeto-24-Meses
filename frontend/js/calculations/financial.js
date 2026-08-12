// Cálculos financeiros puros — sem acesso ao DOM.
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const brl2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatBRL(value) {
  return brl.format(Math.round(value || 0));
}

export function formatBRLExact(value) {
  return brl2.format(value || 0);
}

export function formatSigned(value) {
  const abs = formatBRL(Math.abs(value));
  return value >= 0 ? `+ ${abs}` : `− ${abs}`;
}

// Mês atual do projeto (1..totalMeses), derivado do mês de início.
export function getCurrentMonthNumber(financial) {
  const [startYear, startMonth] = financial.startMonth.split('-').map(Number);
  const now = new Date();
  const elapsed = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth) + 1;
  return Math.min(Math.max(elapsed, 1), financial.totalMeses);
}

// Total guardado = valor inicial + soma dos valores registrados nos meses.
export function getTotalSaved(state) {
  const fromMonths = state.months.reduce((sum, m) => sum + (m.saved || 0), 0);
  return state.financial.valorInicial + fromMonths;
}

export function getRemaining(state) {
  return Math.max(state.financial.metaTotal - getTotalSaved(state), 0);
}

export function getPercent(state) {
  const total = getTotalSaved(state);
  return state.financial.metaTotal > 0 ? (total / state.financial.metaTotal) * 100 : 0;
}

export function getMonthsRemaining(state) {
  return Math.max(state.financial.totalMeses - getCurrentMonthNumber(state.financial), 0);
}

// Valor necessário por mês para bater a meta.
export function getRequiredMonthly(state) {
  const remaining = getRemaining(state);
  const monthsLeft = getMonthsRemaining(state);
  return monthsLeft > 0 ? remaining / monthsLeft : 0;
}

// Média mensal real considerando apenas meses com registro.
export function getRealMonthlyAverage(state) {
  const recorded = state.months.filter((m) => m.saved !== null && m.saved !== undefined);
  if (!recorded.length) return 0;
  const sum = recorded.reduce((acc, m) => acc + m.saved, 0);
  return sum / recorded.length;
}

// Guardado no mês corrente do projeto.
export function getSavedThisMonth(state) {
  const current = getCurrentMonthNumber(state.financial);
  const month = state.months.find((m) => m.number === current);
  return month?.saved || 0;
}

// Resumo completo usado por dashboard, sidebar e conquistas.
export function calcFinancialSummary(state) {
  const totalSaved = getTotalSaved(state);
  const remaining = getRemaining(state);
  const percent = getPercent(state);
  const currentMonth = getCurrentMonthNumber(state.financial);
  const monthsRemaining = getMonthsRemaining(state);
  const requiredMonthly = getRequiredMonthly(state);
  const realAverage = getRealMonthlyAverage(state);
  const journeyPercent = Math.round((currentMonth / state.financial.totalMeses) * 100);

  return {
    totalSaved,
    remaining,
    percent,
    currentMonth,
    monthsRemaining,
    requiredMonthly,
    realAverage,
    savedThisMonth: getSavedThisMonth(state),
    journeyPercent,
    goalReached: totalSaved >= state.financial.metaTotal,
  };
}

// Status de um mês individual da timeline.
export function getMonthStatus(month, currentMonthNumber) {
  if (month.number > currentMonthNumber) return 'future';
  if (month.number === currentMonthNumber && (month.saved === null || month.saved === undefined)) return 'current';
  if (month.saved === null || month.saved === undefined) return 'current';
  if (month.saved >= month.planned) return 'above';
  return 'below';
}

export const MONTH_STATUS_LABEL = {
  future: '○ Futuro',
  current: '● Atual',
  done: '✓ Concluído',
  above: '✓ Acima da meta',
  below: '● Abaixo da meta',
};
