import { API } from "./api.js";
import { CONFIG } from "./config.js";

export class TaskManager {
  constructor(auth) {
    this.api = new API(CONFIG.API_URL);
    this.auth = auth;
    this.container = document.getElementById("tasks");
  }

  async loadTasks() {
    try {
      const tasks = await this.api.get("/tasks");
      this.render(tasks);
    } catch (error) {
      console.error("Error cargando tareas:", error);
      this.container.innerHTML = "<p>No se pudieron cargar las tareas</p>";
    }
  }

  render(tasks) {
    if (!tasks.length) {
      this.container.innerHTML = "<p>No tienes tareas aún</p>";
      return;
    }

    this.container.innerHTML = `
      <ul>
        ${tasks.map(t => `<li>${t.title} - ${t.status}</li>`).join("")}
      </ul>
    `;
  }
}
