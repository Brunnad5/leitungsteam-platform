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
// Projekt-Tabellen aus dem PRD
// ============================================

/**
 * Haupttabelle: sgsw_digitalisierungsvorhabens
 * Enthält alle Ideen, Vorhaben und Projekte
 * 
 * EntitySetName (für API): sgsw_digitalisierungsvorhabens
 * Primärschlüssel: sgsw_digitalisierungsvorhabenid
 */
export interface DigitalisierungsvorhabenRecord extends DataverseEntity {
  sgsw_digitalisierungsvorhabenid: string;  // GUID (Primary Key)
  
  // Bearbeitbare Felder laut PRD
  sgsw_titel?: string;
  sgsw_beschreibung?: string;
  sgsw_typ?: number;                         // Choice/OptionSet
  sgsw_verantwortlicher?: string;            // Lookup oder Text
  sgsw_ideengeber?: string;
  sgsw_komplexitaet?: number;                // Choice
  sgsw_kritikalitaet?: number;               // Choice
  sgsw_lifecyclestatus?: number;             // Choice
  sgsw_planung_geplanterstart?: string;      // ISO-Datum
  sgsw_planung_geplantesende?: string;       // ISO-Datum
  sgsw_detailanalyse_personentage?: number;
  sgsw_detailanalyse_nutzen?: string;
  sgsw_itotboard_begruendung?: string;
  sgsw_pia_pfad?: string;
  
  // Verknüpfung zum Business Process Flow
  _sgsw_stageid_value?: string;              // Lookup zur Stage
}

/**
 * Input-Typ für Create/Update von Vorhaben
 * Ohne System-Felder und Primary Key
 */
export interface DigitalisierungsvorhabenInput {
  sgsw_titel?: string;
  sgsw_beschreibung?: string;
  sgsw_typ?: number;
  sgsw_verantwortlicher?: string;
  sgsw_ideengeber?: string;
  sgsw_komplexitaet?: number;
  sgsw_kritikalitaet?: number;
  sgsw_lifecyclestatus?: number;
  sgsw_planung_geplanterstart?: string;
  sgsw_planung_geplantesende?: string;
  sgsw_detailanalyse_personentage?: number;
  sgsw_detailanalyse_nutzen?: string;
  sgsw_itotboard_begruendung?: string;
  sgsw_pia_pfad?: string;
}

/**
 * Tabelle: sgsw_itotBoardSitzung
 * Speichert Sitzungsprotokolle mit Verknüpfung zu Vorhaben
 * 
 * EntitySetName (für API): sgsw_itotboardsitzungs
 * Primärschlüssel: sgsw_itotboardsitzungid
 */
export interface SitzungsprotokollRecord extends DataverseEntity {
  sgsw_itotboardsitzungid: string;           // GUID (Primary Key)
  sgsw_name?: string;                        // Primary Name (oft automatisch)
  sgsw_protokoll?: string;                   // Mehrzeiliger Text
  sgsw_sitzungsdatum?: string;               // ISO-Datum
  sgsw_teilnehmer?: string;                  // Text oder Multi-Select
  
  // Verknüpfung zum Vorhaben (Lookup)
  _sgsw_vorhaben_value?: string;             // GUID des verknüpften Vorhabens
}

/**
 * Input-Typ für Create/Update von Sitzungsprotokollen
 */
export interface SitzungsprotokollInput {
  sgsw_protokoll?: string;
  sgsw_sitzungsdatum?: string;
  sgsw_teilnehmer?: string;
  'sgsw_vorhaben@odata.bind'?: string;       // Für Lookup-Verknüpfung: /sgsw_digitalisierungsvorhabens(GUID)
}

/**
 * Tabelle: cr6df_ideatosolutions
 * Business Process Flow zur Bestimmung der aktuellen Phase
 * 
 * EntitySetName (für API): cr6df_ideatosolutionss
 * Primärschlüssel: businessprocessflowinstanceid
 */
export interface IdeaToSolutionRecord extends DataverseEntity {
  businessprocessflowinstanceid: string;     // GUID (Primary Key)
  
  // Wichtig für Filterung
  _activestageid_value?: string;             // GUID der aktuellen Stage ("Planung", "Umsetzung")
  
  // Verknüpfung zum Vorhaben
  _bpf_sgsw_digitalisierungsvorhabenid_value?: string;
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
