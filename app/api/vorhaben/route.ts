/**
 * API Route: /api/vorhaben
 * 
 * GET: Liste aller Digitalisierungsvorhaben (mit optionalen Filtern)
 * POST: Neues Vorhaben erstellen
 */

import { NextRequest, NextResponse } from 'next/server';
import { getVorhabenService } from '@/lib/services/dataverse/vorhabenService';
import { isAuthenticated } from '@/lib/services/dataverse/tokenService';
import { DigitalisierungsvorhabenInput } from '@/lib/services/dataverse/types';

/**
 * GET /api/vorhaben
 * 
 * Query-Parameter:
 * - typ: Filter nach Typ (OptionSet-Wert, z.B. 562520000)
 * - kritikalitaet: Filter nach Kritikalität (OptionSet-Wert)
 * - lifecyclestatus: Filter nach Lifecycle-Status (OptionSet-Wert)
 * - search: Suche im Titel (cr6df_name)
 */
export async function GET(request: NextRequest) {
  try {
    // Auth-Check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert. Bitte zuerst anmelden.' },
        { status: 401 }
      );
    }

    const service = getVorhabenService();
    const searchParams = request.nextUrl.searchParams;

    // Filter aus Query-Parametern extrahieren
    const typ = searchParams.get('typ');
    const kritikalitaet = searchParams.get('kritikalitaet');
    const lifecyclestatus = searchParams.get('lifecyclestatus');
    const search = searchParams.get('search');

    let vorhaben;

    // Filter anwenden (nur einer gleichzeitig für Einfachheit)
    if (typ) {
      vorhaben = await service.listByTyp(parseInt(typ, 10));
    } else if (kritikalitaet) {
      vorhaben = await service.listByKritikalitaet(parseInt(kritikalitaet, 10));
    } else if (lifecyclestatus) {
      vorhaben = await service.listByLifecycleStatus(parseInt(lifecyclestatus, 10));
    } else if (search) {
      vorhaben = await service.searchByTitel(search);
    } else {
      // Keine Filter - alle laden
      vorhaben = await service.listAll();
    }

    return NextResponse.json({
      success: true,
      count: vorhaben.length,
      data: vorhaben,
    });
  } catch (error) {
    console.error('[API/Vorhaben] GET Fehler:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const isAuthError = errorMessage.includes('authentifiziert') || errorMessage.includes('Token');
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

/**
 * POST /api/vorhaben
 * 
 * Body: DigitalisierungsvorhabenInput
 */
export async function POST(request: NextRequest) {
  try {
    // Auth-Check
    if (!isAuthenticated()) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert. Bitte zuerst anmelden.' },
        { status: 401 }
      );
    }

    const body = await request.json() as DigitalisierungsvorhabenInput;

    // Einfache Validierung: Titel (cr6df_name) ist erforderlich
    if (!body.cr6df_name || body.cr6df_name.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Titel ist erforderlich' },
        { status: 400 }
      );
    }

    const service = getVorhabenService();
    const created = await service.createVorhaben(body);

    return NextResponse.json({
      success: true,
      data: created,
    }, { status: 201 });
  } catch (error) {
    console.error('[API/Vorhaben] POST Fehler:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
