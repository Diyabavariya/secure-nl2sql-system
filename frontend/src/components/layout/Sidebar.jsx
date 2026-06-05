import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAccessibleNavItems, getRoleBadgeClass, getRoleLabel } from '../../config/rbac';

export default function Sidebar({ activePage, onNavigate }) {
  const { user, role, logout } = useAuth();
  const navItems = getAccessibleNavItems(role);

  return (
    <aside className="
      fixed left-0 top-0 h-full w-[280px]
      bg-surface border-r border-white/5
      flex flex-col py-6 px-4 z-50
    ">
      <div className="mb-10 px-2 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="electric-glow flex-shrink-0">
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
        <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          QueryShield AI
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.key;

          return (
            <button
              key={item.key}
              id={`nav-${item.key}`}
              onClick={() => onNavigate(item.key)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left
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

      <div className="mt-auto pt-4 border-t border-white/5 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="text-body-sm font-medium">Settings</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-full bg-surface-container">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="text-on-primary-container text-xs font-bold uppercase">
              {user?.name?.[0] || 'U'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-on-surface text-xs font-semibold truncate capitalize">
              {user?.name || 'User'}
            </p>
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getRoleBadgeClass(role)}`}>
              {getRoleLabel(role)}
            </span>
          </div>

          <button
            id="logout-btn"
            onClick={logout}
            title="Sign out"
            className="text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
