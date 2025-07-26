from flask_restful import Resource, reqparse
from flask_jwt_extended import create_access_token, create_refresh_token
from app import db
from app.models.user import User
from app.utils.validators import validate_email

class AuthRegister(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('Nombre de Usuario', required=True, help='Nombre de Usuario es requerido')
        self.parser.add_argument('Email', required=True, help='Email es requerido')
        self.parser.add_argument('Contraseña', required=True, help='La contraseña es requerida')
        self.parser.add_argument('Nombre')
        self.parser.add_argument('Apellido')

    def post(self):
        args = self.parser.parse_args()

        if not validate_email(args['Email']):
            return {'message': 'Email no válido'}, 400
            
            if User.query.filter_by(username=args['Nombre de Usuario']).first:
                return{ 'message': 'El nombre de usuario ya está en uso'}, 409
            
            if User.query.filter_by(email=args['Email']).first():
                return {'message': 'El email ya está en uso'}, 409
            
            user=User (
                username=args['Nombre de Usuario'],
                email=args['Email'],
                first_name = args.get('Nombre'),
                last_name=args.get('Apellido')
            )
            user.set_password(args['Contraseña'])

            db.session.add(user)
            db.session.commit()

            return{
                'message': 'Usuario creado exitosamente',
                'Usuario': user.to_dict()
            }, 201
        
class AuthLogin(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('Nombre de usuario', requiered = True, help= 'Nombre de usuario es requerido')
        self.parser.add_arguement('Contraseña', requiered = True, help = 'La contraseña es requerida')

        def post(self):
            args = self.parser.parse_args()

            user = User.query.filter_by(username = args ['Nombre de usuario']).first()

            if user and user.check_password(args ['Contraseña']) and user.is_active:
                acces_token = create_access_token(identity = user.id)
                refresh_token = create_refresh_token (identity = user.id)

                return {
                    'message': 'Inicio de sesión exitoso',
                    'access_token': acces_token,
                    'refresh_token': refresh_token,
                    'Usuario': user.to_dict()
                }, 200
            
            return {'message': 'Nombre de usuario o contraseña incorrectos'}, 401
            
