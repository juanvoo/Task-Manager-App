# Configuración de la aplicación
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Base de datos
DATABASE_URL=postgresql://taskuser:taskpass@localhost:5432/taskmanager

# Configuración de desarrollo
DEBUG=True

# Configuración de producción (comentar en desarrollo)
# FLASK_ENV=production
# DEBUG=False
# DATABASE_URL=postgresql://user:password@host:port/database

# Configuración de email (para futuras funcionalidades)
# MAIL_SERVER=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USE_TLS=True
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password

# Configuración de Redis (para futuras funcionalidades de cache)
# REDIS_URL=redis://localhost:6379/0

# Configuración de logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
