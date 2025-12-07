/**
 * VorhabenFilter - Filterkomponente für die Listenansicht
 * 
 * Enthält Dropdown-Filter für Typ, Kritikalität und ein Suchfeld.
 */

'use client';

import { Search, Filter, X } from 'lucide-react';

interface VorhabenFilterProps {
  onFilterChange: (filters: FilterValues) => void;
  currentFilters: FilterValues;
}

export interface FilterValues {
  typ?: string;
  kritikalitaet?: string;
  search?: string;
}

// Optionen für die Filter-Dropdowns
// Werte aus Dataverse OptionSets
const TYP_OPTIONS = [
  { value: '', label: 'Alle Typen' },
  { value: '562520000', label: 'Idee' },
  { value: '562520001', label: 'Vorhaben' },
  { value: '562520002', label: 'Projekt' },
];

const KRITIKALITAET_OPTIONS = [
  { value: '', label: 'Alle Kritikalitäten' },
  { value: '562520000', label: 'Niedrig' },
  { value: '562520001', label: 'Mittel' },
  { value: '562520002', label: 'Hoch' },
];

export default function VorhabenFilter({ onFilterChange, currentFilters }: VorhabenFilterProps) {
  /**
   * Handler für Änderungen an den Filtern
   */
  const handleChange = (key: keyof FilterValues, value: string) => {
    onFilterChange({
      ...currentFilters,
      [key]: value || undefined,
    });
  };

  /**
   * Setzt alle Filter zurück
   */
  const clearFilters = () => {
    onFilterChange({});
  };

  // Prüfe, ob Filter aktiv sind
  const hasActiveFilters = currentFilters.typ || currentFilters.kritikalitaet || currentFilters.search;

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Suchfeld */}
        <div className="form-control flex-1 min-w-[200px]">
          <label className="label">
            <span className="label-text flex items-center gap-1">
              <Search className="w-4 h-4" />
              Suche
            </span>
          </label>
          <input
            type="text"
            placeholder="Nach Titel suchen..."
            className="input input-bordered w-full"
            value={currentFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        {/* Typ-Filter */}
        <div className="form-control w-40">
          <label className="label">
            <span className="label-text flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Typ
            </span>
          </label>
          <select
            className="select select-bordered w-full"
            value={currentFilters.typ || ''}
            onChange={(e) => handleChange('typ', e.target.value)}
          >
            {TYP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Kritikalität-Filter */}
        <div className="form-control w-44">
          <label className="label">
            <span className="label-text">Kritikalität</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={currentFilters.kritikalitaet || ''}
            onChange={(e) => handleChange('kritikalitaet', e.target.value)}
          >
            {KRITIKALITAET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter zurücksetzen */}
        {hasActiveFilters && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={clearFilters}
            title="Filter zurücksetzen"
          >
            <X className="w-4 h-4" />
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
