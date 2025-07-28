import pytest
import json
from app import create_app, db
from app.models.user import User

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def sample_user():
    return {
        'Nombre de usuario': 'testuser',
        'Email': 'test@example.com',
        'Contraseña': 'testpass123',
        'Nombre': 'Test',
        'Apellido': 'User'
    }

def test_register_user(client, sample_user):
    response = client.post('/api/v1/auth/register',
                          data=json.dumps(sample_user),
                          content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'Usuario creado con éxito'
    assert 'Usuario' in data
    assert data['Usuario']['Nombre de usuario'] == sample_user['Nombre de usuario']

def test_register_duplicate_user(client, sample_user):

    # *** Test para registrar un usuario duplicado ***
    
    # Primero registra el usuario
    client.post('/api/v1/auth/register',
                data=json.dumps(sample_user),
                content_type='application/json')
    
    # Intenta registrar el mismo usuario nuevamente
    response = client.post('/api/v1/auth/register',
                          data=json.dumps(sample_user),
                          content_type='application/json')
    
    assert response.status_code == 409
    data = json.loads(response.data)
    assert 'ya existe' in data['message']

def test_login_user(client, sample_user):
    
    # *** Test para iniciar sesión con un usuario registrado ***
    
    # Primero, registra el usuario
    client.post('/api/v1/auth/register',
                data=json.dumps(sample_user),
                content_type='application/json')

    # Iniciar sesión
    login_data = {
        'Nombre de usuario': sample_user['Nombre de usuario'],
        'Contraseña': sample_user['Contraseña']
    }
    
    response = client.post('/api/v1/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Inicio de sesión exitoso'
    assert 'access_token' in data
    assert 'Usuario' in data

def test_login_invalid_credentials(client, sample_user):
    
    # *** Test para iniciar sesión con credenciales inválidas ***
    
    # Primero, registra el usuario
    login_data = {
        'Nombre de usuario': 'No existe',
        'Contraseña': 'Contraseña Incorrecta'
    }
    
    response = client.post('/api/v1/auth/login',
                          data=json.dumps(login_data),
                          content_type='application/json')
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['message'] == 'Credenciales inválidas'
