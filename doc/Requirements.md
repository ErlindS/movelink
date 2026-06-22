# Systemanforderungen (Requirements)

Dieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.

---

## Funktionale Anforderungen //Was für Instanzen existieren denn eigentlich.

**UC1**, **UC2**, **UC3** -> **FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient.

**UC1**, **UC2** -> **FA2**: Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient.

**UC1**, **UC3** -> **FA3**: Es wird eine Datenbank benötigt, welche die Daten des Benutzers speichert.

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
