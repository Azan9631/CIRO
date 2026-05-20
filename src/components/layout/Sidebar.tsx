import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

export function Sidebar({ isOpen, onClose, role }: Props) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const adminLinks = [
    { path: '/home', label: 'Home Dashboard', urdu: 'مرکزی صفحہ', icon: '⬡' },
    { path: '/dashboard', label: 'Command Center', urdu: 'کمانڈ سینٹر', icon: '◈' },
    { path: '/map', label: 'Crisis Map', urdu: 'بحران کا نقشہ', icon: '🗺️' },
    { path: '/logs', label: 'Agent Logs', urdu: 'ایجنٹ لاگ', icon: '≡' },
  ];

  const citizenLinks = [
    { path: '/home', label: 'Home Dashboard', urdu: 'مرکزی صفحہ', icon: '⬡' },
    { path: '/map', label: 'Crisis Map', urdu: 'بحران کا نقشہ', icon: '🗺️' },
  ];

  const links = role === 'admin' ? adminLinks : citizenLinks;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            zIndex: 999, transition: 'opacity 0.3s'
          }}
        />
      )}

      {/* Sidebar Panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        background: 'var(--bg-surface)', borderRight: '2px solid var(--border-gold)',
        zIndex: 1000, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: isOpen ? 'var(--shadow-card)' : 'none'
      }}>
        
        {/* Sidebar Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="CIRO Logo" className="interactive-logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color: 'var(--pak-gold)' }}>CIRO</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-urdu)', color: 'var(--pak-green-light)', direction: 'rtl' }}>پاکستان</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '20px 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {links.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', padding: '12px 24px',
                textDecoration: 'none', position: 'relative',
                color: active ? 'var(--pak-gold)' : 'var(--text-primary)',
                background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
                borderLeft: active ? '4px solid var(--pak-gold)' : '4px solid transparent',
              }}>
                <span style={{ fontSize: 20, marginRight: 16, opacity: active ? 1 : 0.7 }}>{link.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 500 }}>{link.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-urdu)', color: active ? 'var(--pak-green-light)' : 'var(--text-muted)', direction: 'rtl' }}>{link.urdu}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-gold)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img 
                src={user.photoURL || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                alt={user.name} 
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border-gold)', objectFit: 'cover', background: '#fff' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || 'operator@ciro.gov'}</span>
              </div>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Access: <strong style={{ color: role === 'admin' ? 'var(--truck-purple)' : 'var(--success)' }}>{role?.toUpperCase()}</strong>
          </div>
          <button onClick={() => { logout(); onClose(); }} style={{
            width: '100%', padding: '10px', background: 'rgba(200, 16, 46, 0.1)',
            border: '1px solid rgba(200, 16, 46, 0.3)', borderRadius: 8, color: 'var(--critical)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <span>🚪</span> LOGOUT
          </button>
        </div>

      </div>
    </>
  );
}
