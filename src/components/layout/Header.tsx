import React, { useEffect, useState } from 'react';
import {
  Menu,
  RotateCw,
  MapPin,
  ShieldCheck,
  Activity,
  Zap,
} from 'lucide-react';
import { api } from '../../api/client';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  onRefresh,
}) => {
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'error' | 'checking'>('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkBackendHealth = async () => {
    try {
      const res = await api.getHealth();
      if (res.status === 'ok') {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('error');
      }
    } catch {
      setHealthStatus('error');
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    checkBackendHealth();
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Location / Estate Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-750 text-xs font-medium text-slate-300">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Coimbatore MSME Estate</span>
          <span className="text-[10px] text-slate-500 font-mono">(11.0168°N, 76.9558°E)</span>
        </div>
      </div>

      {/* Right status & actions */}
      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            {healthStatus === 'healthy' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            )}
            {healthStatus === 'error' && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            )}
            {healthStatus === 'checking' && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 animate-pulse"></span>
            )}
          </span>
          <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider hidden md:inline">
            FastAPI Backend: {healthStatus === 'healthy' ? 'CONNECTED' : healthStatus === 'checking' ? 'CHECKING' : 'OFFLINE'}
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefreshClick}
          className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all ${
            isRefreshing ? 'rotate-180 duration-500 text-amber-400' : ''
          }`}
          title="Refresh All Telemetry"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Role badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>ADMIN VIEW</span>
        </div>
      </div>
    </header>
  );
};
