import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TICKER_SIGNALS = [
  '🌊 SELAB ALERT — G-10, Islamabad | گاڑیاں پھنسی ہوئی ہیں، سڑکیں بند',
  '🔥 HEATWAVE — Karachi 52°C | گرمی کی شدید لہر، ہسپتال الرٹ پر',
  '🚨 ACCIDENT — M-2 Motorway, Lahore | بڑا حادثہ، ریسکیو 1122 روانہ',
  '🌧️ BAARISH ALERT — George Town Karachi | Drainage systems overwhelmed',
  '⚡ BIJLI GAYE — DHA Karachi | Infrastructure failure, 8+ ghante no power',
  '🚧 SARAK BAND — IJP Road Islamabad | Major jam, alternate routes active',
  '📢 NDMA ALERT — Monsoon season, Punjab mein flooding ka khatra',
];

const STATS = [
  { value: '4', label: 'AI Agents', urdu: 'AI ایجنٹس', icon: '🤖' },
  { value: '<30s', label: 'Response Time', urdu: 'جواب کا وقت', icon: '⚡' },
  { value: '94%', label: 'Accuracy', urdu: 'درستگی', icon: '🎯' },
  { value: '5+', label: 'Crisis Types', urdu: 'بحران کی اقسام', icon: '🗺️' },
];

const FEATURES = [
  { icon: '📡', title: 'Signal Ingestion', urdu: 'سگنل جمع کرنا', desc: 'Social media (Urdu + English), weather APIs, and traffic data — all processed simultaneously.', color: 'var(--sky-blue)' },
  { icon: '🧠', title: 'AI Analysis', urdu: 'AI تجزیہ', desc: 'Gemini AI cross-references all signals — detects crisis type, severity & affected zones with confidence scoring.', color: 'var(--truck-purple)' },
  { icon: '📋', title: 'Action Planning', urdu: 'منصوبہ بندی', desc: 'Auto-generates coordinated plans for Rescue 1122, Traffic Police, NDMA, WASA & District Admin.', color: 'var(--pak-gold)' },
  { icon: '⚙️', title: 'Simulation', urdu: 'نقالی', desc: 'Simulates full response: rerouting, dispatch, public alerts — generates emergency tickets.', color: 'var(--success)' },
];

const CRISIS_TYPES = [
  { icon: '🌊', label: 'Urban Flooding', urdu: 'شہری سیلاب' },
  { icon: '🔥', label: 'Heatwave', urdu: 'گرمی کی لہر' },
  { icon: '🚨', label: 'Accidents', urdu: 'حادثات' },
  { icon: '🚧', label: 'Road Blockage', urdu: 'سڑک بند' },
  { icon: '⚡', label: 'Infrastructure', urdu: 'انفراسٹرکچر' },
];

export function LandingPage() {
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => { setTickerIdx(i => (i + 1) % TICKER_SIGNALS.length); setTickerVisible(true); }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh' }} className="truck-art-bg">

      {/* ── Live Alert Ticker ── */}
      <div style={{ background: 'rgba(255,59,48,0.1)', borderBottom: '1px solid rgba(255,59,48,0.3)', padding: '7px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', maxWidth: 1500, margin: '0 auto' }}>
          <span className="badge badge-critical" style={{ flexShrink: 0, animation: 'none' }}>⚠ LIVE</span>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ opacity: tickerVisible ? 1 : 0, transition: 'opacity 0.4s', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {TICKER_SIGNALS[tickerIdx]}
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
            {new Date().toLocaleTimeString('ur-PK')}
          </span>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <div className="mandala-bg" style={{ padding: '70px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative corner ornaments */}
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: 40, opacity: 0.08 }}>✦</div>
        <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 40, opacity: 0.08 }}>✦</div>
        <div style={{ position: 'absolute', bottom: 20, left: 20, fontSize: 40, opacity: 0.08 }}>✦</div>
        <div style={{ position: 'absolute', bottom: 20, right: 20, fontSize: 40, opacity: 0.08 }}>✦</div>

        {/* Glow center */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(1,65,28,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>

          {/* Pakistan badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px', background: 'rgba(1,65,28,0.3)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: 999, fontSize: 12, marginBottom: 28 }}>
            <span style={{ fontSize: 18 }}>🇵🇰</span>
            <span style={{ color: 'var(--pak-gold)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.12em' }}>POWERED BY GOOGLE GEMINI AI</span>
            <span className="pulse-dot gold" style={{ width: 6, height: 6 }} />
          </div>

          {/* Main Title */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 8 }}>
            <span className="gradient-text-gold">CIRO</span>
          </h1>

          {/* Urdu subtitle */}
          <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 'clamp(16px, 3vw, 24px)', color: 'var(--pak-green-light)', marginBottom: 12, direction: 'rtl', letterSpacing: 0 }}>
            بحران انٹیلیجنس اور ریسپانس آرکیسٹریٹر
          </div>

          <div className="desi-divider" style={{ maxWidth: 300, margin: '0 auto 20px' }} />

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, fontStyle: 'italic' }}>
            Crisis Intelligence & Response Orchestrator
          </h2>

          <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 16px', lineHeight: 1.8 }}>
            Pakistan ka <strong style={{ color: 'var(--pak-gold)' }}>agentic AI system</strong> — Islamabad, Karachi, Lahore ke urban crisis detect karta hai, coordinated emergency response plan karta hai, aur sirf <strong style={{ color: 'var(--pak-green-light)' }}>30 seconds</strong> mein simulation chalata hai.
          </p>

          {/* Crisis type pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            {CRISIS_TYPES.map(c => (
              <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(1,65,28,0.25)', border: '1px solid var(--border-gold)', borderRadius: 999, fontSize: 12 }}>
                {c.icon} <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
                <span style={{ fontFamily: 'var(--font-urdu)', fontSize: 11, color: 'var(--pak-green-light)', direction: 'rtl' }}>{c.urdu}</span>
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, #01411C, #016630)',
              color: 'var(--pak-gold)', textDecoration: 'none',
              padding: '14px 36px', borderRadius: 10,
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
              border: '2px solid rgba(212,175,55,0.6)',
              boxShadow: '0 0 30px rgba(1,65,28,0.5), 0 0 60px rgba(212,175,55,0.15)',
              transition: 'all 0.2s',
            }}>
              ⚡ COMMAND CENTER کھولیں
            </Link>
            <Link to="/map" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'transparent', color: 'var(--pak-gold)', textDecoration: 'none',
              padding: '14px 32px', borderRadius: 10,
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
              border: '2px solid rgba(212,175,55,0.4)',
              transition: 'all 0.2s',
            }}>
              🗺️ بحران نقشہ
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-gold)', borderBottom: '1px solid var(--border-gold)', padding: '28px 24px' }}>
        <div className="desi-divider" style={{ maxWidth: 900, margin: '0 auto 24px' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}>
          {STATS.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--pak-gold)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.label}</div>
              <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 12, color: 'var(--pak-green-light)', direction: 'rtl' }}>{stat.urdu}</div>
            </div>
          ))}
        </div>
        <div className="desi-divider" style={{ maxWidth: 900, margin: '24px auto 0' }} />
      </div>

      {/* ── How It Works ── */}
      <div style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
            Kaise Kaam Karta Hai? <span className="gradient-text-gold">4 Agents</span>
          </h2>
          <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 18, color: 'var(--pak-green-light)', direction: 'rtl' }}>یہ کیسے کام کرتا ہے</div>
          <div className="desi-divider" style={{ maxWidth: 200, margin: '16px auto 0' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="glow-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              {/* Number watermark */}
              <div style={{ position: 'absolute', top: -10, right: 10, fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 900, color: 'rgba(212,175,55,0.04)', lineHeight: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 40, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '2px 10px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 4 }}>
                <span style={{ fontSize: 10, color: f.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>AGENT {i + 1}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</h3>
              <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 13, color: 'var(--pak-green-light)', direction: 'rtl', marginBottom: 10 }}>{f.urdu}</div>
              <div className="desi-divider" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Demo Example ── */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-gold)', padding: '50px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--pak-gold)', marginBottom: 8 }}>مثال / Example</h2>
          <div className="desi-divider" style={{ maxWidth: 150, margin: '0 auto 28px' }} />
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: 12, padding: '24px', textAlign: 'left', marginBottom: 28 }}>
            <div style={{ fontSize: 11, color: 'var(--pak-gold)', fontFamily: 'var(--font-mono)', marginBottom: 14, letterSpacing: '0.1em' }}>📥 INPUT SIGNALS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { src: 'WHATSAPP', color: '#25D366', text: '"G-10 mein pani bhar gaya hai, gaariyan phans gayi hain!"' },
                { src: 'TWITTER', color: '#1d9bf0', text: '"Flash flood happening at George Town for past 30 mins!"' },
                { src: 'WEATHER', color: 'var(--sky-blue)', text: 'Rainfall: 45mm/hr — Extreme Rainfall Warning — Red Alert 🚨' },
                { src: 'TRAFFIC', color: 'var(--warning)', text: 'Congestion: 92% | Avg Speed: 4km/h | 12 incidents reported' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40`, borderRadius: 4, fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap', marginTop: 2 }}>{s.src}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{s.text}</span>
                </div>
              ))}
            </div>
            <div className="desi-divider" style={{ margin: '20px 0' }} />
            <div style={{ fontSize: 11, color: 'var(--pak-gold)', fontFamily: 'var(--font-mono)', marginBottom: 14, letterSpacing: '0.1em' }}>📤 CIRO OUTPUT</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Crisis Detected', value: 'Urban Flooding (G-10)', color: 'var(--sky-blue)' },
                { label: 'Confidence', value: '94% HIGH', color: 'var(--success)' },
                { label: 'Actions', value: '6 Coordinated', color: 'var(--pak-gold)' },
                { label: 'Impact', value: '80,000 people', color: 'var(--warning)' },
              ].map(m => (
                <div key={m.label} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: m.color, marginTop: 2 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          <Link to="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #01411C, #016630)',
            color: 'var(--pak-gold)', textDecoration: 'none',
            padding: '14px 40px', borderRadius: 10,
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
            border: '2px solid rgba(212,175,55,0.6)',
            boxShadow: '0 0 30px rgba(1,65,28,0.5), 0 0 60px rgba(212,175,55,0.15)',
          }}>
            ⚡ ابھی شروع کریں — Start Analysis
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-gold)', padding: '20px 24px', textAlign: 'center' }}>
        <div className="desi-divider" style={{ maxWidth: 400, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 18 }}>🇵🇰</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CIRO — Made for Pakistan | Google Cloud Gemini AI + Firebase</span>
          <span style={{ fontSize: 18 }}>🇵🇰</span>
        </div>
      </div>
    </div>
  );
}
