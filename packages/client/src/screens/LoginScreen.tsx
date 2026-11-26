import React, { useState } from 'react';
import { useGameStore } from '../stores/game-store.js';
import { api } from '../api.js';

export function LoginScreen() {
  const setPlayer = useGameStore((s) => s.setPlayer);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const player = await api.createPlayer(username);
      localStorage.setItem('rs_player_id', player.id);
      setPlayer(player);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    const id = localStorage.getItem('rs_player_id');
    if (!id) {
      setError('No saved commander found.');
      return;
    }
    setLoading(true);
    try {
      const player = await api.getPlayer(id);
      setPlayer(player);
    } catch {
      setError('Could not load saved commander.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#080c14' }}>
      <div className="mb-8 text-center">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00aaff', letterSpacing: '0.3em' }}>REDSHIFT</h1>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', letterSpacing: '0.3em', marginTop: '0.25rem' }}>
          SPACE BATTLES — RECONSTRUCTION v0.1
        </p>
      </div>
      <div style={{ backgroundColor: '#0d1b2e', border: '1px solid #1a3a5c', padding: '2rem', borderRadius: '0.5rem', width: '24rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Commander Name
        </label>
        <input
          style={{ width: '100%', backgroundColor: '#080c14', border: '1px solid #1a3a5c', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', outline: 'none', boxSizing: 'border-box' }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter callsign..."
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        {error && <p style={{ color: '#cc0033', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading || username.length < 3}
          style={{
            width: '100%',
            backgroundColor: '#00aaff',
            color: '#080c14',
            fontWeight: 'bold',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: '1rem',
            cursor: 'pointer',
            border: 'none',
            opacity: (loading || username.length < 3) ? 0.5 : 1,
          }}
        >
          {loading ? '...' : 'New Commander'}
        </button>
        <button
          onClick={handleResume}
          disabled={loading}
          style={{
            width: '100%',
            border: '1px solid #1a3a5c',
            color: '#9ca3af',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: '0.5rem',
            cursor: 'pointer',
            backgroundColor: 'transparent',
          }}
        >
          Resume
        </button>
      </div>
    </div>
  );
}
