// ============================================================
// CIRO Mock Data — Fallback when no API key is available
// Provides realistic demo data for showcase purposes
// ============================================================

import type {
  NormalizedSignal, CrisisSituationReport, ActionPlan, SimulationResult,
  ResponseAction, SimulationStep, OutcomeMetrics
} from '../types';

export const MOCK_NORMALIZED: NormalizedSignal = {
  location: 'G-10, Islamabad',
  crisisHints: ['flash flood', 'vehicles stranded', 'road blocked', 'water logging', 'pani bhar gaya'],
  severity_hint: 'critical',
  sources_used: ['social_media', 'weather', 'traffic'],
  extracted_keywords: ['flood', 'pani', 'gaariyan', 'G-10', 'phans', 'road blocked', 'underpass', 'rescue'],
  urdu_detected: true,
};

export const MOCK_CRISIS: CrisisSituationReport = {
  crisis_type: 'urban_flooding',
  severity: 'critical',
  confidence: 94,
  confidence_level: 'high',
  affected_zones: ['G-10', 'G-10/3', 'IJP Road', 'Faizabad Interchange'],
  population_impacted: 'Approximately 80,000 residents and commuters',
  description: 'Severe urban flooding detected in G-10 sector, Islamabad. Multiple social media reports confirm flash flooding with vehicles stranded. Heavy rainfall (45mm/hr) combined with critical traffic congestion (92%) confirms an active crisis. Drainage systems are overwhelmed and the G-10/3 underpass is submerged.',
  reasoning: 'Three independent social media signals (2 in Urdu, 1 in English) all confirm flooding in G-10. Weather data shows 45mm/hr rainfall with Extreme Rainfall Warning. Traffic congestion at 92% with 12 incident reports and avg speed of 4km/h strongly corroborates complete road blockage due to flooding. Cross-signal confidence: HIGH (94%).',
  lat: 33.6844,
  lng: 73.0479,
};

export const MOCK_ACTIONS: ResponseAction[] = [
  { id: 'ACT-001', type: 'emergency_dispatch', title: 'Deploy Rescue 1122 Teams', description: 'Dispatch 4 Rescue 1122 units with boats and water pumps to G-10/3 underpass and main affected roads immediately.', priority: 'immediate', target_area: 'G-10/3 Underpass, Islamabad', estimated_time_min: 8, responsible_unit: 'Rescue 1122 Islamabad', resources: ['4 rescue vehicles', '2 inflatable boats', '12 rescue personnel', '3 water pumps'] },
  { id: 'ACT-002', type: 'traffic_reroute', title: 'Reroute IJP Road Traffic', description: 'Activate alternate routes via Margalla Road and Kashmir Highway. Deploy Traffic Police personnel at key intersections.', priority: 'immediate', target_area: 'IJP Road, G-10 Main Road', estimated_time_min: 5, responsible_unit: 'Islamabad Traffic Police', resources: ['8 traffic wardens', '4 barrier sets', 'Variable message signs'] },
  { id: 'ACT-003', type: 'public_alert', title: 'Issue Emergency SMS Alert', description: 'Send emergency SMS and push notifications to all registered users in G-10, G-11, and Faizabad areas. Issue Urdu and English warnings.', priority: 'immediate', target_area: 'G-10, G-11, Faizabad, Adjacent Sectors', estimated_time_min: 3, responsible_unit: 'NDMA National Operations Center', resources: ['Emergency broadcast system', 'PTA network access'] },
  { id: 'ACT-004', type: 'resource_allocation', title: 'Deploy WASA Drainage Teams', description: 'Activate WASA emergency response for storm drain clearing and high-capacity pump deployment at critical flood points.', priority: 'high', target_area: 'G-10 Drainage Network', estimated_time_min: 20, responsible_unit: 'WASA Islamabad', resources: ['6 drainage technicians', '4 high-capacity pumps', '2 suction trucks'] },
  { id: 'ACT-005', type: 'road_closure', title: 'Close G-10/3 Underpass', description: 'Formally close the G-10/3 underpass to all traffic and establish diversion points with police barricades.', priority: 'high', target_area: 'G-10/3 Underpass Entry Points', estimated_time_min: 10, responsible_unit: 'Islamabad Police', resources: ['Police barricades', '6 officers'] },
  { id: 'ACT-006', type: 'shelter_activation', title: 'Activate Emergency Shelter', description: 'Open G-10 Community Center as emergency shelter for displaced residents and stranded commuters.', priority: 'medium', target_area: 'G-10 Community Center, Islamabad', estimated_time_min: 25, responsible_unit: 'District Administration Islamabad', resources: ['Community center facility', 'Emergency food kits (300 packs)', 'Medical first aid team'] },
];

export const MOCK_PLAN: ActionPlan = {
  plan_id: 'PLAN-7291',
  crisis_type: 'urban_flooding',
  actions: MOCK_ACTIONS,
  coordination_notes: 'All agencies to coordinate through Islamabad District Emergency Operations Center (DEOC) at frequency 156.800 MHz. Rescue 1122 incident commander to lead ground operations. NDMA representative to maintain real-time situational awareness and escalate to federal level if flooding spreads to G-9 or F-10 sectors.',
  estimated_total_response_min: 35,
};

function makeSteps(): SimulationStep[] {
  return MOCK_ACTIONS.map((a, i) => ({
    step: i + 1,
    timestamp: new Date(Date.now() + i * 60000).toISOString(),
    action_id: a.id,
    action_title: a.title,
    status: 'pending' as const,
    result: '',
    ticket_id: undefined,
    route_update: undefined,
    alert_sent_to: undefined,
  }));
}

const COMPLETED_STEPS: SimulationStep[] = [
  { step: 1, timestamp: new Date().toISOString(), action_id: 'ACT-001', action_title: 'Deploy Rescue 1122 Teams', status: 'completed', result: '✅ 4 rescue units + 2 boats dispatched to G-10/3 underpass. ETA: 8 minutes. Ticket: TKT-R4K2M', ticket_id: 'TKT-R4K2M' },
  { step: 2, timestamp: new Date().toISOString(), action_id: 'ACT-002', action_title: 'Reroute IJP Road Traffic', status: 'completed', result: '✅ Rerouted via Margalla Road → Kashmir Highway. Traffic camera feeds updated. ETA improvement: 18 min', ticket_id: 'TKT-T7N9P', route_update: 'Rerouted via Margalla Road → Kashmir Highway' },
  { step: 3, timestamp: new Date().toISOString(), action_id: 'ACT-003', action_title: 'Issue Emergency SMS Alert', status: 'completed', result: '✅ G-10, G-11, Faizabad residents notified via SMS & push alerts. 67,420 devices reached', ticket_id: 'TKT-A2X5Q', alert_sent_to: 'G-10, G-11, Faizabad zones — 67,420 devices' },
  { step: 4, timestamp: new Date().toISOString(), action_id: 'ACT-004', action_title: 'Deploy WASA Drainage Teams', status: 'completed', result: '✅ WASA teams deployed. 4 high-capacity pumps operational. Drainage rate: 1,200 L/min', ticket_id: 'TKT-W8L3F' },
  { step: 5, timestamp: new Date().toISOString(), action_id: 'ACT-005', action_title: 'Close G-10/3 Underpass', status: 'completed', result: '✅ Underpass closed. Diversions active. Route updated: via Service Road G-10', ticket_id: 'TKT-C6D1K', route_update: 'Alternate route via Service Road G-10 activated' },
  { step: 6, timestamp: new Date().toISOString(), action_id: 'ACT-006', action_title: 'Activate Emergency Shelter', status: 'completed', result: '✅ G-10 Community Center activated. Capacity: 350 persons. Medical team on standby', ticket_id: 'TKT-S9B7V' },
];

const MOCK_OUTCOME: OutcomeMetrics = {
  congestion_before: 92,
  congestion_after: 34,
  response_time_min: 23,
  units_deployed: 14,
  alerts_sent: 67420,
  routes_updated: 3,
  tickets_created: 6,
  estimated_lives_impacted: 80000,
};

export function getMockSimulation(): SimulationResult {
  return {
    simulation_id: `SIM-${Date.now().toString().slice(-6)}`,
    steps: COMPLETED_STEPS,
    outcome: MOCK_OUTCOME,
    system_log: [
      `[${new Date().toISOString()}] SIMULATION STARTED — Crisis: urban_flooding in G-10, Islamabad`,
      `[${new Date().toISOString()}] Plan ID: PLAN-7291 — 6 actions queued for execution`,
      `[${new Date().toISOString()}] ACT-001: Rescue 1122 dispatch → COMPLETED (TKT-R4K2M)`,
      `[${new Date().toISOString()}] ACT-002: IJP Road traffic reroute → COMPLETED (TKT-T7N9P)`,
      `[${new Date().toISOString()}] ACT-003: Emergency SMS broadcast → COMPLETED (TKT-A2X5Q)`,
      `[${new Date().toISOString()}] ACT-004: WASA drainage deployment → COMPLETED (TKT-W8L3F)`,
      `[${new Date().toISOString()}] ACT-005: G-10/3 underpass closure → COMPLETED (TKT-C6D1K)`,
      `[${new Date().toISOString()}] ACT-006: Emergency shelter activation → COMPLETED (TKT-S9B7V)`,
      `[${new Date().toISOString()}] OUTCOME: Congestion reduced 92% → 34% | 14 units deployed | 67,420 alerted`,
      `[${new Date().toISOString()}] SIMULATION COMPLETE — All 6 actions executed successfully`,
    ],
  };
}

export { makeSteps };
