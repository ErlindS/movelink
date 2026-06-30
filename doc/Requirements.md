# Systemanforderungen (Requirements)

Dieses Dokument definiert die funktionalen und nicht-funktionalen Anforderungen sowie die Randbedingungen des MoveLink-Systems.

---

## Funktionale Anforderungen //Was für Instanzen existieren denn eigentlich.

**FA1**: Es wird eine Applikation angeboten, welche als Input für die Steuerung für den Benutzer dient. (UC-1, UC-2, UC-3)

**FA2**: Zu dem System wird ein Trainingsgerät benötigt, welche als Input für der Bewegungen des Benutzers dient. Dieses Gerät gibt die Sensorwerte als auch die Art der Bewegung zurück. (UC-1, UC-2)

**FA3**: Es wird ein Ort benötigt, welche die Daten des Benutzers speichert. (UC-1, UC-3)

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
Hardware / Gerät

| Kriterium         | Vorgefertigtes Gerät (z. B. Fitbit)                     | Hybrid (Seeed XIAO nRF52840)                                                                                       | Eigene Lösung (Custom PCB)                                                                       |
|:------------------|:--------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------|
| **Vorteile (+)**  | • Klein und ausgereift                                  | • Kostengünstig<br>• Integrierte IMU & BLE                                                                         | • Maximale Kontrolle über Formfaktor und Sensoren                                                |
| **Nachteile (-)** | • Teuer<br>• Schlecht erweiterbar durch andere Sensoren | • Gehäuse muss selbst konstruiert/gedruckt werden<br>• Höherer Integrationsaufwand als fertiges Konsumentenprodukt | • Sehr hohe Entwicklungskosten und Time-to-Market<br>• Komplexes PCB-Design und Fertigungsrisiko |

**Entscheidung:** XIAO seed NRF52840

---

App-Entwicklung

| Kriterium         | Cross-Platform (Ionic / Flutter)                                                                            | Hybrid (React Native)                                                                                                             | Native (iOS Swift / Android Java)                                                                                  |
|:------------------|:------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------|
| **Vorteile (+)**  | • Schnelles Prototyping und einfache Web-Technologien                                                       | • Hohe Code-Wiederverwendbarkeit<br>• Schnelle UI-Iterationen                                                                     | • Optimale Bluetooth-Leistung<br>• Direkter API-Zugriff                                                            |
| **Nachteile (-)** | • Performance-Einbußen bei 50Hz Echtzeit-Diagrammen<br>• Komplexere native Bluetooth-Anbindung über Plugins | • BLE-Bibliotheken von Drittanbietern erfordern Wartung<br>• Performance-Overhead durch JS-Bridge bei kontinuierlichem Datenstrom | • Hohe Entwicklungskosten durch zwei separate Codebases<br>• Längere Time-to-Market und aufwendige doppelte Pflege |

**Entscheidung:** Hybrid (React Native)

---

Bewegungsauswertung

| Kriterium         | Auf dem Gerät (Edge AI)                                                                            | Komplett in der App                                                                                   | Hybrid                                                                                                   |
|:------------------|:---------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------|
| **Vorteile (+)**  | • Per Edge Impulse einfach umzusetzende Inferenz                                                   | • Genug Rechenleistung für komplexe Deep-Learning-Modelle                                             | • MCU filtert/komprimiert Daten<br>• App übernimmt Inferenz                                              |
| **Nachteile (-)** | • Begrenzte Speicher- und Rechenkapazitäten der MCU<br>• Modell-Updates erfordern Firmware-Flashen | • Hohe BLE-Datenrate (50Hz Rohdatenstrom) erforderlich<br>• Erhöhter Akkuverbrauch auf dem Mobilgerät | • Höhere Systemkomplexität durch geteilte Logik<br>• Komplexeres Debugging bei Übertragungsverzögerungen |

**Entscheidung:** Auf dem Gerät (Edge-Inferenz)  
**Begründung:** Es gibt genügend Ressourcen, um ein kleines ML-Modell auf dem Mikrocontroller zu deployen und dafür zu trainieren.

Datenspeicherung

| Kriterium         | Lokal                                                                | Datenbank                                                                                      | Hybrid                                                  |
|:------------------|:---------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------|:--------------------------------------------------------|
| **Vorteile (+)**  | • Einfach und schnell umzusetzen<br>• Keine komplexen Abhängigkeiten | • Skaliert gut                                                                                 | • MCU filtert/komprimiert Daten; App übernimmt Inferenz |
| **Nachteile (-)** | • Kann schlecht skalieren<br>• Kein Online-Dienst                    | • Höhere Systemkomplexität durch geteilte Logik<br>• Erhöhter Akkuverbrauch auf dem Mobilgerät | • Komplexeres Debugging bei Übertragungsverzögerungen   |
