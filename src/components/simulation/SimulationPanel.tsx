import React, { useEffect, useRef } from 'react';
import type { SimulationResult } from '../../types';

interface Props { simulation: SimulationResult; }

export function SimulationPanel({ simulation }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [simulation.steps]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⚙️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--success)' }}>SIMULATION</h2>
            <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 12, color: 'var(--text-muted)', direction: 'rtl' }}>نقالی</div>
          </div>
        </div>
        <span className="badge badge-success" style={{ borderColor: 'var(--success)' }}>{simulation.simulation_id}</span>
      </div>

      <div className="desi-divider" />

      {/* Steps list */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
        {simulation.steps.map((step, i) => {
          const isCompleted = step.status === 'completed';
          const isExecuting = step.status === 'executing';
          const isPending = step.status === 'pending';
          
          return (
            <div key={i} className={`sim-step-${step.status}`} style={{
              background: 'var(--bg-elevated)', border: '1px solid',
              borderColor: isCompleted ? 'var(--success)' : isExecuting ? 'var(--pak-gold)' : 'var(--border-gold)',
              borderRadius: 8, padding: '12px', transition: 'all 0.3s',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Status icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isCompleted ? 'rgba(48,209,88,0.2)' : isExecuting ? 'rgba(212,175,55,0.2)' : 'var(--bg-primary)',
                  border: `2px solid ${isCompleted ? 'var(--success)' : isExecuting ? 'var(--pak-gold)' : 'var(--border-gold)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, flexShrink: 0
                }}>
                  {isExecuting ? <div className="spinner" style={{ width: 12, height: 12, borderTopColor: 'var(--pak-gold)', borderColor: 'rgba(212,175,55,0.3)' }} /> :
                   isCompleted ? '✓' : step.step}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{step.action_title}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(step.timestamp).toLocaleTimeString('ur-PK')}
                    </span>
                  </div>
                  
                  {isCompleted && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {step.result}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {step.ticket_id && <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(212,175,55,0.1)', color: 'var(--pak-gold)', border: '1px dashed rgba(212,175,55,0.4)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>🎫 {step.ticket_id}</span>}
                        {step.route_update && <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(41,182,246,0.1)', color: 'var(--sky-blue)', border: '1px solid rgba(41,182,246,0.3)', borderRadius: 4 }}>🗺️ {step.route_update}</span>}
                        {step.alert_sent_to && <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(233,30,140,0.1)', color: 'var(--truck-pink)', border: '1px solid rgba(233,30,140,0.3)', borderRadius: 4 }}>📱 {step.alert_sent_to}</span>}
                      </div>
                    </div>
                  )}
                  {isExecuting && (
                    <div style={{ fontSize: 12, color: 'var(--pak-gold)' }}>Executing action in simulated environment...</div>
                  )}
                  {isPending && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Waiting for execution...</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
