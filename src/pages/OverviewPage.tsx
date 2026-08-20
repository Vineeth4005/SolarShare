import React, { useEffect, useState } from 'react';
import {
  Database,
  Sun,
  BatteryCharging,
  Zap,
  Receipt,
  Layers,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../api/client';
import { DashboardOverviewResponse } from '../types/api';
import { StatCard } from '../components/ui/StatCard';
import { LoadingState, ErrorState } from '../components/ui/StateViews';
import { DemoBadge, DemoBanner } from '../components/ui/DemoBadge';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardOverview();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading SolarShare Executive Dashboard..." />;
  if (error || !data) return <ErrorState message={error || 'No overview data received.'} onRetry={fetchData} />;

  const { dataset_metrics, solar_metrics, battery_metrics, allocation_metrics, billing_metrics, selected_profiles_summary } = data;

  // 24h bell curve generation demo visualization for chart
  const solarGenTrend = [
    { hour: '00:00', solar: 0, demand: 150 },
    { hour: '04:00', solar: 0, demand: 120 },
    { hour: '08:00', solar: 140, demand: 380 },
    { hour: '12:00', solar: 480, demand: 450 },
    { hour: '16:00', solar: 320, demand: 420 },
    { hour: '20:00', solar: 10, demand: 280 },
    { hour: '23:00', solar: 0, demand: 180 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Executive Overview
            </h1>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Phase 2 Verified
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real dataset statistics (8.44M obs, 321 series → 6 profiles) combined with operational prototype telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/load-profiles"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            Explore 319 Profiles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Explanatory Banner */}
      <DemoBanner note={data.explanatory_note} />

      {/* Top Stat Cards (Dataset Real Data + Operational Demo Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Zenodo Observation Records"
          value={dataset_metrics.total_observations}
          unit="obs"
          subtext="321 Public Load Series"
          icon={Database}
          iconColor="text-emerald-400"
          accentColor="border-emerald-500/30"
          trend={{ value: 'REAL DB', isPositive: true }}
        />
        <StatCard
          title="Computed Profiles"
          value={dataset_metrics.total_profiles_computed}
          unit="profiles"
          subtext="6 Cluster Centroid Profiles"
          icon={Layers}
          iconColor="text-cyan-400"
          accentColor="border-cyan-500/30"
          trend={{ value: '321 → 6', isPositive: true }}
        />
        <StatCard
          title="Installed Solar Capacity"
          value={solar_metrics.installed_capacity_kw}
          unit="kW"
          subtext={`Current Output: ${solar_metrics.current_generation_kw} kW`}
          icon={Sun}
          iconColor="text-amber-400"
          accentColor="border-amber-500/30"
          isDemo={true}
          demoNote="Demo PV System Telemetry"
        />
        <StatCard
          title="Monthly Savings Estimate"
          value={`₹${(billing_metrics.estimated_monthly_savings_inr / 1000).toFixed(0)}k`}
          unit="/ mo"
          subtext="Tamil Nadu ToU Tariff"
          icon={Receipt}
          iconColor="text-violet-400"
          accentColor="border-violet-500/30"
          isDemo={true}
          demoNote="Demo Tariff Calculation"
        />
      </div>

      {/* Real 6 Selected Profiles Summary & Generation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real 6 Selected Profiles List */}
        <div className="glass-panel p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Selected Profile Centroids</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
              REAL DATA (k=6)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Representing 321 public load series using Ward hierarchical clustering & PCA reduction.
          </p>

          <div className="space-y-2.5">
            {selected_profiles_summary.map((prof) => (
              <div
                key={prof.series_name}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-amber-500/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-black flex items-center justify-center">
                    C{prof.cluster_id}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                        {prof.series_name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                        SELECTED
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Mean Demand: <strong className="text-slate-200">{prof.mean_demand_kw} kW</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-slate-300">CV: {(prof.cv ?? prof.coefficient_of_variation).toFixed(2)}</div>
                  <div className="text-slate-400 text-[10px]">PAR: {(prof.par ?? prof.peak_to_average_ratio).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/load-profiles"
            className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg text-center transition-colors block"
          >
            View Full 319 Load Profiles Table →
          </Link>
        </div>

        {/* Right Column: Generation vs Demand Curve & Battery/Allocation Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  Estate Energy Balance (24h Telemetry)
                </h3>
                <p className="text-xs text-slate-400">
                  Solar PV output vs total estate load demand (500 kW Solar STC).
                </p>
              </div>
              <DemoBadge note="Operational curve uses prototype solar estimation" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={solarGenTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" kW" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="solar" name="Solar Gen (kW)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorSolar)" />
                  <Area type="monotone" dataKey="demand" name="Estate Demand (kW)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase">Battery (BESS)</span>
                <DemoBadge size="sm" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{battery_metrics.current_soc_pct}%</span>
                <span className="text-xs text-emerald-400 font-semibold">{battery_metrics.status}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                  style={{ width: `${battery_metrics.current_soc_pct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {battery_metrics.stored_energy_kwh} kWh / {battery_metrics.capacity_kwh} kWh
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase">Solar Coverage</span>
                <DemoBadge size="sm" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-amber-400">{allocation_metrics.solar_coverage_pct}%</span>
                <span className="text-xs text-slate-400">of estate load</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${allocation_metrics.solar_coverage_pct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Active Tenants: {allocation_metrics.active_tenants}
              </p>
            </div>

            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase">Grid Dependency</span>
                <DemoBadge size="sm" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-cyan-400">{allocation_metrics.grid_dependency_pct}%</span>
                <span className="text-xs text-slate-400">supplemental</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${allocation_metrics.grid_dependency_pct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Battery Share: {allocation_metrics.battery_contribution_pct}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
