# Systemanforderungen (Requirements)

Dieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.

---

## Funktionale Anforderungen //Was für Instanzen existieren denn eigentlich.

**FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)

**FA2**: Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient. Dieses Gerät gibt die Sensorwerte als auch die Art der Bewegung zurück. (UC-1, UC-2)

**FA3**: Es wird eine Datenbank benötigt, welche die Daten des Benutzers speichert. (UC-1, UC-3)

---

## Nicht-funktionale Anforderungen

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


## Abwägungen

App:
| vorgefertigtes Gerät (Fitbit) | Hybride () | Hybrid |
|----------|----------|----------|
| + Klein und ausgereift    | Cell 2   | Cell 3   |
| - Teuer    | Cell 5   | Cell 6   |
| - schlecht erweiterbar durch andere Sensoren    | Cell 8   | Cell 9   |


Hardware:
| vorgefertigtes Gerät (Fitbit) | Hybride () | Hybrid |
|----------|----------|----------|
| + Klein und ausgereift    | Cell 2   | Cell 3   |
| - Teuer    | Cell 5   | Cell 6   |
| - schlecht erweiterbar durch andere Sensoren    | Cell 8   | Cell 9   |


Bewegungsauswertung:
Die Bewertung

| Column 1 | Komplett in der App | Hybrid |
|----------|----------|----------|
| Row 1    | Cell 2   | Cell 3   |
| Row 2    | Cell 5   | Cell 6   |
| Row 3    | Cell 8   | Cell 9   |