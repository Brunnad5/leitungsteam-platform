/**
 * PlanungUebersichtKalender - Grosse Kalenderansicht für die Planung-Seite
 * 
 * Zeigt alle Vorhaben mit geplanten Daten auf einer Zeitachse an.
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';

interface PlanungUebersichtKalenderProps {
  vorhaben: DigitalisierungsvorhabenRecord[];
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
  const width = Math.max((duration / totalDays) * 100, 1); // Mindestens 1% breit
  
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

/**
 * Gibt eine Farbe basierend auf dem Lifecycle-Status zurück
 */
function getStatusColor(status?: number): string {
  if (!status) return 'bg-base-300';
  
  // Projektportfolio (blau)
  if (status === 562520006) return 'bg-info';
  // Quartalsplanung (orange/warning)
  if (status === 562520007) return 'bg-warning';
  // Wochenplanung (lila/secondary)
  if (status === 562520008) return 'bg-secondary';
  // In Umsetzung (grün)
  if (status === 562520010) return 'bg-success';
  
  return 'bg-base-300';
}

export default function PlanungUebersichtKalender({ vorhaben }: PlanungUebersichtKalenderProps) {
  // Filtere Vorhaben mit geplanten Daten
  const vorhabenWithDates = useMemo(() => {
    return vorhaben.filter(
      (v) => v.cr6df_planung_geplanterstart && v.cr6df_planung_geplantesende
    );
  }, [vorhaben]);

  // Berechne den Zeitraum für die Ansicht
  const { viewStart, viewEnd, months } = useMemo(() => {
    if (vorhabenWithDates.length === 0) {
      // Fallback: Aktuelles Quartal + 3 Monate
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 6, 0);
      return {
        viewStart: start,
        viewEnd: end,
        months: getMonthsBetween(start, end),
      };
    }
    
    const allDates: Date[] = [];
    vorhabenWithDates.forEach((v) => {
      allDates.push(new Date(v.cr6df_planung_geplanterstart!));
      allDates.push(new Date(v.cr6df_planung_geplantesende!));
    });
    
    // Min/Max mit Puffer
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    
    // Auf Monatsanfang/Ende runden
    const start = new Date(minDate.getFullYear(), minDate.getMonth() - 1, 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
    
    return {
      viewStart: start,
      viewEnd: end,
      months: getMonthsBetween(start, end),
    };
  }, [vorhabenWithDates]);

  if (vorhabenWithDates.length === 0) {
    return (
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Zeitübersicht</h3>
          <p className="text-base-content/60">
            Noch keine Vorhaben mit geplanten Start- und Enddaten vorhanden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-lg mb-4">Zeitübersicht</h3>
        
        {/* Monatskopfzeile */}
        <div className="relative h-8 border-b border-base-300 mb-2">
          {months.map((m, i) => (
            <div
              key={`${m.year}-${m.month}`}
              className="absolute text-sm font-medium text-base-content/70"
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
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {vorhabenWithDates.map((v) => {
            const pos = calculateBarPosition(
              new Date(v.cr6df_planung_geplanterstart!),
              new Date(v.cr6df_planung_geplantesende!),
              viewStart,
              viewEnd
            );
            if (!pos) return null;
            
            const statusColor = getStatusColor(v.cr6df_lifecyclestatus);
            
            return (
              <div key={v.cr6df_sgsw_digitalisierungsvorhabenid} className="relative h-7">
                {/* Hintergrund-Linie */}
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-base-200"></div>
                </div>
                
                {/* Balken */}
                <Link
                  href={`/vorhaben/${v.cr6df_sgsw_digitalisierungsvorhabenid}`}
                  className={`absolute h-6 ${statusColor} rounded flex items-center px-2 text-xs text-white font-medium hover:opacity-80 transition-opacity cursor-pointer`}
                  style={{ left: pos.left, width: pos.width, top: '2px' }}
                  title={`${v.cr6df_name}: ${formatDate(v.cr6df_planung_geplanterstart!)} - ${formatDate(v.cr6df_planung_geplantesende!)}`}
                >
                  <span className="truncate">{v.cr6df_name || v.cr6df_newcolumn}</span>
                </Link>
              </div>
            );
          })}
        </div>
        
        {/* Legende */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-base-200 text-xs text-base-content/60">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-info rounded"></div>
            <span>Projektportfolio</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-warning rounded"></div>
            <span>Quartalsplanung</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-secondary rounded"></div>
            <span>Wochenplanung</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span>In Umsetzung</span>
          </div>
        </div>
        
        <div className="text-xs text-base-content/50 mt-2">
          {vorhabenWithDates.length} Vorhaben mit Planungsdaten
        </div>
      </div>
    </div>
  );
}
