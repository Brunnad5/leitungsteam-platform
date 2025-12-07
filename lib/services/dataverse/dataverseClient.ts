/**
 * Generischer Dataverse Client für CRUD-Operationen
 * 
 * Diese Klasse kann für beliebige Dataverse-Tabellen verwendet werden.
 * Sie nutzt den TokenService für die Authentifizierung und
 * implementiert die OData-Protokoll-Aufrufe.
 * 
 * Verwendung:
 * const client = new BaseDataverseClient<MeineEntity>('meine_entitys');
 * const daten = await client.list();
 */

import { getValidToken } from './tokenService';
import { DataverseListResponse, WhoAmIResponse, DataverseError } from './types';

// Dataverse API-Version
const API_VERSION = 'v9.2';

// Basis-URL aus Umgebungsvariablen
const DATAVERSE_URL = process.env.DATAVERSE_URL || '';

/**
 * Generischer Base Client für Dataverse-Tabellen
 * T ist der Typ der Entity (z.B. DigitalisierungsvorhabenRecord)
 */
export class BaseDataverseClient<T> {
  protected entitySetName: string;
  protected baseUrl: string;

  /**
   * Erstellt einen neuen Client für eine Dataverse-Tabelle
   * @param entitySetName - Der EntitySet-Name (z.B. "sgsw_digitalisierungsvorhabens")
   */
  constructor(entitySetName: string) {
    this.entitySetName = entitySetName;
    this.baseUrl = `${DATAVERSE_URL}/api/data/${API_VERSION}`;
  }

  /**
   * Erstellt die Standard-Header für API-Requests
   * Holt automatisch ein gültiges Token
   */
  protected async getHeaders(): Promise<Headers> {
    const token = await getValidToken();
    
    return new Headers({
      'Authorization': `Bearer ${token}`,
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    });
  }

  /**
   * Verarbeitet die API-Response und wirft bei Fehlern eine Exception
   */
  protected async handleResponse<R>(response: Response): Promise<R> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json() as DataverseError;
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Wenn JSON-Parsing fehlschlägt, nutze die Standard-Fehlermeldung
      }

      throw new Error(errorMessage);
    }

    // Bei DELETE (204 No Content) gibt es keinen Body
    if (response.status === 204) {
      return {} as R;
    }

    return response.json() as Promise<R>;
  }

  // ============================================
  // CRUD-Operationen
  // ============================================

  /**
   * Listet alle Datensätze einer Tabelle auf
   * 
   * @param select - Array von Feldnamen, die zurückgegeben werden sollen
   * @param filter - OData-Filter (z.B. "sgsw_typ eq 1")
   * @param top - Maximale Anzahl Datensätze
   * @param orderby - Sortierung (z.B. "createdon desc")
   */
  async list(options?: {
    select?: string[];
    filter?: string;
    top?: number;
    orderby?: string;
  }): Promise<T[]> {
    const headers = await this.getHeaders();
    
    // Query-Parameter zusammenbauen
    const params = new URLSearchParams();
    
    if (options?.select?.length) {
      params.append('$select', options.select.join(','));
    }
    if (options?.filter) {
      params.append('$filter', options.filter);
    }
    if (options?.top) {
      params.append('$top', options.top.toString());
    }
    if (options?.orderby) {
      params.append('$orderby', options.orderby);
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/${this.entitySetName}${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await this.handleResponse<DataverseListResponse<T>>(response);
    return data.value;
  }

  /**
   * Holt einen einzelnen Datensatz per GUID
   * 
   * @param id - Die GUID des Datensatzes (ohne Klammern)
   * @param select - Array von Feldnamen, die zurückgegeben werden sollen
   */
  async get(id: string, select?: string[]): Promise<T> {
    const headers = await this.getHeaders();
    
    const params = new URLSearchParams();
    if (select?.length) {
      params.append('$select', select.join(','));
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/${this.entitySetName}(${id})${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Erstellt einen neuen Datensatz
   * 
   * @param data - Die Daten für den neuen Datensatz
   * @returns Der erstellte Datensatz mit allen Feldern
   */
  async create(data: Partial<T>): Promise<T> {
    const headers = await this.getHeaders();
    // Mit Prefer-Header wird der erstellte Datensatz zurückgegeben
    headers.set('Prefer', 'return=representation');

    const url = `${this.baseUrl}/${this.entitySetName}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Aktualisiert einen bestehenden Datensatz (partiell)
   * 
   * @param id - Die GUID des Datensatzes
   * @param data - Die zu aktualisierenden Felder
   * @returns Der aktualisierte Datensatz
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const headers = await this.getHeaders();
    headers.set('Prefer', 'return=representation');

    const url = `${this.baseUrl}/${this.entitySetName}(${id})`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Löscht einen Datensatz
   * 
   * @param id - Die GUID des Datensatzes
   */
  async delete(id: string): Promise<void> {
    const headers = await this.getHeaders();

    const url = `${this.baseUrl}/${this.entitySetName}(${id})`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    await this.handleResponse<void>(response);
  }

  // ============================================
  // Utility-Methoden
  // ============================================

  /**
   * Zählt die Anzahl Datensätze (mit optionalem Filter)
   */
  async count(filter?: string): Promise<number> {
    const headers = await this.getHeaders();
    
    const params = new URLSearchParams();
    params.append('$count', 'true');
    params.append('$top', '0'); // Keine Daten, nur Anzahl
    
    if (filter) {
      params.append('$filter', filter);
    }

    const url = `${this.baseUrl}/${this.entitySetName}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await this.handleResponse<DataverseListResponse<T>>(response);
    return data['@odata.count'] || 0;
  }
}

// ============================================
// Standalone-Funktionen
// ============================================

/**
 * Ruft die WhoAmI-API auf - zeigt den angemeldeten Benutzer
 * Nützlich zum Testen der Verbindung
 */
export async function getWhoAmI(): Promise<WhoAmIResponse> {
  const token = await getValidToken();
  
  const url = `${DATAVERSE_URL}/api/data/${API_VERSION}/WhoAmI`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'OData-Version': '4.0',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`WhoAmI fehlgeschlagen: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
