import React, { useState } from 'react';
import { useGameStore } from '../stores/game-store.js';
import { SHIP_REGISTRY, type ShipDef } from '@redshift/engine';

const panel = { backgroundColor: '#0d1b2e', border: '1px solid #1a3a5c', borderRadius: '0.5rem', padding: '1rem' };

export function FleetScreen() {
  const { navigate } = useGameStore();
  const [selectedShip, setSelectedShip] = useState<ShipDef | null>(null);
  const ships = Object.values(SHIP_REGISTRY);

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
          Fleet Hangar & Shipyard
        </h2>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {ships.map((ship) => (
          <div
            key={ship.id}
            style={{ ...panel, cursor: 'pointer', borderColor: selectedShip?.id === ship.id ? '#00aaff' : '#1a3a5c' }}
            onClick={() => setSelectedShip(ship)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{ship.label}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  Class: {ship.shipClass.toUpperCase()} | Faction: {ship.faction.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', whiteSpace: 'nowrap' }}>[{ship.evidenceStatus}]</span>
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#d1d5db', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
              <div>Hull: <span style={{ color: '#00aaff' }}>{ship.maxHull}</span></div>
              <div>Shield: <span style={{ color: '#00aaff' }}>{ship.maxShield}</span></div>
              <div>Unlock LV: {ship.unlockLevel}</div>
              <div>Capital: {ship.isCapital ? 'YES' : 'NO'}</div>
            </div>

            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#9ca3af' }}>
              Weapons: {ship.weapons.map((w) => `${w.label} (${w.damage} dmg)`).join(', ') || 'None'}
            </div>

            {Object.keys(ship.constructionCost).length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#f59e0b' }}>
                Cost: {Object.entries(ship.constructionCost).map(([k, v]) => `${v} ${k}`).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
