/**
 * Dashboard-Seite - Listenansicht aller Digitalisierungsvorhaben
 * 
 * Zeigt eine Tabelle aller Vorhaben mit Filtermöglichkeiten.
 * Falls nicht angemeldet, wird der Login-Prompt angezeigt.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, LogOut, LayoutDashboard, AlertCircle } from 'lucide-react';
import LoginPrompt from '@/components/dataverse/LoginPrompt';
import VorhabenTable from '@/components/vorhaben/VorhabenTable';
import VorhabenFilter, { FilterValues } from '@/components/vorhaben/VorhabenFilter';
import { DigitalisierungsvorhabenRecord } from '@/lib/services/dataverse/types';

// Typen für API-Responses
interface AuthStatusResponse {
  isAuthenticated: boolean;
}

interface VorhabenResponse {
  success: boolean;
  count?: number;
  data?: DigitalisierungsvorhabenRecord[];
  error?: string;
}

export default function DashboardPage() {
  // Auth-Status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Daten
  const [vorhaben, setVorhaben] = useState<DigitalisierungsvorhabenRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Filter
  const [filters, setFilters] = useState<FilterValues>({});

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
   * Lädt die Vorhaben von der API
   */
  const loadVorhaben = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // Query-Parameter aus Filtern bauen
      const params = new URLSearchParams();
      if (filters.typ) params.append('typ', filters.typ);
      if (filters.kritikalitaet) params.append('kritikalitaet', filters.kritikalitaet);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/vorhaben${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url);
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
  }, [filters]);

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
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="navbar bg-base-200 shadow-sm">
        <div className="flex-1">
          <span className="flex items-center gap-2 text-xl font-semibold px-4">
            <LayoutDashboard className="w-6 h-6" />
            Digitalisierungsvorhaben
          </span>
        </div>
        <div className="flex-none gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={loadVorhaben}
            disabled={isLoading}
            title="Daten neu laden"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Filter */}
        <VorhabenFilter
          currentFilters={filters}
          onFilterChange={setFilters}
        />

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

        {/* Tabelle */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-lg">
                Übersicht
                {!isLoading && (
                  <span className="badge badge-neutral">{vorhaben.length}</span>
                )}
              </h2>
            </div>
            
            <VorhabenTable vorhaben={vorhaben} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
