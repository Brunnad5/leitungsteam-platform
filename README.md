# Leitungsteam Platform

Digitale Übersicht für Ideen, Vorhaben und Projekte. Ermöglicht dem Leitungsteam, Digitalisierungsvorhaben zu verwalten und Entscheidungen zu dokumentieren.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, daisyUI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Daten**: Microsoft Dataverse (Power Platform)
- **Deployment**: Vercel

## Voraussetzungen

- Node.js 18+
- npm oder yarn
- Zugang zu einer Microsoft Dataverse-Umgebung

## Installation

```bash
# Repository klonen
git clone <repository-url>
cd leitungsteam-platform

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local
```

## Umgebungsvariablen

Erstelle eine `.env.local` Datei mit folgenden Variablen:

```env
# Dataverse Konfiguration
DATAVERSE_URL=https://your-org.crm17.dynamics.com
DATAVERSE_CLIENT_ID=04b07795-8ddb-461a-bbee-02f9e1bf7b46
DATAVERSE_TENANT_ID=your-tenant-id
```

> **Hinweis**: Die `DATAVERSE_CLIENT_ID` ist die öffentliche Azure CLI Client-ID für den Device Code Flow.

## Entwicklung

```bash
# Entwicklungsserver starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Authentifizierung

Die App verwendet den **OAuth Device Code Flow**:

1. Beim ersten Besuch wird ein Code angezeigt
2. Öffne https://microsoft.com/devicelogin
3. Gib den Code ein und melde dich mit deinem Microsoft-Konto an
4. Die App erhält automatisch Zugriff auf Dataverse

## Projektstruktur

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── dataverse/     # Auth-Endpoints
│   │   └── vorhaben/      # CRUD für Vorhaben
│   ├── dashboard/         # Dashboard-Seite
│   └── vorhaben/[id]/     # Detail-Seite
├── components/            # React-Komponenten
│   ├── dataverse/         # Auth-Komponenten
│   └── vorhaben/          # Vorhaben-Komponenten
├── lib/                   # Utilities & Services
│   ├── services/dataverse/ # Dataverse-Client
│   └── validators/        # Zod-Schemas
└── docs/                  # Dokumentation
```

## Deployment auf Vercel

1. Repository mit Vercel verbinden
2. Umgebungsvariablen in Vercel setzen:
   - `DATAVERSE_URL`
   - `DATAVERSE_CLIENT_ID`
   - `DATAVERSE_TENANT_ID`
3. Deployen

## Lizenz

Privates Projekt - Stadt St. Gallen
