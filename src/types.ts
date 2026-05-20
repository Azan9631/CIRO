// ============================================================
// CIRO — Crisis Intelligence & Response Orchestrator
// Core Type Definitions
// ============================================================

export type CrisisType =
  | 'urban_flooding'
  | 'heatwave'
  | 'road_blockage'
  | 'accident'
  | 'infrastructure_failure'
  | 'unknown';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

// ─── Signal Types ────────────────────────────────────────────

export interface SocialSignal {
  id: string;
  source: 'twitter' | 'facebook' | 'whatsapp' | 'manual';
  text: string;
  timestamp: string;
  location?: string;
}

export interface WeatherSignal {
  rainfall_mm: number;   // mm/hour
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  alert: string;         // e.g. "Heavy Rainfall Warning"
}

export interface TrafficSignal {
  congestion_level: number; // 0–100
  affected_roads: string[];
  incident_reports: number;
  avg_speed_kmh: number;
}

export interface SignalBundle {
  socialSignals: SocialSignal[];
  weather: WeatherSignal;
  traffic: TrafficSignal;
  timestamp: string;
}

// ─── Agent Outputs ───────────────────────────────────────────

export interface NormalizedSignal {
  location: string;
  crisisHints: string[];
  severity_hint: SeverityLevel;
  sources_used: string[];
  extracted_keywords: string[];
  urdu_detected: boolean;
}

export interface CrisisSituationReport {
  crisis_type: CrisisType;
  severity: SeverityLevel;
  confidence: number; // 0–100
  confidence_level: ConfidenceLevel;
  affected_zones: string[];
  population_impacted: string;
  description: string;
  reasoning: string;
  lat: number;
  lng: number;
}

export interface ResponseAction {
  id: string;
  type: 'traffic_reroute' | 'emergency_dispatch' | 'public_alert' | 'resource_allocation' | 'shelter_activation' | 'road_closure';
  title: string;
  description: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  target_area: string;
  estimated_time_min: number;
  responsible_unit: string;
  resources: string[];
}

export interface ActionPlan {
  plan_id: string;
  crisis_type: CrisisType;
  actions: ResponseAction[];
  coordination_notes: string;
  estimated_total_response_min: number;
}

export interface SimulationStep {
  step: number;
  timestamp: string;
  action_id: string;
  action_title: string;
  status: 'pending' | 'executing' | 'completed';
  result: string;
  ticket_id?: string;
  route_update?: string;
  alert_sent_to?: string;
}

export interface OutcomeMetrics {
  congestion_before: number;
  congestion_after: number;
  response_time_min: number;
  units_deployed: number;
  alerts_sent: number;
  routes_updated: number;
  tickets_created: number;
  estimated_lives_impacted: number;
}

export interface SimulationResult {
  simulation_id: string;
  steps: SimulationStep[];
  outcome: OutcomeMetrics;
  system_log: string[];
}

// ─── Agent Trace ─────────────────────────────────────────────

export interface AgentTraceStep {
  agent: string;
  status: AgentStatus;
  startTime: number;
  endTime?: number;
  input_summary: string;
  output_summary: string;
  reasoning_steps: string[];
  tool_calls: string[];
}

export interface OrchestratorState {
  status: 'idle' | 'running' | 'complete' | 'error';
  currentAgent: string;
  traces: AgentTraceStep[];
  normalizedSignal?: NormalizedSignal;
  crisisReport?: CrisisSituationReport;
  actionPlan?: ActionPlan;
  simulationResult?: SimulationResult;
  error?: string;
}

// ─── UI State ────────────────────────────────────────────────

export interface AppState {
  signals: SignalBundle;
  orchestrator: OrchestratorState;
}

export const CRISIS_LABELS: Record<CrisisType, string> = {
  urban_flooding: 'Urban Flooding',
  heatwave: 'Extreme Heatwave',
  road_blockage: 'Road Blockage',
  accident: 'Major Accident',
  infrastructure_failure: 'Infrastructure Failure',
  unknown: 'Unknown Crisis',
};

export const CRISIS_COLORS: Record<CrisisType, string> = {
  urban_flooding: '#3b82f6',
  heatwave: '#f97316',
  road_blockage: '#a855f7',
  accident: '#ef4444',
  infrastructure_failure: '#eab308',
  unknown: '#6b7280',
};
