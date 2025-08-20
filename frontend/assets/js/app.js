import Auth from "./auth.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userData = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value
  };

  try {
    const result = await Auth.register(userData);
    alert("Registro exitoso: " + JSON.stringify(result));
  } catch (error) {
    alert("Error en registro: " + error);
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const credentials = {
    username: document.getElementById("loginUsername").value,
    password: document.getElementById("loginPassword").value
  };

  try {
    const result = await Auth.login(credentials);
    alert("Login exitoso: " + JSON.stringify(result));
  } catch (error) {
    alert("Error en login: " + error);
  }
});
