import React, { useState } from 'react';
import type { OrchestratorState } from '../types';

interface Props { orchestrator: OrchestratorState; }

const AGENT_COLORS: Record<string, string> = {
  'Signal Fusion Agent': '#06b6d4',
  'Situation Analyst Agent': '#a855f7',
  'Action Planner Agent': '#f59e0b',
  'Execution Simulator Agent': '#10b981',
};

export function LogsPage({ orchestrator }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const hasLogs = orchestrator.traces.length > 0;

  return (
    <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--cyan)' }}>AGENT TRACE LOGS</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Full reasoning chain, tool calls, and decision trace for each agent</p>
      </div>

      {!hasLogs ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <h2 style={{ color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>No Agent Logs Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Run a crisis analysis from the Command Center to see detailed agent traces here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {orchestrator.traces.map(trace => {
              const color = AGENT_COLORS[trace.agent] ?? 'var(--cyan)';
              const duration = trace.endTime && trace.startTime ? ((trace.endTime - trace.startTime) / 1000).toFixed(1) : '...';
              return (
                <button key={trace.agent} onClick={() => setSelected(selected === trace.agent ? null : trace.agent)} style={{
                  background: selected === trace.agent ? `${color}15` : 'var(--bg-card)',
                  border: `1px solid ${selected === trace.agent ? color : 'var(--border)'}`,
                  borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 11, color, marginBottom: 6, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {trace.status === 'done' ? '✓' : trace.status === 'running' ? '⟳' : '✗'} {trace.agent.split(' ')[0].toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{trace.agent}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Duration: {duration}s • {trace.tool_calls.length} tool calls</div>
                </button>
              );
            })}
          </div>

          {/* Detailed log for selected */}
          {selected && (() => {
            const trace = orchestrator.traces.find(t => t.agent === selected);
            if (!trace) return null;
            const color = AGENT_COLORS[selected] ?? 'var(--cyan)';
            return (
              <div style={{ background: 'var(--bg-card)', border: `1px solid ${color}40`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {selected === 'Signal Fusion Agent' ? '📡' : selected === 'Situation Analyst Agent' ? '🧠' : selected === 'Action Planner Agent' ? '📋' : '⚙️'}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{trace.agent}</h2>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {trace.endTime && trace.startTime ? `Completed in ${((trace.endTime - trace.startTime) / 1000).toFixed(1)}s` : 'Running...'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>INPUT</div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{trace.input_summary}</p>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>OUTPUT</div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{trace.output_summary}</p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>REASONING CHAIN</div>
                  {trace.reasoning_steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10, paddingLeft: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1, paddingTop: 3 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{step}</div>
                        {i < trace.reasoning_steps.length - 1 && (
                          <div style={{ width: 2, height: 10, background: `${color}30`, margin: '4px 0 0 11px' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>TOOL CALLS EXECUTED</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {trace.tool_calls.map((tc, i) => (
                      <span key={i} style={{ fontSize: 12, padding: '4px 12px', background: `${color}10`, color, border: `1px solid ${color}30`, borderRadius: 6, fontFamily: 'var(--font-mono)' }}>
                        {tc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Full JSON dump */}
          {orchestrator.crisisReport && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>CRISIS SITUATION REPORT — RAW JSON</div>
              <pre style={{ margin: 0, fontSize: 11, color: 'var(--success)', fontFamily: 'var(--font-mono)', lineHeight: 1.6, overflowX: 'auto', background: 'var(--bg-elevated)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                {JSON.stringify(orchestrator.crisisReport, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
