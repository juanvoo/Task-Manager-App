import API from "./api.js";

// ✅ Creamos una instancia aquí
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
}

export default Auth;
