#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/../app"

cd "$APP_DIR"

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm ci
fi

echo "Starting Expo dev server..."
echo "Hot reload enabled — changes apply instantly."
echo ""
(sleep 4 && open http://localhost:8081 2>/dev/null) &
npx expo start --web --port 8081
