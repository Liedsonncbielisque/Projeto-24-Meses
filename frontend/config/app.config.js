// Configurações globais do aplicativo.
export const APP_CONFIG = {
  name: 'Nosso Projeto — 24 Meses',
  storageKey: 'nosso-projeto-24m',
  backupFileName: 'nosso-projeto-backup.json',
  version: 1,

  roulette: {
    spinDurationMs: 4200,
    minTurns: 5,
    colors: ['#2a2130', '#221a28', '#31253a', '#1d1622'],
    accent: '#e8b4c8',
    gold: '#e9c46a',
  },

  chart: {
    planned: '#8b7d9e',
    realized: '#e8b4c8',
    positive: '#4ade80',
    grid: 'rgba(255,255,255,0.06)',
    text: '#a99fb5',
  },

  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
};
