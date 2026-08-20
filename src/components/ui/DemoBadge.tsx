import React from 'react';
import { Info, Sparkles } from 'lucide-react';

interface DemoBadgeProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  note?: string;
  showIcon?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  label = 'DEMO MODE',
  size = 'md',
  note,
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-bold',
    md: 'px-2.5 py-1 text-xs font-extrabold',
    lg: 'px-3.5 py-1.5 text-sm font-black',
  };

  return (
    <div className="inline-flex items-center gap-1.5 group relative">
      <span className={`inline-flex items-center gap-1 uppercase tracking-wider rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-400 ${sizeClasses[size]}`}>
        {showIcon && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
        {label}
      </span>
      {note && (
        <div className="relative">
          <Info className="w-3.5 h-3.5 text-amber-400/70 hover:text-amber-300 cursor-pointer" />
          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 w-64 p-2.5 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-xs text-slate-300 font-normal leading-relaxed">
            <span className="font-semibold text-amber-400 block mb-1">Illustrative Demo Data</span>
            {note}
          </div>
        </div>
      )}
    </div>
  );
};

export const DemoBanner: React.FC<{ note?: string }> = ({ note }) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-sm text-amber-200/90 shadow-lg">
      <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-amber-400 uppercase text-xs tracking-wider bg-amber-500/20 px-2 py-0.5 rounded">
            Prototype Demo State
          </span>
          <span className="text-xs text-amber-300/70">Algorithm Integration Scope</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {note || "This module currently uses prototype/demo response endpoints. In future phases, deep forecasting, allocation, battery simulation, or billing engines will replace these placeholder algorithms."}
        </p>
      </div>
    </div>
  );
};
