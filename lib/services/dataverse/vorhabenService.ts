/**
 * Service für die Tabelle sgsw_digitalisierungsvorhabens
 * 
 * Erweitert den generischen Dataverse Client mit typisierten Methoden
 * für Digitalisierungsvorhaben (Ideen, Vorhaben, Projekte).
 */

import { BaseDataverseClient } from './dataverseClient';
import { 
  DigitalisierungsvorhabenRecord, 
  DigitalisierungsvorhabenInput 
} from './types';

// EntitySet-Name in Dataverse (Plural-Form)
const ENTITY_SET_NAME = 'cr6df_sgsw_digitalisierungsvorhabens';

// Felder, die in der Listenansicht angezeigt werden
const LIST_SELECT_FIELDS = [
  'cr6df_sgsw_digitalisierungsvorhabenid',
  'cr6df_newcolumn',
  'cr6df_name',
  'cr6df_typ',
  '_cr6df_verantwortlicher_value',
  'cr6df_planung_geplanterstart',
  'cr6df_planung_geplantesende',
  'cr6df_lifecyclestatus',
  'cr6df_kritikalitaet',
  'createdon',
  'modifiedon',
];

// Alle Felder für die Detailansicht
const DETAIL_SELECT_FIELDS = [
  'cr6df_sgsw_digitalisierungsvorhabenid',
  'cr6df_newcolumn',
  'cr6df_name',
  'cr6df_beschreibung',
  'cr6df_typ',
  '_cr6df_verantwortlicher_value',
  '_cr6df_ideengeber_value',
  'cr6df_komplexitaet',
  'cr6df_kritikalitaet',
  'cr6df_prioritat',
  'cr6df_lifecyclestatus',
  'cr6df_planung_geplanterstart',
  'cr6df_planung_geplantesende',
  'cr6df_detailanalyse_personentage',
  'cr6df_detailanalyse_ergebnis',
  'cr6df_itotboard_begruendung',
  'cr6df_initalbewertung_begruendung',
  'cr6df_pia_pfad',
  'cr6df_genehmigt_am',
  'cr6df_abgelehnt_am',
  'cr6df_in_ueberarbeitung_am',
  'cr6df_abgeschlossen_am',
  'createdon',
  'modifiedon',
];

/**
 * Service-Klasse für Digitalisierungsvorhaben
 * Bietet typisierte CRUD-Methoden und Filterfunktionen
 */
class VorhabenService extends BaseDataverseClient<DigitalisierungsvorhabenRecord> {
  constructor() {
    super(ENTITY_SET_NAME);
  }

  /**
   * Holt alle Vorhaben für die Listenansicht
   * Sortiert nach Erstellungsdatum (neueste zuerst)
   */
  async listAll(): Promise<DigitalisierungsvorhabenRecord[]> {
    return this.list({
      select: LIST_SELECT_FIELDS,
      orderby: 'createdon desc',
    });
  }

  /**
   * Holt Vorhaben mit optionalem Filter
   * @param filter - OData-Filter (z.B. "sgsw_typ eq 1")
   */
  async listFiltered(filter?: string): Promise<DigitalisierungsvorhabenRecord[]> {
    return this.list({
      select: LIST_SELECT_FIELDS,
      filter,
      orderby: 'createdon desc',
    });
  }

  /**
   * Holt ein einzelnes Vorhaben mit allen Details
   * @param id - Die GUID des Vorhabens
   */
  async getById(id: string): Promise<DigitalisierungsvorhabenRecord> {
    return this.get(id, DETAIL_SELECT_FIELDS);
  }

  /**
   * Erstellt ein neues Vorhaben
   * @param data - Die Daten für das neue Vorhaben
   */
  async createVorhaben(data: DigitalisierungsvorhabenInput): Promise<DigitalisierungsvorhabenRecord> {
    return this.create(data);
  }

  /**
   * Aktualisiert ein bestehendes Vorhaben
   * @param id - Die GUID des Vorhabens
   * @param data - Die zu aktualisierenden Felder
   */
  async updateVorhaben(
    id: string, 
    data: Partial<DigitalisierungsvorhabenInput>
  ): Promise<DigitalisierungsvorhabenRecord> {
    return this.update(id, data);
  }

  /**
   * Löscht ein Vorhaben
   * @param id - Die GUID des Vorhabens
   */
  async deleteVorhaben(id: string): Promise<void> {
    return this.delete(id);
  }

  // ============================================
  // Filter-Hilfsmethoden
  // ============================================

  /**
   * Filtert nach Typ (z.B. Idee, Vorhaben, Projekt)
   * @param typ - Der Typ-Wert (OptionSet-Wert, z.B. 562520000)
   */
  async listByTyp(typ: number): Promise<DigitalisierungsvorhabenRecord[]> {
    return this.listFiltered(`cr6df_typ eq ${typ}`);
  }

  /**
   * Filtert nach Lifecycle-Status
   * @param status - Der Status-Wert (OptionSet-Wert)
   */
  async listByLifecycleStatus(status: number): Promise<DigitalisierungsvorhabenRecord[]> {
    return this.listFiltered(`cr6df_lifecyclestatus eq ${status}`);
  }

  /**
   * Filtert nach Kritikalität
   * @param kritikalitaet - Der Kritikalitäts-Wert (OptionSet-Wert)
   */
  async listByKritikalitaet(kritikalitaet: number): Promise<DigitalisierungsvorhabenRecord[]> {
    return this.listFiltered(`cr6df_kritikalitaet eq ${kritikalitaet}`);
  }

  /**
   * Sucht nach Vorhaben anhand des Titels (cr6df_name)
   * @param searchTerm - Suchbegriff
   */
  async searchByTitel(searchTerm: string): Promise<DigitalisierungsvorhabenRecord[]> {
    return this.listFiltered(`contains(cr6df_name, '${searchTerm}')`);
  }
}

// ============================================
// Singleton-Instanz für einfache Verwendung
// ============================================

let vorhabenServiceInstance: VorhabenService | null = null;

/**
 * Factory-Funktion für den VorhabenService
 * Gibt immer dieselbe Instanz zurück (Singleton)
 */
export function getVorhabenService(): VorhabenService {
  if (!vorhabenServiceInstance) {
    vorhabenServiceInstance = new VorhabenService();
  }
  return vorhabenServiceInstance;
}

// Exportiere auch die Klasse für Tests
export { VorhabenService };
