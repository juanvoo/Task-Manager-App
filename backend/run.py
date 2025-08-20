import os
from app import db
from flask_migrate import upgrade
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Configuración de CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

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
    # Aquí procesarías el login
    print(f"Login intento: {data}")
    return jsonify({
        "status": "success",
        "message": "Login exitoso"
    })

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