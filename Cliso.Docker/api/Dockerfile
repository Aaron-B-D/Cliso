# Imagen de la API. El contexto de construcción es Cliso.API (ver docker-compose.yml).
# Python 3.12 o superior: el código usa la sintaxis de genéricos `def _read[T](...)`. Se usa 3.13, la que comprueba pyright.
ARG PYTHON_VERSION=3.13
FROM python:${PYTHON_VERSION}-slim

# /app hace de raíz de la API: data/ y logs/ quedan en /app/data y /app/logs, donde se montan los volúmenes.
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
