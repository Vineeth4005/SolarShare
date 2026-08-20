import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { TenantDashboardPage } from './pages/TenantDashboardPage';
import { LoadProfilesPage } from './pages/LoadProfilesPage';
import { SolarGenerationPage } from './pages/SolarGenerationPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { AllocationPage } from './pages/AllocationPage';
import { BatteryPage } from './pages/BatteryPage';
import { BillingPage } from './pages/BillingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/tenants" element={<TenantDashboardPage />} />
          <Route path="/load-profiles" element={<LoadProfilesPage />} />
          <Route path="/solar" element={<SolarGenerationPage />} />
          <Route path="/forecasting" element={<ForecastingPage />} />
          <Route path="/allocation" element={<AllocationPage />} />
          <Route path="/battery" element={<BatteryPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
