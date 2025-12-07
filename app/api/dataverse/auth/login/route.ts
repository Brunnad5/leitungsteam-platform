/**
 * API Route: /api/dataverse/auth/login
 * 
 * Startet den Device Code Flow für die Microsoft-Anmeldung.
 * Der Benutzer erhält einen Code, den er auf microsoft.com/devicelogin eingibt.
 */

import { NextResponse } from 'next/server';
import { initiateDeviceCodeFlow } from '@/lib/services/dataverse/tokenService';

export async function GET() {
  try {
    const deviceCode = await initiateDeviceCodeFlow();
    
    return NextResponse.json({
      success: true,
      userCode: deviceCode.user_code,
      verificationUrl: deviceCode.verification_url,
      deviceCode: deviceCode.device_code,
      expiresIn: deviceCode.expires_in,
      interval: deviceCode.interval,
      message: deviceCode.message,
    });
  } catch (error) {
    console.error('[Auth/Login] Fehler:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}
