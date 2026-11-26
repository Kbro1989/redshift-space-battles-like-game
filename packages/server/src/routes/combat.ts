import type { FastifyInstance } from 'fastify';
import { getDb } from '../db/schema.js';
import { nanoid } from 'nanoid';
import {
  runCombat,
  createShipInstance,
  SHIP_REGISTRY,
  MISSION_REGISTRY,
  DEFAULT_COMBAT_CONFIG,
  type ShipInstance,
} from '@redshift/engine';

export async function combatRoutes(app: FastifyInstance) {
  app.post('/players/:playerId/battles/mission', async (req, reply) => {
    const { playerId } = req.params as { playerId: string };
    const { missionId, friendlyShipIds } = req.body as { missionId: string; friendlyShipIds: string[] };
    const db = getDb();

    const player = db.prepare(`SELECT * FROM players WHERE id = ?`).get(playerId);
    if (!player) return reply.code(404).send({ error: 'Player not found' });

    const mission = MISSION_REGISTRY[missionId];
    if (!mission) return reply.code(404).send({ error: 'Mission not found' });

    for (const prereq of mission.prerequisites) {
      const done = db.prepare(`SELECT 1 FROM completed_missions WHERE player_id = ? AND mission_id = ?`).get(playerId, prereq);
      if (!done) return reply.code(403).send({ error: `Prerequisite mission not completed: ${prereq}` });
    }

    const friendlyFleet: ShipInstance[] = [];
    for (const shipId of friendlyShipIds) {
      const row = db.prepare(`SELECT * FROM player_ships WHERE id = ? AND player_id = ? AND is_destroyed = 0`).get(shipId, playerId) as any;
      if (!row) return reply.code(404).send({ error: `Ship ${shipId} not found or destroyed` });
      const def = SHIP_REGISTRY[row.ship_def_id];
      if (!def) return reply.code(500).send({ error: `Unknown ship def: ${row.ship_def_id}` });
      friendlyFleet.push({
        instanceId: row.id,
        defId: row.ship_def_id,
        def,
        upgradeLevel: row.upgrade_level,
        currentHull: row.current_hull,
        currentShield: row.current_shield,
        assignedCrewIds: [],
        equipmentIds: [],
        isDestroyed: false,
      });
    }

    const enemyFleet: ShipInstance[] = [];
    for (const wave of mission.enemyWaves) {
      const def = SHIP_REGISTRY[wave.shipDefId];
      if (!def) continue;
      for (let i = 0; i < wave.count; i++) {
        enemyFleet.push(createShipInstance(def, `enemy_${wave.shipDefId}_${i}_${nanoid(4)}`));
      }
    }

    const seed = Date.now() % 0xffffffff;
    const result = runCombat(friendlyFleet, enemyFleet, { ...DEFAULT_COMBAT_CONFIG, seed });
    const battleId = nanoid();

    db.prepare(`INSERT INTO battles (id, player_id, mission_id, outcome, ticks, rewards, log_summary) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(battleId, playerId, missionId, result.outcome, result.tick, JSON.stringify(mission.rewards), JSON.stringify(result.log.slice(-20)));

    if (result.outcome === 'friendly_victory') {
      for (const [rid, amt] of Object.entries(mission.rewards)) {
        db.prepare(`INSERT INTO player_resources (player_id, resource_id, amount) VALUES (?, ?, ?)
           ON CONFLICT (player_id, resource_id) DO UPDATE SET amount = amount + excluded.amount`)
          .run(playerId, rid, amt);
      }
      db.prepare(`INSERT OR IGNORE INTO completed_missions (player_id, mission_id) VALUES (?, ?)`).run(playerId, missionId);
    }

    for (const ship of result.friendly) {
      db.prepare(`UPDATE player_ships SET current_hull = ?, current_shield = ?, is_destroyed = ? WHERE id = ?`)
        .run(ship.currentHull, ship.currentShield, ship.isDestroyed ? 1 : 0, ship.instanceId);
    }

    return {
      battleId,
      outcome: result.outcome,
      ticks: result.tick,
      rewards: result.outcome === 'friendly_victory' ? mission.rewards : {},
      logSummary: result.log.slice(-10),
    };
  });

  app.get('/players/:playerId/battles', async (req, reply) => {
    const { playerId } = req.params as { playerId: string };
    const db = getDb();
    return db.prepare(`SELECT id, mission_id, outcome, ticks, rewards, created_at FROM battles WHERE player_id = ? ORDER BY created_at DESC LIMIT 50`).all(playerId);
  });
}
