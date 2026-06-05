import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canExecuteQuery, getRoleBadgeClass, getRoleLabel } from '../../config/rbac';
import GlassCard from '../ui/GlassCard';

const SUGGESTIONS = [
  'Show top 5 customers by order count',
  'Revenue by product category this month',
  'Orders with pending payment status',
  'Average delivery time per seller',
];

export default function QueryPanel({ onSubmit, loading }) {
  const { role } = useAuth();
  const [question, setQuestion] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    onSubmit(question);
  }

  function handleChipClick(suggestion) {
    setQuestion(suggestion);
  }

  return (
    <GlassCard className="p-6 rounded-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            auto_awesome
          </span>
          <h3 className="text-on-surface font-semibold text-base">
            Natural Language Query
          </h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getRoleBadgeClass(role)}`}>
          {getRoleLabel(role)}
        </span>
        <span className="font-code-sm text-code-sm text-on-surface-variant">
          {question.length} chars
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            id="query-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit(e);
            }}
            placeholder="Ask your database anything in plain English…&#10;e.g. 'Show me the top 10 orders from last week'"
            rows={4}
            className="
              w-full px-4 py-3
              bg-surface-container-lowest border border-outline-variant rounded-xl
              text-on-surface placeholder:text-on-surface-variant/40
              font-body-lg text-body-lg
              focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30
              resize-none transition-all
              scrollbar-thin
            "
          />
          <span className="absolute bottom-3 right-3 font-code-sm text-code-sm text-on-surface-variant/30">
            Ctrl+↵
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px] pointer-events-none">
              person
            </span>
            <span className="text-body-sm font-medium text-on-surface">{getRoleLabel(role)}</span>
            {!canExecuteQuery(role) && (
              <span className="rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">
                Read only
              </span>
            )}
          </div>

          <div className="flex-1" />

          {question && (
            <button
              type="button"
              onClick={() => setQuestion('')}
              className="px-3 py-2.5 text-on-surface-variant hover:text-on-surface text-body-sm transition-colors"
            >
              Clear
            </button>
          )}

          <button
            id="run-query-btn"
            type="submit"
            disabled={!question.trim() || loading}
            className="
              flex items-center gap-2 px-6 py-2.5
              bg-primary-container text-on-primary-container
              font-semibold text-body-sm rounded-full
              neon-glow-primary
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
              active:scale-[0.97] transition-all
            "
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <span>Run Query</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-5 pt-4 border-t border-white/5">
        <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-mono mb-3">
          Quick suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleChipClick(s)}
              className="
                px-3 py-1.5 text-[12px] font-mono
                bg-surface-container border border-outline-variant rounded-full
                text-on-surface-variant hover:text-primary hover:border-primary/30
                transition-colors
              "
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
