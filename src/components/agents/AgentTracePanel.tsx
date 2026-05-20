import React from 'react';
import type { AgentTraceStep } from '../../types';

interface Props {
  traces: AgentTraceStep[];
  currentAgent: string;
}

const AGENT_ICONS: Record<string, string> = {
  'Signal Fusion Agent': '📡',
  'Situation Analyst Agent': '🧠',
  'Action Planner Agent': '📋',
  'Execution Simulator Agent': '⚙️',
};

const AGENT_COLORS: Record<string, string> = {
  'Signal Fusion Agent': 'var(--sky-blue)',
  'Situation Analyst Agent': 'var(--truck-purple)',
  'Action Planner Agent': 'var(--pak-gold)',
  'Execution Simulator Agent': 'var(--success)',
};

export function AgentTracePanel({ traces, currentAgent }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--truck-purple)' }}>AGENT PIPELINE</h2>
          <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 12, color: 'var(--text-muted)', direction: 'rtl' }}>ایجنٹ پائپ لائن</div>
        </div>
        {currentAgent && (
          <span className="badge badge-purple" style={{ marginLeft: 'auto', background: 'rgba(123, 31, 162, 0.2)', color: 'var(--truck-purple)', border: '1px solid var(--truck-purple)' }}>
            <div className="spinner" style={{ width: 10, height: 10, borderTopColor: 'var(--truck-purple)', borderColor: 'rgba(123, 31, 162, 0.3)' }} />
            {currentAgent.split(' ')[0]}
          </span>
        )}
      </div>

      <div className="desi-divider" />

      {/* Pipeline Steps */}
      {(['Signal Fusion Agent', 'Situation Analyst Agent', 'Action Planner Agent', 'Execution Simulator Agent'] as const).map((agentName, idx) => {
        const trace = traces.find(t => t.agent === agentName);
        const isActive = currentAgent === agentName;
        const isDone = trace?.status === 'done';
        const isError = trace?.status === 'error';
        const isPending = !trace;
        const color = AGENT_COLORS[agentName];

        return (
          <div key={agentName} style={{ position: 'relative' }}>
            {/* Connector line */}
            {idx < 3 && (
              <div style={{
                position: 'absolute', left: 17, top: '100%', width: 2, height: 12, zIndex: 1,
                background: isDone ? color : 'var(--border-gold)',
                transition: 'background 0.5s',
              }} />
            )}

            <div style={{
              background: 'var(--bg-elevated)',
              border: `1px solid ${isActive ? color : isDone ? `${color}40` : 'var(--border-gold)'}`,
              borderRadius: 10,
              padding: '12px 14px',
              transition: 'all 0.3s',
              boxShadow: isActive ? `0 0 12px ${color}30, inset 0 1px 0 rgba(255,255,255,0.05)` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Status icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: isPending ? 'var(--bg-primary)' : `${color}20`,
                  border: `2px solid ${isPending ? 'var(--border-gold)' : color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                  boxShadow: isActive ? `0 0 10px ${color}50` : 'none',
                }}>
                  {isActive ? <div className="spinner" style={{ width: 14, height: 14, borderTopColor: color, borderColor: `${color}30` }} /> :
                   isDone ? '✓' : isError ? '✗' : AGENT_ICONS[agentName]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isPending ? 'var(--text-muted)' : color, fontFamily: 'var(--font-mono)' }}>
                      AGENT {idx + 1}
                    </span>
                    <span style={{ fontSize: 13, color: isPending ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 600 }}>
                      {agentName}
                    </span>
                    {isDone && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--pak-gold)', fontFamily: 'var(--font-mono)' }}>
                        {trace?.endTime && trace?.startTime ? `${((trace.endTime - trace.startTime) / 1000).toFixed(1)}s` : ''}
                      </span>
                    )}
                  </div>
                  {trace && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isDone ? trace.output_summary : isActive ? trace.input_summary : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded trace when done */}
              {isDone && trace && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-gold)' }}>
                  {/* Reasoning steps */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--pak-gold)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>REASONING STEPS</div>
                    {trace.reasoning_steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: color, fontFamily: 'var(--font-mono)', minWidth: 18, marginTop: 1 }}>{i + 1}.</span>
                        <span style={{ fontSize: 11, color: 'var(--text-primary)', lineHeight: 1.4 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                  {/* Tool calls */}
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--pak-gold)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>TOOL CALLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {trace.tool_calls.map((tc, i) => (
                        <span key={i} style={{ fontSize: 10, padding: '2px 8px', background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                          {tc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
