import React, { useEffect, useState } from 'react';
import { Share2, Sun, Battery, Zap, CheckCircle2, Award } from 'lucide-react';
import { api } from '../api/client';
import { AllocationCurrentResponse } from '../types/api';
import { StatCard } from '../components/ui/StatCard';
import { LoadingState, ErrorState } from '../components/ui/StateViews';
import { DemoBadge, DemoBanner } from '../components/ui/DemoBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AllocationPage: React.FC = () => {
  const [allocation, setAllocation] = useState<AllocationCurrentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCurrentAllocation();
      setAllocation(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch allocation demo payload');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Querying PuLP Fair Share Optimization Solver..." />;
  if (error || !allocation) return <ErrorState message={error || 'No allocation data.'} onRetry={fetchData} />;

  const chartData = allocation.allocations.map((a) => ({
    name: a.tenant_name.length > 15 ? `${a.tenant_name.substring(0, 15)}...` : a.tenant_name,
    solar: a.allocated_solar_kw,
    battery: a.battery_power_kw,
    grid: a.grid_power_kw,
    demanded: a.demanded_kw,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Fair Solar Energy Allocation
            </h1>
            <DemoBadge label="DEMO MODULE" size="lg" note={allocation.explanatory_note} />
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Proportional fair share optimization dividing shared 500 kW solar PV generation across MSME tenants.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Status: {allocation.optimization_status}
        </div>
      </div>

      <DemoBanner note={allocation.explanatory_note} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Solar Power"
          value={allocation.total_solar_available_kw.toFixed(1)}
          unit="kW"
          subtext="500 kW System Generation"
          icon={Sun}
          iconColor="text-amber-400"
          isDemo={true}
        />
        <StatCard
          title="Total Estate Demand"
          value={allocation.total_estate_demand_kw.toFixed(1)}
          unit="kW"
          subtext="Sum of 5 MSME Tenants"
          icon={Share2}
          iconColor="text-cyan-400"
          isDemo={true}
        />
        <StatCard
          title="Unallocated Solar Power"
          value={allocation.unallocated_solar_kw.toFixed(1)}
          unit="kW"
          subtext="Excess to Battery BESS"
          icon={Battery}
          iconColor="text-emerald-400"
          isDemo={true}
        />
        <StatCard
          title="PuLP Optimizer"
          value="PROPORTIONAL"
          subtext="Fairness Shares Enabled"
          icon={Award}
          iconColor="text-violet-400"
          isDemo={true}
        />
      </div>

      {/* Stacked Bar Chart */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            Power Sources Breakdown per MSME Tenant (kW)
          </h3>
          <DemoBadge note="Illustrative PuLP allocation breakdown" />
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" kW" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="solar" name="Allocated Solar (kW)" stackId="a" fill="#f59e0b" />
              <Bar dataKey="battery" name="Battery Power (kW)" stackId="a" fill="#10b981" />
              <Bar dataKey="grid" name="Grid Power (kW)" stackId="a" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="glass-panel overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Tenant Proportional Allocation Table
          </h3>
          <span className="text-xs text-slate-400 font-mono">PuLP Model Target Schema</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Tenant Name</th>
                <th className="py-3 px-4 text-right">Demanded (kW)</th>
                <th className="py-3 px-4 text-right text-amber-400">Allocated Solar (kW)</th>
                <th className="py-3 px-4 text-right text-emerald-400">Battery (kW)</th>
                <th className="py-3 px-4 text-right text-cyan-400">Grid (kW)</th>
                <th className="py-3 px-4 text-right">Fairness Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {allocation.allocations.map((item) => (
                <tr key={item.tenant_id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-white">{item.tenant_name}</td>
                  <td className="py-3 px-4 text-right font-bold">{item.demanded_kw.toFixed(1)}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-400">{item.allocated_solar_kw.toFixed(1)}</td>
                  <td className="py-3 px-4 text-right text-emerald-400">{item.battery_power_kw.toFixed(1)}</td>
                  <td className="py-3 px-4 text-right text-cyan-400">{item.grid_power_kw.toFixed(1)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-200">{item.fairness_share_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
