import { Auth } from './auth.js';
import { TaskManager } from './tasks.js';

class TaskManagerApp {
    constructor() {
        this.auth = new Auth();
        this.taskManager = null;
    }

    async init() {
        console.log("Iniciando aplicación...");

        if (this.auth.isAuthenticated) {
            console.log("Usuario autenticado, cargando aplicación...");
            this.loadApp();
        } else {
            console.log("Usuario no autenticado");
        }

        this.setupEventListeners();
    }

    async loadApp() {
        try {
            this.taskManager = new TaskManager();
            await this.taskManager.loadTasks();
        } catch (error) {
            console.error("Error al cargar aplicación:", error);
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", async e => {
                e.preventDefault();
                const username = document.getElementById("loginUsername").value;
                const password = document.getElementById("loginPassword").value;

                try {
                    await this.auth.login(username, password);
                    this.loadApp();
                } catch (error) {
                    alert("Error en login");
                }
            });
        }

        const registerForm = document.getElementById("registerForm");
        if (registerForm) {
            registerForm.addEventListener("submit", async e => {
                e.preventDefault();
                const userData = {
                    username: document.getElementById("registerUsername").value,
                    email: document.getElementById("registerEmail").value,
                    password: document.getElementById("registerPassword").value,
                    first_name: document.getElementById("registerFirstName").value,
                    last_name: document.getElementById("registerLastName").value,
                };
                try {
                    await this.auth.register(userData);
                    alert("Registro exitoso. Inicia sesión.");
                } catch (error) {
                    alert("Error en registro");
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.app = new TaskManagerApp();
    window.app.init();
});
