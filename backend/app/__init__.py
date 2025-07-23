from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.config import config

db = SQLAlchemy()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    CORS(app)
    
    @app.route('/')
    def hello():
        return {'message': 'Backend con BD funcionando!', 'status': 'ok'}
    
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'database': 'connected'}
    
    return app