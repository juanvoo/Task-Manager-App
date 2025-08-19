import { Auth } from "./auth.js";
import { TaskManager } from "./tasks.js";

const auth = new Auth();
const app = document.getElementById("app");

function renderLogin() {
  app.innerHTML = `
    <h2>Iniciar Sesión</h2>
    <form id="loginForm">
      <input type="text" id="username" placeholder="Usuario" required>
      <input type="password" id="password" placeholder="Contraseña" required>
      <button type="submit">Entrar</button>
    </form>
    <p>¿No tienes cuenta? <a href="#" id="goRegister">Regístrate aquí</a></p>
  `;

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      await auth.login(username, password);
      renderTasks();
    } catch {
      alert("Credenciales incorrectas");
    }
  });

  document.getElementById("goRegister").addEventListener("click", (e) => {
    e.preventDefault();
    renderRegister();
  });
}

function renderRegister() {
  app.innerHTML = `
    <h2>Registro</h2>
    <form id="registerForm">
      <input type="text" id="username" placeholder="Usuario" required>
      <input type="email" id="email" placeholder="Correo" required>
      <input type="password" id="password" placeholder="Contraseña" required>
      <button type="submit">Registrarse</button>
    </form>
    <p>¿Ya tienes cuenta? <a href="#" id="goLogin">Inicia sesión aquí</a></p>
  `;

  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const userData = {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    };

    try {
      await auth.register(userData);
      alert("Registro exitoso, ahora puedes iniciar sesión");
      renderLogin();
    } catch {
      alert("Error al registrarse");
    }
  });

  document.getElementById("goLogin").addEventListener("click", (e) => {
    e.preventDefault();
    renderLogin();
  });
}

async function renderTasks() {
  const taskManager = new TaskManager(auth);
  app.innerHTML = `
    <h2>Tus Tareas</h2>
    <button id="logoutBtn">Cerrar Sesión</button>
    <div id="tasks"></div>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    auth.logout();
    renderLogin();
  });

  await taskManager.loadTasks();
}

if (auth.isAuthenticated) {
  renderTasks();
} else {
  renderLogin();
}
