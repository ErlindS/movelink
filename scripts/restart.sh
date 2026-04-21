#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running — open Docker Desktop first."
  exit 1
fi

echo "Stopping MoveLink..."
cd "$ROOT"
docker compose down

echo "Freeing ports..."
for port in 8081; do
  lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
done

echo "Starting MoveLink..."
docker compose up
