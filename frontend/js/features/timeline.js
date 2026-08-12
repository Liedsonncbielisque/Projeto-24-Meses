// Monta o modelo da timeline dos meses: status, diferença e experiência vinculada.
import { getMonthStatus, getCurrentMonthNumber, MONTH_STATUS_LABEL } from '../calculations/financial.js';
import { APP_CONFIG } from '../../config/app.config.js';

export function buildTimeline(state) {
  const current = getCurrentMonthNumber(state.financial);

  return state.months.map((m) => {
    const status = getMonthStatus(m, current);
    const difference = m.saved !== null && m.saved !== undefined ? m.saved - m.planned : null;
    const experience = state.outings.find(
      (o) => o.id === m.outingId || (o.status === 'completed' && o.month === m.number)
    );

    return {
      ...m,
      status,
      statusLabel: MONTH_STATUS_LABEL[status],
      difference,
      experience: experience?.name || null,
      monthName: APP_CONFIG.monthNames[m.month - 1],
    };
  });
}
