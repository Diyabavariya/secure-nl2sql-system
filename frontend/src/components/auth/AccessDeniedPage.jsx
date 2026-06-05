import React from 'react';

import GlassCard from '../ui/GlassCard';
import { getRoleBadgeClass, getRoleLabel } from '../../config/rbac';

export default function AccessDeniedPage({ role, resource = 'this section', onBack }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <GlassCard className="w-full max-w-2xl p-8 rounded-xl border border-error/20 bg-error/5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-error">
            <span className="material-symbols-outlined">lock</span>
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.28em] text-on-surface-variant">Access denied</p>
            <h2 className="mt-2 text-2xl font-semibold text-on-surface">You cannot open {resource}.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              This area is protected by backend RBAC. Your current session role is
              {' '}
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeClass(role)}`}>
                {getRoleLabel(role)}
              </span>
              {' '}and it does not include the required permission for this page or feature.
            </p>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Go back
              </button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
