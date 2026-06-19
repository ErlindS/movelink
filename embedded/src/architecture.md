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
