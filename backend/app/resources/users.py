from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.task import Task, TaskStatus

class UserResource(Resource):
    @jwt_required()
    def get(self, user_id):
        current_user_id = get_jwt_identity()
        
        # Solo permitir acceso al propio perfil
        if current_user_id != user_id:
            return {'message': 'Access denied'}, 403
        
        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404
        
        # Calcular estadísticas
        total_tasks = Task.query.filter_by(user_id=user_id).count()
        completed_tasks = Task.query.filter_by(
            user_id=user_id, 
            status=TaskStatus.COMPLETED
        ).count()
        pending_tasks = Task.query.filter_by(
            user_id=user_id, 
            status=TaskStatus.PENDING
        ).count()
        in_progress_tasks = Task.query.filter_by(
            user_id=user_id, 
            status=TaskStatus.IN_PROGRESS
        ).count()
        
        user_data = user.to_dict()
        user_data['statistics'] = {
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'in_progress_tasks': in_progress_tasks,
            'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
        }
        
        return {'user': user_data}, 200
