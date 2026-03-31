# MoveLink Projekt-Initialisierung
Write-Host "Initialisiere MoveLink Parent-Repository..." -ForegroundColor Cyan

# Submodules hinzufügen
Write-Host "Füge Firmware-Repository hinzu..."
git submodule add https://github.com/ErlindS/movelink-embedded.git embedded

Write-Host "Füge App-Repository hinzu..."
git submodule add https://github.com/ErlindS/movelink-app.git app

# Initialisierung und Update
git submodule update --init --recursive

Write-Host "Fertig! Die Ordner /firmware und /app sind nun bereit." -ForegroundColor Green