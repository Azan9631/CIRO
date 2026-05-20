import React from 'react';
import type { CrisisSituationReport } from '../../types';
import { CRISIS_LABELS, CRISIS_COLORS } from '../../types';

const CRISIS_ICONS: Record<string, string> = {
  urban_flooding: '🌊', heatwave: '🔥', road_blockage: '🚧',
  accident: '🚨', infrastructure_failure: '⚡', unknown: '❓',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444',
};

interface Props { report: CrisisSituationReport; }

export function CrisisCard({ report }: Props) {
  const crisisColor = CRISIS_COLORS[report.crisis_type] ?? '#06b6d4';
  const severityColor = SEVERITY_COLORS[report.severity] ?? '#f59e0b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>🎯</span>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--warning)' }}>CRISIS DETECTED</h2>
      </div>

      {/* Main Crisis Type */}
      <div style={{
        background: `${crisisColor}10`,
        border: `1px solid ${crisisColor}40`,
        borderRadius: 12, padding: '16px 20px',
        boxShadow: `0 0 20px ${crisisColor}15`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 36 }}>{CRISIS_ICONS[report.crisis_type]}</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: crisisColor, fontFamily: 'var(--font-display)' }}>
              {CRISIS_LABELS[report.crisis_type]}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <span className="badge" style={{ background: `${severityColor}20`, color: severityColor, border: `1px solid ${severityColor}40`, fontSize: 10 }}>
                {report.severity.toUpperCase()} SEVERITY
              </span>
              <span className="badge badge-info">CONFIDENCE: {report.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONFIDENCE LEVEL</span>
            <span style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{report.confidence}%</span>
          </div>
          <div className="confidence-bar-track">
            <div className="confidence-bar-fill" style={{ width: `${report.confidence}%` }} />
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{report.description}</p>
      </div>

      {/* Affected Zones */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>AFFECTED ZONES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {report.affected_zones.map((zone, i) => (
            <span key={i} style={{ padding: '4px 10px', background: 'var(--critical-dim)', color: 'var(--critical)', border: '1px solid var(--border-critical)', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="pulse-dot critical" style={{ width: 6, height: 6 }} /> {zone}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>👥</span>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>POPULATION IMPACTED</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)' }}>{report.population_impacted}</div>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>AI REASONING</div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>"{report.reasoning}"</p>
      </div>
    </div>
  );
}
