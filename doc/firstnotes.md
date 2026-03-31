Mikrocontroller <--- Datenpakete ---> App


Backend <- API -> Frontend
(Backend?)

Problemstellung:

Darstellung von Trainingsdatensätzen zur Bewegungsanalyse.

Projektebene
Stakeholder:
- Trainierenden (Fokus)
- Entwickler
- Dienstleister
- Hochschule 


Anforderungen an die App:

2 Zustände:

1 Zustand (Fokus) aktives Trainig:
- Intention: visuelle Darstellung des Trainingsfortschritts in Echtzeit

- FA: In Echtzeit eine Bewertung abliefern
- FA: Darstellung der Ausführung

- NFA: Eine eigenständige Applikation
- NFA: Das Darstellen der darf Höchstens 1 Sekunden dauern

- Rahmenbedingung: Auf Android, Mac und Windows funktionsfähig
- Technologien: Flutter & MAUI


Ich habe einen XIOA nRF52840 Gerät. Ich möchte die Daten in Echtzeit in einem Frontend anzeigen z.B. React. Wie sinnvoll und komplex wäre es einen Server dazwischen zu packen?


