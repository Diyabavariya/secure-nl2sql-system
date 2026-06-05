import React from 'react';

const STATUS_CONFIG = {
  success: {
    label: 'Success',
    icon: 'check_circle',
    classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  blocked: {
    label: 'Blocked',
    icon: 'block',
    classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  denied: {
    label: 'Access Denied',
    icon: 'lock',
    classes: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dotColor: 'bg-red-400',
  },
  error: {
    label: 'Error',
    icon: 'error',
    classes: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dotColor: 'bg-red-400',
  },
  loading: {
    label: 'Running…',
    icon: 'hourglass_empty',
    classes: 'bg-primary/10 text-primary border border-primary/20',
    dotColor: 'bg-primary',
  },
  idle: {
    label: 'Idle',
    icon: 'radio_button_unchecked',
    classes: 'bg-white/5 text-on-surface-variant border border-white/10',
    dotColor: 'bg-on-surface-variant',
  },
  passed: {
    label: 'Passed',
    icon: 'verified',
    classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  failed: {
    label: 'Failed',
    icon: 'cancel',
    classes: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dotColor: 'bg-red-400',
  },
};

export default function StatusBadge({ status = 'idle', label, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const displayLabel = label || config.label;

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  const iconSize = size === 'sm' ? 'text-[14px]' : 'text-[16px]';

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-mono font-medium
        ${config.classes}
        ${sizeClasses}
      `}
    >
      <span className={`material-symbols-outlined ${iconSize}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {config.icon}
      </span>
      {displayLabel}
    </span>
  );
}
