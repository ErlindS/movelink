const DOCS_DATA = {
  "files": [
    {
      "path": "README.md",
      "title": "movelink",
      "content": "# movelink",
      "headings": [
        {
          "level": 1,
          "text": "movelink",
          "line": 1
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "Befehle_App_Build.md",
      "title": "Wichtige Terminal-Befehle für MoveLink (React Native / Expo)",
      "content": "# Wichtige Terminal-Befehle für MoveLink (React Native / Expo)\n\nDiese Datei dokumentiert die wichtigsten Befehle, die wir genutzt haben, um Fehler mit dem Gradle-Cache zu beheben und die eigenständige Android App (.apk) zu generieren.\n\n## 1. Normaler Entwicklungs-Modus (Schnell)\nWenn die App (oder der Dev Client) bereits auf deinem Handy installiert ist, brauchst du nicht mehr den kompletten nativen Code neu zu kompilieren. Du startest einfach nur den lokalen Server, der sich per WLAN mit deinem Handy verbindet.\n\n```powershell\nnpx expo start\n```\n\n## 2. Kompletten Cache leeren und App neu kompilieren (Fehlerbehebung)\nWenn du jemals wieder seltsame Fehler wie `unsupported class file` oder `class not found in jar` beim Android-Build siehst, bedeutet das meistens, dass der Gradle-Cache beschädigt ist. \nDiese drei Schritte reinigen alles und bauen den nativen Ordner frisch auf:\n\n```powershell\n# 1. Stoppt laufende Hintergrundprozesse (Daemons) von Gradle\ncd app/android\n.\\gradlew --stop\n\n# 2. Löscht den kompletten beschädigten Gradle-Cache (Windows PowerShell)\nRemove-Item -Recurse -Force \"$env:USERPROFILE\\.gradle\\caches\"\n\n# 3. Zwingt Expo dazu, den gesamten /android Ordner sauber neu zu generieren\ncd ..\nnpx expo prebuild --clean\n```\n\n## 3. Eine fertige, eigenständige Android App (APK) bauen\nUm eine APK zu bauen, die du unabhängig vom PC auf dem Handy nutzen kannst, nutzt du den `assembleRelease` Befehl.\n\n**Wichtig:** Falls du auf deinem PC mehrere Java-Versionen installiert hast (z.B. Java 25), musst du Gradle zwingen, das kompatible **Java 17** aus deinem Android Studio zu verwenden, bevor du den Befehl ausführst.\n\n```powershell\n# Zuerst in den App-Ordner wechseln\ncd app\n\n# Java-Pfad temporär setzen, in den android-Ordner wechseln und den Release-Build starten\n$env:JAVA_HOME=\"C:\\Program Files\\Android\\Android Studio\\jbr\"; cd android; .\\gradlew assembleRelease\n```\n\n*Nach erfolgreichem Durchlauf findest du die fertige APK hier:*\n`app/android/app/build/outputs/apk/release/app-release.apk`\n",
      "headings": [
        {
          "level": 1,
          "text": "Wichtige Terminal-Befehle für MoveLink (React Native / Expo)",
          "line": 1
        },
        {
          "level": 2,
          "text": "1. Normaler Entwicklungs-Modus (Schnell)",
          "line": 5
        },
        {
          "level": 2,
          "text": "2. Kompletten Cache leeren und App neu kompilieren (Fehlerbehebung)",
          "line": 12
        },
        {
          "level": 1,
          "text": "1. Stoppt laufende Hintergrundprozesse (Daemons) von Gradle",
          "line": 17
        },
        {
          "level": 1,
          "text": "2. Löscht den kompletten beschädigten Gradle-Cache (Windows PowerShell)",
          "line": 21
        },
        {
          "level": 1,
          "text": "3. Zwingt Expo dazu, den gesamten /android Ordner sauber neu zu generieren",
          "line": 24
        },
        {
          "level": 2,
          "text": "3. Eine fertige, eigenständige Android App (APK) bauen",
          "line": 29
        },
        {
          "level": 1,
          "text": "Zuerst in den App-Ordner wechseln",
          "line": 35
        },
        {
          "level": 1,
          "text": "Java-Pfad temporär setzen, in den android-Ordner wechseln und den Release-Build starten",
          "line": 38
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/architecture.md",
      "title": "MoveLink Embedded Firmware - Container-Architektur",
      "content": "# MoveLink Embedded Firmware - Container-Architektur\n\nDieses Dokument beschreibt die Embedded Sensor-Firmware als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Binär-Firmware (flashed via USB/Serial)\n* **Technologie-Stack:** Arduino C/C++, LSM6DS3 IMU Library, Edge Impulse SDK, Bluetooth Low Energy\n\n## Beschreibung\nDie Sensor-Firmware läuft auf dem XIAO nRF52840 Sense Controller. Sie erfasst Beschleunigungs- und Rotationsdaten über den integrierten LSM6DS3-Sensor mit einer festen Abtastrate (50Hz), wendet Signalfilterungen zur Rauschunterdrückung an und streamt die Datenpakete als binäres Array via BLE Characteristics an die Mobile App. Alternativ führt sie Edge-Impulse-Inferenzmodelle direkt auf dem Mikrocontroller aus, um Trainingsübungen (z.B. Bizeps-Curls) lokal zu klassifizieren und Fehler über die integrierten RGB-LEDs anzuzeigen.\n\n## Komponenten in diesem Container\nDie Sensor-Firmware besteht aus folgenden logischen Komponenten:\n1. **[Sensordatenerfassung (Loop)](file:///c:/Users/erlin/repo/movelink/embedded/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5, NF1)\n2. **[Inferenz-Engine (Edge Impulse)](file:///c:/Users/erlin/repo/movelink/embedded/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5, FA9)\n3. **[LED- & Display-Controller](file:///c:/Users/erlin/repo/movelink/embedded/components/led_display_controller/architecture.md)**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern. (Erfüllt: FA9)\n4. **[BLE-Streamer](file:///c:/Users/erlin/repo/movelink/embedded/components/ble_streamer/architecture.md)**: Überträgt die erfassten Daten an den App-Container. (Erfüllt: FA3, FA5)\n5. **[Gehäuse](file:///c:/Users/erlin/repo/movelink/embedded/components/gehause/architecture.md)**: Bietet physischen Schutz, sodass das Tragen erleichtert wird. (Erfüllt: R2)\n\n## Abwägungen\n- **Lokale Auswertung vs. Cloud-Streaming**: Das Ausführen der Inferenz-Engine direkt auf dem Xiao-Controller minimiert die Latenz (NF1) und spart Bandbreite bei der Funkübertragung.\n- **Energiebedarf**: OLED-Display und kontinuierliche Sensordatenerfassung verbrauchen signifikant Energie, weshalb Akkulaufzeiten durch Cooldown-Zeiten und Schlafmodi im Idle optimiert werden müssen.\n",
      "headings": [
        {
          "level": 1,
          "text": "MoveLink Embedded Firmware - Container-Architektur",
          "line": 1
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 5
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 11
        },
        {
          "level": 2,
          "text": "Komponenten in diesem Container",
          "line": 14
        },
        {
          "level": 2,
          "text": "Abwägungen",
          "line": 22
        }
      ],
      "c4_level": "Container",
      "deployable": "Ja"
    },
    {
      "path": "embedded/src/architecture.md",
      "title": "Embedded Sensor-Firmware",
      "content": "# Embedded Sensor-Firmware\n\nDie Firmware liest Sensorwerte aus und überträgt diese über Bluetooth Low Energy (BLE) an die App.\n\n## Datenfluss Firmware\n\n```mermaid\nflowchart TD\n    Sensor[MPU6050 Beschleunigungssensor] -->|I2C Rohdaten| Arduino[Arduino / ESP32 Controller]\n    Arduino -->|Signalfilterung & Skalierung| BLE[Bluetooth Low Energy Characteristic]\n    BLE -->|Notifikationen / Byte-Array| App[Mobile App]\n```\n\n- **Sensordatenerfassung**: Erfolgt in einer festen Frequenz (z.B. 50Hz).\n- **Filterung**: Tiefpassfilter zur Rauschminderung auf dem Mikrocontroller.\n- **BLE-Transfer**: Effiziente Übertragung als binäres Datenpaket.\n",
      "headings": [
        {
          "level": 1,
          "text": "Embedded Sensor-Firmware",
          "line": 1
        },
        {
          "level": 2,
          "text": "Datenfluss Firmware",
          "line": 5
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "embedded/components/ble_streamer/architecture.md",
      "title": "BLE-Streamer",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# BLE-Streamer\n\nDiese Komponente überträgt die erfassten 6-Achsen-Sensordaten (Beschleunigung und Rotation) in Echtzeit per Bluetooth Low Energy (BLE) an die Mobile App.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDer BLE-Streamer initialisiert den nRF52840-Bluetooth-Stack, stellt einen GATT-Service mit einer IMU-Characteristic bereit und sendet die gefilterten Sensor-Messwerte (Beschleunigung in X, Y, Z und Drehraten in X, Y, Z) als binären 24-Byte-Puffer (6 float-Werte) an verbundene Clients.\n\n### GATT Profile & UUIDs\n* **Service-UUID:** `12345678-1234-1234-1234-123456789012`\n* **Characteristic-UUID:** `12345678-1234-1234-1234-123456789013` (BLERead | BLENotify)\n* **Paketformat:** 24 Bytes (6 float-Werte, IEEE 754 float32, little-endian):\n  `[accelX, accelY, accelZ, gyroX, gyroY, gyroZ]`\n\n## Implementierung & Traceability\n* **Implementiert in:** [BLEStreamer.cpp](file:///c:/Users/erlin/repo/movelink/embedded/components/ble_streamer/BLEStreamer.cpp)\n* **Erfüllt Anforderungen:**\n  * **FA3: Verbindungsaufbau**: Ermöglicht der Mobile App den Bluetooth-Aufbau und das Pairing.\n  * **FA5: Datenstrom-Verarbeitung**: Streamt die Rohdaten kontinuierlich via BLE Characteristics.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    IMU[Sensor-Rohwerte] -->|ax, ay, az, gx, gy, gz| Streamer[BLE-Streamer Component]\n    Streamer -->|GATT Notification (24 Bytes)| App[Mobile App useBLE Hook]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "BLE-Streamer",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 3,
          "text": "GATT Profile & UUIDs",
          "line": 17
        },
        {
          "level": 2,
          "text": "Implementierung & Traceability",
          "line": 23
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 29
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/components/sensordatenerfassung/architecture.md",
      "title": "Sensordatenerfassung (Loop)",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Sensordatenerfassung (Loop)\n\nDiese Komponente liest kontinuierlich die Rohwerte des Beschleunigungssensors und Gyroskops aus.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Sensordatenerfassung liest in einer festen Schleife (Loop) die 6-Achsen-IMU-Werte (Beschleunigung und Drehung) des LSM6DS3-Sensors über den I2C-Bus ein.\n\n### Technische Details\n- **Abtastrate:** 50 Hz (gesteuert durch präzises Timing in Microsekunden)\n- **Signal-Clamping:** Beschleunigungswerte werden auf max. ±2.0 G gedämpft/geclampt.\n- **Konvertierung:** Die Werte werden in die SI-Einheit $m/s^2$ konvertiert ($1\\,G = 9.80665\\,m/s^2$).\n- **Verwendete Hardware:** LSM6DS3 IMU auf dem XIAO nRF52840 Sense.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Executable.ino](file:///c:/Users/erlin/repo/movelink/embedded/src/Executable.ino)\n- **Erfüllt Anforderungen:**\n  - **FA5: Datenstrom-Verarbeitung**: Die Sensordaten werden kontinuierlich erfasst und für die Klassifikation aufbereitet.\n  - **NF1: Latenz**: Durch die hardwarenahe I2C-Abfrage und das Vermeiden von blockierenden Delays wird eine niedrige E2E-Latenz ermöglicht.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    IMU[LSM6DS3 Sensor] -->|I2C Rohdaten| Loop[Loop in Executable.ino]\n    Loop -->|1. Clamping auf 2G| Calc[Skalierung & m/s^2 Konvertierung]\n    Calc -->|2. Puffer befüllen| DSP[Edge Impulse DSP Puffer]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "Sensordatenerfassung (Loop)",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 3,
          "text": "Technische Details",
          "line": 17
        },
        {
          "level": 2,
          "text": "Implementierung & Traceability",
          "line": 23
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 29
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/components/led_display_controller/architecture.md",
      "title": "LED- & Display-Controller",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# LED- & Display-Controller\n\nDiese Komponente gibt dem Trainierenden direktes visuelles Feedback zur Qualität der Übungsausführung.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDer Controller steuert das SSD1306 OLED-Display sowie die integrierten RGB-LEDs des XIAO-Boards basierend auf den Klassifikationsergebnissen der Inferenz-Engine.\n\n### Feedback-Logik\n- **Ruhemodus (`idle` oder Konfidenz < 60%):**\n  - RGB-LED: **Blau** (Pin 12 auf LOW)\n  - Display: Zeigt `Status: IDLE` an.\n- **Saubere Ausführung (`curl_sauber`):**\n  - RGB-LED: **Grün** (Pin 13 auf LOW)\n  - Display: Zeigt `Curl: PERFEKT` an.\n- **Fehlerhafte Ausführung (z. B. `fehler_rotation`, `fehler_ellbogen`):**\n  - RGB-LED: **Rot** (Pin 11 auf LOW)\n  - Display: Zeigt `Achtung: FEHLER` an.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Executable.ino](file:///c:/Users/erlin/repo/movelink/embedded/src/Executable.ino) (unter Verwendung der U8x8-Bibliothek)\n- **Erfüllt Anforderungen:**\n  - **FA9: Biofeedback und Auswertung**: Ermöglicht sofortiges visuelles Biofeedback direkt an der Sensor-Hardware.\n\n## Kontrollfluss\n\n```mermaid\nflowchart TD\n    Result[Inferenz-Ergebnis] --> Check{Welche Klasse?}\n    Check -->|idle / <60%| Idle[Blau leuchten / 'IDLE' anzeigen]\n    Check -->|curl_sauber| Perfect[Grün leuchten / 'PERFEKT' anzeigen]\n    Check -->|Fehlerklasse| Error[Rot leuchten / 'FEHLER' anzeigen]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "LED- & Display-Controller",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 3,
          "text": "Feedback-Logik",
          "line": 17
        },
        {
          "level": 2,
          "text": "Implementierung & Traceability",
          "line": 28
        },
        {
          "level": 2,
          "text": "Kontrollfluss",
          "line": 33
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/components/inferenz_engine/architecture.md",
      "title": "Inferenz-Engine (Edge Impulse)",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Inferenz-Engine (Edge Impulse)\n\nDiese Komponente klassifiziert Übungsausführungen in Echtzeit direkt auf dem Mikrocontroller (Edge Computing).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Inferenz-Engine führt ein CNN-Klassifikationsmodell aus, das über Edge Impulse trainiert und als Arduino-Bibliothek in die Firmware integriert wurde. Es analysiert die 6-Achsen-Bewegungsdaten auf spezifische Übungsqualitäten und Fehlerbilder.\n\n### Technische Details\n- **Modelltyp:** Convolutional Neural Network (CNN)\n- **Erkannte Klassen:**\n  - `idle`: Keine Übungsausführung / Ruhezustand.\n  - `curl_sauber`: Korrekt ausgeführter Bizeps-Curl.\n  - `fehler_rotation`: Fehlerhafte Ausführung durch Rotation des Handgelenks.\n  - `fehler_ellbogen`: Fehlerhafte Ausführung durch Bewegung des Ellbogens.\n- **Anomalieerkennung:** Optionaler K-Means-Clustering-Block zur Erkennung unbekannter Bewegungen.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Executable.ino](file:///c:/Users/erlin/repo/movelink/embedded/src/Executable.ino) (unter Einbindung von `Erlind-project-1_inferencing.h`)\n- **Erfüllt Anforderungen:**\n  - **FA5: Datenstrom-Verarbeitung**: Analyse des kontinuierlichen Datenstroms.\n  - **FA9: Biofeedback und Auswertung**: Liefert die Grundlage für das unmittelbare Feedback (Erkennung sauberer vs. fehlerhafter Curls).\n\n## Datenfluss\n\n```mermaid\nflowchart TD\n    DSP[DSP Puffer (6 Achsen)] -->|run_classifier| Model[CNN Inferenzmodell]\n    Model -->|Wahrscheinlichkeiten| Eval[Klassenauswertung]\n    Eval -->|Bester Treffer + Score| Output[Feedback & PC-JSON-Stream]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "Inferenz-Engine (Edge Impulse)",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 3,
          "text": "Technische Details",
          "line": 17
        },
        {
          "level": 2,
          "text": "Implementierung & Traceability",
          "line": 26
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 32
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "embedded/components/gehause/architecture.md",
      "title": "Gehäuse (Enclosure)",
      "content": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Gehäuse (Enclosure)\n\nDiese Komponente beschreibt das physische, schützende 3D-Druck-Gehäuse des Sensors.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Physische Schutzhülle, keine Software-Ausführung)\n\n## Beschreibung\nDas Gehäuse umschließt den XIAO-Mikrocontroller sowie die Peripherie (Display, Batterie). Es bietet Befestigungslaschen für ein standardmäßiges 20-mm-Sportarmband, um den Sensor stabil am Arm des Nutzers zu fixieren.\n\n### Technische & Physische Parameter\n- **Gesamtmaße:** 48 mm (Länge) x 24 mm (Breite) x 16 mm (Höhe)\n- **Außenwandstärke:** 2.0 mm\n- **Schließmechanismus:** Schnapp-Deckel (Lippe & Snap Bumps mit 0.2 mm Toleranz)\n- **Komfort:** Abgerundete Ecken (Bevel-Breite 1.5 mm), um Druckstellen beim Tragen zu vermeiden.\n- **Aussparungen:** Integrierter USB-C-Port zur Programmierung und Akku-Ladung.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Gehause.py](file:///c:/Users/erlin/repo/movelink/embedded/src/Gehause.py) (Blender Python API)\n- **Erfüllt Anforderungen:**\n  - **R2: Physisches Gehäuse**: Stabile Fixierung des Sensors am Arm, Schutz gegen Schweiß und Erschütterungen.\n\n## Schnittstellen\nDas Gehäuse hat keine softwareseitigen Verbindungen, interagiert aber mechanisch mit:\n- **Mikrocontroller (XIAO nRF52840 Sense)**: Durch Passform und Aussparungen fixiert.\n- **Armband (20mm)**: Wird durch die integrierten Lug-Slots gefädelt.\n",
      "headings": [
        {
          "level": 1,
          "text": "Gehäuse (Enclosure)",
          "line": 6
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 10
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 14
        },
        {
          "level": 3,
          "text": "Technische & Physische Parameter",
          "line": 17
        },
        {
          "level": 2,
          "text": "Implementierung & Traceability",
          "line": 24
        },
        {
          "level": 2,
          "text": "Schnittstellen",
          "line": 29
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "doc/Requirements.md",
      "title": "Systemanforderungen (Requirements)",
      "content": "# Systemanforderungen (Requirements)\n\nDieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.\n\n---\n\n## Funktionale Anforderungen\n\n**FA1**: Dashboard und Navigation\nDas System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*\n\n**FA2**: Geräte-Scanning\nDas System muss eine Liste verfügbarer Bluetooth-Hardwaregeräte anzeigen und den aktuellen Verbindungsstatus visualisieren. *(Bezug: UC-1)*\n\n**FA3**: Verbindungsaufbau\nDas System muss in der Lage sein, eine stabile Bluetooth-Verbindung mit dem IMU-Sensor herzustellen. *(Bezug: UC-1)*\n\n**FA4**: Trainings-Detailansicht\nDas System muss eine detaillierte Ansicht für ein ausgewähltes Training anzeigen. *(Bezug: UC-2)*\n\n**FA5**: Datenstrom-Verarbeitung\nDas System muss kontinuierliche Bewegungsdatenströme vom Sensor empfangen, filtern und verarbeiten können. *(Bezug: UC-2)*\n\n**FA6**: Echtzeit-Visualisierung\nDas System muss die empfangenen Sensordaten und Bewegungen in Echtzeit visualisieren. *(Bezug: UC-2)*\n\n**FA7**: Historische Analyse\nDas System muss historische Bewegungsdaten grafisch und statistisch anzeigen können. *(Bezug: UC-3)*\n\n**FA8**: Übungs-Demonstration\nDas System muss eine grafische Demonstration der auszuführenden Übungsbewegung anzeigen, sobald das Training gestartet wird. *(Bezug: UC-2)*\n\n**FA9**: Biofeedback und Auswertung\nDas System muss den Bewegungsfortschritt in Echtzeit visualisieren, mit der Zielvorgabe vergleichen und bei korrekter Durchführung positives Feedback (visuell und haptisch) ausgeben. *(Bezug: UC-2)*\n\n---\n\n## Nicht-funktionale Anforderungen (Muss-Kriterien)\n\n**NF1**: Latenz\nDie End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n**NF2**: Zuverlässigkeit und Reconnect\nBei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.\n\n**NF3**: Benutzbarkeit (Usability)\nDas Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n---\n\n## Randbedingungen\n\n**R1**: Plattform-Kompatibilität\nDie mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.\n\n**R2**: Physisches Gehäuse\nFür das Trainingsgeräte braucht es einen Sensor. Dieser Sensor sollte bestenfalls nicht lose auf der Haut getragen werden\n",
      "headings": [
        {
          "level": 1,
          "text": "Systemanforderungen (Requirements)",
          "line": 1
        },
        {
          "level": 2,
          "text": "Funktionale Anforderungen",
          "line": 7
        },
        {
          "level": 2,
          "text": "Nicht-funktionale Anforderungen (Muss-Kriterien)",
          "line": 38
        },
        {
          "level": 2,
          "text": "Randbedingungen",
          "line": 51
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "doc/AI_DOCUMENTATION_GUIDE.md",
      "title": "Leitfaden für KI-Dokumentation & Traceability (MoveLink)",
      "content": "# Leitfaden für KI-Dokumentation & Traceability (MoveLink)\n\nDieses Repository verwendet ein automatisiertes, integriertes Dokumentations- und Traceability-System. Es scannt Markdown-Dokumente und Quellcode-Dateien, um eine interaktive Weboberfläche (HTML Dashboard) sowie einen kompilierten PDF-Bericht zu generieren.\n\nDamit zukünftige KIs und Entwickler neue Anforderungen, Use Cases und Architekturentwicklungen richtig dokumentieren, müssen die folgenden Standards eingehalten werden.\n\n---\n\n## 1. Definition von Anforderungen & Use Cases (.md-Dateien)\n\nAlle Systemdefinitionen werden in Markdown-Dateien im Ordner `doc/` gepflegt (z. B. `doc/Requirements.md` und `doc/UseCases.md`). \n\n### ID-Format & Konventionen\nJeder Eintrag muss eine eindeutige ID besitzen:\n* **`UC-X`**: Use Cases (z. B. `UC-1`)\n* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)\n* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)\n* **`R-X`**: Randbedingungen (z. B. `R1`)\n\n### Format der Deklaration in Markdown\nDamit der Scraper (`scrape_docs.py`) die Einträge korrekt parsen kann, müssen sie in einer Zeile deklariert werden, gefolgt von einer Beschreibung:\n\n```markdown\n**UC-1: Live-Ansicht der Übungen**\nDies ist die Beschreibung des Use Cases. Hier steht detaillierter Text, der auch über mehrere Zeilen gehen kann.\n\n**FA2: Bluetooth LE Signalstärke**\nDas System muss die BLE-Signalstärke des Sensors in Echtzeit ausgeben.\n```\n\n### Verknüpfung zwischen Anforderungen und Use Cases (Traceability)\nUm Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):\n\n```markdown\n**FA3: BLE Verbindungsaufbau (UC-1)**\nDas System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen.\n```\n\n---\n\n## 2. Implementierungs-Referenzen im Quellcode (@implements)\n\nUm nachzuweisen, dass eine Anforderung tatsächlich im Code implementiert wurde, müssen Entwickler und KIs direkt in den Quellcodedateien (`.ts`, `.tsx`, `.ino`, `.cpp`, `.h`) `@implements`-Annotationen in Kommentaren hinzufügen.\n\n### Syntax\n```\n@implements ID1, ID2, ...\n```\n\n### Code-Beispiele\n\n**In TypeScript / TSX Dateien (`app/`):**\n```tsx\n// @implements FA2, FA3, NF2\nexport function SensorCard() {\n    // UI Code...\n}\n```\n\n**In Arduino / C++ Dateien (`embedded/`):**\n```cpp\n/*\n * @implements FA5, NF1\n * Liest Sensorwerte mit 50Hz aus und wendet einen Tiefpassfilter an.\n */\nvoid loop() {\n    // Sensorsignal...\n}\n```\n\n---\n\n## 3. C4-Architektur-Modellierung (Metadaten-Blöcke)\n\nJedes Architektur-Dokument in Markdown muss Informationen über die zugehörige C4-Ebene und die Deployability enthalten.\n\n### Metadaten-Header in Markdown\nFügen Sie ganz oben in der entsprechenden Architektur-Markdown-Datei (z. B. `app/architecture.md`) einen HTML-Kommentarblock mit folgenden Keys hinzu:\n\n```markdown\n<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n```\n\n**Erlaubte Werte:**\n* **C4-Ebene**: `System-Context`, `Container`, `Component`\n* **Deployable**: `Ja` / `Nein` (oder `Yes` / `No`)\n\n### Registrierung im C4 Model Explorer\nWenn ein neuer Container oder eine neue Komponente hinzugefügt wird, muss diese auch in der `C4_DATA`-Struktur am Ende von `docs_site/app.js` registriert werden:\n1. Tragen Sie das Element unter `containers.elements` oder `components.[container_id].elements` ein.\n2. Definieren Sie dessen Verbindungen (Connectoren) im zugehörigen `connections`-Array.\n3. Ergänzen Sie die Dateizuordnung in der Funktion `getC4ElementForFile` in `docs_site/app.js`, damit die E2E-Flussdiagramme die Datei dem neuen C4-Element zuweisen.\n\n---\n\n## 4. Build-Prozess & Pipeline\n\nNach jeder Änderung an der Dokumentation oder den `@implements`-Kommentaren im Quellcode müssen die Kompilierungsskripte ausgeführt werden:\n\n### Lokaler Build-Befehl\n1. **Scraper ausführen** (erstellt `docs_site/data.js`):\n   ```bash\n   python scrape_docs.py\n   ```\n2. **PDF Bericht generieren** (erstellt `docs_site/documentation_report.pdf`):\n   ```bash\n   python generate_pdf.py\n   ```\n\n### CI/CD Pipeline (GitHub Actions)\nBei jedem Push auf den `main`-Branch baut die Pipeline `.github/workflows/docs.yml` die Webseite und das PDF automatisch. Wenn Sie einen Commit pushen, der bereits kompilierte Änderungen enthält, nutzen Sie `[skip ci]` im Commit-Betreff, um endlose Build-Loops zu verhindern.\n",
      "headings": [
        {
          "level": 1,
          "text": "Leitfaden für KI-Dokumentation & Traceability (MoveLink)",
          "line": 1
        },
        {
          "level": 2,
          "text": "1. Definition von Anforderungen & Use Cases (.md-Dateien)",
          "line": 9
        },
        {
          "level": 3,
          "text": "ID-Format & Konventionen",
          "line": 13
        },
        {
          "level": 3,
          "text": "Format der Deklaration in Markdown",
          "line": 20
        },
        {
          "level": 3,
          "text": "Verknüpfung zwischen Anforderungen und Use Cases (Traceability)",
          "line": 31
        },
        {
          "level": 2,
          "text": "2. Implementierungs-Referenzen im Quellcode (@implements)",
          "line": 41
        },
        {
          "level": 3,
          "text": "Syntax",
          "line": 45
        },
        {
          "level": 3,
          "text": "Code-Beispiele",
          "line": 50
        },
        {
          "level": 2,
          "text": "3. C4-Architektur-Modellierung (Metadaten-Blöcke)",
          "line": 73
        },
        {
          "level": 3,
          "text": "Metadaten-Header in Markdown",
          "line": 77
        },
        {
          "level": 3,
          "text": "Registrierung im C4 Model Explorer",
          "line": 91
        },
        {
          "level": 2,
          "text": "4. Build-Prozess & Pipeline",
          "line": 99
        },
        {
          "level": 3,
          "text": "Lokaler Build-Befehl",
          "line": 103
        },
        {
          "level": 3,
          "text": "CI/CD Pipeline (GitHub Actions)",
          "line": 113
        }
      ],
      "c4_level": "Container",
      "deployable": "Ja"
    },
    {
      "path": "doc/UseCases.md",
      "title": "Anwendungsfälle (Use Cases)",
      "content": "# Anwendungsfälle (Use Cases)\n\nHier werden die primären Interaktionen zwischen dem Trainierenden und dem MoveLink-System beschrieben.\n\n---\n\n**UC-1**: Trainingsgerät verbinden\n* **Akteur**: Trainierender\n* **Vorbedingung**: Trainingsgerät ist eingeschaltet und befindet sich in Reichweite.\n* **Beschreibung**: Als Trainierender möchte ich mein Trainingsgerät mit der App verbinden, um Trainingsdaten erfassen zu können.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt eine Möglichkeit/einen Reiter für Hardwaregeräte an.\n  2. **Eingabe**: Der Trainierende klicke auf den Reiter \"Hardwaregeräte\".\n     **Ausgabe**: Die App zeigt eine Liste der verfügbaren Hardwaregeräte sowie den aktuellen Verbindungsstatus an.\n  3. **Eingabe**: Der Trainierende wählt ein Hardwaregerät aus der Liste aus und klickt auf \"Verbinden\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Geräts und bestätigt den erfolgreichen Verbindungsaufbau.\n\n---\n\n**UC-2**: Echtzeit-Training überwachen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Das Trainingsgerät ist erfolgreich mit der App verbunden.\n* **Beschreibung**: Ich als Trainierender möchte mein Training in Echtzeit überwachen können, um direkt Feedback zu meiner Ausführung zu erhalten.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt die Option zum Starten eines Trainings an.\n  2. **Eingabe**: Der Trainierende klickt auf \"Training starten\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Trainings sowie die Start-Schaltfläche.\n  3. **Eingabe**: Der Trainierende drückt den \"Start\"-Button.\n     **Ausgabe**: Die App demonstriert grafisch die auszuführende Übungsbewegung. *(Bezug: FA8)*\n  4. **Eingabe**: Der Trainierende führt die Bewegung aus.\n     **Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung. *(Bezug: FA5, FA6, FA9)*\n\n---\n\n**UC-3**: Trainingsdaten einsehen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Mindestens eine aufgezeichnete Trainingseinheit ist in der Datenbank vorhanden.\n* **Beschreibung**: Ich als Trainierender möchte vergangene Trainingseinheiten einsehen können, um meine Fortschritte zu verfolgen.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App bietet eine Option zum Einsehen des Trainingsverlaufs.\n  2. **Eingabe**: Der Trainierende navigiert zum Reiter \"Trainingseinheiten\".\n     **Ausgabe**: Die App listet alle vergangenen Trainingseinheiten chronologisch auf.\n  3. **Eingabe**: Der Trainierende wählt eine Trainingseinheit aus der Liste aus.\n     **Ausgabe**: Die App bereitet die historischen Bewegungsdaten grafisch und statistisch auf.",
      "headings": [
        {
          "level": 1,
          "text": "Anwendungsfälle (Use Cases)",
          "line": 1
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "doc/Entscheidungen_Echtzeit_Training.md",
      "title": "Architekturentscheidungen: Echtzeit-Training & Bewegungserfassung",
      "content": "# Architekturentscheidungen: Echtzeit-Training & Bewegungserfassung\n\nDieses Dokument dokumentiert die Architekturentscheidungen zur Implementierung des interaktiven Trainings-Workflows (Bezug: **UC-2**, Schritte 3 & 4) in der MoveLink Mobile App.\n\n---\n\n## Übersicht der Phasen und Entscheidungen\n\n```mermaid\nflowchart TD\n    Start[User klickt 'Start'] --> P1[Phase 1: Demo & Countdown\\nLottie Animation]\n    P1 --> P2[Phase 2: Live-Erfassung\\nComplementary Filter & SVG UI]\n    P2 --> P3[Phase 3: Trajektorien-Vergleich\\nZustandsmaschine / FSM]\n    P3 --> P4[Phase 4: Multi-Sensory Feedback\\nexpo-haptics & Sound]\n```\n\n---\n\n## Phase 1: Grafische Übungsdemonstration\n\n### Entscheidung\nFür die grafische Demonstration der Übungsbewegungen werden **Lottie-Animationen (`lottie-react-native`)** verwendet.\n\n### Begründung\n* **Performance:** Lottie rendert vektorbasierte JSON-Dateien nativ auf dem Gerät. Dies spart erheblichen Speicherplatz im App-Bundle im Vergleich zu MP4-Videos oder GIF-Dateien und verhindert Ruckeln bei schwächerer Hardware.\n* **Flexibilität:** Die Abspielgeschwindigkeit (Cadence) kann programmgesteuert angepasst werden, um sie beispielsweise an das individuelle Tempo des Nutzers anzupassen.\n* **Design-Konsistenz:** Vektorgrafiken skalieren ohne Qualitätsverlust auf allen Bildschirmgrößen und passen perfekt zum modernen Dark-Mode/Glassmorphismus-Design der App.\n\n### Ablauf\n1. Der Trainierende klickt auf „Start“.\n2. Die App wechselt in den Zustand `preparing` und zeigt die Lottie-Loop-Animation der gewählten Übung.\n3. Ein 3-sekündiger optischer Countdown wird eingeblendet, um dem Trainierenden Zeit zu geben, sich in Position zu bringen.\n4. Nach Ablauf des Countdowns vibriert das Handy kurz, und die BLE-Datenaufzeichnung startet (`isRecording: true`).\n\n---\n\n## Phase 2: Echtzeit-Visualisierung & Sensor-Fusion\n\n### Entscheidung\n* **Sensor-Fusion:** Einsatz eines **Komplementärfilters (Complementary Filter)** zur Berechnung der Neigungswinkel aus Beschleunigungssensor und Gyroskop.\n* **UI:** Ein dynamischer, glühender **SVG-Progress-Ring** und eine Winkelanzeige visualisieren den Bewegungsfortschritt.\n\n### Begründung\n* **Latenz & Drift:** Die rohen Beschleunigungsdaten der IMU (XIAO nRF52840) neigen bei Erschütterungen zu starkem Rauschen, während die integrierten Gyroskopdaten über die Zeit abdriften (Drift). Der Komplementärfilter löst beide Probleme hocheffizient bei minimalem Rechenaufwand:\n  $$\\theta_{t} = \\alpha \\cdot (\\theta_{t-1} + \\omega \\cdot \\Delta t) + (1 - \\alpha) \\cdot \\theta_{\\text{acc}}$$\n  *Mit $\\alpha = 0.96$, $\\omega = \\text{Gyroskop-Drehrate}$ und $\\theta_{\\text{acc}} = \\text{Winkel aus Beschleunigungsdaten}$.*\n* **Latenz ≤ 100 ms (NF1):** Da der Filter direkt im Frontend auf den eingehenden BLE-Paketen rechnet, entfallen Netzwerk-Latenzen für die Kern-Visualisierung.\n* **Aesthetics:** Ein moderner, ringförmiger SVG-Fortschrittsbalken mit weichem Glüh-Effekt (Drop Shadow) fügt sich nahtlos in das restliche UI-Design ein.\n\n---\n\n## Phase 3: Vergleich mit der Zielvorgabe\n\n### Entscheidung\nDer Vergleich der Bewegung mit der Zielvorgabe erfolgt über eine **schwellenwertbasierte Zustandsmaschine (Finite State Machine - FSM)** statt rechenintensiver Machine-Learning-Modelle oder DTW auf dem Smartphone.\n\n### Begründung\n* **Ressourceneffizienz:** Für Standard-Fitnessübungen (z. B. Kniebeugen, Brizeps-Curls, Schulterdrücken) ist die Bewegung primär durch den Bewegungsumfang (Range of Motion - ROM) auf einer Hauptachse definiert. Eine FSM benötigt minimale Rechenleistung und schont den Akku des Mobilgeräts.\n* **Echtzeitfähigkeit:** Auswertungen können ohne spürbare Verzögerungen (sofort nach Erreichen des Zielwinkels) getroffen werden.\n\n### FSM-Zustände\n```mermaid\nstateDiagram-v2\n    [*] --> Start : Winkel < 15°\n    Start --> Moving : Winkel steigt > 20°\n    Moving --> Peak : Winkel >= Zielwinkel (z.B. 90°)\n    Peak --> Returning : Winkel sinkt\n    Returning --> Start : Winkel < 15° (Repetition +1)\n```\n\n---\n\n## Phase 4: Positives Feedback & Gamification\n\n### Entscheidung\nEinbindung eines **Multi-Sensory-Feedback-Systems** bestehend aus:\n* **Haptik:** Vibrations-Feedback über `expo-haptics`.\n* **Visuals:** Dynamische Farbänderungen der UI und Partikeleffekte bei Erfolg.\n* **Audio:** Ein kurzer, angenehmer Benachrichtigungston über `expo-av`.\n\n### Begründung\n* **Haptik:** Während des Trainings schaut der Trainierende oft nicht direkt auf den Bildschirm (z. B. bei Kniebeugen). Ein kurzes haptisches Signal beim Erreichen des Peak-Winkels und beim Abschluss der Wiederholung ist daher essenziell für die Usability.\n* **Visuelle Belohnung:** Der Fortschrittsring wechselt beim Erreichen des Zielwinkels seine Farbe von Blau/Türkis zu einem leuchtenden Smaragdgrün, um ein sofortiges Erfolgsgefühl zu vermitteln.\n\n---\n\n## Technische Blaupause (TypeScript-Referenz)\n\nFolgender Code skizziert die Realisierung des Tracking-Hooks:\n\n```typescript\nimport { useState, useRef } from 'react';\nimport * as Haptics from 'expo-haptics';\nimport { Audio } from 'expo-av';\nimport { IMUReading } from '@/store';\n\nexport type ExerciseState = 'start' | 'moving' | 'peak' | 'returning';\n\nexport function useExerciseTracker(targetAngle = 90) {\n  const [angle, setAngle] = useState(0);\n  const [reps, setReps] = useState(0);\n  const [state, setState] = useState<ExerciseState>('start');\n  \n  const lastTime = useRef<number>(Date.now());\n  const currentAngle = useRef<number>(0);\n\n  const updateMeasurement = async (reading: IMUReading) => {\n    const now = Date.now();\n    const dt = (now - lastTime.current) / 1000.0;\n    lastTime.current = now;\n\n    // 1. Beschleunigungswinkel berechnen (z.B. Pitch)\n    const accelAngle = Math.atan2(reading.accelY, reading.accelZ) * (180 / Math.PI);\n\n    // 2. Gyroskop-Integration & Komplementärfilter\n    const alpha = 0.96;\n    currentAngle.current = alpha * (currentAngle.current + reading.gyroX * dt) + (1 - alpha) * accelAngle;\n    \n    const absoluteAngle = Math.abs(currentAngle.current);\n    setAngle(absoluteAngle);\n\n    // 3. FSM für Wiederholungs- & Peak-Erkennung\n    switch (state) {\n      case 'start':\n        if (absoluteAngle > 20) {\n          setState('moving');\n        }\n        break;\n      case 'moving':\n        if (absoluteAngle >= targetAngle) {\n          setState('peak');\n          // Sofortiges haptisches Feedback bei Erfolg\n          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);\n          // Optionaler Sound\n          playSuccessSound();\n        }\n        break;\n      case 'peak':\n        if (absoluteAngle < targetAngle - 5) {\n          setState('returning');\n        }\n        break;\n      case 'returning':\n        if (absoluteAngle < 15) {\n          setState('start');\n          setReps((r) => r + 1); // Zähler erhöhen\n        }\n        break;\n    }\n  };\n\n  const playSuccessSound = async () => {\n    const { sound } = await Audio.Sound.createAsync(\n      require('@/assets/sounds/success.mp3')\n    );\n    await sound.playAsync();\n  };\n\n  return { angle, reps, state, updateMeasurement };\n}\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "Architekturentscheidungen: Echtzeit-Training & Bewegungserfassung",
          "line": 1
        },
        {
          "level": 2,
          "text": "Übersicht der Phasen und Entscheidungen",
          "line": 7
        },
        {
          "level": 2,
          "text": "Phase 1: Grafische Übungsdemonstration",
          "line": 19
        },
        {
          "level": 3,
          "text": "Entscheidung",
          "line": 21
        },
        {
          "level": 3,
          "text": "Begründung",
          "line": 24
        },
        {
          "level": 3,
          "text": "Ablauf",
          "line": 29
        },
        {
          "level": 2,
          "text": "Phase 2: Echtzeit-Visualisierung & Sensor-Fusion",
          "line": 37
        },
        {
          "level": 3,
          "text": "Entscheidung",
          "line": 39
        },
        {
          "level": 3,
          "text": "Begründung",
          "line": 43
        },
        {
          "level": 2,
          "text": "Phase 3: Vergleich mit der Zielvorgabe",
          "line": 52
        },
        {
          "level": 3,
          "text": "Entscheidung",
          "line": 54
        },
        {
          "level": 3,
          "text": "Begründung",
          "line": 57
        },
        {
          "level": 3,
          "text": "FSM-Zustände",
          "line": 61
        },
        {
          "level": 2,
          "text": "Phase 4: Positives Feedback & Gamification",
          "line": 73
        },
        {
          "level": 3,
          "text": "Entscheidung",
          "line": 75
        },
        {
          "level": 3,
          "text": "Begründung",
          "line": 81
        },
        {
          "level": 2,
          "text": "Technische Blaupause (TypeScript-Referenz)",
          "line": 87
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "app/architecture.md",
      "title": "MoveLink Mobile App - Container-Architektur",
      "content": "# MoveLink Mobile App - Container-Architektur\n\nDieses Dokument beschreibt die Mobile App als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Android Package (.apk) / iOS IPA\n* **Technologie-Stack:** React Native, Expo, TypeScript, Zustand, BLE PLX\n\n## Beschreibung\nDie MoveLink Mobile App ist die primäre Benutzerschnittstelle des Systems. Sie läuft auf Android- und iOS-Endgeräten und verbindet sich über Bluetooth Low Energy (BLE) mit dem embedded Sensor-Gerät, um Bewegungsdaten in Echtzeit zu erfassen, zu visualisieren und zur persistenten Speicherung an das Backend zu übertragen.\n\n```mermaid\nflowchart TD\n    User[Trainierender] -->|Interagiert mit| App[React Native App Container]\n    App -->|BLE Bluetooth| Sensor[Sensor Firmware Container]\n    App -->|REST/WebSockets| Backend[Backend API Container]\n```\n\n## Komponenten in diesem Container\nDie App enthält mehrere Komponenten (C4-Komponenten-Ebene):\n1. **SideNav**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1)\n2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)\n3. **LiveChart**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA6)\n4. **SessionCard**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA7)\n5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)\n",
      "headings": [
        {
          "level": 1,
          "text": "MoveLink Mobile App - Container-Architektur",
          "line": 1
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 5
        },
        {
          "level": 2,
          "text": "Beschreibung",
          "line": 11
        },
        {
          "level": 2,
          "text": "Komponenten in diesem Container",
          "line": 21
        }
      ],
      "c4_level": "Container",
      "deployable": "Ja"
    },
    {
      "path": "app/components/architecture.md",
      "title": "App Komponenten",
      "content": "# App Komponenten\n\nDiese Verzeichnis enthält die UI-Komponenten der Mobile-/Web-Anwendung (z.B. Visualisierungen, Charts, Navigation).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Datenfluss in UI-Komponenten\n\nDie Komponenten erhalten Daten über Props oder den globalen Store und rendern diese reaktiv.\n\n```mermaid\nflowchart LR\n    Store[Globaler Store] -->|Reaktive Updates| SensorCard[SensorCard / LiveChart]\n    SensorCard -->|Klick / Aktion| Actions[Store Actions]\n    Actions -->|Dispatch| Store\n```\n\n- **LiveChart**: Rendert eintreffende Datenpunkte in Echtzeit.\n- **SensorCard**: Zeigt den aktuellen Status und Verbindungszustand von Bluetooth-Geräten.\n",
      "headings": [
        {
          "level": 1,
          "text": "App Komponenten",
          "line": 1
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 5
        },
        {
          "level": 2,
          "text": "Datenfluss in UI-Komponenten",
          "line": 9
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    },
    {
      "path": "app/components/ProfileCard/architecture.md",
      "title": "Profil-Karte (ProfileCard)",
      "content": "# Profil-Karte (ProfileCard)\n\nDiese Komponente zeigt die Profildetails des angemeldeten Benutzers an.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Mobile App Containers)\n\n## Datenfluss\n```mermaid\nflowchart LR\n    JWT[Authentifizierungs-Token] -->|1. User-ID auslesen| Controller[ProfileController]\n    Controller -->|2. Query| DB[(Datenbank)]\n    DB -->|3. Rohdaten| Controller\n    Controller -->|4. Bereinigtes Profil DTO| Client[ProfileCard UI]\n```\n",
      "headings": [
        {
          "level": 1,
          "text": "Profil-Karte (ProfileCard)",
          "line": 1
        },
        {
          "level": 2,
          "text": "C4-Architektur-Ebene",
          "line": 5
        },
        {
          "level": 2,
          "text": "Datenfluss",
          "line": 9
        }
      ],
      "c4_level": "Component",
      "deployable": "Nein"
    }
  ],
  "definitions": {
    "FA3": {
      "id": "FA3",
      "title": "BLE Verbindungsaufbau (UC-1)** Das System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen. ```",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 35,
      "links": [
        "UC-1"
      ],
      "type": "FA"
    },
    "FA5": {
      "id": "FA5",
      "title": "Datenstrom-Verarbeitung Das System muss kontinuierliche Bewegungsdatenströme vom Sensor empfangen, filtern und verarbeiten können. *(Bezug: UC-2)*",
      "file": "doc/Requirements.md",
      "line": 21,
      "links": [
        "UC-2"
      ],
      "type": "FA"
    },
    "NF1": {
      "id": "NF1",
      "title": "Latenz Die End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.",
      "file": "doc/Requirements.md",
      "line": 40,
      "links": [],
      "type": "NF"
    },
    "FA9": {
      "id": "FA9",
      "title": "Biofeedback und Auswertung Das System muss den Bewegungsfortschritt in Echtzeit visualisieren, mit der Zielvorgabe vergleichen und bei korrekter Durchführung positives Feedback (visuell und haptisch) ausgeben. *(Bezug: UC-2)*",
      "file": "doc/Requirements.md",
      "line": 33,
      "links": [
        "UC-2"
      ],
      "type": "FA"
    },
    "R2": {
      "id": "R2",
      "title": "Physisches Gehäuse Für das Trainingsgeräte braucht es einen Sensor. Dieser Sensor sollte bestenfalls nicht lose auf der Haut getragen werden",
      "file": "doc/Requirements.md",
      "line": 56,
      "links": [],
      "type": "R"
    },
    "FA1": {
      "id": "FA1",
      "title": "Dashboard und Navigation Das System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*",
      "file": "doc/Requirements.md",
      "line": 9,
      "links": [
        "UC-1",
        "UC-2",
        "UC-3"
      ],
      "type": "FA"
    },
    "FA2": {
      "id": "FA2",
      "title": "Bluetooth LE Signalstärke** Das System muss die BLE-Signalstärke des Sensors in Echtzeit ausgeben. ```",
      "file": "doc/AI_DOCUMENTATION_GUIDE.md",
      "line": 27,
      "links": [],
      "type": "FA"
    },
    "FA4": {
      "id": "FA4",
      "title": "Trainings-Detailansicht Das System muss eine detaillierte Ansicht für ein ausgewähltes Training anzeigen. *(Bezug: UC-2)*",
      "file": "doc/Requirements.md",
      "line": 18,
      "links": [
        "UC-2"
      ],
      "type": "FA"
    },
    "FA6": {
      "id": "FA6",
      "title": "Echtzeit-Visualisierung Das System muss die empfangenen Sensordaten und Bewegungen in Echtzeit visualisieren. *(Bezug: UC-2)*",
      "file": "doc/Requirements.md",
      "line": 24,
      "links": [
        "UC-2"
      ],
      "type": "FA"
    },
    "FA7": {
      "id": "FA7",
      "title": "Historische Analyse Das System muss historische Bewegungsdaten grafisch und statistisch anzeigen können. *(Bezug: UC-3)*",
      "file": "doc/Requirements.md",
      "line": 27,
      "links": [
        "UC-3"
      ],
      "type": "FA"
    },
    "FA8": {
      "id": "FA8",
      "title": "Übungs-Demonstration Das System muss eine grafische Demonstration der auszuführenden Übungsbewegung anzeigen, sobald das Training gestartet wird. *(Bezug: UC-2)*",
      "file": "doc/Requirements.md",
      "line": 30,
      "links": [
        "UC-2"
      ],
      "type": "FA"
    },
    "NF2": {
      "id": "NF2",
      "title": "Zuverlässigkeit und Reconnect Bei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.",
      "file": "doc/Requirements.md",
      "line": 43,
      "links": [],
      "type": "NF"
    },
    "NF3": {
      "id": "NF3",
      "title": "Benutzbarkeit (Usability) Das Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.",
      "file": "doc/Requirements.md",
      "line": 46,
      "links": [],
      "type": "NF"
    },
    "R1": {
      "id": "R1",
      "title": "Plattform-Kompatibilität Die mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.",
      "file": "doc/Requirements.md",
      "line": 53,
      "links": [],
      "type": "R"
    },
    "UC-1": {
      "id": "UC-1",
      "title": "Trainingsgerät verbinden",
      "file": "doc/UseCases.md",
      "line": 7,
      "links": [],
      "type": "UC"
    },
    "UC-2": {
      "id": "UC-2",
      "title": "Echtzeit-Training überwachen",
      "file": "doc/UseCases.md",
      "line": 21,
      "links": [],
      "type": "UC"
    },
    "UC-3": {
      "id": "UC-3",
      "title": "Trainingsdaten einsehen",
      "file": "doc/UseCases.md",
      "line": 37,
      "links": [],
      "type": "UC"
    }
  },
  "references": {
    "FA3": [
      {
        "file": "embedded/components/ble_streamer/BLEStreamer.h",
        "line": 6,
        "context": "// @implements FA3, FA5"
      },
      {
        "file": "embedded/components/ble_streamer/BLEStreamer.cpp",
        "line": 1,
        "context": "// @implements FA3, FA5"
      },
      {
        "file": "app/components/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, NF3"
      },
      {
        "file": "app/hooks/useBLE.ts",
        "line": 2,
        "context": "* @implements FA3, FA5, NF2"
      },
      {
        "file": "embedded/architecture.md",
        "line": 19,
        "context": "4. **[BLE-Streamer](file:///c:/Users/erlin/repo/movelink/embedded/components/ble_streamer/architecture.md)**: Überträgt die erfassten Daten an den App-Container. (Erfüllt: FA3, FA5)"
      },
      {
        "file": "embedded/components/ble_streamer/architecture.md",
        "line": 26,
        "context": "* **FA3: Verbindungsaufbau**: Ermöglicht der Mobile App den Bluetooth-Aufbau und das Pairing."
      },
      {
        "file": "doc/Requirements.md",
        "line": 15,
        "context": "**FA3**: Verbindungsaufbau"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 54,
        "context": "// @implements FA2, FA3, NF2"
      },
      {
        "file": "app/architecture.md",
        "line": 24,
        "context": "2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)"
      },
      {
        "file": "app/architecture.md",
        "line": 27,
        "context": "5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)"
      }
    ],
    "FA5": [
      {
        "file": "embedded/src/Executable.ino",
        "line": 2,
        "context": "* @implements FA5, FA9, NF1"
      },
      {
        "file": "embedded/components/ble_streamer/BLEStreamer.h",
        "line": 6,
        "context": "// @implements FA3, FA5"
      },
      {
        "file": "embedded/components/ble_streamer/BLEStreamer.h",
        "line": 9,
        "context": "// @implements FA5"
      },
      {
        "file": "embedded/components/ble_streamer/BLEStreamer.cpp",
        "line": 1,
        "context": "// @implements FA3, FA5"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.h",
        "line": 6,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.h",
        "line": 9,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.cpp",
        "line": 1,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.cpp",
        "line": 15,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.cpp",
        "line": 20,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/inferenz_engine/InferenceEngine.h",
        "line": 6,
        "context": "// @implements FA5, FA9"
      },
      {
        "file": "embedded/components/inferenz_engine/InferenceEngine.cpp",
        "line": 1,
        "context": "// @implements FA5, FA9"
      },
      {
        "file": "embedded/components/inferenz_engine/InferenceEngine.cpp",
        "line": 7,
        "context": "// @implements FA5, FA9"
      },
      {
        "file": "app/store/index.ts",
        "line": 2,
        "context": "* @implements FA5, FA9"
      },
      {
        "file": "app/hooks/useBLE.ts",
        "line": 2,
        "context": "* @implements FA3, FA5, NF2"
      },
      {
        "file": "app/hooks/useWebSocket.ts",
        "line": 2,
        "context": "* @implements FA5"
      },
      {
        "file": "embedded/architecture.md",
        "line": 16,
        "context": "1. **[Sensordatenerfassung (Loop)](file:///c:/Users/erlin/repo/movelink/embedded/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5, NF1)"
      },
      {
        "file": "embedded/architecture.md",
        "line": 17,
        "context": "2. **[Inferenz-Engine (Edge Impulse)](file:///c:/Users/erlin/repo/movelink/embedded/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5, FA9)"
      },
      {
        "file": "embedded/architecture.md",
        "line": 19,
        "context": "4. **[BLE-Streamer](file:///c:/Users/erlin/repo/movelink/embedded/components/ble_streamer/architecture.md)**: Überträgt die erfassten Daten an den App-Container. (Erfüllt: FA3, FA5)"
      },
      {
        "file": "embedded/components/ble_streamer/architecture.md",
        "line": 27,
        "context": "* **FA5: Datenstrom-Verarbeitung**: Streamt die Rohdaten kontinuierlich via BLE Characteristics."
      },
      {
        "file": "embedded/components/sensordatenerfassung/architecture.md",
        "line": 26,
        "context": "- **FA5: Datenstrom-Verarbeitung**: Die Sensordaten werden kontinuierlich erfasst und für die Klassifikation aufbereitet."
      },
      {
        "file": "embedded/components/inferenz_engine/architecture.md",
        "line": 29,
        "context": "- **FA5: Datenstrom-Verarbeitung**: Analyse des kontinuierlichen Datenstroms."
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 63,
        "context": "* @implements FA5, NF1"
      },
      {
        "file": "doc/UseCases.md",
        "line": 33,
        "context": "**Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung. *(Bezug: FA5, FA6, FA9)*"
      },
      {
        "file": "app/architecture.md",
        "line": 27,
        "context": "5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)"
      }
    ],
    "NF1": [
      {
        "file": "embedded/src/Executable.ino",
        "line": 2,
        "context": "* @implements FA5, FA9, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.h",
        "line": 6,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.h",
        "line": 9,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.cpp",
        "line": 1,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.cpp",
        "line": 15,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/components/sensordatenerfassung/IMUReader.cpp",
        "line": 20,
        "context": "// @implements FA5, NF1"
      },
      {
        "file": "embedded/architecture.md",
        "line": 16,
        "context": "1. **[Sensordatenerfassung (Loop)](file:///c:/Users/erlin/repo/movelink/embedded/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5, NF1)"
      },
      {
        "file": "embedded/architecture.md",
        "line": 23,
        "context": "- **Lokale Auswertung vs. Cloud-Streaming**: Das Ausführen der Inferenz-Engine direkt auf dem Xiao-Controller minimiert die Latenz (NF1) und spart Bandbreite bei der Funkübertragung."
      },
      {
        "file": "embedded/components/sensordatenerfassung/architecture.md",
        "line": 27,
        "context": "- **NF1: Latenz**: Durch die hardwarenahe I2C-Abfrage und das Vermeiden von blockierenden Delays wird eine niedrige E2E-Latenz ermöglicht."
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 17,
        "context": "* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 63,
        "context": "* @implements FA5, NF1"
      },
      {
        "file": "doc/Entscheidungen_Echtzeit_Training.md",
        "line": 47,
        "context": "* **Latenz ≤ 100 ms (NF1):** Da der Filter direkt im Frontend auf den eingehenden BLE-Paketen rechnet, entfallen Netzwerk-Latenzen für die Kern-Visualisierung."
      }
    ],
    "FA9": [
      {
        "file": "embedded/src/Executable.ino",
        "line": 2,
        "context": "* @implements FA5, FA9, NF1"
      },
      {
        "file": "embedded/components/led_display_controller/VisualFeedback.cpp",
        "line": 1,
        "context": "// @implements FA9"
      },
      {
        "file": "embedded/components/led_display_controller/VisualFeedback.cpp",
        "line": 12,
        "context": "// @implements FA9"
      },
      {
        "file": "embedded/components/led_display_controller/VisualFeedback.cpp",
        "line": 25,
        "context": "// @implements FA9"
      },
      {
        "file": "embedded/components/led_display_controller/VisualFeedback.cpp",
        "line": 69,
        "context": "// @implements FA9"
      },
      {
        "file": "embedded/components/led_display_controller/VisualFeedback.h",
        "line": 6,
        "context": "// @implements FA9"
      },
      {
        "file": "embedded/components/led_display_controller/VisualFeedback.h",
        "line": 9,
        "context": "// @implements FA9"
      },
      {
        "file": "embedded/components/led_display_controller/VisualFeedback.h",
        "line": 12,
        "context": "// @implements FA9"
      },
      {
        "file": "embedded/components/inferenz_engine/InferenceEngine.h",
        "line": 6,
        "context": "// @implements FA5, FA9"
      },
      {
        "file": "embedded/components/inferenz_engine/InferenceEngine.cpp",
        "line": 1,
        "context": "// @implements FA5, FA9"
      },
      {
        "file": "embedded/components/inferenz_engine/InferenceEngine.cpp",
        "line": 7,
        "context": "// @implements FA5, FA9"
      },
      {
        "file": "app/components/ProgressRing.tsx",
        "line": 2,
        "context": "* @implements FA6, FA9"
      },
      {
        "file": "app/store/index.ts",
        "line": 2,
        "context": "* @implements FA5, FA9"
      },
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1, FA4, FA6, FA8, FA9"
      },
      {
        "file": "embedded/architecture.md",
        "line": 17,
        "context": "2. **[Inferenz-Engine (Edge Impulse)](file:///c:/Users/erlin/repo/movelink/embedded/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5, FA9)"
      },
      {
        "file": "embedded/architecture.md",
        "line": 18,
        "context": "3. **[LED- & Display-Controller](file:///c:/Users/erlin/repo/movelink/embedded/components/led_display_controller/architecture.md)**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern. (Erfüllt: FA9)"
      },
      {
        "file": "embedded/components/led_display_controller/architecture.md",
        "line": 31,
        "context": "- **FA9: Biofeedback und Auswertung**: Ermöglicht sofortiges visuelles Biofeedback direkt an der Sensor-Hardware."
      },
      {
        "file": "embedded/components/inferenz_engine/architecture.md",
        "line": 30,
        "context": "- **FA9: Biofeedback und Auswertung**: Liefert die Grundlage für das unmittelbare Feedback (Erkennung sauberer vs. fehlerhafter Curls)."
      },
      {
        "file": "doc/UseCases.md",
        "line": 33,
        "context": "**Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung. *(Bezug: FA5, FA6, FA9)*"
      }
    ],
    "R2": [
      {
        "file": "embedded/architecture.md",
        "line": 20,
        "context": "5. **[Gehäuse](file:///c:/Users/erlin/repo/movelink/embedded/components/gehause/architecture.md)**: Bietet physischen Schutz, sodass das Tragen erleichtert wird. (Erfüllt: R2)"
      },
      {
        "file": "embedded/components/gehause/architecture.md",
        "line": 27,
        "context": "- **R2: Physisches Gehäuse**: Stabile Fixierung des Sensors am Arm, Schutz gegen Schweiß und Erschütterungen."
      }
    ],
    "FA1": [
      {
        "file": "app/app/(tabs)/_layout.tsx",
        "line": 2,
        "context": "* @implements FA1"
      },
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1, FA4, FA6, FA8, FA9"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 16,
        "context": "* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)"
      },
      {
        "file": "app/architecture.md",
        "line": 23,
        "context": "1. **SideNav**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1)"
      }
    ],
    "FA2": [
      {
        "file": "app/components/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, NF3"
      },
      {
        "file": "doc/Requirements.md",
        "line": 12,
        "context": "**FA2**: Geräte-Scanning"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 54,
        "context": "// @implements FA2, FA3, NF2"
      },
      {
        "file": "app/architecture.md",
        "line": 24,
        "context": "2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)"
      }
    ],
    "FA4": [
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1, FA4, FA6, FA8, FA9"
      }
    ],
    "FA6": [
      {
        "file": "app/components/ProgressRing.tsx",
        "line": 2,
        "context": "* @implements FA6, FA9"
      },
      {
        "file": "app/components/LiveChart.tsx",
        "line": 2,
        "context": "* @implements FA6"
      },
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1, FA4, FA6, FA8, FA9"
      },
      {
        "file": "doc/UseCases.md",
        "line": 33,
        "context": "**Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung. *(Bezug: FA5, FA6, FA9)*"
      },
      {
        "file": "app/architecture.md",
        "line": 25,
        "context": "3. **LiveChart**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA6)"
      }
    ],
    "FA7": [
      {
        "file": "app/components/SessionCard.tsx",
        "line": 2,
        "context": "* @implements FA7"
      },
      {
        "file": "app/app/(tabs)/history.tsx",
        "line": 2,
        "context": "* @implements FA7"
      },
      {
        "file": "app/architecture.md",
        "line": 26,
        "context": "4. **SessionCard**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA7)"
      }
    ],
    "FA8": [
      {
        "file": "app/components/ExerciseDemo.tsx",
        "line": 2,
        "context": "* @implements FA8"
      },
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA1, FA4, FA6, FA8, FA9"
      },
      {
        "file": "doc/UseCases.md",
        "line": 31,
        "context": "**Ausgabe**: Die App demonstriert grafisch die auszuführende Übungsbewegung. *(Bezug: FA8)*"
      }
    ],
    "NF2": [
      {
        "file": "app/hooks/useBLE.ts",
        "line": 2,
        "context": "* @implements FA3, FA5, NF2"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 54,
        "context": "// @implements FA2, FA3, NF2"
      },
      {
        "file": "app/architecture.md",
        "line": 27,
        "context": "5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)"
      }
    ],
    "NF3": [
      {
        "file": "app/components/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, NF3"
      },
      {
        "file": "app/architecture.md",
        "line": 24,
        "context": "2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)"
      }
    ],
    "R1": [
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 18,
        "context": "* **`R-X`**: Randbedingungen (z. B. `R1`)"
      }
    ],
    "UC-1": [
      {
        "file": "doc/Requirements.md",
        "line": 10,
        "context": "Das System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 13,
        "context": "Das System muss eine Liste verfügbarer Bluetooth-Hardwaregeräte anzeigen und den aktuellen Verbindungsstatus visualisieren. *(Bezug: UC-1)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 16,
        "context": "Das System muss in der Lage sein, eine stabile Bluetooth-Verbindung mit dem IMU-Sensor herzustellen. *(Bezug: UC-1)*"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 15,
        "context": "* **`UC-X`**: Use Cases (z. B. `UC-1`)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 24,
        "context": "**UC-1: Live-Ansicht der Übungen**"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 32,
        "context": "Um Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 35,
        "context": "**FA3: BLE Verbindungsaufbau (UC-1)**"
      }
    ],
    "UC-2": [
      {
        "file": "doc/Requirements.md",
        "line": 10,
        "context": "Das System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 19,
        "context": "Das System muss eine detaillierte Ansicht für ein ausgewähltes Training anzeigen. *(Bezug: UC-2)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 22,
        "context": "Das System muss kontinuierliche Bewegungsdatenströme vom Sensor empfangen, filtern und verarbeiten können. *(Bezug: UC-2)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 25,
        "context": "Das System muss die empfangenen Sensordaten und Bewegungen in Echtzeit visualisieren. *(Bezug: UC-2)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 31,
        "context": "Das System muss eine grafische Demonstration der auszuführenden Übungsbewegung anzeigen, sobald das Training gestartet wird. *(Bezug: UC-2)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 34,
        "context": "Das System muss den Bewegungsfortschritt in Echtzeit visualisieren, mit der Zielvorgabe vergleichen und bei korrekter Durchführung positives Feedback (visuell und haptisch) ausgeben. *(Bezug: UC-2)*"
      },
      {
        "file": "doc/Entscheidungen_Echtzeit_Training.md",
        "line": 3,
        "context": "Dieses Dokument dokumentiert die Architekturentscheidungen zur Implementierung des interaktiven Trainings-Workflows (Bezug: **UC-2**, Schritte 3 & 4) in der MoveLink Mobile App."
      }
    ],
    "UC-3": [
      {
        "file": "doc/Requirements.md",
        "line": 10,
        "context": "Das System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*"
      },
      {
        "file": "doc/Requirements.md",
        "line": 28,
        "context": "Das System muss historische Bewegungsdaten grafisch und statistisch anzeigen können. *(Bezug: UC-3)*"
      }
    ]
  },
  "codeContents": {
    "embedded/architecture.md": "# MoveLink Embedded Firmware - Container-Architektur\n\nDieses Dokument beschreibt die Embedded Sensor-Firmware als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Binär-Firmware (flashed via USB/Serial)\n* **Technologie-Stack:** Arduino C/C++, LSM6DS3 IMU Library, Edge Impulse SDK, Bluetooth Low Energy\n\n## Beschreibung\nDie Sensor-Firmware läuft auf dem XIAO nRF52840 Sense Controller. Sie erfasst Beschleunigungs- und Rotationsdaten über den integrierten LSM6DS3-Sensor mit einer festen Abtastrate (50Hz), wendet Signalfilterungen zur Rauschunterdrückung an und streamt die Datenpakete als binäres Array via BLE Characteristics an die Mobile App. Alternativ führt sie Edge-Impulse-Inferenzmodelle direkt auf dem Mikrocontroller aus, um Trainingsübungen (z.B. Bizeps-Curls) lokal zu klassifizieren und Fehler über die integrierten RGB-LEDs anzuzeigen.\n\n## Komponenten in diesem Container\nDie Sensor-Firmware besteht aus folgenden logischen Komponenten:\n1. **[Sensordatenerfassung (Loop)](file:///c:/Users/erlin/repo/movelink/embedded/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5, NF1)\n2. **[Inferenz-Engine (Edge Impulse)](file:///c:/Users/erlin/repo/movelink/embedded/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5, FA9)\n3. **[LED- & Display-Controller](file:///c:/Users/erlin/repo/movelink/embedded/components/led_display_controller/architecture.md)**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern. (Erfüllt: FA9)\n4. **[BLE-Streamer](file:///c:/Users/erlin/repo/movelink/embedded/components/ble_streamer/architecture.md)**: Überträgt die erfassten Daten an den App-Container. (Erfüllt: FA3, FA5)\n5. **[Gehäuse](file:///c:/Users/erlin/repo/movelink/embedded/components/gehause/architecture.md)**: Bietet physischen Schutz, sodass das Tragen erleichtert wird. (Erfüllt: R2)\n\n## Abwägungen\n- **Lokale Auswertung vs. Cloud-Streaming**: Das Ausführen der Inferenz-Engine direkt auf dem Xiao-Controller minimiert die Latenz (NF1) und spart Bandbreite bei der Funkübertragung.\n- **Energiebedarf**: OLED-Display und kontinuierliche Sensordatenerfassung verbrauchen signifikant Energie, weshalb Akkulaufzeiten durch Cooldown-Zeiten und Schlafmodi im Idle optimiert werden müssen.\n",
    "embedded/components/ble_streamer/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# BLE-Streamer\n\nDiese Komponente überträgt die erfassten 6-Achsen-Sensordaten (Beschleunigung und Rotation) in Echtzeit per Bluetooth Low Energy (BLE) an die Mobile App.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDer BLE-Streamer initialisiert den nRF52840-Bluetooth-Stack, stellt einen GATT-Service mit einer IMU-Characteristic bereit und sendet die gefilterten Sensor-Messwerte (Beschleunigung in X, Y, Z und Drehraten in X, Y, Z) als binären 24-Byte-Puffer (6 float-Werte) an verbundene Clients.\n\n### GATT Profile & UUIDs\n* **Service-UUID:** `12345678-1234-1234-1234-123456789012`\n* **Characteristic-UUID:** `12345678-1234-1234-1234-123456789013` (BLERead | BLENotify)\n* **Paketformat:** 24 Bytes (6 float-Werte, IEEE 754 float32, little-endian):\n  `[accelX, accelY, accelZ, gyroX, gyroY, gyroZ]`\n\n## Implementierung & Traceability\n* **Implementiert in:** [BLEStreamer.cpp](file:///c:/Users/erlin/repo/movelink/embedded/components/ble_streamer/BLEStreamer.cpp)\n* **Erfüllt Anforderungen:**\n  * **FA3: Verbindungsaufbau**: Ermöglicht der Mobile App den Bluetooth-Aufbau und das Pairing.\n  * **FA5: Datenstrom-Verarbeitung**: Streamt die Rohdaten kontinuierlich via BLE Characteristics.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    IMU[Sensor-Rohwerte] -->|ax, ay, az, gx, gy, gz| Streamer[BLE-Streamer Component]\n    Streamer -->|GATT Notification (24 Bytes)| App[Mobile App useBLE Hook]\n```\n",
    "embedded/components/inferenz_engine/InferenceEngine.h": "#ifndef INFERENCE_ENGINE_H\n#define INFERENCE_ENGINE_H\n\n#include <Arduino.h>\n\n// @implements FA5, FA9\nbool runModelInference(float* buffer, String& outLabel, float& outConfidence, float& outAnomaly);\n\n#endif // INFERENCE_ENGINE_H\n",
    "app/components/ProgressRing.tsx": "/**\n * @implements FA6, FA9\n */\nimport React from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\nimport Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';\nimport Animated, {\n  useAnimatedProps,\n  useDerivedValue,\n  withSpring,\n  useAnimatedStyle,\n  withSequence,\n  withTiming,\n} from 'react-native-reanimated';\nimport { Colors } from '@/constants/Colors';\nimport { GlassCard } from '@/components/GlassCard';\nimport { ExerciseState } from '@/store';\n\ninterface Props {\n  angle: number;\n  targetAngle: number;\n  repCount: number;\n  exerciseState: ExerciseState;\n}\n\nconst AnimatedCircle = Animated.createAnimatedComponent(Circle);\n\nconst SIZE = 220;\nconst STROKE_WIDTH = 14;\nconst RADIUS = (SIZE - STROKE_WIDTH) / 2;\nconst CIRCUMFERENCE = 2 * Math.PI * RADIUS;\n\nexport function ProgressRing({ angle, targetAngle, repCount, exerciseState }: Props) {\n  const isPeak = exerciseState === 'peak';\n  \n  // Calculate raw progress (capped at 1.0)\n  const rawProgress = Math.min(1.0, Math.max(0, angle / targetAngle));\n  \n  // Create an animated derived value for smooth transitions\n  const animatedProgress = useDerivedValue(() => {\n    return withSpring(rawProgress, { damping: 15, stiffness: 120 });\n  });\n\n  const animatedCircleProps = useAnimatedProps(() => {\n    const strokeDashoffset = CIRCUMFERENCE * (1 - animatedProgress.value);\n    return {\n      strokeDashoffset,\n    };\n  });\n\n  // Pulse effect when the user completes a repetition\n  const repScale = useDerivedValue(() => {\n    return withSpring(1.0, { damping: 10, stiffness: 100 });\n  });\n\n  const animatedRepStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ scale: isPeak ? withSequence(withTiming(1.15, { duration: 100 }), withSpring(1.0)) : 1.0 }],\n    };\n  });\n\n  return (\n    <GlassCard style={styles.card}>\n      <View style={styles.container}>\n        <Svg width={SIZE} height={SIZE} style={styles.svg}>\n          <Defs>\n            <LinearGradient id=\"ringGrad\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n              <Stop offset=\"0%\" stopColor={isPeak ? Colors.primaryLight : Colors.accentX} />\n              <Stop offset=\"100%\" stopColor={isPeak ? Colors.primary : Colors.primary} />\n            </LinearGradient>\n          </Defs>\n\n          {/* Background circle track */}\n          <Circle\n            cx={SIZE / 2}\n            cy={SIZE / 2}\n            r={RADIUS}\n            stroke=\"rgba(0,255,180,0.03)\"\n            strokeWidth={STROKE_WIDTH}\n            fill=\"transparent\"\n          />\n\n          {/* Active progress track */}\n          <AnimatedCircle\n            cx={SIZE / 2}\n            cy={SIZE / 2}\n            r={RADIUS}\n            stroke=\"url(#ringGrad)\"\n            strokeWidth={STROKE_WIDTH}\n            fill=\"transparent\"\n            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}\n            animatedProps={animatedCircleProps}\n            strokeLinecap=\"round\"\n            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`} // Rotate to start from top\n          />\n        </Svg>\n\n        {/* Content inside the ring */}\n        <View style={styles.innerContent}>\n          <Text style={[styles.angleText, isPeak && styles.angleTextPeak]}>\n            {angle}°\n          </Text>\n          <Text style={styles.angleLabel}>\n            Ziel: {targetAngle}°\n          </Text>\n\n          <Animated.View style={[styles.repBox, animatedRepStyle]}>\n            <Text style={[styles.repValue, isPeak && styles.repValuePeak]}>\n              {repCount}\n            </Text>\n            <Text style={styles.repLabel}>Wdh.</Text>\n          </Animated.View>\n        </View>\n      </View>\n\n      {/* State indicator banner */}\n      <View style={[styles.badge, isPeak && styles.badgeActive]}>\n        <Text style={[styles.badgeText, isPeak && styles.badgeTextActive]}>\n          {exerciseState === 'start' && 'BEREIT'}\n          {exerciseState === 'moving' && 'BEWEGUNG...'}\n          {exerciseState === 'peak' && '🔥 ZIEL ERREICHT!'}\n          {exerciseState === 'returning' && 'ZURÜCKFÜHREN'}\n        </Text>\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: { padding: 24, alignItems: 'center', gap: 20 },\n  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },\n  svg: { position: 'absolute' },\n  innerContent: { alignItems: 'center', justifyContent: 'center', gap: 2 },\n  \n  angleText: {\n    color: Colors.text,\n    fontSize: 42,\n    fontWeight: '900',\n    letterSpacing: -1,\n  },\n  angleTextPeak: {\n    color: Colors.primaryLight,\n    textShadowColor: Colors.primaryGlow,\n    textShadowRadius: 15,\n  },\n  angleLabel: {\n    color: Colors.textSub,\n    fontSize: 12,\n    fontWeight: '600',\n    textTransform: 'uppercase',\n    letterSpacing: 0.5,\n    marginBottom: 6,\n  },\n  \n  repBox: {\n    alignItems: 'center',\n    backgroundColor: 'rgba(0,0,0,0.2)',\n    paddingHorizontal: 16,\n    paddingVertical: 4,\n    borderRadius: 12,\n    borderWidth: 1,\n    borderColor: 'rgba(0,255,180,0.06)',\n  },\n  repValue: {\n    color: Colors.primary,\n    fontSize: 20,\n    fontWeight: '800',\n  },\n  repValuePeak: {\n    color: Colors.primaryLight,\n  },\n  repLabel: {\n    color: Colors.textSub,\n    fontSize: 10,\n    fontWeight: '700',\n    textTransform: 'uppercase',\n  },\n\n  badge: {\n    paddingHorizontal: 16,\n    paddingVertical: 6,\n    borderRadius: 20,\n    backgroundColor: 'rgba(255,255,255,0.03)',\n    borderWidth: 1,\n    borderColor: 'rgba(255,255,255,0.05)',\n  },\n  badgeActive: {\n    backgroundColor: Colors.primaryDim,\n    borderColor: Colors.primaryGlow,\n  },\n  badgeText: {\n    color: Colors.textSub,\n    fontSize: 11,\n    fontWeight: '800',\n    letterSpacing: 1,\n  },\n  badgeTextActive: {\n    color: Colors.primaryLight,\n  },\n});\n",
    "app/app/(tabs)/history.tsx": "/**\n * @implements FA7\n */\nimport React, { useEffect, useState } from 'react';\nimport { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';\nimport { LinearGradient } from 'expo-linear-gradient';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { AnimatedLogo } from '@/components/AnimatedLogo';\nimport { Colors } from '@/constants/Colors';\nimport { useTrainingStore, TrainingSession } from '@/store';\nimport { SessionCard } from '@/components/SessionCard';\n\nconst API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';\n\nexport default function HistoryScreen() {\n  const { sessions, setSessions } = useTrainingStore();\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  async function fetchSessions() {\n    setLoading(true);\n    setError(null);\n    try {\n      const res = await fetch(`${API_BASE}/api/sessions`);\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      const data: TrainingSession[] = await res.json();\n      setSessions(data);\n    } catch {\n      setError('Backend nicht erreichbar.\\nLäuft docker compose up?');\n    } finally {\n      setLoading(false);\n    }\n  }\n\n  useEffect(() => { fetchSessions(); }, []);\n\n  return (\n    <SafeAreaView style={styles.safe}>\n      <StatusBar barStyle=\"light-content\" backgroundColor={Colors.bg} />\n\n      {/* Fixed header — always visible */}\n      <View style={styles.header}>\n        <FadeSlide delay={0}>\n          <AnimatedLogo />\n          <Text style={styles.pageTitle}>Verlauf</Text>\n        </FadeSlide>\n      </View>\n\n      {/* Content area fills remaining space */}\n      <View style={styles.body}>\n        {loading && (\n          <View style={styles.center}>\n            <ActivityIndicator color={Colors.primary} size=\"large\" />\n            <Text style={styles.loadingText}>Lade Einheiten…</Text>\n          </View>\n        )}\n\n        {!loading && error && (\n          <FadeSlide from={{ opacity: 0, scale: 0.96, translateY: 0 }} style={styles.center as any}>\n            <View style={styles.errorCard}>\n              <Text style={styles.errorIcon}>⚠️</Text>\n              <Text style={styles.errorText}>{error}</Text>\n              <TouchableOpacity style={styles.retryBtn} onPress={fetchSessions}>\n                <Text style={styles.retryText}>Erneut versuchen</Text>\n              </TouchableOpacity>\n            </View>\n          </FadeSlide>\n        )}\n\n        {!loading && !error && sessions.length === 0 && (\n          <FadeSlide style={styles.center as any}>\n            <LinearGradient colors={['rgba(0,212,170,0.06)', 'transparent']} style={styles.emptyCard}>\n              <Text style={styles.emptyIcon}>🏋️</Text>\n              <Text style={styles.emptyTitle}>Noch keine Einheiten</Text>\n              <Text style={styles.emptyBody}>Verbinde deinen Sensor und starte ein Training.</Text>\n            </LinearGradient>\n          </FadeSlide>\n        )}\n\n        {!loading && !error && sessions.length > 0 && (\n          <FlatList\n            data={sessions}\n            keyExtractor={(item) => item.id}\n            contentContainerStyle={styles.list}\n            showsVerticalScrollIndicator={false}\n            ListHeaderComponent={\n              <Text style={styles.countLabel}>\n                {sessions.length} {sessions.length === 1 ? 'Einheit' : 'Einheiten'}\n              </Text>\n            }\n            renderItem={({ item, index }) => (\n              <SessionCard session={item} index={index} onPress={() => {}} />\n            )}\n            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}\n          />\n        )}\n      </View>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safe: { flex: 1, backgroundColor: 'transparent' },\n  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },\n  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 10, marginBottom: 4 },\n  body: { flex: 1 },\n  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },\n  loadingText: { color: Colors.textSub, fontSize: 13, marginTop: 12 },\n\n  errorCard: {\n    backgroundColor: Colors.surface, borderRadius: 20, padding: 28,\n    alignItems: 'center', gap: 12,\n    borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', maxWidth: 300,\n  },\n  errorIcon: { fontSize: 32 },\n  errorText: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20 },\n  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10, marginTop: 4 },\n  retryText: { color: Colors.bg, fontSize: 13, fontWeight: '700' },\n\n  emptyCard: {\n    borderRadius: 20, padding: 36, alignItems: 'center', gap: 10,\n    borderWidth: 1, borderColor: Colors.border,\n  },\n  emptyIcon: { fontSize: 40 },\n  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },\n  emptyBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 240 },\n\n  list: { paddingHorizontal: 20, paddingBottom: 40 },\n  countLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },\n});\n",
    "embedded/components/led_display_controller/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# LED- & Display-Controller\n\nDiese Komponente gibt dem Trainierenden direktes visuelles Feedback zur Qualität der Übungsausführung.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDer Controller steuert das SSD1306 OLED-Display sowie die integrierten RGB-LEDs des XIAO-Boards basierend auf den Klassifikationsergebnissen der Inferenz-Engine.\n\n### Feedback-Logik\n- **Ruhemodus (`idle` oder Konfidenz < 60%):**\n  - RGB-LED: **Blau** (Pin 12 auf LOW)\n  - Display: Zeigt `Status: IDLE` an.\n- **Saubere Ausführung (`curl_sauber`):**\n  - RGB-LED: **Grün** (Pin 13 auf LOW)\n  - Display: Zeigt `Curl: PERFEKT` an.\n- **Fehlerhafte Ausführung (z. B. `fehler_rotation`, `fehler_ellbogen`):**\n  - RGB-LED: **Rot** (Pin 11 auf LOW)\n  - Display: Zeigt `Achtung: FEHLER` an.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Executable.ino](file:///c:/Users/erlin/repo/movelink/embedded/src/Executable.ino) (unter Verwendung der U8x8-Bibliothek)\n- **Erfüllt Anforderungen:**\n  - **FA9: Biofeedback und Auswertung**: Ermöglicht sofortiges visuelles Biofeedback direkt an der Sensor-Hardware.\n\n## Kontrollfluss\n\n```mermaid\nflowchart TD\n    Result[Inferenz-Ergebnis] --> Check{Welche Klasse?}\n    Check -->|idle / <60%| Idle[Blau leuchten / 'IDLE' anzeigen]\n    Check -->|curl_sauber| Perfect[Grün leuchten / 'PERFEKT' anzeigen]\n    Check -->|Fehlerklasse| Error[Rot leuchten / 'FEHLER' anzeigen]\n```\n",
    "embedded/components/sensordatenerfassung/IMUReader.cpp": "// @implements FA5, NF1\n#include \"IMUReader.h\"\n#include <LSM6DS3.h>\n#include <Wire.h>\n\n#define CONVERT_G_TO_MS2    9.80665f\n#define MAX_ACCEPTED_RANGE  2.0f\n\nstatic LSM6DS3 myIMU(I2C_MODE, 0x6A);\n\nstatic float ei_get_sign(float number) {\n    return (number >= 0.0) ? 1.0 : -1.0;\n}\n\n// @implements FA5, NF1\nbool initIMU() {\n    return myIMU.begin();\n}\n\n// @implements FA5, NF1\nvoid readSensorData(float* buffer, size_t startIndex) {\n    // 1. Beschleunigung einlesen\n    buffer[startIndex + 0] = myIMU.readFloatAccelX();\n    buffer[startIndex + 1] = myIMU.readFloatAccelY();\n    buffer[startIndex + 2] = myIMU.readFloatAccelZ();\n\n    // 2. Gyroskop einlesen\n    buffer[startIndex + 3] = myIMU.readFloatGyroX();\n    buffer[startIndex + 4] = myIMU.readFloatGyroY();\n    buffer[startIndex + 5] = myIMU.readFloatGyroZ();\n\n    // Clamping & Umrechnung nur für die Beschleunigungs-Achsen (Index 0 bis 2)\n    for (int i = 0; i < 3; i++) {\n        if (fabs(buffer[startIndex + i]) > MAX_ACCEPTED_RANGE) {\n            buffer[startIndex + i] = ei_get_sign(buffer[startIndex + i]) * MAX_ACCEPTED_RANGE;\n        }\n        buffer[startIndex + i] *= CONVERT_G_TO_MS2;\n    }\n}\n",
    "app/components/ExerciseDemo.tsx": "/**\n * @implements FA8\n */\nimport React, { useEffect } from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\nimport Svg, { Line, Circle, G } from 'react-native-svg';\nimport Animated, {\n  useSharedValue,\n  useAnimatedProps,\n  withRepeat,\n  withSequence,\n  withTiming,\n} from 'react-native-reanimated';\nimport { Colors } from '@/constants/Colors';\nimport { GlassCard } from '@/components/GlassCard';\nimport { ExerciseType } from '@/store';\n\ninterface Props {\n  exercise: ExerciseType;\n  label?: string;\n}\n\nconst AnimatedLine = Animated.createAnimatedComponent(Line);\nconst AnimatedCircle = Animated.createAnimatedComponent(Circle);\n\nexport function ExerciseDemo({ exercise, label }: Props) {\n  const progress = useSharedValue(0);\n\n  useEffect(() => {\n    progress.value = 0;\n    progress.value = withRepeat(\n      withSequence(\n        withTiming(1, { duration: 1500 }), // In der Beugung verharren\n        withTiming(0, { duration: 1500 })  // Zurück zur Ausgangslage\n      ),\n      -1,\n      true\n    );\n  }, [exercise]);\n\n  // SQUAT COORDINATES INTERPOLATION\n  const squatKneeProps = useAnimatedProps(() => ({\n    x2: 130 + 25 * progress.value,\n    y2: 150 + 10 * progress.value,\n  }));\n\n  const squatThighProps = useAnimatedProps(() => {\n    const kx = 130 + 25 * progress.value;\n    const ky = 150 + 10 * progress.value;\n    return {\n      x1: kx,\n      y1: ky,\n      x2: 130 - 35 * progress.value,\n      y2: 95 + 50 * progress.value,\n    };\n  });\n\n  const squatTorsoProps = useAnimatedProps(() => {\n    const hx = 130 - 35 * progress.value;\n    const hy = 95 + 50 * progress.value;\n    return {\n      x1: hx,\n      y1: hy,\n      x2: 130 - 15 * progress.value,\n      y2: 35 + 55 * progress.value,\n    };\n  });\n\n  const squatHeadProps = useAnimatedProps(() => ({\n    cx: 130 - 15 * progress.value,\n    cy: 17 + 55 * progress.value,\n  }));\n\n  // CURL COORDINATES INTERPOLATION (Elbow fixed, forearm rotates)\n  const curlForearmProps = useAnimatedProps(() => {\n    const rad = (270 - 150 * progress.value) * (Math.PI / 180);\n    return {\n      x2: 120 + 50 * Math.cos(rad),\n      y2: 125 + 50 * Math.sin(rad),\n    };\n  });\n\n  const curlWristProps = useAnimatedProps(() => {\n    const rad = (270 - 150 * progress.value) * (Math.PI / 180);\n    return {\n      cx: 120 + 50 * Math.cos(rad),\n      cy: 125 + 50 * Math.sin(rad),\n    };\n  });\n\n  return (\n    <GlassCard style={styles.card}>\n      <Text style={styles.title}>{label || 'Ausführung demonstrieren'}</Text>\n      \n      <View style={styles.container}>\n        <Svg width=\"250\" height=\"230\" viewBox=\"0 0 250 230\">\n          {/* Ground indicator */}\n          <Line x1=\"40\" y1=\"210\" x2=\"210\" y2=\"210\" stroke={Colors.textMuted} strokeWidth={2} strokeDasharray=\"4 4\" />\n\n          {exercise === 'squat' ? (\n            <G>\n              {/* FIXED FEET / ANKLE */}\n              <Line x1=\"100\" y1=\"210\" x2=\"130\" y2=\"210\" stroke={Colors.primary} strokeWidth={6} strokeLinecap=\"round\" />\n              <Circle cx=\"130\" cy=\"210\" r=\"5\" fill={Colors.primary} />\n\n              {/* CALF (Ankle to Knee) */}\n              <AnimatedLine\n                x1={130}\n                y1={210}\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={squatKneeProps}\n              />\n              \n              {/* KNEE JOINT */}\n              <AnimatedCircle\n                r=\"4\"\n                fill={Colors.primaryLight}\n                animatedProps={useAnimatedProps(() => ({\n                  cx: 130 + 25 * progress.value,\n                  cy: 150 + 10 * progress.value,\n                }))}\n              />\n\n              {/* THIGH (Knee to Hip) */}\n              <AnimatedLine\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={squatThighProps}\n              />\n\n              {/* HIP JOINT */}\n              <AnimatedCircle\n                r=\"4\"\n                fill={Colors.primaryLight}\n                animatedProps={useAnimatedProps(() => ({\n                  cx: 130 - 35 * progress.value,\n                  cy: 95 + 50 * progress.value,\n                }))}\n              />\n\n              {/* TORSO (Hip to Shoulder) */}\n              <AnimatedLine\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={squatTorsoProps}\n              />\n\n              {/* SHOULDER JOINT */}\n              <AnimatedCircle\n                r=\"4\"\n                fill={Colors.primaryLight}\n                animatedProps={useAnimatedProps(() => ({\n                  cx: 130 - 15 * progress.value,\n                  cy: 35 + 55 * progress.value,\n                }))}\n              />\n\n              {/* HEAD */}\n              <AnimatedCircle\n                r=\"12\"\n                fill=\"transparent\"\n                stroke={Colors.primary}\n                strokeWidth={3}\n                animatedProps={squatHeadProps}\n              />\n            </G>\n          ) : (\n            <G>\n              {/* TORSO (Fixed upright body) */}\n              <Line x1=\"120\" y1=\"35\" x2=\"120\" y2=\"125\" stroke={Colors.textMuted} strokeWidth={4} strokeLinecap=\"round\" />\n              <Circle cx=\"120\" cy=\"22\" r=\"10\" fill=\"transparent\" stroke={Colors.textMuted} strokeWidth={2.5} />\n              \n              {/* UPPER ARM (Shoulder fixed to Elbow) */}\n              <Line x1=\"120\" y1=\"70\" x2=\"120\" y2=\"125\" stroke={Colors.primary} strokeWidth={5} strokeLinecap=\"round\" />\n              <Circle cx=\"120\" cy=\"70\" r=\"4\" fill={Colors.primaryLight} />\n              <Circle cx=\"120\" cy=\"125\" r=\"4\" fill={Colors.primaryLight} />\n\n              {/* FOREARM (Elbow to Wrist) */}\n              <AnimatedLine\n                x1={120}\n                y1={125}\n                stroke={Colors.primary}\n                strokeWidth={5}\n                strokeLinecap=\"round\"\n                animatedProps={curlForearmProps}\n              />\n              \n              {/* WRIST */}\n              <AnimatedCircle\n                r=\"5\"\n                fill={Colors.primaryLight}\n                animatedProps={curlWristProps}\n              />\n            </G>\n          )}\n        </Svg>\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: { padding: 20, alignItems: 'center', gap: 12 },\n  title: { color: Colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },\n  container: { height: 230, width: '100%', alignItems: 'center', justifyContent: 'center' },\n});\n",
    "app/app/(tabs)/index.tsx": "/**\n * @implements FA1, FA4, FA6, FA8, FA9\n */\nimport React, { useState, useEffect } from 'react';\nimport { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform, TouchableOpacity } from 'react-native';\nimport Animated, {\n  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,\n} from 'react-native-reanimated';\nimport { LinearGradient } from 'expo-linear-gradient';\nimport * as Haptics from 'expo-haptics';\nimport { Colors } from '@/constants/Colors';\nimport { useBLEStore, useTrainingStore, EXERCISE_TARGETS, ExerciseType } from '@/store';\nimport { useBLE } from '@/hooks/useBLE';\nimport { useWebSocket } from '@/hooks/useWebSocket';\nimport { SensorCard } from '@/components/SensorCard';\nimport { LiveChart } from '@/components/LiveChart';\nimport { AnimatedValue } from '@/components/AnimatedValue';\nimport { GradientButton } from '@/components/GradientButton';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { AnimatedLogo } from '@/components/AnimatedLogo';\nimport { GlassCard } from '@/components/GlassCard';\nimport { ExerciseDemo } from '@/components/ExerciseDemo';\nimport { ProgressRing } from '@/components/ProgressRing';\n\nfunction RecBadge() {\n  const opacity = useSharedValue(1);\n  React.useEffect(() => {\n    opacity.value = withRepeat(\n      withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),\n      -1\n    );\n  }, []);\n  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));\n\n  return (\n    <View style={styles.recBadge}>\n      <Animated.View style={[styles.recDot, dotStyle]} />\n      <Text style={styles.recLabel}>REC</Text>\n    </View>\n  );\n}\n\nexport default function TrainingScreen() {\n  const { status: bleStatus, deviceName, latestReading } = useBLEStore();\n  const { \n    status: trainingStatus,\n    exercise,\n    exerciseState,\n    repCount,\n    currentAngle,\n    countdown,\n    isRecording,\n    liveBuffer,\n    startTraining,\n    stopTraining,\n    resetTraining,\n    setCountdown,\n    startSession\n  } = useTrainingStore();\n  \n  const { startScan, disconnectDevice } = useBLE();\n  useWebSocket();\n\n  const [selectedEx, setSelectedEx] = useState<ExerciseType>('squat');\n\n  const isConnected = bleStatus === 'connected';\n\n  // Countdown controller\n  useEffect(() => {\n    if (trainingStatus !== 'preparing') return;\n    \n    setCountdown(3);\n    const timer = setInterval(() => {\n      const currentVal = useTrainingStore.getState().countdown;\n      const nextVal = currentVal - 1;\n      \n      if (nextVal <= 0) {\n        clearInterval(timer);\n        if (Platform.OS !== 'web') {\n          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});\n        }\n        startSession();\n      } else {\n        setCountdown(nextVal);\n        if (Platform.OS !== 'web') {\n          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});\n        }\n      }\n    }, 1000);\n\n    return () => clearInterval(timer);\n  }, [trainingStatus]);\n\n  return (\n    <SafeAreaView style={styles.safe}>\n      <StatusBar barStyle=\"light-content\" backgroundColor={Colors.bg} />\n      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>\n\n        {/* Header */}\n        <FadeSlide delay={50}>\n          <View style={styles.headerRow}>\n            <AnimatedLogo />\n            {isRecording && <RecBadge />}\n          </View>\n          <Text style={styles.pageTitle}>Training</Text>\n        </FadeSlide>\n\n        {/* 1. BLE Connection Status (Always visible at top when not actively training) */}\n        {trainingStatus === 'idle' && (\n          <FadeSlide delay={100}>\n            <SensorCard status={bleStatus} deviceName={deviceName} onScan={startScan} onDisconnect={disconnectDevice} />\n          </FadeSlide>\n        )}\n\n        {/* 2. PREPARING STATE: Demonstration and Countdown */}\n        {isConnected && trainingStatus === 'preparing' && (\n          <View style={styles.preparingContainer}>\n            <FadeSlide delay={100}>\n              <ExerciseDemo \n                exercise={exercise} \n                label={exercise === 'squat' ? 'Kniebeugen Vorführung' : 'Bizeps-Curls Vorführung'} \n              />\n            </FadeSlide>\n\n            <FadeSlide delay={150}>\n              <GlassCard style={styles.countdownCard}>\n                <Text style={styles.countdownTitle}>Bereite dich vor...</Text>\n                <View style={styles.countdownCircle}>\n                  <Text style={styles.countdownNumber}>{countdown}</Text>\n                </View>\n                <Text style={styles.countdownSub}>Nimm deine Ausgangsposition ein!</Text>\n              </GlassCard>\n            </FadeSlide>\n\n            <FadeSlide delay={200}>\n              <GradientButton label=\"✖  Abbrechen\" variant=\"ghost\" onPress={resetTraining} />\n            </FadeSlide>\n          </View>\n        )}\n\n        {/* 3. RECORDING STATE: Realtime Tracking, Angle Ring and Reps */}\n        {isConnected && trainingStatus === 'recording' && (\n          <View style={styles.trackingContainer}>\n            <FadeSlide delay={100}>\n              <View style={styles.trackingHeader}>\n                <Text style={styles.trackingTitle}>\n                  {exercise === 'squat' ? '🏋️ Kniebeugen' : '💪 Bizeps-Curls'}\n                </Text>\n                <Text style={styles.trackingSub}>Ausführung läuft...</Text>\n              </View>\n            </FadeSlide>\n\n            <FadeSlide delay={150}>\n              <ProgressRing \n                angle={currentAngle} \n                targetAngle={EXERCISE_TARGETS[exercise]} \n                repCount={repCount} \n                exerciseState={exerciseState} \n              />\n            </FadeSlide>\n\n            {/* Optional Collapsible Diagnostic Raw Data */}\n            <FadeSlide delay={200}>\n              <LiveChart data={liveBuffer} />\n            </FadeSlide>\n\n            {/* Real-time numerical grids */}\n            {latestReading && (\n              <FadeSlide delay={250}>\n                <View style={styles.readingsBlock}>\n                  <Text style={styles.sectionLabel}>Accelerometer · m/s²</Text>\n                  <View style={styles.grid}>\n                    <AnimatedValue label=\"X\" value={latestReading.accelX} unit=\"m/s²\" color={Colors.accentX} />\n                    <AnimatedValue label=\"Y\" value={latestReading.accelY} unit=\"m/s²\" color={Colors.accentY} />\n                    <AnimatedValue label=\"Z\" value={latestReading.accelZ} unit=\"m/s²\" color={Colors.accentZ} />\n                  </View>\n                </View>\n              </FadeSlide>\n            )}\n\n            <FadeSlide delay={300}>\n              <GradientButton label=\"⬛  Training beenden\" variant=\"stop\" onPress={stopTraining} />\n            </FadeSlide>\n          </View>\n        )}\n\n        {/* 4. IDLE STATE: Exercise Selection & Start Trigger */}\n        {isConnected && trainingStatus === 'idle' && (\n          <View style={styles.idleActiveContainer}>\n            <FadeSlide delay={140}>\n              <Text style={styles.sectionLabel}>Wähle deine Übung</Text>\n              <View style={styles.exerciseSelector}>\n                <TouchableOpacity \n                  style={[styles.exerciseCard, selectedEx === 'squat' && styles.exerciseCardActive]} \n                  onPress={() => setSelectedEx('squat')}\n                  activeOpacity={0.7}\n                >\n                  <Text style={styles.exerciseIcon}>🏋️</Text>\n                  <Text style={styles.exerciseLabel}>Kniebeugen</Text>\n                  <Text style={styles.exerciseDesc}>Ziel: {EXERCISE_TARGETS.squat}°</Text>\n                </TouchableOpacity>\n\n                <TouchableOpacity \n                  style={[styles.exerciseCard, selectedEx === 'curl' && styles.exerciseCardActive]} \n                  onPress={() => setSelectedEx('curl')}\n                  activeOpacity={0.7}\n                >\n                  <Text style={styles.exerciseIcon}>💪</Text>\n                  <Text style={styles.exerciseLabel}>Bizeps-Curls</Text>\n                  <Text style={styles.exerciseDesc}>Ziel: {EXERCISE_TARGETS.curl}°</Text>\n                </TouchableOpacity>\n              </View>\n            </FadeSlide>\n\n            <FadeSlide delay={180}>\n              <GradientButton \n                label={`▶  ${selectedEx === 'squat' ? 'Kniebeugen' : 'Bizeps-Curls'} starten`} \n                variant=\"primary\" \n                onPress={() => startTraining(selectedEx)} \n              />\n            </FadeSlide>\n          </View>\n        )}\n\n        {/* 5. NO SENSOR CONNECTED HINT */}\n        {!isConnected && bleStatus === 'idle' && (\n          <FadeSlide delay={200}>\n            <LinearGradient\n              colors={['rgba(0,212,170,0.08)', 'transparent']}\n              style={styles.idleCard}\n            >\n              <Text style={styles.idleIcon}>📡</Text>\n              <Text style={styles.idleTitle}>Kein Sensor verbunden</Text>\n              <Text style={styles.idleBody}>\n                Schalte deinen XIAO nRF52840 ein und tippe oben auf \"Verbinden\".\n              </Text>\n            </LinearGradient>\n          </FadeSlide>\n        )}\n\n      </ScrollView>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safe: { flex: 1, backgroundColor: 'transparent' },\n  scroll: { flex: 1 },\n  content: { padding: 20, gap: 14, paddingBottom: 40 },\n\n  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },\n  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },\n\n  recBadge: {\n    flexDirection: 'row', alignItems: 'center', gap: 6,\n    backgroundColor: Colors.primaryDim, borderRadius: 8,\n    paddingHorizontal: 10, paddingVertical: 5,\n    borderWidth: 1, borderColor: Colors.primaryGlow,\n  },\n  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },\n  recLabel: { color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },\n\n  readingsBlock: { gap: 10 },\n  sectionLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },\n  grid: { flexDirection: 'row', gap: 8 },\n\n  idleCard: {\n    borderRadius: 20, padding: 32, alignItems: 'center', gap: 10,\n    borderWidth: 1, borderColor: Colors.border, marginTop: 16,\n  },\n  idleIcon: { fontSize: 40, marginBottom: 4 },\n  idleTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },\n  idleBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 260 },\n\n  // Preparing State\n  preparingContainer: { gap: 16 },\n  countdownCard: { padding: 24, alignItems: 'center', gap: 14 },\n  countdownTitle: { color: Colors.textSub, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },\n  countdownCircle: {\n    width: 90, height: 90, borderRadius: 45,\n    backgroundColor: Colors.surfaceActive,\n    borderWidth: 2, borderColor: Colors.primaryGlow,\n    alignItems: 'center', justifyContent: 'center',\n    shadowColor: Colors.primary, shadowRadius: 10, shadowOpacity: 0.1,\n  },\n  countdownNumber: { color: Colors.primaryLight, fontSize: 38, fontWeight: '900' },\n  countdownSub: { color: Colors.text, fontSize: 14, fontWeight: '600', textAlign: 'center' },\n\n  // Recording Tracking State\n  trackingContainer: { gap: 16 },\n  trackingHeader: { alignItems: 'center', marginBottom: 4 },\n  trackingTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },\n  trackingSub: { color: Colors.textSub, fontSize: 12, fontWeight: '500' },\n\n  // Idle Selection State\n  idleActiveContainer: { gap: 16 },\n  exerciseSelector: { flexDirection: 'row', gap: 12 },\n  exerciseCard: {\n    flex: 1,\n    borderRadius: 16,\n    padding: 20,\n    backgroundColor: Colors.surface,\n    borderWidth: 1.5,\n    borderColor: Colors.border,\n    alignItems: 'center',\n    gap: 6,\n  },\n  exerciseCardActive: {\n    backgroundColor: Colors.surfaceActive,\n    borderColor: Colors.primaryGlow,\n    shadowColor: Colors.primary,\n    shadowRadius: 12,\n    shadowOpacity: 0.08,\n  },\n  exerciseIcon: { fontSize: 28 },\n  exerciseLabel: { color: Colors.text, fontSize: 15, fontWeight: '700' },\n  exerciseDesc: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },\n});\n",
    "embedded/components/led_display_controller/VisualFeedback.h": "#ifndef VISUAL_FEEDBACK_H\n#define VISUAL_FEEDBACK_H\n\n#include <Arduino.h>\n\n// @implements FA9\nvoid initFeedback();\n\n// @implements FA9\nvoid updateFeedback(const String& best_label, float best_val, float anomaly_score);\n\n// @implements FA9\nvoid sendJsonToPC(String label, float confidence, float anomaly, String tipp);\n\n#endif // VISUAL_FEEDBACK_H\n",
    "doc/AI_DOCUMENTATION_GUIDE.md": "# Leitfaden für KI-Dokumentation & Traceability (MoveLink)\n\nDieses Repository verwendet ein automatisiertes, integriertes Dokumentations- und Traceability-System. Es scannt Markdown-Dokumente und Quellcode-Dateien, um eine interaktive Weboberfläche (HTML Dashboard) sowie einen kompilierten PDF-Bericht zu generieren.\n\nDamit zukünftige KIs und Entwickler neue Anforderungen, Use Cases und Architekturentwicklungen richtig dokumentieren, müssen die folgenden Standards eingehalten werden.\n\n---\n\n## 1. Definition von Anforderungen & Use Cases (.md-Dateien)\n\nAlle Systemdefinitionen werden in Markdown-Dateien im Ordner `doc/` gepflegt (z. B. `doc/Requirements.md` und `doc/UseCases.md`). \n\n### ID-Format & Konventionen\nJeder Eintrag muss eine eindeutige ID besitzen:\n* **`UC-X`**: Use Cases (z. B. `UC-1`)\n* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)\n* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)\n* **`R-X`**: Randbedingungen (z. B. `R1`)\n\n### Format der Deklaration in Markdown\nDamit der Scraper (`scrape_docs.py`) die Einträge korrekt parsen kann, müssen sie in einer Zeile deklariert werden, gefolgt von einer Beschreibung:\n\n```markdown\n**UC-1: Live-Ansicht der Übungen**\nDies ist die Beschreibung des Use Cases. Hier steht detaillierter Text, der auch über mehrere Zeilen gehen kann.\n\n**FA2: Bluetooth LE Signalstärke**\nDas System muss die BLE-Signalstärke des Sensors in Echtzeit ausgeben.\n```\n\n### Verknüpfung zwischen Anforderungen und Use Cases (Traceability)\nUm Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):\n\n```markdown\n**FA3: BLE Verbindungsaufbau (UC-1)**\nDas System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen.\n```\n\n---\n\n## 2. Implementierungs-Referenzen im Quellcode (@implements)\n\nUm nachzuweisen, dass eine Anforderung tatsächlich im Code implementiert wurde, müssen Entwickler und KIs direkt in den Quellcodedateien (`.ts`, `.tsx`, `.ino`, `.cpp`, `.h`) `@implements`-Annotationen in Kommentaren hinzufügen.\n\n### Syntax\n```\n@implements ID1, ID2, ...\n```\n\n### Code-Beispiele\n\n**In TypeScript / TSX Dateien (`app/`):**\n```tsx\n// @implements FA2, FA3, NF2\nexport function SensorCard() {\n    // UI Code...\n}\n```\n\n**In Arduino / C++ Dateien (`embedded/`):**\n```cpp\n/*\n * @implements FA5, NF1\n * Liest Sensorwerte mit 50Hz aus und wendet einen Tiefpassfilter an.\n */\nvoid loop() {\n    // Sensorsignal...\n}\n```\n\n---\n\n## 3. C4-Architektur-Modellierung (Metadaten-Blöcke)\n\nJedes Architektur-Dokument in Markdown muss Informationen über die zugehörige C4-Ebene und die Deployability enthalten.\n\n### Metadaten-Header in Markdown\nFügen Sie ganz oben in der entsprechenden Architektur-Markdown-Datei (z. B. `app/architecture.md`) einen HTML-Kommentarblock mit folgenden Keys hinzu:\n\n```markdown\n<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n```\n\n**Erlaubte Werte:**\n* **C4-Ebene**: `System-Context`, `Container`, `Component`\n* **Deployable**: `Ja` / `Nein` (oder `Yes` / `No`)\n\n### Registrierung im C4 Model Explorer\nWenn ein neuer Container oder eine neue Komponente hinzugefügt wird, muss diese auch in der `C4_DATA`-Struktur am Ende von `docs_site/app.js` registriert werden:\n1. Tragen Sie das Element unter `containers.elements` oder `components.[container_id].elements` ein.\n2. Definieren Sie dessen Verbindungen (Connectoren) im zugehörigen `connections`-Array.\n3. Ergänzen Sie die Dateizuordnung in der Funktion `getC4ElementForFile` in `docs_site/app.js`, damit die E2E-Flussdiagramme die Datei dem neuen C4-Element zuweisen.\n\n---\n\n## 4. Build-Prozess & Pipeline\n\nNach jeder Änderung an der Dokumentation oder den `@implements`-Kommentaren im Quellcode müssen die Kompilierungsskripte ausgeführt werden:\n\n### Lokaler Build-Befehl\n1. **Scraper ausführen** (erstellt `docs_site/data.js`):\n   ```bash\n   python scrape_docs.py\n   ```\n2. **PDF Bericht generieren** (erstellt `docs_site/documentation_report.pdf`):\n   ```bash\n   python generate_pdf.py\n   ```\n\n### CI/CD Pipeline (GitHub Actions)\nBei jedem Push auf den `main`-Branch baut die Pipeline `.github/workflows/docs.yml` die Webseite und das PDF automatisch. Wenn Sie einen Commit pushen, der bereits kompilierte Änderungen enthält, nutzen Sie `[skip ci]` im Commit-Betreff, um endlose Build-Loops zu verhindern.\n",
    "embedded/components/inferenz_engine/InferenceEngine.cpp": "// @implements FA5, FA9\n#include \"InferenceEngine.h\"\n#include <Erlind-project-1_inferencing.h>\n\nstatic bool debug_nn = false;\n\n// @implements FA5, FA9\nbool runModelInference(float* buffer, String& outLabel, float& outConfidence, float& outAnomaly) {\n    // Signal aus Puffer erstellen\n    signal_t signal;\n    int err = numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);\n    if (err != 0) {\n        return false;\n    }\n\n    // Klassifikator ausführen\n    ei_impulse_result_t result = { 0 };\n    err = run_classifier(&signal, &result, debug_nn);\n    if (err != EI_IMPULSE_OK) {\n        return false;\n    }\n\n    // Variablen für den besten Treffer\n    int best_idx = 0;\n    float best_val = 0.0;\n    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {\n        if (result.classification[ix].value > best_val) {\n            best_val = result.classification[ix].value;\n            best_idx = ix;\n        }\n    }\n\n    // Anomalie-Score abgreifen (falls der K-means Block aktiv ist)\n    float anomaly_score = 0.0;\n#if EI_CLASSIFIER_HAS_ANOMALY == 1\n    anomaly_score = result.anomaly;\n#endif\n\n    outLabel = String(result.classification[best_idx].label);\n    outConfidence = best_val;\n    outAnomaly = anomaly_score;\n\n    return true;\n}\n",
    "embedded/components/sensordatenerfassung/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Sensordatenerfassung (Loop)\n\nDiese Komponente liest kontinuierlich die Rohwerte des Beschleunigungssensors und Gyroskops aus.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Sensordatenerfassung liest in einer festen Schleife (Loop) die 6-Achsen-IMU-Werte (Beschleunigung und Drehung) des LSM6DS3-Sensors über den I2C-Bus ein.\n\n### Technische Details\n- **Abtastrate:** 50 Hz (gesteuert durch präzises Timing in Microsekunden)\n- **Signal-Clamping:** Beschleunigungswerte werden auf max. ±2.0 G gedämpft/geclampt.\n- **Konvertierung:** Die Werte werden in die SI-Einheit $m/s^2$ konvertiert ($1\\,G = 9.80665\\,m/s^2$).\n- **Verwendete Hardware:** LSM6DS3 IMU auf dem XIAO nRF52840 Sense.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Executable.ino](file:///c:/Users/erlin/repo/movelink/embedded/src/Executable.ino)\n- **Erfüllt Anforderungen:**\n  - **FA5: Datenstrom-Verarbeitung**: Die Sensordaten werden kontinuierlich erfasst und für die Klassifikation aufbereitet.\n  - **NF1: Latenz**: Durch die hardwarenahe I2C-Abfrage und das Vermeiden von blockierenden Delays wird eine niedrige E2E-Latenz ermöglicht.\n\n## Datenfluss\n\n```mermaid\nflowchart LR\n    IMU[LSM6DS3 Sensor] -->|I2C Rohdaten| Loop[Loop in Executable.ino]\n    Loop -->|1. Clamping auf 2G| Calc[Skalierung & m/s^2 Konvertierung]\n    Calc -->|2. Puffer befüllen| DSP[Edge Impulse DSP Puffer]\n```\n",
    "app/app/(tabs)/_layout.tsx": "/**\n * @implements FA1\n */\nimport React from 'react';\nimport { View } from 'react-native';\nimport { Tabs } from 'expo-router';\nimport { Colors } from '@/constants/Colors';\nimport { AuroraBackground } from '@/components/AuroraBackground';\nimport { SideNav } from '@/components/SideNav';\n\nexport default function TabLayout() {\n  return (\n    <View style={{ flex: 1, backgroundColor: Colors.bg }}>\n      <AuroraBackground />\n      <Tabs\n        screenOptions={{\n          headerShown: false,\n          tabBarStyle: { display: 'none' },\n          contentStyle: { backgroundColor: 'transparent' },\n        }}\n      >\n        <Tabs.Screen name=\"index\" />\n        <Tabs.Screen name=\"history\" />\n        <Tabs.Screen name=\"settings\" />\n      </Tabs>\n      <SideNav />\n    </View>\n  );\n}\n",
    "app/store/index.ts": "/**\n * @implements FA5, FA9\n */\nimport { create } from 'zustand';\nimport { Platform } from 'react-native';\nimport * as Haptics from 'expo-haptics';\n\nexport type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';\nexport type TrainingStatus = 'idle' | 'preparing' | 'recording';\nexport type ExerciseState = 'start' | 'moving' | 'peak' | 'returning';\nexport type ExerciseType = 'squat' | 'curl';\n\nexport interface IMUReading {\n  timestamp: number;\n  accelX: number;\n  accelY: number;\n  accelZ: number;\n  gyroX: number;\n  gyroY: number;\n  gyroZ: number;\n}\n\nexport interface TrainingSession {\n  id: string;\n  startedAt: string;\n  endedAt: string | null;\n  durationSeconds: number;\n  readingCount: number;\n}\n\n// Max data points kept in-memory for the live chart (rolling buffer)\nconst LIVE_BUFFER_SIZE = 100;\n\nexport const EXERCISE_TARGETS: Record<ExerciseType, number> = {\n  squat: 70, // 70 Grad Kniebeuge-Tiefe\n  curl: 90,  // 90 Grad Ellenbogenbeugung\n};\n\n// Filter states (keep outside Zustand state to prevent React render storms on raw intermediate numbers)\nlet lastTimestamp = 0;\nlet filteredAngle = 0;\n\ninterface BLEStore {\n  status: ConnectionStatus;\n  deviceId: string | null;\n  deviceName: string | null;\n  latestReading: IMUReading | null;\n  isDemoMode: boolean;\n  setStatus: (status: ConnectionStatus) => void;\n  setDevice: (id: string, name: string) => void;\n  setReading: (reading: IMUReading) => void;\n  setDemoMode: (isDemoMode: boolean) => void;\n  disconnect: () => void;\n}\n\ninterface TrainingStore {\n  isRecording: boolean;\n  sessionId: string | null;\n  liveBuffer: IMUReading[];\n  sessions: TrainingSession[];\n  \n  // New interactive training states\n  status: TrainingStatus;\n  exercise: ExerciseType;\n  exerciseState: ExerciseState;\n  repCount: number;\n  currentAngle: number;\n  countdown: number;\n  \n  // Existing and new actions\n  startSession: () => void;\n  stopSession: () => void;\n  startTraining: (exercise: ExerciseType) => void;\n  stopTraining: () => void;\n  setCountdown: (countdown: number) => void;\n  addReading: (reading: IMUReading) => void;\n  setSessions: (sessions: TrainingSession[]) => void;\n  resetTraining: () => void;\n}\n\nexport const useBLEStore = create<BLEStore>((set) => ({\n  status: 'idle',\n  deviceId: null,\n  deviceName: null,\n  latestReading: null,\n  isDemoMode: false,\n  setStatus: (status) => set({ status }),\n  setDevice: (deviceId, deviceName) => set({ deviceId, deviceName }),\n  setReading: (reading) => set({ latestReading: reading }),\n  setDemoMode: (isDemoMode) => set({ isDemoMode }),\n  disconnect: () => set({ status: 'disconnected', deviceId: null, deviceName: null, latestReading: null }),\n}));\n\nexport const useTrainingStore = create<TrainingStore>((set) => ({\n  isRecording: false,\n  sessionId: null,\n  liveBuffer: [],\n  sessions: [],\n  \n  // Default interactive states\n  status: 'idle',\n  exercise: 'squat',\n  exerciseState: 'start',\n  repCount: 0,\n  currentAngle: 0,\n  countdown: 3,\n\n  startSession: () => {\n    // Reset filters\n    lastTimestamp = 0;\n    filteredAngle = 0;\n    \n    set({ \n      isRecording: true, \n      sessionId: Date.now().toString(), \n      liveBuffer: [],\n      status: 'recording',\n      repCount: 0,\n      currentAngle: 0,\n      exerciseState: 'start',\n    });\n  },\n\n  stopSession: () => {\n    set((state) => {\n      const newSession: TrainingSession = {\n        id: state.sessionId || Date.now().toString(),\n        startedAt: new Date(Date.now() - state.liveBuffer.length * 20).toISOString(),\n        endedAt: new Date().toISOString(),\n        durationSeconds: Math.round(state.liveBuffer.length * 0.02), // 50Hz assumed\n        readingCount: state.liveBuffer.length,\n      };\n\n      return {\n        isRecording: false,\n        sessionId: null,\n        status: 'idle',\n        sessions: [newSession, ...state.sessions],\n      };\n    });\n  },\n\n  startTraining: (exercise: ExerciseType) => {\n    set({\n      status: 'preparing',\n      exercise,\n      repCount: 0,\n      currentAngle: 0,\n      exerciseState: 'start',\n      countdown: 3,\n    });\n  },\n\n  stopTraining: () => {\n    const { stopSession } = useTrainingStore.getState();\n    stopSession();\n  },\n\n  setCountdown: (countdown: number) => set({ countdown }),\n\n  resetTraining: () => {\n    set({\n      status: 'idle',\n      repCount: 0,\n      currentAngle: 0,\n      exerciseState: 'start',\n      isRecording: false,\n      sessionId: null,\n    });\n  },\n\n  addReading: (reading) => {\n    set((state) => {\n      // 1. Process complementary filter\n      const ax = reading.accelX;\n      const ay = reading.accelY;\n      const az = reading.accelZ;\n\n      // Winkel aus Beschleunigungsmesser berechnen (in Grad)\n      const accelAngle = Math.atan2(ay, Math.sqrt(ax * ax + az * az)) * (180 / Math.PI);\n      \n      // Winkelgeschwindigkeit (rad/s in deg/s umrechnen)\n      const gyroRate = reading.gyroX * (180 / Math.PI);\n\n      const now = reading.timestamp;\n      if (lastTimestamp === 0) {\n        filteredAngle = accelAngle;\n      } else {\n        const dt = (now - lastTimestamp) / 1000; // Zeitdifferenz in Sekunden\n        const alpha = 0.96;\n        filteredAngle = alpha * (filteredAngle + gyroRate * dt) + (1 - alpha) * accelAngle;\n      }\n      lastTimestamp = now;\n\n      // Winkel normalisieren (absoluten Betrag nehmen)\n      const angle = Math.min(180, Math.max(0, Math.abs(filteredAngle)));\n\n      // 2. FSM (Finite State Machine) für Wiederholungsvergleich\n      const target = EXERCISE_TARGETS[state.exercise];\n      let nextExState = state.exerciseState;\n      let nextRepCount = state.repCount;\n\n      if (state.exerciseState === 'start') {\n        if (angle > 20) {\n          nextExState = 'moving';\n        }\n      } else if (state.exerciseState === 'moving') {\n        if (angle >= target) {\n          nextExState = 'peak';\n          // Erfolgs-Vibration bei Erreichen des Zielwinkels\n          if (Platform.OS !== 'web') {\n            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});\n          }\n        }\n      } else if (state.exerciseState === 'peak') {\n        if (angle < target - 8) {\n          nextExState = 'returning';\n        }\n      } else if (state.exerciseState === 'returning') {\n        if (angle < 15) {\n          nextExState = 'start';\n          nextRepCount += 1;\n          // Kurze Bestätigungs-Vibration für vollendete Wiederholung\n          if (Platform.OS !== 'web') {\n            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});\n          }\n        }\n      }\n\n      return {\n        currentAngle: parseFloat(angle.toFixed(1)),\n        exerciseState: nextExState,\n        repCount: nextRepCount,\n        liveBuffer:\n          state.liveBuffer.length >= LIVE_BUFFER_SIZE\n            ? [...state.liveBuffer.slice(1), reading]\n            : [...state.liveBuffer, reading],\n      };\n    });\n  },\n\n  setSessions: (sessions) => set({ sessions }),\n}));\n",
    "app/hooks/useWebSocket.ts": "/**\n * @implements FA5\n */\nimport { useEffect, useRef, useCallback } from 'react';\nimport { useBLEStore, useTrainingStore } from '@/store';\n\n// Backend WebSocket URL — served by AP2 (Luca Schöneberg) via Docker\nconst WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:3000/ws';\nconst RECONNECT_DELAY_MS = 3000;\n\nexport function useWebSocket() {\n  const ws = useRef<WebSocket | null>(null);\n  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const shouldReconnect = useRef(true);\n\n  const latestReading = useBLEStore((s) => s.latestReading);\n  const { isRecording, sessionId } = useTrainingStore();\n\n  const connect = useCallback(() => {\n    if (ws.current?.readyState === WebSocket.OPEN) return;\n    ws.current = new WebSocket(WS_URL);\n\n    ws.current.onopen = () => {\n      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    };\n\n    ws.current.onclose = () => {\n      if (!shouldReconnect.current) return;\n      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);\n    };\n\n    ws.current.onerror = () => {\n      ws.current?.close();\n    };\n  }, []);\n\n  const disconnect = useCallback(() => {\n    shouldReconnect.current = false;\n    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    ws.current?.close();\n  }, []);\n\n  // Forward every new BLE reading to the backend while a session is active\n  useEffect(() => {\n    if (!isRecording || !latestReading || ws.current?.readyState !== WebSocket.OPEN) return;\n    ws.current.send(JSON.stringify({ sessionId, reading: latestReading }));\n  }, [latestReading, isRecording, sessionId]);\n\n  useEffect(() => {\n    shouldReconnect.current = true;\n    connect();\n    return () => { disconnect(); };\n  }, []);\n\n  return { connect, disconnect };\n}\n",
    "embedded/components/inferenz_engine/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Inferenz-Engine (Edge Impulse)\n\nDiese Komponente klassifiziert Übungsausführungen in Echtzeit direkt auf dem Mikrocontroller (Edge Computing).\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)\n\n## Beschreibung\nDie Inferenz-Engine führt ein CNN-Klassifikationsmodell aus, das über Edge Impulse trainiert und als Arduino-Bibliothek in die Firmware integriert wurde. Es analysiert die 6-Achsen-Bewegungsdaten auf spezifische Übungsqualitäten und Fehlerbilder.\n\n### Technische Details\n- **Modelltyp:** Convolutional Neural Network (CNN)\n- **Erkannte Klassen:**\n  - `idle`: Keine Übungsausführung / Ruhezustand.\n  - `curl_sauber`: Korrekt ausgeführter Bizeps-Curl.\n  - `fehler_rotation`: Fehlerhafte Ausführung durch Rotation des Handgelenks.\n  - `fehler_ellbogen`: Fehlerhafte Ausführung durch Bewegung des Ellbogens.\n- **Anomalieerkennung:** Optionaler K-Means-Clustering-Block zur Erkennung unbekannter Bewegungen.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Executable.ino](file:///c:/Users/erlin/repo/movelink/embedded/src/Executable.ino) (unter Einbindung von `Erlind-project-1_inferencing.h`)\n- **Erfüllt Anforderungen:**\n  - **FA5: Datenstrom-Verarbeitung**: Analyse des kontinuierlichen Datenstroms.\n  - **FA9: Biofeedback und Auswertung**: Liefert die Grundlage für das unmittelbare Feedback (Erkennung sauberer vs. fehlerhafter Curls).\n\n## Datenfluss\n\n```mermaid\nflowchart TD\n    DSP[DSP Puffer (6 Achsen)] -->|run_classifier| Model[CNN Inferenzmodell]\n    Model -->|Wahrscheinlichkeiten| Eval[Klassenauswertung]\n    Eval -->|Bester Treffer + Score| Output[Feedback & PC-JSON-Stream]\n```\n",
    "embedded/components/ble_streamer/BLEStreamer.h": "#ifndef BLE_STREAMER_H\n#define BLE_STREAMER_H\n\n#include <Arduino.h>\n\n// @implements FA3, FA5\nbool initBLE();\n\n// @implements FA5\nvoid streamIMUData(float ax, float ay, float az, float gx, float gy, float gz);\n\n#endif // BLE_STREAMER_H\n",
    "app/components/SensorCard.tsx": "/**\n * @implements FA2, FA3, NF3\n */\nimport React, { useEffect } from 'react';\nimport { View, Text, StyleSheet, Switch } from 'react-native';\nimport Animated, {\n  useSharedValue, useAnimatedStyle,\n  withRepeat, withSequence, withTiming, withSpring,\n} from 'react-native-reanimated';\nimport { GlassCard } from '@/components/GlassCard';\nimport { PulseRing } from '@/components/PulseRing';\nimport { GradientButton } from '@/components/GradientButton';\nimport { Colors } from '@/constants/Colors';\nimport { ConnectionStatus, useBLEStore } from '@/store';\n\ninterface Props {\n  status: ConnectionStatus;\n  deviceName: string | null;\n  onScan: () => void;\n  onDisconnect: () => void;\n}\n\nconst STATUS_COLOR: Record<ConnectionStatus, string> = {\n  idle: Colors.textMuted,\n  scanning: Colors.warning,\n  connecting: Colors.warning,\n  connected: Colors.connected,\n  disconnected: Colors.textSub,\n  error: Colors.error,\n};\n\nconst STATUS_LABEL: Record<ConnectionStatus, string> = {\n  idle: 'Kein Sensor',\n  scanning: 'Suche läuft...',\n  connecting: 'Verbinde...',\n  connected: 'Verbunden',\n  disconnected: 'Getrennt',\n  error: 'Fehler',\n};\n\nfunction StatusLabel({ status }: { status: ConnectionStatus }) {\n  const opacity = useSharedValue(0);\n  const x = useSharedValue(-6);\n\n  useEffect(() => {\n    opacity.value = withTiming(0, { duration: 0 });\n    x.value = -6;\n    const t = setTimeout(() => {\n      opacity.value = withTiming(1, { duration: 220 });\n      x.value = withSpring(0, { damping: 20, stiffness: 300 });\n    }, 10);\n    return () => clearTimeout(t);\n  }, [status]);\n\n  const style = useAnimatedStyle(() => ({\n    opacity: opacity.value,\n    transform: [{ translateX: x.value }],\n  }));\n\n  return (\n    <Animated.Text style={[styles.statusLabel, { color: STATUS_COLOR[status] }, style]}>\n      {STATUS_LABEL[status]}\n    </Animated.Text>\n  );\n}\n\nfunction ScanningDots({ color }: { color: string }) {\n  return (\n    <View style={styles.dots}>\n      {[0, 1, 2].map((i) => (\n        <BounceDot key={i} color={color} delay={i * 180} />\n      ))}\n    </View>\n  );\n}\n\nfunction BounceDot({ color, delay }: { color: string; delay: number }) {\n  const opacity = useSharedValue(0.2);\n\n  useEffect(() => {\n    const t = setTimeout(() => {\n      opacity.value = withRepeat(\n        withSequence(\n          withTiming(1, { duration: 500 }),\n          withTiming(0.2, { duration: 500 })\n        ),\n        -1\n      );\n    }, delay);\n    return () => clearTimeout(t);\n  }, []);\n\n  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));\n\n  return (\n    <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />\n  );\n}\n\nexport function SensorCard({ status, deviceName, onScan, onDisconnect }: Props) {\n  const isConnected = status === 'connected';\n  const isActive = status === 'scanning' || status === 'connecting';\n  const color = STATUS_COLOR[status];\n  \n  const { isDemoMode, setDemoMode } = useBLEStore();\n\n  return (\n    <GlassCard active={isConnected}>\n      <View style={styles.cardContent}>\n        <View style={styles.row}>\n          <PulseRing color={color} size={9} active={isConnected} />\n\n          <View style={styles.info}>\n            <Text style={styles.deviceName}>{deviceName ?? (isDemoMode ? 'Simulierter Sensor' : 'XIAO nRF52840')}</Text>\n            <StatusLabel status={status} />\n          </View>\n\n          {isConnected && (\n            <GradientButton label=\"Trennen\" variant=\"ghost\" onPress={onDisconnect} style={styles.btn} />\n          )}\n          {!isConnected && !isActive && (\n            <GradientButton label=\"Verbinden\" variant=\"primary\" onPress={onScan} style={styles.btn} />\n          )}\n          {isActive && <ScanningDots color={color} />}\n        </View>\n\n        {!isConnected && !isActive && (\n          <View style={styles.demoToggleRow}>\n            <Text style={styles.demoLabel}>Demo-Modus (Sensor simulieren)</Text>\n            <Switch\n              value={isDemoMode}\n              onValueChange={setDemoMode}\n              trackColor={{ false: '#1C3530', true: Colors.primaryDim }}\n              thumbColor={isDemoMode ? Colors.primary : '#4D8C7C'}\n            />\n          </View>\n        )}\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  cardContent: { gap: 10 },\n  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },\n  info: { flex: 1, gap: 3 },\n  deviceName: { color: Colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },\n  statusLabel: { fontSize: 12, fontWeight: '600' },\n  btn: { flexShrink: 0 },\n  dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },\n  dot: { width: 5, height: 5, borderRadius: 2.5 },\n  demoToggleRow: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'space-between',\n    paddingTop: 8,\n    borderTopWidth: 1,\n    borderTopColor: 'rgba(0,255,180,0.06)',\n  },\n  demoLabel: {\n    color: Colors.textSub,\n    fontSize: 12,\n    fontWeight: '600',\n  },\n});\n",
    "app/hooks/useBLE.ts": "/**\n * @implements FA3, FA5, NF2\n */\nimport { useEffect, useRef, useCallback } from 'react';\nimport { Platform } from 'react-native';\nimport {\n  BleManager,\n  Device,\n  BleError,\n  Characteristic,\n  State,\n} from 'react-native-ble-plx';\nimport { BLE_SERVICE_UUID, BLE_IMU_CHARACTERISTIC_UUID, BLE_RECONNECT_DELAY_MS, BLE_MAX_RECONNECT_ATTEMPTS } from '@/constants/BLE';\nimport { useBLEStore, useTrainingStore, IMUReading } from '@/store';\n\nfunction parseIMUPacket(base64: string): IMUReading | null {\n  try {\n    const binary = atob(base64);\n    const buffer = new ArrayBuffer(binary.length);\n    const view = new Uint8Array(buffer);\n    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);\n    const floats = new Float32Array(buffer);\n    if (floats.length < 6) return null;\n    return {\n      timestamp: Date.now(),\n      accelX: floats[0],\n      accelY: floats[1],\n      accelZ: floats[2],\n      gyroX: floats[3],\n      gyroY: floats[4],\n      gyroZ: floats[5],\n    };\n  } catch {\n    return null;\n  }\n}\n\nexport function useBLE() {\n  const manager = useRef<BleManager | null>(null);\n  const reconnectAttempts = useRef(0);\n  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);\n  const simStartTime = useRef<number>(0);\n\n  const { setStatus, setDevice, setReading, disconnect, status } = useBLEStore();\n  const { addReading, isRecording } = useTrainingStore();\n\n  useEffect(() => {\n    // BLE is not available on web\n    if (Platform.OS === 'web') return;\n\n    let subscription: { remove: () => void } | null = null;\n    try {\n      manager.current = new BleManager();\n      subscription = manager.current.onStateChange((state) => {\n        if (state === State.PoweredOn) subscription?.remove();\n      }, true);\n    } catch (e) {\n      console.warn(\"BleManager could not be initialized. This is expected inside Expo Go. Standing by for Dev Client build.\");\n      manager.current = null;\n    }\n\n    return () => {\n      if (subscription) {\n        try {\n          subscription.remove();\n        } catch (e) {}\n      }\n      if (manager.current) {\n        try {\n          manager.current.destroy();\n        } catch (e) {}\n      }\n      if (simInterval.current) clearInterval(simInterval.current);\n    };\n  }, []);\n\n  const handleDisconnect = useCallback((deviceId: string) => {\n    setStatus('disconnected');\n    if (reconnectAttempts.current >= BLE_MAX_RECONNECT_ATTEMPTS) {\n      setStatus('error');\n      return;\n    }\n    reconnectTimer.current = setTimeout(() => {\n      reconnectAttempts.current += 1;\n      connectToDevice(deviceId);\n    }, BLE_RECONNECT_DELAY_MS);\n  }, []);\n\n  const connectToDevice = useCallback(async (deviceId: string) => {\n    if (!manager.current) return;\n    try {\n      setStatus('connecting');\n      const device = await manager.current.connectToDevice(deviceId);\n      await device.discoverAllServicesAndCharacteristics();\n\n      setDevice(device.id, device.name ?? 'MoveLink Sensor');\n      setStatus('connected');\n      reconnectAttempts.current = 0;\n\n      device.onDisconnected(() => handleDisconnect(device.id));\n\n      device.monitorCharacteristicForService(\n        BLE_SERVICE_UUID,\n        BLE_IMU_CHARACTERISTIC_UUID,\n        (error: BleError | null, characteristic: Characteristic | null) => {\n          if (error || !characteristic?.value) return;\n          const reading = parseIMUPacket(characteristic.value);\n          if (!reading) return;\n          setReading(reading);\n          if (useTrainingStore.getState().isRecording) {\n            useTrainingStore.getState().addReading(reading);\n          }\n        }\n      );\n    } catch {\n      setStatus('error');\n    }\n  }, [handleDisconnect]);\n\n  const startScan = useCallback(() => {\n    const { isDemoMode } = useBLEStore.getState();\n\n    // Trigger simulation if:\n    // - Demo mode is explicitly turned on\n    // - Running in web browser\n    // - running in Expo Go (where manager is null)\n    if (isDemoMode || Platform.OS === 'web' || !manager.current) {\n      setStatus('connecting');\n      setTimeout(() => {\n        setDevice('mock-device-id', isDemoMode ? 'Simulierter Sensor (Demo)' : (!manager.current ? 'Simulierter Sensor (Expo Go)' : 'Simulierter Web-Sensor'));\n        setStatus('connected');\n        reconnectAttempts.current = 0;\n\n        if (simInterval.current) clearInterval(simInterval.current);\n        simStartTime.current = Date.now();\n\n        simInterval.current = setInterval(() => {\n          const { isRecording: activeRecording } = useTrainingStore.getState();\n          const t = (Date.now() - simStartTime.current) / 1000;\n          \n          // Repetition duration = 4s\n          const T = 4;\n          const phase = (2 * Math.PI * t) / T;\n          \n          // Smooth sine curve representing angles (5° up to 85° back and forth)\n          const targetAngle = 5 + 80 * (0.5 - 0.5 * Math.cos(phase));\n          const rad = targetAngle * (Math.PI / 180);\n\n          // Gyroscope rate of change in rad/s: d/dt(rad)\n          const omega = (2 * Math.PI) / T;\n          const gyroRateRad = (80 * (Math.PI / 180) * 0.5 * omega * Math.sin(phase));\n\n          const reading: IMUReading = {\n            timestamp: Date.now(),\n            accelX: 0,\n            accelY: Math.sin(rad),\n            accelZ: Math.cos(rad),\n            gyroX: gyroRateRad,\n            gyroY: 0,\n            gyroZ: 0,\n          };\n\n          setReading(reading);\n          if (activeRecording) {\n            useTrainingStore.getState().addReading(reading);\n          }\n        }, 40); // 25Hz feed\n      }, 600);\n      return;\n    }\n\n    setStatus('scanning');\n\n    manager.current.startDeviceScan(\n      [BLE_SERVICE_UUID],\n      null,\n      (error: BleError | null, device: Device | null) => {\n        if (error) { setStatus('error'); return; }\n        if (!device) return;\n\n        manager.current?.stopDeviceScan();\n        connectToDevice(device.id);\n      }\n    );\n  }, [connectToDevice]);\n\n  const stopScan = useCallback(() => {\n    manager.current?.stopDeviceScan();\n    if (status === 'scanning') setStatus('idle');\n  }, [status]);\n\n  const disconnectDevice = useCallback(async () => {\n    if (simInterval.current) {\n      clearInterval(simInterval.current);\n      simInterval.current = null;\n    }\n    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    const { deviceId } = useBLEStore.getState();\n    if (deviceId && Platform.OS !== 'web' && manager.current) {\n      try {\n        await manager.current.cancelDeviceConnection(deviceId);\n      } catch (e) {}\n    }\n    disconnect();\n  }, [disconnect]);\n\n  return { startScan, stopScan, disconnectDevice };\n}\n",
    "embedded/components/gehause/architecture.md": "<!--\nC4-Ebene: Component\nDeployable: Nein\n-->\n\n# Gehäuse (Enclosure)\n\nDiese Komponente beschreibt das physische, schützende 3D-Druck-Gehäuse des Sensors.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Component\n* **Deployable:** Nein (Physische Schutzhülle, keine Software-Ausführung)\n\n## Beschreibung\nDas Gehäuse umschließt den XIAO-Mikrocontroller sowie die Peripherie (Display, Batterie). Es bietet Befestigungslaschen für ein standardmäßiges 20-mm-Sportarmband, um den Sensor stabil am Arm des Nutzers zu fixieren.\n\n### Technische & Physische Parameter\n- **Gesamtmaße:** 48 mm (Länge) x 24 mm (Breite) x 16 mm (Höhe)\n- **Außenwandstärke:** 2.0 mm\n- **Schließmechanismus:** Schnapp-Deckel (Lippe & Snap Bumps mit 0.2 mm Toleranz)\n- **Komfort:** Abgerundete Ecken (Bevel-Breite 1.5 mm), um Druckstellen beim Tragen zu vermeiden.\n- **Aussparungen:** Integrierter USB-C-Port zur Programmierung und Akku-Ladung.\n\n## Implementierung & Traceability\n- **Implementiert in:** [Gehause.py](file:///c:/Users/erlin/repo/movelink/embedded/src/Gehause.py) (Blender Python API)\n- **Erfüllt Anforderungen:**\n  - **R2: Physisches Gehäuse**: Stabile Fixierung des Sensors am Arm, Schutz gegen Schweiß und Erschütterungen.\n\n## Schnittstellen\nDas Gehäuse hat keine softwareseitigen Verbindungen, interagiert aber mechanisch mit:\n- **Mikrocontroller (XIAO nRF52840 Sense)**: Durch Passform und Aussparungen fixiert.\n- **Armband (20mm)**: Wird durch die integrierten Lug-Slots gefädelt.\n",
    "doc/Requirements.md": "# Systemanforderungen (Requirements)\n\nDieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.\n\n---\n\n## Funktionale Anforderungen\n\n**FA1**: Dashboard und Navigation\nDas System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*\n\n**FA2**: Geräte-Scanning\nDas System muss eine Liste verfügbarer Bluetooth-Hardwaregeräte anzeigen und den aktuellen Verbindungsstatus visualisieren. *(Bezug: UC-1)*\n\n**FA3**: Verbindungsaufbau\nDas System muss in der Lage sein, eine stabile Bluetooth-Verbindung mit dem IMU-Sensor herzustellen. *(Bezug: UC-1)*\n\n**FA4**: Trainings-Detailansicht\nDas System muss eine detaillierte Ansicht für ein ausgewähltes Training anzeigen. *(Bezug: UC-2)*\n\n**FA5**: Datenstrom-Verarbeitung\nDas System muss kontinuierliche Bewegungsdatenströme vom Sensor empfangen, filtern und verarbeiten können. *(Bezug: UC-2)*\n\n**FA6**: Echtzeit-Visualisierung\nDas System muss die empfangenen Sensordaten und Bewegungen in Echtzeit visualisieren. *(Bezug: UC-2)*\n\n**FA7**: Historische Analyse\nDas System muss historische Bewegungsdaten grafisch und statistisch anzeigen können. *(Bezug: UC-3)*\n\n**FA8**: Übungs-Demonstration\nDas System muss eine grafische Demonstration der auszuführenden Übungsbewegung anzeigen, sobald das Training gestartet wird. *(Bezug: UC-2)*\n\n**FA9**: Biofeedback und Auswertung\nDas System muss den Bewegungsfortschritt in Echtzeit visualisieren, mit der Zielvorgabe vergleichen und bei korrekter Durchführung positives Feedback (visuell und haptisch) ausgeben. *(Bezug: UC-2)*\n\n---\n\n## Nicht-funktionale Anforderungen (Muss-Kriterien)\n\n**NF1**: Latenz\nDie End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n**NF2**: Zuverlässigkeit und Reconnect\nBei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.\n\n**NF3**: Benutzbarkeit (Usability)\nDas Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n---\n\n## Randbedingungen\n\n**R1**: Plattform-Kompatibilität\nDie mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.\n\n**R2**: Physisches Gehäuse\nFür das Trainingsgeräte braucht es einen Sensor. Dieser Sensor sollte bestenfalls nicht lose auf der Haut getragen werden\n",
    "doc/Entscheidungen_Echtzeit_Training.md": "# Architekturentscheidungen: Echtzeit-Training & Bewegungserfassung\n\nDieses Dokument dokumentiert die Architekturentscheidungen zur Implementierung des interaktiven Trainings-Workflows (Bezug: **UC-2**, Schritte 3 & 4) in der MoveLink Mobile App.\n\n---\n\n## Übersicht der Phasen und Entscheidungen\n\n```mermaid\nflowchart TD\n    Start[User klickt 'Start'] --> P1[Phase 1: Demo & Countdown\\nLottie Animation]\n    P1 --> P2[Phase 2: Live-Erfassung\\nComplementary Filter & SVG UI]\n    P2 --> P3[Phase 3: Trajektorien-Vergleich\\nZustandsmaschine / FSM]\n    P3 --> P4[Phase 4: Multi-Sensory Feedback\\nexpo-haptics & Sound]\n```\n\n---\n\n## Phase 1: Grafische Übungsdemonstration\n\n### Entscheidung\nFür die grafische Demonstration der Übungsbewegungen werden **Lottie-Animationen (`lottie-react-native`)** verwendet.\n\n### Begründung\n* **Performance:** Lottie rendert vektorbasierte JSON-Dateien nativ auf dem Gerät. Dies spart erheblichen Speicherplatz im App-Bundle im Vergleich zu MP4-Videos oder GIF-Dateien und verhindert Ruckeln bei schwächerer Hardware.\n* **Flexibilität:** Die Abspielgeschwindigkeit (Cadence) kann programmgesteuert angepasst werden, um sie beispielsweise an das individuelle Tempo des Nutzers anzupassen.\n* **Design-Konsistenz:** Vektorgrafiken skalieren ohne Qualitätsverlust auf allen Bildschirmgrößen und passen perfekt zum modernen Dark-Mode/Glassmorphismus-Design der App.\n\n### Ablauf\n1. Der Trainierende klickt auf „Start“.\n2. Die App wechselt in den Zustand `preparing` und zeigt die Lottie-Loop-Animation der gewählten Übung.\n3. Ein 3-sekündiger optischer Countdown wird eingeblendet, um dem Trainierenden Zeit zu geben, sich in Position zu bringen.\n4. Nach Ablauf des Countdowns vibriert das Handy kurz, und die BLE-Datenaufzeichnung startet (`isRecording: true`).\n\n---\n\n## Phase 2: Echtzeit-Visualisierung & Sensor-Fusion\n\n### Entscheidung\n* **Sensor-Fusion:** Einsatz eines **Komplementärfilters (Complementary Filter)** zur Berechnung der Neigungswinkel aus Beschleunigungssensor und Gyroskop.\n* **UI:** Ein dynamischer, glühender **SVG-Progress-Ring** und eine Winkelanzeige visualisieren den Bewegungsfortschritt.\n\n### Begründung\n* **Latenz & Drift:** Die rohen Beschleunigungsdaten der IMU (XIAO nRF52840) neigen bei Erschütterungen zu starkem Rauschen, während die integrierten Gyroskopdaten über die Zeit abdriften (Drift). Der Komplementärfilter löst beide Probleme hocheffizient bei minimalem Rechenaufwand:\n  $$\\theta_{t} = \\alpha \\cdot (\\theta_{t-1} + \\omega \\cdot \\Delta t) + (1 - \\alpha) \\cdot \\theta_{\\text{acc}}$$\n  *Mit $\\alpha = 0.96$, $\\omega = \\text{Gyroskop-Drehrate}$ und $\\theta_{\\text{acc}} = \\text{Winkel aus Beschleunigungsdaten}$.*\n* **Latenz ≤ 100 ms (NF1):** Da der Filter direkt im Frontend auf den eingehenden BLE-Paketen rechnet, entfallen Netzwerk-Latenzen für die Kern-Visualisierung.\n* **Aesthetics:** Ein moderner, ringförmiger SVG-Fortschrittsbalken mit weichem Glüh-Effekt (Drop Shadow) fügt sich nahtlos in das restliche UI-Design ein.\n\n---\n\n## Phase 3: Vergleich mit der Zielvorgabe\n\n### Entscheidung\nDer Vergleich der Bewegung mit der Zielvorgabe erfolgt über eine **schwellenwertbasierte Zustandsmaschine (Finite State Machine - FSM)** statt rechenintensiver Machine-Learning-Modelle oder DTW auf dem Smartphone.\n\n### Begründung\n* **Ressourceneffizienz:** Für Standard-Fitnessübungen (z. B. Kniebeugen, Brizeps-Curls, Schulterdrücken) ist die Bewegung primär durch den Bewegungsumfang (Range of Motion - ROM) auf einer Hauptachse definiert. Eine FSM benötigt minimale Rechenleistung und schont den Akku des Mobilgeräts.\n* **Echtzeitfähigkeit:** Auswertungen können ohne spürbare Verzögerungen (sofort nach Erreichen des Zielwinkels) getroffen werden.\n\n### FSM-Zustände\n```mermaid\nstateDiagram-v2\n    [*] --> Start : Winkel < 15°\n    Start --> Moving : Winkel steigt > 20°\n    Moving --> Peak : Winkel >= Zielwinkel (z.B. 90°)\n    Peak --> Returning : Winkel sinkt\n    Returning --> Start : Winkel < 15° (Repetition +1)\n```\n\n---\n\n## Phase 4: Positives Feedback & Gamification\n\n### Entscheidung\nEinbindung eines **Multi-Sensory-Feedback-Systems** bestehend aus:\n* **Haptik:** Vibrations-Feedback über `expo-haptics`.\n* **Visuals:** Dynamische Farbänderungen der UI und Partikeleffekte bei Erfolg.\n* **Audio:** Ein kurzer, angenehmer Benachrichtigungston über `expo-av`.\n\n### Begründung\n* **Haptik:** Während des Trainings schaut der Trainierende oft nicht direkt auf den Bildschirm (z. B. bei Kniebeugen). Ein kurzes haptisches Signal beim Erreichen des Peak-Winkels und beim Abschluss der Wiederholung ist daher essenziell für die Usability.\n* **Visuelle Belohnung:** Der Fortschrittsring wechselt beim Erreichen des Zielwinkels seine Farbe von Blau/Türkis zu einem leuchtenden Smaragdgrün, um ein sofortiges Erfolgsgefühl zu vermitteln.\n\n---\n\n## Technische Blaupause (TypeScript-Referenz)\n\nFolgender Code skizziert die Realisierung des Tracking-Hooks:\n\n```typescript\nimport { useState, useRef } from 'react';\nimport * as Haptics from 'expo-haptics';\nimport { Audio } from 'expo-av';\nimport { IMUReading } from '@/store';\n\nexport type ExerciseState = 'start' | 'moving' | 'peak' | 'returning';\n\nexport function useExerciseTracker(targetAngle = 90) {\n  const [angle, setAngle] = useState(0);\n  const [reps, setReps] = useState(0);\n  const [state, setState] = useState<ExerciseState>('start');\n  \n  const lastTime = useRef<number>(Date.now());\n  const currentAngle = useRef<number>(0);\n\n  const updateMeasurement = async (reading: IMUReading) => {\n    const now = Date.now();\n    const dt = (now - lastTime.current) / 1000.0;\n    lastTime.current = now;\n\n    // 1. Beschleunigungswinkel berechnen (z.B. Pitch)\n    const accelAngle = Math.atan2(reading.accelY, reading.accelZ) * (180 / Math.PI);\n\n    // 2. Gyroskop-Integration & Komplementärfilter\n    const alpha = 0.96;\n    currentAngle.current = alpha * (currentAngle.current + reading.gyroX * dt) + (1 - alpha) * accelAngle;\n    \n    const absoluteAngle = Math.abs(currentAngle.current);\n    setAngle(absoluteAngle);\n\n    // 3. FSM für Wiederholungs- & Peak-Erkennung\n    switch (state) {\n      case 'start':\n        if (absoluteAngle > 20) {\n          setState('moving');\n        }\n        break;\n      case 'moving':\n        if (absoluteAngle >= targetAngle) {\n          setState('peak');\n          // Sofortiges haptisches Feedback bei Erfolg\n          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);\n          // Optionaler Sound\n          playSuccessSound();\n        }\n        break;\n      case 'peak':\n        if (absoluteAngle < targetAngle - 5) {\n          setState('returning');\n        }\n        break;\n      case 'returning':\n        if (absoluteAngle < 15) {\n          setState('start');\n          setReps((r) => r + 1); // Zähler erhöhen\n        }\n        break;\n    }\n  };\n\n  const playSuccessSound = async () => {\n    const { sound } = await Audio.Sound.createAsync(\n      require('@/assets/sounds/success.mp3')\n    );\n    await sound.playAsync();\n  };\n\n  return { angle, reps, state, updateMeasurement };\n}\n```\n",
    "embedded/components/sensordatenerfassung/IMUReader.h": "#ifndef IMU_READER_H\n#define IMU_READER_H\n\n#include <Arduino.h>\n\n// @implements FA5, NF1\nbool initIMU();\n\n// @implements FA5, NF1\nvoid readSensorData(float* buffer, size_t startIndex);\n\n#endif // IMU_READER_H\n",
    "app/architecture.md": "# MoveLink Mobile App - Container-Architektur\n\nDieses Dokument beschreibt die Mobile App als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Android Package (.apk) / iOS IPA\n* **Technologie-Stack:** React Native, Expo, TypeScript, Zustand, BLE PLX\n\n## Beschreibung\nDie MoveLink Mobile App ist die primäre Benutzerschnittstelle des Systems. Sie läuft auf Android- und iOS-Endgeräten und verbindet sich über Bluetooth Low Energy (BLE) mit dem embedded Sensor-Gerät, um Bewegungsdaten in Echtzeit zu erfassen, zu visualisieren und zur persistenten Speicherung an das Backend zu übertragen.\n\n```mermaid\nflowchart TD\n    User[Trainierender] -->|Interagiert mit| App[React Native App Container]\n    App -->|BLE Bluetooth| Sensor[Sensor Firmware Container]\n    App -->|REST/WebSockets| Backend[Backend API Container]\n```\n\n## Komponenten in diesem Container\nDie App enthält mehrere Komponenten (C4-Komponenten-Ebene):\n1. **SideNav**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1)\n2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)\n3. **LiveChart**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA6)\n4. **SessionCard**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA7)\n5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)\n",
    "doc/UseCases.md": "# Anwendungsfälle (Use Cases)\n\nHier werden die primären Interaktionen zwischen dem Trainierenden und dem MoveLink-System beschrieben.\n\n---\n\n**UC-1**: Trainingsgerät verbinden\n* **Akteur**: Trainierender\n* **Vorbedingung**: Trainingsgerät ist eingeschaltet und befindet sich in Reichweite.\n* **Beschreibung**: Als Trainierender möchte ich mein Trainingsgerät mit der App verbinden, um Trainingsdaten erfassen zu können.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt eine Möglichkeit/einen Reiter für Hardwaregeräte an.\n  2. **Eingabe**: Der Trainierende klicke auf den Reiter \"Hardwaregeräte\".\n     **Ausgabe**: Die App zeigt eine Liste der verfügbaren Hardwaregeräte sowie den aktuellen Verbindungsstatus an.\n  3. **Eingabe**: Der Trainierende wählt ein Hardwaregerät aus der Liste aus und klickt auf \"Verbinden\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Geräts und bestätigt den erfolgreichen Verbindungsaufbau.\n\n---\n\n**UC-2**: Echtzeit-Training überwachen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Das Trainingsgerät ist erfolgreich mit der App verbunden.\n* **Beschreibung**: Ich als Trainierender möchte mein Training in Echtzeit überwachen können, um direkt Feedback zu meiner Ausführung zu erhalten.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt die Option zum Starten eines Trainings an.\n  2. **Eingabe**: Der Trainierende klickt auf \"Training starten\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Trainings sowie die Start-Schaltfläche.\n  3. **Eingabe**: Der Trainierende drückt den \"Start\"-Button.\n     **Ausgabe**: Die App demonstriert grafisch die auszuführende Übungsbewegung. *(Bezug: FA8)*\n  4. **Eingabe**: Der Trainierende führt die Bewegung aus.\n     **Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung. *(Bezug: FA5, FA6, FA9)*\n\n---\n\n**UC-3**: Trainingsdaten einsehen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Mindestens eine aufgezeichnete Trainingseinheit ist in der Datenbank vorhanden.\n* **Beschreibung**: Ich als Trainierender möchte vergangene Trainingseinheiten einsehen können, um meine Fortschritte zu verfolgen.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App bietet eine Option zum Einsehen des Trainingsverlaufs.\n  2. **Eingabe**: Der Trainierende navigiert zum Reiter \"Trainingseinheiten\".\n     **Ausgabe**: Die App listet alle vergangenen Trainingseinheiten chronologisch auf.\n  3. **Eingabe**: Der Trainierende wählt eine Trainingseinheit aus der Liste aus.\n     **Ausgabe**: Die App bereitet die historischen Bewegungsdaten grafisch und statistisch auf.",
    "embedded/src/Executable.ino": "/* \n * @implements FA5, FA9, NF1\n * Includes ---------------------------------------------------------------- */\n#include <Erlind-project-1_inferencing.h> // For model parameters/defines\n#include \"../components/sensordatenerfassung/IMUReader.h\"\n#include \"../components/inferenz_engine/InferenceEngine.h\"\n#include \"../components/led_display_controller/VisualFeedback.h\"\n#include \"../components/ble_streamer/BLEStreamer.h\"\n\nstatic float dsp_buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = { 0 };\n\nvoid setup()\n{\n    Serial.begin(115200);\n    initFeedback();\n    \n    // Warte kurz, damit der Serielle Monitor bereit ist\n    delay(1000);\n\n    if (!initIMU()) {\n        Serial.println(\"Failed to initialize IMU!\");\n    } else {\n        Serial.println(\"IMU initialized\");\n    }\n\n    if (!initBLE()) {\n        Serial.println(\"Failed to initialize BLE!\");\n    } else {\n        Serial.println(\"BLE initialized\");\n    }\n\n    // SICHERHEITSCHECK: Prüfen ob das Modell wirklich für 6 Achsen trainiert wurde\n    if (EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME != 6) {\n        Serial.print(\"ERR: EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME sollte 6 sein (Accel + Gyro)!\\n\");\n        return;\n    }\n}\n\nvoid loop()\n{\n    // Da wir 6 Achsen haben, springen wir in 6er-Schritten durch den DSP Puffer\n    for (size_t ix = 0; ix < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE; ix += 6) {\n        uint64_t next_tick = micros() + (EI_CLASSIFIER_INTERVAL_MS * 1000);\n\n        readSensorData(dsp_buffer, ix);\n\n        // Stream the raw sensor data via Bluetooth Low Energy\n        streamIMUData(dsp_buffer[ix], dsp_buffer[ix + 1], dsp_buffer[ix + 2],\n                      dsp_buffer[ix + 3], dsp_buffer[ix + 4], dsp_buffer[ix + 5]);\n\n        delayMicroseconds(next_tick - micros());\n    }\n\n    // Klassifikator ausführen\n    String label;\n    float confidence = 0.0;\n    float anomaly = 0.0;\n    \n    if (runModelInference(dsp_buffer, label, confidence, anomaly)) {\n        // Display-Aktualisierung & LED Logik\n        updateFeedback(label, confidence, anomaly);\n    }\n}",
    "app/components/SessionCard.tsx": "/**\n * @implements FA7\n */\nimport React from 'react';\nimport { View, Text, TouchableOpacity, StyleSheet } from 'react-native';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { Colors } from '@/constants/Colors';\nimport { TrainingSession } from '@/store';\n\ninterface Props {\n  session: TrainingSession;\n  onPress: () => void;\n  index?: number;\n}\n\nfunction formatDuration(s: number) {\n  const m = Math.floor(s / 60);\n  const sec = s % 60;\n  return `${m}:${sec.toString().padStart(2, '0')}`;\n}\n\nfunction formatDate(iso: string) {\n  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });\n}\n\nfunction formatTime(iso: string) {\n  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });\n}\n\nexport function SessionCard({ session, onPress, index = 0 }: Props) {\n  return (\n    <FadeSlide delay={index * 60}>\n      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>\n        <View style={styles.accent} />\n        <View style={styles.body}>\n          <View style={styles.dateRow}>\n            <Text style={styles.date}>{formatDate(session.startedAt)}</Text>\n            <Text style={styles.time}>{formatTime(session.startedAt)}</Text>\n          </View>\n          <View style={styles.statsRow}>\n            <View style={styles.stat}>\n              <Text style={styles.statValue}>{formatDuration(session.durationSeconds)}</Text>\n              <Text style={styles.statLabel}>Dauer</Text>\n            </View>\n            <View style={styles.divider} />\n            <View style={styles.stat}>\n              <Text style={styles.statValue}>{session.readingCount.toLocaleString()}</Text>\n              <Text style={styles.statLabel}>Messwerte</Text>\n            </View>\n          </View>\n        </View>\n        <Text style={styles.arrow}>›</Text>\n      </TouchableOpacity>\n    </FadeSlide>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    backgroundColor: Colors.surface,\n    borderRadius: 16,\n    borderWidth: 1,\n    borderColor: Colors.border,\n    overflow: 'hidden',\n    gap: 14,\n    paddingRight: 16,\n    paddingVertical: 14,\n  },\n  accent: {\n    width: 3,\n    alignSelf: 'stretch',\n    backgroundColor: Colors.primary,\n    borderTopRightRadius: 2,\n    borderBottomRightRadius: 2,\n  },\n  body: { flex: 1, gap: 8 },\n  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },\n  date: { color: Colors.text, fontSize: 14, fontWeight: '700' },\n  time: { color: Colors.textSub, fontSize: 12 },\n  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },\n  stat: { gap: 1 },\n  statValue: { color: Colors.primary, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },\n  statLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },\n  divider: { width: 1, height: 28, backgroundColor: Colors.border },\n  arrow: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },\n});\n",
    "embedded/components/led_display_controller/VisualFeedback.cpp": "// @implements FA9\n#include \"VisualFeedback.h\"\n#include <U8X8lib.h>\n\nstatic U8X8_SSD1306_64X48_ER_HW_I2C u8x8(/* reset=*/ U8X8_PIN_NONE);\n\n// RGB LED Pins des XIAO nRF52840 (LOW = An, HIGH = Aus)\nstatic const int RED_ledPin = 11;\nstatic const int BLUE_ledPin = 12;\nstatic const int GREEN_ledPin = 13;\n\n// @implements FA9\nvoid initFeedback() {\n    u8x8.begin();\n    \n    // LEDs initial ausschalten\n    pinMode(RED_ledPin, OUTPUT);\n    pinMode(BLUE_ledPin, OUTPUT);\n    pinMode(GREEN_ledPin, OUTPUT);\n    digitalWrite(RED_ledPin, HIGH);\n    digitalWrite(BLUE_ledPin, HIGH);\n    digitalWrite(GREEN_ledPin, HIGH);\n}\n\n// @implements FA9\nvoid updateFeedback(const String& best_label, float best_val, float anomaly_score) {\n    u8x8.clear();\n    u8x8.setFont(u8x8_font_amstrad_cpc_extended_r);\n\n    if (best_label == \"idle\" || best_val < 0.6) {\n        // Ruhemodus -> LED Blau, kein JSON senden um PC-Spam zu vermeiden\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, LOW); \n        digitalWrite(GREEN_ledPin, HIGH);\n        u8x8.drawString(0, 2, \"Status:\");\n        u8x8.drawString(0, 4, \"IDLE\");\n    } \n    else if (best_label == \"curl_sauber\") {\n        // Sauberer Curl -> LED Grün\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, HIGH);\n        digitalWrite(GREEN_ledPin, LOW);\n        u8x8.drawString(0, 2, \"Curl:\");\n        u8x8.drawString(0, 4, \"PERFEKT\");\n        \n        sendJsonToPC(best_label, best_val, anomaly_score, \"Super Ausfuehrung!\");\n        delay(1500); // Cooldown um Doppel-Erkennung des gleichen Curls zu verhindern\n    }\n    else {\n        // Irgendein Fehler erkannt (z.B. \"fehler_rotation\" oder \"fehler_ellbogen\") -> LED Rot\n        digitalWrite(RED_ledPin, LOW);\n        digitalWrite(BLUE_ledPin, HIGH);\n        digitalWrite(GREEN_ledPin, HIGH);\n        u8x8.drawString(0, 2, \"Achtung:\");\n        u8x8.drawString(0, 4, \"FEHLER\");\n\n        // Dynamischer Tipp je nach Fehlerklasse\n        String tipp = \"Bewegung korrigieren\";\n        if (best_label.indexOf(\"rotation\") >= 0) tipp = \"Handgelenk stabil halten!\";\n        if (best_label.indexOf(\"ellbogen\") >= 0) tipp = \"Ellbogen fixieren!\";\n\n        sendJsonToPC(best_label, best_val, anomaly_score, tipp);\n        delay(1500); // Cooldown\n    }\n\n    u8x8.refreshDisplay();\n}\n\n// @implements FA9\nvoid sendJsonToPC(String label, float confidence, float anomaly, String tipp) {\n    Serial.print(\"{\\\"event\\\": \\\"inferenz_ergebnis\\\", \");\n    Serial.print(\"\\\"klasse\\\": \\\"\" + label + \"\\\", \");\n    Serial.print(\"\\\"wahrscheinlichkeit\\\": \" + String(confidence, 3) + \", \");\n    Serial.print(\"\\\"anomalie_score\\\": \" + String(anomaly, 3) + \", \");\n    Serial.println(\"\\\"tipp\\\": \\\"\" + tipp + \"\\\"}\");\n}\n",
    "app/components/LiveChart.tsx": "/**\n * @implements FA6\n */\nimport React, { useMemo, useState } from 'react';\nimport { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';\nimport Svg, { Path, Polyline, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { GlassCard } from '@/components/GlassCard';\nimport { Colors } from '@/constants/Colors';\nimport { IMUReading } from '@/store';\n\ntype Mode = 'accel' | 'gyro';\n\ninterface Props {\n  data: IMUReading[];\n}\n\nconst PAD = { l: 38, r: 10, t: 12, b: 20 };\nconst HEIGHT = 170;\n\nconst MODES: { key: Mode; label: string }[] = [\n  { key: 'accel', label: 'Accelerometer' },\n  { key: 'gyro', label: 'Gyroskop' },\n];\n\nconst SERIES = {\n  accel: [\n    { field: 'accelX' as keyof IMUReading, color: Colors.accentX, label: 'X' },\n    { field: 'accelY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },\n    { field: 'accelZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },\n  ],\n  gyro: [\n    { field: 'gyroX' as keyof IMUReading, color: Colors.accentX, label: 'X' },\n    { field: 'gyroY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },\n    { field: 'gyroZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },\n  ],\n};\n\nfunction buildPaths(data: IMUReading[], fields: (keyof IMUReading)[], chartW: number, chartH: number) {\n  if (data.length < 2) return [];\n  const allVals = fields.flatMap((f) => data.map((r) => r[f] as number));\n  const min = Math.min(...allVals);\n  const max = Math.max(...allVals);\n  const range = max - min || 1;\n  const xStep = chartW / (data.length - 1);\n  const toY = (v: number) => chartH - ((v - min) / range) * chartH;\n\n  return fields.map((field) => {\n    const pts = data.map((r, i) => ({ x: i * xStep, y: toY(r[field] as number) }));\n    const lineStr = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');\n    const first = pts[0];\n    const last = pts[pts.length - 1];\n    const areaStr = `M ${first.x.toFixed(1)},${chartH} L ${lineStr.split(' ').join(' L ')} L ${last.x.toFixed(1)},${chartH} Z`;\n    return { line: lineStr, area: areaStr };\n  });\n}\n\nfunction offsetPoints(str: string, dx: number, dy: number): string {\n  return str.split(' ').map((token) => {\n    if (['M', 'L', 'Z'].includes(token)) return token;\n    const [x, y] = token.split(',').map(Number);\n    return `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;\n  }).join(' ');\n}\n\nexport function LiveChart({ data }: Props) {\n  const [mode, setMode] = useState<Mode>('accel');\n  const [modeKey, setModeKey] = useState(0);\n  const screenW = Dimensions.get('window').width;\n  const chartW = screenW - 32 - PAD.l - PAD.r;\n  const chartH = HEIGHT - PAD.t - PAD.b;\n\n  const series = SERIES[mode];\n  const paths = useMemo(\n    () => buildPaths(data, series.map((s) => s.field), chartW, chartH),\n    [data, mode, chartW, chartH]\n  );\n\n  const hasData = data.length >= 2;\n  const allVals = hasData ? series.flatMap((s) => data.map((r) => r[s.field] as number)) : [0, 1];\n  const minVal = Math.min(...allVals);\n  const maxVal = Math.max(...allVals);\n\n  function switchMode(m: Mode) {\n    setMode(m);\n    setModeKey((k) => k + 1);\n  }\n\n  return (\n    <GlassCard style={styles.card}>\n      <View style={styles.toggle}>\n        {MODES.map(({ key, label }) => (\n          <TouchableOpacity\n            key={key}\n            onPress={() => switchMode(key)}\n            style={[styles.toggleBtn, mode === key && styles.toggleBtnActive]}\n            activeOpacity={0.7}\n          >\n            <Text style={[styles.toggleText, mode === key && styles.toggleTextActive]}>\n              {label}\n            </Text>\n          </TouchableOpacity>\n        ))}\n      </View>\n\n      {!hasData ? (\n        <View style={[styles.empty, { height: HEIGHT }]}>\n          <Text style={styles.emptyText}>Warte auf Sensordaten…</Text>\n        </View>\n      ) : (\n        <FadeSlide key={modeKey} from={{ opacity: 0, translateY: 0 }} delay={0}>\n          <Svg width={screenW - 32} height={HEIGHT}>\n            <Defs>\n              {series.map((s, i) => (\n                <LinearGradient key={i} id={`g${i}_${mode}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n                  <Stop offset=\"0%\" stopColor={s.color} stopOpacity=\"0.22\" />\n                  <Stop offset=\"100%\" stopColor={s.color} stopOpacity=\"0\" />\n                </LinearGradient>\n              ))}\n            </Defs>\n\n            <SvgText x={PAD.l - 4} y={PAD.t + 8} fill={Colors.textSub} fontSize=\"9\" textAnchor=\"end\">\n              {maxVal.toFixed(1)}\n            </SvgText>\n            <SvgText x={PAD.l - 4} y={PAD.t + chartH} fill={Colors.textSub} fontSize=\"9\" textAnchor=\"end\">\n              {minVal.toFixed(1)}\n            </SvgText>\n\n            <Line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />\n            <Line x1={PAD.l} y1={PAD.t + chartH} x2={PAD.l + chartW} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />\n            <Line x1={PAD.l} y1={PAD.t + chartH / 2} x2={PAD.l + chartW} y2={PAD.t + chartH / 2} stroke={Colors.border} strokeWidth={1} strokeDasharray=\"3,4\" />\n\n            {paths.map((p, i) => (\n              <React.Fragment key={i}>\n                <Path d={offsetPoints(p.area, PAD.l, PAD.t)} fill={`url(#g${i}_${mode})`} />\n                <Polyline\n                  points={p.line.split(' ').map((pt) => {\n                    const [x, y] = pt.split(',').map(Number);\n                    return `${(x + PAD.l).toFixed(1)},${(y + PAD.t).toFixed(1)}`;\n                  }).join(' ')}\n                  fill=\"none\"\n                  stroke={series[i].color}\n                  strokeWidth={1.8}\n                  strokeLinejoin=\"round\"\n                  strokeLinecap=\"round\"\n                />\n              </React.Fragment>\n            ))}\n          </Svg>\n        </FadeSlide>\n      )}\n\n      <View style={styles.legend}>\n        {series.map((s) => (\n          <View key={s.label} style={styles.legendItem}>\n            <View style={[styles.legendDot, { backgroundColor: s.color }]} />\n            <Text style={styles.legendText}>{s.label}</Text>\n          </View>\n        ))}\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: { padding: 14, gap: 8 },\n  toggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3, gap: 3 },\n  toggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },\n  toggleBtnActive: { backgroundColor: Colors.surfaceBright },\n  toggleText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },\n  toggleTextActive: { color: Colors.text },\n  empty: { alignItems: 'center', justifyContent: 'center' },\n  emptyText: { color: Colors.textMuted, fontSize: 13 },\n  legend: { flexDirection: 'row', gap: 16 },\n  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },\n  legendDot: { width: 7, height: 7, borderRadius: 3.5 },\n  legendText: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },\n});\n",
    "embedded/components/ble_streamer/BLEStreamer.cpp": "// @implements FA3, FA5\n#include \"BLEStreamer.h\"\n#include <ArduinoBLE.h>\n\nstatic BLEService imuService(\"12345678-1234-1234-1234-123456789012\");\nstatic BLECharacteristic imuCharacteristic(\"12345678-1234-1234-1234-123456789013\", BLERead | BLENotify, 24);\n\nbool initBLE() {\n    if (!BLE.begin()) {\n        Serial.println(\"Starting BLE failed!\");\n        return false;\n    }\n    \n    BLE.setLocalName(\"MoveLink Sensor\");\n    BLE.setAdvertisedService(imuService);\n    \n    imuService.addCharacteristic(imuCharacteristic);\n    BLE.addService(imuService);\n    \n    // Initial data: 6 floats (24 bytes) all set to 0.0f\n    float initialData[6] = {0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f};\n    imuCharacteristic.writeValue((uint8_t*)initialData, 24);\n    \n    BLE.advertise();\n    Serial.println(\"BLE advertising started.\");\n    return true;\n}\n\nvoid streamIMUData(float ax, float ay, float az, float gx, float gy, float gz) {\n    float packet[6] = {ax, ay, az, gx, gy, gz};\n    \n    // Update the characteristic value and notify connected client\n    imuCharacteristic.writeValue((uint8_t*)packet, 24);\n    \n    // Periodically poll BLE state\n    BLE.poll();\n}\n"
  }
};