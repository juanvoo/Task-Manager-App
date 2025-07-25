from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.task import Task, TaskStatus, TaskPriority
from datetime import datetime

class TaskListResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('Titulo', required=True, help='Titulo de la tarea es requerido')
        self.parser.add_argument('Descripción')
        self.parser.add_argument('Prioridad', choices=['Baja', 'Media', 'Alta'])
        self.parser.add_argument('Fecha de vencimiento')

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        
        # Filtros
        query = Task.query.filter_by(user_id=user_id)
        
        # Filtro por estado
        status = reqparse.request.args.get('Estado')
        if status:
            query = query.filter_by(status=TaskStatus(status))
        
        # Filtro por prioridad
        priority = reqparse.request.args.get('Prioridad')
        if priority:
            query = query.filter_by(priority=TaskPriority(priority))
        
        # Ordenamiento
        sort_by = reqparse.request.args.get('Ordenar por', 'Creación')
        order = reqparse.request.args.get('order', 'desc')
        
        if hasattr(Task, sort_by):
            if order == 'asc':
                query = query.order_by(getattr(Task, sort_by).asc())
            else:
                query = query.order_by(getattr(Task, sort_by).desc())
        
        tasks = query.all()
        
        return {
            'tasks': [task.to_dict() for task in tasks],
            'total': len(tasks)
        }, 200
    
    @jwt_required()
    def post(self):
        args = self.parser.parse_args()
        user_id = get_jwt_identity()
        
        task = Task(
            title=args['Titulo'],
            description=args.get('Descripción'),
            priority=TaskPriority(args.get('Prioridad', 'Media')),
            user_id=user_id
        )
        
        # Parsear fecha si se proporciona
        if args.get('Fecha de vencimiento'):
            try:
                task.due_date = datetime.fromisoformat(args['Fecha de vencimiento'].replace('Z', '+00:00'))
            except ValueError:
                return {'message': 'Formato de fecha inválido.'}, 400

        db.session.add(task)
        db.session.commit()
        
        return {
            'message': 'Tarea creada exitosamente',
            'task': task.to_dict()
        }, 201

class TaskResource(Resource):
    @jwt_required()
    def get(self, task_id):
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        
        if not task:
            return {'message': 'Tarea no encontrada'}, 404
        
        return {'task': task.to_dict()}, 200
    
    @jwt_required()
    def put(self, task_id):
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        
        if not task:
            return {'message': 'Tarea no encontrada'}, 404
        
        parser = reqparse.RequestParser()
        parser.add_argument('Titulo')
        parser.add_argument('Descripción')
        parser.add_argument('Estado', choices=['Pendiente', 'Completada', 'En progreso'])
        parser.add_argument('Prioridad', choices=['Baja', 'Media', 'Alta'])
        parser.add_argument('Fecha de vencimiento')
        
        args = parser.parse_args()
        
        # Actualizar campos
        if args.get('Titulo'):
            task.title = args['Titulo']
        if args.get('Descripción') is not None:
            task.description = args['Descripción']
        if args.get('Estado'):
            task.status = TaskStatus(args['Estado'])
            if args['Estado'] == 'Completada':
                task.mark_completed()
            elif args['Estado'] == 'Pendiente':
                task.mark_pending()
        if args.get('Prioridad'):
            task.priority = TaskPriority(args['Prioridad'])
        if args.get('Fecha de vencimiento'):
            try:
                task.due_date = datetime.fromisoformat(args['Fecha de vencimiento'].replace('Z', '+00:00'))
            except ValueError:
                return {'message': 'Formato de fecha inválido'}, 400
        
        db.session.commit()
        
        return {
            'message': 'Tarea actualizada exitosamente',
            'task': task.to_dict()
        }, 200
    
    @jwt_required()
    def delete(self, task_id):
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        
        if not task:
            return {'message': 'Tarea no encontrada'}, 404
        
        db.session.delete(task)
        db.session.commit()
        
        return {'message': 'Tarea eliminada exitosamente'}, 200
