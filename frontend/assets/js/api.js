export class API {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    // Método auxiliar para manejar las respuestas de la API
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Ha ocurrido un error');
        }
        
        return data;
    }

    // Método auxiliar para construir las opciones de la petición
    buildOptions(method, body = null, requiresAuth = true) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Convertir cuerpo a JSON
        if (body) {
            options.body = JSON.stringify(body);
        }

        // Token para autenticación
        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return options;
    }

    // Endpoints de Autenticación
    async login(username, password) {
        const response = await fetch(`${this.baseUrl}/auth/login`, this.buildOptions('POST', { username, password }, false));
        return this.handleResponse(response);
    }

    async register(userData) {
        const response = await fetch(`${this.baseUrl}/auth/register`, this.buildOptions('POST', userData, false));
        return this.handleResponse(response);
    }

    async logout() {
        localStorage.removeItem('token');
    }

    // Endpoints para las Tareas
    async getTasks() {
        const response = await fetch(`${this.baseUrl}/tasks`, this.buildOptions('GET'));
        return this.handleResponse(response);
    }

    async createTask(taskData) {
        const response = await fetch(`${this.baseUrl}/tasks`, this.buildOptions('POST', taskData));
        return this.handleResponse(response);
    }

    async updateTask(taskId, taskData) {
        const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, this.buildOptions('PUT', taskData));
        return this.handleResponse(response);
    }

    async deleteTask(taskId) {
        const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, this.buildOptions('DELETE'));
        return this.handleResponse(response);
    }

    async completeTask(taskId) {
        const response = await fetch(`${this.baseUrl}/tasks/${taskId}/complete`, this.buildOptions('PUT'));
        return this.handleResponse(response);
    }

    // Endpoints de Usuario
    async getCurrentUser() {
        const response = await fetch(`${this.baseUrl}/users/me`, this.buildOptions('GET'));
        return this.handleResponse(response);
    }

    async updateUserProfile(userData) {
        const response = await fetch(`${this.baseUrl}/users/me`, this.buildOptions('PUT', userData));
        return this.handleResponse(response);
    }
}
