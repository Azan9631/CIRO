import React from 'react';
import type { SimulationResult } from '../../types';

interface Props { simulation: SimulationResult; }

export function OutcomePanel({ simulation }: Props) {
  const { outcome } = simulation;
  const cDrop = outcome.congestion_before - outcome.congestion_after;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--success)' }}>OUTCOME</h2>
            <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 12, color: 'var(--text-muted)', direction: 'rtl' }}>نتائج</div>
          </div>
        </div>
      </div>

      <div className="desi-divider" />

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MetricCard label="Congestion Drop" value={`-${cDrop}%`} icon="📉" color="var(--success)" />
        <MetricCard label="Response Time" value={`${outcome.response_time_min}m`} icon="⚡" color="var(--pak-gold)" />
        <MetricCard label="Units Deployed" value={outcome.units_deployed.toString()} icon="🚑" color="var(--sky-blue)" />
        <MetricCard label="Alerts Sent" value={(outcome.alerts_sent / 1000).toFixed(1) + 'k'} icon="📢" color="var(--truck-pink)" />
        <MetricCard label="Tickets Created" value={outcome.tickets_created.toString()} icon="🎫" color="var(--warning)" />
        <MetricCard label="Est. Lives Impacted" value={(outcome.estimated_lives_impacted / 1000).toFixed(0) + 'k+'} icon="👥" color="var(--pak-green-light)" />
      </div>

      {/* Congestion Bar */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 8, padding: 16, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 11, color: 'var(--pak-gold)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>TRAFFIC CONGESTION DELTA</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
              <span>INITIAL: {outcome.congestion_before}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
              <div style={{ height: '100%', width: `${outcome.congestion_before}%`, background: 'var(--critical)' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--success)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
              <span>POST-RESPONSE: {outcome.congestion_after}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-gold)' }}>
              <div style={{ height: '100%', width: `${outcome.congestion_after}%`, background: 'var(--success)', transition: 'width 1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div style={{ background: '#030805', border: '1px solid var(--border-green)', borderRadius: 8, padding: 12, flex: 1, minHeight: 120, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, color: 'var(--pak-green-light)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>SYSTEM RUNTIME LOGS</div>
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {simulation.system_log.map((log, i) => {
            const isTkt = log.includes('TKT-');
            const isOutcome = log.includes('OUTCOME:');
            const color = isOutcome ? 'var(--pak-gold)' : isTkt ? 'var(--success)' : 'var(--text-muted)';
            return (
              <div key={i} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color, lineHeight: 1.4 }}>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: `1px solid ${color}40`, borderRadius: 8, padding: '12px 10px', textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color, fontFamily: 'var(--font-display)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
