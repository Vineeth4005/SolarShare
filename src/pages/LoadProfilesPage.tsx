import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  Award,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { api } from '../api/client';
import { LoadProfileRead } from '../types/api';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateViews';
import { Modal } from '../components/ui/Modal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const LoadProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<LoadProfileRead[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedOnly, setSelectedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [clusterFilter, setClusterFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Profile Detail Modal
  const [selectedProfileDetail, setSelectedProfileDetail] = useState<LoadProfileRead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch high limit so we can filter/paginate cleanly client-side or server-side
      const res = await api.getLoadProfiles({ selected_only: selectedOnly, limit: 350, offset: 0 });
      setProfiles(res.profiles);
      setTotalCount(res.total_count);
      setSelectedCount(res.selected_count);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch load profiles database records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [selectedOnly]);

  // Filter profiles based on search query & cluster
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.series_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.series_id.toString().includes(searchQuery);

    const matchesCluster =
      clusterFilter === 'ALL' || (p.cluster_id !== undefined && p.cluster_id.toString() === clusterFilter);

    return matchesSearch && matchesCluster;
  });

  const totalPages = Math.ceil(filteredProfiles.length / pageSize) || 1;
  const paginatedProfiles = filteredProfiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openDetail = (prof: LoadProfileRead) => {
    setSelectedProfileDetail(prof);
    setIsModalOpen(true);
  };

  // Convert weekday / weekend shape JSON or array to Recharts format
  const getShapeDataForChart = (prof: LoadProfileRead) => {
    const weekdayValues: number[] = Array.isArray(prof.weekday_shape)
      ? prof.weekday_shape
      : (prof.weekday_shape as any)?.values_kw || (prof.weekday_shape as any)?.normalized_values || [];

    const weekendValues: number[] = Array.isArray(prof.weekend_shape)
      ? prof.weekend_shape
      : (prof.weekend_shape as any)?.values_kw || (prof.weekend_shape as any)?.normalized_values || [];

    const chartData = [];
    for (let h = 0; h < 24; h++) {
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      const wVal = weekdayValues[h] !== undefined ? weekdayValues[h] : 0;
      const weVal = weekendValues[h] !== undefined ? weekendValues[h] : 0;

      chartData.push({
        hour: hourStr,
        weekday: Number(wVal.toFixed(3)),
        weekend: Number(weVal.toFixed(3)),
      });
    }
    return chartData;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              321 → 6 Load Profiling Catalog
            </h1>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> REAL DB ({totalCount} Profiles)
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Deterministic Ward hierarchical clustering results from the 8.44M electricity observation dataset.
          </p>
        </div>

        {/* Selected Highlight Banner Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-medium">Selected Centroids:</span>
          <span className="font-mono font-bold text-amber-400">T258, T11, T301, T300, T84, T3</span>
        </div>
      </div>

      {/* Highlights of 6 Selected Profiles Cards */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Selected 6 Cluster Centroids
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">k=6 Ward Hierarchical Clustering</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {profiles.filter((p) => p.is_selected).map((prof) => (
            <div
              key={prof.series_name}
              onClick={() => openDetail(prof)}
              className="p-3 bg-slate-950/80 border border-amber-500/40 rounded-xl hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-extrabold font-mono">
                  C{prof.cluster_id}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                  SELECTED
                </span>
              </div>

              <div>
                <span className="font-extrabold text-white text-sm block group-hover:text-amber-400 transition-colors">
                  {prof.series_name}
                </span>
                <span className="text-[11px] text-slate-400">
                  Mean: <strong className="text-slate-200">{prof.mean_demand_kw.toFixed(1)} kW</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] pt-1.5 border-t border-slate-800 text-slate-400 font-mono">
                <div>CV: {prof.coefficient_of_variation.toFixed(2)}</div>
                <div>PAR: {prof.peak_to_average_ratio.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search series name (e.g. T258, T11)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Selected Only Toggle */}
          <button
            onClick={() => {
              setSelectedOnly(!selectedOnly);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedOnly
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Selected Centroids Only ({selectedCount})
          </button>

          {/* Cluster filter */}
          <select
            value={clusterFilter}
            onChange={(e) => {
              setClusterFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Clusters (0 - 5)</option>
            <option value="0">Cluster 0</option>
            <option value="1">Cluster 1</option>
            <option value="2">Cluster 2</option>
            <option value="3">Cluster 3</option>
            <option value="4">Cluster 4</option>
            <option value="5">Cluster 5</option>
          </select>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value={15}>15 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Profiles Data Table */}
      {loading ? (
        <LoadingState message="Querying 319 real load profile records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProfiles} />
      ) : paginatedProfiles.length === 0 ? (
        <EmptyState title="No matching load profiles" message="Try relaxing your search query or cluster filter." />
      ) : (
        <div className="glass-panel overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4">Series ID / Name</th>
                  <th className="py-3 px-4">Cluster</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Mean Demand (kW)</th>
                  <th className="py-3 px-4 text-right">Max Demand (kW)</th>
                  <th className="py-3 px-4 text-right">CV</th>
                  <th className="py-3 px-4 text-right">PAR</th>
                  <th className="py-3 px-4 text-right">TOU Peak Overlap</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {paginatedProfiles.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      p.is_selected ? 'bg-amber-500/5 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <span className="text-amber-400">{p.series_name || `Series #${p.series_id}`}</span>
                      {p.is_selected && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-extrabold tracking-wider">
                          CENTROID
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        Cluster {p.cluster_id ?? 'N/A'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      {p.is_selected ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Selected 6
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Computed Profile</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-white">
                      {p.mean_demand_kw.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right">{p.max_demand_kw.toFixed(2)}</td>

                    <td className="py-3 px-4 text-right text-slate-300">{p.coefficient_of_variation.toFixed(3)}</td>

                    <td className="py-3 px-4 text-right text-slate-300">{p.peak_to_average_ratio.toFixed(3)}</td>

                    <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                      {p.tou_peak_overlap_pct.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => openDetail(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Shape
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Showing{' '}
              <strong className="text-white">
                {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredProfiles.length)}
              </strong>{' '}
              of <strong className="text-white">{filteredProfiles.length}</strong> matching profiles
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-200">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Detail Drawer Modal */}
      {selectedProfileDetail && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Load Profile Shape Analysis: ${selectedProfileDetail.series_name}`}
          subtitle={`Cluster #${selectedProfileDetail.cluster_id} | Zenodo 321 Dataset Series #${selectedProfileDetail.series_id}`}
          maxWidth="4xl"
        >
          <div className="space-y-5">
            {/* Modal Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
              <div>
                <span className="text-slate-400 block font-sans text-[10px]">Mean Demand</span>
                <span className="text-base font-bold text-white">{selectedProfileDetail.mean_demand_kw.toFixed(2)} kW</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans text-[10px]">Peak Demand (Max)</span>
                <span className="text-base font-bold text-amber-400">{selectedProfileDetail.max_demand_kw.toFixed(2)} kW</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans text-[10px]">Coef. Variation (CV)</span>
                <span className="text-base font-bold text-cyan-400">{selectedProfileDetail.coefficient_of_variation.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans text-[10px]">Peak-to-Average (PAR)</span>
                <span className="text-base font-bold text-violet-400">{selectedProfileDetail.peak_to_average_ratio.toFixed(3)}</span>
              </div>
            </div>

            {/* 24-Hour Weekday vs Weekend Shape Line Chart */}
            <div className="glass-panel p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  24-Hour Normalized Load Demand Shapes (Weekday vs Weekend)
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                  REAL COMPUTED DATA
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getShapeDataForChart(selectedProfileDetail)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} label={{ value: 'Normalized Demand', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="weekday" name="Weekday 24h Shape" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="weekend" name="Weekend 24h Shape" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Stats & Selection Rationale */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-slate-200 block text-xs">Derived Ratios & Metrics</span>
                <div className="space-y-1.5 font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Day/Night Demand Ratio:</span>
                    <span>{selectedProfileDetail.day_night_ratio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Weekday/Weekend Ratio:</span>
                    <span>{selectedProfileDetail.weekday_weekend_ratio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TOU Peak Period Overlap:</span>
                    <span className="text-amber-400 font-bold">{selectedProfileDetail.tou_peak_overlap_pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Series Observations:</span>
                    <span>{selectedProfileDetail.observation_count?.toLocaleString() || '26,304'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="font-bold text-slate-200 block text-xs">Selection Rationale & Centroid Info</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedProfileDetail.selection_rationale ||
                    'Series computed via Ward hierarchical clustering over PCA-reduced 24-hour load features.'}
                </p>
                {selectedProfileDetail.is_selected && (
                  <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Selected as Cluster #{selectedProfileDetail.cluster_id} Centroid Series</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
