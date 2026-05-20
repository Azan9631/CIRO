import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../constants/images';

export function LoginPage() {
  const { loginAsAdmin, loginAsCitizen, loading } = useAuth();
  const [roleMode, setRoleMode] = useState<'admin' | 'citizen'>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleMode === 'admin') {
      loginAsAdmin('email', email, password);
    } else {
      loginAsCitizen('email', email, password);
    }
  };

  const handleGoogleLogin = () => {
    if (roleMode === 'admin') {
      loginAsAdmin('google');
    } else {
      loginAsCitizen('google');
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.7)), url(${IMAGES.cityBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        padding: '40px 32px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, background: 'var(--pak-gold)', filter: 'blur(80px)', opacity: 0.3, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 150, height: 150, background: 'var(--pak-green-light)', filter: 'blur(80px)', opacity: 0.2, borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <img src={IMAGES.logo.startsWith('/') || IMAGES.logo.startsWith('http') ? IMAGES.logo : `/${IMAGES.logo}`} alt="CIRO Logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: 1 }}>CIRO</h1>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, fontWeight: 500 }}>
          Crisis Intelligence System
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          <button
            onClick={() => setRoleMode('citizen')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
              background: roleMode === 'citizen' ? '#fff' : 'transparent',
              color: roleMode === 'citizen' ? '#000' : 'var(--text-muted)',
              boxShadow: roleMode === 'citizen' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            👥 Citizen
          </button>
          <button
            onClick={() => setRoleMode('admin')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 700,
              background: roleMode === 'admin' ? 'var(--pak-green)' : 'transparent',
              color: roleMode === 'admin' ? '#fff' : 'var(--text-muted)',
              boxShadow: roleMode === 'admin' ? '0 2px 8px rgba(1, 65, 28, 0.3)' : 'none',
              transition: 'all 0.3s'
            }}
          >
            🛡️ Admin
          </button>
        </div>

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, background: '#fff',
              border: '1px solid rgba(0,0,0,0.1)', color: '#000', outline: 'none', fontSize: 15,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, background: '#fff',
              border: '1px solid rgba(0,0,0,0.1)', color: '#000', outline: 'none', fontSize: 15,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700,
              background: roleMode === 'admin' ? 'var(--pak-green)' : 'var(--pak-gold)',
              color: roleMode === 'admin' ? '#fff' : '#000',
              boxShadow: roleMode === 'admin' ? '0 8px 20px rgba(1, 65, 28, 0.25)' : '0 8px 20px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none'
            }}
          >
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderColor: roleMode === 'admin' ? '#fff' : '#000', borderTopColor: 'transparent' }} /> : 'Login'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.1)' }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 12, background: '#fff', color: '#000', border: '1px solid rgba(0,0,0,0.1)',
            fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />
          Continue with Google
        </button>

        <div style={{ marginTop: 32, fontSize: 11, color: 'var(--text-muted)' }}>
          Powered by Google Cloud & Gemini AI
        </div>
      </div>
    </div>
  );
}
