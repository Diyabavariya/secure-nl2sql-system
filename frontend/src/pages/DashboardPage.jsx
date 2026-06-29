import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccess, canExecuteQuery, getAccessibleNavItems } from '../config/rbac';

import Sidebar          from '../components/layout/Sidebar';
import Topbar           from '../components/layout/Topbar';
import QueryPanel       from '../components/query/QueryPanel';
import SqlDisplay       from '../components/query/SqlDisplay';
import QueryHistory     from '../components/history/QueryHistory';
import SecurityPanel    from '../components/security/SecurityPanel';
import ProtectedSection from '../components/auth/ProtectedSection';

import { useQueryShield } from '../hooks/useQueryShield';

const PAGE_TITLES = {
  dashboard:   'Dashboard',
  security:    'Security Rules',
  history:     'Query History',
  connections: 'Database Connections',
  apikeys:     'API Keys',
};

export default function DashboardPage() {
  const { role } = useAuth();
  const [activePage,    setActivePage]    = useState('dashboard');
  // Mobile sidebar open/close state
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  const {
    loading, result, history, securityStatus, networkError, submitQuestion,
  } = useQueryShield();

  const accessibleNavItems  = getAccessibleNavItems(role);
  const firstAccessiblePage = accessibleNavItems[0]?.key || 'dashboard';

  useEffect(() => {
    if (!canAccess(role, activePage)) setActivePage(firstAccessiblePage);
  }, [activePage, firstAccessiblePage, role]);

  // Close sidebar when screen widens to desktop (avoids stuck-open state)
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  function handleNavigate(page) {
    setActivePage(page);
  }

  return (
    /*
     * MOBILE FIX: Removed `h-screen overflow-hidden` from the root wrapper.
     * The previous setup locked the viewport height and blocked all scrolling
     * on mobile. Now:
     *  • The sidebar is fixed as before on desktop.
     *  • The main content area has its own `min-h-screen` so it fills the page.
     *  • Scrolling is handled by the <main> element with overflow-y-auto.
     */
    <div className="flex bg-background min-h-screen">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/*
        * Content shifts right by 280px only on md+ (desktop).
        * On mobile it fills the full width (no margin offset needed since
        * the sidebar is a positioned drawer, not a flow element).
        */}
      <div className="flex-1 flex flex-col md:ml-[280px]">
        <Topbar
          title={PAGE_TITLES[activePage] || 'Dashboard'}
          isOnline={true}
          onMenuOpen={openSidebar}
        />

        {/* pt-16 clears the fixed topbar; content scrolls naturally */}
        <main className="flex-1 overflow-y-auto pt-16 scrollbar-thin">

          {/* ── Dashboard page ────────────────────────────────────────── */}
          {activePage === 'dashboard' && (
            <div className="p-4 md:p-6">
              {networkError && (
                <div className="flex items-center gap-3 p-4 mb-5 bg-error/10 border border-error/20 rounded-xl">
                  <span className="material-symbols-outlined text-error">wifi_off</span>
                  <div>
                    <p className="text-error text-sm font-semibold">Connection Error</p>
                    <p className="text-on-surface-variant text-xs">{networkError}</p>
                  </div>
                </div>
              )}

              {/*
                * Two-column layout on large screens, single column on mobile/tablet.
                * SecurityPanel moves below the main column on smaller screens.
                */}
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Left / main column */}
                <div className="flex-1 flex flex-col gap-5 min-w-0">
                  <ProtectedSection
                    allowed={canExecuteQuery(role)}
                    role={role}
                    resource="the query builder"
                    onBack={() => setActivePage('dashboard')}
                  >
                    <QueryPanel
                      onSubmit={(question) => submitQuestion(question)}
                      loading={loading}
                    />
                  </ProtectedSection>

                  <SqlDisplay result={result} loading={loading} />

                  <QueryHistory history={history} onSelect={() => setActivePage('dashboard')} />
                </div>

                {/* Right / security column — stacks below on mobile/tablet */}
                <div className="w-full lg:w-[280px] lg:flex-shrink-0">
                  <ProtectedSection
                    allowed={canExecuteQuery(role)}
                    role={role}
                    resource="security controls"
                  >
                    <SecurityPanel securityStatus={securityStatus} />
                  </ProtectedSection>
                </div>
              </div>
            </div>
          )}

          {/* ── History page ──────────────────────────────────────────── */}
          {activePage === 'history' && (
            <div className="p-4 md:p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-on-surface font-semibold text-xl mb-5">Full Query History</h2>
                <QueryHistory history={history} onSelect={() => setActivePage('dashboard')} />
              </div>
            </div>
          )}

          {/* ── Security page ─────────────────────────────────────────── */}
          {activePage === 'security' && (
            <div className="p-4 md:p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-on-surface font-semibold text-xl mb-5">Security Rules</h2>
                <ProtectedSection
                  allowed={canAccess(role, 'security')}
                  role={role}
                  resource="security rules"
                >
                  <SecurityPanel securityStatus={securityStatus} />
                </ProtectedSection>
              </div>
            </div>
          )}

          {/* ── Placeholder pages ─────────────────────────────────────── */}
          {(activePage === 'connections' || activePage === 'apikeys') && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20">
                {activePage === 'connections' ? 'database' : 'key'}
              </span>
              <h2 className="text-on-surface font-semibold text-xl">{PAGE_TITLES[activePage]}</h2>
              <p className="text-on-surface-variant text-body-sm max-w-sm">
                This section is coming soon.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
