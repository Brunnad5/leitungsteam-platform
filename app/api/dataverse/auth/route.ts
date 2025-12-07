/**
 * API Route: /api/dataverse/auth
 * 
 * GET: Prüft den aktuellen Auth-Status
 * DELETE: Logout (löscht alle Tokens)
 */

import { NextResponse } from 'next/server';
import { getAuthStatus, logout } from '@/lib/services/dataverse/tokenService';

/**
 * GET /api/dataverse/auth
 * Gibt den aktuellen Authentifizierungs-Status zurück
 */
export async function GET() {
  try {
    const status = getAuthStatus();
    
    return NextResponse.json({
      success: true,
      isAuthenticated: status.isAuthenticated,
      expiresIn: status.expiresIn,
    });
  } catch (error) {
    console.error('[Auth] Fehler beim Status-Check:', error);
    
    return NextResponse.json(
      {
        success: false,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dataverse/auth
 * Meldet den Benutzer ab und löscht alle gespeicherten Tokens
 */
export async function DELETE() {
  try {
    logout();
    
    return NextResponse.json({
      success: true,
      message: 'Erfolgreich abgemeldet',
    });
  } catch (error) {
    console.error('[Auth] Fehler beim Logout:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}
