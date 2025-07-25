from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_restful import Api
from flasgger import Swagger

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
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)
    
    # API y Swagger
    api = Api(app, prefix='/api/v1')
    swagger = Swagger(app, template_file='swagger_template.yml')
    
    # Registrar recursos
    from app.resources.auth import AuthRegister, AuthLogin
    from app.resources.tasks import TaskListResource, TaskResource
    from app.resources.users import UserResource
    
    api.add_resource(AuthRegister, '/auth/register')
    api.add_resource(AuthLogin, '/auth/login')
    api.add_resource(TaskListResource, '/tasks')
    api.add_resource(TaskResource, '/tasks/<int:task_id>')
    api.add_resource(UserResource, '/users/<int:user_id>')
    
    # Importar modelos para las migraciones
    from app.models import user, task
    
    return app
