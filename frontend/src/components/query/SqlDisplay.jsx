import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import StatusBadge from '../ui/StatusBadge';

function getResultStatus(result) {
  if (!result) return 'idle';
  if (!result.error) return 'success';
  if (result.error.toLowerCase().includes('dangerous intent')) return 'blocked';
  if (result.error.toLowerCase().includes('access denied')) return 'denied';
  return 'error';
}

function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-3 animate-shimmer rounded w-3/4" />
      <div className="h-3 animate-shimmer rounded w-full" />
      <div className="h-3 animate-shimmer rounded w-2/3" />
      <div className="h-3 animate-shimmer rounded w-5/6 mt-2" />
    </div>
  );
}

export default function SqlDisplay({ result, loading }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!result?.generated_sql) return;
    await navigator.clipboard.writeText(result.generated_sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const status = getResultStatus(result);

  return (
    <GlassCard className="p-6 rounded-xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">code</span>
          <h3 className="text-on-surface font-semibold text-base">Generated SQL</h3>
        </div>
        <StatusBadge status={loading ? 'loading' : status} />
      </div>

      {loading && (
        <div className="code-block min-h-[80px]">
          <SkeletonLoader />
        </div>
      )}

      {!loading && !result && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
            terminal
          </span>
          <p className="text-on-surface-variant text-body-sm">
            Submit a question to see the generated SQL here.
          </p>
        </div>
      )}

      {!loading && result && (
        <div className="animate-fade-in-up space-y-4">
          {result.generated_sql && (
            <div className="relative group">
              <pre className="code-block text-secondary-container overflow-x-auto scrollbar-thin">
                <code>{result.generated_sql}</code>
              </pre>

              <button
                onClick={handleCopy}
                className="
                  absolute top-3 right-3
                  flex items-center gap-1.5 px-2.5 py-1
                  bg-surface-container border border-outline-variant rounded-lg
                  text-on-surface-variant hover:text-on-surface text-[11px] font-mono
                  opacity-0 group-hover:opacity-100 transition-opacity
                "
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          {result.error && (
            <div className="flex gap-3 p-4 bg-error/5 border border-error/20 rounded-xl">
              <span className="material-symbols-outlined text-error text-[20px] flex-shrink-0">
                warning
              </span>
              <div>
                <p className="text-error text-body-sm font-medium mb-0.5">Query Blocked</p>
                <p className="text-on-surface-variant text-[13px]">{result.error}</p>
              </div>
            </div>
          )}

          {result.explanation && !result.error && (
            <p className="text-on-surface-variant text-body-sm">
              {result.explanation}
            </p>
          )}

          {result.results && result.results.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">
                  table_chart
                </span>
                <p className="text-on-surface-variant text-[12px] font-mono uppercase tracking-wider">
                  {result.results.length} row{result.results.length !== 1 ? 's' : ''} returned
                </p>
              </div>

              <div className="overflow-auto max-h-64 rounded-lg border border-outline-variant scrollbar-thin">
                <table className="w-full text-[13px] font-mono border-collapse">
                  {result.results[0] && typeof result.results[0] === 'object' && (
                    <thead className="sticky top-0 bg-surface-container-high">
                      <tr>
                        {Object.keys(result.results[0]).map((col) => (
                          <th
                             key={col}
                             className="px-4 py-2 text-left text-on-surface-variant font-medium border-b border-outline-variant whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}

                  <tbody>
                    {result.results.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-white/5 hover:bg-white/3 transition-colors"
                      >
                        {typeof row === 'object'
                          ? Object.values(row).map((val, j) => (
                              <td key={j} className="px-4 py-2 text-on-surface">
                                {String(val ?? '—')}
                              </td>
                            ))
                          : <td className="px-4 py-2 text-on-surface">{String(row)}</td>
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
