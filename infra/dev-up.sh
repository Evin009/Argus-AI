#!/usr/bin/env bash
# Starts the ArgusAI backend stack (Redis + FastAPI + Celery worker) locally via Docker Compose.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/docker-compose.yml"

if [ ! -f "$ROOT_DIR/.env" ]; then
  echo "Missing $ROOT_DIR/.env — copy .env.example and fill in secrets first." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon not running. Starting Docker Desktop..."
  open -a Docker
  echo -n "Waiting for Docker to be ready"
  until docker info >/dev/null 2>&1; do
    echo -n "."
    sleep 2
  done
  echo " ready."
fi

docker compose -f "$COMPOSE_FILE" up -d --build

echo -n "Waiting for API health check"
for _ in $(seq 1 30); do
  if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
    echo " ok."
    break
  fi
  echo -n "."
  sleep 2
done

echo ""
docker compose -f "$COMPOSE_FILE" ps
echo ""
echo "API:        http://localhost:8000"
echo "Redis:      redis://localhost:6379"
echo "Logs:       docker compose -f infra/docker-compose.yml logs -f"
echo "Stop:       docker compose -f infra/docker-compose.yml down"
