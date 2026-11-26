import React, { useState } from 'react';
import { useGameStore } from '../stores/game-store.js';
import { MISSION_REGISTRY } from '@redshift/engine';

const panel = { backgroundColor: '#0d1b2e', border: '1px solid #1a3a5c', borderRadius: '0.5rem', padding: '1rem', cursor: 'pointer' };

export function MissionsScreen() {
  const { navigate } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const missions = Object.values(MISSION_REGISTRY);

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
          Mission Select
        </h2>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {missions.map((m) => (
          <div key={m.id} style={panel} onClick={() => setSelected(selected === m.id ? null : m.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.title}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{m.description}</p>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', marginLeft: '1rem', whiteSpace: 'nowrap' }}>[{m.evidenceStatus}]</span>
            </div>
            {selected === m.id && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #1a3a5c', paddingTop: '1rem', fontSize: '0.75rem', color: '#d1d5db' }}>
                <p>Sector: {m.sectorId}</p>
                <p>Required level: {m.requiredPlayerLevel}</p>
                <p>Enemies: {m.enemyWaves.map((w) => `${w.count}× ${w.shipDefId}`).join(', ')}</p>
                <p>Rewards: {Object.entries(m.rewards).map(([k, v]) => `${v} ${k}`).join(', ')}</p>
                <button
                  style={{
                    marginTop: '0.75rem',
                    backgroundColor: '#00aaff',
                    color: '#080c14',
                    fontWeight: 'bold',
                    padding: '0.25rem 1rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Deploy Fleet →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
