/**
 * Detail-Seite für ein einzelnes Digitalisierungsvorhaben
 * 
 * Zeigt alle Informationen an (read-only) ausser Planung.
 * Planung kann über ein Modal bearbeitet werden.
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
  Edit3,
  FileText,
  BarChart3,
  Clock,
} from 'lucide-react';
import LoginPrompt from '@/components/dataverse/LoginPrompt';
import PlanungModal from '@/components/vorhaben/PlanungModal';
import AppHeader from '@/components/layout/AppHeader';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';
import { 
  TYP_OPTIONS, 
  KOMPLEXITAET_OPTIONS, 
  KRITIKALITAET_OPTIONS,
  LIFECYCLE_STATUS_OPTIONS,
} from '@/lib/validators/vorhabenSchema';

// API Response-Typen
interface AuthStatusResponse {
  isAuthenticated: boolean;
}

interface VorhabenResponse {
  success: boolean;
  data?: DigitalisierungsvorhabenRecord;
  error?: string;
}

/**
 * Hilfsfunktion: Gibt das Label für einen OptionSet-Wert zurück
 */
function getOptionLabel(
  value: number | undefined,
  options: readonly { value: number; label: string }[]
): string {
  if (value === undefined || value === null) return '-';
  const option = options.find((o) => o.value === value);
  return option?.label || '-';
}

/**
 * Hilfsfunktion: Formatiert ein Datum für die Anzeige
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('de-CH');
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

  // Modal-Status
  const [isPlanungModalOpen, setIsPlanungModalOpen] = useState(false);
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
   * Speichert die Planungsdaten
   */
  const handleSavePlanung = async (data: { start: string; ende: string }) => {
    const dataToSend: Record<string, string | null> = {};
    
    if (data.start) {
      dataToSend.cr6df_planung_geplanterstart = `${data.start}T00:00:00Z`;
    }
    if (data.ende) {
      dataToSend.cr6df_planung_geplantesende = `${data.ende}T00:00:00Z`;
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

    // Vorhaben aktualisieren
    setVorhaben(result.data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  /**
   * Logout-Handler
   */
  const handleLogout = async () => {
    try {
      await fetch('/api/dataverse/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout-Fehler:', err);
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
      {/* App Header */}
      <AppHeader onLogout={handleLogout} isAuthenticated={isAuthenticated} />

      {/* Sub-Header mit Titel */}
      <div className="bg-base-100 border-b">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {vorhaben?.cr6df_name || 'Vorhaben laden...'}
              </h1>
              <div className="flex items-center gap-3 text-sm text-base-content/60 mt-1">
                <span className="badge badge-outline badge-sm">
                  {vorhaben?.cr6df_newcolumn || '-'}
                </span>
                {vorhaben?.createdon && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(vorhaben.createdon)}
                  </span>
                )}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={loadVorhaben}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

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

        {/* Vorhaben-Details (Read-Only) */}
        {!isLoading && vorhaben && (
          <div className="space-y-6">
            {/* Beschreibung */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Beschreibung
                </h3>
                <p className="text-base-content/80 whitespace-pre-wrap">
                  {vorhaben.cr6df_beschreibung || 'Keine Beschreibung vorhanden.'}
                </p>
              </div>
            </div>

            {/* Status & Klassifizierung (Read-Only) */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Status & Klassifizierung
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <div className="text-sm text-base-content/60">Typ</div>
                    <div className="font-medium">
                      {getOptionLabel(vorhaben.cr6df_typ, TYP_OPTIONS)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-base-content/60">Lifecycle-Status</div>
                    <div className="font-medium">
                      {getOptionLabel(vorhaben.cr6df_lifecyclestatus, LIFECYCLE_STATUS_OPTIONS)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-base-content/60">Kritikalität</div>
                    <div className="font-medium">
                      {getOptionLabel(vorhaben.cr6df_kritikalitaet, KRITIKALITAET_OPTIONS)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-base-content/60">Komplexität</div>
                    <div className="font-medium">
                      {getOptionLabel(vorhaben.cr6df_komplexitaet, KOMPLEXITAET_OPTIONS)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personen (Read-Only) */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-sm text-base-content/60">Verantwortlich</div>
                    <div className="font-medium">
                      {vorhaben._cr6df_verantwortlicher_value ? '(Zugewiesen)' : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-base-content/60">Ideengeber</div>
                    <div className="font-medium">
                      {vorhaben._cr6df_ideengeber_value ? '(Zugewiesen)' : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Planung (Editierbar) */}
            <div className="card bg-base-100 shadow-sm border-2 border-primary/20">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h3 className="card-title text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Planung
                  </h3>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsPlanungModalOpen(true)}
                  >
                    <Edit3 className="w-4 h-4" />
                    Bearbeiten
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <div className="text-sm text-base-content/60">Geplanter Start</div>
                    <div className="font-medium">
                      {formatDate(vorhaben.cr6df_planung_geplanterstart)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-base-content/60">Geplantes Ende</div>
                    <div className="font-medium">
                      {formatDate(vorhaben.cr6df_planung_geplantesende)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-base-content/60">Personentage</div>
                    <div className="font-medium">
                      {vorhaben.cr6df_detailanalyse_personentage ?? '-'}
                    </div>
                  </div>
                </div>

                {/* Visuelle Zeitleiste wenn Daten vorhanden */}
                {vorhaben.cr6df_planung_geplanterstart && vorhaben.cr6df_planung_geplantesende && (
                  <div className="bg-base-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="badge badge-primary">
                        {formatDate(vorhaben.cr6df_planung_geplanterstart)}
                      </span>
                      <div className="flex-1 h-1 bg-primary/30 rounded"></div>
                      <span className="badge badge-primary">
                        {formatDate(vorhaben.cr6df_planung_geplantesende)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ITOT Board Begründung (Read-Only) */}
            {vorhaben.cr6df_itotboard_begruendung && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg">ITOT Board Begründung</h3>
                  <p className="text-base-content/80 whitespace-pre-wrap">
                    {vorhaben.cr6df_itotboard_begruendung}
                  </p>
                </div>
              </div>
            )}
          </div>
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

      {/* Planungs-Modal */}
      <PlanungModal
        isOpen={isPlanungModalOpen}
        onClose={() => setIsPlanungModalOpen(false)}
        onSave={handleSavePlanung}
        initialStart={vorhaben?.cr6df_planung_geplanterstart}
        initialEnde={vorhaben?.cr6df_planung_geplantesende}
      />
    </div>
  );
}
