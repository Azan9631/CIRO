import React from 'react';
import type { CrisisSituationReport } from '../types';
import { CrisisMap } from '../components/map/CrisisMap';
import { CRISIS_LABELS, CRISIS_COLORS } from '../types';

interface Props { report?: CrisisSituationReport; }

const DEMO_PINS: Array<{ lat: number; lng: number; label: string; type: string }> = [
  { lat: 33.6844, lng: 73.0479, label: 'G-10 Flash Flood', type: 'urban_flooding' },
  { lat: 24.8478, lng: 67.0157, label: 'George Town Flood', type: 'urban_flooding' },
  { lat: 31.5497, lng: 74.3436, label: 'M-2 Motorway Accident', type: 'accident' },
  { lat: 24.7943, lng: 67.0642, label: 'DHA Power Outage', type: 'infrastructure_failure' },
  { lat: 24.8219, lng: 67.0228, label: 'Clifton Heatwave', type: 'heatwave' },
];

export function MapPage({ report }: Props) {
  return (
    <div style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--cyan)' }}>CRISIS ZONE MAP</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Real-time crisis visualization for Pakistani cities</p>
        </div>
        {report && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-critical">
              <span className="pulse-dot critical" style={{ width: 6, height: 6 }} />
              ACTIVE CRISIS
            </span>
            <span className="badge badge-info">{CRISIS_LABELS[report.crisis_type]}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, height: 'calc(100vh - 180px)' }}>
        {/* Main Map */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', height: '100%', minHeight: 400 }}>
          <CrisisMap report={report} height="100%" />
        </div>

        {/* Legend & Pins */}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {/* Legend */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, minWidth: 200, flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>CRISIS LEGEND</div>
            {Object.entries(CRISIS_LABELS).filter(([k]) => k !== 'unknown').map(([type, label]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: CRISIS_COLORS[type as keyof typeof CRISIS_COLORS], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Known Crisis Points */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', gap: 12, overflowX: 'auto', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)', minWidth: 120 }}>KNOWN RISK ZONES</div>
            {DEMO_PINS.map((pin, i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CRISIS_COLORS[pin.type as keyof typeof CRISIS_COLORS], flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{pin.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Crisis Info */}
          {report && (
            <div style={{ background: 'var(--critical-dim)', border: '1px solid var(--border-critical)', borderRadius: 12, padding: 16, minWidth: 250, flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--critical)', marginBottom: 10, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>⚠ ACTIVE CRISIS</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: CRISIS_COLORS[report.crisis_type], marginBottom: 6 }}>{CRISIS_LABELS[report.crisis_type]}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{report.description.slice(0, 80)}...</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {report.affected_zones.map((z, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4 }}>{z}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
