import React from 'react';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';
import { getRoleBadgeClass, getRoleLabel } from '../../config/rbac';

function getStatus(entry) {
  if (!entry.error) return 'success';
  if (entry.error.toLowerCase().includes('dangerous intent')) return 'blocked';
  if (entry.error.toLowerCase().includes('access denied')) return 'denied';
  return 'error';
}

function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function QueryHistory({ history = [], onSelect }) {
  return (
    <GlassCard className="p-5 rounded-xl flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">history</span>
          <h3 className="text-on-surface font-semibold text-sm">Query History</h3>
        </div>
        {history.length > 0 && (
          <span className="text-on-surface-variant font-mono text-[11px]">
            {history.length} queries
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 max-h-80">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30">
              manage_search
            </span>
            <p className="text-on-surface-variant text-[13px]">
              No queries yet. Run your first query above!
            </p>
          </div>
        )}

        {history.map((entry, index) => {
          const status = getStatus(entry);

          return (
            <button
              key={index}
              onClick={() => onSelect?.(entry.question)}
              className="
                w-full text-left p-3 rounded-xl
                bg-surface-container hover:bg-surface-container-high
                border border-transparent hover:border-outline-variant/50
                transition-all group
              "
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-on-surface text-[13px] font-medium line-clamp-1 flex-1">
                  {entry.question}
                </p>
                <StatusBadge status={status} size="sm" />
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-on-surface-variant text-[11px] font-mono">
                  <span className="material-symbols-outlined text-[12px]">person</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getRoleBadgeClass(entry.role)}`}>
                    {getRoleLabel(entry.role)}
                  </span>
                </span>
                <span className="text-on-surface-variant/50 text-[11px] font-mono">
                  {formatTime(entry.timestamp)}
                </span>
                {entry.generated_sql && (
                  <span className="text-primary/50 text-[11px] font-mono hidden group-hover:inline">
                    View SQL →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
