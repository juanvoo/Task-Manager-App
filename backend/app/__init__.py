from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/')
    def hello():
        return {'message': 'Backend funcionando!', 'status': 'ok'}
    
    @app.route('/health')
    def health():
        return {'status': 'healthy'}
    
    return app