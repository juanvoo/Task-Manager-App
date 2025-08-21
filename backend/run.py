import os
from app import db
from flask_migrate import upgrade
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from functools import wraps

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
    
    # En un caso real, guardarías en la base de datos
    # Por ahora, simulamos un registro exitoso
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
    
    # En un caso real, verificarías en la base de datos
    # Por ahora, simulamos un login exitoso y generamos un token
    if email and password:  # Validación simple
        # Generar token
        token = jwt.encode({
            'user_id': 1,  # ID de usuario simulado
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            "status": "success",
            "message": "Login exitoso",
            "token": token,
            "user": {
                "id": 1,
                "username": email.split('@')[0],  # Simulación
                "email": email
            }
        })
    
    return jsonify({"message": "Credenciales inválidas"}), 401

# Nuevas rutas para la gestión de tareas
@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user_id):
    status = request.args.get('status', 'all')
    
    # En un caso real, obtendrías las tareas de la base de datos
    # Por ahora, simulamos algunas tareas
    tasks = [
        {"id": 1, "user_id": 1, "title": "Investigar crímenes", "description": "Revisar casos pendientes", "status": "in-progress", "due_date": "2023-12-31"},
        {"id": 2, "user_id": 1, "title": "Reparar Batimóvil", "description": "Cambiar neumáticos y revisar motor", "status": "pending", "due_date": "2023-11-15"},
        {"id": 3, "user_id": 1, "title": "Entrenar con Robin", "description": "Sesión de combate", "status": "completed", "due_date": "2023-10-30"}
    ]
    
    # Filtrar por usuario actual
    user_tasks = [task for task in tasks if task['user_id'] == current_user_id]
    
    # Filtrar por estado si es necesario
    if status != 'all':
        user_tasks = [task for task in user_tasks if task['status'] == status]
    
    return jsonify(user_tasks)

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
@token_required
def get_task(current_user_id, task_id):
    # En un caso real, obtendrías la tarea de la base de datos
    # Por ahora, simulamos algunas tareas
    tasks = [
        {"id": 1, "user_id": 1, "title": "Investigar crímenes", "description": "Revisar casos pendientes", "status": "in-progress", "due_date": "2023-12-31"},
        {"id": 2, "user_id": 1, "title": "Reparar Batimóvil", "description": "Cambiar neumáticos y revisar motor", "status": "pending", "due_date": "2023-11-15"},
        {"id": 3, "user_id": 1, "title": "Entrenar con Robin", "description": "Sesión de combate", "status": "completed", "due_date": "2023-10-30"}
    ]
    
    # Buscar la tarea
    task = next((t for t in tasks if t['id'] == task_id and t['user_id'] == current_user_id), None)
    
    if not task:
        return jsonify({"message": "Tarea no encontrada"}), 404
    
    return jsonify(task)

@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user_id):
    data = request.get_json()
    
    # En un caso real, guardarías en la base de datos
    # Por ahora, simulamos la creación
    new_task = {
        "id": 4,  # ID simulado
        "user_id": current_user_id,
        "title": data['title'],
        "description": data.get('description', ''),
        "status": data.get('status', 'pending'),
        "due_date": data.get('due_date')
    }
    
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user_id, task_id):
    data = request.get_json()
    
    # En un caso real, actualizarías en la base de datos
    # Por ahora, simulamos la actualización
    updated_task = {
        "id": task_id,
        "user_id": current_user_id,
        "title": data.get('title', 'Título actualizado'),
        "description": data.get('description', 'Descripción actualizada'),
        "status": data.get('status', 'pending'),
        "due_date": data.get('due_date')
    }
    
    return jsonify(updated_task)

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user_id, task_id):
    # En un caso real, eliminarías de la base de datos
    # Por ahora, simulamos la eliminación
    
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