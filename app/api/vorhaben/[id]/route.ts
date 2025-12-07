/**
 * API Route: /api/vorhaben/[id]
 * 
 * GET: Einzelnes Vorhaben abrufen
 * PATCH: Vorhaben aktualisieren
 * DELETE: Vorhaben löschen
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVorhabenService } from '@/lib/services/dataverse/vorhabenService';
import { isAuthenticated } from '@/lib/services/dataverse/tokenService';
import { DigitalisierungsvorhabenInput } from '@/lib/services/dataverse/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/vorhaben/[id]
 * Holt ein einzelnes Vorhaben mit allen Details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth-Check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert. Bitte zuerst anmelden.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID fehlt' },
        { status: 400 }
      );
    }

    const service = getVorhabenService();
    const vorhaben = await service.getById(id);

    return NextResponse.json({
      success: true,
      data: vorhaben,
    });
  } catch (error) {
    console.error('[API/Vorhaben/ID] GET Fehler:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found');
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: isNotFound ? 404 : 500 }
    );
  }
}

/**
 * PATCH /api/vorhaben/[id]
 * Aktualisiert ein bestehendes Vorhaben (partiell)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth-Check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert. Bitte zuerst anmelden.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID fehlt' },
        { status: 400 }
      );
    }

    const body = await request.json() as Partial<DigitalisierungsvorhabenInput>;

    // Prüfe, ob überhaupt Daten gesendet wurden
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keine Daten zum Aktualisieren' },
        { status: 400 }
      );
    }

    const service = getVorhabenService();
    const updated = await service.updateVorhaben(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[API/Vorhaben/ID] PATCH Fehler:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vorhaben/[id]
 * Löscht ein Vorhaben
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth-Check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert. Bitte zuerst anmelden.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID fehlt' },
        { status: 400 }
      );
    }

    const service = getVorhabenService();
    await service.deleteVorhaben(id);

    return NextResponse.json({
      success: true,
      message: 'Vorhaben erfolgreich gelöscht',
    });
  } catch (error) {
    console.error('[API/Vorhaben/ID] DELETE Fehler:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
