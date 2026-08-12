// Toasts e confirmações — feedback visual compartilhado por todas as páginas.
const region = () => document.getElementById('toast-region');

export function showToast(message, type = 'success', durationMs = 3600) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  region().appendChild(toast);

  setTimeout(() => {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, durationMs);
}

// Confirmação nativa com mensagem clara (usada antes de ações destrutivas).
export function confirmAction(message) {
  return window.confirm(message);
}
