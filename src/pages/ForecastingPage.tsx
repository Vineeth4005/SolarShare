import React, { useEffect, useState } from 'react';
import { TrendingUp, Sun, Users, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { SolarForecastResponse, TenantForecastResponse } from '../types/api';
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
  Legend,
} from 'recharts';

export const ForecastingPage: React.FC = () => {
  const [solarForecast, setSolarForecast] = useState<SolarForecastResponse | null>(null);
  const [tenantForecast, setTenantForecast] = useState<TenantForecastResponse | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<number>(1);
  const [forecastHours, setForecastHours] = useState<number>(24);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, tRes] = await Promise.all([
        api.getSolarForecast(forecastHours),
        api.getTenantForecast(selectedTenantId, forecastHours),
      ]);
      setSolarForecast(sRes);
      setTenantForecast(tRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch forecasting demo payload');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTenantId, forecastHours]);

  if (loading) return <LoadingState message="Connecting to Prophet Forecasting Endpoint..." />;
  if (error || !solarForecast || !tenantForecast) return <ErrorState message={error || 'No forecast data.'} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Solar & Load Forecasting
            </h1>
            {solarForecast.is_demo ? (
              <DemoBadge label="DEMO MODULE" size="lg" note={solarForecast.explanatory_note} />
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                PROPHET ACTIVE — trained on NASA POWER-derived PV generation estimates
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Prophet time-series forecasting for solar PV generation and individual MSME tenant demand preview.
          </p>
        </div>

        {/* Forecast Horizon Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Horizon:</span>
          {[24, 48, 72, 168].map((h) => (
            <button
              key={h}
              onClick={() => setForecastHours(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                forecastHours === h
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {h === 168 ? '7 Days' : `${h}h`}
            </button>
          ))}
        </div>
      </div>

      {/* Explanatory Banner */}
      {solarForecast.is_demo ? (
        <DemoBanner note={solarForecast.explanatory_note || "Prophet forecasting model is not yet connected. This view showcases the target UI and payload schemas using illustrative bell-curve response vectors."} />
      ) : (
        <div className="w-full bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3 text-sm text-emerald-200/90 shadow-lg">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-emerald-400 uppercase text-xs tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded">
                Real Prophet Model Forecast (Trained on NASA POWER-derived PV targets)
              </span>
              <span className="text-xs text-emerald-300/70">
                Model: {solarForecast.model_name || 'Prophet'} ({solarForecast.training_record_count?.toLocaleString()} training records)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {solarForecast.explanatory_note}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Forecast Horizon"
          value={`${forecastHours} Hours`}
          subtext="Hourly Prediction Steps"
          icon={TrendingUp}
          iconColor="text-amber-400"
          isDemo={false}
        />
        <StatCard
          title="Solar Generation Forecast"
          value={solarForecast.total_generation_forecast_kwh.toFixed(0)}
          unit="kWh"
          subtext={`Peak: ${solarForecast.peak_generation_kw.toFixed(1)} kW`}
          icon={Sun}
          iconColor="text-emerald-400"
          isDemo={solarForecast.is_demo}
        />
        <StatCard
          title="Tenant Demand Forecast"
          value={tenantForecast.total_consumption_forecast_kwh.toFixed(0)}
          unit="kWh"
          subtext={`Peak: ${tenantForecast.peak_demand_kw.toFixed(1)} kW`}
          icon={Users}
          iconColor="text-cyan-400"
          isDemo={true}
        />
        <StatCard
          title="Prophet Confidence"
          value="80%"
          subtext="Upper / Lower Bounds"
          icon={Sparkles}
          iconColor="text-violet-400"
          isDemo={solarForecast.is_demo}
        />
      </div>

      {/* Solar Forecast Chart */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              Solar PV Generation Forecast Curve ({forecastHours}h Ahead)
            </h3>
            <p className="text-xs text-slate-400">Predicted generation with upper/lower uncertainty bounds.</p>
          </div>
          {solarForecast.is_demo ? (
            <DemoBadge note="Illustrative Prophet solar curve" />
          ) : (
            <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md">
              Real Prophet Forecast
            </span>
          )}
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={solarForecast.forecast_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="solarForecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('T')[1]?.substring(0, 5) || val} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" kW" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Area type="monotone" dataKey="upper_bound_kw" name="Upper Bound (kW)" stroke="#94a3b8" strokeDasharray="3 3" fill="none" opacity={0.5} />
              <Area type="monotone" dataKey="predicted_value_kw" name="Solar Forecast (kW)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#solarForecastGrad)" />
              <Area type="monotone" dataKey="lower_bound_kw" name="Lower Bound (kW)" stroke="#94a3b8" strokeDasharray="3 3" fill="none" opacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tenant Load Forecast Chart */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Tenant Load Demand Forecast ({tenantForecast.tenant_name})
            </h3>
            <p className="text-xs text-slate-400">Predicted hourly energy demand in kW.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Switch Tenant:</span>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {[1, 2, 3, 4, 5].map((id) => (
                <option key={id} value={id}>
                  Tenant #{id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tenantForecast.forecast_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tenantForecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('T')[1]?.substring(0, 5) || val} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" kW" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Area type="monotone" dataKey="predicted_value_kw" name="Tenant Load Forecast (kW)" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#tenantForecastGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
