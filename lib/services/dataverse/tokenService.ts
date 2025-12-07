/**
 * Token Service für Dataverse OAuth-Authentifizierung
 * 
 * Verwendet den Device Code Flow - funktioniert ohne eigene Azure AD App-Registrierung.
 * Der Benutzer erhält einen Code, den er auf microsoft.com/devicelogin eingibt.
 * 
 * Token-Persistenz:
 * - Lokal: .next/dataverse-token-cache.json
 * - Vercel: /tmp/dataverse-token-cache.json (nicht persistent über Cold Starts!)
 */

import { DeviceCodeResponse, TokenResponse, TokenCache } from './types';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Konfiguration aus Umgebungsvariablen
// ============================================

const DATAVERSE_URL = process.env.DATAVERSE_URL || '';
const CLIENT_ID = process.env.DATAVERSE_CLIENT_ID || '04b07795-8ddb-461a-bbee-02f9e1bf7b46';
const TENANT_ID = process.env.DATAVERSE_TENANT_ID || 'common';

// Azure AD v1 Endpoints (Device Code Flow)
const DEVICE_CODE_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/devicecode`;
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`;

// Token-Cache Dateipfad
// Auf Vercel liegt /tmp, lokal nutzen wir .next/
const isVercel = process.env.VERCEL === '1';
const CACHE_FILE = isVercel
  ? '/tmp/dataverse-token-cache.json'
  : path.join(process.cwd(), '.next', 'dataverse-token-cache.json');

// Erneuerung 5 Minuten vor Ablauf
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

// ============================================
// Cache-Funktionen (File-basiert)
// ============================================

/**
 * Lädt den Token-Cache aus der Datei
 * Gibt null zurück, wenn keine Datei existiert
 */
function loadTokenCache(): TokenCache | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(data) as TokenCache;
    }
  } catch (error) {
    console.error('[TokenService] Fehler beim Laden des Token-Cache:', error);
  }
  return null;
}

/**
 * Speichert den Token-Cache in die Datei
 */
function saveTokenCache(cache: TokenCache): void {
  try {
    // Stelle sicher, dass das Verzeichnis existiert
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('[TokenService] Fehler beim Speichern des Token-Cache:', error);
  }
}

/**
 * Löscht den Token-Cache (Logout)
 */
function clearTokenCache(): void {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch (error) {
    console.error('[TokenService] Fehler beim Löschen des Token-Cache:', error);
  }
}

// ============================================
// Device Code Flow - Anmeldung starten
// ============================================

/**
 * Startet den Device Code Flow
 * Gibt user_code und verification_url zurück, die dem Benutzer angezeigt werden
 */
export async function initiateDeviceCodeFlow(): Promise<DeviceCodeResponse> {
  if (!DATAVERSE_URL) {
    throw new Error('DATAVERSE_URL ist nicht konfiguriert. Bitte .env.local prüfen.');
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    resource: DATAVERSE_URL,  // Die Dataverse-URL als Resource (v1 Endpoint)
  });

  const response = await fetch(DEVICE_CODE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Device Code Flow fehlgeschlagen: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Azure AD v1 nutzt "verification_url" (nicht "verification_uri" wie v2!)
  return {
    device_code: data.device_code,
    user_code: data.user_code,
    verification_url: data.verification_url || data.verification_uri,
    expires_in: data.expires_in,
    interval: data.interval || 5,
    message: data.message,
  };
}

// ============================================
// Device Code Flow - Token abholen (Polling)
// ============================================

/**
 * Pollt den Token-Endpoint einmal
 * Gibt 'pending', 'success' oder 'error' zurück
 */
export async function pollForToken(deviceCode: string): Promise<{
  status: 'pending' | 'success' | 'expired' | 'error';
  error?: string;
}> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'device_code',
    code: deviceCode,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json();

  // Prüfe auf Polling-Status
  if (data.error) {
    // authorization_pending = Benutzer hat noch nicht autorisiert
    if (data.error === 'authorization_pending') {
      return { status: 'pending' };
    }
    // expired_token = Device Code ist abgelaufen
    if (data.error === 'expired_token') {
      return { status: 'expired', error: 'Der Anmelde-Code ist abgelaufen. Bitte erneut starten.' };
    }
    // Anderer Fehler
    return { status: 'error', error: data.error_description || data.error };
  }

  // Erfolg! Token speichern
  const tokenResponse = data as TokenResponse;
  const cache: TokenCache = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    resource: tokenResponse.resource || DATAVERSE_URL,
  };
  saveTokenCache(cache);

  return { status: 'success' };
}

// ============================================
// Token-Erneuerung
// ============================================

/**
 * Erneuert das Access Token mit dem Refresh Token
 * Wird automatisch aufgerufen, wenn das Token bald abläuft
 */
async function refreshAccessToken(): Promise<boolean> {
  const cache = loadTokenCache();
  if (!cache?.refreshToken) {
    return false;
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: cache.refreshToken,
    resource: cache.resource || DATAVERSE_URL,
  });

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error('[TokenService] Token-Erneuerung fehlgeschlagen:', response.status);
      // Bei Fehler: Cache löschen, Benutzer muss sich neu anmelden
      clearTokenCache();
      return false;
    }

    const data = await response.json() as TokenResponse;
    
    // Neuen Token speichern
    const newCache: TokenCache = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || cache.refreshToken, // Manche Flows geben keinen neuen Refresh Token
      expiresAt: Date.now() + data.expires_in * 1000,
      resource: data.resource || cache.resource,
    };
    saveTokenCache(newCache);
    
    console.log('[TokenService] Token erfolgreich erneuert');
    return true;
  } catch (error) {
    console.error('[TokenService] Fehler bei Token-Erneuerung:', error);
    return false;
  }
}

// ============================================
// Öffentliche API
// ============================================

/**
 * Prüft, ob der Benutzer authentifiziert ist
 * Ein Token gilt als gültig, wenn es existiert und nicht abgelaufen ist
 */
export function isAuthenticated(): boolean {
  const cache = loadTokenCache();
  if (!cache?.accessToken) {
    return false;
  }
  // Token ist gültig, wenn es noch nicht abgelaufen ist
  return cache.expiresAt > Date.now();
}

/**
 * Gibt ein gültiges Access Token zurück
 * Erneuert automatisch, wenn das Token bald abläuft
 * Wirft einen Fehler, wenn kein gültiges Token vorhanden ist
 */
export async function getValidToken(): Promise<string> {
  const cache = loadTokenCache();
  
  if (!cache?.accessToken) {
    throw new Error('Nicht authentifiziert. Bitte zuerst anmelden.');
  }

  // Prüfe, ob Token bald abläuft (innerhalb von 5 Minuten)
  const needsRefresh = cache.expiresAt - Date.now() < TOKEN_REFRESH_BUFFER_MS;
  
  if (needsRefresh) {
    console.log('[TokenService] Token läuft bald ab, erneuere...');
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      throw new Error('Token konnte nicht erneuert werden. Bitte erneut anmelden.');
    }
    // Lade den aktualisierten Cache
    const newCache = loadTokenCache();
    return newCache!.accessToken;
  }

  return cache.accessToken;
}

/**
 * Gibt Informationen zum aktuellen Auth-Status zurück
 * Für die UI, um anzuzeigen, ob/wann das Token abläuft
 */
export function getAuthStatus(): {
  isAuthenticated: boolean;
  expiresIn?: number;
} {
  const cache = loadTokenCache();
  
  if (!cache?.accessToken || cache.expiresAt <= Date.now()) {
    return { isAuthenticated: false };
  }

  return {
    isAuthenticated: true,
    expiresIn: Math.floor((cache.expiresAt - Date.now()) / 1000), // Sekunden bis Ablauf
  };
}

/**
 * Logout - löscht alle gespeicherten Tokens
 */
export function logout(): void {
  clearTokenCache();
  console.log('[TokenService] Benutzer abgemeldet, Token-Cache gelöscht');
}
