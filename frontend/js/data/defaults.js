// Estado inicial do projeto — fonte única de verdade.
// Contrato (docs/arquitetura.md):
//   settings:  { theme }
//   financial: { metaTotal, valorInicial, valorMensalPlanejado, startMonth, totalMeses }

import { OUTINGS } from './outings.js';
import { ACHIEVEMENTS } from './achievements.js';

const DEFAULT_FINANCIAL = {
  metaTotal: 60000,
  valorInicial: 0,
  valorMensalPlanejado: 2000,
  startMonth: '2026-01',   // formato 'AAAA-MM'
  totalMeses: 24,
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
};

export function buildDefaultMonths(financial = DEFAULT_FINANCIAL) {
  const [startYear, startMonth] = financial.startMonth.split('-').map(Number);
  return Array.from({ length: financial.totalMeses }, (_, i) => {
    // new Date(ano, indiceMes, dia) usa horário LOCAL — sem bug de fuso
    const date = new Date(startYear, startMonth - 1 + i, 1);
    return {
      number: i + 1,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      planned: financial.valorMensalPlanejado,
      saved: null,
      note: '',
      outingId: null,
    };
  });
}

export function buildDefaultOutings() {
  return OUTINGS.map((o) => ({
    status: 'available',
    month: null,
    date: null,
    notes: '',
    ...o,
  }));
}

export function buildDefaultAchievements() {
  return ACHIEVEMENTS.map((a) => ({
    id: a.id,
    unlocked: false,
    unlockedAt: null,
  }));
}

export function buildDefaultState() {
  const financial = { ...DEFAULT_FINANCIAL };
  return {
    settings: { ...DEFAULT_SETTINGS },
    financial,
    months: buildDefaultMonths(financial),
    outings: buildDefaultOutings(),
    achievements: buildDefaultAchievements(),
    history: [],
  };
}