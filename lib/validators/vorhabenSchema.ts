/**
 * Zod-Validierungsschema für Digitalisierungsvorhaben
 * 
 * Wird sowohl für Client-seitige Validierung (React Hook Form)
 * als auch für Server-seitige Validierung verwendet.
 */

import { z } from 'zod';

/**
 * Schema für die Bearbeitung eines Vorhabens
 * Alle Felder sind optional, da PATCH partiell aktualisiert
 */
export const vorhabenEditSchema = z.object({
  // Basis-Felder
  cr6df_name: z
    .string()
    .min(3, 'Titel muss mindestens 3 Zeichen haben')
    .max(200, 'Titel darf maximal 200 Zeichen haben')
    .optional()
    .or(z.literal('')),
  
  cr6df_beschreibung: z
    .string()
    .max(4000, 'Beschreibung darf maximal 4000 Zeichen haben')
    .optional()
    .or(z.literal('')),

  // OptionSet-Felder (als Zahlen)
  cr6df_typ: z
    .number()
    .optional()
    .nullable(),
  
  cr6df_komplexitaet: z
    .number()
    .optional()
    .nullable(),
  
  cr6df_kritikalitaet: z
    .number()
    .optional()
    .nullable(),

  cr6df_lifecyclestatus: z
    .number()
    .optional()
    .nullable(),

  // Planung - Datumsfelder als Strings (ISO-Format)
  cr6df_planung_geplanterstart: z
    .string()
    .optional()
    .or(z.literal('')),
  
  cr6df_planung_geplantesende: z
    .string()
    .optional()
    .or(z.literal('')),

  // Detailanalyse
  cr6df_detailanalyse_personentage: z
    .number()
    .min(0, 'Personentage müssen positiv sein')
    .optional()
    .nullable(),

  cr6df_detailanalyse_ergebnis: z
    .string()
    .optional()
    .or(z.literal('')),

  // ITOT Board
  cr6df_itotboard_begruendung: z
    .string()
    .optional()
    .or(z.literal('')),

  // PIA
  cr6df_pia_pfad: z
    .string()
    .url('Bitte eine gültige URL eingeben')
    .optional()
    .or(z.literal('')),
});

// TypeScript-Typ aus dem Schema ableiten
export type VorhabenEditFormData = z.infer<typeof vorhabenEditSchema>;

/**
 * OptionSet-Werte für Dropdowns
 * Diese entsprechen den Werten in Dataverse
 */
export const TYP_OPTIONS = [
  { value: 562520000, label: 'Idee' },
  { value: 562520001, label: 'Vorhaben' },
  { value: 562520002, label: 'Projekt' },
] as const;

export const KOMPLEXITAET_OPTIONS = [
  { value: 562520000, label: 'Niedrig' },
  { value: 562520001, label: 'Mittel' },
  { value: 562520002, label: 'Hoch' },
] as const;

export const KRITIKALITAET_OPTIONS = [
  { value: 562520000, label: 'Niedrig' },
  { value: 562520001, label: 'Mittel' },
  { value: 562520002, label: 'Hoch' },
] as const;

// Lifecycle-Status (basierend auf den Daten)
// HINWEIS: Diese Werte müssen ggf. an die tatsächlichen Dataverse-OptionSet-Werte angepasst werden
export const LIFECYCLE_STATUS_OPTIONS = [
  { value: 562520000, label: 'Neu' },
  { value: 562520001, label: 'Idee in Projektportfolio aufgenommen' },
  { value: 562520002, label: 'Idee in Quartalsplanung aufgenommen' },
  { value: 562520003, label: 'In Prüfung' },
  { value: 562520004, label: 'Abgelehnt' },
  { value: 562520005, label: 'Genehmigt' },
  { value: 562520006, label: 'In Planung' },
  { value: 562520007, label: 'In Umsetzung' },
  { value: 562520009, label: 'In Überarbeitung' },
  { value: 562520011, label: 'Abgeschlossen' },
] as const;

// Konstanten für Dashboard-Filter
export const LIFECYCLE_STATUS = {
  NEU: 562520000,
  IDEE_IN_PROJEKTPORTFOLIO: 562520001,
  IDEE_IN_QUARTALSPLANUNG: 562520002,
  IN_PRUEFUNG: 562520003,
  ABGELEHNT: 562520004,
  GENEHMIGT: 562520005,
  IN_PLANUNG: 562520006,
  IN_UMSETZUNG: 562520007,
  IN_UEBERARBEITUNG: 562520009,
  ABGESCHLOSSEN: 562520011,
} as const;
