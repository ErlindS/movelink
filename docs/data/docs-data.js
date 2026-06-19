// Automatisch generierte Dokumentationsdaten
// Generiert am: 20.6.2026, 01:12:21

window.DOCS_DATA = [
  {
    "path": "README.md",
    "title": "movelink",
    "category": "Allgemein",
    "content": "# movelink",
    "lastModified": "20.6.2026, 01:00:42",
    "size": 10
  },
  {
    "path": "Befehle_App_Build.md",
    "title": "Wichtige Terminal-Befehle für MoveLink (React Native / Expo)",
    "category": "Allgemein",
    "content": "# Wichtige Terminal-Befehle für MoveLink (React Native / Expo)\r\n\r\nDiese Datei dokumentiert die wichtigsten Befehle, die wir genutzt haben, um Fehler mit dem Gradle-Cache zu beheben und die eigenständige Android App (.apk) zu generieren.\r\n\r\n## 1. Normaler Entwicklungs-Modus (Schnell)\r\nWenn die App (oder der Dev Client) bereits auf deinem Handy installiert ist, brauchst du nicht mehr den kompletten nativen Code neu zu kompilieren. Du startest einfach nur den lokalen Server, der sich per WLAN mit deinem Handy verbindet.\r\n\r\n```powershell\r\nnpx expo start\r\n```\r\n\r\n## 2. Kompletten Cache leeren und App neu kompilieren (Fehlerbehebung)\r\nWenn du jemals wieder seltsame Fehler wie `unsupported class file` oder `class not found in jar` beim Android-Build siehst, bedeutet das meistens, dass der Gradle-Cache beschädigt ist. \r\nDiese drei Schritte reinigen alles und bauen den nativen Ordner frisch auf:\r\n\r\n```powershell\r\n# 1. Stoppt laufende Hintergrundprozesse (Daemons) von Gradle\r\ncd app/android\r\n.\\gradlew --stop\r\n\r\n# 2. Löscht den kompletten beschädigten Gradle-Cache (Windows PowerShell)\r\nRemove-Item -Recurse -Force \"$env:USERPROFILE\\.gradle\\caches\"\r\n\r\n# 3. Zwingt Expo dazu, den gesamten /android Ordner sauber neu zu generieren\r\ncd ..\r\nnpx expo prebuild --clean\r\n```\r\n\r\n## 3. Eine fertige, eigenständige Android App (APK) bauen\r\nUm eine APK zu bauen, die du unabhängig vom PC auf dem Handy nutzen kannst, nutzt du den `assembleRelease` Befehl.\r\n\r\n**Wichtig:** Falls du auf deinem PC mehrere Java-Versionen installiert hast (z.B. Java 25), musst du Gradle zwingen, das kompatible **Java 17** aus deinem Android Studio zu verwenden, bevor du den Befehl ausführst.\r\n\r\n```powershell\r\n# Zuerst in den App-Ordner wechseln\r\ncd app\r\n\r\n# Java-Pfad temporär setzen, in den android-Ordner wechseln und den Release-Build starten\r\n$env:JAVA_HOME=\"C:\\Program Files\\Android\\Android Studio\\jbr\"; cd android; .\\gradlew assembleRelease\r\n```\r\n\r\n*Nach erfolgreichem Durchlauf findest du die fertige APK hier:*\r\n`app/android/app/build/outputs/apk/release/app-release.apk`\r\n",
    "lastModified": "20.6.2026, 01:00:42",
    "size": 2066
  },
  {
    "path": "doc/firstnotes.md",
    "title": "Firstnotes",
    "category": "Dokumente & Konzepte",
    "content": "Mikrocontroller <--- Datenpakete ---> App\r\n\r\n\r\nBackend <- API -> Frontend\r\n(Backend?)\r\n\r\nProblemstellung:\r\n\r\nDarstellung von Trainingsdatensätzen zur Bewegungsanalyse.\r\n\r\nProjektebene\r\nStakeholder:\r\n- Trainierenden (Fokus)\r\n- Entwickler\r\n- Dienstleister\r\n- Hochschule \r\n\r\n\r\nAnforderungen an die App:\r\n\r\n2 Zustände:\r\n\r\n1 Zustand (Fokus) aktives Trainig:\r\n- Intention: visuelle Darstellung des Trainingsfortschritts in Echtzeit\r\n\r\n- FA: In Echtzeit eine Bewertung abliefern\r\n- FA: Darstellung der Ausführung\r\n\r\n- NFA: Eine eigenständige Applikation\r\n- NFA: Das Darstellen der darf Höchstens 1 Sekunden dauern\r\n\r\n- Rahmenbedingung: Auf Android, Mac und Windows funktionsfähig\r\n- Technologien: Flutter & MAUI\r\n\r\n\r\nIch habe einen XIOA nRF52840 Gerät. Ich möchte die Daten in Echtzeit in einem Frontend anzeigen z.B. React. Wie sinnvoll und komplex wäre es einen Server dazwischen zu packen?\r\n\r\n\r\n",
    "lastModified": "20.6.2026, 01:00:42",
    "size": 900
  },
  {
    "path": "embedded/src/architecture.md",
    "title": "Embedded Sensor-Firmware",
    "category": "Embedded Firmware",
    "content": "# Embedded Sensor-Firmware\r\n\r\nDie Firmware liest Sensorwerte aus und überträgt diese über Bluetooth Low Energy (BLE) an die App.\r\n\r\n## Datenfluss Firmware\r\n\r\n```mermaid\r\nflowchart TD\r\n    Sensor[MPU6050 Beschleunigungssensor] -->|I2C Rohdaten| Arduino[Arduino / ESP32 Controller]\r\n    Arduino -->|Signalfilterung & Skalierung| BLE[Bluetooth Low Energy Characteristic]\r\n    BLE -->|Notifikationen / Byte-Array| App[Mobile App]\r\n```\r\n\r\n- **Sensordatenerfassung**: Erfolgt in einer festen Frequenz (z.B. 50Hz).\r\n- **Filterung**: Tiefpassfilter zur Rauschminderung auf dem Mikrocontroller.\r\n- **BLE-Transfer**: Effiziente Übertragung als binäres Datenpaket.\r\n",
    "lastModified": "20.6.2026, 01:00:42",
    "size": 660
  },
  {
    "path": "app/components/architecture.md",
    "title": "App Komponenten",
    "category": "Mobile App",
    "content": "# App Komponenten\r\n\r\nDiese Verzeichnis enthält die UI-Komponenten der Mobile-/Web-Anwendung (z.B. Visualisierungen, Charts, Navigation).\r\n\r\n## Datenfluss in UI-Komponenten\r\n\r\nDie Komponenten erhalten Daten über Props oder den globalen Store und rendern diese reaktiv.\r\n\r\n```mermaid\r\nflowchart LR\r\n    Store[Globaler Store] -->|Reaktive Updates| SensorCard[SensorCard / LiveChart]\r\n    SensorCard -->|Klick / Aktion| Actions[Store Actions]\r\n    Actions -->|Dispatch| Store\r\n```\r\n\r\n- **LiveChart**: Rendert eintreffende Datenpunkte in Echtzeit.\r\n- **SensorCard**: Zeigt den aktuellen Status und Verbindungszustand von Bluetooth-Geräten.\r\n",
    "lastModified": "20.6.2026, 01:00:42",
    "size": 639
  },
  {
    "path": "app/components/ProfileCard/architecture.md",
    "title": "Profil-Karte (ProfileCard)",
    "category": "Mobile App",
    "content": "# Profil-Karte (ProfileCard)\r\n\r\nDiese Komponente zeigt die Profildetails des angemeldeten Benutzers an.\r\n\r\n## Datenfluss\r\n```mermaid\r\nflowchart LR\r\n    JWT[Authentifizierungs-Token] -->|1. User-ID auslesen| Controller[ProfileController]\r\n    Controller -->|2. Query| DB[(Datenbank)]\r\n    DB -->|3. Rohdaten| Controller\r\n    Controller -->|4. Bereinigtes Profil DTO| Client[ProfileCard UI]\r\n```\r\n",
    "lastModified": "20.6.2026, 01:00:42",
    "size": 395
  }
];
