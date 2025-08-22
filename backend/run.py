import os
from app import db
from flask_migrate import upgrade
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from functools import wraps

# Lista para almacenar tareas
tasks = [
    {"id": 1, "user_id": 1, "title": "Investigar crímenes", "description": "Revisar casos pendientes", "status": "in-progress", "due_date": "2023-12-31"},
    {"id": 2, "user_id": 1, "title": "Reparar Batimóvil", "description": "Cambiar neumáticos y revisar motor", "status": "pending", "due_date": "2023-11-15"},
    {"id": 3, "user_id": 1, "title": "Entrenar con Robin", "description": "Sesión de combate", "status": "completed", "due_date": "2023-10-30"}
]
next_task_id = 4 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'losBrunos33' 
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Decorador para verificar token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"message": "Token es requerido"}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except:
            return jsonify({"message": "Token inválido"}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

# Rutas de tu API
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    # Aquí procesarías los datos del registro
    print(f"Recibido: {data}")
    
    return jsonify({
        "status": "success",
        "message": "Usuario registrado correctamente"
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Aquí procesarías el login
    print(f"Login intento: {data}")
 
    if email and password:  # Validación simple
        # Generar token
        token = jwt.encode({
            'user_id': 1,  # ID de usuario simulado
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        print(f"✅ Token generado: {token}")
        
        return jsonify({
            "status": "success",
            "message": "Login exitoso",
            "token": token,
            "user": {
                "id": 1,
                "username": email.split('@')[0],
                "email": email
            }
        })
    
    return jsonify({"message": "Credenciales inválidas"}), 401

# Nuevas rutas para la gestión de tareas
@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user_id):
    status = request.args.get('status', 'all')
    
    print(f"📥 Solicitando tareas para usuario {current_user_id} con estado {status}")
    
    user_tasks = [task for task in tasks if task['user_id'] == current_user_id]
    
    if status != 'all':
        user_tasks = [task for task in user_tasks if task['status'] == status]
    
    print(f"✅ Enviando {len(user_tasks)} tareas")
    return jsonify(user_tasks)

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
@token_required
def get_task(current_user_id, task_id):
    print(f"📥 Buscando tarea con ID {task_id} para usuario {current_user_id}")
    
    # Buscar la tarea en la lista global
    task = next((t for t in tasks if t['id'] == task_id and t['user_id'] == current_user_id), None)
    
    if not task:
        print(f"❌ Tarea con ID {task_id} no encontrada")
        return jsonify({"message": "Tarea no encontrada"}), 404
    
    print(f"✅ Tarea encontrada: {task}")
    return jsonify(task)

@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user_id):
    global next_task_id
    data = request.get_json()
    
    print(f"📥 Datos recibidos para crear tarea: {data}")
    
    # Crear nueva tarea
    new_task = {
        "id": next_task_id,
        "user_id": current_user_id,
        "title": data['title'],
        "description": data.get('description', ''),
        "status": data.get('status', 'pending'),
        "due_date": data.get('due_date')
    }
    
    # Agregar a la lista
    tasks.append(new_task)
    next_task_id += 1
    
    print(f"✅ Tarea creada: {new_task}")
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user_id, task_id):
    data = request.get_json()
    
    # Buscar la tarea en la lista global
    task = next((t for t in tasks if t['id'] == task_id and t['user_id'] == current_user_id), None)
    
    if not task:
        return jsonify({"message": "Tarea no encontrada"}), 404
    
    # Actualizar los campos
    task['title'] = data.get('title', task['title'])
    task['description'] = data.get('description', task['description'])
    task['status'] = data.get('status', task['status'])
    task['due_date'] = data.get('due_date', task['due_date'])
    
    return jsonify(task)

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user_id, task_id):
    print(f"📥 Eliminando tarea con ID {task_id} para usuario {current_user_id}")
    
    # Buscar el índice de la tarea en la lista global
    task_index = next((i for i, t in enumerate(tasks) if t['id'] == task_id and t['user_id'] == current_user_id), None)
    
    if task_index is None:
        print(f"❌ Tarea con ID {task_id} no encontrada para eliminar")
        return jsonify({"message": "Tarea no encontrada"}), 404
    
    # Eliminar la tarea
    deleted_task = tasks.pop(task_index)
    print(f"✅ Tarea eliminada: {deleted_task}")
    
    return jsonify({"message": "Tarea eliminada correctamente"})

@app.cli.command()
def deploy():
    """Ejecutar tareas de despliegue"""
    # Crear tablas de base de datos
    upgrade()

@app.cli.command()
def init_db():
    """Inicializar base de datos"""
    db.create_all()
    print("Database initialized!")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)