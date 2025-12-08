/**
 * BpfProzessfortschritt - Zeigt den BPF-Prozessfortschritt an
 * 
 * Visualisiert die vier Phasen des Business Process Flow:
 * 1. Initialisierung
 * 2. Analyse & Bewertung
 * 3. Planung
 * 4. Umsetzung
 */

'use client';

import { Clock, Check } from 'lucide-react';

// BPF-Phasen Definition (aus Dataverse)
export const BPF_PHASES = [
  { id: 1, name: 'Initialisierung' },
  { id: 2, name: 'Analyse & Bewertung' },
  { id: 3, name: 'Planung' },
  { id: 4, name: 'Umsetzung' },
] as const;

interface BpfProzessfortschrittProps {
  /** Aktuelle Phase (1-4) */
  currentPhase: number;
  /** Datum seit wann in dieser Phase (optional) */
  phaseSince?: string;
}

/**
 * Formatiert ein Datum für die Anzeige
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BpfProzessfortschritt({
  currentPhase,
  phaseSince,
}: BpfProzessfortschrittProps) {
  // Aktuellen Phasennamen ermitteln
  const currentPhaseName = BPF_PHASES.find((p) => p.id === currentPhase)?.name || 'Unbekannt';

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
        Prozess-Fortschritt
      </h4>

      {/* Aktuelle Phase Info-Box */}
      <div className="bg-info text-info-content rounded-xl p-4 flex items-start gap-3">
        <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-semibold">
            Aktuelle Phase: {currentPhaseName}
          </div>
          {phaseSince && (
            <div className="text-sm opacity-90">
              Seit {formatDate(phaseSince)}
            </div>
          )}
        </div>
      </div>

      {/* Stepper / Timeline */}
      <div className="flex items-center justify-between relative px-2">
        {/* Verbindungslinie im Hintergrund */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-base-300" />

        {BPF_PHASES.map((phase) => {
          const isCompleted = phase.id < currentPhase;
          const isCurrent = phase.id === currentPhase;
          const isPending = phase.id > currentPhase;

          return (
            <div
              key={phase.id}
              className="flex flex-col items-center relative z-10"
            >
              {/* Kreis / Icon */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${isCompleted ? 'bg-success text-success-content' : ''}
                  ${isCurrent ? 'bg-primary text-primary-content' : ''}
                  ${isPending ? 'bg-base-300 text-base-content/50' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  phase.id
                )}
              </div>

              {/* Label */}
              <div
                className={`
                  mt-2 text-xs text-center max-w-20
                  ${isCurrent ? 'font-bold text-base-content' : ''}
                  ${isPending ? 'text-base-content/50' : ''}
                  ${isCompleted ? 'text-base-content/70' : ''}
                `}
              >
                {phase.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
