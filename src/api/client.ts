import axios from 'axios';
import {
  DashboardOverviewResponse,
  LoadProfilesListResponse,
  LoadProfileRead,
  PVConfigRead,
  SolarGenerationListResponse,
  SolarForecastResponse,
  TenantForecastResponse,
  AllocationCurrentResponse,
  BatteryConfigRead,
  BatteryStatusResponse,
  TariffRead,
  BillingSummaryResponse,
  AnalyticsOverviewResponse,
  HealthCheckResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  getHealth: async (): Promise<HealthCheckResponse> => {
    const { data } = await apiClient.get<HealthCheckResponse>('/health');
    return data;
  },

  // Dashboard Overview
  getDashboardOverview: async (): Promise<DashboardOverviewResponse> => {
    const { data } = await apiClient.get<DashboardOverviewResponse>('/dashboard/overview');
    return data;
  },

  // Load Profiles (REAL 319 / 6 selected)
  getLoadProfiles: async (params?: { selected_only?: boolean; limit?: number; offset?: number }): Promise<LoadProfilesListResponse> => {
    const { data } = await apiClient.get<LoadProfilesListResponse>('/load-profiles', { params });
    return data;
  },

  getSelectedLoadProfiles: async (): Promise<LoadProfileRead[]> => {
    const { data } = await apiClient.get<LoadProfileRead[]>('/load-profiles/selected');
    return data;
  },

  getLoadProfileByIdOrName: async (identifier: string): Promise<LoadProfileRead> => {
    const { data } = await apiClient.get<LoadProfileRead>(`/load-profiles/${identifier}`);
    return data;
  },

  // Solar
  getPVConfig: async (estateId?: number): Promise<PVConfigRead> => {
    const { data } = await apiClient.get<PVConfigRead>('/solar/pv-config', { params: { estate_id: estateId } });
    return data;
  },

  getSolarGeneration: async (limit = 24, estateId?: number): Promise<SolarGenerationListResponse> => {
    const { data } = await apiClient.get<SolarGenerationListResponse>('/solar/generation', { params: { limit, estate_id: estateId } });
    return data;
  },

  // Forecasting (DEMO / Prophet)
  getSolarForecast: async (hours = 24, estateId = 1): Promise<SolarForecastResponse> => {
    const { data } = await apiClient.get<SolarForecastResponse>('/forecasting/solar', { params: { hours, estate_id: estateId } });
    return data;
  },

  getTenantForecast: async (tenantId: number, hours = 24): Promise<TenantForecastResponse> => {
    const { data } = await apiClient.get<TenantForecastResponse>(`/forecasting/tenants/${tenantId}`, { params: { hours } });
    return data;
  },

  // Energy Allocation (DEMO / PuLP)
  getCurrentAllocation: async (): Promise<AllocationCurrentResponse> => {
    const { data } = await apiClient.get<AllocationCurrentResponse>('/allocation/current');
    return data;
  },

  // Battery
  getBatteryConfig: async (estateId?: number): Promise<BatteryConfigRead> => {
    const { data } = await apiClient.get<BatteryConfigRead>('/battery/config', { params: { estate_id: estateId } });
    return data;
  },

  getBatteryStatus: async (estateId = 1): Promise<BatteryStatusResponse> => {
    const { data } = await apiClient.get<BatteryStatusResponse>('/battery/status', { params: { estate_id: estateId } });
    return data;
  },

  // Billing & Tariffs
  getTariffs: async (): Promise<TariffRead> => {
    const { data } = await apiClient.get<TariffRead>('/billing/tariffs');
    return data;
  },

  getBillingSummary: async (month = '2026-08'): Promise<BillingSummaryResponse> => {
    const { data } = await apiClient.get<BillingSummaryResponse>('/billing/summary', { params: { month } });
    return data;
  },

  // Analytics (REAL)
  getAnalyticsOverview: async (): Promise<AnalyticsOverviewResponse> => {
    const { data } = await apiClient.get<AnalyticsOverviewResponse>('/analytics/overview');
    return data;
  },
};
