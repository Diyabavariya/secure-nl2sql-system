import React from 'react';
import GlassCard from '../ui/GlassCard';

function SecurityGate({ label, icon, passed, description }) {
  const stateConfig = {
    true:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon_override: 'check_circle' },
    false: { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         icon_override: 'cancel' },
    null:  { color: 'text-on-surface-variant', bg: 'bg-white/5 border-white/10',       icon_override: 'radio_button_unchecked' },
  };

  const cfg = stateConfig[String(passed)];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.bg} transition-all`}>
      <div className={`flex-shrink-0 ${cfg.color}`}>
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {cfg.icon_override}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold ${cfg.color}`}>{label}</p>
        <p className="text-on-surface-variant text-[11px] truncate">{description}</p>
      </div>

      <span className="material-symbols-outlined text-on-surface-variant/30 text-[18px]">
        {icon}
      </span>
    </div>
  );
}

function ThreatMeter({ overallStatus }) {
  const threatConfig = {
    idle:           { level: 0,   label: 'No Active Threat',    color: 'bg-on-surface-variant/20' },
    success:        { level: 10,  label: 'Threat Level: Low',   color: 'bg-emerald-400' },
    blocked_intent: { level: 90,  label: 'Threat Level: High',  color: 'bg-red-400' },
    blocked_sql:    { level: 75,  label: 'Threat Level: High',  color: 'bg-red-400' },
    denied_rbac:    { level: 50,  label: 'Threat Level: Medium',color: 'bg-amber-400' },
    db_error:       { level: 20,  label: 'DB Error',            color: 'bg-amber-400' },
    network_error:  { level: 5,   label: 'Network Issue',       color: 'bg-amber-400' },
  };

  const cfg = threatConfig[overallStatus] || threatConfig.idle;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-on-surface-variant text-[11px] font-mono uppercase tracking-wider">
          Threat Meter
        </span>
        <span className="text-on-surface-variant text-[11px] font-mono">{cfg.label}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.color}`}
          style={{ width: `${cfg.level}%` }}
        />
      </div>
    </div>
  );
}

export default function SecurityPanel({ securityStatus }) {
  const { intentPassed, sqlPassed, rbacPassed, overallStatus } = securityStatus;

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
          <h3 className="text-on-surface font-semibold text-sm">Security Gates</h3>
        </div>

        <div className="space-y-2 mb-5">
          <SecurityGate
            label="Intent Validation"
            icon="psychology"
            passed={intentPassed}
            description="NL question safety check"
          />
          <SecurityGate
            label="SQL Validation"
            icon="code"
            passed={sqlPassed}
            description="Structural SQL safety check"
          />
          <SecurityGate
            label="RBAC Check"
            icon="verified_user"
            passed={rbacPassed}
            description="Role-based access control"
          />
        </div>

        <ThreatMeter overallStatus={overallStatus} />
      </GlassCard>

      <GlassCard className="p-5 rounded-xl">
        <p className="text-on-surface-variant text-[11px] font-mono uppercase tracking-wider mb-3">
          Protection Active
        </p>
        <div className="space-y-2.5">
          {[
            { icon: 'lock', label: 'SQL Injection Guard',   color: 'text-emerald-400' },
            { icon: 'psychology_alt', label: 'Prompt Injection Defense', color: 'text-emerald-400' },
            { icon: 'admin_panel_settings', label: 'RBAC Enforcement',   color: 'text-emerald-400' },
            { icon: 'policy', label: 'SOC2 Audit Logging',  color: 'text-emerald-400' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[16px] ${item.color}`}>
                {item.icon}
              </span>
              <span className="text-on-surface-variant text-[12px]">{item.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
