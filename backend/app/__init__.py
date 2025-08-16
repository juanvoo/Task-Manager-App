from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_restful import Api

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Configuración
    app.config.from_object(f'app.config.{config_name.title()}Config')
    
    @app.route('/')
    def index():
        return {'message': 'API funcionando correctamente', 'status': 'ok'}
    
    @app.route('/test')
    def test():
        return {'message': 'Ruta de prueba funcionando', 'status': 'ok'}
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    
    # API
    api = Api(app, prefix='/api/v1')
    
    # Registrar recursos - SOLO AUTH POR AHORA
    from app.resources.auth import AuthRegister, AuthLogin
    
    api.add_resource(AuthRegister, '/auth/register')
    api.add_resource(AuthLogin, '/auth/login')
    
    # Importar SOLO el modelo user
    from app.models import user  # ✅ Solo user, no task
    
    return app