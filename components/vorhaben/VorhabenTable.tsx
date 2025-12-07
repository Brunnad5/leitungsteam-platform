/**
 * VorhabenTable - Tabellenkomponente für Digitalisierungsvorhaben
 * 
 * Zeigt die Liste der Vorhaben in einer daisyUI-Tabelle an.
 * Enthält Links zur Detailansicht.
 */

'use client';

import Link from 'next/link';
import { Calendar, User, AlertTriangle, ArrowRight } from 'lucide-react';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';

interface VorhabenTableProps {
  vorhaben: DigitalisierungsvorhabenRecord[];
  isLoading?: boolean;
}

/**
 * Formatiert ein ISO-Datum in deutsches Format
 */
function formatDate(isoDate?: string): string {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

/**
 * Gibt ein Badge für den Typ zurück
 * Werte aus Dataverse OptionSet (cr6df_typ)
 */
function getTypBadge(typ?: number): { label: string; className: string } {
  const typMap: Record<number, { label: string; className: string }> = {
    562520000: { label: 'Idee', className: 'badge-info' },
    562520001: { label: 'Vorhaben', className: 'badge-warning' },
    562520002: { label: 'Projekt', className: 'badge-success' },
  };
  return typMap[typ || 0] || { label: '-', className: 'badge-ghost' };
}

/**
 * Gibt ein Badge für die Kritikalität zurück
 * Werte aus Dataverse OptionSet (cr6df_kritikalitaet)
 */
function getKritikalitaetBadge(kritikalitaet?: number): { label: string; className: string } {
  const kritMap: Record<number, { label: string; className: string }> = {
    562520000: { label: 'Niedrig', className: 'badge-success' },
    562520001: { label: 'Mittel', className: 'badge-warning' },
    562520002: { label: 'Hoch', className: 'badge-error' },
  };
  return kritMap[kritikalitaet || 0] || { label: '-', className: 'badge-ghost' };
}

export default function VorhabenTable({ vorhaben, isLoading }: VorhabenTableProps) {
  // Loading-Skeleton
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Titel</th>
              <th>Typ</th>
              <th>Verantwortlich</th>
              <th>Start</th>
              <th>Kritikalität</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td><div className="skeleton h-4 w-48"></div></td>
                <td><div className="skeleton h-4 w-16"></div></td>
                <td><div className="skeleton h-4 w-24"></div></td>
                <td><div className="skeleton h-4 w-20"></div></td>
                <td><div className="skeleton h-4 w-16"></div></td>
                <td><div className="skeleton h-4 w-8"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Leere Liste
  if (vorhaben.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
        <h3 className="text-lg font-semibold">Keine Vorhaben gefunden</h3>
        <p className="text-base-content/70">
          Es wurden keine Digitalisierungsvorhaben gefunden, die den Filterkriterien entsprechen.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Titel</th>
            <th>Typ</th>
            <th>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Verantwortlich
              </span>
            </th>
            <th>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Start
              </span>
            </th>
            <th>Kritikalität</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vorhaben.map((item) => {
            const typBadge = getTypBadge(item.cr6df_typ);
            const kritBadge = getKritikalitaetBadge(item.cr6df_kritikalitaet);
            
            return (
              <tr key={item.cr6df_sgsw_digitalisierungsvorhabenid} className="hover">
                <td>
                  <div className="font-medium">
                    {item.cr6df_name || item.cr6df_newcolumn || 'Ohne Titel'}
                  </div>
                </td>
                <td>
                  <span className={`badge ${typBadge.className}`}>
                    {typBadge.label}
                  </span>
                </td>
                <td>
                  <span className="text-sm">
                    {item._cr6df_verantwortlicher_value ? '(Lookup)' : '-'}
                  </span>
                </td>
                <td>
                  <span className="text-sm">
                    {formatDate(item.cr6df_planung_geplanterstart)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-sm ${kritBadge.className}`}>
                    {kritBadge.label}
                  </span>
                </td>
                <td>
                  <Link 
                    href={`/vorhaben/${item.cr6df_sgsw_digitalisierungsvorhabenid}`}
                    className="btn btn-ghost btn-sm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
