/**
 * VorhabenEditForm - Formular zum Bearbeiten eines Vorhabens
 * 
 * Verwendet React Hook Form + Zod für Validierung
 * und daisyUI-Komponenten für die UI.
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { 
  vorhabenEditSchema, 
  VorhabenEditFormData,
  TYP_OPTIONS,
  KOMPLEXITAET_OPTIONS,
  KRITIKALITAET_OPTIONS,
  LIFECYCLE_STATUS_OPTIONS,
} from '@/lib/validators/vorhabenSchema';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';

interface VorhabenEditFormProps {
  vorhaben: DigitalisierungsvorhabenRecord;
  onSubmit: (data: VorhabenEditFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function VorhabenEditForm({ 
  vorhaben, 
  onSubmit, 
  isSubmitting = false 
}: VorhabenEditFormProps) {
  // React Hook Form Setup mit Zod-Resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<VorhabenEditFormData>({
    resolver: zodResolver(vorhabenEditSchema),
    defaultValues: {
      cr6df_name: vorhaben.cr6df_name || '',
      cr6df_beschreibung: vorhaben.cr6df_beschreibung || '',
      cr6df_typ: vorhaben.cr6df_typ || null,
      cr6df_komplexitaet: vorhaben.cr6df_komplexitaet || null,
      cr6df_kritikalitaet: vorhaben.cr6df_kritikalitaet || null,
      cr6df_lifecyclestatus: vorhaben.cr6df_lifecyclestatus || null,
      cr6df_planung_geplanterstart: vorhaben.cr6df_planung_geplanterstart?.split('T')[0] || '',
      cr6df_planung_geplantesende: vorhaben.cr6df_planung_geplantesende?.split('T')[0] || '',
      cr6df_detailanalyse_personentage: vorhaben.cr6df_detailanalyse_personentage || null,
      cr6df_detailanalyse_ergebnis: vorhaben.cr6df_detailanalyse_ergebnis || '',
      cr6df_itotboard_begruendung: vorhaben.cr6df_itotboard_begruendung || '',
      cr6df_pia_pfad: vorhaben.cr6df_pia_pfad || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basis-Informationen */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Basis-Informationen</h3>
          
          {/* Titel */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Titel</span>
            </label>
            <input
              type="text"
              placeholder="Titel des Vorhabens"
              className={`input input-bordered w-full ${errors.cr6df_name ? 'input-error' : ''}`}
              {...register('cr6df_name')}
            />
            {errors.cr6df_name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.cr6df_name.message}</span>
              </label>
            )}
          </div>

          {/* Beschreibung */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Beschreibung</span>
            </label>
            <textarea
              placeholder="Beschreibung des Vorhabens"
              className={`textarea textarea-bordered h-32 ${errors.cr6df_beschreibung ? 'textarea-error' : ''}`}
              {...register('cr6df_beschreibung')}
            />
            {errors.cr6df_beschreibung && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.cr6df_beschreibung.message}</span>
              </label>
            )}
          </div>

          {/* Typ und Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Typ */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Typ</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register('cr6df_typ', { valueAsNumber: true })}
              >
                <option value="">-- Auswählen --</option>
                {TYP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lifecycle-Status */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Lifecycle-Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register('cr6df_lifecyclestatus', { valueAsNumber: true })}
              >
                <option value="">-- Auswählen --</option>
                {LIFECYCLE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bewertung */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Bewertung</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Komplexität */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Komplexität</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register('cr6df_komplexitaet', { valueAsNumber: true })}
              >
                <option value="">-- Auswählen --</option>
                {KOMPLEXITAET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Kritikalität */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Kritikalität</span>
              </label>
              <select
                className="select select-bordered w-full"
                {...register('cr6df_kritikalitaet', { valueAsNumber: true })}
              >
                <option value="">-- Auswählen --</option>
                {KRITIKALITAET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Planung */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Planung</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Geplanter Start */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Geplanter Start</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                {...register('cr6df_planung_geplanterstart')}
              />
            </div>

            {/* Geplantes Ende */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Geplantes Ende</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                {...register('cr6df_planung_geplantesende')}
              />
            </div>

            {/* Personentage */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Personentage</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                className={`input input-bordered w-full ${errors.cr6df_detailanalyse_personentage ? 'input-error' : ''}`}
                {...register('cr6df_detailanalyse_personentage', { valueAsNumber: true })}
              />
              {errors.cr6df_detailanalyse_personentage && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.cr6df_detailanalyse_personentage.message}
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zusätzliche Felder */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-lg">Weitere Informationen</h3>
          
          {/* ITOT Board Begründung */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">ITOT Board Begründung</span>
            </label>
            <textarea
              placeholder="Begründung für das ITOT Board"
              className="textarea textarea-bordered h-24"
              {...register('cr6df_itotboard_begruendung')}
            />
          </div>

          {/* PIA Pfad */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">PIA Pfad (URL)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              className={`input input-bordered w-full ${errors.cr6df_pia_pfad ? 'input-error' : ''}`}
              {...register('cr6df_pia_pfad')}
            />
            {errors.cr6df_pia_pfad && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.cr6df_pia_pfad.message}</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Änderungen speichern
            </>
          )}
        </button>
      </div>
    </form>
  );
}
