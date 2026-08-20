import React from 'react';
import { Loader2, AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Fetching SolarShare telemetry data...',
}) => {
  return (
    <div className="glass-panel p-12 flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
        <Loader2 className="w-6 h-6 text-amber-400 absolute animate-pulse" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-200">{message}</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to FastAPI Backend...</p>
      </div>
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Failed to load telemetry data',
  message = 'An unexpected error occurred while communicating with the backend.',
  onRetry,
}) => {
  return (
    <div className="glass-panel p-8 border-rose-500/30 bg-rose-950/10 flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]">
      <div className="p-3 bg-rose-500/20 rounded-full text-rose-400">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold transition-all duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};

export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  icon?: React.ElementType;
}> = ({
  title = 'No records found',
  message = 'No data is available for the selected criteria.',
  icon: Icon = Inbox,
}) => {
  return (
    <div className="glass-panel p-10 flex flex-col items-center justify-center text-center space-y-3 min-h-[250px]">
      <div className="p-3 bg-slate-800 rounded-full text-slate-400">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400">{message}</p>
      </div>
    </div>
  );
};
