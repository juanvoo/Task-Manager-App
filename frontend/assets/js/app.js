import CONFIG from './config.js';
import { Auth } from './auth.js';
import { TaskManager } from './tasks.js';
import { API } from './api.js';
import { showLoading, hideLoading, showApp, hideApp, showAuthModal, closeModal, showToast } from './utils.js';

class TaskManagerApp {
  constructor() {
    this.auth = new Auth();
    this.api = new API(CONFIG.API_URL);
    this.taskManager = null;

    // Utilidades globales
    this.showLoading = showLoading;
    this.hideLoading = hideLoading;
    this.showApp = showApp;
    this.hideApp = hideApp;
    this.showAuthModal = showAuthModal;
    this.closeModal = closeModal;
    this.showToast = showToast;
  }

  async init() {
    try {
      this.hideLoading();
      console.log('Iniciando aplicación...');

      if (this.auth.isAuthenticated) {
        console.log('Usuario autenticado, cargando aplicación...');
        await this.loadApp();
      } else {
        console.log('Usuario no autenticado, mostrando login...');
        this.showAuthModal();
      }

      this.setupEventListeners();
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
      this.showToast('Error al inicializar la aplicación', 'error');
    }
  }

  async loadApp() {
    try {
      this.showLoading(true);
      this.taskManager = new TaskManager(this.api, this.auth.token, {
        showLoading,
        hideLoading,
        showToast,
      });
      await this.taskManager.loadTasks();
      this.showApp();
      this.closeModal('authModal');
    } catch (error) {
      console.error('Error al cargar la aplicación:', error);
      this.showToast('Error al cargar la aplicación', 'error');
      this.showAuthModal();
    } finally {
      this.hideLoading(false);
    }
  }

  setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
          this.showLoading(true);
          await this.auth.login(username, password);
          await this.loadApp();
          this.closeModal('authModal');
        } catch (error) {
          console.error('Error en login:', error);
          this.showToast('Error en el inicio de sesión', 'error');
        } finally {
          this.hideLoading(false);
        }
      });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
          username: document.getElementById('registerUsername').value,
          email: document.getElementById('registerEmail').value,
          password: document.getElementById('registerPassword').value,
          first_name: document.getElementById('registerFirstName').value,
          last_name: document.getElementById('registerLastName').value,
        };

        try {
          this.showLoading(true);
          await this.auth.register(userData);
          this.showToast('Registro exitoso. Por favor, inicia sesión.', 'success');
          registerForm.reset();
          document.getElementById('loginForm').classList.add('active');
          document.getElementById('registerForm').classList.remove('active');
        } catch (error) {
          console.error('Error en registro:', error);
          this.showToast(error.message || 'Error en el registro', 'error');
        } finally {
          this.hideLoading(false);
        }
      });
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        this.auth.logout();
        this.hideApp();
        this.showAuthModal();
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new TaskManagerApp();
  window.app.init().catch((error) => {
    console.error('Error al iniciar la aplicación:', error);
    showToast('Error al iniciar la aplicación', 'error');
  });
});