from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'Usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String (80), unique=True, nullable=False)
    email = db.Column(db.String (120), unique=True, nullable=False)
    password_hash = db.Column(db.String (255), nullable=False)
    first_name = db.Column(db.String (50))
    last_name = db.Column (db.String (50))
    is_active = db.Column(db.Boolean, default = True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = db.relationship('Tarea', backref= 'Usuario', lazy= True, cascade = 'all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'ID': self.id,
            'Nombre de usuario': self.username,
            'Email': self.email,
            'Nombre': self.first_name,
            'Apellido': self.last_name,
            'Activo': self.is_active,
            'Fecha de creación': self.created_at.isoformat(),
            'Fecha de actualización': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f"<Usuario {self.username}>"