/**
 * Startseite - Leitungsteam Platform
 * 
 * Zeigt den Auth-Status und leitet zum Dashboard weiter,
 * oder zeigt den Login-Prompt an.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import LoginPrompt from '@/components/dataverse/LoginPrompt';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  /**
   * Prüft den Auth-Status beim Laden der Seite
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/dataverse/auth');
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Wird aufgerufen, wenn der Login erfolgreich war
   */
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  /**
   * Navigiert zum Dashboard
   */
  const goToDashboard = () => {
    router.push('/dashboard');
  };

  // Auth-Status beim Mount prüfen
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Loading-State
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-base-content/70">Prüfe Anmeldestatus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-lg">
            {/* Logo / Titel */}
            <div className="flex justify-center mb-6">
              <div className="bg-primary text-primary-content p-4 rounded-2xl">
                <LayoutDashboard className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              Leitungsteam Platform
            </h1>
            <p className="text-lg text-base-content/70 mb-8">
              Digitale Übersicht für Ideen, Vorhaben und Projekte. 
              Verwalte Digitalisierungsvorhaben und dokumentiere Entscheidungen.
            </p>

            {/* Authentifiziert: Zum Dashboard */}
            {isAuthenticated && (
              <div className="space-y-4">
                <div className="badge badge-success badge-lg gap-2">
                  <span className="w-2 h-2 bg-success-content rounded-full"></span>
                  Mit Microsoft verbunden
                </div>
                <div>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={goToDashboard}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Zum Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Nicht authentifiziert: Login */}
            {!isAuthenticated && (
              <LoginPrompt onLoginSuccess={handleLoginSuccess} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
