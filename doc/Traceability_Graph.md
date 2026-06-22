# Traceability- & System-Hierarchie (MoveLink)

Dieses Dokument visualisiert und beschreibt die logische Hierarchie von den Benutzeranforderungen (Use Cases) über die Systemanforderungen (Requirements) bis hin zu den C4-Containern, deren spezifischen Anforderungen und den implementierten Komponenten.

---

## 1. Traceability-Graph

Der folgende Graph zeigt die durchgängige Traceability:
* **Rot (Use Cases)**: Aus Szenarien abgeleitete Benutzerinteraktionen.
* **Blau (Systemanforderungen)**: Abstrakte Anforderungen aus [Requirements.md](file:///c:/Users/erlin/repo/movelink/doc/Requirements.md).
* **Grün (C4-Container)**: Eigenständige deploybare Einheiten (C4-Ebene 2).
* **Gelb (Container-Anforderungen)**: Detaillierte Anforderungen innerhalb eines Containers.
* **Grau (C4-Komponenten)**: Konkrete Implementierungsbausteine (C4-Ebene 3), die Aufgaben erfüllen.

```mermaid
flowchart TD
    %% Styling
    classDef usecase fill:#ffe5d9,stroke:#cc3300,stroke-width:2px,color:#000;
    classDef req fill:#d1e8ff,stroke:#0066cc,stroke-width:2px,color:#000;
    classDef container fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000;
    classDef subreq fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000;
    classDef component fill:#e2e3e5,stroke:#383d41,stroke-width:2px,color:#000;

    subgraph Use_Cases [1. Anwendungsfälle (Use Cases)]
        UC1["UC-1: Trainingsgerät verbinden"]:::usecase
        UC2["UC-2: Echtzeit-Training überwachen"]:::usecase
        UC3["UC-3: Trainingsdaten einsehen"]:::usecase
    end

    subgraph System_Requirements [2. Systemanforderungen (doc/Requirements.md)]
        FA1["FA1: Applikation (Steuerung)"]:::req
        FA2["FA2: Trainingsgerät (Bewegungsinput)"]:::req
        FA3["FA3: Datenbank (Datenspeicherung)"]:::req
    end

    subgraph Containers [3. C4-Container]
        AppContainer["Mobile App Container\n(app/architecture.md)"]:::container
        EmbeddedContainer["Embedded Firmware Container\n(embedded/architecture.md)"]:::container
        DbContainer["Database / Backend Container\n(database/architecture.md)"]:::container
    end

    subgraph Container_Requirements [4. Container-Anforderungen]
        %% App Requirements
        FA1_1["FA1.1: Navigation & Menüs"]:::subreq
        FA1_2["FA1.2: Geräte-Scanning"]:::subreq
        FA1_3["FA1.3: BLE-Verbindungsaufbau"]:::subreq
        FA1_4["FA1.4: Übungs-Demonstration"]:::subreq
        FA1_5["FA1.5: Echtzeit-Visualisierung"]:::subreq
        FA1_6["FA1.6: Historische Analyse"]:::subreq
        FA1_7["FA1.7: Profil & Authentifizierung"]:::subreq

        %% Embedded Requirements
        FA2_1["FA2.1: Sensordatenerfassung"]:::subreq
        FA2_2["FA2.2: Bewegungsklassifizierung"]:::subreq
        FA2_3["FA2.3: Bewegungsbewertung"]:::subreq
        FA2_4["FA2.4: LED-Statusanzeige"]:::subreq
        FA2_5["FA2.5: BLE-Streaming"]:::subreq
        FA2_6["FA2.6: Physisches Gehäuse"]:::subreq

        %% DB Requirements
        FA3_1["FA3.1: Profil- & Authdaten-Speicherung"]:::subreq
        FA3_2["FA3.2: Trainingsdaten-Persistenz"]:::subreq
    end

    subgraph Components [5. C4-Komponenten]
        %% App Components
        SideNav["SideNav (UI-Steuerung)"]:::component
        SensorCard["SensorCard (BLE UI/Pairing)"]:::component
        BLEHook["useBLE (BLE-Hook)"]:::component
        ExerciseDemo["ExerciseDemo (Lottie-Demos)"]:::component
        LiveChart["LiveChart (Echtzeit-Graphen)"]:::component
        SessionCard["SessionCard (Historische Daten)"]:::component
        ProfileCard["ProfileCard (Nutzerprofil-UI)"]:::component

        %% Embedded Components
        SensLoop["Sensordatenerfassung (Loop)"]:::component
        InfEngine["Inferenz-Engine (Edge Impulse)"]:::component
        LEDCtrl["LED- & Display-Controller"]:::component
        BLEStreamer["BLE-Streamer (GATT)"]:::component
        Gehause["Gehäuse (Physischer Schutz)"]:::component

        %% DB Components
        AuthService["ProfileController / Auth Service"]:::component
        SessionStore["Trainings-DB / Session Store"]:::component
    end

    %% Relations: Use Cases -> System Requirements
    UC1 --> FA1
    UC1 --> FA2
    UC1 --> FA3
    
    UC2 --> FA1
    UC2 --> FA2
    
    UC3 --> FA1
    UC3 --> FA3

    %% Relations: System Requirements -> Containers
    FA1 --> AppContainer
    FA2 --> EmbeddedContainer
    FA3 --> DbContainer

    %% Relations: Containers -> Container Requirements
    AppContainer --> FA1_1
    AppContainer --> FA1_2
    AppContainer --> FA1_3
    AppContainer --> FA1_4
    AppContainer --> FA1_5
    AppContainer --> FA1_6
    AppContainer --> FA1_7

    EmbeddedContainer --> FA2_1
    EmbeddedContainer --> FA2_2
    EmbeddedContainer --> FA2_3
    EmbeddedContainer --> FA2_4
    EmbeddedContainer --> FA2_5
    EmbeddedContainer --> FA2_6

    DbContainer --> FA3_1
    DbContainer --> FA3_2

    %% Relations: Container Requirements -> Components
    FA1_1 --> SideNav
    FA1_2 --> SensorCard
    FA1_3 --> SensorCard
    FA1_3 --> BLEHook
    FA1_4 --> ExerciseDemo
    FA1_5 --> LiveChart
    FA1_6 --> SessionCard
    FA1_7 --> ProfileCard

    FA2_1 --> SensLoop
    FA2_2 --> InfEngine
    FA2_3 --> InfEngine
    FA2_4 --> LEDCtrl
    FA2_5 --> BLEStreamer
    FA2_6 --> Gehause

    FA3_1 --> AuthService
    FA3_2 --> SessionStore

    %% Cross-container and component interaction paths (dashed)
    BLEStreamer -.->|BLE-Datenstrom| BLEHook
    ProfileCard -.->|REST/Auth Query| AuthService
    SessionCard -.->|REST/Session Query| SessionStore
```

---

## 2. Detaillierte Hierarchie-Beschreibung

### 2.1 Ebene 1: Use Cases & Ebene 2: Systemanforderungen (Abstrakt)
Aus den Szenarien in [UseCases.md](file:///c:/Users/erlin/repo/movelink/doc/UseCases.md) ergeben sich die abstrakten Hauptanforderungen in [Requirements.md](file:///c:/Users/erlin/repo/movelink/doc/Requirements.md):
- **UC-1, UC-2, UC-3** -> **FA1 (Applikation)**: Dient als zentrale Steuerungs- und Eingabeschnittstelle.
- **UC-1, UC-2** -> **FA2 (Trainingsgerät / Embedded)**: Erfasst die physischen Bewegungen des Nutzers.
- **UC-1, UC-3** -> **FA3 (Datenbank)**: Speichert Benutzerprofile und Trainingsdaten persistent.

### 2.2 Ebene 3 & 4: Container-Spezifische Anforderungen
Jedes abstrakte System-Requirement wird durch einen eigenen C4-Container realisiert, welcher die Anforderung in konkrete Teil-Anforderungen unterteilt:

#### A. Mobile App Container (FA1) -> [app/architecture.md](file:///c:/Users/erlin/repo/movelink/app/architecture.md)
* **FA1.1**: Bereitstellung einer Navigationsstruktur für Geräte, Trainings und Verlauf.
* **FA1.2**: Scanning nach verfügbaren Bluetooth-Sensorgeräten.
* **FA1.3**: Stabile Bluetooth-Verbindung und Datenempfang.
* **FA1.4**: Grafische Demonstration der Übungen (z. B. via Lottie-Animation).
* **FA1.5**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Drehraten.
* **FA1.6**: Anzeige historischer Trainingsstatistiken.
* **FA1.7**: Anzeige von Benutzerprofilen und Auth-Status.

#### B. Embedded Firmware Container (FA2) -> [embedded/architecture.md](file:///c:/Users/erlin/repo/movelink/embedded/architecture.md)
* **FA2.1**: Sensor-Rohdatenerfassung (LSM6DS3 @ 50Hz).
* **FA2.2**: Lokale Bewegungserkennung & Übungsklassifizierung (z. B. Bizeps-Curl).
* **FA2.3**: Lokale Bewegungsbewertung (sauber vs. fehlerhaft).
* **FA2.4**: Visuelle Status- und Feedbackausgabe über RGB-LEDs / OLED-Display.
* **FA2.5**: Datenstrom-Übertragung als binäres Array via BLE Characteristics.
* **FA2.6**: Physisches Schutzgehäuse mit Armbandbefestigung.

#### C. Database / Backend Container (FA3) -> [database/architecture.md](file:///c:/Users/erlin/repo/movelink/database/architecture.md)
* **FA3.1**: Speicherung und Verifizierung von Benutzerkonten & Auth-Tokens.
* **FA3.2**: Persistente Speicherung aufgezeichneter Trainingseinheiten (Übungstyp, Wiederholungen, Qualität).

### 2.3 Ebene 5: Komponenten (Füllen Aufgaben aus)
Die Komponenten sind die tatsächlichen Software-Module und physischen Teile, die diese Container-Anforderungen implementieren:
* **SideNav.tsx**: Erfüllt **FA1.1** (Navigation).
* **SensorCard.tsx**: Erfüllt **FA1.2** (Geräte-Scanning) & **FA1.3** (Verbindungsaufbau).
* **useBLE.ts**: Erfüllt **FA1.3** (Bluetooth-Kommunikation und automatischer Reconnect).
* **ExerciseDemo.tsx**: Erfüllt **FA1.4** (Lottie-Demos).
* **LiveChart.tsx**: Erfüllt **FA1.5** (Echtzeit-Kurven).
* **SessionCard.tsx**: Erfüllt **FA1.6** (Historie).
* **ProfileCard**: Erfüllt **FA1.7** (Profil-UI).
* **Sensordatenerfassung (Loop)**: Erfüllt **FA2.1** (50Hz I2C-Abfrage in `Executable.ino`).
* **Inferenz-Engine (Edge Impulse)**: Erfüllt **FA2.2** & **FA2.3** (CNN-Klassifizierung in `Executable.ino`).
* **LED- & Display-Controller**: Erfüllt **FA2.4** (Feedbackausgabe).
* **BLE-Streamer**: Erfüllt **FA2.5** (nRF52840 BLE GATT Service).
* **Gehäuse**: Erfüllt **FA2.6** (Physisches 3D-Druck-Gehäuse aus `Gehause.py`).
* **Auth- & Profilservice**: Erfüllt **FA3.1** (REST-Endpoints).
* **Trainings-DB / Session Store**: Erfüllt **FA3.2** (Persistenz-Layer).
