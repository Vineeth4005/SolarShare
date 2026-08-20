import React, { useEffect, useState } from 'react';
import { BatteryCharging, Battery, Zap, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { api } from '../api/client';
import { BatteryConfigRead, BatteryStatusResponse } from '../types/api';
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

export const BatteryPage: React.FC = () => {
  const [bConfig, setBConfig] = useState<BatteryConfigRead | null>(null);
  const [bStatus, setBStatus] = useState<BatteryStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfgRes, statusRes] = await Promise.all([
        api.getBatteryConfig(),
        api.getBatteryStatus(),
      ]);
      setBConfig(cfgRes);
      setBStatus(statusRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch battery telemetry demo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Connecting to Battery Energy Storage System (BESS)..." />;
  if (error || !bConfig || !bStatus) return <ErrorState message={error || 'No battery status.'} onRetry={fetchData} />;

  // 24h battery schedule simulation data
  const scheduleData = [
    { hour: '00:00', soc: 40, power: -15 },
    { hour: '04:00', soc: 30, power: -10 },
    { hour: '08:00', soc: 50, power: 25 },
    { hour: '12:00', soc: 88, power: 45 },
    { hour: '16:00', soc: 75, power: -20 },
    { hour: '20:00', soc: 55, power: -30 },
    { hour: '23:00', soc: 42, power: -10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Battery Storage (BESS)
            </h1>
            <DemoBadge label="DEMO MODULE" size="lg" note={bStatus.explanatory_note} />
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            200 kWh Lithium Iron Phosphate (LFP) Battery Storage System Status & State-of-Charge loop.
          </p>
        </div>
      </div>

      <DemoBanner note={bStatus.explanatory_note} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current State of Charge"
          value={`${bStatus.current_soc_pct}%`}
          subtext={`${bStatus.current_stored_kwh} kWh / ${bStatus.capacity_kwh} kWh`}
          icon={BatteryCharging}
          iconColor="text-emerald-400"
          isDemo={true}
        />
        <StatCard
          title="Power Output"
          value={`${bStatus.current_power_kw} kW`}
          subtext={`Mode: ${bStatus.operation_mode}`}
          icon={Zap}
          iconColor="text-amber-400"
          isDemo={true}
        />
        <StatCard
          title="State of Health (SOH)"
          value={`${bStatus.health_soh_pct}%`}
          subtext="LFP Cell Degradation Normal"
          icon={ShieldCheck}
          iconColor="text-cyan-400"
          isDemo={true}
        />
        <StatCard
          title="Round-Trip Efficiency"
          value={`${(bConfig.round_trip_efficiency * 100).toFixed(0)}%`}
          subtext={`Max Charge: ${bConfig.max_charge_kw} kW`}
          icon={Cpu}
          iconColor="text-violet-400"
          isDemo={true}
        />
      </div>

      {/* Main SOC & Battery Status Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOC Visual Gauge */}
        <div className="glass-panel p-5 flex flex-col justify-between space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-400" />
            BESS Storage Gauge
          </h3>

          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl">
              <div className="text-center space-y-1">
                <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">{bStatus.current_soc_pct}%</span>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">State of Charge</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Min SoC ({bConfig.min_soc_pct}%)</span>
                <span className="text-white font-bold">{bStatus.current_stored_kwh} kWh</span>
                <span>Max SoC ({bConfig.max_soc_pct}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${bStatus.current_soc_pct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">{bStatus.operation_mode}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Power:</span>
              <span className="text-amber-400 font-bold">{bStatus.current_power_kw} kW</span>
            </div>
          </div>
        </div>

        {/* 24-Hour Battery Schedule Simulation Chart */}
        <div className="lg:col-span-2 glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              24-Hour Battery Charge/Discharge Schedule (Simulation)
            </h3>
            <DemoBadge note="Illustrative battery schedule simulation" />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scheduleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="socGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Area type="monotone" dataKey="soc" name="State of Charge (%)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#socGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
