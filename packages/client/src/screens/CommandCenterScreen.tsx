import React from 'react';
import { useGameStore, type Screen } from '../stores/game-store.js';

interface NavItem {
  label: string;
  screen: Screen;
  desc: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Base', screen: 'base', desc: 'Manage settlement & extraction' },
  { label: 'Fleet', screen: 'fleet', desc: 'Ships, crew & upgrades' },
  { label: 'Missions', screen: 'missions', desc: 'Combat & progression' },
];

const panel = { backgroundColor: '#0d1b2e', border: '1px solid #1a3a5c', borderRadius: '0.5rem', padding: '1rem' };

export function CommandCenterScreen() {
  const { player, navigate } = useGameStore();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080c14', padding: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a3a5c', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00aaff', letterSpacing: '0.3em' }}>REDSHIFT</h1>
          <p style={{ fontSize: '0.7rem', color: '#6b7280', letterSpacing: '0.2em' }}>COMMAND CENTER</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'white' }}>{player?.username ?? '—'}</p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Commander · LV {player?.level ?? 1}</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        {Object.entries(player?.resources ?? {}).map(([id, amt]) => (
          <div key={id} style={panel}>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{id}</p>
            <p style={{ fontSize: '1.25rem', color: '#00aaff', fontWeight: 'bold' }}>{Math.floor(amt as number).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.screen}
            onClick={() => navigate(item.screen)}
            style={{ ...panel, textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00aaff')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a3a5c')}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{item.label}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{item.desc}</p>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '2rem', borderTop: '1px solid #1a3a5c', paddingTop: '1rem', fontSize: '0.7rem', color: '#4b5563' }}>
        ⚠ Reconstruction v0.1 — Ship stats, resource names, and mission content are PLACEHOLDER pending evidence recovery.
      </div>
    </div>
  );
}
