FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" "pydantic>=2" supabase \
    "python-jose[cryptography]" httpx python-dotenv

# Copy source
COPY . .

EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
