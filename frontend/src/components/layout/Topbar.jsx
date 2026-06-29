import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRoleBadgeClass, getRoleLabel } from '../../config/rbac';

/**
 * Topbar
 *
 * Props:
 *  title    — current page title
 *  isOnline — whether backend is reachable
 *  onMenuOpen — called when the hamburger button is tapped on mobile
 *
 * Removed (were non-functional UI decoration):
 *  • Decorative search bar
 *  • Notifications bell with fake badge
 */
export default function Topbar({ title = 'Dashboard', isOnline = true, onMenuOpen }) {
  const { role } = useAuth();

  return (
    <header
      className="
        fixed top-0 right-0 h-16 z-40
        left-0 md:left-[280px]
        bg-surface/80 backdrop-blur-xl
        border-b border-white/5
        flex items-center justify-between
        px-4 md:px-8
      "
    >
      {/* ── Left: hamburger (mobile) + page title + status ────────────── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only shown on mobile (hidden on md+) */}
        <button
          id="sidebar-toggle-btn"
          onClick={onMenuOpen}
          className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <h2 className="text-on-surface font-semibold text-lg tracking-tight">
          {title}
        </h2>

        <div className="hidden sm:flex items-center gap-2">
          {isOnline
            ? <span className="status-dot-active" />
            : <span className="w-1.5 h-1.5 rounded-full bg-error inline-block" />
          }
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            {isOnline ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* ── Right: role badge + RBAC indicator ───────────────────────── */}
      {/* Removed: decorative search bar, non-functional notifications bell */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5">
          <span className="material-symbols-outlined text-primary text-[15px]">
            verified_user
          </span>
          <span className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium uppercase ${getRoleBadgeClass(role)}`}>
            {getRoleLabel(role)}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full">
          <span className="material-symbols-outlined text-on-surface-variant text-[15px]">
            security
          </span>
          <span className="text-on-surface-variant font-mono text-[11px]">
            RBAC ACTIVE
          </span>
        </div>
      </div>
    </header>
  );
}
