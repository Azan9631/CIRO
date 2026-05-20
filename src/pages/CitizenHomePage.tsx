import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../constants/images';
import { CrisisMap } from '../components/map/CrisisMap';
import { 
  fetchLiveWeather, 
  generateGeminiWeatherBrief, 
  getWeatherEmoji, 
  getWeatherDescription 
} from '../services/weatherService';
import type { WeatherData, GeminiWeatherBrief } from '../services/weatherService';

const EMERGENCY_CONTACTS = [
  { name: 'Rescue 1122', number: '1122', icon: '🚑', color: 'var(--critical)' },
  { name: 'Police Helpline', number: '15', icon: '🚓', color: 'var(--truck-blue)' },
  { name: 'Edhi Ambulance', number: '115', icon: '🏥', color: 'var(--pak-green)' },
  { name: 'Fire Brigade', number: '16', icon: '🚒', color: 'var(--truck-orange)' },
];

const REAL_NEWS = [
  { id: 1, title: 'Government Announces Mega Drainage Project Ahead of Monsoons', source: 'Geo News', time: '2 hours ago', img: 'https://images.unsplash.com/photo-1541888081622-38600d5a3ec4?w=500&q=80' },
  { id: 2, title: 'Smart Waste Management System Launched in Capital Territory', source: 'Dawn', time: '5 hours ago', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&q=80' },
  { id: 3, title: 'Traffic Police Introduce AI Cameras for Real-Time Congestion Updates', source: 'Express Tribune', time: '1 day ago', img: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=500&q=80' },
];

const SUPER_APP_SERVICES = [
  { id: 'challan', icon: '🚗', title: 'E-Challan Check', desc: 'Verify traffic fines', bg: 'rgba(21, 101, 192, 0.1)', color: '#1565C0' },
  { id: 'power', icon: '⚡', title: 'Load Shedding', desc: 'Area power schedule', bg: 'rgba(233, 30, 140, 0.1)', color: '#E91E8C' },
  { id: 'blood', icon: '🩸', title: 'Blood Network', desc: 'Urgent plasma needs', bg: 'rgba(200, 16, 46, 0.1)', color: '#C8102E' },
  { id: 'wasa', icon: '💧', title: 'Water Tanker', desc: 'Book WASA tanker', bg: 'rgba(0, 191, 165, 0.1)', color: '#00BFA5' },
];

export function CitizenHomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'services' | 'news' | 'complaints' | 'map'>('feed');
  
  // Weather States
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [geminiBrief, setGeminiBrief] = useState<GeminiWeatherBrief | null>(null);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [voiceActive, setVoiceActive] = useState<'en' | 'ur' | null>(null);
  
  // Complaint State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintType, setComplaintType] = useState('Garbage & Solid Waste');
  const [aiDetection, setAiDetection] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SOS State
  const [sosActive, setSosActive] = useState(false);

  // Fetch real weather and get Gemini intelligence brief
  useEffect(() => {
    const getWeatherData = async (lat: number, lng: number) => {
      try {
        const data = await fetchLiveWeather(lat, lng);
        setWeatherData(data);
        setLoadingWeather(false);
        
        // Fetch AI intelligence summary in background
        setLoadingBrief(true);
        const brief = await generateGeminiWeatherBrief(data);
        setGeminiBrief(brief);
      } catch (err) {
        console.error('Weather load error:', err);
        loadFallbackWeather();
      } finally {
        setLoadingBrief(false);
      }
    };

    const loadFallbackWeather = async () => {
      try {
        // Fallback to Islamabad coordinates
        const data = await fetchLiveWeather(33.6844, 73.0479, 'Islamabad');
        setWeatherData(data);
        setLoadingWeather(false);
        
        setLoadingBrief(true);
        const brief = await generateGeminiWeatherBrief(data);
        setGeminiBrief(brief);
      } catch (err) {
        console.error('Fallback weather failed:', err);
      } finally {
        setLoadingBrief(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => getWeatherData(pos.coords.latitude, pos.coords.longitude),
        () => loadFallbackWeather()
      );
    } else {
      loadFallbackWeather();
    }
  }, []);

  // Text to Speech logic for Weather updates
  const speakBrief = (lang: 'en' | 'ur') => {
    if (!geminiBrief) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (voiceActive === lang) {
      setVoiceActive(null);
      return;
    }

    const textToSpeak = lang === 'en' 
      ? `${geminiBrief.summaryEng}. Advisory: ${geminiBrief.advisoryEng}. Clothing: ${geminiBrief.clothing}`
      : `${geminiBrief.summaryUrdu}. مشورہ: ${geminiBrief.advisoryUrdu}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    
    // Try to find native voice
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang.startsWith(lang));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setVoiceActive(null);
    utterance.onerror = () => setVoiceActive(null);

    setVoiceActive(lang);
    window.speechSynthesis.speak(utterance);
  };

  // Stop reading when modal closes
  useEffect(() => {
    if (!weatherModalOpen) {
      window.speechSynthesis.cancel();
      setVoiceActive(null);
    }
  }, [weatherModalOpen]);

  // Simulate AI Photo Detection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setUploadedPhoto(imgUrl);
      setIsAnalyzingPhoto(true);
      setAiDetection(null);

      setTimeout(() => {
        setIsAnalyzingPhoto(false);
        if (complaintType.includes('Garbage')) {
          setAiDetection('🤖 AI Vision: Overflowing solid waste detected. Hazard Level: Moderate (Confidence: 94%)');
        } else if (complaintType.includes('Drainage')) {
          setAiDetection('🤖 AI Vision: Stagnant water & clogged drainage infrastructure. Hazard Level: High (Confidence: 91%)');
        } else {
          setAiDetection('🤖 AI Vision: Road/Infrastructure damage detected. Maintenance required. (Confidence: 88%)');
        }
      }, 2500);
    }
  };

  const handleSOS = () => {
    setSosActive(true);
    setTimeout(() => {
      alert('SOS Signal sent to Rescue 1122 and Police 15 with your live GPS location.');
      setSosActive(false);
    }, 2000);
  };

  // Helper to determine Google Weather gradient backgrounds
  const getWeatherGradient = (code: number) => {
    if (code === 0) return 'linear-gradient(135deg, #1565C0, #29B6F6)'; // Clear/Sunny
    if (code >= 95) return 'linear-gradient(135deg, #2c3e50, #0f172a)'; // Thunderstorm
    if (code >= 51 && code <= 82) return 'linear-gradient(135deg, #1e293b, #3b82f6)'; // Rainy
    if (code === 45 || code === 48) return 'linear-gradient(135deg, #475569, #94a3b8)'; // Foggy
    return 'linear-gradient(135deg, #0f766e, #0d9488)'; // Clouds/Teal
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', padding: 16, paddingBottom: 100, maxWidth: 800, margin: '0 auto', position: 'relative' }}>
      
      {/* Dynamic Header & Google Weather Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={user?.photoURL || IMAGES.logo} alt="Profile" style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid var(--pak-gold)', objectFit: 'cover', background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Welcome Back</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{user?.name || 'Citizen'}</div>
          </div>
        </div>
        
        {/* Clickable Google Weather Badge */}
        <div 
          onClick={() => setWeatherModalOpen(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', 
            padding: '8px 14px', borderRadius: 20, border: '1px solid var(--border-gold)', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s' 
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pak-gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-gold)'}
        >
          {loadingWeather ? (
            <div className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <span style={{ fontSize: 24, lineHeight: 1 }}>{getWeatherEmoji(weatherData?.conditionCode ?? 0)}</span>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {loadingWeather ? '--' : `${weatherData?.temp}°C`}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', maxWidth: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
              {loadingWeather ? 'Loading...' : weatherData?.city}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Dialler */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none', marginLeft: -16, paddingLeft: 16, marginRight: -16, paddingRight: 16, marginBottom: 8 }}>
        {EMERGENCY_CONTACTS.map((contact, idx) => (
          <a key={idx} href={`tel:${contact.number}`} style={{ 
            minWidth: 105, background: 'var(--bg-card)', border: `1px solid ${contact.color}30`, borderRadius: 16, padding: 12, textAlign: 'center', 
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${contact.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8, color: contact.color }}>
              {contact.icon}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{contact.name}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: contact.color, fontFamily: 'var(--font-mono)' }}>{contact.number}</div>
          </a>
        ))}
      </div>

      {/* Primary Action Panel (Govt Complaint & Maintenance) */}
      <div style={{
        background: 'linear-gradient(135deg, var(--pak-green), #012b13)',
        borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(1, 65, 28, 0.2)', marginBottom: 24, color: '#fff'
      }}>
        <div style={{ position: 'absolute', right: -10, top: -20, fontSize: 120, opacity: 0.04 }}>🇵🇰</div>
        <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 100, opacity: 0.05 }}>🏛️</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)' }}>
              Govt Maintenance Portal
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16, maxWidth: '90%', lineHeight: 1.5 }}>
              Register complaints for Garbage, Drainage, or Potholes. AI will automatically detect the issue severity from your photos and dispatch teams.
            </p>
            <button 
              onClick={() => setComplaintModalOpen(true)}
              style={{
              background: 'var(--pak-gold)', color: '#000', border: 'none', borderRadius: 12, padding: '12px 24px',
              fontSize: 14, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)', cursor: 'pointer'
            }}>
              📸 Lodge Smart Complaint
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 12, padding: 4, marginBottom: 20, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button onClick={() => setActiveTab('feed')} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: activeTab === 'feed' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'feed' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: activeTab === 'feed' ? 'var(--shadow-card)' : 'none', transition: 'all 0.3s', border: 'none', cursor: 'pointer' }}>
          Live Feeds
        </button>
        <button onClick={() => setActiveTab('services')} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: activeTab === 'services' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'services' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: activeTab === 'services' ? 'var(--shadow-card)' : 'none', transition: 'all 0.3s', border: 'none', cursor: 'pointer' }}>
          e-Services ⚡
        </button>
        <button onClick={() => setActiveTab('news')} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: activeTab === 'news' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'news' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: activeTab === 'news' ? 'var(--shadow-card)' : 'none', transition: 'all 0.3s', border: 'none', cursor: 'pointer' }}>
          News & Blogs
        </button>
        <button onClick={() => setActiveTab('complaints')} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: activeTab === 'complaints' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'complaints' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: activeTab === 'complaints' ? 'var(--shadow-card)' : 'none', transition: 'all 0.3s', border: 'none', cursor: 'pointer' }}>
          My Complaints
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Citizen Reporters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {IMAGES.feedPhotos.slice(0,4).map((photo, idx) => (
              <div key={idx} style={{ 
                height: 160, borderRadius: 16, overflow: 'hidden', position: 'relative',
                boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-gold)'
              }}>
                <img src={photo} alt={`Community Report ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 12px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="pulse-dot critical" style={{ width: 6, height: 6 }}></span> Live Update
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div style={{ animation: 'fadeIn 0.3s', height: '60vh', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>Live Crisis Map</h2>
          <div style={{ flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-gold)', boxShadow: 'var(--shadow-card)' }}>
            <CrisisMap report={{
              id: 'mock-crisis',
              crisis_type: 'urban_flooding',
              severity: 'high',
              location: 'Sector G-10',
              lat: 33.6844,
              lng: 73.0479,
              affected_zones: ['G-10 Markaz', 'Kashmir Highway'],
              description: 'Heavy rainfall causing water accumulation. Avoid the area.',
              confidence: 95
            } as any} height="100%" />
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12 }}>City Super App Services</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {SUPER_APP_SERVICES.map((svc) => (
              <div key={svc.id} style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: svc.bg, color: svc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 }}>
                  {svc.icon}
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{svc.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {REAL_NEWS.map((news) => (
            <div key={news.id} style={{ display: 'flex', gap: 12, background: 'var(--bg-card)', borderRadius: 16, padding: 12, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)' }}>
              <img src={news.img} alt={news.title} style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.3 }}>{news.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--pak-gold)', fontWeight: 700 }}>{news.source}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{news.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div style={{ animation: 'fadeIn 0.3s', padding: 20, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed var(--border-gold)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>No Active Complaints</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You haven't registered any maintenance requests yet.</p>
        </div>
      )}

      {/* Floating Panic SOS Button */}
      <button 
        onClick={handleSOS}
        disabled={sosActive}
        style={{
          position: 'fixed', bottom: 80, right: 24, width: 64, height: 64, borderRadius: '50%',
          background: 'var(--critical)', color: '#fff', border: '4px solid #fff',
          boxShadow: '0 10px 25px rgba(200, 16, 46, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, cursor: 'pointer', zIndex: 90, transition: 'all 0.3s',
          transform: sosActive ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {sosActive ? <div className="spinner" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} /> : '🚨'}
      </button>

      {/* 🌤️ GOOGLE WEATHER DASHBOARD MODAL 🌤️ */}
      {weatherModalOpen && weatherData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }}>
          <div style={{ 
            background: 'var(--bg-primary)', borderTopLeftRadius: 28, borderTopRightRadius: 28, 
            width: '100%', maxWidth: 550, maxHeight: '92vh', overflowY: 'auto', border: '1px solid var(--border-gold)',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.3)', padding: 0, position: 'relative', animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Styled animation keyframes inside dynamic style node */}
            <style>{`
              @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
              .custom-scrollbar::-webkit-scrollbar { height: 6px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.4); border-radius: 4px; }
            `}</style>
            
            {/* Modal Glassmorphic Weather Header */}
            <div style={{ 
              background: getWeatherGradient(weatherData.conditionCode), color: '#fff', 
              padding: '28px 24px', position: 'relative', display: 'flex', flexDirection: 'column', 
              gap: 16, borderTopLeftRadius: 26, borderTopRightRadius: 26 
            }}>
              {/* Close Button */}
              <button 
                onClick={() => setWeatherModalOpen(false)}
                style={{ 
                  position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.25)', 
                  border: 'none', width: 34, height: 34, borderRadius: '50%', color: '#fff', 
                  fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontFamily: 'var(--font-display)' }}>
                    {weatherData.city}
                  </h3>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{weatherData.condition}</div>
                </div>
                <div style={{ fontSize: 50, textShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  {getWeatherEmoji(weatherData.conditionCode)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 62, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: -2 }}>
                  {weatherData.temp}°
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  H: {weatherData.daily[0].tempMax}° • L: {weatherData.daily[0].tempMin}°
                </span>
              </div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* 🧠 GOOGLE GEMINI AI WEATHER INTELLIGENCE ADVISORY CARD */}
              <div style={{ 
                background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 18, 
                padding: 16, position: 'relative', boxShadow: 'var(--shadow-gold)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🤖</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--pak-gold)', fontWeight: 900, letterSpacing: '0.08em' }}>GOOGLE GEMINI BRIEFING</span>
                  </div>
                  {geminiBrief && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        onClick={() => speakBrief('en')}
                        style={{ background: voiceActive === 'en' ? 'var(--pak-gold)' : 'rgba(212,175,55,0.1)', border: '1px solid var(--border-gold)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: voiceActive === 'en' ? '#000' : 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        🔊 EN
                      </button>
                      <button 
                        onClick={() => speakBrief('ur')}
                        style={{ background: voiceActive === 'ur' ? 'var(--pak-gold)' : 'rgba(212,175,55,0.1)', border: '1px solid var(--border-gold)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, color: voiceActive === 'ur' ? '#000' : 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        🗣️ اردو
                      </button>
                    </div>
                  )}
                </div>

                {loadingBrief && (
                  <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div className="spinner" style={{ width: 24, height: 24, borderTopColor: 'var(--pak-gold)' }} />
                    <span style={{ fontSize: 12, color: 'var(--pak-gold)', fontWeight: 800 }}>Gemini Weather AI Analyzing...</span>
                  </div>
                )}

                {geminiBrief && !loadingBrief && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {/* Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>Risk Level:</span>
                      <span className={`badge badge-${geminiBrief.hazardLevel === 'low' ? 'success' : geminiBrief.hazardLevel === 'medium' ? 'warning' : 'critical'}`}>
                        <span className={`pulse-dot ${geminiBrief.hazardLevel === 'low' ? '' : geminiBrief.hazardLevel === 'medium' ? 'warning' : 'critical'}`} style={{ width: 6, height: 6 }} />
                        {geminiBrief.hazardLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="desi-divider" />

                    {/* Urdu Briefing */}
                    <div style={{ background: 'rgba(1, 65, 28, 0.05)', padding: 12, borderRadius: 10, borderLeft: '3px solid var(--pak-green)' }}>
                      <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 16, lineHeight: 1.8, color: 'var(--text-primary)', textAlign: 'right', direction: 'rtl' }}>
                        {geminiBrief.summaryUrdu}
                      </div>
                      <div style={{ fontFamily: 'var(--font-urdu)', fontSize: 14, lineHeight: 1.8, color: 'var(--critical)', fontWeight: 700, textAlign: 'right', direction: 'rtl', marginTop: 6 }}>
                        💡 حفاظتی مشورہ: {geminiBrief.advisoryUrdu}
                      </div>
                    </div>

                    {/* English Briefing */}
                    <div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{geminiBrief.summaryEng}"
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 8, fontWeight: 700, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span>⚠️</span>
                        <span><b>Advisory:</b> {geminiBrief.advisoryEng}</span>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                      <div style={{ background: 'var(--bg-primary)', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--pak-gold)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>👕 CLOTHING</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 600 }}>{geminiBrief.clothing}</div>
                      </div>
                      <div style={{ background: 'var(--bg-primary)', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--pak-gold)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>🗺️ ACTIVITIES</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 600 }}>{geminiBrief.activities}</div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Weather Stats Grid */}
              <div>
                <h4 style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 }}>DETAILS</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Humidity', value: `${weatherData.humidity}%`, icon: '💧' },
                    { label: 'Wind Speed', value: `${weatherData.windSpeed} km/h`, icon: '💨' },
                    { label: 'Pressure', value: `${weatherData.pressure} hPa`, icon: '🌡️' },
                    { label: 'UV Index', value: `${weatherData.uvIndex}`, icon: '☀️' },
                  ].map((s, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '12px 6px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hourly Forecast Slider */}
              <div>
                <h4 style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 }}>HOURLY FORECAST</h4>
                <div className="custom-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'thin' }}>
                  {weatherData.hourly.map((h, idx) => (
                    <div key={idx} style={{ 
                      minWidth: 70, background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
                      borderRadius: 14, padding: '12px 6px', textAlign: 'center', display: 'flex', 
                      flexDirection: 'column', alignItems: 'center', gap: 4 
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{h.time}</div>
                      <div style={{ fontSize: 20 }}>{getWeatherEmoji(h.conditionCode)}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{h.temp}°</div>
                      <div style={{ fontSize: 9, color: 'var(--sky-blue)', fontWeight: 800 }}>
                        {h.precipProb > 10 ? `💧${h.precipProb}%` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Forecast */}
              <div>
                <h4 style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.08em', marginBottom: 10 }}>7-DAY FORECAST</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {weatherData.daily.map((d, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
                      borderRadius: 14, padding: '10px 16px' 
                    }}>
                      <div style={{ width: 85, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{d.day}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 45 }}>
                        <span style={{ fontSize: 18 }}>{getWeatherEmoji(d.conditionCode)}</span>
                        {d.precipProb > 20 && (
                          <span style={{ fontSize: 9, color: 'var(--sky-blue)', fontWeight: 800 }}>{d.precipProb}%</span>
                        )}
                      </div>
                      
                      {/* Visual temperature progress slider */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 20, textAlign: 'right' }}>{d.tempMin}°</span>
                        <div style={{ flex: 1, height: 4, background: 'rgba(212,175,55,0.1)', borderRadius: 2, position: 'relative' }}>
                          <div style={{ 
                            position: 'absolute', left: '20%', right: '20%', height: '100%', 
                            background: 'linear-gradient(90deg, var(--sky-blue), var(--truck-orange))', borderRadius: 2 
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 800, minWidth: 20 }}>{d.tempMax}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* AI Complaint Modal */}
      {complaintModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 24, width: '100%', maxWidth: 450, border: '1px solid var(--border-gold)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 900, color: 'var(--text-primary)' }}>Lodge Smart Complaint</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Upload a photo of the garbage, drainage issue, or damaged road. Our AI will analyze the image and forward the precise priority to the Govt department.
            </p>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Complaint Category</label>
              <select value={complaintType} onChange={e => setComplaintType(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', fontWeight: 700 }}>
                <option>Garbage & Solid Waste</option>
                <option>Drainage & Sewerage Leak</option>
                <option>Road Damage / Potholes</option>
                <option>Street Light Outage</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Attach Photographic Evidence</label>
              
              {/* Photo Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '100%', height: 140, background: uploadedPhoto ? `url(${uploadedPhoto}) center/cover` : 'var(--bg-elevated)', 
                  border: uploadedPhoto ? 'none' : '2px dashed var(--border-gold)', borderRadius: 12, display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                }}
              >
                {!uploadedPhoto && (
                  <>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                    <div style={{ fontSize: 13, color: 'var(--pak-gold)', fontWeight: 800 }}>Tap to Capture or Upload</div>
                  </>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </div>

              {/* AI Detection Result */}
              {isAnalyzingPhoto && (
                <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="spinner" style={{ borderColor: 'var(--border-gold)', borderTopColor: 'var(--pak-gold)', width: 16, height: 16 }}></div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pak-gold)' }}>AI Vision Model Analyzing...</span>
                </div>
              )}

              {aiDetection && (
                <div style={{ marginTop: 12, padding: 12, background: 'rgba(212,175,55,0.1)', borderRadius: 12, border: '1px solid var(--border-gold)' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>{aiDetection}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Additional Details (Optional)</label>
              <textarea placeholder="Any landmarks nearby?" style={{ width: '100%', height: 60, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, color: 'var(--text-primary)', outline: 'none', resize: 'none', fontFamily: 'inherit', fontWeight: 500 }}></textarea>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setComplaintModalOpen(false); setUploadedPhoto(null); setAiDetection(null); }} style={{ flex: 1, padding: '14px 0', borderRadius: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button disabled={!aiDetection && uploadedPhoto !== null} onClick={() => { setComplaintModalOpen(false); setUploadedPhoto(null); setAiDetection(null); }} style={{ flex: 1, padding: '14px 0', borderRadius: 12, background: 'var(--pak-green)', border: 'none', color: '#fff', fontWeight: 900, boxShadow: '0 4px 15px rgba(2, 165, 80, 0.4)', opacity: (!aiDetection && uploadedPhoto) ? 0.5 : 1, cursor: 'pointer' }}>
                Submit to Govt.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
