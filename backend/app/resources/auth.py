from flask import request
from flask_restful import Resource, reqparse
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from app import db
from app.models.user import User
from app.utils.validators import validate_email
from datetime import timedelta


class AuthRegister(Resource):
    def post(self):
        try:
            data = request.get_json()

            if not data:
                return {"message": "No se recibieron datos JSON"}, 400

            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            first_name = data.get("first_name")
            last_name = data.get("last_name")

            if not username or not email or not password:
                return {"message": "Faltan campos obligatorios"}, 400

            if not validate_email(email):
                return {"message": "Email no válido"}, 400

            if User.query.filter_by(username=username).first():
                return {"message": "El nombre de usuario ya está en uso"}, 409

            if User.query.filter_by(email=email).first():
                return {"message": "El email ya está en uso"}, 409

            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            user.set_password(password)

            db.session.add(user)
            db.session.commit()

            return {
                "message": "Usuario creado exitosamente",
                "user": user.to_dict()
            }, 201

        except Exception as e:
            return {"message": f"Error en el registro: {str(e)}"}, 500


class AuthLogin(Resource):
    def post(self):
        try:
            data = request.get_json()

            if not data:
                return {"message": "No se recibieron datos JSON"}, 400

            username = data.get("username")
            password = data.get("password")

            if not username or not password:
                return {"message": "Faltan credenciales"}, 400

            user = User.query.filter_by(username=username).first()

            if not user or not check_password_hash(user.password_hash, password):
                return {"message": "Credenciales inválidas"}, 401

            # Generar token válido por 1 hora
            access_token = create_access_token(
                identity=user.id,
                expires_delta=timedelta(hours=1)
            )

            return {
                "message": "Login exitoso",
                "access_token": access_token,
                "user": user.to_dict()
            }, 200

        except Exception as e:
            return {"message": f"Error en el login: {str(e)}"}, 500