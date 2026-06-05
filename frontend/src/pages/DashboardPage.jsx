import React, { useEffect, useState } from 'react';
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
  const [activePage, setActivePage] = useState('dashboard');

  const {
    loading, result, history, securityStatus, networkError, submitQuestion,
  } = useQueryShield();

  const accessibleNavItems  = getAccessibleNavItems(role);
  const firstAccessiblePage = accessibleNavItems[0]?.key || 'dashboard';

  useEffect(() => {
    if (!canAccess(role, activePage)) setActivePage(firstAccessiblePage);
  }, [activePage, firstAccessiblePage, role]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="ml-[280px] flex-1 flex flex-col overflow-hidden">
        <Topbar title={PAGE_TITLES[activePage] || 'Dashboard'} isOnline={true} />

        <main className="flex-1 overflow-y-auto pt-16 scrollbar-thin">
          {activePage === 'dashboard' && (
            <div className="flex gap-5 p-6 h-full min-h-0">
              <div className="flex-1 flex flex-col gap-5 min-w-0">
                {networkError && (
                  <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl">
                    <span className="material-symbols-outlined text-error">wifi_off</span>
                    <div>
                      <p className="text-error text-sm font-semibold">Connection Error</p>
                      <p className="text-on-surface-variant text-xs">{networkError}</p>
                    </div>
                  </div>
                )}

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

              <div className="w-[280px] flex-shrink-0">
                <ProtectedSection
                  allowed={canExecuteQuery(role)}
                  role={role}
                  resource="security controls"
                >
                  <SecurityPanel securityStatus={securityStatus} />
                </ProtectedSection>
              </div>
            </div>
          )}

          {activePage === 'history' && (
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-on-surface font-semibold text-xl mb-5">Full Query History</h2>
                <QueryHistory history={history} onSelect={() => setActivePage('dashboard')} />
              </div>
            </div>
          )}

          {activePage === 'security' && (
            <div className="p-6">
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

          {(activePage === 'connections' || activePage === 'apikeys') && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
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

