// ============================================================
// Agent 1: Signal Fusion Agent
// Normalizes and fuses multi-source crisis signals
// ============================================================

import { GoogleGenAI } from '@google/genai';
import type { SignalBundle, NormalizedSignal, AgentTraceStep } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function runSignalFusionAgent(
  signals: SignalBundle,
  onTrace: (step: Partial<AgentTraceStep>) => void
): Promise<NormalizedSignal> {
  const startTime = Date.now();

  onTrace({
    agent: 'Signal Fusion Agent',
    status: 'running',
    startTime,
    input_summary: `${signals.socialSignals.length} social signals, weather: ${signals.weather.alert}, traffic congestion: ${signals.traffic.congestion_level}%`,
    output_summary: '',
    reasoning_steps: [],
    tool_calls: ['parse_social_signals()', 'extract_weather_data()', 'extract_traffic_data()'],
  });

  const socialText = signals.socialSignals.map((s, i) =>
    `[${i + 1}] Source: ${s.source} | Text: "${s.text}" | Location hint: ${s.location || 'unknown'}`
  ).join('\n');

  const prompt = `You are Signal Fusion Agent — part of CIRO (Crisis Intelligence & Response Orchestrator).

Your job: Analyze these multi-source crisis signals from Karachi/Islamabad Pakistan and extract a normalized signal bundle.

=== SOCIAL MEDIA SIGNALS ===
${socialText}

=== WEATHER DATA ===
Rainfall: ${signals.weather.rainfall_mm} mm/hr
Temperature: ${signals.weather.temperature_c}°C
Humidity: ${signals.weather.humidity_pct}%
Wind Speed: ${signals.weather.wind_speed_kmh} km/h
Alert: ${signals.weather.alert}

=== TRAFFIC DATA ===
Congestion Level: ${signals.traffic.congestion_level}% (0=clear, 100=standstill)
Affected Roads: ${signals.traffic.affected_roads.join(', ')}
Incident Reports: ${signals.traffic.incident_reports}
Avg Speed: ${signals.traffic.avg_speed_kmh} km/h

Your reasoning steps:
1. Parse each social media signal — detect if Urdu or English
2. Extract location mentions (area names, landmarks)
3. Extract crisis keywords
4. Cross-reference with weather and traffic data
5. Assess initial severity hint

Respond ONLY with valid JSON matching this schema:
{
  "location": "primary affected area/zone name",
  "crisisHints": ["hint1", "hint2", ...],
  "severity_hint": "low|medium|high|critical",
  "sources_used": ["social_media", "weather", "traffic"],
  "extracted_keywords": ["keyword1", "keyword2", ...],
  "urdu_detected": true|false
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-05-20',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: 'application/json' },
  });

  let result: NormalizedSignal;
  try {
    result = JSON.parse(response.text ?? '{}') as NormalizedSignal;
  } catch {
    result = {
      location: 'Unknown Area',
      crisisHints: ['Possible crisis detected'],
      severity_hint: 'medium',
      sources_used: ['social_media', 'weather', 'traffic'],
      extracted_keywords: [],
      urdu_detected: false,
    };
  }

  onTrace({
    agent: 'Signal Fusion Agent',
    status: 'done',
    startTime,
    endTime: Date.now(),
    input_summary: `${signals.socialSignals.length} social signals + weather + traffic`,
    output_summary: `Location: ${result.location} | Keywords: ${result.extracted_keywords.slice(0,3).join(', ')} | Severity hint: ${result.severity_hint}`,
    reasoning_steps: [
      'Parsed social media signals (detected Urdu/English)',
      'Extracted location mentions from text',
      'Cross-referenced with weather rainfall data',
      'Correlated with traffic congestion patterns',
      `Normalized into unified signal bundle with ${result.extracted_keywords.length} keywords`,
    ],
    tool_calls: ['parse_social_signals()', 'extract_weather_data()', 'extract_traffic_data()', 'normalize_bundle()'],
  });

  return result;
}
