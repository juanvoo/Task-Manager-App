const API_URL = "http://localhost:5000/api/v1";

export class API {
  async handleResponse(response, url) {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify({
        status: response.status,
        data: errorData,
        url
      }));
    }
    return response.json();
  }

  async post(endpoint, data) {
    const url = `${API_URL}${endpoint}`;
    console.log("📡 Making POST request to:", url, "with data:", data);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    return this.handleResponse(response, url);
  }
}

export default new API();
