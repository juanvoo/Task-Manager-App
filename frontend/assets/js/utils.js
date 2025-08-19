// Función para debouncing
export function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Función simple para formatear fechas
export function formatDate(date) {
    return date.toLocaleString();
}

// Escape de HTML para prevenir XSS
export function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[m]));
}
