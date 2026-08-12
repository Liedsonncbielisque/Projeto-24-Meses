// Bootstrap do app: carrega estado, registra rotas e liga a navegação.
import { loadState, saveState, resetState, subscribe } from './state/state.js';
import { renderDashboard } from './ui/dashboard.js';
import { renderOutings } from './ui/outings.js';
import { renderMeta } from './ui/meta.js';
import { renderHistory } from './ui/history.js';
import { calcFinancialSummary } from './calculations/financial.js';
import { showToast } from './ui/feedback.js';
import { initSettings, openSettings } from './ui/settings.js';

const routes = {
  '/inicio':   { view: 'frontend/views/dashboard.html', render: renderDashboard },
  '/saidas':   { view: 'frontend/views/outings.html',   render: renderOutings },
  '/meta':     { view: 'frontend/views/meta.html',      render: renderMeta },
  '/historia': { view: 'frontend/views/history.html',   render: renderHistory },
};

const viewContainer = document.getElementById('view-container');
const viewCache = new Map();
let currentRoute = null;

async function loadView(route) {
  if (viewCache.has(route)) return viewCache.get(route);
  const res = await fetch(routes[route].view);
  if (!res.ok) throw new Error(`Falha ao carregar ${routes[route].view}`);
  const html = await res.text();
  viewCache.set(route, html);
  return html;
}

function routeFromHash() {
  const hash = location.hash.replace('#', '');
  return routes[hash] ? hash : '/inicio';
}

function setActiveNav(route) {
  document.querySelectorAll('.nav-link[data-route]').forEach((link) => {
    const active = link.dataset.route === route;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateSidebarSummary(state) {
  const summary = calcFinancialSummary(state);
  const bar = document.getElementById('sidebar-progress');
  bar.style.width = `${summary.journeyPercent}%`;
  document.getElementById('sidebar-percent').textContent = `${summary.journeyPercent}%`;
  document.getElementById('sidebar-month').textContent = `Mês ${summary.currentMonth} / ${state.settings.totalMonths}`;
}

async function navigate() {
  const route = routeFromHash();
  currentRoute = route;
  setActiveNav(route);
  closeSidebar();

  viewContainer.classList.add('view--leaving');
  try {
    const html = await loadView(route);
    viewContainer.innerHTML = html;
    routes[route].render(viewContainer);
  } catch (err) {
    console.error(err);
    viewContainer.innerHTML = '<p class="view-error">Não foi possível carregar esta página.</p>';
  }
  viewContainer.classList.remove('view--leaving');
  viewContainer.classList.add('view--entered');
  viewContainer.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

// ---------- Sidebar mobile ----------
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
const hamburger = document.getElementById('hamburger');

function openSidebar() {
  sidebar.classList.add('is-open');
  overlay.hidden = false;
  hamburger.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  sidebar.classList.remove('is-open');
  overlay.hidden = true;
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
});
overlay.addEventListener('click', closeSidebar);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

// ---------- Inicialização ----------
function init() {
  const state = loadState();
  initSettings(state);

  subscribe((newState) => {
    saveState(newState);
    updateSidebarSummary(newState);
  });

  updateSidebarSummary(state);
  document.getElementById('open-settings').addEventListener('click', () => {
    closeSidebar();
    openSettings();
  });

  window.addEventListener('hashchange', navigate);
  navigate();

  if (!localStorage.getItem('nosso-projeto-24m-welcomed')) {
    showToast('Bem-vindos à jornada de vocês ♥', 'love');
    localStorage.setItem('nosso-projeto-24m-welcomed', '1');
  }
}

init();
