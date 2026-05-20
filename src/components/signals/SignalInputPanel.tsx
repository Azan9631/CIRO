import React, { useState } from 'react';
import type { SignalBundle, SocialSignal } from '../../types';
import { DEMO_SCENARIOS } from '../../agents/orchestrator';
import { fetchLiveWeather } from '../../services/weatherService';

const PAK_CITIES = [
  { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
  { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
  { name: 'Multan', lat: 30.1575, lng: 71.5249 },
  { name: 'Gwadar', lat: 25.1216, lng: 62.3254 },
];

interface Props {
  signals: SignalBundle;
  onSignalsChange: (s: SignalBundle) => void;
  onAnalyze: () => void;
  isRunning: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  twitter: '#1d9bf0', facebook: '#1877f2', whatsapp: '#25d366', manual: 'var(--pak-gold)',
};

export function SignalInputPanel({ signals, onSignalsChange, onAnalyze, isRunning }: Props) {
  const [newText, setNewText] = useState('');
  const [newSource, setNewSource] = useState<SocialSignal['source']>('twitter');
  const [newLocation, setNewLocation] = useState('');

  const addSignal = () => {
    if (!newText.trim()) return;
    const signal: SocialSignal = {
      id: `s${Date.now()}`,
      source: newSource,
      text: newText,
      timestamp: new Date().toISOString(),
      location: newLocation || undefined,
    };
    onSignalsChange({ ...signals, socialSignals: [...signals.socialSignals, signal] });
    setNewText(''); setNewLocation('');
  };

  const removeSignal = (id: string) => {
    onSignalsChange({ ...signals, socialSignals: signals.socialSignals.filter(s => s.id !== id) });
  };

  const loadScenario = (id: string) => {
    const s = DEMO_SCENARIOS.find(x => x.id === id);
    if (s) onSignalsChange(s.signals);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📡</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--sky-blue)' }}>SIGNAL INGESTION</h2>
            <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 12, color: 'var(--text-muted)', direction: 'rtl' }}>سگنل جمع کرنا</div>
          </div>
        </div>
        <span className="badge badge-info" style={{ borderColor: 'var(--sky-blue)' }}>{signals.socialSignals.length} SIGNALS</span>
      </div>

      <div className="desi-divider" />

      {/* Demo Scenarios */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--pak-gold)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>QUICK LOAD — DEMO SCENARIOS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DEMO_SCENARIOS.map(scenario => (
            <button key={scenario.id} onClick={() => loadScenario(scenario.id)} style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)',
              color: 'var(--text-primary)', borderRadius: 6, padding: '6px 12px',
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.15s', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--pak-gold)'; (e.target as HTMLElement).style.boxShadow = '0 0 10px rgba(212,175,55,0.3)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-gold)'; (e.target as HTMLElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)'; }}
            >{scenario.label}</button>
          ))}
        </div>
      </div>

      {/* Social Signals */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--pak-gold)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>SOCIAL MEDIA SIGNALS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
          {signals.socialSignals.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, border: '1px dashed var(--border-gold)', borderRadius: 8, background: 'rgba(212,175,55,0.02)' }}>
              No signals loaded. Pick a demo scenario or add manually.
            </div>
          )}
          {signals.socialSignals.map(sig => (
            <div key={sig.id} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-green)', display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: `${SOURCE_COLORS[sig.source]}20`, color: SOURCE_COLORS[sig.source], border: `1px solid ${SOURCE_COLORS[sig.source]}40`, whiteSpace: 'nowrap', height: 'fit-content', fontFamily: 'var(--font-mono)' }}>
                {sig.source.toUpperCase()}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{sig.text}</p>
                {sig.location && <span style={{ fontSize: 11, color: 'var(--pak-gold)', marginTop: 4, display: 'block' }}>📍 {sig.location}</span>}
              </div>
              <button onClick={() => removeSignal(sig.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', fontSize: 16, opacity: 0.7 }} onMouseEnter={e => (e.target as HTMLElement).style.opacity = '1'} onMouseLeave={e => (e.target as HTMLElement).style.opacity = '0.7'}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Add manually */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, border: '1px solid var(--border-gold)' }}>
        <div style={{ fontSize: 11, color: 'var(--pak-gold)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>ADD SIGNAL MANUALLY</div>
        <textarea value={newText} onChange={e => setNewText(e.target.value)}
          placeholder='e.g. "G-10 mein pani bhar gaya hai..." or "Flash flood at George Town!"'
          rows={2} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-gold)', borderRadius: 6, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <select value={newSource} onChange={e => setNewSource(e.target.value as SocialSignal['source'])} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-gold)', color: 'var(--text-secondary)', borderRadius: 6, padding: '6px 8px', fontSize: 11, outline: 'none' }}>
            <option value="twitter">Twitter/X</option>
            <option value="facebook">Facebook</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="manual">Manual</option>
          </select>
          <input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Location" style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-gold)', borderRadius: 6, padding: '6px 8px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
          <button onClick={addSignal} style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid var(--pak-gold)', color: 'var(--pak-gold)', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>+ Add</button>
        </div>
      </div>

      {/* Weather & Traffic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <WeatherWidget weather={signals.weather} onChange={w => onSignalsChange({ ...signals, weather: w })} />
        <TrafficWidget traffic={signals.traffic} onChange={t => onSignalsChange({ ...signals, traffic: t })} />
      </div>

      {/* Analyze */}
      <button onClick={onAnalyze} disabled={isRunning || signals.socialSignals.length === 0} style={{
        background: isRunning ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--pak-green), var(--pak-green-light))',
        border: isRunning ? '1px solid var(--border)' : '2px solid var(--pak-gold)',
        borderRadius: 8, padding: '14px 24px', color: isRunning ? 'var(--text-muted)' : 'var(--pak-gold)',
        fontSize: 15, fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font-display)', letterSpacing: '0.1em',
        boxShadow: isRunning ? 'none' : '0 0 20px rgba(2,165,80,0.5), inset 0 0 10px rgba(212,175,55,0.3)', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all 0.2s'
      }}>
        {isRunning ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--pak-gold)' }} /> <span style={{ fontFamily: 'var(--font-mono)' }}>ANALYZING CRISIS...</span></> : <>⚡ LAUNCH CRISIS ANALYSIS</>}
      </button>
    </div>
  );
}

function WeatherWidget({ weather, onChange }: { weather: any; onChange: (w: any) => void }) {
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const handleSyncLive = async () => {
    const city = PAK_CITIES[selectedCityIdx];
    setSyncing(true);
    try {
      const data = await fetchLiveWeather(city.lat, city.lng, city.name);
      
      // Intelligently map rainfall estimates based on weather codes
      let rainfall = 0;
      let alertMsg = 'Clear Skies';
      
      const code = data.conditionCode;
      if (code >= 95) {
        rainfall = 55;
        alertMsg = 'Monsoon Flood Warning — Extreme';
      } else if (code >= 65 || code === 82) {
        rainfall = 40;
        alertMsg = 'Extreme Rainfall Warning — Red Alert';
      } else if (code >= 61 || code >= 80) {
        rainfall = 20;
        alertMsg = 'Heavy Rainfall Warning';
      } else if (code >= 51) {
        rainfall = 8;
        alertMsg = 'Moderate Rain Warning';
      } else if (code === 45 || code === 48) {
        alertMsg = 'Dense Fog Warning';
      }
      
      if (data.temp > 40) {
        alertMsg = 'Extreme Heat Emergency — Life Threatening';
      }
      
      onChange({
        rainfall_mm: rainfall,
        temperature_c: data.temp,
        humidity_pct: data.humidity,
        wind_speed_kmh: data.windSpeed,
        alert: alertMsg,
      });
    } catch (err) {
      console.error(err);
      alert('Error fetching live weather: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, border: '1px solid var(--border-gold)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🌧️</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--pak-gold)', fontWeight: 700 }}>WEATHER API</span>
        </div>
      </div>
      
      {/* Live Sync Dropdown Panel */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, background: 'var(--bg-primary)', padding: 6, borderRadius: 6, border: '1px solid rgba(212,175,55,0.15)' }}>
        <select 
          value={selectedCityIdx} 
          onChange={e => setSelectedCityIdx(Number(e.target.value))} 
          style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 4, padding: '4px 6px', fontSize: 10, outline: 'none', fontWeight: 600 }}
        >
          {PAK_CITIES.map((c, idx) => (
            <option key={c.name} value={idx}>{c.name}</option>
          ))}
        </select>
        <button 
          onClick={handleSyncLive} 
          disabled={syncing}
          style={{ 
            background: 'var(--pak-green)', color: 'var(--pak-gold)', border: '1px solid var(--border-gold)', 
            borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 800, 
            display: 'flex', alignItems: 'center', gap: 4 
          }}
        >
          {syncing ? <div className="spinner" style={{ width: 10, height: 10, borderTopColor: 'var(--pak-gold)' }} /> : '🔄 Sync'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: 'var(--text-muted)' }}>Rainfall:</span> 
          <b style={{ color: 'var(--sky-blue)' }}>{weather.rainfall_mm} mm/hr</b>
        </div>
        <input type="range" min={0} max={100} step={5} value={weather.rainfall_mm} onChange={e => onChange({ ...weather, rainfall_mm: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--sky-blue)', cursor: 'pointer' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: 'var(--text-muted)' }}>Temp:</span> 
          <b style={{ color: 'var(--truck-orange)' }}>{weather.temperature_c}°C</b>
        </div>
        <input type="range" min={10} max={55} step={1} value={weather.temperature_c} onChange={e => onChange({ ...weather, temperature_c: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--truck-orange)', cursor: 'pointer' }} />
        
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Condition Alert:</div>
        <select value={weather.alert} onChange={e => onChange({ ...weather, alert: e.target.value })} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-gold)', color: 'var(--text-primary)', borderRadius: 4, padding: '5px 8px', fontSize: 10, outline: 'none', fontWeight: 700 }}>
          <option>Clear Skies</option>
          <option>Moderate Rain Warning</option>
          <option>Heavy Rainfall Warning</option>
          <option>Extreme Rainfall Warning — Red Alert</option>
          <option>Monsoon Flood Warning — Extreme</option>
          <option>Extreme Heat Emergency — Life Threatening</option>
          <option>Dense Fog Warning</option>
        </select>
      </div>
    </div>
  );
}

function TrafficWidget({ traffic, onChange }: { traffic: any; onChange: (t: any) => void }) {
  const color = traffic.congestion_level > 75 ? 'var(--critical)' : traffic.congestion_level > 50 ? 'var(--warning)' : 'var(--success)';
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, border: '1px solid var(--border-gold)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🚦</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--pak-gold)', fontWeight: 700 }}>TRAFFIC API</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Congestion: <b style={{ color }}>{traffic.congestion_level}%</b></div>
        <input type="range" min={0} max={100} step={5} value={traffic.congestion_level} onChange={e => onChange({ ...traffic, congestion_level: Number(e.target.value) })} style={{ width: '100%', accentColor: color }} />
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Incidents: <b style={{ color: 'var(--warning)' }}>{traffic.incident_reports}</b></div>
        <input type="range" min={0} max={30} step={1} value={traffic.incident_reports} onChange={e => onChange({ ...traffic, incident_reports: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--warning)' }} />
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Speed: <b style={{ color: 'var(--success)' }}>{traffic.avg_speed_kmh} km/h</b></div>
        <input type="range" min={0} max={80} step={2} value={traffic.avg_speed_kmh} onChange={e => onChange({ ...traffic, avg_speed_kmh: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--success)' }} />
      </div>
    </div>
  );
}
