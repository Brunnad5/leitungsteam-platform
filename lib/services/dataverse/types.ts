/**
 * TypeScript-Interfaces für die Dataverse-Integration
 * 
 * Diese Datei definiert alle Typen für:
 * - OAuth Token-Handling (Device Code Flow)
 * - Dataverse API-Responses
 * - Die drei Projekt-Tabellen aus dem PRD
 */

// ============================================
// OAuth & Token Interfaces
// ============================================

/**
 * Antwort vom Device Code Flow - erste Phase
 * Der Benutzer erhält einen Code, den er auf microsoft.com/devicelogin eingibt
 */
export interface DeviceCodeResponse {
  device_code: string;           // Interner Code für das Polling
  user_code: string;             // Code, den der Benutzer eingibt (z.B. "ABCD1234")
  verification_url: string;      // URL für die Anmeldung (microsoft.com/devicelogin)
  expires_in: number;            // Gültigkeit in Sekunden
  interval: number;              // Polling-Intervall in Sekunden
  message: string;               // Benutzerfreundliche Nachricht
}

/**
 * Antwort vom Token-Endpoint nach erfolgreicher Anmeldung
 */
export interface TokenResponse {
  access_token: string;          // JWT für API-Zugriffe (~1h gültig)
  refresh_token: string;         // Zum Erneuern des Access Tokens (~90 Tage)
  token_type: string;            // Immer "Bearer"
  expires_in: number;            // Gültigkeit in Sekunden
  resource: string;              // Die Dataverse-URL
}

/**
 * Interner Cache für gespeicherte Tokens
 * Wird in einer Datei persistiert (nicht im RAM, da Next.js mehrere Worker hat)
 */
export interface TokenCache {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;             // Unix-Timestamp in Millisekunden
  resource: string;
}

// ============================================
// Dataverse API Response Interfaces
// ============================================

/**
 * Generische OData-Listen-Antwort von Dataverse
 * T ist der Typ der einzelnen Datensätze
 */
export interface DataverseListResponse<T> {
  '@odata.context': string;
  '@odata.count'?: number;       // Nur wenn $count=true
  value: T[];
}

/**
 * WhoAmI-Response - zeigt den angemeldeten Benutzer
 * Nützlich zum Testen der Verbindung
 */
export interface WhoAmIResponse {
  '@odata.context': string;
  BusinessUnitId: string;        // GUID der Business Unit
  UserId: string;                // GUID des Benutzers
  OrganizationId: string;        // GUID der Organisation
}

/**
 * Basis-Interface für alle Dataverse-Entities
 * Enthält die automatisch generierten System-Felder
 */
export interface DataverseEntity {
  createdon?: string;            // ISO-Datum der Erstellung
  modifiedon?: string;           // ISO-Datum der letzten Änderung
  _createdby_value?: string;     // GUID des Erstellers
  _modifiedby_value?: string;    // GUID des letzten Bearbeiters
  statecode?: number;            // Status (0=Aktiv, 1=Inaktiv)
  statuscode?: number;           // Status-Grund
}

// ============================================
// Projekt-Tabellen (korrigierte Feldnamen aus API)
// ============================================

/**
 * Haupttabelle: cr6df_sgsw_digitalisierungsvorhaben
 * Enthält alle Ideen, Vorhaben und Projekte
 * 
 * EntitySetName (für API): cr6df_sgsw_digitalisierungsvorhabens
 * Primärschlüssel: cr6df_sgsw_digitalisierungsvorhabenid
 */
export interface DigitalisierungsvorhabenRecord extends DataverseEntity {
  cr6df_sgsw_digitalisierungsvorhabenid: string;  // GUID (Primary Key)
  
  // Basis-Felder
  cr6df_newcolumn?: string;                  // Primary Name (Idee-ID, z.B. "Idee-ID-1039")
  cr6df_name?: string;                       // Titel des Vorhabens
  cr6df_beschreibung?: string;               // Beschreibung
  cr6df_typ?: number;                        // Choice: 562520000=Idee, etc.
  
  // Personen (Lookups)
  _cr6df_verantwortlicher_value?: string;    // Lookup GUID
  _cr6df_ideengeber_value?: string;          // Lookup GUID
  _cr6df_abonnenten_value?: string;          // Lookup GUID
  
  // Bewertung
  cr6df_komplexitaet?: number;               // Choice
  cr6df_kritikalitaet?: number;              // Choice
  cr6df_prioritat?: number;                  // Priorität
  cr6df_initalbewertung_begruendung?: string;
  
  // Lifecycle & Status
  cr6df_lifecyclestatus?: number;            // Choice: 562520000=neu, etc.
  cr6df_istduplikat?: boolean;
  
  // Planung
  cr6df_planung_geplanterstart?: string;     // ISO-Datum
  cr6df_planung_geplantesende?: string;      // ISO-Datum
  
  // Detailanalyse
  cr6df_detailanalyse_personentage?: number;
  cr6df_detailanalyse_ergebnis?: string;     // HTML-Text
  
  // ITOT Board
  cr6df_itotboard_begruendung?: string;
  
  // PIA (Privacy Impact Assessment)
  cr6df_pia_pfad?: string;
  cr6df_pia_erstellt_am?: string;            // ISO-Datum
  
  // Prozess-Daten (Timestamps)
  cr6df_genehmigt_am?: string;
  cr6df_abgelehnt_am?: string;
  cr6df_in_ueberarbeitung_am?: string;
  cr6df_abgeschlossen_am?: string;
  
  // Verknüpfung zum Business Process Flow
  _stageid_value?: string;
  processid?: string;
  traversedpath?: string;
}

/**
 * Input-Typ für Create/Update von Vorhaben
 * Ohne System-Felder, Lookups und Primary Key
 */
export interface DigitalisierungsvorhabenInput {
  cr6df_name?: string;
  cr6df_beschreibung?: string;
  cr6df_typ?: number;
  cr6df_komplexitaet?: number;
  cr6df_kritikalitaet?: number;
  cr6df_lifecyclestatus?: number;
  cr6df_prioritat?: number;
  cr6df_planung_geplanterstart?: string;
  cr6df_planung_geplantesende?: string;
  cr6df_detailanalyse_personentage?: number;
  cr6df_detailanalyse_ergebnis?: string;
  cr6df_itotboard_begruendung?: string;
  cr6df_initalbewertung_begruendung?: string;
  cr6df_pia_pfad?: string;
  // Lookup-Bindungen (für Create/Update)
  'cr6df_Verantwortlicher@odata.bind'?: string;
  'cr6df_Ideengeber@odata.bind'?: string;
}

/**
 * Tabelle: cr6df_itotboardsitzung
 * Speichert Sitzungsprotokolle
 * 
 * EntitySetName (für API): cr6df_itotboardsitzungs
 * Primärschlüssel: cr6df_itotboardsitzungid
 */
export interface SitzungsprotokollRecord extends DataverseEntity {
  cr6df_itotboardsitzungid: string;          // GUID (Primary Key)
  cr6df_sitzungid?: string;                  // Primary Name (z.B. "Sitzung-ID-1000")
  cr6df_protokoll?: string;                  // Mehrzeiliger Text
  cr6df_sitzungsdatum?: string;              // ISO-Datum
  _cr6df_teilnehmer_value?: string;          // Lookup GUID zu Person
}

/**
 * Input-Typ für Create/Update von Sitzungsprotokollen
 */
export interface SitzungsprotokollInput {
  cr6df_protokoll?: string;
  cr6df_sitzungsdatum?: string;
  // Lookup-Bindung für Teilnehmer
  'cr6df_Teilnehmer@odata.bind'?: string;
}

/**
 * Tabelle: cr6df_ideatosolution (Business Process Flow)
 * Bestimmt die aktuelle Phase eines Vorhabens
 * 
 * EntitySetName (für API): cr6df_ideatosolutions
 * Primärschlüssel: businessprocessflowinstanceid
 */
export interface IdeaToSolutionRecord extends DataverseEntity {
  businessprocessflowinstanceid: string;     // GUID (Primary Key)
  bpf_name?: string;                         // "ideaToSolution"
  
  // Wichtig für Filterung
  _activestageid_value?: string;             // GUID der aktuellen Stage
  activestagestartedon?: string;             // Wann Stage begonnen wurde
  traversedpath?: string;                    // Komma-separierte Stage-GUIDs
  
  // Verknüpfung zum Vorhaben
  _bpf_cr6df_sgsw_digitalisierungsvorhabenid_value?: string;
  
  // Status
  completedon?: string;                      // Wann abgeschlossen (null wenn aktiv)
  bpf_duration?: number;                     // Dauer in Minuten
}

// ============================================
// Helper Types
// ============================================

/**
 * Mögliche Phasen im Business Process Flow
 * Die GUIDs müssen in den Umgebungsvariablen oder Konfiguration definiert werden
 */
export type VorhabenPhase = 'Planung' | 'Umsetzung';

/**
 * Fehler-Response von der Dataverse API
 */
export interface DataverseError {
  error: {
    code: string;
    message: string;
  };
}

/**
 * Auth-Status für die UI
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  expiresIn?: number;            // Sekunden bis Token abläuft
  userId?: string;
}
