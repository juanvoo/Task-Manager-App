from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Importar modelos
    from app.models import user
    
    @app.route('/')
    def hello():
        return {'message': 'Backend con modelos funcionando!', 'status': 'ok'}
    
    @app.route('/test-db')
    def test_db():
        try:
            # Crear tablas si no existen
            db.create_all()
            return {'status': 'Database tables created successfully'}
        except Exception as e:
            return {'error': str(e)}, 500
    
    return app