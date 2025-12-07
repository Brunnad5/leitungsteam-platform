/**
 * API Route: /api/dataverse/whoami
 * 
 * Testet die Verbindung zu Dataverse und gibt Informationen
 * über den angemeldeten Benutzer zurück.
 * 
 * Nützlich zum Verifizieren, dass die Authentifizierung funktioniert.
 */

import { NextResponse } from 'next/server';
import { getWhoAmI } from '@/lib/services/dataverse/dataverseClient';
import { isAuthenticated } from '@/lib/services/dataverse/tokenService';

export async function GET() {
  try {
    // Prüfe zuerst, ob überhaupt ein Token vorhanden ist
    if (!isAuthenticated()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nicht authentifiziert. Bitte zuerst anmelden unter /api/dataverse/auth/login',
        },
        { status: 401 }
      );
    }

    // Rufe WhoAmI auf
    const whoAmI = await getWhoAmI();
    
    return NextResponse.json({
      success: true,
      userId: whoAmI.UserId,
      businessUnitId: whoAmI.BusinessUnitId,
      organizationId: whoAmI.OrganizationId,
    });
  } catch (error) {
    console.error('[WhoAmI] Fehler:', error);
    
    // Unterscheide zwischen Auth-Fehlern und anderen Fehlern
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const isAuthError = errorMessage.includes('authentifiziert') || errorMessage.includes('Token');
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
