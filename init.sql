-- *** Esto se va a ejecutar al iniciar el contenedor de PostgreSQL ***

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear usuario adicional para solo lectura (opcional)
CREATE USER taskmanager_readonly WITH PASSWORD 'readonly_pass';
GRANT CONNECT ON DATABASE taskmanager TO taskmanager_readonly;
GRANT USAGE ON SCHEMA public TO taskmanager_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO taskmanager_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO taskmanager_readonly;
