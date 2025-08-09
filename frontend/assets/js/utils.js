// Retrasar la ejecución de funciones
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar spinner con ID
export function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
}

// Ocultar spinner
export function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

// Muestra la app
export function showApp() {
    const app = document.getElementById('app');
    if (app) app.style.display = 'block';
}

// Oculta la app
export function hideApp() {
    const app = document.getElementById('app');
    if (app) app.style.display = 'none';
}

// Muestra login/registro
export function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'block';
}

// Buscar y ocultar modal por ID
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}