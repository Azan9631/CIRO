import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, role, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: theme === 'dark' ? 'rgba(5,14,8,0.95)' : 'rgba(249, 253, 245, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-gold)',
      transition: 'background 0.3s'
    }}>
      {/* Top decorative strip - truck art colors */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #01411C, #D4AF37, #E91E8C, #FF6B00, #D4AF37, #01411C)' }} />

      <div style={{ maxWidth: 1500, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, padding: '0 16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Hamburger Menu Button */}
          {user && onMenuClick && (
            <button onClick={onMenuClick} style={{
              background: 'none', border: 'none', color: 'var(--pak-gold)', 
              fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center'
            }}>
              ☰
            </button>
          )}

          {/* Logo — Pakistani Style */}
          <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="CIRO Logo" className="interactive-logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--pak-gold)', letterSpacing: '0.15em' }}>CIRO</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          
          <button onClick={toggleTheme} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', 
            borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16, transition: 'all 0.2s', color: 'var(--pak-gold)'
          }} title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hide-mobile">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</span>
                <span style={{ fontSize: 10, color: role === 'admin' ? 'var(--truck-purple)' : 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                  {role?.toUpperCase()}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
