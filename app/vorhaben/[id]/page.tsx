/**
 * Detail-Seite für ein einzelnes Digitalisierungsvorhaben
 * 
 * Zeigt alle Informationen an und ermöglicht die Bearbeitung.
 * Verwendet React Hook Form + Zod für die Formulare.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  User,
  CheckCircle,
} from 'lucide-react';
import LoginPrompt from '@/components/dataverse/LoginPrompt';
import VorhabenEditForm from '@/components/vorhaben/VorhabenEditForm';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';
import { VorhabenEditFormData } from '@/lib/validators/vorhabenSchema';

// API Response-Typen
interface AuthStatusResponse {
  isAuthenticated: boolean;
}

interface VorhabenResponse {
  success: boolean;
  data?: DigitalisierungsvorhabenRecord;
  error?: string;
}

export default function VorhabenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Auth-Status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Daten
  const [vorhaben, setVorhaben] = useState<DigitalisierungsvorhabenRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Formular-Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /**
   * Prüft den Auth-Status
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/dataverse/auth');
      const data: AuthStatusResponse = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  /**
   * Lädt das Vorhaben von der API
   */
  const loadVorhaben = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/vorhaben/${id}`);
      const data: VorhabenResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Laden');
      }

      setVorhaben(data.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setVorhaben(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  /**
   * Speichert die Änderungen
   */
  const handleSubmit = async (formData: VorhabenEditFormData) => {
    setIsSubmitting(true);
    setSaveSuccess(false);
    setError('');

    try {
      // Nur geänderte Felder senden (nicht-leere Werte)
      const dataToSend: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(formData)) {
        // Überspringe leere Strings und null-Werte
        if (value !== '' && value !== null && value !== undefined) {
          // Für Datumsfelder: Sicherstellen, dass sie im ISO-Format sind
          if (key.includes('planung_') && typeof value === 'string') {
            dataToSend[key] = value ? `${value}T00:00:00Z` : null;
          } else {
            dataToSend[key] = value;
          }
        }
      }

      const response = await fetch(`/api/vorhaben/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Speichern fehlgeschlagen');
      }

      // Erfolgreich gespeichert
      setSaveSuccess(true);
      setVorhaben(result.data);
      
      // Erfolgsmeldung nach 3 Sekunden ausblenden
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speichern fehlgeschlagen');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Login-Success Handler
   */
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Auth-Status beim Mount prüfen
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Vorhaben laden, wenn authentifiziert
  useEffect(() => {
    if (isAuthenticated && id) {
      loadVorhaben();
    }
  }, [isAuthenticated, id, loadVorhaben]);

  // Loading-State beim ersten Laden
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Nicht angemeldet
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginPrompt onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-sm">
        <div className="flex-1 gap-2">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Link>
          <span className="text-lg font-semibold">
            {vorhaben?.cr6df_name || vorhaben?.cr6df_newcolumn || 'Vorhaben'}
          </span>
        </div>
        <div className="flex-none gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={loadVorhaben}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Fehleranzeige */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button className="btn btn-sm btn-ghost" onClick={loadVorhaben}>
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Erfolgsmeldung */}
        {saveSuccess && (
          <div className="alert alert-success mb-6">
            <CheckCircle className="w-5 h-5" />
            <span>Änderungen erfolgreich gespeichert!</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Vorhaben-Details */}
        {!isLoading && vorhaben && (
          <>
            {/* Meta-Informationen */}
            <div className="card bg-base-100 shadow-sm mb-6">
              <div className="card-body">
                <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
                  <span className="badge badge-outline">
                    {vorhaben.cr6df_newcolumn}
                  </span>
                  {vorhaben.createdon && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Erstellt: {new Date(vorhaben.createdon).toLocaleDateString('de-CH')}
                    </span>
                  )}
                  {vorhaben._cr6df_verantwortlicher_value && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Verantwortlich (Lookup)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bearbeitungsformular */}
            <VorhabenEditForm
              vorhaben={vorhaben}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </>
        )}

        {/* Nicht gefunden */}
        {!isLoading && !vorhaben && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-warning mb-4" />
            <h2 className="text-xl font-semibold mb-2">Vorhaben nicht gefunden</h2>
            <p className="text-base-content/70 mb-4">
              Das angeforderte Vorhaben existiert nicht oder wurde gelöscht.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => router.push('/dashboard')}
            >
              Zum Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
