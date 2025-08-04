import { API } from './api.js';
import CONFIG from './config.js';

export class Auth {
    constructor() {
        this.api = new API(CONFIG.API_URL);
        this._token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
        this._userData = JSON.parse(localStorage.getItem(CONFIG.USER_DATA_KEY) || 'null');
    }

    get token() {
        return this._token;
    }

    get userData() {
        return this._userData;
    }

    get isAuthenticated() {
        return !!this._token;
    }

    async login(username, password) {
        try {
            const response = await this.api.post('/auth/login', {
                'Nombre de usuario': username,
                'Contraseña': password
            });

            if (response.access_token) {
                this._token = response.access_token;
                this._userData = response.Usuario;
                localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, this._token);
                localStorage.setItem(CONFIG.USER_DATA_KEY, JSON.stringify(this._userData));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await this.api.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    logout() {
        this._token = null;
        this._userData = null;
        localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_DATA_KEY);
    }
}