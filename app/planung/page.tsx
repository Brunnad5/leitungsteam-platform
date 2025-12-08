/**
 * Planung-Seite - Übersicht aller Vorhaben in Planungsphasen
 * 
 * Zeigt vier kategorisierte Listen:
 * 1. In Planung - Projektportfolio
 * 2. In Planung - Quartalsplanung
 * 3. In Planung - Wochenplanung
 * 4. In Umsetzung
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import LoginPrompt from '@/components/dataverse/LoginPrompt';
import AppHeader from '@/components/layout/AppHeader';
import VorhabenCollapsibleList from '@/components/vorhaben/VorhabenCollapsibleList';
import PlanungUebersichtKalender from '@/components/vorhaben/PlanungUebersichtKalender';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';
import { LIFECYCLE_STATUS } from '@/lib/validators/vorhabenSchema';

// Typen für API-Responses
interface AuthStatusResponse {
  isAuthenticated: boolean;
}

interface VorhabenResponse {
  success: boolean;
  data?: DigitalisierungsvorhabenRecord[];
  error?: string;
}

export default function PlanungPage() {
  // Auth-Status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Daten
  const [vorhaben, setVorhaben] = useState<DigitalisierungsvorhabenRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
   * Lädt alle Vorhaben von der API
   */
  const loadVorhaben = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/vorhaben');
      const data: VorhabenResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Laden der Daten');
      }

      setVorhaben(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setVorhaben([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  // Auth-Status prüfen beim ersten Laden
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Vorhaben laden, wenn authentifiziert
  useEffect(() => {
    if (isAuthenticated) {
      loadVorhaben();
    }
  }, [isAuthenticated, loadVorhaben]);

  /**
   * Filtert Vorhaben nach Lifecycle-Status
   * 
   * Lifecycle-Status Werte (aus Dataverse):
   * - 562520006 = Idee in Projektportfolio aufgenommen
   * - 562520007 = Idee in Quartalsplanung aufgenommen
   * - 562520008 = Idee in Wochenplanung aufgenommen
   * - 562520010 = In Umsetzung
   */
  const filteredLists = useMemo(() => {
    return {
      // In Planung - Projektportfolio
      projektportfolio: vorhaben.filter(
        (v) => v.cr6df_lifecyclestatus === LIFECYCLE_STATUS.IDEE_IN_PROJEKTPORTFOLIO
      ),
      // In Planung - Quartalsplanung
      quartalsplanung: vorhaben.filter(
        (v) => v.cr6df_lifecyclestatus === LIFECYCLE_STATUS.IDEE_IN_QUARTALSPLANUNG
      ),
      // In Planung - Wochenplanung
      wochenplanung: vorhaben.filter(
        (v) => v.cr6df_lifecyclestatus === LIFECYCLE_STATUS.IDEE_IN_WOCHENPLANUNG
      ),
      // In Umsetzung
      inUmsetzung: vorhaben.filter(
        (v) => v.cr6df_lifecyclestatus === LIFECYCLE_STATUS.IN_UMSETZUNG
      ),
    };
  }, [vorhaben]);

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

  // Angemeldet - Planung anzeigen
  return (
    <div className="min-h-screen bg-base-200">
      {/* App Header */}
      <AppHeader onLogout={handleLogout} isAuthenticated={isAuthenticated} />

      {/* Sub-Header */}
      <div className="bg-base-100 border-b">
        <div className="container mx-auto px-4 py-3 max-w-7xl flex justify-between items-center">
          <h1 className="text-xl font-bold">Planung</h1>
          <button
            className="btn btn-ghost btn-sm"
            onClick={loadVorhaben}
            disabled={isLoading}
            title="Daten neu laden"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </button>
        </div>
      </div>

      {/* Hauptinhalt */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
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

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Kalenderansicht */}
        {!isLoading && vorhaben.length > 0 && (
          <div className="mb-6">
            <PlanungUebersichtKalender vorhaben={vorhaben} />
          </div>
        )}

        {/* Listen */}
        {!isLoading && (
          <div className="space-y-4">
            {/* In Planung - Projektportfolio */}
            <VorhabenCollapsibleList
              title="In Planung - Projektportfolio"
              vorhaben={filteredLists.projektportfolio}
              defaultOpen={true}
              badgeColor="badge-info"
            />

            {/* In Planung - Quartalsplanung */}
            <VorhabenCollapsibleList
              title="In Planung - Quartalsplanung"
              vorhaben={filteredLists.quartalsplanung}
              defaultOpen={true}
              badgeColor="badge-warning"
            />

            {/* In Planung - Wochenplanung */}
            <VorhabenCollapsibleList
              title="In Planung - Wochenplanung"
              vorhaben={filteredLists.wochenplanung}
              defaultOpen={true}
              badgeColor="badge-secondary"
            />

            {/* In Umsetzung */}
            <VorhabenCollapsibleList
              title="In Umsetzung"
              vorhaben={filteredLists.inUmsetzung}
              defaultOpen={true}
              badgeColor="badge-success"
            />
          </div>
        )}
      </main>
    </div>
  );
}
