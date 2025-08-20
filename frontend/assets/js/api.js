class API {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, method = "GET", body = null, headers = {}) {
    const config = { method, headers: { "Content-Type": "application/json", ...headers } };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return await response.json();
  }

  get(endpoint) {
    return this.request(endpoint, "GET");
  }

  post(endpoint, body) {
    return this.request(endpoint, "POST", body);
  }

  put(endpoint, body) {
    return this.request(endpoint, "PUT", body);
  }

  delete(endpoint) {
    return this.request(endpoint, "DELETE");
  }
}

// ✅ Exportamos la CLASE, no la instancia
export default API;
