import Auth from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está autenticado
  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  
  // Mostrar nombre del usuario
  document.getElementById('userName').textContent = user.username || 'Usuario';
  
  // Configurar botón de logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
  
  // Configurar botón de nueva tarea
  document.getElementById('newTaskBtn').addEventListener('click', () => {
    openTaskModal();
  });
  
  // Configurar formulario de tarea
  document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
  
  // Configurar filtro
  document.getElementById('statusFilter').addEventListener('change', () => {
    loadTasks();
  });
  
  // Configurar modal
  const modal = document.getElementById('taskModal');
  const closeBtn = document.querySelector('.close');
  
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Cargar tareas iniciales
  loadTasks();
});

async function loadTasks() {
  const token = localStorage.getItem('authToken');
  const statusFilter = document.getElementById('statusFilter').value;
  
  console.log("📥 Cargando tareas con token:", token ? "Sí" : "No");
  
  try {
    const tasks = await Auth.getTasks(token, statusFilter);
    console.log("✅ Tareas recibidas:", tasks);
    renderTasks(tasks);
  } catch (error) {
    console.error("❌ Error al cargar tareas:", error);
    alert("⚠️ Error al cargar tus tareas");
  }
}

function renderTasks(tasks) {
  console.log("🎨 Renderizando tareas:", tasks);
  
  const container = document.getElementById('tasksContainer');
  container.innerHTML = '';
  
  if (tasks.length === 0) {
    container.innerHTML = '<p>No tienes tareas aún.</p>';
    return;
  }
  
  tasks.forEach(task => {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.status}`;
    
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sin fecha';
    
    taskCard.innerHTML = `
      <div class="task-header">
        <h3>${task.title}</h3>
        <span class="task-status ${task.status}">${getStatusText(task.status)}</span>
      </div>
      <p class="task-description">${task.description || 'Sin descripción'}</p>
      <div class="task-footer">
        <span class="task-due-date">📅 ${dueDate}</span>
        <div class="task-actions">
          <button class="edit-btn" data-id="${task.id}">Editar</button>
          <button class="delete-btn" data-id="${task.id}">Eliminar</button>
        </div>
      </div>
    `;
    
    container.appendChild(taskCard);
  });
  
  // Agregar event listeners a los botones
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.getAttribute('data-id');
      console.log("🔄 Botón editar clickeado para tarea ID:", taskId);
      editTask(taskId);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.getAttribute('data-id');
      console.log("🗑️ Botón eliminar clickeado para tarea ID:", taskId);
      deleteTask(taskId);
    });
  });
  
  console.log(`✅ Renderizadas ${tasks.length} tareas`);
}

function getStatusText(status) {
  const statusMap = {
    'pending': 'Pendiente',
    'in-progress': 'En Progreso',
    'completed': 'Completada'
  };
  return statusMap[status] || status;
}

function openTaskModal(task = null) {
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  
  // Resetear formulario
  form.reset();
  
  if (task) {
    // Modo edición
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskDueDate').value = task.due_date ? task.due_date.split('T')[0] : '';
  } else {
    // Modo nueva tarea
    document.getElementById('taskId').value = '';
  }
  
  modal.style.display = 'block';
}

async function handleTaskSubmit(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('authToken');
  const taskId = document.getElementById('taskId').value;
  
  const taskData = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    status: document.getElementById('taskStatus').value,
    due_date: document.getElementById('taskDueDate').value
  };

  console.log("📤 Enviando tarea:", taskData);
  
  try {
     if (taskId) {
      console.log("🔄 Actualizando tarea existente con ID:", taskId);
      await Auth.updateTask(token, taskId, taskData);
    } else {
      console.log("➕ Creando nueva tarea"); 
      const response = await Auth.createTask(token, taskData);
      console.log("✅ Respuesta del servidor:", response);
    }
    
    // Cerrar modal y recargar tareas
    document.getElementById('taskModal').style.display = 'none';
    console.log("🔄 Recargando tareas...");
    loadTasks();
  } catch (error) {
    console.error("❌ Error al guardar tarea:", error);
    alert("⚠️ Error al guardar la tarea");
  }
}

async function editTask(taskId) {
  const token = localStorage.getItem('authToken');
  
  console.log("🔄 Editando tarea con ID:", taskId);
  
  try {
    const task = await Auth.getTask(token, taskId);
    console.log("✅ Tarea obtenida para editar:", task);
    openTaskModal(task);
  } catch (error) {
    console.error("❌ Error al cargar tarea:", error);
    alert("⚠️ Error al cargar la tarea");
  }
}

async function deleteTask(taskId) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    return;
  }
  
  const token = localStorage.getItem('authToken');
  
  console.log("🗑️ Eliminando tarea con ID:", taskId);
  
  try {
    await Auth.deleteTask(token, taskId);
    console.log("✅ Tarea eliminada correctamente");
    loadTasks();
  } catch (error) {
    console.error("❌ Error al eliminar tarea:", error);
    alert("⚠️ Error al eliminar la tarea");
  }
}