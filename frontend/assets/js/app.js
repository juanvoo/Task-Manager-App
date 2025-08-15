import CONFIG from './config.js';
import { Auth } from './auth.js';
import { TaskManager } from './tasks.js';
import { API } from './api.js';
import { showLoading, hideLoading, showApp, hideApp, showAuthModal, closeModal } from './utils.js';

class TaskManagerApp {
    constructor() {
        this.auth = new Auth();
        this.api = new API(CONFIG.API_URL);
        this.taskManager = null;
        
        // Utilidades
        this.showLoading = showLoading;
        this.hideLoading = hideLoading;
        this.showApp = showApp;
        this.hideApp = hideApp;
        this.showAuthModal = showAuthModal;
        this.closeModal = closeModal;
    }

    async init() {
        try {
            this.hideLoading(); // Asegurarse de que el spinner esté oculto al inicio
            console.log('Iniciando aplicación...', this.auth);
            
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
            this.showLoading();
            this.taskManager = new TaskManager(this.api, this.auth.token);
            await this.taskManager.loadTasks();
            this.showApp();
        } catch (error) {
            console.error('Error al cargar la aplicación:', error);
            this.showToast('Error al cargar la aplicación', 'error');
            this.showAuthModal();
        } finally {
            this.hideLoading();
        }
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');

        // Manejo de pestañas de autenticación
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Tab clicked:', button.dataset.tab);
                // Remover active de todos los botones y formularios
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                
                // Activar el botón y formulario seleccionado
                button.classList.add('active');
                const formId = button.dataset.tab + 'Form';
                const form = document.getElementById(formId);
                if (form) {
                    form.classList.add('active');
                }
            });
        });

        // Formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('Formulario de login encontrado, agregando event listener...');
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Intento de login...');
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                
                try {
                    this.showLoading();
                    await this.auth.login(username, password);
                    await this.loadApp();
                    closeModal('authModal');
                } catch (error) {
                    console.error('Error en login:', error);
                    this.showToast('Error en el inicio de sesión', 'error');
                } finally {
                    this.hideLoading();
                }
            });
        }

        // Formulario de registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const userData = {
                    username: document.getElementById('registerUsername').value,
                    email: document.getElementById('registerEmail').value,
                    password: document.getElementById('registerPassword').value,
                    first_name: document.getElementById('registerFirstName').value,
                    last_name: document.getElementById('registerLastName').value
                };

                try {
                    this.showLoading();
                    await this.auth.register(userData);
                    this.showToast('Registro exitoso. Por favor, inicia sesión.', 'success');
                    
                    // Limpiar el formulario
                    registerForm.reset();
                    
                    // Mostrar el formulario de login
                    document.getElementById('loginForm').classList.add('active');
                    document.getElementById('registerForm').classList.remove('active');
                } catch (error) {
                    console.error('Error en registro:', error);
                    this.showToast(error.message || 'Error en el registro', 'error');
                } finally {
                    this.hideLoading();
                }
            });
        }

        // Botón de cerrar sesión
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.auth.logout();
                this.hideApp();
                this.showAuthModal();
            });
        }
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(message);
        }
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando aplicación...');
    const app = new TaskManagerApp();
    app.init().catch(error => {
        console.error('Error al iniciar la aplicación:', error);
        if (window.showToast) {
            window.showToast('Error al iniciar la aplicación', 'error');
        }
    });
});