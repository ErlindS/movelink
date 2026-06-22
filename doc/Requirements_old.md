# Systemanforderungen (Requirements)

Dieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.

---

## Funktionale Anforderungen

**FA1**: Dashboard und Navigation
Das System muss eine Navigationsstruktur (Reiter/Menü) für Hardwaregeräte, Trainings und vergangene Trainingseinheiten bereitstellen. *(Bezug: UC-1, UC-2, UC-3)*

**FA2**: Geräte-Scanning
Das System muss eine Liste verfügbarer Bluetooth-Hardwaregeräte anzeigen und den aktuellen Verbindungsstatus visualisieren. *(Bezug: UC-1)*

**FA3**: Verbindungsaufbau
Das System muss in der Lage sein, eine stabile Bluetooth-Verbindung mit dem IMU-Sensor herzustellen. *(Bezug: UC-1)*

**FA4**: Trainings-Detailansicht
Das System muss eine detaillierte Ansicht für ein ausgewähltes Training anzeigen. *(Bezug: UC-2)*

**FA5**: Datenstrom-Verarbeitung
Das System muss kontinuierliche Bewegungsdatenströme vom Sensor empfangen, filtern und verarbeiten können. *(Bezug: UC-2)*

**FA6**: Echtzeit-Visualisierung
Das System muss die empfangenen Sensordaten und Bewegungen in Echtzeit visualisieren. *(Bezug: UC-2)*

**FA7**: Historische Analyse
Das System muss historische Bewegungsdaten grafisch und statistisch anzeigen können. *(Bezug: UC-3)*

**FA8**: Übungs-Demonstration
Das System muss eine grafische Demonstration der auszuführenden Übungsbewegung anzeigen, sobald das Training gestartet wird. *(Bezug: UC-2)*

**FA9**: Biofeedback und Auswertung
Das System muss den Bewegungsfortschritt in Echtzeit visualisieren, mit der Zielvorgabe vergleichen und bei korrekter Durchführung positives Feedback (visuell und haptisch) ausgeben. *(Bezug: UC-2)*

---

## Nicht-funktionale Anforderungen (Muss-Kriterien)

**NF1**: Latenz
Die End-to-End-Latenz von der physischen Sensorbewegung bis zur visuellen Darstellung in der App muss ≤ 100 ms sein.

**NF2**: Zuverlässigkeit und Reconnect
Bei Verbindungsabbrüchen muss die App den Nutzer umgehend benachrichtigen und automatische Wiederverbindungsversuche (Reconnect) starten.

**NF3**: Benutzbarkeit (Usability)
Das Bluetooth-Pairing mit dem Sensor darf maximal zwei manuelle Interaktionen erfordern.

---

## Randbedingungen

**R1**: Plattform-Kompatibilität
Die mobile Applikation muss nativ oder als hybride App auf Android-Geräten lauffähig sein.

**R2**: Physisches Gehäuse
Für das Trainingsgeräte braucht es einen Sensor. Dieser Sensor sollte bestenfalls nicht lose auf der Haut getragen werden
