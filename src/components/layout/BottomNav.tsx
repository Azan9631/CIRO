import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '../../context/AuthContext';

interface Props {
  role: UserRole;
}

export function BottomNav({ role }: Props) {
  const location = useLocation();

  const links = role === 'admin' 
    ? [
        { path: '/dashboard', label: 'Command', icon: '◈' },
        { path: '/map', label: 'Map', icon: '◉' },
        { path: '/logs', label: 'Logs', icon: '≡' },
      ]
    : [
        { path: '/map', label: 'Crisis Map', icon: '◉' },
      ];

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--bg-surface)', borderTop: '1px solid var(--border-gold)',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      height: 60,
    }}>
      {links.map(link => {
        const active = location.pathname === link.path;
        return (
          <Link key={link.path} to={link.path} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', height: '100%',
            color: active ? 'var(--pak-gold)' : 'var(--text-muted)',
            borderTop: active ? '2px solid var(--pak-gold)' : '2px solid transparent',
            background: active ? 'rgba(212,175,55,0.05)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 20, marginBottom: 2 }}>{link.icon}</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
