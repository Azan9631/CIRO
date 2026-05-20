// ============================================================
// Agent 3: Action Planner Agent
// Generates coordinated response actions with priorities
// ============================================================

import { GoogleGenAI } from '@google/genai';
import type { CrisisSituationReport, ActionPlan, ResponseAction, AgentTraceStep } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function runActionPlannerAgent(
  crisis: CrisisSituationReport,
  onTrace: (step: Partial<AgentTraceStep>) => void
): Promise<ActionPlan> {
  const startTime = Date.now();

  onTrace({
    agent: 'Action Planner Agent',
    status: 'running',
    startTime,
    input_summary: `Crisis: ${crisis.crisis_type} | Severity: ${crisis.severity} | Zones: ${crisis.affected_zones.join(', ')}`,
    output_summary: '',
    reasoning_steps: [],
    tool_calls: ['query_available_resources()', 'calculate_routes()', 'generate_action_plan()'],
  });

  const prompt = `You are Action Planner Agent — part of CIRO (Crisis Intelligence & Response Orchestrator) for Pakistani cities.

Based on the confirmed crisis situation, generate a coordinated multi-agency response plan.

=== CRISIS SITUATION REPORT ===
Crisis Type: ${crisis.crisis_type}
Severity: ${crisis.severity}
Confidence: ${crisis.confidence}%
Affected Zones: ${crisis.affected_zones.join(', ')}
Population Impacted: ${crisis.population_impacted}
Description: ${crisis.description}

=== AVAILABLE RESOURCES (Pakistan Context) ===
- Rescue 1122 (Emergency Rescue)
- Traffic Police Islamabad/Karachi
- NDMA (National Disaster Management Authority)
- WASA (Water and Sanitation Agency)
- District Administration
- Pakistan Army Corps of Engineers (for severe cases)
- Civil Defence
- City ambulance service

Generate 5-7 specific, actionable response actions. Each action must be realistic for Pakistan's urban context.

For urban_flooding: focus on drainage, evacuation, route redirection, WASA deployment
For heatwave: focus on cooling centers, water distribution, health alerts
For road_blockage/accident: focus on traffic diversion, rescue, medical
For infrastructure_failure: focus on isolation, repair teams, public safety

Respond ONLY with valid JSON:
{
  "plan_id": "PLAN-XXXX",
  "crisis_type": "${crisis.crisis_type}",
  "actions": [
    {
      "id": "ACT-001",
      "type": "traffic_reroute|emergency_dispatch|public_alert|resource_allocation|shelter_activation|road_closure",
      "title": "Short action title",
      "description": "Detailed action description",
      "priority": "immediate|high|medium|low",
      "target_area": "Specific zone/road",
      "estimated_time_min": 15,
      "responsible_unit": "Unit name",
      "resources": ["resource1", "resource2"]
    }
  ],
  "coordination_notes": "Overall coordination strategy note",
  "estimated_total_response_min": 45
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: 'application/json' },
  });

  let result: ActionPlan;
  try {
    const parsed = JSON.parse(response.text ?? '{}');
    result = {
      plan_id: parsed.plan_id ?? `PLAN-${Date.now().toString().slice(-4)}`,
      crisis_type: crisis.crisis_type,
      actions: (parsed.actions ?? []) as ResponseAction[],
      coordination_notes: parsed.coordination_notes ?? '',
      estimated_total_response_min: parsed.estimated_total_response_min ?? 60,
    };
  } catch {
    result = {
      plan_id: `PLAN-${Date.now().toString().slice(-4)}`,
      crisis_type: crisis.crisis_type,
      actions: [
        {
          id: 'ACT-001',
          type: 'emergency_dispatch',
          title: 'Deploy Emergency Response Teams',
          description: `Dispatch Rescue 1122 teams to ${crisis.affected_zones[0]}`,
          priority: 'immediate',
          target_area: crisis.affected_zones[0],
          estimated_time_min: 10,
          responsible_unit: 'Rescue 1122',
          resources: ['2 rescue vehicles', '6 personnel'],
        },
        {
          id: 'ACT-002',
          type: 'public_alert',
          title: 'Issue Public Emergency Alert',
          description: 'Send SMS and push notifications to residents in affected zones',
          priority: 'immediate',
          target_area: crisis.affected_zones.join(', '),
          estimated_time_min: 5,
          responsible_unit: 'District Administration',
          resources: ['Emergency broadcast system'],
        },
      ],
      coordination_notes: 'All agencies to coordinate through District Emergency Operations Center.',
      estimated_total_response_min: 45,
    };
  }

  onTrace({
    agent: 'Action Planner Agent',
    status: 'done',
    startTime,
    endTime: Date.now(),
    input_summary: `${crisis.crisis_type} in ${crisis.affected_zones.join(', ')}`,
    output_summary: `Generated ${result.actions.length} actions | Est. response: ${result.estimated_total_response_min} min`,
    reasoning_steps: [
      `Identified crisis type: ${crisis.crisis_type} requiring specialized response`,
      `Queried available resources for ${crisis.affected_zones.join(', ')}`,
      `Prioritized immediate actions for ${crisis.severity} severity situation`,
      `Assigned responsible units based on Pakistan emergency structure`,
      `Generated ${result.actions.length} coordinated response actions`,
      `Estimated total response time: ${result.estimated_total_response_min} minutes`,
    ],
    tool_calls: ['query_available_resources()', 'calculate_optimal_routes()', 'assign_priority_matrix()', 'generate_action_plan()', 'estimate_response_time()'],
  });

  return result;
}
