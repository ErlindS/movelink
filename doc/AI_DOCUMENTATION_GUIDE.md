# Leitfaden für KI-Dokumentation & Traceability (MoveLink)

Dieses Repository verwendet ein automatisiertes, integriertes Dokumentations- und Traceability-System. Es scannt Markdown-Dokumente und Quellcode-Dateien, um eine interaktive Weboberfläche (HTML Dashboard) sowie einen kompilierten PDF-Bericht zu generieren.

Damit zukünftige KIs und Entwickler neue Anforderungen, Use Cases und Architekturentwicklungen richtig dokumentieren, müssen die folgenden Standards eingehalten werden.

---

## 1. Definition von Anforderungen & Use Cases (.md-Dateien)

Alle Systemdefinitionen werden in Markdown-Dateien im Ordner `doc/` gepflegt (z. B. `doc/Requirements.md` und `doc/UseCases.md`). 

### ID-Format & Konventionen
Jeder Eintrag muss eine eindeutige ID besitzen:
* **`UC-X`**: Use Cases (z. B. `UC-1`)
* **`FA-X`**: Funktionale Anforderungen (z. B. `FA1`)
* **`NF-X`**: Nicht-funktionale Anforderungen (z. B. `NF1`)
* **`R-X`**: Randbedingungen (z. B. `R1`)

### Format der Deklaration in Markdown
Damit der Scraper (`scrape_docs.py`) die Einträge korrekt parsen kann, müssen sie in einer Zeile deklariert werden, gefolgt von einer Beschreibung:

```markdown
**UC-1: Live-Ansicht der Übungen**
Dies ist die Beschreibung des Use Cases. Hier steht detaillierter Text, der auch über mehrere Zeilen gehen kann.

**FA2: Bluetooth LE Signalstärke**
Das System muss die BLE-Signalstärke des Sensors in Echtzeit ausgeben.
```

### Verknüpfung zwischen Anforderungen und Use Cases (Traceability)
Um Anforderungen mit Use Cases zu verknüpfen, muss die Use-Case-ID in Klammern oder als Text in der Zeile der Anforderung stehen. Der Scraper sucht nach Querverweisen (z. B. `(UC-1)`):

```markdown
**FA3: BLE Verbindungsaufbau (UC-1)**
Das System muss eine Bluetooth Low Energy Verbindung zum Sensor herstellen.
```

---

## 2. Implementierungs-Referenzen im Quellcode (@implements)

Um nachzuweisen, dass eine Anforderung tatsächlich im Code implementiert wurde, müssen Entwickler und KIs direkt in den Quellcodedateien (`.ts`, `.tsx`, `.ino`, `.cpp`, `.h`) `@implements`-Annotationen in Kommentaren hinzufügen.

### Syntax
```
@implements ID1, ID2, ...
```

### Code-Beispiele

**In TypeScript / TSX Dateien (`app/`):**
```tsx
// @implements FA2, FA3, NF2
export function SensorCard() {
    // UI Code...
}
```

**In Arduino / C++ Dateien (`embedded/`):**
```cpp
/*
 * @implements FA5, NF1
 * Liest Sensorwerte mit 50Hz aus und wendet einen Tiefpassfilter an.
 */
void loop() {
    // Sensorsignal...
}
```

---

## 3. C4-Architektur-Modellierung (Metadaten-Blöcke)

Jedes Architektur-Dokument in Markdown muss Informationen über die zugehörige C4-Ebene und die Deployability enthalten.

### Metadaten-Header in Markdown
Fügen Sie ganz oben in der entsprechenden Architektur-Markdown-Datei (z. B. `app/architecture.md`) einen HTML-Kommentarblock mit folgenden Keys hinzu:

```markdown
<!--
C4-Ebene: Container
Deployable: Ja
-->
```

**Erlaubte Werte:**
* **C4-Ebene**: `System-Context`, `Container`, `Component`
* **Deployable**: `Ja` / `Nein` (oder `Yes` / `No`)

### Registrierung im C4 Model Explorer
Wenn ein neuer Container oder eine neue Komponente hinzugefügt wird, muss diese auch in der `C4_DATA`-Struktur am Ende von `docs_site/app.js` registriert werden:
1. Tragen Sie das Element unter `containers.elements` oder `components.[container_id].elements` ein.
2. Definieren Sie dessen Verbindungen (Connectoren) im zugehörigen `connections`-Array.
3. Ergänzen Sie die Dateizuordnung in der Funktion `getC4ElementForFile` in `docs_site/app.js`, damit die E2E-Flussdiagramme die Datei dem neuen C4-Element zuweisen.

---

## 4. Build-Prozess & Pipeline

Nach jeder Änderung an der Dokumentation oder den `@implements`-Kommentaren im Quellcode müssen die Kompilierungsskripte ausgeführt werden:

### Lokaler Build-Befehl
1. **Scraper ausführen** (erstellt `docs_site/data.js`):
   ```bash
   python scrape_docs.py
   ```
2. **PDF Bericht generieren** (erstellt `docs_site/documentation_report.pdf`):
   ```bash
   python generate_pdf.py
   ```

### CI/CD Pipeline (GitHub Actions)
Bei jedem Push auf den `main`-Branch baut die Pipeline `.github/workflows/docs.yml` die Webseite und das PDF automatisch. Wenn Sie einen Commit pushen, der bereits kompilierte Änderungen enthält, nutzen Sie `[skip ci]` im Commit-Betreff, um endlose Build-Loops zu verhindern.
