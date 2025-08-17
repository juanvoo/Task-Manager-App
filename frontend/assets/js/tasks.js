import CONFIG from './config.js';
import { debounce } from './utils.js';
import { showLoading, hideLoading, showToast } from './utils.js';

export class TaskManager {
  constructor(api, token, { showLoading, hideLoading, showToast }) {
    this.api = api;
    this.token = token;
    this.showLoading = showLoading;
    this.hideLoading = hideLoading;
    this.showToast = showToast;
    this.tasks = [];
    this.currentFilters = {};
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
      taskForm.addEventListener("submit", this.handleCreateTask.bind(this));
    }

    const editTaskForm = document.getElementById("editTaskForm");
    if (editTaskForm) {
      editTaskForm.addEventListener("submit", this.handleUpdateTask.bind(this));
    }

    const refreshBtn = document.getElementById("refreshTasks");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", this.loadTasks.bind(this));
    }

    const applyFiltersBtn = document.getElementById("applyFilters");
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener("click", this.applyFilters.bind(this));
    }

    const filterElements = ["statusFilter", "priorityFilter", "sortBy", "sortOrder"];
    filterElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("change", debounce(this.applyFilters.bind(this), CONFIG.DEBOUNCE_DELAY));
      }
    });
  }

  async loadTasks(filters = {}) {
    try {
      this.showLoading(true);
      const response = await this.api.get('/tasks', filters);
      this.tasks = response.tasks || [];
      this.renderTasks();
      this.updateStatistics();
    } catch (error) {
      console.error("Error loading tasks:", error);
      this.showToast("Error al cargar las tareas", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async handleCreateTask(e) {
    e.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    if (!title) {
      this.showToast("El título es obligatorio", "warning");
      return;
    }

    const taskData = {
      title,
      description: description || undefined,
      priority,
      due_date: dueDate || undefined,
    };

    try {
      this.showLoading(true);
      await this.api.post('/tasks', taskData);
      this.showToast("Tarea creada correctamente", "success");
      e.target.reset();
      await this.loadTasks(this.currentFilters);
    } catch (error) {
      console.error("Error creating task:", error);
      this.showToast(error.message || "Error al crear la tarea", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async handleUpdateTask(e) {
    e.preventDefault();

    const taskId = document.getElementById("editTaskId").value;
    const title = document.getElementById("editTaskTitle").value.trim();
    const description = document.getElementById("editTaskDescription").value.trim();
    const status = document.getElementById("editTaskStatus").value;
    const priority = document.getElementById("editTaskPriority").value;
    const dueDate = document.getElementById("editTaskDueDate").value;

    if (!title) {
      this.showToast("El título es obligatorio", "warning");
      return;
    }

    const taskData = {
      title,
      description: description || undefined,
      status,
      priority,
      due_date: dueDate || undefined,
    };

    try {
      this.showLoading(true);
      await this.api.put(`/tasks/${taskId}`, taskData);
      this.showToast("Tarea actualizada correctamente", "success");
      window.closeModal("editTaskModal");
      await this.loadTasks(this.currentFilters);
    } catch (error) {
      console.error("Error updating task:", error);
      this.showToast(error.message || "Error al actualizar la tarea", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async deleteTask(taskId) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      return;
    }

    try {
      this.showLoading(true);
      await this.api.delete(`/tasks/${taskId}`);
      this.showToast("Tarea eliminada correctamente", "success");
      await this.loadTasks(this.currentFilters);
    } catch (error) {
      console.error("Error deleting task:", error);
      this.showToast(error.message || "Error al eliminar la tarea", "error");
    } finally {
      this.showLoading(false);
    }
  }

  async toggleTaskStatus(taskId, currentStatus) {
    const newStatus =
      currentStatus === CONFIG.TASK_STATUS.COMPLETED
        ? CONFIG.TASK_STATUS.PENDING
        : CONFIG.TASK_STATUS.COMPLETED;

    try {
      await this.api.put(`/tasks/${taskId}`, { status: newStatus });
      const statusText = CONFIG.TRANSLATIONS.status[newStatus];
      this.showToast(`Tarea marcada como ${statusText.toLowerCase()}`, "success");
      await this.loadTasks(this.currentFilters);
    } catch (error) {
      console.error("Error toggling task status:", error);
      this.showToast("Error al cambiar el estado de la tarea", "error");
    }
  }

  openEditModal(task) {
    document.getElementById("editTaskId").value = task.id;
    document.getElementById("editTaskTitle").value = task.title;
    document.getElementById("editTaskDescription").value = task.description || "";
    document.getElementById("editTaskStatus").value = task.status;
    document.getElementById("editTaskPriority").value = task.priority;

    if (task.due_date) {
      const date = new Date(task.due_date);
      const formattedDate = date.toISOString().slice(0, 16);
      document.getElementById("editTaskDueDate").value = formattedDate;
    } else {
      document.getElementById("editTaskDueDate").value = "";
    }

    window.showModal("editTaskModal");
  }

  applyFilters() {
    const filters = {
      status: document.getElementById("statusFilter").value || undefined,
      priority: document.getElementById("priorityFilter").value || undefined,
      sort_by: document.getElementById("sortBy").value,
      order: document.getElementById("sortOrder").value,
    };

    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) delete filters[key];
    });

    this.currentFilters = filters;
    this.loadTasks(filters);
  }

  renderTasks() {
    const tasksList = document.getElementById("tasksList");
    if (!tasksList) return;

    if (this.tasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-tasks"></i>
          <h3>No hay tareas</h3>
          <p>Crea tu primera tarea para comenzar</p>
        </div>
      `;
      return;
    }

    tasksList.innerHTML = this.tasks.map((task) => this.renderTaskItem(task)).join("");
  }

  renderTaskItem(task) {
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const createdDate = new Date(task.created_at);
    const isOverdue = dueDate && dueDate < new Date() && task.status !== CONFIG.TASK_STATUS.COMPLETED;

    return `
      <div class="task-item ${isOverdue ? "overdue" : ""}" data-task-id="${task.id}">
        <div class="task-header">
          <h4 class="task-title">${escapeHtml(task.title)}</h4>
          <div class="task-actions">
            <button class="btn btn-sm btn-secondary" onclick="taskManager.openEditModal(${JSON.stringify(task).replace(/"/g, "&quot;")})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm ${task.status === CONFIG.TASK_STATUS.COMPLETED ? "btn-warning" : "btn-success"}" onclick="taskManager.toggleTaskStatus(${task.id}, '${task.status}')">
              <i class="fas ${task.status === CONFIG.TASK_STATUS.COMPLETED ? "fa-undo" : "fa-check"}"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="taskManager.deleteTask(${task.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="task-meta">
          <span class="badge badge-status-${task.status}">${CONFIG.TRANSLATIONS.status[task.status]}</span>
          <span class="badge badge-priority-${task.priority}">${CONFIG.TRANSLATIONS.priority[task.priority]}</span>
          ${isOverdue ? '<span class="badge badge-danger">Vencida</span>' : ""}
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ""}
        <div class="task-dates">
          <span><i class="fas fa-calendar-plus"></i> Creada: ${formatDate(createdDate)}</span>
          ${dueDate ? `<span><i class="fas fa-calendar-times"></i> Vence: ${formatDate(dueDate)}</span>` : ""}
          ${task.completed_at ? `<span><i class="fas fa-check-circle"></i> Completada: ${formatDate(new Date(task.completed_at))}</span>` : ""}
        </div>
      </div>
    `;
  }

  updateStatistics() {
    const stats = this.calculateStatistics();
    document.getElementById("totalTasks").textContent = stats.total;
    document.getElementById("completedTasks").textContent = stats.completed;
    document.getElementById("pendingTasks").textContent = stats.pending;
    document.getElementById("inProgressTasks").textContent = stats.inProgress;
  }

  calculateStatistics() {
    return {
      total: this.tasks.length,
      completed: this.tasks.filter((t) => t.status === CONFIG.TASK_STATUS.COMPLETED).length,
      pending: this.tasks.filter((t) => t.status === CONFIG.TASK_STATUS.PENDING).length,
      inProgress: this.tasks.filter((t) => t.status === CONFIG.TASK_STATUS.IN_PROGRESS).length,
    };
  }
}