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
                username,
                password
            });

            this._token = response.access_token;
            this._userData = response.user;

            localStorage.setItem('token', this._token);
            localStorage.setItem('userData', JSON.stringify(this._userData));

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await this.api.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    logout() {
        this._token = null;
        this._userData = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    }
}