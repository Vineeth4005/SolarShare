import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  Sun,
  TrendingUp,
  Share2,
  BatteryCharging,
  Receipt,
  BarChart3,
  SunMedium,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const navigationItems = [
  {
    name: 'Overview',
    path: '/',
    icon: LayoutDashboard,
    isReal: true,
    description: 'System-wide summary & metrics',
  },
  {
    name: 'Tenant Dashboard',
    path: '/tenants',
    icon: Users,
    isReal: true,
    description: 'MSME Tenant load telemetry',
  },
  {
    name: 'Load Profiles',
    path: '/load-profiles',
    icon: Activity,
    isReal: true,
    badge: '319 → 6 REAL',
    description: 'Zenodo 321-series profiling',
  },
  {
    name: 'Solar Generation',
    path: '/solar',
    icon: Sun,
    isReal: true,
    description: '500 kW PV system & NASA POWER',
  },
  {
    name: 'Forecasting',
    path: '/forecasting',
    icon: TrendingUp,
    isReal: false,
    badge: 'DEMO',
    description: 'Prophet solar & load forecast',
  },
  {
    name: 'Energy Allocation',
    path: '/allocation',
    icon: Share2,
    isReal: false,
    badge: 'DEMO',
    description: 'PuLP fair share optimizer',
  },
  {
    name: 'Battery',
    path: '/battery',
    icon: BatteryCharging,
    isReal: false,
    badge: 'DEMO',
    description: '200 kWh BESS simulation',
  },
  {
    name: 'Billing & Tariffs',
    path: '/billing',
    icon: Receipt,
    isReal: false,
    badge: 'DEMO',
    description: 'Tamil Nadu ToU tariff & savings',
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    isReal: true,
    description: '8.44M Observation Dataset analytics',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <SunMedium className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-white tracking-wider flex items-center gap-1">
                Solar<span className="text-amber-400">Share</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                MSME Energy Hub
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Platform Modules
          </div>
        )}
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 font-semibold shadow-lg shadow-amber-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        item.isReal
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Database Telemetry Footer */}
      {!collapsed && (
        <div className="p-3 m-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> DB Verified
            </span>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
              Phase 2 Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-800/80 font-mono">
            <div className="text-slate-400">
              Series: <span className="text-amber-400 font-bold">321</span>
            </div>
            <div className="text-slate-400">
              Profiles: <span className="text-amber-400 font-bold">319</span>
            </div>
            <div className="col-span-2 text-slate-400 truncate">
              Obs: <span className="text-emerald-400 font-bold">8,443,584</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
