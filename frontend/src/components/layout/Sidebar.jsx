import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAccessibleNavItems, getRoleBadgeClass, getRoleLabel } from '../../config/rbac';

/**
 * Sidebar
 *
 * Props:
 *  activePage  — current active page key
 *  onNavigate  — called with new page key when nav item clicked
 *  isOpen      — (mobile) whether sidebar is visible
 *  onClose     — (mobile) called to close the sidebar
 *
 * Desktop: fixed, always visible on the left.
 * Mobile:  slides in from the left as a drawer when isOpen === true.
 *          A dark overlay behind it calls onClose when tapped.
 */
export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const navItems = getAccessibleNavItems(role);

  function handleNavigate(key) {
    onNavigate(key);
    // Close the drawer on mobile after selecting a nav item.
    onClose?.();
  }

  return (
    <>
      {/* ── Mobile overlay backdrop ────────────────────────────────────── */}
      {isOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-[280px] z-50
          bg-surface border-r border-white/5
          flex flex-col py-6 px-4
          transition-transform duration-250 ease-in-out
          ${isOpen ? 'translate-x-0 sidebar-slide-in' : '-translate-x-full'}
          md:translate-x-0
        `}
        aria-label="Sidebar navigation"
      >
        {/* ── Logo + close button (mobile) ────────────────────────────── */}
        <div className="mb-10 px-2 flex items-center gap-3">
          <svg
            width="32" height="32" viewBox="0 0 100 100"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            className="electric-glow flex-shrink-0"
          >
            <path d="M50 10L15 25V50C15 72.5 30 92.5 50 100C70 92.5 85 72.5 85 50V25L50 10Z" stroke="#0066FF" strokeWidth="4" strokeLinejoin="round"/>
            <circle cx="50" cy="50" r="12" stroke="#0066FF" strokeWidth="3"/>
            <path d="M50 38V28" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50 72V62" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M62 50L72 50" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M28 50L38 50" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M41 41L34 34" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M59 59L66 66" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M41 59L34 66" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M59 41L66 34" stroke="#0066FF" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight flex-1">
            QueryShield AI
          </h1>
          {/* Close button — only visible on mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* ── Navigation items ────────────────────────────────────────── */}
        <nav className="flex-1 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activePage === item.key;

            return (
              <button
                key={item.key}
                id={`nav-${item.key}`}
                onClick={() => handleNavigate(item.key)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg
                  transition-colors duration-150 active:scale-[0.98]
                  ${isActive
                    ? 'text-primary font-bold border-r-2 border-primary bg-primary/5'
                    : 'text-on-surface-variant font-medium hover:bg-white/5'
                  }
                `}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-body-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── User profile + logout ────────────────────────────────────── */}
        {/* NOTE: Settings button removed — it was non-functional UI clutter. */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-surface-container">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="text-on-primary-container text-xs font-bold uppercase">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-on-surface text-xs font-semibold truncate capitalize">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getRoleBadgeClass(role)}`}>
                {getRoleLabel(role)}
              </span>
            </div>

            <button
              id="logout-btn"
              onClick={logout}
              title="Sign out"
              className="text-on-surface-variant hover:text-error transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
