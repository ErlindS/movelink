<!--
C4-Ebene: Component
Deployable: Nein
-->

# Inferenz-Engine (Edge Impulse)

Diese Komponente klassifiziert Übungsausführungen in Echtzeit direkt auf dem Mikrocontroller (Edge Computing).

## C4-Architektur-Ebene
* **C4-Ebene:** Component
* **Deployable:** Nein (Läuft als Teil des Sensor Firmware Containers)

## Beschreibung
Die Inferenz-Engine führt ein CNN-Klassifikationsmodell aus, das über Edge Impulse trainiert und als Arduino-Bibliothek in die Firmware integriert wurde. Es analysiert die 6-Achsen-Bewegungsdaten auf spezifische Übungsqualitäten und Fehlerbilder.

## Requirements

**FA2.2**: Das Gerät erkennt, was für eine Bewegung ausgeführt worden ist.
**FA2.3**: Das Gerät bewertet die Ausführung der Bewegung.

## Datenfluss

```mermaid
flowchart TD
    DSP[DSP Puffer (6 Achsen)] -->|run_classifier| Model[CNN Inferenzmodell]
    Model -->|Wahrscheinlichkeiten| Eval[Klassenauswertung]
    Eval -->|Bester Treffer + Score| Output[Feedback & PC-JSON-Stream]
```

## Technische Details
- **Modelltyp:** Convolutional Neural Network (CNN)
- **Erkannte Klassen:**
  - `idle`: Keine Übungsausführung / Ruhezustand.
  - `curl_sauber`: Korrekt ausgeführter Bizeps-Curl.
  - `fehler_rotation`: Fehlerhafte Ausführung durch Rotation des Handgelenks.
  - `fehler_ellbogen`: Fehlerhafte Ausführung durch Bewegung des Ellbogens.
- **Anomalieerkennung:** Optionaler K-Means-Clustering-Block zur Erkennung unbekannter Bewegungen.
