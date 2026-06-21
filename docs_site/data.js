const DOCS_DATA = {
  "files": [
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
      "path": "doc/firstnotes.md",
      "title": "doc/firstnotes.md",
      "content": "Mikrocontroller <--- Datenpakete ---> App\n\n\nBackend <- API -> Frontend\n(Backend?)\n\nProblemstellung:\n\nDarstellung von Trainingsdatensätzen zur Bewegungsanalyse.\n\nProjektebene\nStakeholder:\n- Trainierenden (Fokus)\n- Entwickler\n- Dienstleister\n- Hochschule \n\n\nAnforderungen an die App:\n\n2 Zustände:\n\n1 Zustand (Fokus) aktives Trainig:\n- Intention: visuelle Darstellung des Trainingsfortschritts in Echtzeit\n\n- FA: In Echtzeit eine Bewertung abliefern\n- FA: Darstellung der Ausführung\n\n- NFA: Eine eigenständige Applikation\n- NFA: Das Darstellen der darf Höchstens 1 Sekunden dauern\n\n- Rahmenbedingung: Auf Android, Mac und Windows funktionsfähig\n- Technologien: Flutter & MAUI\n\n\nIch habe einen XIOA nRF52840 Gerät. Ich möchte die Daten in Echtzeit in einem Frontend anzeigen z.B. React. Wie sinnvoll und komplex wäre es einen Server dazwischen zu packen?\n\n\n",
      "headings": [],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "doc/Requirements.md",
      "title": "Systemanforderungen (Requirements)",
      "content": "# Systemanforderungen (Requirements)\n\nDieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.\n\n---\n\n## Funktionale Anforderungen\n\n**FA1**: Dashboard und Navigation\nDas System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*\n\n**FA2**: Geräte-Scanning\nDas System muss eine Liste verfügbarer Bluetooth-Hardwaregeräte anzeigen und den aktuellen Verbindungsstatus visualisieren. *(Bezug: UC-1)*\n\n**FA3**: Verbindungsaufbau\nDas System muss in der Lage sein, eine stabile Bluetooth-Verbindung mit dem IMU-Sensor herzustellen. *(Bezug: UC-1)*\n\n**FA4**: Trainings-Detailansicht\nDas System muss eine detaillierte Ansicht für ein ausgewähltes Training anzeigen. *(Bezug: UC-2)*\n\n**FA5**: Datenstrom-Verarbeitung\nDas System muss kontinuierliche Bewegungsdatenströme vom Sensor empfangen, filtern und verarbeiten können. *(Bezug: UC-2)*\n\n**FA6**: Echtzeit-Visualisierung\nDas System muss die empfangenen Sensordaten und Bewegungen in Echtzeit visualisieren. *(Bezug: UC-2)*\n\n**FA7**: Historische Analyse\nDas System muss historische Bewegungsdaten grafisch und statistisch anzeigen können. *(Bezug: UC-3)*\n\n---\n\n## Nicht-funktionale Anforderungen (Muss-Kriterien)\n\n**NF1**: Latenz\nDie End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n**NF2**: Zuverlässigkeit und Reconnect\nBei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.\n\n**NF3**: Benutzbarkeit (Usability)\nDas Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n---\n\n## Randbedingungen\n\n**R1**: Plattform-Kompatibilität\nDie mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.\n",
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
          "line": 32
        },
        {
          "level": 2,
          "text": "Randbedingungen",
          "line": 45
        }
      ],
      "c4_level": null,
      "deployable": null
    },
    {
      "path": "doc/UseCases.md",
      "title": "Anwendungsfälle (Use Cases)",
      "content": "# Anwendungsfälle (Use Cases)\n\nHier werden die primären Interaktionen zwischen dem Trainierenden und dem MoveLink-System beschrieben.\n\n---\n\n**UC-1**: Trainingsgerät verbinden\n* **Akteur**: Trainierender\n* **Vorbedingung**: Trainingsgerät ist eingeschaltet und befindet sich in Reichweite.\n* **Beschreibung**: Als Trainierender möchte ich mein Trainingsgerät mit der App verbinden, um Trainingsdaten erfassen zu können.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt eine Möglichkeit/einen Reiter für Hardwaregeräte an.\n  2. **Eingabe**: Der Trainierende klicke auf den Reiter \"Hardwaregeräte\".\n     **Ausgabe**: Die App zeigt eine Liste der verfügbaren Hardwaregeräte sowie den aktuellen Verbindungsstatus an.\n  3. **Eingabe**: Der Trainierende wählt ein Hardwaregerät aus der Liste aus und klickt auf \"Verbinden\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Geräts und bestätigt den erfolgreichen Verbindungsaufbau.\n\n---\n\n**UC-2**: Echtzeit-Training überwachen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Das Trainingsgerät ist erfolgreich mit der App verbunden.\n* **Beschreibung**: Ich als Trainierender möchte mein Training in Echtzeit überwachen können, um direkt Feedback zu meiner Ausführung zu erhalten.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App zeigt die Option zum Starten eines Trainings an.\n  2. **Eingabe**: Der Trainierende klickt auf \"Training starten\".\n     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Trainings sowie die Start-Schaltfläche.\n  3. **Eingabe**: Der Trainierende drückt den \"Start\"-Button.\n     **Ausgabe**: Die App demonstriert grafisch die auszuführende Übungsbewegung.\n  4. **Eingabe**: Der Trainierende führt die Bewegung aus.\n     **Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung.\n\n---\n\n**UC-3**: Trainingsdaten einsehen\n* **Akteur**: Trainierender\n* **Vorbedingung**: Mindestens eine aufgezeichnete Trainingseinheit ist in der Datenbank vorhanden.\n* **Beschreibung**: Ich als Trainierender möchte vergangene Trainingseinheiten einsehen können, um meine Fortschritte zu verfolgen.\n* **Ablauf (Szenario)**:\n  1. **Eingabe**: Der Trainierende öffnet die App.\n     **Ausgabe**: Die App bietet eine Option zum Einsehen des Trainingsverlaufs.\n  2. **Eingabe**: Der Trainierende navigiert zum Reiter \"Trainingseinheiten\".\n     **Ausgabe**: Die App listet alle vergangenen Trainingseinheiten chronologisch auf.\n  3. **Eingabe**: Der Trainierende wählt eine Trainingseinheit aus der Liste aus.\n     **Ausgabe**: Die App bereitet die historischen Bewegungsdaten grafisch und statistisch auf.",
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
      "path": "embedded/architecture.md",
      "title": "MoveLink Embedded Firmware - Container-Architektur",
      "content": "# MoveLink Embedded Firmware - Container-Architektur\n\nDieses Dokument beschreibt die Embedded Sensor-Firmware als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Binär-Firmware (flashed via USB/Serial)\n* **Technologie-Stack:** Arduino C/C++, LSM6DS3 IMU Library, Edge Impulse SDK, Bluetooth Low Energy\n\n## Beschreibung\nDie Sensor-Firmware läuft auf dem XIAO nRF52840 Sense Controller. Sie erfasst Beschleunigungs- und Rotationsdaten über den integrierten LSM6DS3-Sensor mit einer festen Abtastrate (50Hz), wendet Signalfilterungen zur Rauschunterdrückung an und streamt die Datenpakete als binäres Array via BLE Characteristics an die Mobile App. Alternativ führt sie Edge-Impulse-Inferenzmodelle direkt auf dem Mikrocontroller aus, um Trainingsübungen (z.B. Bizeps-Curls) lokal zu klassifizieren und Fehler über die integrierten RGB-LEDs anzuzeigen.\n\n```mermaid\nflowchart TD\n    Sensor[MPU6050/LSM6DS3 IMU Sensor] -->|I2C Rohdaten| Firmware[XIAO nRF52840 Arduino Firmware]\n    Firmware -->|Inferenz / Signalfilterung| BLE[BLE Characteristic]\n    BLE -->|Paket-Stream| App[React Native Mobile App]\n```\n\n## Komponenten in diesem Container\n1. **Sensordatenerfassung (Loop)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5)\n2. **Inferenz-Engine (Edge Impulse)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5)\n3. **LED- & Display-Controller**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern. (Erfüllt: FA5)\n",
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
          "line": 21
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
    }
  ],
  "definitions": {
    "UC-1": {
      "id": "UC-1",
      "title": "Trainingsgerät verbinden",
      "file": "doc/UseCases.md",
      "line": 7,
      "links": [],
      "type": "UC"
    },
    "FA2": {
      "id": "FA2",
      "title": "Geräte-Scanning Das System muss eine Liste verfügbarer Bluetooth-Hardwaregeräte anzeigen und den aktuellen Verbindungsstatus visualisieren. *(Bezug: UC-1)*",
      "file": "doc/Requirements.md",
      "line": 12,
      "links": [
        "UC-1"
      ],
      "type": "FA"
    },
    "FA3": {
      "id": "FA3",
      "title": "Verbindungsaufbau Das System muss in der Lage sein, eine stabile Bluetooth-Verbindung mit dem IMU-Sensor herzustellen. *(Bezug: UC-1)*",
      "file": "doc/Requirements.md",
      "line": 15,
      "links": [
        "UC-1"
      ],
      "type": "FA"
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
    "NF1": {
      "id": "NF1",
      "title": "Latenz Die End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.",
      "file": "doc/Requirements.md",
      "line": 34,
      "links": [],
      "type": "NF"
    },
    "NF2": {
      "id": "NF2",
      "title": "Zuverlässigkeit und Reconnect Bei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.",
      "file": "doc/Requirements.md",
      "line": 37,
      "links": [],
      "type": "NF"
    },
    "NF3": {
      "id": "NF3",
      "title": "Benutzbarkeit (Usability) Das Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.",
      "file": "doc/Requirements.md",
      "line": 40,
      "links": [],
      "type": "NF"
    },
    "R1": {
      "id": "R1",
      "title": "Plattform-Kompatibilität Die mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.",
      "file": "doc/Requirements.md",
      "line": 47,
      "links": [],
      "type": "R"
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
    "UC-1": [
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 180,
        "context": "\\textbf{UC-1: Trainingsger\\\"at verbinden} \\vspace{.25cm} \\newline"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 217,
        "context": "\\item \\textbf{FA1:} Das System muss einen Reiter oder eine Navigationsm\\\"oglichkeit f\\\"ur Hardwareger\\\"ate / Trainings / vergangene Trainingseinheiten anzeigen. (aus UC-1, UC-2, UC-3)"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 218,
        "context": "\\item \\textbf{FA2:} Das System muss mir eine Liste von verfügbaren Hardwareger\\\"ate und mit welchen Hardwareger\\\"aten ich verbunden bin anzeigen. (aus UC-1)"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 219,
        "context": "\\item \\textbf{FA3:} Das System muss einen verbindungsaufbau mit dem Hardwareger\\\"at herstellen k\\\"onnen. (aus UC-1)"
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
      },
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
      }
    ],
    "FA2": [
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, FA4, FA5, FA6"
      },
      {
        "file": "app/components/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, NF3"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 218,
        "context": "\\item \\textbf{FA2:} Das System muss mir eine Liste von verfügbaren Hardwareger\\\"ate und mit welchen Hardwareger\\\"aten ich verbunden bin anzeigen. (aus UC-1)"
      },
      {
        "file": "app/architecture.md",
        "line": 24,
        "context": "2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 27,
        "context": "**FA2: Bluetooth LE Signalstärke**"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 54,
        "context": "// @implements FA2, FA3, NF2"
      }
    ],
    "FA3": [
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, FA4, FA5, FA6"
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
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 219,
        "context": "\\item \\textbf{FA3:} Das System muss einen verbindungsaufbau mit dem Hardwareger\\\"at herstellen k\\\"onnen. (aus UC-1)"
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
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 35,
        "context": "**FA3: BLE Verbindungsaufbau (UC-1)**"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 54,
        "context": "// @implements FA2, FA3, NF2"
      }
    ],
    "FA1": [
      {
        "file": "app/app/(tabs)/_layout.tsx",
        "line": 2,
        "context": "* @implements FA1"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 217,
        "context": "\\item \\textbf{FA1:} Das System muss einen Reiter oder eine Navigationsm\\\"oglichkeit f\\\"ur Hardwareger\\\"ate / Trainings / vergangene Trainingseinheiten anzeigen. (aus UC-1, UC-2, UC-3)"
      },
      {
        "file": "app/architecture.md",
        "line": 23,
        "context": "1. **SideNav**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 16,
        "context": "* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)"
      }
    ],
    "FA4": [
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, FA4, FA5, FA6"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 220,
        "context": "\\item \\textbf{FA4:} Das System muss eine Detailansicht f\\\"ur ein ausgew\\\"ahltes Training anzeigen. (aus UC-2)"
      }
    ],
    "FA5": [
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, FA4, FA5, FA6"
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
        "file": "app/store/index.ts",
        "line": 2,
        "context": "* @implements FA5"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 221,
        "context": "\\item \\textbf{FA5:} Das System muss Bewegungsdatenstr\\\"ome empfangen und verarbeiten k\\\"onnen. (aus UC-2)"
      },
      {
        "file": "embedded/src/Executable.ino",
        "line": 2,
        "context": "* @implements FA5"
      },
      {
        "file": "embedded/src/Training_Skript/Training_Skript.ino",
        "line": 2,
        "context": "// @implements FA5"
      },
      {
        "file": "app/architecture.md",
        "line": 27,
        "context": "5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 63,
        "context": "* @implements FA5, NF1"
      },
      {
        "file": "embedded/architecture.md",
        "line": 22,
        "context": "1. **Sensordatenerfassung (Loop)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5)"
      },
      {
        "file": "embedded/architecture.md",
        "line": 23,
        "context": "2. **Inferenz-Engine (Edge Impulse)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5)"
      },
      {
        "file": "embedded/architecture.md",
        "line": 24,
        "context": "3. **LED- & Display-Controller**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern. (Erfüllt: FA5)"
      }
    ],
    "FA6": [
      {
        "file": "app/app/(tabs)/index.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, FA4, FA5, FA6"
      },
      {
        "file": "app/components/LiveChart.tsx",
        "line": 2,
        "context": "* @implements FA6"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 222,
        "context": "\\item \\textbf{FA6:} Das System muss die empfangenen Bewegungen in Echtzeit visualisieren. (aus UC-2)"
      },
      {
        "file": "app/architecture.md",
        "line": 25,
        "context": "3. **LiveChart**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA6)"
      }
    ],
    "FA7": [
      {
        "file": "app/app/(tabs)/history.tsx",
        "line": 2,
        "context": "* @implements FA7"
      },
      {
        "file": "app/components/SessionCard.tsx",
        "line": 2,
        "context": "* @implements FA7"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 223,
        "context": "\\item \\textbf{FA7:} Das System muss historische Bewegungsdaten grafisch anzeigen k\\\"onnen. (aus UC-3)"
      },
      {
        "file": "app/architecture.md",
        "line": 26,
        "context": "4. **SessionCard**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA7)"
      }
    ],
    "NF1": [
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 229,
        "context": "\\item \\textbf{NF1 -- Latenz:} Die E2E-Latenz vom Sensor bis zur Darstellung muss $\\leq$ \\textbf{100\\,ms} sein."
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 495,
        "context": "%    \\item \\textbf{Latenzauswertung:} Vergleich gemessene Latenz vs. Anforderung NF1 ($< 100$\\,ms)"
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
      }
    ],
    "NF2": [
      {
        "file": "app/hooks/useBLE.ts",
        "line": 2,
        "context": "* @implements FA3, FA5, NF2"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 230,
        "context": "\\item \\textbf{NF2 -- Zuverl\\\"assigkeit:} Bei einem Verbindungsabbruch muss die App den Nutzer benachrichtigen und automatisch Reconnect-Versuche starten."
      },
      {
        "file": "app/architecture.md",
        "line": 27,
        "context": "5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)"
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 54,
        "context": "// @implements FA2, FA3, NF2"
      }
    ],
    "NF3": [
      {
        "file": "app/components/SensorCard.tsx",
        "line": 2,
        "context": "* @implements FA2, FA3, NF3"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 231,
        "context": "\\item \\textbf{NF3 -- Usability:} Das Pairing darf maximal zwei Nutzerinteraktionen erfordern."
      },
      {
        "file": "app/architecture.md",
        "line": 24,
        "context": "2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)"
      }
    ],
    "R1": [
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 237,
        "context": "\\item \\textbf{R1:} Die Applikationen muss auf android devices laufen."
      },
      {
        "file": "doc/AI_DOCUMENTATION_GUIDE.md",
        "line": 18,
        "context": "* **`R-X`**: Randbedingungen (z. B. `R1`)"
      }
    ],
    "UC-2": [
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 192,
        "context": "\\textbf{UC-2: Echtzeit-Training überwachen} \\vspace{.25cm} \\newline"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 217,
        "context": "\\item \\textbf{FA1:} Das System muss einen Reiter oder eine Navigationsm\\\"oglichkeit f\\\"ur Hardwareger\\\"ate / Trainings / vergangene Trainingseinheiten anzeigen. (aus UC-1, UC-2, UC-3)"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 220,
        "context": "\\item \\textbf{FA4:} Das System muss eine Detailansicht f\\\"ur ein ausgew\\\"ahltes Training anzeigen. (aus UC-2)"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 221,
        "context": "\\item \\textbf{FA5:} Das System muss Bewegungsdatenstr\\\"ome empfangen und verarbeiten k\\\"onnen. (aus UC-2)"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 222,
        "context": "\\item \\textbf{FA6:} Das System muss die empfangenen Bewegungen in Echtzeit visualisieren. (aus UC-2)"
      },
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
      }
    ],
    "UC-3": [
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 205,
        "context": "\\textbf{UC-3: Trainingsdaten einsehen} \\vspace{.25cm} \\newline"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 217,
        "context": "\\item \\textbf{FA1:} Das System muss einen Reiter oder eine Navigationsm\\\"oglichkeit f\\\"ur Hardwareger\\\"ate / Trainings / vergangene Trainingseinheiten anzeigen. (aus UC-1, UC-2, UC-3)"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 223,
        "context": "\\item \\textbf{FA7:} Das System muss historische Bewegungsdaten grafisch anzeigen k\\\"onnen. (aus UC-3)"
      },
      {
        "file": "doc/Pflichtenheft/pflichtenheft.tex",
        "line": 305,
        "context": "%    \\item \\textbf{Datenbank-Container (AP\\,3):} Kapselt die Datenhaltung. Speichert Nutzerprofile sowie die f\\\"ur UC-3 ben\\\"otigten historischen Trainingsdaten persistent."
      },
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
    "embedded/architecture.md": "# MoveLink Embedded Firmware - Container-Architektur\n\nDieses Dokument beschreibt die Embedded Sensor-Firmware als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Binär-Firmware (flashed via USB/Serial)\n* **Technologie-Stack:** Arduino C/C++, LSM6DS3 IMU Library, Edge Impulse SDK, Bluetooth Low Energy\n\n## Beschreibung\nDie Sensor-Firmware läuft auf dem XIAO nRF52840 Sense Controller. Sie erfasst Beschleunigungs- und Rotationsdaten über den integrierten LSM6DS3-Sensor mit einer festen Abtastrate (50Hz), wendet Signalfilterungen zur Rauschunterdrückung an und streamt die Datenpakete als binäres Array via BLE Characteristics an die Mobile App. Alternativ führt sie Edge-Impulse-Inferenzmodelle direkt auf dem Mikrocontroller aus, um Trainingsübungen (z.B. Bizeps-Curls) lokal zu klassifizieren und Fehler über die integrierten RGB-LEDs anzuzeigen.\n\n```mermaid\nflowchart TD\n    Sensor[MPU6050/LSM6DS3 IMU Sensor] -->|I2C Rohdaten| Firmware[XIAO nRF52840 Arduino Firmware]\n    Firmware -->|Inferenz / Signalfilterung| BLE[BLE Characteristic]\n    BLE -->|Paket-Stream| App[React Native Mobile App]\n```\n\n## Komponenten in diesem Container\n1. **Sensordatenerfassung (Loop)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5)\n2. **Inferenz-Engine (Edge Impulse)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5)\n3. **LED- & Display-Controller**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern. (Erfüllt: FA5)\n",
    "app/components/SessionCard.tsx": "/**\n * @implements FA7\n */\nimport React from 'react';\nimport { View, Text, TouchableOpacity, StyleSheet } from 'react-native';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { Colors } from '@/constants/Colors';\nimport { TrainingSession } from '@/store';\n\ninterface Props {\n  session: TrainingSession;\n  onPress: () => void;\n  index?: number;\n}\n\nfunction formatDuration(s: number) {\n  const m = Math.floor(s / 60);\n  const sec = s % 60;\n  return `${m}:${sec.toString().padStart(2, '0')}`;\n}\n\nfunction formatDate(iso: string) {\n  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });\n}\n\nfunction formatTime(iso: string) {\n  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });\n}\n\nexport function SessionCard({ session, onPress, index = 0 }: Props) {\n  return (\n    <FadeSlide delay={index * 60}>\n      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>\n        <View style={styles.accent} />\n        <View style={styles.body}>\n          <View style={styles.dateRow}>\n            <Text style={styles.date}>{formatDate(session.startedAt)}</Text>\n            <Text style={styles.time}>{formatTime(session.startedAt)}</Text>\n          </View>\n          <View style={styles.statsRow}>\n            <View style={styles.stat}>\n              <Text style={styles.statValue}>{formatDuration(session.durationSeconds)}</Text>\n              <Text style={styles.statLabel}>Dauer</Text>\n            </View>\n            <View style={styles.divider} />\n            <View style={styles.stat}>\n              <Text style={styles.statValue}>{session.readingCount.toLocaleString()}</Text>\n              <Text style={styles.statLabel}>Messwerte</Text>\n            </View>\n          </View>\n        </View>\n        <Text style={styles.arrow}>›</Text>\n      </TouchableOpacity>\n    </FadeSlide>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    backgroundColor: Colors.surface,\n    borderRadius: 16,\n    borderWidth: 1,\n    borderColor: Colors.border,\n    overflow: 'hidden',\n    gap: 14,\n    paddingRight: 16,\n    paddingVertical: 14,\n  },\n  accent: {\n    width: 3,\n    alignSelf: 'stretch',\n    backgroundColor: Colors.primary,\n    borderTopRightRadius: 2,\n    borderBottomRightRadius: 2,\n  },\n  body: { flex: 1, gap: 8 },\n  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },\n  date: { color: Colors.text, fontSize: 14, fontWeight: '700' },\n  time: { color: Colors.textSub, fontSize: 12 },\n  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },\n  stat: { gap: 1 },\n  statValue: { color: Colors.primary, fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },\n  statLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },\n  divider: { width: 1, height: 28, backgroundColor: Colors.border },\n  arrow: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },\n});\n",
    "doc/AI_DOCUMENTATION_GUIDE.md": "# Leitfaden für KI-Dokumentation & Traceability (MoveLink)\n\nDieses Repository verwendet ein automatisiertes, integriertes Dokumentations- und Traceability-System. Es scannt Markdown-Dokumente und Quellcode-Dateien, um eine interaktive Weboberfläche (HTML Dashboard) sowie einen kompilierten PDF-Bericht zu generieren.\n\nDamit zukünftige KIs und Entwickler neue Anforderungen, Use Cases und Architekturentwicklungen richtig dokumentieren, müssen die folgenden Standards eingehalten werden.\n\n---\n\n## 1. Definition von Anforderungen & Use Cases (.md-Dateien)\n\nAlle Systemdefinitionen werden in Markdown-Dateien im Ordner `doc/` gepflegt (z. B. `doc/Requirements.md` und `doc/UseCases.md`). \n\n### ID-Format & Konventionen\nJeder Eintrag muss eine eindeutige ID besitzen:\n* **`UC-X`**: Use Cases (z. B. `UC-1`)\n* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)\n* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)\n* **`R-X`**: Randbedingungen (z. B. `R1`)\n\n### Format der Deklaration in Markdown\nDamit der Scraper (`scrape_docs.py`) die Einträge korrekt parsen kann, müssen sie in einer Zeile deklariert werden, gefolgt von einer Beschreibung:\n\n```markdown\n**UC-1: Live-Ansicht der Übungen**\nDies ist die Beschreibung des Use Cases. Hier steht detaillierter Text, der auch über mehrere Zeilen gehen kann.\n\n**FA2: Bluetooth LE Signalstärke**\nDas System muss die BLE-Signalstärke des Sensors in Echtzeit ausgeben.\n```\n\n### Verknüpfung zwischen Anforderungen und Use Cases (Traceability)\nUm Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):\n\n```markdown\n**FA3: BLE Verbindungsaufbau (UC-1)**\nDas System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen.\n```\n\n---\n\n## 2. Implementierungs-Referenzen im Quellcode (@implements)\n\nUm nachzuweisen, dass eine Anforderung tatsächlich im Code implementiert wurde, müssen Entwickler und KIs direkt in den Quellcodedateien (`.ts`, `.tsx`, `.ino`, `.cpp`, `.h`) `@implements`-Annotationen in Kommentaren hinzufügen.\n\n### Syntax\n```\n@implements ID1, ID2, ...\n```\n\n### Code-Beispiele\n\n**In TypeScript / TSX Dateien (`app/`):**\n```tsx\n// @implements FA2, FA3, NF2\nexport function SensorCard() {\n    // UI Code...\n}\n```\n\n**In Arduino / C++ Dateien (`embedded/`):**\n```cpp\n/*\n * @implements FA5, NF1\n * Liest Sensorwerte mit 50Hz aus und wendet einen Tiefpassfilter an.\n */\nvoid loop() {\n    // Sensorsignal...\n}\n```\n\n---\n\n## 3. C4-Architektur-Modellierung (Metadaten-Blöcke)\n\nJedes Architektur-Dokument in Markdown muss Informationen über die zugehörige C4-Ebene und die Deployability enthalten.\n\n### Metadaten-Header in Markdown\nFügen Sie ganz oben in der entsprechenden Architektur-Markdown-Datei (z. B. `app/architecture.md`) einen HTML-Kommentarblock mit folgenden Keys hinzu:\n\n```markdown\n<!--\nC4-Ebene: Container\nDeployable: Ja\n-->\n```\n\n**Erlaubte Werte:**\n* **C4-Ebene**: `System-Context`, `Container`, `Component`\n* **Deployable**: `Ja` / `Nein` (oder `Yes` / `No`)\n\n### Registrierung im C4 Model Explorer\nWenn ein neuer Container oder eine neue Komponente hinzugefügt wird, muss diese auch in der `C4_DATA`-Struktur am Ende von `docs_site/app.js` registriert werden:\n1. Tragen Sie das Element unter `containers.elements` oder `components.[container_id].elements` ein.\n2. Definieren Sie dessen Verbindungen (Connectoren) im zugehörigen `connections`-Array.\n3. Ergänzen Sie die Dateizuordnung in der Funktion `getC4ElementForFile` in `docs_site/app.js`, damit die E2E-Flussdiagramme die Datei dem neuen C4-Element zuweisen.\n\n---\n\n## 4. Build-Prozess & Pipeline\n\nNach jeder Änderung an der Dokumentation oder den `@implements`-Kommentaren im Quellcode müssen die Kompilierungsskripte ausgeführt werden:\n\n### Lokaler Build-Befehl\n1. **Scraper ausführen** (erstellt `docs_site/data.js`):\n   ```bash\n   python scrape_docs.py\n   ```\n2. **PDF Bericht generieren** (erstellt `docs_site/documentation_report.pdf`):\n   ```bash\n   python generate_pdf.py\n   ```\n\n### CI/CD Pipeline (GitHub Actions)\nBei jedem Push auf den `main`-Branch baut die Pipeline `.github/workflows/docs.yml` die Webseite und das PDF automatisch. Wenn Sie einen Commit pushen, der bereits kompilierte Änderungen enthält, nutzen Sie `[skip ci]` im Commit-Betreff, um endlose Build-Loops zu verhindern.\n",
    "doc/Requirements.md": "# Systemanforderungen (Requirements)\n\nDieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.\n\n---\n\n## Funktionale Anforderungen\n\n**FA1**: Dashboard und Navigation\nDas System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*\n\n**FA2**: Geräte-Scanning\nDas System muss eine Liste verfügbarer Bluetooth-Hardwaregeräte anzeigen und den aktuellen Verbindungsstatus visualisieren. *(Bezug: UC-1)*\n\n**FA3**: Verbindungsaufbau\nDas System muss in der Lage sein, eine stabile Bluetooth-Verbindung mit dem IMU-Sensor herzustellen. *(Bezug: UC-1)*\n\n**FA4**: Trainings-Detailansicht\nDas System muss eine detaillierte Ansicht für ein ausgewähltes Training anzeigen. *(Bezug: UC-2)*\n\n**FA5**: Datenstrom-Verarbeitung\nDas System muss kontinuierliche Bewegungsdatenströme vom Sensor empfangen, filtern und verarbeiten können. *(Bezug: UC-2)*\n\n**FA6**: Echtzeit-Visualisierung\nDas System muss die empfangenen Sensordaten und Bewegungen in Echtzeit visualisieren. *(Bezug: UC-2)*\n\n**FA7**: Historische Analyse\nDas System muss historische Bewegungsdaten grafisch und statistisch anzeigen können. *(Bezug: UC-3)*\n\n---\n\n## Nicht-funktionale Anforderungen (Muss-Kriterien)\n\n**NF1**: Latenz\nDie End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.\n\n**NF2**: Zuverlässigkeit und Reconnect\nBei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.\n\n**NF3**: Benutzbarkeit (Usability)\nDas Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.\n\n---\n\n## Randbedingungen\n\n**R1**: Plattform-Kompatibilität\nDie mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.\n",
    "embedded/src/Training_Skript/Training_Skript.ino": "// XIAO BLE Sense LSM6DS3 - 6 Achsen (Accel + Gyro) Raw Data \n// @implements FA5\n\n#include \"LSM6DS3.h\"\n#include \"Wire.h\"\n\n// Instanz der LSM6DS3 Klasse erstellen\nLSM6DS3 myIMU(I2C_MODE, 0x6A); \n\n#define CONVERT_G_TO_MS2 9.80665f\n#define FREQUENCY_HZ 50\n#define INTERVAL_MS (1000 / (FREQUENCY_HZ + 1))\n\nstatic unsigned long last_interval_ms = 0;\n\nvoid setup() {\n  Serial.begin(115200);\n  while (!Serial);\n\n  if (myIMU.begin() != 0) {\n    Serial.println(\"Device error\");\n  } else {\n    Serial.println(\"Device OK!\");\n  }\n}\n\nvoid loop() {\n  if (millis() > last_interval_ms + INTERVAL_MS) {\n    last_interval_ms = millis();\n\n    // 1. Beschleunigung (m/s^2)\n    Serial.print(myIMU.readFloatAccelX() * CONVERT_G_TO_MS2, 4);\n    Serial.print('\\t');\n    Serial.print(myIMU.readFloatAccelY() * CONVERT_G_TO_MS2, 4);\n    Serial.print('\\t');\n    Serial.print(myIMU.readFloatAccelZ() * CONVERT_G_TO_MS2, 4);\n    Serial.print('\\t');\n\n    // 2. Gyroskop (Grad pro Sekunde - dps)\n    Serial.print(myIMU.readFloatGyroX(), 4);\n    Serial.print('\\t');\n    Serial.print(myIMU.readFloatGyroY(), 4);\n    Serial.print('\\t');\n    Serial.println(myIMU.readFloatGyroZ(), 4); // println am Ende für den Zeilenumbruch\n  }\n}",
    "app/store/index.ts": "/**\n * @implements FA5\n */\nimport { create } from 'zustand';\n\nexport type ConnectionStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';\n\nexport interface IMUReading {\n  timestamp: number;\n  accelX: number;\n  accelY: number;\n  accelZ: number;\n  gyroX: number;\n  gyroY: number;\n  gyroZ: number;\n}\n\nexport interface TrainingSession {\n  id: string;\n  startedAt: string;\n  endedAt: string | null;\n  durationSeconds: number;\n  readingCount: number;\n}\n\n// Max data points kept in-memory for the live chart (rolling buffer)\nconst LIVE_BUFFER_SIZE = 100;\n\ninterface BLEStore {\n  status: ConnectionStatus;\n  deviceId: string | null;\n  deviceName: string | null;\n  latestReading: IMUReading | null;\n  setStatus: (status: ConnectionStatus) => void;\n  setDevice: (id: string, name: string) => void;\n  setReading: (reading: IMUReading) => void;\n  disconnect: () => void;\n}\n\ninterface TrainingStore {\n  isRecording: boolean;\n  sessionId: string | null;\n  liveBuffer: IMUReading[];\n  sessions: TrainingSession[];\n  startSession: () => void;\n  stopSession: () => void;\n  addReading: (reading: IMUReading) => void;\n  setSessions: (sessions: TrainingSession[]) => void;\n}\n\nexport const useBLEStore = create<BLEStore>((set) => ({\n  status: 'idle',\n  deviceId: null,\n  deviceName: null,\n  latestReading: null,\n  setStatus: (status) => set({ status }),\n  setDevice: (deviceId, deviceName) => set({ deviceId, deviceName }),\n  setReading: (reading) => set({ latestReading: reading }),\n  disconnect: () => set({ status: 'disconnected', deviceId: null, deviceName: null, latestReading: null }),\n}));\n\nexport const useTrainingStore = create<TrainingStore>((set) => ({\n  isRecording: false,\n  sessionId: null,\n  liveBuffer: [],\n  sessions: [],\n  startSession: () =>\n    set({ isRecording: true, sessionId: Date.now().toString(), liveBuffer: [] }),\n  stopSession: () =>\n    set({ isRecording: false, sessionId: null }),\n  addReading: (reading) =>\n    set((state) => ({\n      liveBuffer:\n        state.liveBuffer.length >= LIVE_BUFFER_SIZE\n          ? [...state.liveBuffer.slice(1), reading]\n          : [...state.liveBuffer, reading],\n    })),\n  setSessions: (sessions) => set({ sessions }),\n}));\n",
    "embedded/src/Executable.ino": "/* \n * @implements FA5\n * Includes ---------------------------------------------------------------- */\n#include <Erlind-project-1_inferencing.h> // Deine exportierte Edge Impulse Bibliothek\n#include <LSM6DS3.h>\n#include <U8g2lib.h>\n#include <U8X8lib.h>\n#include <Wire.h>\n\n/* Constant defines -------------------------------------------------------- */\n#define CONVERT_G_TO_MS2    9.80665f\n#define MAX_ACCEPTED_RANGE  2.0f \n\nU8X8_SSD1306_64X48_ER_HW_I2C u8x8(/* reset=*/ U8X8_PIN_NONE); \n\n/* Private variables ------------------------------------------------------- */\nstatic bool debug_nn = false;\nLSM6DS3 myIMU(I2C_MODE, 0x6A);\n\n// RGB LED Pins des XIAO nRF52840 (Achtung: Die LEDs sind Low-Active, LOW = An, HIGH = Aus)\nconst int RED_ledPin =  11;\nconst int BLUE_ledPin =  12;\nconst int GREEN_ledPin =  13; \n\nvoid setup()\n{\n    Serial.begin(115200);\n    u8x8.begin();\n    \n    // LEDs initial ausschalten\n    pinMode(RED_ledPin, OUTPUT);\n    pinMode(BLUE_ledPin, OUTPUT);\n    pinMode(GREEN_ledPin, OUTPUT);\n    digitalWrite(RED_ledPin, HIGH);\n    digitalWrite(BLUE_ledPin, HIGH);\n    digitalWrite(GREEN_ledPin, HIGH);\n\n    // Warte kurz, damit der Serielle Monitor bereit ist\n    delay(1000);\n\n    if (!myIMU.begin()) {\n        ei_printf(\"Failed to initialize IMU!\\r\\n\");\n    } else {\n        ei_printf(\"IMU initialized\\r\\n\");\n    }\n\n    // SICHERHEITSCHECK: Prüfen ob das Modell wirklich für 6 Achsen trainiert wurde\n    if (EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME != 6) {\n        ei_printf(\"ERR: EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME sollte 6 sein (Accel + Gyro)!\\n\");\n        ei_printf(\"Aktuell erwartet das Modell: %d Achsen.\\n\", EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME);\n        return;\n    }\n}\n\nfloat ei_get_sign(float number) {\n    return (number >= 0.0) ? 1.0 : -1.0;\n}\n\nvoid loop()\n{\n    // Wir verzichten auf das delay(2000) im Loop, um flüssiger zu samplen.\n    // Stattdessen füllen wir den Puffer kontinuierlich in der vorgegebenen Frequenz.\n    \n    float buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = { 0 };\n\n    // Da wir 6 Achsen haben, springen wir in 6er-Schritten durch den DSP Puffer\n    for (size_t ix = 0; ix < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE; ix += 6) {\n        uint64_t next_tick = micros() + (EI_CLASSIFIER_INTERVAL_MS * 1000);\n\n        // 1. Beschleunigung einlesen\n        buffer[ix + 0] = myIMU.readFloatAccelX();\n        buffer[ix + 1] = myIMU.readFloatAccelY();\n        buffer[ix + 2] = myIMU.readFloatAccelZ();\n\n        // 2. Gyroskop einlesen\n        buffer[ix + 3] = myIMU.readFloatGyroX();\n        buffer[ix + 4] = myIMU.readFloatGyroY();\n        buffer[ix + 5] = myIMU.readFloatGyroZ();\n\n        // Clamping & Umrechnung nur für die Beschleunigungs-Achsen (Index 0 bis 2)\n        for (int i = 0; i < 3; i++) {\n            if (fabs(buffer[ix + i]) > MAX_ACCEPTED_RANGE) {\n                buffer[ix + i] = ei_get_sign(buffer[ix + i]) * MAX_ACCEPTED_RANGE;\n            }\n            buffer[ix + i] *= CONVERT_G_TO_MS2;\n        }\n\n        // Das Gyroskop (Index 3 bis 5) belassen wir in Grad/Sekunde (dps), \n        // da Edge Impulse direkt damit arbeitet.\n\n        delayMicroseconds(next_tick - micros());\n    }\n\n    // Signal aus Puffer erstellen\n    signal_t signal;\n    int err = numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);\n    if (err != 0) {\n        return;\n    }\n\n    // Klassifikator ausführen\n    ei_impulse_result_t result = { 0 };\n    err = run_classifier(&signal, &result, debug_nn);\n    if (err != EI_IMPULSE_OK) {\n        return;\n    }\n\n    // --- AUSWERTUNG & JSON OUTPUT FÜR DEN PC ---\n    \n    // Variablen für den besten Treffer\n    int best_idx = 0;\n    float best_val = 0.0;\n    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {\n        if (result.classification[ix].value > best_val) {\n            best_val = result.classification[ix].value;\n            best_idx = ix;\n        }\n    }\n\n    // Anomalie-Score abgreifen (falls der K-means Block aktiv ist)\n    float anomaly_score = 0.0;\n#if EI_CLASSIFIER_HAS_ANOMALY == 1\n    anomaly_score = result.anomaly;\n#endif\n\n    // Label-Name des besten Treffers\n    String best_label = String(result.classification[best_idx].label);\n\n    // Display-Aktualisierung & LED Logik (angepasst auf deine Curl-Klassen)\n    // ACHTUNG: Passe die String-Vergleiche an deine exakten Edge-Impulse Labelnamen an!\n    \n    u8x8.clear();\n    u8x8.setFont(u8x8_font_amstrad_cpc_extended_r);\n\n    if (best_label == \"idle\" || best_val < 0.6) {\n        // Ruhemodus -> LED Blau, kein JSON senden um PC-Spam zu vermeiden\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, LOW); \n        digitalWrite(GREEN_ledPin, HIGH);\n        u8x8.drawString(0, 2, \"Status:\");\n        u8x8.drawString(0, 4, \"IDLE\");\n    } \n    else if (best_label == \"curl_sauber\") {\n        // Sauberer Curl -> LED Grün\n        digitalWrite(RED_ledPin, HIGH);\n        digitalWrite(BLUE_ledPin, HIGH);\n        digitalWrite(GREEN_ledPin, LOW);\n        u8x8.drawString(0, 2, \"Curl:\");\n        u8x8.drawString(0, 4, \"PERFEKT\");\n        \n        send_json_to_pc(best_label, best_val, anomaly_score, \"Super Ausfuehrung!\");\n        delay(1500); // Cooldown um Doppel-Erkennung des gleichen Curls zu verhindern\n    }\n    else {\n        // Irgendein Fehler erkannt (z.B. \"fehler_rotation\" oder \"fehler_ellbogen\") -> LED Rot\n        digitalWrite(RED_ledPin, LOW);\n        digitalWrite(BLUE_ledPin, HIGH);\n        digitalWrite(GREEN_ledPin, HIGH);\n        u8x8.drawString(0, 2, \"Achtung:\");\n        u8x8.drawString(0, 4, \"FEHLER\");\n\n        // Dynamischer Tipp je nach Fehlerklasse\n        String tipp = \"Bewegung korrigieren\";\n        if (best_label.indexOf(\"rotation\") >= 0) tipp = \"Handgelenk stabil halten!\";\n        if (best_label.indexOf(\"ellbogen\") >= 0) tipp = \"Ellbogen fixieren!\";\n\n        send_json_to_pc(best_label, best_val, anomaly_score, tipp);\n        delay(1500); // Cooldown\n    }\n\n    u8x8.refreshDisplay();\n}\n\n/**\n * @brief Hilfsfunktion um sauberes JSON an das PC-Dashboard zu senden\n */\nvoid send_json_to_pc(String label, float confidence, float anomaly, String tipp) {\n    Serial.print(\"{\\\"event\\\": \\\"inferenz_ergebnis\\\", \");\n    Serial.print(\"\\\"klasse\\\": \\\"\" + label + \"\\\", \");\n    Serial.print(\"\\\"wahrscheinlichkeit\\\": \" + String(confidence, 3) + \", \");\n    Serial.print(\"\\\"anomalie_score\\\": \" + String(anomaly, 3) + \", \");\n    Serial.println(\"\\\"tipp\\\": \\\"\" + tipp + \"\\\"}\");\n}",
    "app/architecture.md": "# MoveLink Mobile App - Container-Architektur\n\nDieses Dokument beschreibt die Mobile App als eigenständige, deploybare Einheit im C4-Modell.\n\n## C4-Architektur-Ebene\n* **C4-Ebene:** Container\n* **Deployable:** Ja\n* **Deployment-Artefakt:** Android Package (.apk) / iOS IPA\n* **Technologie-Stack:** React Native, Expo, TypeScript, Zustand, BLE PLX\n\n## Beschreibung\nDie MoveLink Mobile App ist die primäre Benutzerschnittstelle des Systems. Sie läuft auf Android- und iOS-Endgeräten und verbindet sich über Bluetooth Low Energy (BLE) mit dem embedded Sensor-Gerät, um Bewegungsdaten in Echtzeit zu erfassen, zu visualisieren und zur persistenten Speicherung an das Backend zu übertragen.\n\n```mermaid\nflowchart TD\n    User[Trainierender] -->|Interagiert mit| App[React Native App Container]\n    App -->|BLE Bluetooth| Sensor[Sensor Firmware Container]\n    App -->|REST/WebSockets| Backend[Backend API Container]\n```\n\n## Komponenten in diesem Container\nDie App enthält mehrere Komponenten (C4-Komponenten-Ebene):\n1. **SideNav**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1)\n2. **SensorCard**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA2, FA3, NF3)\n3. **LiveChart**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA6)\n4. **SessionCard**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA7)\n5. **BLE-Hook (useBLE)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA3, FA5, NF2)\n",
    "app/hooks/useBLE.ts": "/**\n * @implements FA3, FA5, NF2\n */\nimport { useEffect, useRef, useCallback } from 'react';\nimport { Platform } from 'react-native';\nimport {\n  BleManager,\n  Device,\n  BleError,\n  Characteristic,\n  State,\n} from 'react-native-ble-plx';\nimport { BLE_SERVICE_UUID, BLE_IMU_CHARACTERISTIC_UUID, BLE_RECONNECT_DELAY_MS, BLE_MAX_RECONNECT_ATTEMPTS } from '@/constants/BLE';\nimport { useBLEStore, useTrainingStore, IMUReading } from '@/store';\n\nfunction parseIMUPacket(base64: string): IMUReading | null {\n  try {\n    const binary = atob(base64);\n    const buffer = new ArrayBuffer(binary.length);\n    const view = new Uint8Array(buffer);\n    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);\n    const floats = new Float32Array(buffer);\n    if (floats.length < 6) return null;\n    return {\n      timestamp: Date.now(),\n      accelX: floats[0],\n      accelY: floats[1],\n      accelZ: floats[2],\n      gyroX: floats[3],\n      gyroY: floats[4],\n      gyroZ: floats[5],\n    };\n  } catch {\n    return null;\n  }\n}\n\nexport function useBLE() {\n  const manager = useRef<BleManager | null>(null);\n  const reconnectAttempts = useRef(0);\n  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n\n  const { setStatus, setDevice, setReading, disconnect, status } = useBLEStore();\n  const { addReading, isRecording } = useTrainingStore();\n\n  useEffect(() => {\n    // BLE is not available on web\n    if (Platform.OS === 'web') return;\n\n    manager.current = new BleManager();\n\n    const subscription = manager.current.onStateChange((state) => {\n      if (state === State.PoweredOn) subscription.remove();\n    }, true);\n\n    return () => {\n      subscription.remove();\n      manager.current?.destroy();\n    };\n  }, []);\n\n  const handleDisconnect = useCallback((deviceId: string) => {\n    setStatus('disconnected');\n    if (reconnectAttempts.current >= BLE_MAX_RECONNECT_ATTEMPTS) {\n      setStatus('error');\n      return;\n    }\n    reconnectTimer.current = setTimeout(() => {\n      reconnectAttempts.current += 1;\n      connectToDevice(deviceId);\n    }, BLE_RECONNECT_DELAY_MS);\n  }, []);\n\n  const connectToDevice = useCallback(async (deviceId: string) => {\n    if (!manager.current) return;\n    try {\n      setStatus('connecting');\n      const device = await manager.current.connectToDevice(deviceId);\n      await device.discoverAllServicesAndCharacteristics();\n\n      setDevice(device.id, device.name ?? 'MoveLink Sensor');\n      setStatus('connected');\n      reconnectAttempts.current = 0;\n\n      device.onDisconnected(() => handleDisconnect(device.id));\n\n      device.monitorCharacteristicForService(\n        BLE_SERVICE_UUID,\n        BLE_IMU_CHARACTERISTIC_UUID,\n        (error: BleError | null, characteristic: Characteristic | null) => {\n          if (error || !characteristic?.value) return;\n          const reading = parseIMUPacket(characteristic.value);\n          if (!reading) return;\n          setReading(reading);\n          if (isRecording) addReading(reading);\n        }\n      );\n    } catch {\n      setStatus('error');\n    }\n  }, [isRecording, handleDisconnect]);\n\n  const startScan = useCallback(() => {\n    if (!manager.current || Platform.OS === 'web') return;\n    setStatus('scanning');\n\n    manager.current.startDeviceScan(\n      [BLE_SERVICE_UUID],\n      null,\n      (error: BleError | null, device: Device | null) => {\n        if (error) { setStatus('error'); return; }\n        if (!device) return;\n\n        manager.current?.stopDeviceScan();\n        connectToDevice(device.id);\n      }\n    );\n  }, [connectToDevice]);\n\n  const stopScan = useCallback(() => {\n    manager.current?.stopDeviceScan();\n    if (status === 'scanning') setStatus('idle');\n  }, [status]);\n\n  const disconnectDevice = useCallback(async () => {\n    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    const { deviceId } = useBLEStore.getState();\n    if (deviceId) await manager.current?.cancelDeviceConnection(deviceId);\n    disconnect();\n  }, []);\n\n  return { startScan, stopScan, disconnectDevice };\n}\n",
    "app/app/(tabs)/_layout.tsx": "/**\n * @implements FA1\n */\nimport React from 'react';\nimport { View } from 'react-native';\nimport { Tabs } from 'expo-router';\nimport { Colors } from '@/constants/Colors';\nimport { AuroraBackground } from '@/components/AuroraBackground';\nimport { SideNav } from '@/components/SideNav';\n\nexport default function TabLayout() {\n  return (\n    <View style={{ flex: 1, backgroundColor: Colors.bg }}>\n      <AuroraBackground />\n      <Tabs\n        screenOptions={{\n          headerShown: false,\n          tabBarStyle: { display: 'none' },\n          contentStyle: { backgroundColor: 'transparent' },\n        }}\n      >\n        <Tabs.Screen name=\"index\" />\n        <Tabs.Screen name=\"history\" />\n        <Tabs.Screen name=\"settings\" />\n      </Tabs>\n      <SideNav />\n    </View>\n  );\n}\n",
    "app/hooks/useWebSocket.ts": "/**\n * @implements FA5\n */\nimport { useEffect, useRef, useCallback } from 'react';\nimport { useBLEStore, useTrainingStore } from '@/store';\n\n// Backend WebSocket URL — served by AP2 (Luca Schöneberg) via Docker\nconst WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? 'ws://localhost:3000/ws';\nconst RECONNECT_DELAY_MS = 3000;\n\nexport function useWebSocket() {\n  const ws = useRef<WebSocket | null>(null);\n  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const shouldReconnect = useRef(true);\n\n  const latestReading = useBLEStore((s) => s.latestReading);\n  const { isRecording, sessionId } = useTrainingStore();\n\n  const connect = useCallback(() => {\n    if (ws.current?.readyState === WebSocket.OPEN) return;\n    ws.current = new WebSocket(WS_URL);\n\n    ws.current.onopen = () => {\n      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    };\n\n    ws.current.onclose = () => {\n      if (!shouldReconnect.current) return;\n      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);\n    };\n\n    ws.current.onerror = () => {\n      ws.current?.close();\n    };\n  }, []);\n\n  const disconnect = useCallback(() => {\n    shouldReconnect.current = false;\n    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);\n    ws.current?.close();\n  }, []);\n\n  // Forward every new BLE reading to the backend while a session is active\n  useEffect(() => {\n    if (!isRecording || !latestReading || ws.current?.readyState !== WebSocket.OPEN) return;\n    ws.current.send(JSON.stringify({ sessionId, reading: latestReading }));\n  }, [latestReading, isRecording, sessionId]);\n\n  useEffect(() => {\n    shouldReconnect.current = true;\n    connect();\n    return () => { disconnect(); };\n  }, []);\n\n  return { connect, disconnect };\n}\n",
    "app/app/(tabs)/index.tsx": "/**\n * @implements FA2, FA3, FA4, FA5, FA6\n */\nimport React from 'react';\nimport { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';\nimport Animated, {\n  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,\n} from 'react-native-reanimated';\nimport { LinearGradient } from 'expo-linear-gradient';\nimport { Colors } from '@/constants/Colors';\nimport { useBLEStore, useTrainingStore } from '@/store';\nimport { useBLE } from '@/hooks/useBLE';\nimport { useWebSocket } from '@/hooks/useWebSocket';\nimport { SensorCard } from '@/components/SensorCard';\nimport { LiveChart } from '@/components/LiveChart';\nimport { AnimatedValue } from '@/components/AnimatedValue';\nimport { GradientButton } from '@/components/GradientButton';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { AnimatedLogo } from '@/components/AnimatedLogo';\n\nfunction RecBadge() {\n  const opacity = useSharedValue(1);\n  React.useEffect(() => {\n    opacity.value = withRepeat(\n      withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),\n      -1\n    );\n  }, []);\n  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));\n\n  return (\n    <View style={styles.recBadge}>\n      <Animated.View style={[styles.recDot, dotStyle]} />\n      <Text style={styles.recLabel}>REC</Text>\n    </View>\n  );\n}\n\nexport default function TrainingScreen() {\n  const { status, deviceName, latestReading } = useBLEStore();\n  const { isRecording, liveBuffer, startSession, stopSession } = useTrainingStore();\n  const { startScan, disconnectDevice } = useBLE();\n  useWebSocket();\n\n  const isConnected = status === 'connected';\n\n  return (\n    <SafeAreaView style={styles.safe}>\n      <StatusBar barStyle=\"light-content\" backgroundColor={Colors.bg} />\n      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>\n\n        {/* Header */}\n        <FadeSlide delay={50}>\n          <View style={styles.headerRow}>\n            <AnimatedLogo />\n            {isRecording && <RecBadge />}\n          </View>\n          <Text style={styles.pageTitle}>Training</Text>\n        </FadeSlide>\n\n        {/* Sensor */}\n        <FadeSlide delay={100}>\n          <SensorCard status={status} deviceName={deviceName} onScan={startScan} onDisconnect={disconnectDevice} />\n        </FadeSlide>\n\n        {/* Live readings */}\n        {isConnected && latestReading && (\n          <FadeSlide delay={140}>\n            <View style={styles.readingsBlock}>\n              <Text style={styles.sectionLabel}>Accelerometer · m/s²</Text>\n              <View style={styles.grid}>\n                <AnimatedValue label=\"X\" value={latestReading.accelX} unit=\"m/s²\" color={Colors.accentX} />\n                <AnimatedValue label=\"Y\" value={latestReading.accelY} unit=\"m/s²\" color={Colors.accentY} />\n                <AnimatedValue label=\"Z\" value={latestReading.accelZ} unit=\"m/s²\" color={Colors.accentZ} />\n              </View>\n              <Text style={styles.sectionLabel}>Gyroskop · rad/s</Text>\n              <View style={styles.grid}>\n                <AnimatedValue label=\"X\" value={latestReading.gyroX} unit=\"rad/s\" color={Colors.accentX} />\n                <AnimatedValue label=\"Y\" value={latestReading.gyroY} unit=\"rad/s\" color={Colors.accentY} />\n                <AnimatedValue label=\"Z\" value={latestReading.gyroZ} unit=\"rad/s\" color={Colors.accentZ} />\n              </View>\n            </View>\n          </FadeSlide>\n        )}\n\n        {isConnected && (\n          <FadeSlide delay={180}>\n            <LiveChart data={liveBuffer} />\n          </FadeSlide>\n        )}\n\n        {isConnected && (\n          <FadeSlide delay={220}>\n            {isRecording ? (\n              <GradientButton label=\"⬛  Training stoppen\" variant=\"stop\" onPress={stopSession} />\n            ) : (\n              <GradientButton label=\"▶  Training starten\" variant=\"primary\" onPress={startSession} />\n            )}\n          </FadeSlide>\n        )}\n\n        {/* Idle hint */}\n        {!isConnected && status === 'idle' && (\n          <FadeSlide delay={200}>\n            <LinearGradient\n              colors={['rgba(0,212,170,0.08)', 'transparent']}\n              style={styles.idleCard}\n            >\n              <Text style={styles.idleIcon}>📡</Text>\n              <Text style={styles.idleTitle}>Kein Sensor verbunden</Text>\n              <Text style={styles.idleBody}>\n                Schalte deinen XIAO nRF52840 ein und tippe auf \"Verbinden\".\n              </Text>\n            </LinearGradient>\n          </FadeSlide>\n        )}\n\n      </ScrollView>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safe: { flex: 1, backgroundColor: 'transparent' },\n  scroll: { flex: 1 },\n  content: { padding: 20, gap: 14, paddingBottom: 40 },\n\n  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },\n  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },\n\n  recBadge: {\n    flexDirection: 'row', alignItems: 'center', gap: 6,\n    backgroundColor: Colors.primaryDim, borderRadius: 8,\n    paddingHorizontal: 10, paddingVertical: 5,\n    borderWidth: 1, borderColor: Colors.primaryGlow,\n  },\n  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },\n  recLabel: { color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },\n\n  readingsBlock: { gap: 10 },\n  sectionLabel: { color: Colors.textSub, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },\n  grid: { flexDirection: 'row', gap: 8 },\n\n  idleCard: {\n    borderRadius: 20, padding: 32, alignItems: 'center', gap: 10,\n    borderWidth: 1, borderColor: Colors.border, marginTop: 16,\n  },\n  idleIcon: { fontSize: 40, marginBottom: 4 },\n  idleTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },\n  idleBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 260 },\n});\n",
    "app/components/LiveChart.tsx": "/**\n * @implements FA6\n */\nimport React, { useMemo, useState } from 'react';\nimport { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';\nimport Svg, { Path, Polyline, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { GlassCard } from '@/components/GlassCard';\nimport { Colors } from '@/constants/Colors';\nimport { IMUReading } from '@/store';\n\ntype Mode = 'accel' | 'gyro';\n\ninterface Props {\n  data: IMUReading[];\n}\n\nconst PAD = { l: 38, r: 10, t: 12, b: 20 };\nconst HEIGHT = 170;\n\nconst MODES: { key: Mode; label: string }[] = [\n  { key: 'accel', label: 'Accelerometer' },\n  { key: 'gyro', label: 'Gyroskop' },\n];\n\nconst SERIES = {\n  accel: [\n    { field: 'accelX' as keyof IMUReading, color: Colors.accentX, label: 'X' },\n    { field: 'accelY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },\n    { field: 'accelZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },\n  ],\n  gyro: [\n    { field: 'gyroX' as keyof IMUReading, color: Colors.accentX, label: 'X' },\n    { field: 'gyroY' as keyof IMUReading, color: Colors.accentY, label: 'Y' },\n    { field: 'gyroZ' as keyof IMUReading, color: Colors.accentZ, label: 'Z' },\n  ],\n};\n\nfunction buildPaths(data: IMUReading[], fields: (keyof IMUReading)[], chartW: number, chartH: number) {\n  if (data.length < 2) return [];\n  const allVals = fields.flatMap((f) => data.map((r) => r[f] as number));\n  const min = Math.min(...allVals);\n  const max = Math.max(...allVals);\n  const range = max - min || 1;\n  const xStep = chartW / (data.length - 1);\n  const toY = (v: number) => chartH - ((v - min) / range) * chartH;\n\n  return fields.map((field) => {\n    const pts = data.map((r, i) => ({ x: i * xStep, y: toY(r[field] as number) }));\n    const lineStr = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');\n    const first = pts[0];\n    const last = pts[pts.length - 1];\n    const areaStr = `M ${first.x.toFixed(1)},${chartH} L ${lineStr.split(' ').join(' L ')} L ${last.x.toFixed(1)},${chartH} Z`;\n    return { line: lineStr, area: areaStr };\n  });\n}\n\nfunction offsetPoints(str: string, dx: number, dy: number): string {\n  return str.split(' ').map((token) => {\n    if (['M', 'L', 'Z'].includes(token)) return token;\n    const [x, y] = token.split(',').map(Number);\n    return `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;\n  }).join(' ');\n}\n\nexport function LiveChart({ data }: Props) {\n  const [mode, setMode] = useState<Mode>('accel');\n  const [modeKey, setModeKey] = useState(0);\n  const screenW = Dimensions.get('window').width;\n  const chartW = screenW - 32 - PAD.l - PAD.r;\n  const chartH = HEIGHT - PAD.t - PAD.b;\n\n  const series = SERIES[mode];\n  const paths = useMemo(\n    () => buildPaths(data, series.map((s) => s.field), chartW, chartH),\n    [data, mode, chartW, chartH]\n  );\n\n  const hasData = data.length >= 2;\n  const allVals = hasData ? series.flatMap((s) => data.map((r) => r[s.field] as number)) : [0, 1];\n  const minVal = Math.min(...allVals);\n  const maxVal = Math.max(...allVals);\n\n  function switchMode(m: Mode) {\n    setMode(m);\n    setModeKey((k) => k + 1);\n  }\n\n  return (\n    <GlassCard style={styles.card}>\n      <View style={styles.toggle}>\n        {MODES.map(({ key, label }) => (\n          <TouchableOpacity\n            key={key}\n            onPress={() => switchMode(key)}\n            style={[styles.toggleBtn, mode === key && styles.toggleBtnActive]}\n            activeOpacity={0.7}\n          >\n            <Text style={[styles.toggleText, mode === key && styles.toggleTextActive]}>\n              {label}\n            </Text>\n          </TouchableOpacity>\n        ))}\n      </View>\n\n      {!hasData ? (\n        <View style={[styles.empty, { height: HEIGHT }]}>\n          <Text style={styles.emptyText}>Warte auf Sensordaten…</Text>\n        </View>\n      ) : (\n        <FadeSlide key={modeKey} from={{ opacity: 0, translateY: 0 }} delay={0}>\n          <Svg width={screenW - 32} height={HEIGHT}>\n            <Defs>\n              {series.map((s, i) => (\n                <LinearGradient key={i} id={`g${i}_${mode}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n                  <Stop offset=\"0%\" stopColor={s.color} stopOpacity=\"0.22\" />\n                  <Stop offset=\"100%\" stopColor={s.color} stopOpacity=\"0\" />\n                </LinearGradient>\n              ))}\n            </Defs>\n\n            <SvgText x={PAD.l - 4} y={PAD.t + 8} fill={Colors.textSub} fontSize=\"9\" textAnchor=\"end\">\n              {maxVal.toFixed(1)}\n            </SvgText>\n            <SvgText x={PAD.l - 4} y={PAD.t + chartH} fill={Colors.textSub} fontSize=\"9\" textAnchor=\"end\">\n              {minVal.toFixed(1)}\n            </SvgText>\n\n            <Line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />\n            <Line x1={PAD.l} y1={PAD.t + chartH} x2={PAD.l + chartW} y2={PAD.t + chartH} stroke={Colors.border} strokeWidth={1} />\n            <Line x1={PAD.l} y1={PAD.t + chartH / 2} x2={PAD.l + chartW} y2={PAD.t + chartH / 2} stroke={Colors.border} strokeWidth={1} strokeDasharray=\"3,4\" />\n\n            {paths.map((p, i) => (\n              <React.Fragment key={i}>\n                <Path d={offsetPoints(p.area, PAD.l, PAD.t)} fill={`url(#g${i}_${mode})`} />\n                <Polyline\n                  points={p.line.split(' ').map((pt) => {\n                    const [x, y] = pt.split(',').map(Number);\n                    return `${(x + PAD.l).toFixed(1)},${(y + PAD.t).toFixed(1)}`;\n                  }).join(' ')}\n                  fill=\"none\"\n                  stroke={series[i].color}\n                  strokeWidth={1.8}\n                  strokeLinejoin=\"round\"\n                  strokeLinecap=\"round\"\n                />\n              </React.Fragment>\n            ))}\n          </Svg>\n        </FadeSlide>\n      )}\n\n      <View style={styles.legend}>\n        {series.map((s) => (\n          <View key={s.label} style={styles.legendItem}>\n            <View style={[styles.legendDot, { backgroundColor: s.color }]} />\n            <Text style={styles.legendText}>{s.label}</Text>\n          </View>\n        ))}\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  card: { padding: 14, gap: 8 },\n  toggle: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 3, gap: 3 },\n  toggleBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },\n  toggleBtnActive: { backgroundColor: Colors.surfaceBright },\n  toggleText: { color: Colors.textSub, fontSize: 12, fontWeight: '600' },\n  toggleTextActive: { color: Colors.text },\n  empty: { alignItems: 'center', justifyContent: 'center' },\n  emptyText: { color: Colors.textMuted, fontSize: 13 },\n  legend: { flexDirection: 'row', gap: 16 },\n  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },\n  legendDot: { width: 7, height: 7, borderRadius: 3.5 },\n  legendText: { color: Colors.textSub, fontSize: 11, fontWeight: '500' },\n});\n",
    "app/app/(tabs)/history.tsx": "/**\n * @implements FA7\n */\nimport React, { useEffect, useState } from 'react';\nimport { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';\nimport { LinearGradient } from 'expo-linear-gradient';\nimport { FadeSlide } from '@/components/FadeSlide';\nimport { AnimatedLogo } from '@/components/AnimatedLogo';\nimport { Colors } from '@/constants/Colors';\nimport { useTrainingStore, TrainingSession } from '@/store';\nimport { SessionCard } from '@/components/SessionCard';\n\nconst API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';\n\nexport default function HistoryScreen() {\n  const { sessions, setSessions } = useTrainingStore();\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  async function fetchSessions() {\n    setLoading(true);\n    setError(null);\n    try {\n      const res = await fetch(`${API_BASE}/api/sessions`);\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      const data: TrainingSession[] = await res.json();\n      setSessions(data);\n    } catch {\n      setError('Backend nicht erreichbar.\\nLäuft docker compose up?');\n    } finally {\n      setLoading(false);\n    }\n  }\n\n  useEffect(() => { fetchSessions(); }, []);\n\n  return (\n    <SafeAreaView style={styles.safe}>\n      <StatusBar barStyle=\"light-content\" backgroundColor={Colors.bg} />\n\n      {/* Fixed header — always visible */}\n      <View style={styles.header}>\n        <FadeSlide delay={0}>\n          <AnimatedLogo />\n          <Text style={styles.pageTitle}>Verlauf</Text>\n        </FadeSlide>\n      </View>\n\n      {/* Content area fills remaining space */}\n      <View style={styles.body}>\n        {loading && (\n          <View style={styles.center}>\n            <ActivityIndicator color={Colors.primary} size=\"large\" />\n            <Text style={styles.loadingText}>Lade Einheiten…</Text>\n          </View>\n        )}\n\n        {!loading && error && (\n          <FadeSlide from={{ opacity: 0, scale: 0.96, translateY: 0 }} style={styles.center as any}>\n            <View style={styles.errorCard}>\n              <Text style={styles.errorIcon}>⚠️</Text>\n              <Text style={styles.errorText}>{error}</Text>\n              <TouchableOpacity style={styles.retryBtn} onPress={fetchSessions}>\n                <Text style={styles.retryText}>Erneut versuchen</Text>\n              </TouchableOpacity>\n            </View>\n          </FadeSlide>\n        )}\n\n        {!loading && !error && sessions.length === 0 && (\n          <FadeSlide style={styles.center as any}>\n            <LinearGradient colors={['rgba(0,212,170,0.06)', 'transparent']} style={styles.emptyCard}>\n              <Text style={styles.emptyIcon}>🏋️</Text>\n              <Text style={styles.emptyTitle}>Noch keine Einheiten</Text>\n              <Text style={styles.emptyBody}>Verbinde deinen Sensor und starte ein Training.</Text>\n            </LinearGradient>\n          </FadeSlide>\n        )}\n\n        {!loading && !error && sessions.length > 0 && (\n          <FlatList\n            data={sessions}\n            keyExtractor={(item) => item.id}\n            contentContainerStyle={styles.list}\n            showsVerticalScrollIndicator={false}\n            ListHeaderComponent={\n              <Text style={styles.countLabel}>\n                {sessions.length} {sessions.length === 1 ? 'Einheit' : 'Einheiten'}\n              </Text>\n            }\n            renderItem={({ item, index }) => (\n              <SessionCard session={item} index={index} onPress={() => {}} />\n            )}\n            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}\n          />\n        )}\n      </View>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safe: { flex: 1, backgroundColor: 'transparent' },\n  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },\n  pageTitle: { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginTop: 10, marginBottom: 4 },\n  body: { flex: 1 },\n  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },\n  loadingText: { color: Colors.textSub, fontSize: 13, marginTop: 12 },\n\n  errorCard: {\n    backgroundColor: Colors.surface, borderRadius: 20, padding: 28,\n    alignItems: 'center', gap: 12,\n    borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', maxWidth: 300,\n  },\n  errorIcon: { fontSize: 32 },\n  errorText: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20 },\n  retryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10, marginTop: 4 },\n  retryText: { color: Colors.bg, fontSize: 13, fontWeight: '700' },\n\n  emptyCard: {\n    borderRadius: 20, padding: 36, alignItems: 'center', gap: 10,\n    borderWidth: 1, borderColor: Colors.border,\n  },\n  emptyIcon: { fontSize: 40 },\n  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },\n  emptyBody: { color: Colors.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 240 },\n\n  list: { paddingHorizontal: 20, paddingBottom: 40 },\n  countLabel: { color: Colors.textSub, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },\n});\n",
    "doc/Pflichtenheft/pflichtenheft.tex": "% =============================================================================\n% MoveLink - Labor-/Projektbericht\n% Software-Architekturen Labor, SS 2026\n% Hochschule Karlsruhe (HKA)\n% =============================================================================\n\\documentclass[11pt, a4paper]{article}\n\n% --- Pakete ---\n\\usepackage[ngerman]{babel}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage{lmodern}\n\\usepackage[left=2.5cm, right=2.5cm, top=2.5cm, bottom=2.5cm]{geometry}\n\\usepackage{graphicx}\n\\usepackage{xcolor}\n\\usepackage{hyperref}\n\\usepackage{enumitem}\n\\usepackage{tabularx}\n\\usepackage{booktabs}\n\\usepackage{tikz}\n\\usepackage{float}\n\\usepackage{fancyhdr}\n\\usepackage{titlesec}\n\\usepackage{parskip}\n\\usepackage{microtype}\n\\usepackage{mdframed}\n\\usepackage{tocloft}\n\\usepackage[document]{ragged2e}\n\\emergencystretch=2em\n\\hyphenpenalty=10000\n\\exhyphenpenalty=10000\n\n% X-Spalten in tabularx global linksbündig (kein Blocksatz in Tabellen)\n\\renewcommand{\\tabularxcolumn}[1]{>{\\raggedright\\arraybackslash}p{#1}}\n\n% --- Inhaltsverzeichnis Styling ---\n% Überkapitel: rot und fett\n\\renewcommand{\\cftsecfont}{\\bfseries\\color{hkared}}\n\\renewcommand{\\cftsecpagefont}{\\bfseries\\color{hkared}}\n% Unterkapitel: schwarz (hidelinks im TOC nötig damit hyperref nicht überschreibt)\n\\renewcommand{\\cftsubsecfont}{\\normalfont\\color{black}}\n\\renewcommand{\\cftsubsecpagefont}{\\normalfont\\color{black}}\n% Spacing: gleiches Spacing auf allen Ebenen\n\\setlength{\\cftbeforesecskip}{8pt}\n\\setlength{\\cftbeforesubsecskip}{8pt}\n\\setlength{\\cftbeforesubsubsecskip}{8pt}\n% Abstand nach dem Titel \"Inhaltsverzeichnis\" vor dem ersten Eintrag\n\\setlength{\\cftaftertoctitleskip}{1.2cm}\n\n% --- Farben (HKA Corporate) ---\n\\definecolor{hkared}{RGB}{198, 42, 18}\n\\definecolor{hkagray}{RGB}{100, 100, 100}\n\\definecolor{placeholderbg}{RGB}{255, 248, 220}\n\\definecolor{placeholderborder}{RGB}{200, 150, 0}\n\n% --- Hyperref Setup ---\n\\hypersetup{\n    colorlinks=true,\n    linkcolor=hkared,\n    urlcolor=hkared,\n    citecolor=hkared\n}\n\n% --- Section Styling ---\n\\titleformat{\\section}{\\large\\bfseries\\color{hkared}}{\\thesection}{1em}{}\n\\titleformat{\\subsection}{\\normalsize\\bfseries\\color{hkared}}{\\thesubsection}{1em}{}\n\\titleformat{\\subsubsection}{\\normalsize\\bfseries\\color{black}}{\\thesubsubsection}{1em}{}\n\\titlespacing*{\\section}{0pt}{1.4em}{0.5em}\n\\titlespacing*{\\subsection}{0pt}{0.8em}{0.3em}\n\\titlespacing*{\\subsubsection}{0pt}{0.6em}{0.2em}\n\n% --- Platzhalter-Umgebung ---\n\\newmdenv[\n    backgroundcolor=placeholderbg,\n    linecolor=placeholderborder,\n    linewidth=1.5pt,\n    roundcorner=4pt,\n    innertopmargin=8pt,\n    innerbottommargin=8pt,\n    innerleftmargin=10pt,\n    innerrightmargin=10pt,\n    skipabove=8pt,\n    skipbelow=8pt\n]{placeholder}\n\n% --- Header/Footer ---\n\\pagestyle{fancy}\n\\fancyhf{}\n\\fancyhead[L]{\\small\\color{hkagray}MoveLink -- Projektbericht}\n\\fancyhead[R]{\\small\\color{hkagray}SWA Labor SS~2026}\n\\fancyfoot[C]{\\small\\color{hkagray}\\thepage}\n\\renewcommand{\\headrulewidth}{0.4pt}\n\n% =============================================================================\n\\begin{document}\n\n% --- Titelseite ---\n\\begin{titlepage}\n    \\centering\n    \\includegraphics[width=0.35\\textwidth]{HKA.jpg}\n\n    {\\normalsize\\color{hkagray} University of Applied Sciences}\\\\[0.125cm]\n    {\\small\\color{hkagray} Fakult\\\"at f\\\"ur Informatik und Wirtschaftsinformatik}\n\n    \\vspace{.5cm}\n    {\\color{hkared}\\rule{\\textwidth}{1.5pt}}\n\n    \\vspace{1.5cm}\n    {\\fontsize{24}{30}\\selectfont\\bfseries\\color{hkared} MoveLink}\\\\[0.6cm]\n    {\\Large Visualisierung von Echtzeit-Bewegungsdaten}\\\\[.75cm]\n    {\\LARGE\\bfseries Projektbericht}\n\n    \\vspace{.5cm}\n    {\\large Software-Architekturen Labor}\\\\[0.3cm]\n    {\\large Sommersemester 2026}\n\n    \\vspace{.5cm}\n    {\\color{hkared}\\rule{0.6\\textwidth}{0.5pt}}\n    \\vspace{1.5cm}\n\n    {\\normalsize\n    \\begin{tabular}{rl}\n        \\textbf{Betreuer:}  & Prof.~Dr.~rer.~nat.~Sinz \\\\[0.5cm]\n        \\textbf{Team:}      & Erlind Sejdiu \\\\\n                             & Luca Sch\\\"oneberg \\\\\n                             & Devin Uyan \\\\[0.5cm]\n        \\textbf{Abgabe:}    & Ende Sommersemester 2026 \\\\\n    \\end{tabular}\n    }\n\n    \\vfill\n    {\\small\\color{hkagray} Version 2.0 -- Stand: \\today}\n\\end{titlepage}\n\n% --- Inhaltsverzeichnis ---\n\\begingroup\n\\hypersetup{hidelinks}\n\\tableofcontents\n\\endgroup\n\\thispagestyle{empty}\n\\newpage\n\\setcounter{page}{1}\n\n% =============================================================================\n\\section{Einleitung}\n% =============================================================================\n\\vspace{.5cm}\n\\subsection{Motivation}\n\\vspace{.5cm}\n\nDie Qualit\\\"at der Bewegungsausf\\\"uhrung ist im Krafttraining oder in der Physiotherapie ein wichtiger Faktor f\\\"ur den Trainingserfolg. W\\\"ahrend professionelle Athleten Zugang zu Coaches und Physiotherapeuten haben, trainieren Otto-normal-Sportler ohne objektives Feedback. Fehler in der Technik, beispielsweise ein zu stark gerundeter R\\\"ucken bei der Kniebeuge, werden dadurch oft \\\"uber lange Zeit nicht korrigiert und k\\\"onnen zu Beschwerden f\\\"uhren.\n\nZwar können Bewegungsabläufe durch moderne Hardware-Sensoren erfasst werden, jedoch liegen diese Informationen oft nur als unstrukturierte Rohdaten vor, die für den Endanwender kaum interpretierbar sind. Daraus ergibt sich die Herausforderung, die anfallenden Datenströme aus verschiedenen Quellen zentral zusammenzuführen und visuell nutzergerecht aufzubereiten. \\vspace{.25cm}\n\n\\subsection{Zielsetzung}\nIm Rahmen dieses Laborprojekts wird die mobile Applikation \\textbf{MoveLink} konzipiert und prototypisch entwickelt. Ziel der Anwendung ist es, als zentrale Schnittstelle zu fungieren, die Trainingsdaten von unterschiedlichen Hardware-Sensoren erfasst, speichert und in einer einheitlichen Benutzeroberfläche verständlich darstellt.\n\n\\newpage\n\n% =============================================================================\n\\section{System Kontext, Use Cases und Anforderungen}\n% =============================================================================\n\\subsection{System Kontext}\n\n\\begin{figure}[h!]\n    \\centering\n    \\includegraphics[width=\\textwidth]{img/C4C1.png}\n    \\caption{System Kontext MoveLink}\n    \\label{fig:system_kontext}\n\\end{figure}\n\n\\vspace{.5cm}\n\\newpage\n% =============================================================================\n\\section{Use Cases}\n% =============================================================================\nBevor eine Architekturerläuterung folgt, sollen zunächst die folgenden Use Cases definiert werden. Diese dienen dem Verständnis der Anforderungen an das System. Jeder Use Case wird durch eine kurze Beschreibung und nachfolgend durch eine Auflistung der Schritte, die zur Erfüllung des Use Cases notwendig sind, definiert.\n\n\\vspace{0.5cm}\n\\textbf{UC-1: Trainingsger\\\"at verbinden} \\vspace{.25cm} \\newline \n\\textit{Akteur:} Trainierender \\quad \n\\textit{Vorbedingung:} Trainingsger\\\"at eingeschaltet \\newline\n\\textit{Beschreibung:} Als Trainierender m\\\"ochte ich mein Trainingsger\\\"at mit der App verbinden k\\\"onnen, um Trainingsdaten erfassen zu k\\\"onnen.\n\\begin{enumerate}[nosep]\n    \\item Eingabe: Ich als trainierender öffne die App, Ausgabe: Ich sehe eine Möglichkeit/Reiter Hardwaregeräte anzuzeigen.\n    \\item Eingabe: Ich als trainierender klicke auf den Reiter Hardwaregeräte, Ausgabe: Ich sehe eine Liste der verfügbaren Hardwaregeräte und mit welchen Hardwaregeräten ich verbunden bin.\n    \\item Eingabe: Ich als trainierender klicke auf ein Hardwaregerät in der Liste auf verbinden, Ausgabe: Ich sehe eine Detailansicht des ausgewählten Hardwaregeräts und dass dies mit der App verbunden ist.\n\\end{enumerate}\n\n\\vspace{0.5cm}\n\n\\textbf{UC-2: Echtzeit-Training überwachen} \\vspace{.25cm} \\newline \n\\textit{Akteur:} Trainierender \\quad \n\\textit{Vorbedingung:} Trainingsgerät verbunden \\newline\n\\textit{Beschreibung:} Ich als Trainierender möchte mein Training in Echtzeit überwachen können, um direkt Feedback zu meiner Ausführung zu erhalten.\n\\begin{enumerate}[nosep]\n    \\item Eingabe: Ich als trainierender öffne die App, Ausgabe: Ich sehe eine Möglichkeit/Reiter mein Training zu starten.\n    \\item Eingabe: Ich als trainierender klicke auf den Reiter \"Training starten\", Ausgabe: Ich sehe eine Detailansicht des ausgewählten Trainings und die Möglichkeit mein Training zu starten.\n    \\item Eingabe: Ich als trainierender drücke den Start Button in der Detailansicht des Trainings, Ausgabe: Die App demonstriert mir Bewegungen, welche nachzumachen sind.\n    \\item Eingabe: Ich als trainierender mache die Bewegung nach, Ausgabe: Die App visualisiert die Bewegung in Echtzeit und vergleicht diese mit der Demonstration. Gibt positives Feedback, wenn die Bewegung korrekt ausgeführt wurde.\n\\end{enumerate}\n\n\\vspace{0.5cm}\n\n\\textbf{UC-3: Trainingsdaten einsehen} \\vspace{.25cm} \\newline \n\\textit{Akteur:} Trainierender \\quad \n\\textit{Vorbedingung:} Vergangene Trainingseinheit vorhanden \\newline\n\\textit{Beschreibung:} Ich als Trainierender möchte vergangene Trainingseinheiten einsehen können, um meine Fortschritte zu verfolgen.\n\\begin{enumerate}[nosep]\n    \\item Eingabe: Ich als trainierender öffne die App, Ausgabe: Ich sehe eine Möglichkeit/Reiter vergangene Trainingseinheiten anzuzeigen.\n    \\item Eingabe: Ich als trainierender klicke auf den Reiter \"Trainingseinheiten\", Ausgabe: Ich sehe eine Liste der vergangenen Trainingseinheiten an.\n    \\item Eingabe: Ich wähle eine Trainingseinheit aus der Liste aus, Ausgabe: Die App zeigt die historischen Bewegungsdaten grafisch an.\n\\end{enumerate}\n\n\\subsubsection*{Funktionale Anforderungen} \\vspace{.25cm}\n\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=10pt]\n    \\item \\textbf{FA1:} Das System muss einen Reiter oder eine Navigationsm\\\"oglichkeit f\\\"ur Hardwareger\\\"ate / Trainings / vergangene Trainingseinheiten anzeigen. (aus UC-1, UC-2, UC-3)\n    \\item \\textbf{FA2:} Das System muss mir eine Liste von verfügbaren Hardwareger\\\"ate und mit welchen Hardwareger\\\"aten ich verbunden bin anzeigen. (aus UC-1)\n    \\item \\textbf{FA3:} Das System muss einen verbindungsaufbau mit dem Hardwareger\\\"at herstellen k\\\"onnen. (aus UC-1)\n    \\item \\textbf{FA4:} Das System muss eine Detailansicht f\\\"ur ein ausgew\\\"ahltes Training anzeigen. (aus UC-2)\n    \\item \\textbf{FA5:} Das System muss Bewegungsdatenstr\\\"ome empfangen und verarbeiten k\\\"onnen. (aus UC-2)\n    \\item \\textbf{FA6:} Das System muss die empfangenen Bewegungen in Echtzeit visualisieren. (aus UC-2)\n    \\item \\textbf{FA7:} Das System muss historische Bewegungsdaten grafisch anzeigen k\\\"onnen. (aus UC-3)\n\\end{itemize}\n\n\\vspace{1cm}\n\\subsubsection*{Nicht-funktionale Anforderungen -- Muss-Kriterien} \\vspace{.25cm}\n\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=10pt]\n    \\item \\textbf{NF1 -- Latenz:} Die E2E-Latenz vom Sensor bis zur Darstellung muss $\\leq$ \\textbf{100\\,ms} sein.\n    \\item \\textbf{NF2 -- Zuverl\\\"assigkeit:} Bei einem Verbindungsabbruch muss die App den Nutzer benachrichtigen und automatisch Reconnect-Versuche starten.\n    \\item \\textbf{NF3 -- Usability:} Das Pairing darf maximal zwei Nutzerinteraktionen erfordern.\n\\end{itemize}\n\n\\vspace{1cm}\n\\subsubsection*{Rahmenbedingungen} \\vspace{.25cm}\n\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=10pt]\n    \\item \\textbf{R1:} Die Applikationen muss auf android devices laufen.\n\\end{itemize}\n\n\\newpage\n% =============================================================================\n\\section{Systemarchitektur}\n% =============================================================================\n\n\\vspace{.25cm}\n%\\subsection{Gew\\\"ahlte Architektur: Containerisierte Monolith-Architektur}\n%\\vspace{.25cm}\n%Die Architektur konzentriert sich auf die Applikationsschicht und folgt einem dreischichtigen Container-Modell, das modular aufgebaut ist und sich optimal f\\\"ur ein lokales Deployment eignet:\n%\\vspace{-.25cm}\n%\\begin{figure}[H]\n%    \\centering\n%    \\resizebox{\\textwidth}{!}{%\n%    \\begin{tikzpicture}[\n%        box/.style={draw=black!70, thick, rounded corners=4pt, minimum width=3.5cm, minimum height=1.4cm, align=center},\n%        arrow/.style={<->, thick, >=stealth, draw=black!80},\n%        label_top/.style={font=\\scriptsize, midway, above, text=black!90},\n%        label_bot/.style={font=\\scriptsize, midway, below, text=black!80},\n%        boundary/.style={draw=black!50, dashed, rounded corners=6pt, thick}\n%    ]\n%        \\draw[boundary, fill=black!2] (7.3, -1.5) rectangle (16.7, 1.6);\n%        \\node[font=\\scriptsize\\itshape, text=black!70, anchor=north] at (12, 1.5) {Backend-Infrastruktur (Docker-Host)};\n%\n%        \\node[box, fill=hkared!5] (sensor) at (-3.5, 0) {\n%            \\textbf{Sensor} \\\\\n%            \\scriptsize XIAO nRF52840 \\\\\n%            \\scriptsize \\textit{+ IMU}\n%        };\n%        \\node[box, fill=hkared!10] (frontend) at (3.5, 0) {\n%            \\textbf{Mobile Client} \\\\\n%            \\scriptsize Frontend-App \\\\\n%            \\scriptsize \\textit{AP 1}\n%        };\n%        \\node[box, fill=hkared!25] (backend) at (9.5, 0) {\n%            \\textbf{API Gateway} \\\\\n%            \\scriptsize Backend-Container \\\\\n%            \\scriptsize \\textit{AP 2}\n%        };\n%        \\node[box, fill=hkared!40] (database) at (15, 0) {\n%            \\textbf{Persistenz} \\\\\n%            \\scriptsize Datenbank-Container \\\\\n%            \\scriptsize \\textit{AP 3}\n%        };\n%\n%        \\draw[arrow] (sensor) --\n%            node[label_top] {BLE}\n%            node[label_bot] {(GATT)}\n%        (frontend);\n%        \\draw[arrow] (frontend) --\n%            node[label_top] {HTTPS / WSS}\n%            node[label_bot] {(JSON)}\n%        (backend);\n%        \\draw[arrow] (backend) --\n%            node[label_top] {TCP}\n%            node[label_bot] {(SQL)}\n%        (database);\n%    \\end{tikzpicture}%\n%    } \\vspace{-.5cm}\n%    \\caption{\\\"Ubersicht der Systemarchitektur, Protokolle und Arbeitspakete (AP)}\n%    \\label{fig:architektur_container}\n%\\end{figure}\n%\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=10pt]\n%    \\item \\textbf{Sensor (extern):} Der XIAO nRF52840 mit IMU-Sensor erfasst Bewegungsdaten und sendet sie via BLE/GATT an die App. Er ist bewusst au\\ss{}erhalb des Docker-Hosts angesiedelt, da es sich um externe Hardware handelt.\n%    \\item \\textbf{Frontend-App (AP\\,1):} Stellt die Benutzeroberfl\\\"ache f\\\"ur den Trainierenden bereit und ist zust\\\"andig f\\\"ur BLE-Verbindungsmanagement sowie Echtzeit-Visualisierung.\n%    \\item \\textbf{Backend-Container (AP\\,2):} Isolierter Server als zentrales API-Gateway. Verarbeitet Echtzeit-Datenstr\\\"ome und bietet REST-Schnittstellen f\\\"ur statische Anfragen.\n%    \\item \\textbf{Datenbank-Container (AP\\,3):} Kapselt die Datenhaltung. Speichert Nutzerprofile sowie die f\\\"ur UC-3 ben\\\"otigten historischen Trainingsdaten persistent.\n%\\end{itemize}\n%\\vspace{.5cm}\n%\\subsection{Diskussion von Alternativen}\n%\\vspace{.5cm}\n%F\\\"ur die Umsetzung des Projekts steht ein Zeitbudget von insgesamt rund 180 Stunden (ca. 60 Stunden pro Person) zur Verf\\\"ugung. Zur Evaluierung der optimalen Systemarchitektur wurden drei Alternativen untersucht:\n%\\vspace{.25cm}\n%\\begin{table}[H]\n%\\centering\n%\\small\n%\\renewcommand{\\arraystretch}{1.3}\n%\\begin{tabularx}{\\textwidth}{>{\\raggedright\\arraybackslash}p{4.2cm} >{\\raggedright\\arraybackslash}X >{\\raggedright\\arraybackslash}X}\n%    \\toprule\n%    \\textbf{Architekturansatz} & \\textbf{Vorteile} & \\textbf{Nachteile} \\\\\n%    \\midrule\n%\n%    \\textbf{Client-Server (Microservices)} \\newline\n%    \\scriptsize Entkoppelte Frontend-/Backend-Services\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Klare \\textit{Separation of Concerns}\n%            \\item Unabh\\\"angig skalierbar\n%            \\item Hohe Technologie-Flexibilit\\\"at\n%          \\end{itemize}\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Hoher Infrastrukturaufwand\n%            \\item Netzwerklatenzen\n%            \\item Hohe Komplexit\\\"at (PoC)\n%          \\end{itemize} \\\\\n%    \\midrule\n%\n%    \\textbf{Client-Server (Monolith)} \\newline\n%    \\scriptsize Zentrale Backend-Logik\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Geringe Latenz (In-Memory)\n%            \\item Einfaches Deployment \\& Testing\n%            \\item Geringer Overhead (PoC)\n%          \\end{itemize}\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Nur vertikale Skalierung\n%            \\item Starke Kopplung bei Wachstum\n%            \\item \\textit{Single Point of Failure}\n%          \\end{itemize} \\\\\n%    \\midrule\n%\n%    \\textbf{Publisher-Subscriber} \\newline\n%    \\scriptsize Ereignisgesteuert (z.\\,B. MQTT)\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Sehr gut skalierbar\n%            \\item Ideal f\\\"ur Daten-Streams (IoT)\n%            \\item Lose gekoppelte Kommunikation\n%          \\end{itemize}\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Broker erforderlich\n%            \\item Hoher Overhead (PoC)\n%            \\item Erschwertes Debugging\n%          \\end{itemize} \\\\\n%    \\bottomrule\n%\\end{tabularx}\n%\\caption{Vergleich der evaluierten Architekturmuster}\n%\\label{tab:architektur_vergleich}\n%\\end{table}\n%\n%\\textbf{Begr\\\"undung:} \\vspace{.25cm} \\newline Unter Abw\\\"agung der Ressourcenrestriktionen (180 Stunden) erweist sich die \\textbf{monolithische Client-Server-Architektur} als die zielf\\\"uhrendste L\\\"osung. Sie minimiert den Infrastruktur-Overhead, erlaubt schnelle Entwicklungszyklen und erf\\\"ullt die Echtzeit-Anforderungen durch direkte In-Memory-Aufrufe. Potenzielle Konflikte bei der parallelen Team-Entwicklung werden durch eine saubere interne Modulstruktur vermieden.\n%\\vspace{.5cm}\n%% =============================================================================\n%\\section{Technologieauswahl}\n%% =============================================================================\n%\\vspace{.5cm}\n%Die Auswahl der Technologien orientiert sich an den Ressourcenrestriktionen (Zeiteffizienz) sowie der Notwendigkeit, die Arbeitspakete klar voneinander zu entkoppeln.\n%\n%\\vspace{.5cm}\n%\\begin{table}[H]\n%\\centering\n%\\small\n%\\renewcommand{\\arraystretch}{1.5}\n%\\begin{tabularx}{\\textwidth}{>{\\raggedright\\arraybackslash}p{3cm} >{\\raggedright\\arraybackslash}p{4cm} >{\\raggedright\\arraybackslash}X}\n%    \\toprule\n%    \\textbf{Schicht} & \\textbf{Technologie} & \\textbf{Entscheidungsbegr\\\"undung} \\\\\n%    \\midrule\n%\n%    \\textbf{Embedded} \\newline (AP 3)\n%        & XIAO nRF52840 \\newline C/C++ (Arduino/Zephyr)\n%        & Integriertes BLE; kompakter Formfaktor; stromsparend; direkte IMU-Anbindung \\\"uber I\\textsuperscript{2}C. \\\\\n%    \\midrule\n%\n%    \\textbf{Mobile Client} \\newline (AP 1)\n%        & Cross-Platform Framework \\newline (React Native / Flutter)\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Single-Codebase f\\\"ur iOS und Android.\n%            \\item Etablierte BLE-Bibliotheken (GATT-Support).\n%            \\item Hohe Rendering-Performance f\\\"ur Live-Charts.\n%          \\end{itemize} \\\\\n%    \\midrule\n%\n%    \\textbf{API \\& Gateway} \\newline (AP 2)\n%        & Node.js (TypeScript) \\newline oder Python (FastAPI)\n%        & \\vspace{-0.3cm}\\begin{itemize}[leftmargin=*, nosep]\n%            \\item Non-Blocking I/O f\\\"ur parallele Live-Streams.\n%            \\item Native WebSocket- und REST-Unterst\\\"utzung.\n%          \\end{itemize} \\\\\n%    \\midrule\n%\n%    \\textbf{Persistenz}\n%        & PostgreSQL\n%        & ACID-konforme Speicherung; JSONB-Support f\\\"ur schemaloser Sensordaten (Zeitreihen). \\\\\n%    \\midrule\n%\n%    \\textbf{Echtzeit- \\newline kommunikation}\n%        & WebSockets (WSS)\n%        & Bidirektionaler Vollduplex-Kanal; Latenz $< 100$\\,ms; kein HTTP-Polling-Overhead. \\\\\n%    \\midrule\n%\n%    \\textbf{Infrastruktur}\n%        & Docker \\& Docker Compose\n%        & Reproduzierbarer lokaler Betrieb aller Dienste mit einem Befehl; kein Cloud-Hosting n\\\"otig. \\\\\n%\n%    \\bottomrule\n%\\end{tabularx}\n%\\caption{\\\"Ubersicht und Begr\\\"undung des gew\\\"ahlten Technologie-Stacks}\n%\\label{tab:technologieauswahl}\n%\\end{table}\n%\n%\\newpage\n%% =============================================================================\n%\\section{Umsetzung und Implementierung}\n%% =============================================================================\n%\\vspace{.25cm}\n%\\subsection{Embedded-Schicht -- XIAO nRF52840 (AP\\,3)}\n%\\vspace{.5cm}\n%\\begin{placeholder}\n%\\textbf{\\color{placeholderborder}TODO -- Wird nach Abschluss der Implementierung erg\\\"anzt \\newline (AP\\,3 -- Erlind Sejdiu)}\n%\n%\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=5pt]\n%    \\item Beschreibung der Firmware-Architektur (Arduino/Zephyr RTOS)\n%    \\item IMU-Initialisierung und Kalibrierung (LSM6DS3TR-C \\\"uber I\\textsuperscript{2}C)\n%    \\item Abtastrate und Datenformat der Sensorwerte (Accelerometer, Gyroskop)\n%    \\item BLE-Service-Definitionen (GATT-Service UUID, Characteristic-Layout)\n%    \\item Implementierung der BLE-Notifications / Advertising\n%    \\item Energieverwaltung und Verbindungsparameter\n%    \\item Code-Snippets der Kernfunktionalit\\\"at\n%\\end{itemize}\n%\\end{placeholder}\n%\\vspace{.25cm}\n%\\subsection{Backend -- API-Gateway und Containerisierung (AP\\,2)}\n%\\vspace{.5cm}\n%\\begin{placeholder}\n%\\textbf{\\color{placeholderborder}TODO -- Wird nach Abschluss der Implementierung erg\\\"anzt \\newline (AP\\,2 -- Luca Sch\\\"oneberg)}\n%\n%\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=5pt]\n%    \\item Projektstruktur und gew\\\"ahltes Framework (Node.js/FastAPI)\n%    \\item REST-API-Endpunkte (Routen, Request-/Response-Schemata)\n%    \\item WebSocket-Handler: Verbindungsmanagement und Broadcast-Logik\n%    \\item Datenbankschema (Tabellen: Nutzer, Sessions, Sensorwerte)\n%    \\item Docker-Compose-Konfiguration (Services, Netzwerke, Volumes)\n%    \\item Umgebungsvariablen und Konfigurationsmanagement\n%    \\item Sequenzdiagramm des Datenflusses (BLE-Eingang bis WS-Ausgang)\n%\\end{itemize}\n%\\end{placeholder}\n%\\vspace{.25cm}\n%\\subsection{Frontend -- Mobile Applikation (AP\\,1)}\n%\\vspace{.5cm}\n%\\begin{placeholder}\n%\\textbf{\\color{placeholderborder}TODO -- Wird nach Abschluss der Implementierung erg\\\"anzt \\newline (AP\\,1 -- Devin Uyan)}\n%\n%\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=5pt]\n%    \\item Projektstruktur und Komponentenarchitektur (z.\\,B. React Native Screens)\n%    \\item BLE-Verbindungsmanagement: Scan, Pairing, GATT-Notification-Handling\n%    \\item WebSocket-Client-Implementierung und Zustandsmanagement\n%    \\item Echtzeit-Visualisierungskomponente (Bibliothek, Darstellungsform, Achsen)\n%    \\item Historien-Ansicht: Abruf und Darstellung vergangener Sessions\n%    \\item UI/UX-Entscheidungen (Navigation, Farbgebung, Feedbackelemente)\n%    \\item Screenshots / Screen-Recordings der fertigen App\n%\\end{itemize}\n%\\end{placeholder}\n%\n%\\newpage\n%% =============================================================================\n%\\section{Qualit\\\"atssicherung und Tests}\n%% =============================================================================\n%\\vspace{.5cm}\n%\\begin{placeholder}\n%\\textbf{\\color{placeholderborder}TODO -- Wird nach Abschluss der Implementierung erg\\\"anzt}\n%\n%Geplante Inhalte dieses Abschnitts:\n%\n%\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=5pt]\n%    \\item \\textbf{Teststrategie:} \\\"Ubersicht der eingesetzten Testmethoden \\newline(Unit-, Integrations-, Systemtest)\n%    \\item \\textbf{Backend-Tests:} Unit-Tests der REST-Endpunkte; \\newline Integrationstests des WebSocket-Handlers\n%    \\item \\textbf{Frontend-Tests:} Komponenten-Tests; manuelle UI-Tests auf Android und iOS\n%    \\item \\textbf{End-to-End-Test:} Messung der tats\\\"achlichen End-to-End-Latenz (Sensor $\\rightarrow$ App)\n%    \\item \\textbf{Latenzauswertung:} Vergleich gemessene Latenz vs. Anforderung NF1 ($< 100$\\,ms)\n%    \\item \\textbf{Bekannte Einschr\\\"ankungen:} Abweichungen vom urspr\\\"unglichen Pflichtenheft\n%\\end{itemize}\n%\\end{placeholder}\n%\n%% =============================================================================\n%\\section{Fazit}\n%% =============================================================================\n%\\vspace{.5cm}\n%\\begin{placeholder}\n%\\textbf{\\color{placeholderborder}TODO -- Wird am Projektende verfasst}\n%\n%Geplante Inhalte dieses Abschnitts:\n%\n%\\begin{itemize}[topsep=0pt, parsep=0pt, itemsep=5pt]\n%    \\item \\textbf{Zusammenfassung:} Was wurde umgesetzt? \\newline Wurden die Ziele aus Abschnitt~1.2 erreicht?\n%    \\item \\textbf{Erf\\\"ullte Muss- und Kann-Kriterien:} R\\\"uckblick auf den Anforderungskatalog (Abschnitt~3.2)\n%    \\item \\textbf{Erfahrungen:} Team-Reflexion zu Technologiewahl, \\newline Architekturentscheidungen und Arbeitsteilung\n%    \\item \\textbf{Ausblick:} M\\\"ogliche n\\\"achste Schritte \\newline(ML-Integration, Produktivbetrieb, Multi-Sensor-Unterst\\\"utzung)\n%\\end{itemize}\n%\\end{placeholder}\n%\\vspace{.5cm}\n%% =============================================================================\n\\section*{Literaturverzeichnis}\n\\addcontentsline{toc}{section}{Literaturverzeichnis}\n% =============================================================================\n\\vspace{.5cm}\n\\begin{thebibliography}{9}\n\n\\bibitem{ble_spec}\nBluetooth SIG, \\textit{Bluetooth Core Specification 5.4}, 2023. \\\\\n\\texttt{https://www.bluetooth.com/specifications/specs/core54-html/}\n\n\\bibitem{xiao_nrf52840}\nSeeed Studio, \\textit{XIAO nRF52840 (Sense) Wiki}, 2023. \\\\\n\\texttt{https://wiki.seeedstudio.com/XIAO\\_BLE/}\n\n\\bibitem{lsm6ds3}\nSTMicroelectronics, \\textit{LSM6DS3TR-C Datasheet}, 2019. \\\\\n\\texttt{https://www.st.com/en/mems-and-sensors/lsm6ds3tr-c.html}\n\n\\bibitem{websocket_rfc}\nI. Fette, A. Melnikov, \\textit{RFC 6455: The WebSocket Protocol}, IETF, 2011. \\\\\n\\texttt{https://datatracker.ietf.org/doc/html/rfc6455}\n\n\\bibitem{docker_compose}\nDocker Inc., \\textit{Docker Compose Documentation}, 2024. \\\\\n\\texttt{https://docs.docker.com/compose/}\n\n\\end{thebibliography}\n\\end{document}",
    "app/components/SensorCard.tsx": "/**\n * @implements FA2, FA3, NF3\n */\nimport React, { useEffect } from 'react';\nimport { View, Text, StyleSheet } from 'react-native';\nimport Animated, {\n  useSharedValue, useAnimatedStyle,\n  withRepeat, withSequence, withTiming, withSpring,\n} from 'react-native-reanimated';\nimport { GlassCard } from '@/components/GlassCard';\nimport { PulseRing } from '@/components/PulseRing';\nimport { GradientButton } from '@/components/GradientButton';\nimport { Colors } from '@/constants/Colors';\nimport { ConnectionStatus } from '@/store';\n\ninterface Props {\n  status: ConnectionStatus;\n  deviceName: string | null;\n  onScan: () => void;\n  onDisconnect: () => void;\n}\n\nconst STATUS_COLOR: Record<ConnectionStatus, string> = {\n  idle: Colors.textMuted,\n  scanning: Colors.warning,\n  connecting: Colors.warning,\n  connected: Colors.connected,\n  disconnected: Colors.textSub,\n  error: Colors.error,\n};\n\nconst STATUS_LABEL: Record<ConnectionStatus, string> = {\n  idle: 'Kein Sensor',\n  scanning: 'Suche läuft...',\n  connecting: 'Verbinde...',\n  connected: 'Verbunden',\n  disconnected: 'Getrennt',\n  error: 'Fehler',\n};\n\nfunction StatusLabel({ status }: { status: ConnectionStatus }) {\n  const opacity = useSharedValue(0);\n  const x = useSharedValue(-6);\n\n  useEffect(() => {\n    opacity.value = withTiming(0, { duration: 0 });\n    x.value = -6;\n    const t = setTimeout(() => {\n      opacity.value = withTiming(1, { duration: 220 });\n      x.value = withSpring(0, { damping: 20, stiffness: 300 });\n    }, 10);\n    return () => clearTimeout(t);\n  }, [status]);\n\n  const style = useAnimatedStyle(() => ({\n    opacity: opacity.value,\n    transform: [{ translateX: x.value }],\n  }));\n\n  return (\n    <Animated.Text style={[styles.statusLabel, { color: STATUS_COLOR[status] }, style]}>\n      {STATUS_LABEL[status]}\n    </Animated.Text>\n  );\n}\n\nfunction ScanningDots({ color }: { color: string }) {\n  return (\n    <View style={styles.dots}>\n      {[0, 1, 2].map((i) => (\n        <BounceDot key={i} color={color} delay={i * 180} />\n      ))}\n    </View>\n  );\n}\n\nfunction BounceDot({ color, delay }: { color: string; delay: number }) {\n  const opacity = useSharedValue(0.2);\n\n  useEffect(() => {\n    const t = setTimeout(() => {\n      opacity.value = withRepeat(\n        withSequence(\n          withTiming(1, { duration: 500 }),\n          withTiming(0.2, { duration: 500 })\n        ),\n        -1\n      );\n    }, delay);\n    return () => clearTimeout(t);\n  }, []);\n\n  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));\n\n  return (\n    <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />\n  );\n}\n\nexport function SensorCard({ status, deviceName, onScan, onDisconnect }: Props) {\n  const isConnected = status === 'connected';\n  const isActive = status === 'scanning' || status === 'connecting';\n  const color = STATUS_COLOR[status];\n\n  return (\n    <GlassCard active={isConnected}>\n      <View style={styles.row}>\n        <PulseRing color={color} size={9} active={isConnected} />\n\n        <View style={styles.info}>\n          <Text style={styles.deviceName}>{deviceName ?? 'XIAO nRF52840'}</Text>\n          <StatusLabel status={status} />\n        </View>\n\n        {isConnected && (\n          <GradientButton label=\"Trennen\" variant=\"ghost\" onPress={onDisconnect} style={styles.btn} />\n        )}\n        {!isConnected && !isActive && (\n          <GradientButton label=\"Verbinden\" variant=\"primary\" onPress={onScan} style={styles.btn} />\n        )}\n        {isActive && <ScanningDots color={color} />}\n      </View>\n    </GlassCard>\n  );\n}\n\nconst styles = StyleSheet.create({\n  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },\n  info: { flex: 1, gap: 3 },\n  deviceName: { color: Colors.text, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },\n  statusLabel: { fontSize: 12, fontWeight: '600' },\n  btn: { flexShrink: 0 },\n  dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },\n  dot: { width: 5, height: 5, borderRadius: 2.5 },\n});\n"
  }
};