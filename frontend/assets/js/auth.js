console.log("✅ App.js cargando...")

// Aplicación principal
class TaskManagerApp {
  constructor() {
    this.init()
  }

  async init() {
    // Verificar autenticación al cargar la página
    if (window.auth.isAuthenticated()) {
      await this.loadApp()
    } else {
      this.showLogin()
    }

    // Configurar event listeners globales
    this.setupGlobalEventListeners()
  }

  async loadApp() {
    try {
      window.showLoading(true)

      // Mostrar aplicación
      window.showApp()
      window.closeModal("authModal")

      // Cargar datos del usuario
      await this.loadUserData()

      // Cargar tareas iniciales
      await window.taskManager.loadTasks()
    } catch (error) {
      console.error("Error loading app:", error)
      window.showToast("Error al cargar la aplicación", "error")
      this.showLogin()
    } finally {
      window.showLoading(false)
    }
  }

  showLogin() {
    window.hideApp()
    window.showAuthModal()
  }

  async loadUserData() {
    try {
      const user = window.auth.getCurrentUser()
      if (!user) return

      // Actualizar UI con datos del usuario
      const welcomeElement = document.getElementById("userWelcome")
      if (welcomeElement) {
        const displayName = user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.username
        welcomeElement.textContent = `Bienvenido, ${displayName}`
      }

      // Cargar estadísticas del usuario si están disponibles
      try {
        const userProfile = await window.api.getUserProfile(user.id)
        if (userProfile.user.statistics) {
          this.updateUserStatistics(userProfile.user.statistics)
        }
      } catch (error) {
        console.warn("Could not load user statistics:", error)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  updateUserStatistics(stats) {
    // Actualizar estadísticas en la UI si están disponibles desde el backend
    if (stats.total_tasks !== undefined) {
      document.getElementById("totalTasks").textContent = stats.total_tasks
    }
    if (stats.completed_tasks !== undefined) {
      document.getElementById("completedTasks").textContent = stats.completed_tasks
    }
    if (stats.pending_tasks !== undefined) {
      document.getElementById("pendingTasks").textContent = stats.pending_tasks
    }
    if (stats.in_progress_tasks !== undefined) {
      document.getElementById("inProgressTasks").textContent = stats.in_progress_tasks
    }
  }

  setupGlobalEventListeners() {
    // Manejar errores de red globalmente
    window.addEventListener("online", () => {
      window.showToast("Conexión restaurada", "success")
    })

    window.addEventListener("offline", () => {
      window.showToast("Sin conexión a internet", "warning")
    })

    // Manejar cambios de tamaño de ventana
    window.addEventListener(
      "resize",
      window.debounce(() => {
        this.handleResize()
      }, 250),
    )

    // Manejar teclas de acceso rápido
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcuts(e)
    })

    // Prevenir pérdida de datos no guardados
    window.addEventListener("beforeunload", (e) => {
      // Aquí podrías verificar si hay cambios sin guardar
      // y mostrar una confirmación si es necesario
    })
  }

  handleResize() {
    // Ajustar UI según el tamaño de pantalla
    const isMobileView = window.isMobile()

    // Aquí puedes agregar lógica específica para responsive
    if (isMobileView) {
      // Ajustes para móvil
    } else {
      // Ajustes para desktop
    }
  }

  handleKeyboardShortcuts(e) {
    // Solo procesar shortcuts si no estamos en un input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return
    }

    // Ctrl/Cmd + N: Nueva tarea
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault()
      document.getElementById("taskTitle").focus()
    }

    // Ctrl/Cmd + R: Actualizar tareas
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
      e.preventDefault()
      window.taskManager.loadTasks(window.taskManager.currentFilters)
    }

    // Escape: Cerrar modales
    if (e.key === "Escape") {
      const openModals = document.querySelectorAll(".modal.show")
      openModals.forEach((modal) => {
        window.closeModal(modal.id)
      })
    }
  }

  // Método para exportar datos
  async exportData(format = "json") {
    try {
      window.showLoading(true)

      const tasks = window.taskManager.tasks
      if (tasks.length === 0) {
        window.showToast("No hay tareas para exportar", "warning")
        return
      }

      if (format === "json") {
        window.exportTasksToJSON(tasks)
      } else if (format === "csv") {
        window.exportTasksToCSV(tasks)
      }

      window.showToast(`Datos exportados en formato ${format.toUpperCase()}`, "success")
    } catch (error) {
      console.error("Error exporting data:", error)
      window.showToast("Error al exportar los datos", "error")
    } finally {
      window.showLoading(false)
    }
  }

  // Método para importar datos
  async importData(file) {
    try {
      window.showLoading(true)

      const text = await file.text()
      let tasks

      if (file.type === "application/json" || file.name.endsWith(".json")) {
        tasks = JSON.parse(text)
      } else {
        window.showToast("Formato de archivo no soportado", "error")
        return
      }

      // Validar estructura de datos
      if (!Array.isArray(tasks)) {
        window.showToast("Formato de datos inválido", "error")
        return
      }

      // Importar tareas (esto requeriría una API endpoint específica)
      window.showToast("Función de importación en desarrollo", "info")
    } catch (error) {
      console.error("Error importing data:", error)
      window.showToast("Error al importar los datos", "error")
    } finally {
      window.showLoading(false)
    }
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM cargado, inicializando aplicación...")

  // Crear instancia global de la aplicación
  window.app = new TaskManagerApp()

  // Configurar service worker si está disponible
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration)
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error)
      })
  }
})

// Manejar errores no capturados
window.addEventListener("error", (e) => {
  console.error("Uncaught error:", e.error)
  window.showToast("Ha ocurrido un error inesperado", "error")
})

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
  window.showToast("Error de conexión", "error")
})

console.log("✅ App.js cargado - TaskManagerApp disponible")
