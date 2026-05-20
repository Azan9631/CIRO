// ============================================================
// Agent 4: Execution Simulator Agent
// Simulates action execution and computes outcome metrics
// ============================================================

import { GoogleGenAI } from '@google/genai';
import type { ActionPlan, SimulationResult, SimulationStep, OutcomeMetrics, AgentTraceStep, CrisisSituationReport } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function generateTicketId(): string {
  return `TKT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

function generateAlertZone(area: string): string {
  return `Zone ${area} residents notified via SMS & push alerts`;
}

function generateRouteUpdate(area: string): string {
  const alternates: Record<string, string> = {
    'G-10': 'Rerouted via Margalla Road → IJP Road',
    'G-11': 'Rerouted via GT Road → Faizabad',
    'F-8': 'Rerouted via Jinnah Ave → Constitution Ave',
    'Saddar': 'Rerouted via M.A. Jinnah Road → Burns Road',
    'George Town': 'Rerouted via Nagan Chowrangi → Superhighway',
    'Clifton': 'Rerouted via Khayaban-e-Ittehad → Korangi Road',
    'DHA': 'Rerouted via Sharea Faisal → University Road',
  };
  for (const [zone, route] of Object.entries(alternates)) {
    if (area.includes(zone)) return route;
  }
  return `Alternate route activated: Main bypass via Ring Road`;
}

export async function runExecutionSimulatorAgent(
  plan: ActionPlan,
  crisis: CrisisSituationReport,
  onTrace: (step: Partial<AgentTraceStep>) => void,
  onStepUpdate: (steps: SimulationStep[]) => void
): Promise<SimulationResult> {
  const startTime = Date.now();

  onTrace({
    agent: 'Execution Simulator Agent',
    status: 'running',
    startTime,
    input_summary: `Simulating ${plan.actions.length} actions for ${plan.crisis_type}`,
    output_summary: '',
    reasoning_steps: [],
    tool_calls: ['initialize_simulation()', 'execute_actions()', 'compute_outcomes()'],
  });

  // Build simulation steps
  const steps: SimulationStep[] = plan.actions.map((action, index) => ({
    step: index + 1,
    timestamp: new Date(Date.now() + index * 60000).toISOString(),
    action_id: action.id,
    action_title: action.title,
    status: 'pending' as const,
    result: '',
    ticket_id: undefined,
    route_update: undefined,
    alert_sent_to: undefined,
  }));

  onStepUpdate([...steps]);

  // Simulate execution step by step with delays
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 600));

    steps[i] = { ...steps[i], status: 'executing' };
    onStepUpdate([...steps]);

    await new Promise(resolve => setTimeout(resolve, 900));

    // Build result based on action type
    const action = plan.actions[i];
    let result = '';
    let ticket_id: string | undefined;
    let route_update: string | undefined;
    let alert_sent_to: string | undefined;

    switch (action.type) {
      case 'traffic_reroute':
        route_update = generateRouteUpdate(action.target_area);
        ticket_id = generateTicketId();
        result = `✅ ${route_update}. Traffic camera feeds updated. ETA improvement: ${Math.floor(Math.random() * 15 + 5)} min`;
        break;
      case 'emergency_dispatch':
        ticket_id = generateTicketId();
        result = `✅ ${action.resources.join(', ')} dispatched to ${action.target_area}. ETA: ${action.estimated_time_min} minutes. Ticket: ${ticket_id}`;
        break;
      case 'public_alert':
        alert_sent_to = generateAlertZone(action.target_area);
        ticket_id = generateTicketId();
        result = `✅ ${alert_sent_to}. ${Math.floor(Math.random() * 50000 + 10000).toLocaleString()} devices reached`;
        break;
      case 'resource_allocation':
        ticket_id = generateTicketId();
        result = `✅ Resources allocated: ${action.resources.join(', ')}. Deployment confirmed via ${action.responsible_unit}`;
        break;
      case 'shelter_activation':
        ticket_id = generateTicketId();
        result = `✅ Emergency shelter activated at ${action.target_area}. Capacity: ${Math.floor(Math.random() * 500 + 200)} persons`;
        break;
      case 'road_closure':
        route_update = generateRouteUpdate(action.target_area);
        ticket_id = generateTicketId();
        result = `✅ Road closure enforced at ${action.target_area}. ${route_update}`;
        break;
      default:
        ticket_id = generateTicketId();
        result = `✅ Action executed successfully. Ticket: ${ticket_id}`;
    }

    steps[i] = { ...steps[i], status: 'completed', result, ticket_id, route_update, alert_sent_to };
    onStepUpdate([...steps]);
  }

  // Ask Gemini to compute outcome metrics
  const prompt = `You are the Execution Simulator for CIRO. Compute realistic outcome metrics after executing these emergency response actions.

Crisis: ${crisis.crisis_type} (${crisis.severity} severity) in ${crisis.affected_zones.join(', ')}
Actions executed: ${plan.actions.length}
Initial traffic congestion: ~${Math.floor(Math.random() * 20 + 75)}%

Based on the actions taken, compute realistic before/after metrics.

Respond ONLY with valid JSON:
{
  "congestion_before": 85,
  "congestion_after": 42,
  "response_time_min": 23,
  "units_deployed": 8,
  "alerts_sent": 45000,
  "routes_updated": 3,
  "tickets_created": ${plan.actions.length},
  "estimated_lives_impacted": 12000
}`;

  let metrics: OutcomeMetrics;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });
    metrics = JSON.parse(response.text ?? '{}') as OutcomeMetrics;
  } catch {
    metrics = {
      congestion_before: 88,
      congestion_after: 38,
      response_time_min: plan.estimated_total_response_min,
      units_deployed: plan.actions.filter(a => a.type === 'emergency_dispatch').length * 3 + 2,
      alerts_sent: Math.floor(Math.random() * 40000 + 20000),
      routes_updated: plan.actions.filter(a => a.type === 'traffic_reroute' || a.type === 'road_closure').length,
      tickets_created: plan.actions.length,
      estimated_lives_impacted: Math.floor(Math.random() * 20000 + 5000),
    };
  }

  const systemLog = [
    `[${new Date().toISOString()}] SIMULATION STARTED — Crisis: ${crisis.crisis_type}`,
    `[${new Date().toISOString()}] Plan ID: ${plan.plan_id} — ${plan.actions.length} actions queued`,
    ...steps.map(s => `[${s.timestamp}] ${s.action_id}: ${s.action_title} → COMPLETED (Ticket: ${s.ticket_id ?? 'N/A'})`),
    `[${new Date().toISOString()}] OUTCOME: Congestion reduced from ${metrics.congestion_before}% to ${metrics.congestion_after}%`,
    `[${new Date().toISOString()}] SIMULATION COMPLETE — ${metrics.units_deployed} units deployed, ${metrics.alerts_sent.toLocaleString()} alerted`,
  ];

  const result: SimulationResult = {
    simulation_id: `SIM-${Date.now().toString().slice(-6)}`,
    steps,
    outcome: metrics,
    system_log: systemLog,
  };

  onTrace({
    agent: 'Execution Simulator Agent',
    status: 'done',
    startTime,
    endTime: Date.now(),
    input_summary: `${plan.actions.length} actions for ${crisis.crisis_type}`,
    output_summary: `Congestion: ${metrics.congestion_before}% → ${metrics.congestion_after}% | ${metrics.units_deployed} units | ${metrics.alerts_sent.toLocaleString()} alerted`,
    reasoning_steps: [
      `Initialized simulation for ${crisis.crisis_type} scenario`,
      `Executed ${plan.actions.length} response actions sequentially`,
      `Generated ${metrics.tickets_created} emergency tickets`,
      `Sent alerts to ${metrics.alerts_sent.toLocaleString()} devices`,
      `Updated ${metrics.routes_updated} traffic routes`,
      `Computed outcome: congestion reduced by ${metrics.congestion_before - metrics.congestion_after}%`,
      `Estimated ${metrics.estimated_lives_impacted.toLocaleString()} people positively impacted`,
    ],
    tool_calls: ['initialize_simulation()', 'execute_traffic_rerouting()', 'dispatch_emergency_units()', 'send_public_alerts()', 'compute_outcome_metrics()', 'generate_system_log()'],
  });

  return result;
}
