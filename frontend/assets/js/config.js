export const CONFIG = {
    API_URL: "http://localhost:5000/api/v1",
    DEBOUNCE_DELAY: 300,
    TASK_STATUS: {
        PENDING: "pending",
        IN_PROGRESS: "in_progress",
        COMPLETED: "completed"
    },
    TRANSLATIONS: {
        status: {
            pending: "Pendiente",
            in_progress: "En Progreso",
            completed: "Completada"
        },
        priority: {
            low: "Baja",
            medium: "Media",
            high: "Alta"
        }
    }
};
