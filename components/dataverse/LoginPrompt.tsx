/**
 * LoginPrompt - Komponente für die Microsoft-Anmeldung
 * 
 * Zeigt den Device Code Flow: Benutzer erhält einen Code,
 * den er auf microsoft.com/devicelogin eingeben muss.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogIn, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

// Typen für die API-Responses
interface LoginResponse {
  success: boolean;
  userCode?: string;
  verificationUrl?: string;
  deviceCode?: string;
  expiresIn?: number;
  interval?: number;
  message?: string;
  error?: string;
}

interface PollResponse {
  success: boolean;
  status: 'pending' | 'success' | 'expired' | 'error';
  error?: string;
}

interface LoginPromptProps {
  onLoginSuccess: () => void;
}

export default function LoginPrompt({ onLoginSuccess }: LoginPromptProps) {
  // Status der Anmeldung
  const [status, setStatus] = useState<'idle' | 'loading' | 'waiting' | 'success' | 'error'>('idle');
  const [userCode, setUserCode] = useState<string>('');
  const [verificationUrl, setVerificationUrl] = useState<string>('');
  const [deviceCode, setDeviceCode] = useState<string>('');
  const [pollInterval, setPollInterval] = useState<number>(5);
  const [error, setError] = useState<string>('');

  /**
   * Startet den Login-Prozess
   * Holt den Device Code und zeigt dem Benutzer den User Code an
   */
  const startLogin = async () => {
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/dataverse/auth/login');
      const data: LoginResponse = await response.json();

      if (!data.success || !data.userCode) {
        throw new Error(data.error || 'Login konnte nicht gestartet werden');
      }

      setUserCode(data.userCode);
      setVerificationUrl(data.verificationUrl || 'https://microsoft.com/devicelogin');
      setDeviceCode(data.deviceCode || '');
      setPollInterval(data.interval || 5);
      setStatus('waiting');

      // Öffne die Anmeldeseite in einem neuen Tab
      window.open(data.verificationUrl || 'https://microsoft.com/devicelogin', '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setStatus('error');
    }
  };

  /**
   * Pollt den Token-Endpoint
   * Wird aufgerufen, sobald der Benutzer den Code eingegeben hat
   */
  const pollForToken = useCallback(async () => {
    if (!deviceCode || status !== 'waiting') return;

    try {
      const response = await fetch('/api/dataverse/auth/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode }),
      });
      const data: PollResponse = await response.json();

      if (data.status === 'success') {
        setStatus('success');
        // Kurz warten, dann Callback aufrufen
        setTimeout(() => onLoginSuccess(), 1500);
      } else if (data.status === 'expired' || data.status === 'error') {
        setError(data.error || 'Anmeldung fehlgeschlagen');
        setStatus('error');
      }
      // Bei 'pending' einfach weiter pollen (wird durch useEffect getriggert)
    } catch (err) {
      console.error('Polling-Fehler:', err);
    }
  }, [deviceCode, status, onLoginSuccess]);

  // Polling-Effekt
  useEffect(() => {
    if (status !== 'waiting' || !deviceCode) return;

    const intervalId = setInterval(pollForToken, pollInterval * 1000);
    
    // Cleanup beim Unmount oder Status-Änderung
    return () => clearInterval(intervalId);
  }, [status, deviceCode, pollInterval, pollForToken]);

  return (
    <div className="card bg-base-200 shadow-xl max-w-md mx-auto">
      <div className="card-body items-center text-center">
        {/* Idle - Noch nicht gestartet */}
        {status === 'idle' && (
          <>
            <h2 className="card-title">Anmeldung erforderlich</h2>
            <p className="text-base-content/70">
              Um auf die Daten zuzugreifen, musst du dich mit deinem Microsoft-Konto anmelden.
            </p>
            <div className="card-actions mt-4">
              <button className="btn btn-primary" onClick={startLogin}>
                <LogIn className="w-5 h-5" />
                Mit Microsoft anmelden
              </button>
            </div>
          </>
        )}

        {/* Loading - Login wird gestartet */}
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4">Anmeldung wird vorbereitet...</p>
          </>
        )}

        {/* Waiting - Benutzer muss Code eingeben */}
        {status === 'waiting' && (
          <>
            <h2 className="card-title">Code eingeben</h2>
            <p className="text-base-content/70">
              Gib diesen Code auf der Microsoft-Anmeldeseite ein:
            </p>
            
            {/* Grosser Code-Display */}
            <div className="bg-primary text-primary-content text-3xl font-mono font-bold px-6 py-4 rounded-lg my-4 tracking-wider">
              {userCode}
            </div>
            
            <a 
              href={verificationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {verificationUrl}
            </a>
            
            <div className="flex items-center gap-2 mt-4 text-base-content/50">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Warte auf Anmeldung...</span>
            </div>
          </>
        )}

        {/* Success - Erfolgreich angemeldet */}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-success" />
            <h2 className="card-title text-success mt-4">Erfolgreich angemeldet!</h2>
            <p className="text-base-content/70">Du wirst weitergeleitet...</p>
          </>
        )}

        {/* Error - Fehler aufgetreten */}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-error" />
            <h2 className="card-title text-error mt-4">Fehler</h2>
            <p className="text-base-content/70">{error}</p>
            <div className="card-actions mt-4">
              <button className="btn btn-primary" onClick={startLogin}>
                Erneut versuchen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
