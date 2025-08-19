export class API {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    // Método auxiliar para manejar las respuestas de la API
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            const error = new Error(typeof data === 'object' ? JSON.stringify(data) : data.message || 'Ha ocurrido un error');
            error.status = response.status;
            error.data = data;
            console.error('API Error:', {
                status: response.status,
                data: data,
                url: response.url
            });
            throw error;
        }
        
        return data;
    }

    // Método auxiliar para construir las opciones de la petición
    buildRequestOptions(method, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        return options;
    }

    // Métodos HTTP
    async get(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, this.buildRequestOptions('GET'));
        return this.handleResponse(response);
    }

    async post(endpoint, data) {
        console.log('Making POST request to:', `${this.baseUrl}${endpoint}`, 'with data:', data);
        const response = await fetch(`${this.baseUrl}${endpoint}`, this.buildRequestOptions('POST', data));
        return this.handleResponse(response);
    }

    async put(endpoint, data) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, this.buildRequestOptions('PUT', data));
        return this.handleResponse(response);
    }

    async delete(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, this.buildRequestOptions('DELETE'));
        return this.handleResponse(response);
    }
}