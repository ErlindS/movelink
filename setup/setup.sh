#!/bin/bash

# MoveLink Projekt-Initialisierung
echo "🚀 Initialisiere MoveLink Parent-Repository..."

# Submodules hinzufügen
echo "📦 Füge Firmware-Repository hinzu..."
git submodule add https://github.com/ErlindS/movelink-embedded.git embedded

echo "📦 Füge App-Repository hinzu..."
git submodule add https://github.com/ErlindS/movelink-app.git app

# Initialisierung und Update
git submodule update --init --recursive

echo "✅ Fertig! Die Ordner /firmware und /app sind nun bereit."