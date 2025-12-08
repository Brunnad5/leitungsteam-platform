/**
 * AppHeader - Gemeinsamer Header für alle Seiten
 * 
 * Enthält Navigation, Logo und Logout-Button.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, LogOut } from 'lucide-react';

interface AppHeaderProps {
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export default function AppHeader({ onLogout, isAuthenticated = true }: AppHeaderProps) {
  const pathname = usePathname();

  // Navigation-Links
  const navLinks = [
    { href: '/', label: 'Start', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      {/* Logo / Titel */}
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-bold gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <span className="hidden sm:inline">Leitungsteam</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex ml-4">
          <ul className="menu menu-horizontal px-1 gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={isActive ? 'active' : ''}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Rechte Seite: Logout */}
      <div className="flex-none gap-2">
        {isAuthenticated && onLogout && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </div>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link href={link.href}>
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
