import os
from app import create_app, db
from flask_migrate import upgrade

app = create_app(os.getenv('FLASK_ENV', 'development'))

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