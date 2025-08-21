import Auth from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // 🚀 Registro
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const userData = {
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim(),
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
      };

      try {
        console.log("📤 Enviando registro:", userData);
        const response = await Auth.register(userData);
        alert("✅ Usuario registrado con éxito");
        console.log("➡️ Respuesta del servidor:", response);
        registerForm.reset();
      } catch (error) {
        console.error("❌ Error en registro:", error);
        alert("⚠️ Error al registrar usuario");
      }
    });
  }

  // 🚀 Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const credentials = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value.trim(),
      };

      try {
        console.log("📤 Enviando login:", credentials);
        const response = await Auth.login(credentials);
        alert("✅ Login exitoso");
        console.log("➡️ Respuesta del servidor:", response);

        // Guardar el token de autenticación
     if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  
      window.location.href = 'dashboard.html';

        loginForm.reset();
      } catch (error) {
        console.error("❌ Error en login:", error);
        alert("⚠️ Error en login");
      }
    });
  }
});
