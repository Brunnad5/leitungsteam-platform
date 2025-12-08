/**
 * Dashboard-Seite - Übersicht aller Digitalisierungsvorhaben
 * 
 * Zeigt eine Liste aller Vorhaben.
 * Die Planungs-Listen sind unter /planung zu finden.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import LoginPrompt from '@/components/dataverse/LoginPrompt';
import AppHeader from '@/components/layout/AppHeader';
import VorhabenCollapsibleList from '@/components/vorhaben/VorhabenCollapsibleList';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';
import { getPhaseFromStageId } from '@/lib/constants/bpfStages';

// Typen für API-Responses
interface AuthStatusResponse {
  isAuthenticated: boolean;
}

interface VorhabenResponse {
  success: boolean;
  count?: number;
  data?: DigitalisierungsvorhabenRecord[];
  bpf?: Record<string, any>; // BPF-Daten als Map
  error?: string;
}

export default function DashboardPage() {
  // Auth-Status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Daten
  const [vorhaben, setVorhaben] = useState<DigitalisierungsvorhabenRecord[]>([]);
  const [bpfData, setBpfData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Prüft den Auth-Status beim Laden der Seite
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
   * Lädt alle Vorhaben von der API (ohne Filter)
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
      setBpfData(data.bpf || {}); // BPF-Daten speichern
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
      setVorhaben([]);
    } catch (err) {
      console.error('Logout-Fehler:', err);
    }
  };

  /**
   * Wird aufgerufen, wenn der Login erfolgreich war
   */
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Auth-Status beim Mount prüfen
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Vorhaben nach Phasen filtern (memoized für Performance)
  const phaseLists = useMemo(() => {
    if (!vorhaben.length) {
      return {
        initialisierung: [],
        analyseBewertung: [],
        planung: [],
        umsetzung: [],
      };
    }

    const lists = {
      initialisierung: [] as DigitalisierungsvorhabenRecord[],
      analyseBewertung: [] as DigitalisierungsvorhabenRecord[],
      planung: [] as DigitalisierungsvorhabenRecord[],
      umsetzung: [] as DigitalisierungsvorhabenRecord[],
    };

    vorhaben.forEach((item) => {
      const phase = getPhaseFromStageId(bpfData[item.cr6df_sgsw_digitalisierungsvorhabenid]?.activeStageId);
      
      switch (phase) {
        case 1:
          lists.initialisierung.push(item);
          break;
        case 2:
          lists.analyseBewertung.push(item);
          break;
        case 3:
          lists.planung.push(item);
          break;
        case 4:
          lists.umsetzung.push(item);
          break;
        default:
          lists.initialisierung.push(item); // Fallback zu Initialisierung
      }
    });

    return lists;
  }, [vorhaben, bpfData]);

  // Vorhaben laden, wenn authentifiziert
  useEffect(() => {
    if (isAuthenticated) {
      loadVorhaben();
    }
  }, [isAuthenticated, loadVorhaben]);

  // Loading-State beim ersten Laden
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Nicht angemeldet - Login anzeigen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoginPrompt onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Angemeldet - Dashboard anzeigen
  return (
    <div className="min-h-screen bg-base-200">
      {/* App Header */}
      <AppHeader onLogout={handleLogout} isAuthenticated={isAuthenticated} />

      {/* Sub-Header mit Titel und Refresh */}
      <div className="bg-base-100 border-b">
        <div className="container mx-auto px-4 py-3 max-w-7xl flex justify-between items-center">
          <h1 className="text-xl font-bold">Digitalisierungsvorhaben</h1>
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

        {/* Loading-Anzeige */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Listen nach Phasen unterteilt */}
        {!isLoading && (
          <div className="space-y-4">
            {/* Phase 1: Initialisierung */}
            <VorhabenCollapsibleList
              title="Phase 1: Initialisierung"
              vorhaben={phaseLists.initialisierung}
              defaultOpen={true}
              badgeColor="badge-info"
              bpfData={bpfData}
            />
            
            {/* Phase 2: Analyse & Bewertung */}
            <VorhabenCollapsibleList
              title="Phase 2: Analyse & Bewertung"
              vorhaben={phaseLists.analyseBewertung}
              defaultOpen={phaseLists.analyseBewertung.length > 0}
              badgeColor="badge-secondary"
              bpfData={bpfData}
            />
            
            {/* Phase 3: Planung */}
            <VorhabenCollapsibleList
              title="Phase 3: Planung"
              vorhaben={phaseLists.planung}
              defaultOpen={phaseLists.planung.length > 0}
              badgeColor="badge-warning"
              bpfData={bpfData}
            />
            
            {/* Phase 4: Umsetzung */}
            <VorhabenCollapsibleList
              title="Phase 4: Umsetzung"
              vorhaben={phaseLists.umsetzung}
              defaultOpen={phaseLists.umsetzung.length > 0}
              badgeColor="badge-success"
              bpfData={bpfData}
            />
          </div>
        )}
      </main>
    </div>
  );
}
