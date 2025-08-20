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

    async login(credentials) {
    try {
      const data = {
        username: credentials.username,
        password: credentials.password
      };

      console.log("📤 Enviando login:", data);

      const response = await API.post("/auth/login", data);
      console.log("✅ Login exitoso:", response);
      return response;
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  }

    async register(userData) {
    try {
      // 🚀 Nos aseguramos de que tenga todos los campos
      const data = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name || "",
        last_name: userData.last_name || ""
      };

      console.log("📤 Enviando registro:", data);

      const response = await API.post("/auth/register", data);
      console.log("✅ Registro exitoso:", response);
      return response;
    } catch (error) {
      console.error("❌ Error en registro:", error);
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

export default new Auth();