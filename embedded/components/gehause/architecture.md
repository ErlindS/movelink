<!--
C4-Ebene: Component
Deployable: Nein
-->

# Gehäuse (Enclosure)

Diese Komponente beschreibt das physische, schützende 3D-Druck-Gehäuse des Sensors.

## C4-Architektur-Ebene
* **C4-Ebene:** Component
* **Deployable:** Nein (Physische Schutzhülle, keine Software-Ausführung)

## Beschreibung
Das Gehäuse umschließt den XIAO-Mikrocontroller sowie die Peripherie (Display, Batterie). Es bietet Befestigungslaschen für ein standardmäßiges 20-mm-Sportarmband, um den Sensor stabil am Arm des Nutzers zu fixieren.

### Technische & Physische Parameter
- **Gesamtmaße:** 48 mm (Länge) x 24 mm (Breite) x 16 mm (Höhe)
- **Außenwandstärke:** 2.0 mm
- **Schließmechanismus:** Schnapp-Deckel (Lippe & Snap Bumps mit 0.2 mm Toleranz)
- **Komfort:** Abgerundete Ecken (Bevel-Breite 1.5 mm), um Druckstellen beim Tragen zu vermeiden.
- **Aussparungen:** Integrierter USB-C-Port zur Programmierung und Akku-Ladung.

## Implementierung & Traceability
- **Implementiert in:** [Gehause.py](file:///c:/Users/erlin/repo/movelink/embedded/src/Gehause.py) (Blender Python API)
- **Erfüllt Anforderungen:**
  - **R2: Physisches Gehäuse**: Stabile Fixierung des Sensors am Arm, Schutz gegen Schweiß und Erschütterungen.
  - **Sollte beinhalten**:
  - Runde Ecken
  - Halterung Für USB-C
  - Halterung für an/aus schalter
  - Die Maße sollten so gewählt sein, dass nicht wackelt
  - Verschlussmöglichkeit
  - Halterung für G-Hook

## Schnittstellen
Das Gehäuse hat keine softwareseitigen Verbindungen, interagiert aber mechanisch mit:
- **Mikrocontroller (XIAO nRF52840 Sense)**: Durch Passform und Aussparungen fixiert.
- **Armband (20mm)**: Wird durch die integrierten Lug-Slots gefädelt.
