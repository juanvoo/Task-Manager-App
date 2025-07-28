import pytest
import json
from app import create_app, db
from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority

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
def auth_user(client):
    user_data = {
        'Nombre de usuario': 'testuser',
        'Email': 'test@example.com',
        'Contraseña': 'testpass123'
    }
    
    # Registrar usuario
    client.post('/api/v1/auth/register',
                data=json.dumps(user_data),
                content_type='application/json')

    # Iniciar sesión para obtener token
    login_response = client.post('/api/v1/auth/login',
                                data=json.dumps({
                                    'Nombre de usuario': user_data['Nombre de usuario'],
                                    'Contraseña': user_data['Contraseña']
                                }),
                                content_type='application/json')
    
    token = json.loads(login_response.data)['access_token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def sample_task():
    return {
        'Titulo': 'Tarea de prueba',
        'Descripcion': 'Esta es una tarea de prueba',
        'Prioridad': 'media'
    }

def test_create_task(client, auth_user, sample_task):
    response = client.post('/api/v1/tasks',
                          data=json.dumps(sample_task),
                          content_type='application/json',
                          headers=auth_user)
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'Tarea creada exitosamente'
    assert data['Tarea']['Titulo'] == sample_task['Titulo']

def test_get_tasks(client, auth_user, sample_task):
    # Primero, crea una tarea
    client.post('/api/v1/tasks',
                data=json.dumps(sample_task),
                content_type='application/json',
                headers=auth_user)

    # Obtener tareas
    response = client.get('/api/v1/tasks', headers=auth_user)
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Tareas' in data
    assert len(data['Tareas']) == 1
    assert data['Tareas'][0]['Titulo'] == sample_task['Titulo']

def test_update_task(client, auth_user, sample_task):
    
    # Crear tarea
    create_response = client.post('/api/v1/tasks',
                                 data=json.dumps(sample_task),
                                 content_type='application/json',
                                 headers=auth_user)

    task_id = json.loads(create_response.data)['Tarea']['id']

    # Actualizar tarea
    update_data = {
        'Titulo': 'Tarea Actualizada',
        'Estado': 'completada'
    }
    
    response = client.put(f'/api/v1/tasks/{task_id}',
                         data=json.dumps(update_data),
                         content_type='application/json',
                         headers=auth_user)
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['Tarea']['Titulo'] == 'Tarea Actualizada'
    assert data['Tarea']['Estado'] == 'completada'

def test_delete_task(client, auth_user, sample_task):

    # Crear tarea
    create_response = client.post('/api/v1/tasks',
                                 data=json.dumps(sample_task),
                                 content_type='application/json',
                                 headers=auth_user)

    task_id = json.loads(create_response.data)['Tarea']['id']

    # Eliminar tarea
    response = client.delete(f'/api/v1/tasks/{task_id}', headers=auth_user)
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Tarea eliminada exitosamente'

    # Verificar que la tarea esté eliminada
    get_response = client.get(f'/api/v1/tasks/{task_id}', headers=auth_user)
    assert get_response.status_code == 404

def test_unauthorized_access(client, sample_task):
    response = client.get('/api/v1/tasks')
    assert response.status_code == 401
    
    response = client.post('/api/v1/tasks',
                          data=json.dumps(sample_task),
                          content_type='application/json')
    assert response.status_code == 401
