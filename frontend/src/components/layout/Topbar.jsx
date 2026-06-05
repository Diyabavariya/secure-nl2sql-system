import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRoleBadgeClass, getRoleLabel } from '../../config/rbac';

export default function Topbar({ title = 'Dashboard', isOnline = true }) {
  const { role } = useAuth();

  return (
    <header className="
      fixed top-0 left-[280px] right-0 h-16
      bg-surface/80 backdrop-blur-xl
      border-b border-white/5
      flex items-center justify-between
      px-8 z-40
    ">
      <div className="flex items-center gap-4">
        <h2 className="text-on-surface font-semibold text-lg tracking-tight">
          {title}
        </h2>

        <div className="flex items-center gap-2">
          {isOnline
            ? <span className="status-dot-active" />
            : <span className="w-1.5 h-1.5 rounded-full bg-error inline-block" />
          }
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            {isOnline ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            id="topbar-search"
            type="text"
            placeholder="Search queries…"
            className="
              pl-9 pr-4 py-2 w-56 text-body-sm
              bg-surface-container-low border border-outline-variant rounded-full
              text-on-surface placeholder:text-on-surface-variant/50
              focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
              transition-all
            "
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5">
          <span className="material-symbols-outlined text-primary text-[15px]">
            verified_user
          </span>
          <span className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium uppercase ${getRoleBadgeClass(role)}`}>
            {getRoleLabel(role)}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full">
          <span className="material-symbols-outlined text-on-surface-variant text-[15px]">
            security
          </span>
          <span className="text-on-surface-variant font-mono text-[11px]">
            RBAC ACTIVE
          </span>
        </div>

        <button className="relative text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-surface" />
        </button>
      </div>
    </header>
  );
}
