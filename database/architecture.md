<!--
C4-Ebene: Container
Deployable: Ja
-->

# MoveLink Database & Backend - Container-Architektur

Dieses Dokument beschreibt die Datenbank und den Backend-Service als eigenständigen Container im C4-Modell.

## C4-Architektur-Ebene
* **C4-Ebene:** Container
* **Deployable:** Ja
* **Deployment-Artefakt:** Docker Image / Cloud Service
* **Technologie-Stack:** Node.js, Express, PostgreSQL / SQLite

## Beschreibung
Der Datenbank- und Backend-Container dient als zentraler Datenspeicher und API-Gateway für die MoveLink-Applikation. Er nimmt Trainingsdaten und Profile auf, validiert Benutzer und stellt sicher, dass historische Bewegungsdaten zur späteren Analyse persistent abgelegt werden.

## Requirements

**FA3.1**: Das System speichert und verifiziert Benutzerprofile und Anmeldeinformationen persistent.
**FA3.2**: Das System speichert aufgezeichnete Trainingseinheiten (Übungstyp, Wiederholungen, Qualität) persistent zur historischen Auswertung.

## Komponenten in diesem Container
Die API- und Datenbankschnittstelle besteht aus folgenden logischen Komponenten:
1. **ProfileController / Auth Service**: Authentifiziert Benutzer und liefert Profildaten. (Erfüllt: FA3.1)
2. **Trainings-DB / Session Store**: Speichert und indiziert abgeschlossene Repetitions- und Sessiondaten. (Erfüllt: FA3.2)
