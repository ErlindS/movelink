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

Hardware/Gerät:
| vorgefertigtes Gerät (Fitbit) | Hybrid (XIAO seed NRF52840) | Eigene Lösung (PCB) |
|----------|----------|----------|
| + Klein und ausgereift    | + Kostengünstig, integrierte IMU & BLE    | + Maximale Kontrolle über Formfaktor und Sensoren    |
| - Teuer    | - Gehäuse muss selbst konstruiert/gedruckt werden    | - Sehr hohe Entwicklungskosten und Time-to-Market    |
| - Schlecht erweiterbar durch andere Sensoren    | - Höherer Integrationsaufwand als fertiges Konsumentenprodukt    | - Komplexes PCB-Design und Fertigungsrisiko    |

Entscheidung: XIAO seed NRF52840


App:
| Ionic (Flutter)  | Hybrid (React Native) | Native IOS Swift/Android Java |
|----------|----------|----------|
| + Schnelles Prototyping und einfache Web-Technologien    | + Hohe Code-Wiederverwendbarkeit und schnelle UI-Iterationen    | + Optimale Bluetooth-Leistung und direkter API-Zugriff    |
| - Performance-Einbußen bei 50Hz Echtzeit-Diagrammen    | - BLE-Bibliotheken von Drittanbietern erfordern Wartung    | - Hohe Entwicklungskosten durch zwei separate Codebases    |
| - Komplexere native Bluetooth-Anbindung über Plugins    | - Performance-Overhead durch JS-Bridge bei kontinuierlichem Datenstrom    | - Längere Time-to-Market und aufwendige doppelte Pflege    |

Entscheidung: Hybrid (React Native)

Bewegungsauswertung:
Die Bewertung

| Auf dem Gerät | Komplett in der App | Hybrid |
|----------|----------|----------|
| + Per Edge Impulse einfach umzusetzende Inferenz    | + Genug Rechenleistung für komplexe Deep-Learning-Modelle    | + MCU filtert/komprimiert Daten; App übernimmt Inferenz    |
| - Begrenzte Speicher- und Rechenkapazitäten der MCU    | - Hohe BLE-Datenrate (50Hz Rohdatenstrom) erforderlich    | - Höhere Systemkomplexität durch geteilte Logik    |
| - Modell-Updates erfordern Firmware-Flashen    | - Erhöhter Akkuverbrauch auf dem Mobilgerät    | - Komplexeres Debugging bei Übertragungsverzögerungen    |

Entscheidung: Auf dem Gerät (Edge-Inferenz)