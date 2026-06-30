<!--
C4-Ebene: Component
Deployable: Nein
-->

# BLE-Streamer

Diese Komponente überträgt die erfassten 6-Achsen-Sensordaten (Beschleunigung und Rotation) in Echtzeit per Bluetooth Low Energy (BLE) an die Mobile App.

## C4-Architektur-Ebene
* **C4-Ebene:** Component
* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)

## Beschreibung
Der BLE-Streamer initialisiert den nRF52840-Bluetooth-Stack, stellt einen GATT-Service mit einer IMU-Characteristic bereit und sendet die gefilterten Sensor-Messwerte (Beschleunigung in X, Y, Z und Drehraten in X, Y, Z) als binären 24-Byte-Puffer (6 float-Werte) an verbundene Clients.

## Requirements

**FA2.5**: Das Gerät versendet die Daten an die App.
**FA2.5.1**: Aufbau und Aufrechterhaltung einer stabilen Bluetooth LE Verbindung.
**FA2.5.2**: Serialisierung und Übertragung der Sensordaten mit minimalem Overhead.

## Datenfluss

```mermaid
flowchart LR
    IMU[Sensor-Rohwerte] -->|ax, ay, az, gx, gy, gz| Streamer[BLE-Streamer Component]
    Streamer -->|GATT Notification (24 Bytes)| App[Mobile App useBLE Hook]
```

### GATT Profile & UUIDs
* **Service-UUID:** `12345678-1234-1234-1234-123456789012`
* **Characteristic-UUID:** `12345678-1234-1234-1234-123456789013` (BLERead | BLENotify)
* **Paketformat:** 24 Bytes (6 float-Werte, IEEE 754 float32, little-endian):
  `[accelX, accelY, accelZ, gyroX, gyroY, gyroZ]`
