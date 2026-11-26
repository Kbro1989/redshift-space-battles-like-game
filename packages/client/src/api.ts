const BASE = '/api';

export const api = {
  async createPlayer(username: string) {
    const res = await fetch(`${BASE}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
  async getPlayer(id: string) {
    const res = await fetch(`${BASE}/players/${id}`);
    if (!res.ok) throw new Error('Player not found');
    return res.json();
  },
  async getResources(playerId: string) {
    const res = await fetch(`${BASE}/players/${playerId}/resources`);
    return res.json();
  },
  async startMissionBattle(playerId: string, missionId: string, friendlyShipIds: string[]) {
    const res = await fetch(`${BASE}/players/${playerId}/battles/mission`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId, friendlyShipIds }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
};
