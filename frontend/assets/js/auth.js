// Importar la clase API
import API from "./api.js";

const api = new API("http://localhost:5000/api");

class Auth {
  static async register(userData) {
    return await api.post("/register", userData);
  }

  static async login(credentials) {
    return await api.post("/login", credentials);
  }

  static async getProfile(token) {
    return await api.get("/profile", {
      Authorization: `Bearer ${token}`,
    });
  }

  // Métodos para tareas
  static async getTasks(token, status = 'all') {
  const endpoint = status === 'all' ? '/tasks' : `/tasks?status=${status}`;
  console.log("🔑 Enviando token en getTasks:", token ? "Sí" : "No");
  return await api.get(endpoint, {
    Authorization: `Bearer ${token}`,
  });
}

  static async getTask(token, taskId) {
    return await api.get(`/tasks/${taskId}`, {
      Authorization: `Bearer ${token}`,
    });
  }

  static async createTask(token, taskData) {
  console.log("🔑 Enviando token en createTask:", token ? "Sí" : "No");
  return await api.post("/tasks", taskData, {
    Authorization: `Bearer ${token}`,
  });
}

  static async updateTask(token, taskId, taskData) {
    return await api.put(`/tasks/${taskId}`, taskData, {
      Authorization: `Bearer ${token}`,
    });
  }

  static async deleteTask(token, taskId) {
    return await api.delete(`/tasks/${taskId}`, {
      Authorization: `Bearer ${token}`,
    });
  }
}

export default Auth;