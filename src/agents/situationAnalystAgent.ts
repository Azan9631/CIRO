// ============================================================
// Agent 2: Situation Analyst Agent
// Detects crisis type, severity, confidence, affected zones
// ============================================================

import { GoogleGenAI } from '@google/genai';
import type { NormalizedSignal, SignalBundle, CrisisSituationReport, AgentTraceStep, CrisisType, SeverityLevel, ConfidenceLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Pakistan city coordinates for known zones
const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  'G-10': { lat: 33.6844, lng: 73.0479 },
  'G-11': { lat: 33.6844, lng: 73.0231 },
  'F-8': { lat: 33.7215, lng: 73.0460 },
  'F-10': { lat: 33.7215, lng: 73.0231 },
  'Saddar': { lat: 33.7215, lng: 73.0937 },
  'Blue Area': { lat: 33.7094, lng: 73.0479 },
  'George Town': { lat: 24.8478, lng: 67.0157 },
  'Gulshan': { lat: 24.9215, lng: 67.0979 },
  'Clifton': { lat: 24.8219, lng: 67.0228 },
  'DHA': { lat: 24.7943, lng: 67.0642 },
  'Lahore': { lat: 31.5497, lng: 74.3436 },
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Islamabad': { lat: 33.7294, lng: 73.0931 },
  'default': { lat: 33.6844, lng: 73.0479 },
};

function getCoords(location: string): { lat: number; lng: number } {
  for (const [zone, coords] of Object.entries(ZONE_COORDS)) {
    if (location.toLowerCase().includes(zone.toLowerCase())) {
      return coords;
    }
  }
  return ZONE_COORDS['default'];
}

export async function runSituationAnalystAgent(
  normalized: NormalizedSignal,
  bundle: SignalBundle,
  onTrace: (step: Partial<AgentTraceStep>) => void
): Promise<CrisisSituationReport> {
  const startTime = Date.now();

  onTrace({
    agent: 'Situation Analyst Agent',
    status: 'running',
    startTime,
    input_summary: `Normalized signal: ${normalized.location} — ${normalized.crisisHints.join(', ')}`,
    output_summary: '',
    reasoning_steps: [],
    tool_calls: ['cross_reference_signals()', 'calculate_confidence()', 'estimate_impact()'],
  });

  const prompt = `You are Situation Analyst Agent — part of CIRO (Crisis Intelligence & Response Orchestrator) for Pakistani cities.

You receive a normalized signal bundle and must perform deep situation analysis.

=== NORMALIZED SIGNAL ===
Location: ${normalized.location}
Crisis Hints: ${normalized.crisisHints.join(', ')}
Severity Hint: ${normalized.severity_hint}
Keywords: ${normalized.extracted_keywords.join(', ')}
Urdu Detected: ${normalized.urdu_detected}

=== SUPPORTING DATA ===
Rainfall: ${bundle.weather.rainfall_mm} mm/hr
Temperature: ${bundle.weather.temperature_c}°C
Congestion: ${bundle.traffic.congestion_level}%
Incident Reports: ${bundle.traffic.incident_reports}

Your analysis steps:
1. Classify the crisis type from: urban_flooding, heatwave, road_blockage, accident, infrastructure_failure, unknown
2. Assess severity: low, medium, high, critical
3. Calculate confidence (0-100) based on signal consistency
4. Identify all affected zones in the city
5. Estimate population impact
6. Write a clear situation description and reasoning

For Pakistan context: G-sectors are Islamabad neighborhoods, George Town is in Karachi.

Respond ONLY with valid JSON:
{
  "crisis_type": "urban_flooding|heatwave|road_blockage|accident|infrastructure_failure|unknown",
  "severity": "low|medium|high|critical",
  "confidence": 85,
  "confidence_level": "low|medium|high",
  "affected_zones": ["Zone 1", "Zone 2"],
  "population_impacted": "Approximately 50,000 residents",
  "description": "Clear description of the crisis situation",
  "reasoning": "Step-by-step reasoning for this assessment"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: 'application/json' },
  });

  let parsed: Partial<CrisisSituationReport> = {};
  try {
    parsed = JSON.parse(response.text ?? '{}');
  } catch {
    parsed = {
      crisis_type: 'urban_flooding' as CrisisType,
      severity: 'high' as SeverityLevel,
      confidence: 70,
      confidence_level: 'high' as ConfidenceLevel,
      affected_zones: [normalized.location],
      population_impacted: 'Thousands of residents',
      description: 'Crisis situation detected from multiple signals.',
      reasoning: 'Based on social media reports, weather conditions, and traffic data.',
    };
  }

  const coords = getCoords(normalized.location);

  const result: CrisisSituationReport = {
    crisis_type: (parsed.crisis_type as CrisisType) ?? 'unknown',
    severity: (parsed.severity as SeverityLevel) ?? 'medium',
    confidence: parsed.confidence ?? 70,
    confidence_level: (parsed.confidence_level as ConfidenceLevel) ?? 'medium',
    affected_zones: parsed.affected_zones ?? [normalized.location],
    population_impacted: parsed.population_impacted ?? 'Unknown',
    description: parsed.description ?? '',
    reasoning: parsed.reasoning ?? '',
    lat: coords.lat,
    lng: coords.lng,
  };

  onTrace({
    agent: 'Situation Analyst Agent',
    status: 'done',
    startTime,
    endTime: Date.now(),
    input_summary: `Location: ${normalized.location}, ${normalized.crisisHints.length} hints`,
    output_summary: `Crisis: ${result.crisis_type} | Severity: ${result.severity} | Confidence: ${result.confidence}%`,
    reasoning_steps: [
      `Analyzed ${normalized.crisisHints.length} crisis hints from fused signals`,
      `Cross-referenced weather (${bundle.weather.rainfall_mm}mm/hr) with traffic (${bundle.traffic.congestion_level}% congestion)`,
      `Classified as: ${result.crisis_type} with ${result.severity} severity`,
      `Calculated confidence: ${result.confidence}% (${result.confidence_level})`,
      `Identified affected zones: ${result.affected_zones.join(', ')}`,
      `Estimated impact: ${result.population_impacted}`,
    ],
    tool_calls: ['cross_reference_signals()', 'classify_crisis_type()', 'calculate_confidence()', 'estimate_impact()', 'geo_locate()'],
  });

  return result;
}
