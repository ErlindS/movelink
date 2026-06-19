#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running — open Docker Desktop first."
  exit 1
fi

echo "Freeing ports..."
for port in 8081; do
  lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
done

echo "Rebuilding and starting MoveLink..."
cd "$ROOT"
docker compose up --build -d

echo "Waiting for Metro to start..."
until curl -sS http://localhost:8081 >/dev/null 2>&1; do
  printf '.'
  sleep 1
done
echo ""
echo "Ready → http://localhost:8081  (first load bundles in ~20s)"
open http://localhost:8081 2>/dev/null || true

docker compose logs -f
