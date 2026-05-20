import React, { useState } from 'react';
import type { OrchestratorState, SignalBundle } from '../types';
import { SignalInputPanel } from '../components/signals/SignalInputPanel';
import { AgentTracePanel } from '../components/agents/AgentTracePanel';
import { CrisisCard } from '../components/crisis/CrisisCard';
import { ActionPlanPanel } from '../components/response/ActionPlanPanel';
import { SimulationPanel } from '../components/simulation/SimulationPanel';
import { OutcomePanel } from '../components/outcome/OutcomePanel';
import { CrisisMap } from '../components/map/CrisisMap';
import { useAuth } from '../context/AuthContext';

interface Props {
  signals: SignalBundle;
  orchestrator: OrchestratorState;
  onSignalsChange: (s: SignalBundle) => void;
  onAnalyze: () => void;
}

type TabID = 'input' | 'ai' | 'plan' | 'sim' | 'map';

const PANEL_STYLE: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-gold)',
  borderRadius: 12,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  boxShadow: 'var(--shadow-card)',
  height: '100%',
  overflowY: 'auto'
};

export function DashboardPage({ signals, orchestrator, onSignalsChange, onAnalyze }: Props) {
  const { user } = useAuth();
  const isRunning = orchestrator.status === 'running';
  const isComplete = orchestrator.status === 'complete';
  const [activeTab, setActiveTab] = useState<TabID>('input');

  const tabs: { id: TabID; label: string; icon: string }[] = [
    { id: 'input', label: 'Signals', icon: '📡' },
    { id: 'ai', label: 'AI Analysis', icon: '🧠' },
    { id: 'plan', label: 'Action Plan', icon: '📋' },
    { id: 'sim', label: 'Simulation', icon: '⚙️' },
    { id: 'map', label: 'Map & Outcome', icon: '🗺️' },
  ];

  return (
    <div style={{ padding: '16px', maxWidth: 1600, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Title & Status */}
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user && (
            <img 
              src={user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
              alt={user.name} 
              style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-gold)', objectFit: 'cover', background: '#fff' }} 
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--pak-gold)', letterSpacing: '0.05em', lineHeight: 1.1 }}>
              COMMAND CENTER
            </h1>
            {user && (
              <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Operator: <span style={{ color: 'var(--pak-gold)' }}>{user.name}</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isRunning && <><span className="pulse-dot warning" /><span style={{ fontSize: 10, color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>{orchestrator.currentAgent}</span></>}
          {isComplete && <><span className="pulse-dot success" /><span style={{ fontSize: 10, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>COMPLETE</span></>}
          {orchestrator.status === 'idle' && <><span className="pulse-dot gold" /><span style={{ fontSize: 10, color: 'var(--pak-gold)', fontFamily: 'var(--font-mono)' }}>READY</span></>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 8, marginBottom: 16, paddingBottom: 4, scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', borderRadius: 20, border: '1px solid', whiteSpace: 'nowrap',
              background: activeTab === tab.id ? 'rgba(212,175,55,0.15)' : 'var(--bg-elevated)',
              borderColor: activeTab === tab.id ? 'var(--pak-gold)' : 'var(--border-gold)',
              color: activeTab === tab.id ? 'var(--pak-gold)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area - Scrolls internally if needed, but fits mobile screen */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div style={PANEL_STYLE} className="glow-card">
            <SignalInputPanel signals={signals} onSignalsChange={onSignalsChange} onAnalyze={() => { onAnalyze(); setActiveTab('ai'); }} isRunning={isRunning} />
          </div>
        )}

        {/* AI ANALYSIS TAB */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>
            <div style={{ ...PANEL_STYLE, height: 'auto', borderColor: orchestrator.crisisReport ? 'var(--critical)' : 'var(--border-gold)' }} className={orchestrator.crisisReport ? 'glow-card critical' : 'glow-card'}>
              {orchestrator.crisisReport ? (
                <CrisisCard report={orchestrator.crisisReport} />
              ) : (
                <EmptyPanel icon="🎯" title="CRISIS DETECTION" urdu="بحران کی تشخیص" label="Awaiting Analysis" color="var(--warning)" />
              )}
            </div>
            <div style={{ ...PANEL_STYLE, height: 'auto' }} className="glow-card">
              <AgentTracePanel traces={orchestrator.traces} currentAgent={orchestrator.currentAgent} />
            </div>
          </div>
        )}

        {/* ACTION PLAN TAB */}
        {activeTab === 'plan' && (
          <div style={PANEL_STYLE} className="glow-card">
            {orchestrator.actionPlan ? (
              <ActionPlanPanel plan={orchestrator.actionPlan} />
            ) : (
              <EmptyPanel icon="📋" title="ACTION PLAN" urdu="عملی منصوبہ" label="Awaiting Crisis Report" color="var(--pak-gold)" />
            )}
          </div>
        )}

        {/* SIMULATION TAB */}
        {activeTab === 'sim' && (
          <div style={PANEL_STYLE} className="glow-card">
            {orchestrator.simulationResult ? (
              <SimulationPanel simulation={orchestrator.simulationResult} />
            ) : (
              <EmptyPanel icon="⚙️" title="SIMULATION" urdu="نقالی" label="Awaiting Action Plan" color="var(--success)" />
            )}
          </div>
        )}

        {/* MAP & OUTCOME TAB */}
        {activeTab === 'map' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflowY: 'auto' }}>
            <div style={{ ...PANEL_STYLE, height: 350, flexShrink: 0 }} className="glow-card">
              <CrisisMap report={orchestrator.crisisReport} height={300} />
            </div>
            <div style={{ ...PANEL_STYLE, height: 'auto' }} className="glow-card">
              {orchestrator.simulationResult && orchestrator.simulationResult.outcome.congestion_before > 0 ? (
                <OutcomePanel simulation={orchestrator.simulationResult} />
              ) : (
                <EmptyPanel icon="📊" title="OUTCOME VISUALIZATION" urdu="نتائج" label="Awaiting Simulation" color="var(--success)" />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function EmptyPanel({ icon, title, urdu, label, color }: { icon: string; title: string; urdu: string; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px 20px', border: '1px dashed var(--border-gold)', borderRadius: 10, background: 'rgba(212,175,55,0.02)' }}>
      <div style={{ fontSize: 40, opacity: 0.5 }}>{icon}</div>
      <div>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color, textAlign: 'center' }}>{title}</h2>
        <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 12, color: 'var(--text-muted)', direction: 'rtl', textAlign: 'center' }}>{urdu}</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
