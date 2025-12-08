/**
 * PlanungKalender - Gantt-Chart-ähnliche Kalenderansicht
 * 
 * Zeigt das aktuelle Vorhaben und andere geplante Vorhaben
 * auf einer Zeitachse an.
 */

'use client';

import { useMemo } from 'react';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';

interface PlanungKalenderProps {
  currentVorhaben: DigitalisierungsvorhabenRecord;
  otherVorhaben: DigitalisierungsvorhabenRecord[];
}

/**
 * Hilfsfunktion: Berechnet Monatsdaten für die Zeitachse
 */
function getMonthsBetween(start: Date, end: Date): { month: number; year: number; label: string }[] {
  const months: { month: number; year: number; label: string }[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  
  while (current <= endMonth) {
    months.push({
      month: current.getMonth(),
      year: current.getFullYear(),
      label: monthNames[current.getMonth()],
    });
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

/**
 * Berechnet die Position und Breite eines Balkens
 */
function calculateBarPosition(
  itemStart: Date,
  itemEnd: Date,
  viewStart: Date,
  viewEnd: Date
): { left: string; width: string } | null {
  const totalDays = (viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);
  
  // Begrenze auf sichtbaren Bereich
  const clampedStart = itemStart < viewStart ? viewStart : itemStart;
  const clampedEnd = itemEnd > viewEnd ? viewEnd : itemEnd;
  
  if (clampedStart > viewEnd || clampedEnd < viewStart) {
    return null; // Nicht sichtbar
  }
  
  const startOffset = (clampedStart.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);
  const duration = (clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24);
  
  const left = (startOffset / totalDays) * 100;
  const width = Math.max((duration / totalDays) * 100, 2); // Mindestens 2% breit
  
  return {
    left: `${left}%`,
    width: `${width}%`,
  };
}

/**
 * Formatiert ein Datum für die Anzeige
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
}

export default function PlanungKalender({ currentVorhaben, otherVorhaben }: PlanungKalenderProps) {
  // Filtere Vorhaben mit geplanten Daten
  const vorhabenWithDates = useMemo(() => {
    return otherVorhaben.filter(
      (v) =>
        v.cr6df_planung_geplanterstart &&
        v.cr6df_planung_geplantesende &&
        v.cr6df_sgsw_digitalisierungsvorhabenid !== currentVorhaben.cr6df_sgsw_digitalisierungsvorhabenid
    );
  }, [otherVorhaben, currentVorhaben]);

  // Berechne den Zeitraum für die Ansicht
  const { viewStart, viewEnd, months } = useMemo(() => {
    const allDates: Date[] = [];
    
    // Aktuelles Vorhaben
    if (currentVorhaben.cr6df_planung_geplanterstart) {
      allDates.push(new Date(currentVorhaben.cr6df_planung_geplanterstart));
    }
    if (currentVorhaben.cr6df_planung_geplantesende) {
      allDates.push(new Date(currentVorhaben.cr6df_planung_geplantesende));
    }
    
    // Andere Vorhaben
    vorhabenWithDates.forEach((v) => {
      allDates.push(new Date(v.cr6df_planung_geplanterstart!));
      allDates.push(new Date(v.cr6df_planung_geplantesende!));
    });
    
    if (allDates.length === 0) {
      // Fallback: Aktuelles Quartal
      const now = new Date();
      const start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      const end = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
      return {
        viewStart: start,
        viewEnd: end,
        months: getMonthsBetween(start, end),
      };
    }
    
    // Min/Max mit etwas Puffer
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    
    // Auf Monatsanfang/Ende runden und einen Monat Puffer
    const start = new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
    
    return {
      viewStart: start,
      viewEnd: end,
      months: getMonthsBetween(start, end),
    };
  }, [currentVorhaben, vorhabenWithDates]);

  // Prüfe ob das aktuelle Vorhaben Daten hat
  const hasCurrentDates =
    currentVorhaben.cr6df_planung_geplanterstart && currentVorhaben.cr6df_planung_geplantesende;

  if (!hasCurrentDates && vorhabenWithDates.length === 0) {
    return (
      <div className="text-center text-base-content/50 py-4">
        Noch keine Planungsdaten vorhanden.
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <div className="text-sm font-medium mb-3">Zeitübersicht</div>
      
      {/* Monatskopfzeile */}
      <div className="relative h-6 mb-2 border-b border-base-300">
        {months.map((m, i) => (
          <div
            key={`${m.year}-${m.month}`}
            className="absolute text-xs text-base-content/60"
            style={{
              left: `${(i / months.length) * 100}%`,
              width: `${100 / months.length}%`,
            }}
          >
            {m.label} {m.year !== months[0].year || i === 0 ? `'${m.year.toString().slice(-2)}` : ''}
          </div>
        ))}
      </div>
      
      {/* Balkenbereich */}
      <div className="space-y-2">
        {/* Aktuelles Vorhaben (hervorgehoben) */}
        {hasCurrentDates && (
          <div className="relative h-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-base-300"></div>
            </div>
            {(() => {
              const pos = calculateBarPosition(
                new Date(currentVorhaben.cr6df_planung_geplanterstart!),
                new Date(currentVorhaben.cr6df_planung_geplantesende!),
                viewStart,
                viewEnd
              );
              if (!pos) return null;
              return (
                <div
                  className="absolute h-6 bg-primary rounded-md flex items-center px-2 text-xs text-primary-content font-medium shadow-sm"
                  style={{ left: pos.left, width: pos.width, top: '4px' }}
                  title={`${currentVorhaben.cr6df_name}: ${formatDate(currentVorhaben.cr6df_planung_geplanterstart!)} - ${formatDate(currentVorhaben.cr6df_planung_geplantesende!)}`}
                >
                  <span className="truncate">
                    {currentVorhaben.cr6df_name || currentVorhaben.cr6df_newcolumn}
                  </span>
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Andere Vorhaben */}
        {vorhabenWithDates.slice(0, 5).map((v) => {
          const pos = calculateBarPosition(
            new Date(v.cr6df_planung_geplanterstart!),
            new Date(v.cr6df_planung_geplantesende!),
            viewStart,
            viewEnd
          );
          if (!pos) return null;
          
          return (
            <div key={v.cr6df_sgsw_digitalisierungsvorhabenid} className="relative h-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-base-300"></div>
              </div>
              <div
                className="absolute h-5 bg-base-300 rounded flex items-center px-2 text-xs text-base-content/70"
                style={{ left: pos.left, width: pos.width, top: '2px' }}
                title={`${v.cr6df_name}: ${formatDate(v.cr6df_planung_geplanterstart!)} - ${formatDate(v.cr6df_planung_geplantesende!)}`}
              >
                <span className="truncate">{v.cr6df_name || v.cr6df_newcolumn}</span>
              </div>
            </div>
          );
        })}
        
        {/* Hinweis wenn mehr Vorhaben vorhanden */}
        {vorhabenWithDates.length > 5 && (
          <div className="text-xs text-base-content/50 text-center pt-2">
            + {vorhabenWithDates.length - 5} weitere Vorhaben
          </div>
        )}
      </div>
      
      {/* Legende */}
      <div className="flex items-center gap-4 mt-4 text-xs text-base-content/60">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span>Dieses Vorhaben</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-base-300 rounded"></div>
          <span>Andere Vorhaben</span>
        </div>
      </div>
    </div>
  );
}
