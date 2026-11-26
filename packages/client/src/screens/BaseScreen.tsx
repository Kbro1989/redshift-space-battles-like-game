import React from 'react';
import { useGameStore } from '../stores/game-store.js';
import { BUILDING_REGISTRY } from '@redshift/engine';

const panel = { backgroundColor: '#0d1b2e', border: '1px solid #1a3a5c', borderRadius: '0.5rem', padding: '1rem' };

export function BaseScreen() {
  const { navigate } = useGameStore();
  const buildings = Object.values(BUILDING_REGISTRY);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080c14', padding: '1.5rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('command_center')}
          style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          ← Back
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#00aaff', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          Base Management
        </h2>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {buildings.map((b) => (
          <div key={b.id} style={panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{b.label}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{b.description}</p>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>[{b.evidenceStatus}]</span>
            </div>
            {b.productionPerTick[0] && Object.keys(b.productionPerTick[0]).length > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#00cc66', marginTop: '0.5rem' }}>
                Produces: {Object.entries(b.productionPerTick[0]).map(([k, v]) => `+${v}/tick ${k}`).join(', ')}
              </p>
            )}
            <button
              style={{
                marginTop: '0.75rem',
                border: '1px solid #1a3a5c',
                color: '#9ca3af',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.25rem',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Construct (LV1)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
