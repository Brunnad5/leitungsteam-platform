# Product Requirements Document (PRD)

---

## Produktname:
**Leitungsteam Viewer & Editor** (Prototyp)

## Ziel des Produkts:
Ein digitales Arbeitsmittel für das Leitungsteam, um Entscheidungen und Informationen zu Ideen, Vorhaben und Projekten in den Phasen "Planung" und "Umsetzung" einsehen, bearbeiten und dokumentieren zu können. Ziel ist es, den bisher analogen bzw. intransparenten Prozess digital abzubilden und Transparenz zu schaffen.

---

## Zielgruppe:
- Leitungsteam
- (Prototypisch, ohne Fokus auf breite Nutzerfreundlichkeit oder Rollenkonzepte)

---

## Problemstellung:
- Der aktuelle Planungs- und Entscheidungsprozess ist nicht digitalisiert.
- Es fehlt eine zentrale, digitale Übersicht über den Status und die Details zu Ideen/Vorhaben/Projekten.
- Entscheidungen und relevante Informationen (z. B. Protokolle) werden nicht einheitlich dokumentiert.

---

## Geltungsbereich:
- Nur Ideen/Vorhaben/Projekte in der Phase **"Planung"** (gesteuert über die Business Process Flow-Tabelle `cr6df_ideatosolutions`) und im Lifecycle-Status **"Idee in Projektportfolio aufgenommen"**, **"Idee in Quartalsplanung aufgenommen"** und **"Idee in Wochenplanung aufgenommen"** (gesteuert über die Tabellen `sgsw_digitalisierungsvorhabens`)
- Nur die Sicht und Funktionen für das **Leitungsteam** sind relevant

---

## Kernfunktionen:

### 1. Listenansicht
- Auflistung aller Ideen/Vorhaben/Projekte mit Status "Planung"
- Filtermöglichkeiten (optional): z. B. nach "Verantwortlicher", "Typ", "Kritikalität"

### 2. Detailansicht eines Eintrags
- Alle relevanten Felder sichtbar (siehe Datenmodell)
- Felder sind teilweise bearbeitbar (z. B. Start-/Enddatum, Beschreibung, Nutzen, etc.)

### 3. Erfassung von Protokollen/Sitzungen
- Anlegen eines neuen Sitzungsprotokolls mit Feldern:
  - `protokoll`
  - `sitzungsdatum`
  - `teilnehmer`
- Verknüpfung mit Projekt/Vorhaben

---

## Datenmodell:

### Tabelle: `sgsw_digitalisierungsvorhabens`
Sichtbare Felder:
- `titel`
- `typ`
- `beschreibung`
- `detailanalyse_personentage`
- `detailanalyse_nutzen`
- `itotBoard_begruendung`
- `komplexitaet`
- `kritikalitaet`
- `lifecyclestatus`
- `pia_pfad`
- `verantwortlicher`
- `ideengeber`
- `stageId`

Bearbeitbare Felder:
- `planung_geplanterstart`
- `planung_geplantesende`

### Tabelle: `sgsw_itotBoardSitzung`
Sichtbare Felder:
- `protokoll`
- `id`
- `sitzungsdatum`
- `teilnehmer`

### Tabelle: `cr6df_ideatosolutions`
Sichtbare Felder:
- `activeStageId` (zur Filterung auf "Planung")

---

## UI/UX-Konzept:

### Hauptbereiche:
1. **Dashboard / Listenansicht**
   - Tabelle mit übersichtlichen Spalten (Titel, Typ, Startdatum, Verantwortlicher, Status)
   - Filterfunktion (Dropdowns oder Tags)

2. **Detailansicht (Einzelseite oder Modal)**
   - Formularstruktur mit Gruppen: Basisinformationen, Bewertung, Planung
   - Inline-Bearbeitung oder Speichern-Button

3. **Sitzungseditor (Modal oder Seitenbereich)**
   - Einfaches Formular zur Eingabe von Protokoll, Datum, Teilnehmern

---

## Tech Stack (vorgegeben):
- **Frontend:** Next.js, Tailwind CSS, daisyUI, Lucide Icons
- **Forms & Validation:** React Hook Form + Zod
- **Backend / API:** Next.js API routes oder Server Actions
- **Datenquelle:** Microsoft Dataverse (lesen/schreiben via API)
- **Deployment:** Vercel

---

## API-Integration:
- Authentifizierung für Dataverse (OAuth / Token Handling erforderlich)
- GET, PATCH und POST-Requests auf die genannten Tabellen
- Filterung von `cr6df_ideatosolutions.activeStageId` nach definierten Status-IDs für "Planung"
- Einfache Error-Handling & Loading States

---

## Nicht-funktionale Anforderungen:
- **Performance:** Schnelle Ladezeiten für Liste & Detailansicht
- **Responsiveness:** Desktop-optimiert (mobile später)
- **Zuverlässigkeit:** API-Fehler und Ladefehler müssen sichtbar gemacht werden
- **Prototyping-Speed:** Funktionalität vor Perfektion

---

## Offene Punkte:
- **Authentifizierungsflow für Dataverse-Zugriff:**
  - Möglichkeit 1: Manuelle Eingabe eines Tokens (für erste Tests ausreichend)
  - Möglichkeit 2: OAuth Device Code Flow – empfohlen (siehe @Dataverse_Integration.md), da:
    - Keine eigene Azure AD App-Registrierung erforderlich
    - Kein Redirect URI nötig (funktioniert auf localhost und Vercel)
    - Funktioniert mit dem öffentlichen Azure CLI Client (`04b07795-8ddb-461a-bbee-02f9e1bf7b46`)
- Mapping oder UI-Darstellung komplexerer Felder (z. B. Personen, Referenzen)