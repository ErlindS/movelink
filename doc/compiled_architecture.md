# Systemarchitektur & Datenfluss Dokumentation

*Automatisch generiert am 19.6.2026, 21:31:58*

> Diese Dokumentation wurde automatisch aus den dezentralen `architecture.md` Dateien des Projekts zusammengeführt.

---

## Komponente: components

**Quelle:** [`app\components\architecture.md`](./app/components/architecture.md)

<!-- START COMPONENT DOC -->
# App Komponenten

Diese Verzeichnis enthält die UI-Komponenten der Mobile-/Web-Anwendung (z.B. Visualisierungen, Charts, Navigation).

## Datenfluss in UI-Komponenten

Die Komponenten erhalten Daten über Props oder den globalen Store und rendern diese reaktiv.

```mermaid
flowchart LR
    Store[Globaler Store] -->|Reaktive Updates| SensorCard[SensorCard / LiveChart]
    SensorCard -->|Klick / Aktion| Actions[Store Actions]
    Actions -->|Dispatch| Store
```

- **LiveChart**: Rendert eintreffende Datenpunkte in Echtzeit.
- **SensorCard**: Zeigt den aktuellen Status und Verbindungszustand von Bluetooth-Geräten.
<!-- END COMPONENT DOC -->

---

## Komponente: ProfileCard

**Quelle:** [`app\components\ProfileCard\architecture.md`](./app/components/ProfileCard/architecture.md)

<!-- START COMPONENT DOC -->
# Profil-Karte (ProfileCard)

Diese Komponente zeigt die Profildetails des angemeldeten Benutzers an.

## Datenfluss
```mermaid
flowchart LR
    JWT[Authentifizierungs-Token] -->|1. User-ID auslesen| Controller[ProfileController]
    Controller -->|2. Query| DB[(Datenbank)]
    DB -->|3. Rohdaten| Controller
    Controller -->|4. Bereinigtes Profil DTO| Client[ProfileCard UI]
```
<!-- END COMPONENT DOC -->

---

## Komponente: src

**Quelle:** [`embedded\src\architecture.md`](./embedded/src/architecture.md)

<!-- START COMPONENT DOC -->
# Embedded Sensor-Firmware

Die Firmware liest Sensorwerte aus und überträgt diese über Bluetooth Low Energy (BLE) an die App.

## Datenfluss Firmware

```mermaid
flowchart TD
    Sensor[MPU6050 Beschleunigungssensor] -->|I2C Rohdaten| Arduino[Arduino / ESP32 Controller]
    Arduino -->|Signalfilterung & Skalierung| BLE[Bluetooth Low Energy Characteristic]
    BLE -->|Notifikationen / Byte-Array| App[Mobile App]
```

- **Sensordatenerfassung**: Erfolgt in einer festen Frequenz (z.B. 50Hz).
- **Filterung**: Tiefpassfilter zur Rauschminderung auf dem Mikrocontroller.
- **BLE-Transfer**: Effiziente Übertragung als binäres Datenpaket.
<!-- END COMPONENT DOC -->

---

