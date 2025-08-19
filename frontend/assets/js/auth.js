import {CONFIG} from './config.js';
import { API } from './api.js';

export class Auth {
    constructor() {
        this.api = new API(CONFIG.API_URL);
        this._token = localStorage.getItem('token');
        this._userData = this._token ? JSON.parse(localStorage.getItem('userData') || '{}') : null;
    }

    get token() {
        return this._token;
    }

    get isAuthenticated() {
        return !!this._token;
    }

    get userData() {
        return this._userData;
    }

    async login(username, password) {
        try {
            const response = await this.api.post('/auth/login', {
                'Nombre de usuario': username,
                'Nombre de Usuario': username,  // ✅ Exactamente como espera el backend
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
            const formattedData = {
                'Nombre de Usuario': userData.username,  // ✅ Exactamente como espera el backend
                'Email': userData.email,                 // ✅ No "Correo electrónico"
                'Contraseña': userData.password,
                'Nombre': userData.first_name,
                'Apellido': userData.last_name
            };
            const result = await this.api.post('/auth/register', formattedData);
            return result;
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