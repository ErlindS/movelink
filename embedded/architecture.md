# MoveLink Embedded Firmware - Container-Architektur

Dieses Dokument beschreibt die Embedded Sensor-Firmware als eigenständige, deploybare Einheit im C4-Modell.

## C4-Architektur-Ebene
* **C4-Ebene:** Container
* **Deployable:** Ja
* **Deployment-Artefakt:** Binär-Firmware (flashed via USB/Serial)
* **Technologie-Stack:** Arduino C/C++, LSM6DS3 IMU Library, Edge Impulse SDK, Bluetooth Low Energy

## Beschreibung
Die Sensor-Firmware läuft auf dem XIAO nRF52840 Sense Controller. Sie erfasst Beschleunigungs- und Rotationsdaten über den integrierten LSM6DS3-Sensor mit einer festen Abtastrate (50Hz), wendet Signalfilterungen zur Rauschunterdrückung an und streamt die Datenpakete als binäres Array via BLE Characteristics an die Mobile App. Alternativ führt sie Edge-Impulse-Inferenzmodelle direkt auf dem Mikrocontroller aus, um Trainingsübungen (z.B. Bizeps-Curls) lokal zu klassifizieren und Fehler über die integrierten RGB-LEDs anzuzeigen.

## Komponenten in diesem Container
Die Sensor-Firmware besteht aus folgenden logischen Komponenten:
1. **[Sensordatenerfassung (Loop)](file:///c:/Users/erlin/repo/movelink/embedded/components/sensordatenerfassung/architecture.md)**: Liest kontinuierlich Beschleunigung (X, Y, Z) und Gyroskop (X, Y, Z). (Erfüllt: FA5, NF1)
2. **[Inferenz-Engine (Edge Impulse)](file:///c:/Users/erlin/repo/movelink/embedded/components/inferenz_engine/architecture.md)**: Klassifiziert Übungsausführungen lokal auf dem Chip. (Erfüllt: FA5, FA9)
3. **[LED- & Display-Controller](file:///c:/Users/erlin/repo/movelink/embedded/components/led_display_controller/architecture.md)**: Bietet direktes visuelles Feedback an den Nutzer bei Fehlern. (Erfüllt: FA9)
4. **[Gehäuse](file:///c:/Users/erlin/repo/movelink/embedded/components/gehause/architecture.md)**: Bietet physischen Schutz, sodass das Tragen erleichtert wird. (Erfüllt: R2)

## Abwägungen
- **Lokale Auswertung vs. Cloud-Streaming**: Das Ausführen der Inferenz-Engine direkt auf dem Xiao-Controller minimiert die Latenz (NF1) und spart Bandbreite bei der Funkübertragung.
- **Energiebedarf**: OLED-Display und kontinuierliche Sensordatenerfassung verbrauchen signifikant Energie, weshalb Akkulaufzeiten durch Cooldown-Zeiten und Schlafmodi im Idle optimiert werden müssen.
