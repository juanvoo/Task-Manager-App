from app import db
from datetime import datetime
from enum import Enum

class TaskStatus(Enum):
    PENDING = 'Pendiente'
    COMPLETED = 'Completada'
    IN_PROGRESS = 'En progreso'

class TaskPriority(Enum):
    LOW = 'Baja'
    MEDIUM = 'Media'
    HIGH = 'Alta'

class Task(db.Model):
    __tablename__ = 'Tareas'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Enum(TaskStatus), default=TaskStatus.PENDING)
    priority = db.Column(db.Enum(TaskPriority), default=TaskPriority.MEDIUM)
    due_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación con el modelo de usuario (FK)
    user_id = db.Column(db.Integer, db.ForeignKey('ID de usuario'), nullable=False)

    def to_dict(self):
        return {
            'ID': self.id,
            'Titulo': self.title,
            'Descripción': self.description,
            'Estado': self.status.value if self.status else None,
            'Prioridad': self.priority.value if self.priority else None,
            'Fecha de vencimiento': self.due_date.isoformat() if self.due_date else None,
            'Fecha de finalización': self.completed_at.isoformat() if self.completed_at else None,
            'Fecha de creación': self.created_at.isoformat(),
            'Fecha de actualización': self.updated_at.isoformat(),
            'ID de usuario': self.user_id
        }
    
    def mark_completed(self):
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.utcnow()
    
    def mark_pending(self):
        self.status = TaskStatus.PENDING
        self.completed_at = None
    
    def __repr__(self):
        return f'<Tarea {self.title}>'
