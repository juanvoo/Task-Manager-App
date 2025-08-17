// Cliente API para comunicación con el backend
class APIClient {
  constructor() {
    this.baseURL = "http://localhost:5000/api/v1"
    this.timeout = 10000
  }

  // Obtener token de autenticación
  getAuthToken() {
    return localStorage.getItem("task_manager_token")
  }

  // Configurar headers por defecto
  getDefaultHeaders() {
    const headers = {
      "Content-Type": "application/json",
    }

    const token = this.getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getDefaultHeaders(),
      ...options,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(errorData.message || `HTTP ${response.status}`, response.status, errorData)
      }

      return await response.json()
    } catch (error) {
      if (error.name === "AbortError") {
        throw new APIError("Request timeout", 408)
      }

      if (error instanceof APIError) {
        throw error
      }

      throw new APIError("Network error", 0, error)
    }
  }

  // Métodos HTTP
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: "GET" })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }

  // Métodos específicos de autenticación
  async login(username, password) {
    return this.post("/auth/login", { username, password })
  }

  async register(userData) {
    return this.post("/auth/register", userData)
  }

  // Métodos específicos de tareas
  async getTasks(filters = {}) {
    return this.get("/tasks", filters)
  }

  async createTask(taskData) {
    return this.post("/tasks", taskData)
  }

  async getTask(taskId) {
    return this.get(`/tasks/${taskId}`)
  }

  async updateTask(taskId, taskData) {
    return this.put(`/tasks/${taskId}`, taskData)
  }

  async deleteTask(taskId) {
    return this.delete(`/tasks/${taskId}`)
  }

  // Métodos específicos de usuarios
  async getUserProfile(userId) {
    return this.get(`/users/${userId}`)
  }
}

// Clase para errores de API
class APIError extends Error {
  constructor(message, status, data = {}) {
    super(message)
    this.name = "APIError"
    this.status = status
    this.data = data
  }
}

// Instancia global del cliente API
window.api = new APIClient()
