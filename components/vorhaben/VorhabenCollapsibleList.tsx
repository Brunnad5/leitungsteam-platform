/**
 * VorhabenCollapsibleList - Ausklappbare Liste von Vorhaben
 * 
 * Zeigt Vorhaben in einer kompakten Tabelle an, die ein-/ausgeklappt werden kann.
 * Spalten: Titel, Verantwortlich, Kritikalität, Komplexität
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ArrowRight, User } from 'lucide-react';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';
import { KRITIKALITAET_OPTIONS, KOMPLEXITAET_OPTIONS } from '@/lib/validators/vorhabenSchema';

interface VorhabenCollapsibleListProps {
  title: string;
  vorhaben: DigitalisierungsvorhabenRecord[];
  defaultOpen?: boolean;
  badgeColor?: string;
}

/**
 * Gibt das Label für einen OptionSet-Wert zurück
 */
function getOptionLabel(
  value: number | undefined,
  options: readonly { value: number; label: string }[]
): string {
  if (value === undefined) return '-';
  const option = options.find((o) => o.value === value);
  return option?.label || '-';
}

/**
 * Gibt eine Badge-Klasse basierend auf dem Wert zurück
 */
function getBadgeClass(value: number | undefined): string {
  switch (value) {
    case 562520000:
      return 'badge-success'; // Niedrig
    case 562520001:
      return 'badge-warning'; // Mittel
    case 562520002:
      return 'badge-error'; // Hoch
    default:
      return 'badge-ghost';
  }
}

export default function VorhabenCollapsibleList({
  title,
  vorhaben,
  defaultOpen = true,
  badgeColor = 'badge-neutral',
}: VorhabenCollapsibleListProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card bg-base-100 shadow-sm">
      {/* Header - Klickbar zum Aus-/Einklappen */}
      <button
        className="card-body py-4 flex flex-row items-center justify-between cursor-pointer hover:bg-base-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          <h3 className="card-title text-lg m-0">{title}</h3>
          <span className={`badge ${badgeColor}`}>{vorhaben.length}</span>
        </div>
      </button>

      {/* Tabelle - nur wenn geöffnet */}
      {isOpen && (
        <div className="px-4 pb-4">
          {vorhaben.length === 0 ? (
            <p className="text-base-content/50 text-center py-4">
              Keine Vorhaben in dieser Kategorie
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Titel</th>
                    <th>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Verantwortlich
                      </span>
                    </th>
                    <th>Kritikalität</th>
                    <th>Komplexität</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {vorhaben.map((item) => (
                    <tr key={item.cr6df_sgsw_digitalisierungsvorhabenid} className="hover">
                      <td>
                        <div className="font-medium">
                          {item.cr6df_name || item.cr6df_newcolumn || 'Ohne Titel'}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-base-content/70">
                          {item._cr6df_verantwortlicher_value ? '(Zugewiesen)' : '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${getBadgeClass(item.cr6df_kritikalitaet)}`}>
                          {getOptionLabel(item.cr6df_kritikalitaet, KRITIKALITAET_OPTIONS)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${getBadgeClass(item.cr6df_komplexitaet)}`}>
                          {getOptionLabel(item.cr6df_komplexitaet, KOMPLEXITAET_OPTIONS)}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
