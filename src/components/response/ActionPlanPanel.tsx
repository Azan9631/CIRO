import React from 'react';
import type { ActionPlan } from '../../types';

const ACTION_ICONS: Record<string, string> = {
  traffic_reroute: '🗺️', emergency_dispatch: '🚑', public_alert: '📢',
  resource_allocation: '🏗️', shelter_activation: '🏕️', road_closure: '🚧',
};
const PRIORITY_COLORS: Record<string, string> = {
  immediate: 'var(--critical)', high: 'var(--warning)', medium: 'var(--pak-gold)', low: 'var(--success)',
};

interface Props { plan: ActionPlan; }

export function ActionPlanPanel({ plan }: Props) {
  const sorted = [...plan.actions].sort((a, b) => {
    const order = { immediate: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--pak-gold)' }}>ACTION PLAN</h2>
            <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 12, color: 'var(--text-muted)', direction: 'rtl' }}>عملی منصوبہ</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-info" style={{ borderColor: 'var(--sky-blue)' }}>{plan.actions.length} ACTIONS</span>
          <span className="badge badge-warning" style={{ borderColor: 'var(--warning)' }}>~{plan.estimated_total_response_min} MIN</span>
        </div>
      </div>

      <div className="desi-divider" />

      {/* Plan ID */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PLAN ID</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pak-gold)', fontFamily: 'var(--font-mono)' }}>{plan.plan_id}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
        {sorted.map((action, i) => {
          const pColor = PRIORITY_COLORS[action.priority];
          return (
            <div key={action.id} style={{
              background: 'var(--bg-elevated)', border: `1px solid var(--border-gold)`,
              borderLeft: `4px solid ${pColor}`, borderRadius: 8, padding: '12px 14px',
              transition: 'all 0.2s', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${pColor}30, inset 0 1px 0 rgba(255,255,255,0.05)`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.05)`; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 24, marginTop: -2 }}>{ACTION_ICONS[action.type] ?? '⚡'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{action.title}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', background: `${pColor}20`, color: pColor, border: `1px solid ${pColor}40`, borderRadius: 4, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {action.priority.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{action.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--pak-gold)' }}>📍 {action.target_area}</span>
                <span style={{ fontSize: 11, color: 'var(--sky-blue)' }}>⏱ {action.estimated_time_min} min</span>
                <span style={{ fontSize: 11, color: 'var(--truck-orange)' }}>🏢 {action.responsible_unit}</span>
              </div>
              {action.resources.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {action.resources.map((r, ri) => (
                    <span key={ri} style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 4, color: 'var(--pak-gold)' }}>{r}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Coordination Notes */}
      {plan.coordination_notes && (
        <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid var(--border-gold)', borderRadius: 8, padding: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 11, color: 'var(--pak-gold)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>COORDINATION NOTES</div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{plan.coordination_notes}</p>
        </div>
      )}
    </div>
  );
}
