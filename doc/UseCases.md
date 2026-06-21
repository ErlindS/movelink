# Anwendungsfälle (Use Cases)

Hier werden die primären Interaktionen zwischen dem Trainierenden und dem MoveLink-System beschrieben.

---

**UC-1**: Trainingsgerät verbinden
* **Akteur**: Trainierender
* **Vorbedingung**: Trainingsgerät ist eingeschaltet und befindet sich in Reichweite.
* **Beschreibung**: Als Trainierender möchte ich mein Trainingsgerät mit der App verbinden, um Trainingsdaten erfassen zu können.
* **Ablauf (Szenario)**:
  1. **Eingabe**: Der Trainierende öffnet die App.
     **Ausgabe**: Die App zeigt eine Möglichkeit/einen Reiter für Hardwaregeräte an.
  2. **Eingabe**: Der Trainierende klicke auf den Reiter "Hardwaregeräte".
     **Ausgabe**: Die App zeigt eine Liste der verfügbaren Hardwaregeräte sowie den aktuellen Verbindungsstatus an.
  3. **Eingabe**: Der Trainierende wählt ein Hardwaregerät aus der Liste aus und klickt auf "Verbinden".
     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Geräts und bestätigt den erfolgreichen Verbindungsaufbau.

---

**UC-2**: Echtzeit-Training überwachen
* **Akteur**: Trainierender
* **Vorbedingung**: Das Trainingsgerät ist erfolgreich mit der App verbunden.
* **Beschreibung**: Ich als Trainierender möchte mein Training in Echtzeit überwachen können, um direkt Feedback zu meiner Ausführung zu erhalten.
* **Ablauf (Szenario)**:
  1. **Eingabe**: Der Trainierende öffnet die App.
     **Ausgabe**: Die App zeigt die Option zum Starten eines Trainings an.
  2. **Eingabe**: Der Trainierende klickt auf "Training starten".
     **Ausgabe**: Die App zeigt die Detailansicht des ausgewählten Trainings sowie die Start-Schaltfläche.
  3. **Eingabe**: Der Trainierende drückt den "Start"-Button.
     **Ausgabe**: Die App demonstriert grafisch die auszuführende Übungsbewegung. *(Bezug: FA8)*
  4. **Eingabe**: Der Trainierende führt die Bewegung aus.
     **Ausgabe**: Die App visualisiert die Bewegung in Echtzeit, vergleicht sie mit der Zielvorgabe und gibt positives Feedback bei korrekter Ausführung. *(Bezug: FA5, FA6, FA9)*

---

**UC-3**: Trainingsdaten einsehen
* **Akteur**: Trainierender
* **Vorbedingung**: Mindestens eine aufgezeichnete Trainingseinheit ist in der Datenbank vorhanden.
* **Beschreibung**: Ich als Trainierender möchte vergangene Trainingseinheiten einsehen können, um meine Fortschritte zu verfolgen.
* **Ablauf (Szenario)**:
  1. **Eingabe**: Der Trainierende öffnet die App.
     **Ausgabe**: Die App bietet eine Option zum Einsehen des Trainingsverlaufs.
  2. **Eingabe**: Der Trainierende navigiert zum Reiter "Trainingseinheiten".
     **Ausgabe**: Die App listet alle vergangenen Trainingseinheiten chronologisch auf.
  3. **Eingabe**: Der Trainierende wählt eine Trainingseinheit aus der Liste aus.
     **Ausgabe**: Die App bereitet die historischen Bewegungsdaten grafisch und statistisch auf.