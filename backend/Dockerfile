FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Crear usuario no-root
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Exponer puerto
EXPOSE 5000

# Comando por defecto
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "run:app"]
