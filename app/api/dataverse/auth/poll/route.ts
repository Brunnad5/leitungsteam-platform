/**
 * API Route: /api/dataverse/auth/poll
 * 
 * Pollt den Token-Endpoint mit dem Device Code.
 * Der Client ruft diese Route wiederholt auf, bis der Benutzer
 * die Anmeldung abgeschlossen hat.
 */

import { NextRequest, NextResponse } from 'next/server';
import { pollForToken } from '@/lib/services/dataverse/tokenService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceCode } = body;

    if (!deviceCode) {
      return NextResponse.json(
        { success: false, error: 'deviceCode fehlt im Request-Body' },
        { status: 400 }
      );
    }

    const result = await pollForToken(deviceCode);

    return NextResponse.json({
      success: result.status === 'success',
      status: result.status,
      error: result.error,
    });
  } catch (error) {
    console.error('[Auth/Poll] Fehler:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}
