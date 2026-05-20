// ============================================================
// CIRO Orchestrator
// Coordinates all 4 agents in sequence with mock fallback
// ============================================================

import type { SignalBundle, OrchestratorState, AgentTraceStep, SimulationStep } from '../types';
import { runSignalFusionAgent } from './signalFusionAgent';
import { runSituationAnalystAgent } from './situationAnalystAgent';
import { runActionPlannerAgent } from './actionPlannerAgent';
import { runExecutionSimulatorAgent } from './executionSimulatorAgent';
import {
  MOCK_NORMALIZED, MOCK_CRISIS, MOCK_PLAN, getMockSimulation
} from './mockData';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const USE_MOCK = !API_KEY || API_KEY.trim() === '';

// ─── Mock orchestrator run ────────────────────────────────────

async function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function runMockOrchestrator(
  signals: SignalBundle,
  onStateUpdate: (state: Partial<OrchestratorState>) => void
): Promise<OrchestratorState> {
  const traces: AgentTraceStep[] = [];

  const agents = [
    {
      name: 'Signal Fusion Agent',
      duration: 1400,
      inputSummary: `${signals.socialSignals.length} social signals, weather: ${signals.weather.alert}, traffic: ${signals.traffic.congestion_level}%`,
      outputSummary: `Location: ${MOCK_NORMALIZED.location} | Keywords: ${MOCK_NORMALIZED.extracted_keywords.slice(0,3).join(', ')} | Severity: ${MOCK_NORMALIZED.severity_hint}`,
      reasoningSteps: [
        'Parsed 3 social media signals — detected Urdu + English text',
        'Extracted location mentions: G-10, G-10/3, IJP Road, underpass',
        'Identified crisis keywords: pani bhar gaya, flood, vehicles stranded',
        'Cross-referenced with weather data (45mm/hr rainfall)',
        'Correlated with traffic congestion (92%, 12 incidents)',
        'Normalized into unified signal bundle with 8 keywords extracted',
      ],
      toolCalls: ['parse_social_signals()', 'detect_language(urdu=True)', 'extract_locations()', 'cross_reference_weather()', 'normalize_bundle()'],
    },
    {
      name: 'Situation Analyst Agent',
      duration: 1800,
      inputSummary: `Location: G-10, Islamabad — 5 crisis hints`,
      outputSummary: `Crisis: urban_flooding | Severity: critical | Confidence: 94%`,
      reasoningSteps: [
        'Analyzed 5 crisis hints from fused signals',
        'Cross-referenced weather (45mm/hr) with traffic (92% congestion, 4km/h speed)',
        'Matched pattern: high rainfall + critical congestion + "pani bhar" = urban flooding',
        'Classified as: urban_flooding with CRITICAL severity',
        'Calculated confidence: 94% (HIGH) — 3 independent signal sources agree',
        'Identified 4 affected zones in G-10 sector',
        'Estimated impact: 80,000 residents and commuters',
      ],
      toolCalls: ['cross_reference_signals()', 'classify_crisis_type()', 'pattern_match_flood()', 'calculate_confidence()', 'estimate_impact()', 'geo_locate(G-10)'],
    },
    {
      name: 'Action Planner Agent',
      duration: 1600,
      inputSummary: `urban_flooding in G-10, G-10/3, IJP Road, Faizabad — critical severity`,
      outputSummary: `Generated 6 actions | Est. response: 35 min | Plan ID: PLAN-7291`,
      reasoningSteps: [
        'Identified crisis type: urban_flooding requiring specialized flood response',
        'Queried available resources: Rescue 1122, Traffic Police, NDMA, WASA, District Admin',
        'Prioritized IMMEDIATE actions: rescue dispatch + traffic reroute + public alert',
        'Assigned responsible units per Pakistan emergency response structure',
        'Generated 6 coordinated response actions across 4 agencies',
        'Estimated total response time: 35 minutes',
      ],
      toolCalls: ['query_available_resources(islamabad)', 'calculate_optimal_routes()', 'assign_priority_matrix()', 'generate_action_plan()', 'estimate_response_time()', 'validate_resources()'],
    },
    {
      name: 'Execution Simulator Agent',
      duration: 2200,
      inputSummary: `6 actions for urban_flooding — PLAN-7291`,
      outputSummary: `Congestion: 92% → 34% | 14 units deployed | 67,420 alerted`,
      reasoningSteps: [
        'Initialized simulation environment for urban_flooding scenario',
        'Executed 6 response actions sequentially with real-world timing',
        'Rescue 1122 (4 units + 2 boats) dispatched — ETA 8 min',
        'Traffic rerouted via Margalla Road — congestion drop initiated',
        'Emergency SMS broadcast reached 67,420 devices',
        'WASA pumps operational — drainage rate 1,200 L/min',
        'Computed final outcome: congestion reduced by 58 percentage points',
        'Estimated 80,000 people positively impacted by coordinated response',
      ],
      toolCalls: ['initialize_simulation()', 'execute_emergency_dispatch()', 'execute_traffic_rerouting()', 'send_public_alerts()', 'deploy_wasa_pumps()', 'compute_outcome_metrics()', 'generate_audit_log()'],
    },
  ] as const;

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    onStateUpdate({ currentAgent: agent.name });
    traces.push({
      agent: agent.name,
      status: 'running',
      startTime: Date.now(),
      input_summary: agent.inputSummary,
      output_summary: '',
      reasoning_steps: [],
      tool_calls: [],
    });
    onStateUpdate({ traces: [...traces] });
    await delay(agent.duration);

    traces[i] = {
      ...traces[i],
      status: 'done',
      endTime: Date.now(),
      output_summary: agent.outputSummary,
      reasoning_steps: [...agent.reasoningSteps],
      tool_calls: [...agent.toolCalls],
    };
    onStateUpdate({ traces: [...traces] });

    // Update state after each agent
    if (i === 0) onStateUpdate({ normalizedSignal: MOCK_NORMALIZED });
    if (i === 1) onStateUpdate({ crisisReport: MOCK_CRISIS });
    if (i === 2) onStateUpdate({ actionPlan: MOCK_PLAN });
    if (i === 3) {
      // Simulate step-by-step execution
      const sim = getMockSimulation();
      const steps: SimulationStep[] = sim.steps.map(s => ({ ...s, status: 'pending', result: '' }));
      onStateUpdate({ simulationResult: { ...sim, steps } });
      for (let j = 0; j < steps.length; j++) {
        await delay(300);
        steps[j] = { ...steps[j], status: 'executing' };
        onStateUpdate({ simulationResult: { ...sim, steps: [...steps] } });
        await delay(500);
        steps[j] = { ...sim.steps[j], status: 'completed' };
        onStateUpdate({ simulationResult: { ...sim, steps: [...steps] } });
      }
      onStateUpdate({ simulationResult: sim });
    }
  }

  const finalState: OrchestratorState = {
    status: 'complete',
    currentAgent: '',
    traces,
    normalizedSignal: MOCK_NORMALIZED,
    crisisReport: MOCK_CRISIS,
    actionPlan: MOCK_PLAN,
    simulationResult: getMockSimulation(),
  };
  onStateUpdate(finalState);
  return finalState;
}

// ─── Real orchestrator run ─────────────────────────────────────

export async function runOrchestrator(
  signals: SignalBundle,
  onStateUpdate: (state: Partial<OrchestratorState>) => void
): Promise<OrchestratorState> {
  if (USE_MOCK) {
    console.info('[CIRO] No API key found — running in demo mode with mock data');
    return runMockOrchestrator(signals, onStateUpdate);
  }

  const traces: AgentTraceStep[] = [];

  const addTrace = (step: Partial<AgentTraceStep>) => {
    const existing = traces.findIndex(t => t.agent === step.agent);
    if (existing >= 0) {
      traces[existing] = { ...traces[existing], ...step } as AgentTraceStep;
    } else {
      traces.push({
        agent: step.agent ?? 'Unknown',
        status: step.status ?? 'running',
        startTime: step.startTime ?? Date.now(),
        input_summary: step.input_summary ?? '',
        output_summary: step.output_summary ?? '',
        reasoning_steps: step.reasoning_steps ?? [],
        tool_calls: step.tool_calls ?? [],
        endTime: step.endTime,
      });
    }
    onStateUpdate({ traces: [...traces], currentAgent: step.agent ?? '' });
  };

  try {
    onStateUpdate({ status: 'running', currentAgent: 'Signal Fusion Agent', traces: [] });

    // Agent 1: Signal Fusion
    const normalized = await runSignalFusionAgent(signals, addTrace);
    onStateUpdate({ normalizedSignal: normalized, traces: [...traces] });

    // Agent 2: Situation Analyst
    const crisisReport = await runSituationAnalystAgent(normalized, signals, addTrace);
    onStateUpdate({ crisisReport, traces: [...traces] });

    // Agent 3: Action Planner
    const actionPlan = await runActionPlannerAgent(crisisReport, addTrace);
    onStateUpdate({ actionPlan, traces: [...traces] });

    // Agent 4: Execution Simulator
    const simulationResult = await runExecutionSimulatorAgent(
      actionPlan,
      crisisReport,
      addTrace,
      (steps) => {
        onStateUpdate({
          simulationResult: {
            simulation_id: '',
            steps,
            outcome: { congestion_before: 0, congestion_after: 0, response_time_min: 0, units_deployed: 0, alerts_sent: 0, routes_updated: 0, tickets_created: 0, estimated_lives_impacted: 0 },
            system_log: [],
          },
        });
      }
    );
    onStateUpdate({ simulationResult, traces: [...traces] });

    const finalState: OrchestratorState = {
      status: 'complete',
      currentAgent: '',
      traces,
      normalizedSignal: normalized,
      crisisReport,
      actionPlan,
      simulationResult,
    };
    onStateUpdate(finalState);
    return finalState;

  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('[CIRO] Orchestrator error, falling back to mock:', err);
    // Fallback to mock on error
    return runMockOrchestrator(signals, onStateUpdate);
  }
}

// ─── Preset Demo Scenarios ────────────────────────────────────

export const DEMO_SCENARIOS = [
  {
    id: 'flood_g10',
    label: '🌊 Flash Flood — G-10, Islamabad',
    signals: {
      socialSignals: [
        { id: 's1', source: 'whatsapp' as const, text: 'G-10 mein pani bhar gaya hai, gaariyan phans gayi hain!', timestamp: new Date().toISOString(), location: 'G-10' },
        { id: 's2', source: 'twitter' as const, text: 'Flash flood at G-10 Islamabad! Roads completely blocked, cars stranded. Been going on for 30 mins!', timestamp: new Date().toISOString(), location: 'G-10, Islamabad' },
        { id: 's3', source: 'facebook' as const, text: 'G-10/3 main road ke neechay underpass mein paani aa gaya. Rescue ka koi ata nahi!', timestamp: new Date().toISOString(), location: 'G-10/3' },
      ],
      weather: { rainfall_mm: 45, temperature_c: 22, humidity_pct: 95, wind_speed_kmh: 35, alert: 'Extreme Rainfall Warning — Red Alert' },
      traffic: { congestion_level: 92, affected_roads: ['Islamabad Highway', 'G-10 Main Road', 'IJP Road', 'Faizabad Interchange'], incident_reports: 12, avg_speed_kmh: 4 },
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'flood_george_town',
    label: '🌊 Urban Flooding — George Town, Karachi',
    signals: {
      socialSignals: [
        { id: 's1', source: 'twitter' as const, text: 'Flash flood happening at George Town for past 30 mins! Streets completely submerged.', timestamp: new Date().toISOString(), location: 'George Town, Karachi' },
        { id: 's2', source: 'whatsapp' as const, text: 'George Town mein bohot bura hal hai. Ghar mein pani ghus gaya!', timestamp: new Date().toISOString(), location: 'George Town' },
      ],
      weather: { rainfall_mm: 62, temperature_c: 28, humidity_pct: 98, wind_speed_kmh: 25, alert: 'Monsoon Flood Warning — Extreme' },
      traffic: { congestion_level: 88, affected_roads: ['M.A. Jinnah Road', 'Shahrah-e-Liaquat', 'George Town Main Road'], incident_reports: 8, avg_speed_kmh: 6 },
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'heatwave',
    label: '🔥 Extreme Heatwave — Karachi',
    signals: {
      socialSignals: [
        { id: 's1', source: 'twitter' as const, text: 'Karachi mein bohot garmi hai, log hospital mein ja rahe hain. 52 degrees! #KarachiHeatwave', timestamp: new Date().toISOString(), location: 'Karachi' },
        { id: 's2', source: 'facebook' as const, text: 'Power outage in DHA and Clifton for 8 hours now. No electricity, extreme heat. People collapsing.', timestamp: new Date().toISOString(), location: 'DHA, Clifton' },
      ],
      weather: { rainfall_mm: 0, temperature_c: 52, humidity_pct: 15, wind_speed_kmh: 10, alert: 'Extreme Heat Emergency — Life Threatening' },
      traffic: { congestion_level: 45, affected_roads: ['Sharea Faisal', 'Korangi Road'], incident_reports: 3, avg_speed_kmh: 28 },
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'accident',
    label: '🚨 Major Accident — Lahore Motorway',
    signals: {
      socialSignals: [
        { id: 's1', source: 'twitter' as const, text: 'BREAKING: Multiple car pileup on M-2 near Lahore. At least 10 vehicles involved. Road completely blocked!', timestamp: new Date().toISOString(), location: 'M-2 Motorway, Lahore' },
        { id: 's2', source: 'whatsapp' as const, text: 'M-2 pe bada accident hua hai, ambulancen ja rahi hain. Motorway band ho gai!', timestamp: new Date().toISOString(), location: 'Lahore Motorway' },
      ],
      weather: { rainfall_mm: 5, temperature_c: 18, humidity_pct: 60, wind_speed_kmh: 15, alert: 'Dense Fog Warning' },
      traffic: { congestion_level: 97, affected_roads: ['M-2 Motorway', 'GT Road', 'Lahore Ring Road'], incident_reports: 20, avg_speed_kmh: 0 },
      timestamp: new Date().toISOString(),
    },
  },
];
