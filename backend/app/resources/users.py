from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.task import Task, TaskStatus