import React from 'react';
import { LucideIcon } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  isDemo?: boolean;
  demoNote?: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  iconColor = 'text-amber-400',
  trend,
  isDemo = false,
  demoNote,
  accentColor = 'border-amber-500/20',
}) => {
  return (
    <div className={`glass-panel p-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700 hover:shadow-2xl ${accentColor}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
            {isDemo && <DemoBadge size="sm" note={demoNote} />}
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/80 border border-slate-750 shrink-0 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-400">{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
