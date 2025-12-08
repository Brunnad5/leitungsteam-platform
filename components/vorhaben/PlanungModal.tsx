/**
 * PlanungModal - Modal zur Bearbeitung der Planungsdaten
 * 
 * Ermöglicht das Setzen von geplantem Start und Ende
 * mit einer einfachen Kalenderansicht.
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Save, Loader2 } from 'lucide-react';

interface PlanungModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { start: string; ende: string; personentage: number | null }) => Promise<void>;
  initialStart?: string;
  initialEnde?: string;
  initialPersonentage?: number | null;
}

/**
 * Formatiert ein Datum für die Anzeige (DD.MM.YYYY)
 */
function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-CH');
}

/**
 * Formatiert ein Datum für das Input-Feld (YYYY-MM-DD)
 */
function formatDateInput(dateStr?: string): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

export default function PlanungModal({
  isOpen,
  onClose,
  onSave,
  initialStart,
  initialEnde,
  initialPersonentage,
}: PlanungModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [personentage, setPersonentage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Werte initialisieren wenn Modal öffnet
  useEffect(() => {
    if (isOpen) {
      setStartDate(formatDateInput(initialStart));
      setEndDate(formatDateInput(initialEnde));
      setPersonentage(initialPersonentage?.toString() || '');
      setError('');
    }
  }, [isOpen, initialStart, initialEnde, initialPersonentage]);

  /**
   * Validiert die Eingaben
   */
  const validate = (): boolean => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setError('Das Enddatum muss nach dem Startdatum liegen.');
        return false;
      }
    }
    setError('');
    return true;
  };

  /**
   * Speichert die Änderungen
   */
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        start: startDate,
        ende: endDate,
        personentage: personentage ? parseInt(personentage, 10) : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setIsSaving(false);
    }
  };

  // Berechne die Dauer in Tagen
  const calculateDuration = (): string => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return '';
    if (diffDays === 0) return '(Gleicher Tag)';
    if (diffDays === 1) return '(1 Tag)';
    return `(${diffDays} Tage)`;
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Planung bearbeiten
          </h3>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fehleranzeige */}
        {error && (
          <div className="alert alert-error mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Formular */}
        <div className="space-y-4">
          {/* Geplanter Start */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Geplanter Start</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {startDate && (
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  {formatDateDisplay(startDate)}
                </span>
              </label>
            )}
          </div>

          {/* Geplantes Ende */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Geplantes Ende</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
            />
            {endDate && (
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  {formatDateDisplay(endDate)} {calculateDuration()}
                </span>
              </label>
            )}
          </div>

          {/* Personentage */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Geschätzte Personentage</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="z.B. 10"
              className="input input-bordered w-full"
              value={personentage}
              onChange={(e) => setPersonentage(e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/70">
                Aufwand in Personentagen (PT)
              </span>
            </label>
          </div>

          {/* Visuelle Zeitleiste */}
          {startDate && endDate && (
            <div className="bg-base-200 rounded-lg p-4 mt-4">
              <div className="text-sm font-medium mb-2">Zeitraum</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="badge badge-primary">{formatDateDisplay(startDate)}</span>
                <div className="flex-1 h-1 bg-primary/30 rounded"></div>
                <span className="badge badge-primary">{formatDateDisplay(endDate)}</span>
              </div>
              <div className="text-center text-xs text-base-content/50 mt-2">
                {calculateDuration()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Abbrechen
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Speichern
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isSaving}>
          Schliessen
        </button>
      </form>
    </dialog>
  );
}
