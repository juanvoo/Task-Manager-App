import { CONFIG } from './config.js';
import { debounce, formatDate, escapeHtml } from './utils.js';

export class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const taskForm = document.getElementById("taskForm");
        if (taskForm) taskForm.addEventListener("submit", this.handleCreateTask.bind(this));

        const editTaskForm = document.getElementById("editTaskForm");
        if (editTaskForm) editTaskForm.addEventListener("submit", this.handleUpdateTask.bind(this));

        const refreshBtn = document.getElementById("refreshTasks");
        if (refreshBtn) refreshBtn.addEventListener("click", () => this.loadTasks());

        const applyFiltersBtn = document.getElementById("applyFilters");
        if (applyFiltersBtn) applyFiltersBtn.addEventListener("click", () => this.applyFilters());

        ["statusFilter", "priorityFilter", "sortBy", "sortOrder"].forEach((id) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener("change", debounce(this.applyFilters.bind(this), CONFIG.DEBOUNCE_DELAY));
        });
    }

    async loadTasks(filters = {}) {
        try {
            const response = await window.api.getTasks(filters);
            this.tasks = response.tasks || [];
            this.renderTasks();
            this.updateStatistics();
        } catch (error) {
            console.error("Error cargando tareas:", error);
            alert("Error cargando tareas");
        }
    }

    async handleCreateTask(e) {
        e.preventDefault();
        const title = document.getElementById("taskTitle").value.trim();
        if (!title) return alert("El título es obligatorio");

        const taskData = {
            title,
            description: document.getElementById("taskDescription").value.trim() || undefined,
            priority: document.getElementById("taskPriority").value,
            due_date: document.getElementById("taskDueDate").value || undefined,
        };

        try {
            await window.api.createTask(taskData);
            console.log("Tarea creada");
            e.target.reset();
            this.loadTasks(this.currentFilters);
        } catch (error) {
            console.error("Error creando tarea:", error);
            alert("Error creando tarea");
        }
    }

    async handleUpdateTask(e) {
        e.preventDefault();
        const taskId = document.getElementById("editTaskId").value;
        const title = document.getElementById("editTaskTitle").value.trim();
        if (!title) return alert("El título es obligatorio");

        const taskData = {
            title,
            description: document.getElementById("editTaskDescription").value.trim() || undefined,
            status: document.getElementById("editTaskStatus").value,
            priority: document.getElementById("editTaskPriority").value,
            due_date: document.getElementById("editTaskDueDate").value || undefined,
        };

        try {
            await window.api.updateTask(taskId, taskData);
            console.log("Tarea actualizada");
            window.closeModal("editTaskModal");
            this.loadTasks(this.currentFilters);
        } catch (error) {
            console.error("Error actualizando tarea:", error);
            alert("Error actualizando tarea");
        }
    }

    async deleteTask(taskId) {
        if (!confirm("¿Seguro que quieres eliminar esta tarea?")) return;
        try {
            await window.api.deleteTask(taskId);
            console.log("Tarea eliminada");
            this.loadTasks(this.currentFilters);
        } catch (error) {
            console.error("Error eliminando tarea:", error);
            alert("Error eliminando tarea");
        }
    }

    async toggleTaskStatus(taskId, currentStatus) {
        const newStatus = currentStatus === CONFIG.TASK_STATUS.COMPLETED ? CONFIG.TASK_STATUS.PENDING : CONFIG.TASK_STATUS.COMPLETED;
        try {
            await window.api.updateTask(taskId, { status: newStatus });
            console.log(`Estado cambiado a ${newStatus}`);
            this.loadTasks(this.currentFilters);
        } catch (error) {
            console.error("Error cambiando estado:", error);
            alert("Error cambiando estado de la tarea");
        }
    }

    openEditModal(task) {
        document.getElementById("editTaskId").value = task.id;
        document.getElementById("editTaskTitle").value = task.title;
        document.getElementById("editTaskDescription").value = task.description || "";
        document.getElementById("editTaskStatus").value = task.status;
        document.getElementById("editTaskPriority").value = task.priority;
        document.getElementById("editTaskDueDate").value = task.due_date ? new Date(task.due_date).toISOString().slice(0,16) : "";
        window.showModal("editTaskModal");
    }

    applyFilters() {
        this.currentFilters = {
            status: document.getElementById("statusFilter").value || undefined,
            priority: document.getElementById("priorityFilter").value || undefined,
            sort_by: document.getElementById("sortBy").value,
            order: document.getElementById("sortOrder").value,
        };
        this.loadTasks(this.currentFilters);
    }

    renderTasks() {
        const tasksList = document.getElementById("tasksList");
        if (!tasksList) return;

        if (this.tasks.length === 0) {
            tasksList.innerHTML = `<div class="empty-state"><h3>No hay tareas</h3></div>`;
            return;
        }

        tasksList.innerHTML = this.tasks.map(task => `
            <div class="task-item" data-task-id="${task.id}">
                <h4>${escapeHtml(task.title)}</h4>
                <p>${escapeHtml(task.description || "")}</p>
                <span>${CONFIG.TRANSLATIONS.status[task.status]}</span>
                <span>${CONFIG.TRANSLATIONS.priority[task.priority]}</span>
                <button onclick="taskManager.openEditModal(${JSON.stringify(task).replace(/"/g,'&quot;')})">Editar</button>
                <button onclick="taskManager.toggleTaskStatus(${task.id}, '${task.status}')">Toggle</button>
                <button onclick="taskManager.deleteTask(${task.id})">Eliminar</button>
            </div>
        `).join("");
    }

    updateStatistics() {
        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.status === CONFIG.TASK_STATUS.COMPLETED).length,
            pending: this.tasks.filter(t => t.status === CONFIG.TASK_STATUS.PENDING).length,
            inProgress: this.tasks.filter(t => t.status === CONFIG.TASK_STATUS.IN_PROGRESS).length,
        };

        document.getElementById("totalTasks").textContent = stats.total;
        document.getElementById("completedTasks").textContent = stats.completed;
        document.getElementById("pendingTasks").textContent = stats.pending;
        document.getElementById("inProgressTasks").textContent = stats.inProgress;
    }
}
