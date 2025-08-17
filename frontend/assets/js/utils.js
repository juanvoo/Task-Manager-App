// frontend/assets/js/utils.js

// Función para mostrar/ocultar el spinner de carga
export function showLoading(show = true) {
  const loader = document.getElementById('loading');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

export function hideLoading() {
  showLoading(false);
}

// Función para mostrar mensajes toast (simple)
export function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    // Si no existe el contenedor, crearlo
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '4px';
  toast.style.color = '#fff';
  toast.style.fontSize = '14px';
  toast.style.maxWidth = '300px';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-10px)';
  toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#28a745';
      break;
    case 'error':
      toast.style.backgroundColor = '#dc3545';
      break;
    case 'warning':
      toast.style.backgroundColor = '#ffc107';
      toast.style.color = '#000';
      break;
    default:
      toast.style.backgroundColor = '#007bff';
  }

  const container = document.getElementById('toast-container');
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
}

// Función para escapar HTML y prevenir inyección
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Función para formatear fecha
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Función para mostrar un modal
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    modal.classList.add('show');
  }
}

// Función para cerrar un modal
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
  }
}

// Funciones para mostrar/ocultar la app principal
export function showApp() {
  document.getElementById('app').style.display = 'block';
}

export function hideApp() {
  document.getElementById('app').style.display = 'none';
}

// Función para mostrar el modal de autenticación
export function showAuthModal() {
  showModal('authModal');
}

export { showLoading, hideLoading, showToast };