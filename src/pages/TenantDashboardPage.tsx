import React, { useEffect, useState } from 'react';
import { Users, Activity, TrendingUp, Zap, Receipt, Shield, Layers } from 'lucide-react';
import { api } from '../api/client';
import { LoadProfileRead, TenantForecastResponse } from '../types/api';
import { StatCard } from '../components/ui/StatCard';
import { LoadingState, ErrorState } from '../components/ui/StateViews';
import { DemoBadge, DemoBanner } from '../components/ui/DemoBadge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const TenantDashboardPage: React.FC = () => {
  const [selectedProfiles, setSelectedProfiles] = useState<LoadProfileRead[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number>(1);
  const [forecast, setForecast] = useState<TenantForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantNames = [
    'Textile Manufacturing Unit',
    'Food Processing Facility',
    'Electronics Assembly',
    'Packaging & Plastics Unit',
    'General Engineering Works',
    'Precision Tooling Workshop',
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profilesRes = await api.getSelectedLoadProfiles();
      setSelectedProfiles(profilesRes);
      const forecastRes = await api.getTenantForecast(selectedTenantId, 24);
      setForecast(forecastRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load tenant telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTenantId]);

  if (loading && !forecast) return <LoadingState message="Fetching MSME Tenant Telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const currentProfile = selectedProfiles[selectedTenantId - 1] || selectedProfiles[0];
  const currentTenantName = tenantNames[selectedTenantId - 1] || `Tenant #${selectedTenantId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              MSME Tenant Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              Real Profile Telemetry
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Individual tenant energy demand, historical load profile matching, and solar allocation forecasts.
          </p>
        </div>

        {/* Tenant Selector Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <button
              key={id}
              onClick={() => setSelectedTenantId(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedTenantId === id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Tenant #{id}
            </button>
          ))}
        </div>
      </div>

      <DemoBanner note="Tenant load shape is matched with real Zenodo series profiles. Future optimization algorithms will determine real-time allocation." />

      {/* Tenant Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tenant Name"
          value={currentTenantName}
          subtext={`Estate Slot #${selectedTenantId}`}
          icon={Users}
          iconColor="text-amber-400"
        />
        <StatCard
          title="Matched Centroid Profile"
          value={currentProfile?.series_name || `Series #${selectedTenantId}`}
          subtext={`Cluster ID: ${currentProfile?.cluster_id ?? (selectedTenantId - 1)}`}
          icon={Layers}
          iconColor="text-emerald-400"
          trend={{ value: 'REAL 321→6', isPositive: true }}
        />
        <StatCard
          title="Mean Load Demand"
          value={currentProfile?.mean_demand_kw ? currentProfile.mean_demand_kw.toFixed(1) : 120}
          unit="kW"
          subtext={`PAR: ${currentProfile?.peak_to_average_ratio.toFixed(2) ?? '1.45'}`}
          icon={Activity}
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Forecast Consumption"
          value={forecast ? forecast.total_consumption_forecast_kwh.toFixed(0) : 2800}
          unit="kWh/day"
          subtext={`Peak Demand: ${forecast?.peak_demand_kw.toFixed(1) ?? '180'} kW`}
          icon={TrendingUp}
          iconColor="text-violet-400"
          isDemo={true}
          demoNote="Prophet model demo forecast"
        />
      </div>

      {/* 24-Hour Load Forecast Chart & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Load Forecast Chart */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                24-Hour Load Demand Forecast ({currentTenantName})
              </h3>
              <p className="text-xs text-slate-400">
                Predicted hourly load demand in kW with upper and lower confidence intervals.
              </p>
            </div>
            <DemoBadge note="Prophet model integration demo data" />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast?.forecast_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTenant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => val.split('T')[1]?.substring(0, 5) || val}
                />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="upper_bound_kw" name="Upper Confidence (kW)" stroke="#94a3b8" strokeDasharray="3 3" fill="none" opacity={0.5} />
                <Area type="monotone" dataKey="predicted_value_kw" name="Predicted Load (kW)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTenant)" />
                <Area type="monotone" dataKey="lower_bound_kw" name="Lower Confidence (kW)" stroke="#94a3b8" strokeDasharray="3 3" fill="none" opacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical Profiling Metrics */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Profiling Metrics
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              REAL DB
            </span>
          </div>

          {currentProfile ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">Series Name</span>
                <p className="text-sm font-bold text-amber-400 font-mono">{currentProfile.series_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Min Demand</span>
                  <span className="font-bold text-slate-200">{currentProfile.min_demand_kw} kW</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Max Demand</span>
                  <span className="font-bold text-slate-200">{currentProfile.max_demand_kw} kW</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Coef. Variation (CV)</span>
                  <span className="font-bold text-slate-200">{currentProfile.coefficient_of_variation.toFixed(3)}</span>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">TOU Peak Overlap</span>
                  <span className="font-bold text-amber-400">{currentProfile.tou_peak_overlap_pct.toFixed(1)}%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Centroid Selection Rationale</span>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  {currentProfile.selection_rationale || 'Selected centroid profile for Ward hierarchical clustering.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No profile selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
