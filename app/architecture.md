<!--
C4-Ebene: Container
Deployable: Ja
-->

# MoveLink Mobile App - Container-Architektur

Dieses Dokument beschreibt die Mobile App als eigenständige, deploybare Einheit im C4-Modell.

## C4-Architektur-Ebene
* **C4-Ebene:** Container
* **Deployable:** Ja
* **Deployment-Artefakt:** Android Package (.apk) / iOS IPA
* **Technologie-Stack:** React Native, Expo, TypeScript, Zustand, BLE PLX, AsyncStorage

## Beschreibung
Die MoveLink Mobile App ist die primäre Benutzerschnittstelle des Systems. Sie läuft auf Android- und iOS-Endgeräten und verbindet sich über Bluetooth Low Energy (BLE) mit dem embedded Sensor-Gerät, um Bewegungsdaten in Echtzeit zu erfassen, zu visualisieren und zur persistenten Speicherung lokal auf dem Gerät zu speichern.

## Requirements

**FA1.1**: Die App bietet eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Einheiten.
**FA1.2**: Die App ermöglicht das Scannen nach verfügbaren Bluetooth-Sensorgeräten.
**FA1.3**: Die App baut eine stabile Bluetooth-Verbindung zum Sensor auf.
**FA1.4**: Die App demonstriert grafisch die auszuführende Übungsausführung (z. B. via Lottie-Animation).
**FA1.5**: Die App visualisiert die empfangenen Sensordaten und den Übungsfortschritt in Echtzeit.
**FA1.6**: Die App zeigt historische Trainingseinheiten grafisch und statistisch an.
**FA1.7**: Das System speichert aufgezeichnete Trainingseinheiten (Übungstyp, Wiederholungen, Qualität) persistent zur historischen Auswertung.

## Datenfluss

```mermaid
flowchart LR
    %% Stil-Definitionen für Übersichtlichkeit
    classDef hardware fill:#f5f5f5,stroke:#666,stroke-width:2px;
    classDef process fill:#d1e8ff,stroke:#0066cc,stroke-width:1px;
    classDef external fill:#ffe5d9,stroke:#cc3300,stroke-width:1px;

    User[Trainierender]:::external
    App[React Native App Container]:::process
    Sensor[Sensor Firmware Container]:::external

    User -->|Interagiert mit| App
    App <-->|BLE Bluetooth (Sensordaten / Status)| Sensor
```

## Komponenten in diesem Container
Die App enthält mehrere Komponenten (C4-Komponenten-Ebene):
1. **[SideNav](file:///c:/Users/erlin/repo/movelink/app/components/side_nav/architecture.md)**: Navigationskomponente für die App-Steuerung. (Erfüllt: FA1.1, FA1.1.1)
2. **[SensorCard](file:///c:/Users/erlin/repo/movelink/app/components/sensor_card/architecture.md)**: Verwaltung der BLE-Geräteverbindung und Pairing. (Erfüllt: FA1.2, FA1.3, NF3)
3. **[LiveChart](file:///c:/Users/erlin/repo/movelink/app/components/live_chart/architecture.md)**: Echtzeit-Visualisierung der IMU-Beschleunigungs- und Gyroskopwerte. (Erfüllt: FA1.5)
4. **[SessionCard](file:///c:/Users/erlin/repo/movelink/app/components/session_card/architecture.md)**: Visualisierung historischer Trainingseinheiten. (Erfüllt: FA1.6)
5. **[BLE-Hook (useBLE)](file:///c:/Users/erlin/repo/movelink/app/hooks/useBLE.ts)**: Kapselt die Bluetooth-Gerätekommunikation und den Reconnect. (Erfüllt: FA1.3, NF2)
6. **[ProfileCard](file:///c:/Users/erlin/repo/movelink/app/components/ProfileCard/architecture.md)**: Visualisierung der Benutzerprofildetails. (Erfüllt: FA1.7)
7. **[Local Store](file:///c:/Users/erlin/repo/movelink/app/store/index.ts)**: Verwaltet den App-Zustand und persistiert die Trainingsdaten lokal über AsyncStorage. (Erfüllt: FA1.7, FA3)

