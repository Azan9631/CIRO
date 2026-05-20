import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { LogsPage } from './pages/LogsPage';
import { CitizenHomePage } from './pages/CitizenHomePage';
import type { SignalBundle, OrchestratorState } from './types';
import { runOrchestrator } from './agents/orchestrator';

const DEFAULT_SIGNALS: SignalBundle = {
  socialSignals: [],
  weather: { rainfall_mm: 10, temperature_c: 28, humidity_pct: 65, wind_speed_kmh: 15, alert: 'Moderate Rain Warning' },
  traffic: { congestion_level: 40, affected_roads: ['Main Boulevard', 'Ring Road'], incident_reports: 2, avg_speed_kmh: 35 },
  timestamp: new Date().toISOString(),
};

const DEFAULT_ORCHESTRATOR: OrchestratorState = { status: 'idle', currentAgent: '', traces: [] };

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, role, loading } = useAuth();
  
  if (loading) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && role !== 'admin') return <Navigate to="/map" />; // Citizens redirect to map
  
  return <>{children}</>;
}

function MainApp() {
  const { user, role } = useAuth();
  const [signals, setSignals] = useState<SignalBundle>(DEFAULT_SIGNALS);
  const [orchestrator, setOrchestrator] = useState<OrchestratorState>(DEFAULT_ORCHESTRATOR);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleStateUpdate = useCallback((partial: Partial<OrchestratorState>) => {
    setOrchestrator(prev => ({ ...prev, ...partial }));
  }, []);

  const handleAnalyze = useCallback(async () => {
    setOrchestrator({ status: 'running', currentAgent: 'Signal Fusion Agent', traces: [] });
    try {
      await runOrchestrator({ ...signals, timestamp: new Date().toISOString() }, handleStateUpdate);
    } catch (err) {
      setOrchestrator(prev => ({ ...prev, status: 'error', error: err instanceof Error ? err.message : String(err) }));
    }
  }, [signals, handleStateUpdate]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />
      
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 60 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<ProtectedRoute>{role === 'admin' ? <LandingPage /> : <CitizenHomePage />}</ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requireAdmin><DashboardPage signals={signals} orchestrator={orchestrator} onSignalsChange={setSignals} onAnalyze={handleAnalyze} /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapPage report={orchestrator.crisisReport} /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute requireAdmin><LogsPage orchestrator={orchestrator} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </main>

      <BottomNav role={role} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
}
