import type { FastifyInstance } from 'fastify';
import { getDb } from '../db/schema.js';
import { nanoid } from 'nanoid';

export async function playerRoutes(app: FastifyInstance) {
  app.post('/players', async (req, reply) => {
    const { username } = req.body as { username: string };
    if (!username || username.length < 3) {
      return reply.code(400).send({ error: 'Username must be at least 3 characters' });
    }
    const db = getDb();
    const id = nanoid();
    try {
      db.prepare(`INSERT INTO players (id, username) VALUES (?, ?)`).run(id, username);
      const startingResources = { credits: 2000, metal: 1000 };
      for (const [rid, amt] of Object.entries(startingResources)) {
        db.prepare(`INSERT INTO player_resources (player_id, resource_id, amount) VALUES (?, ?, ?)`).run(id, rid, amt);
      }
      return reply.code(201).send({ id, username, level: 1, xp: 0, resources: startingResources });
    } catch (e: any) {
      if (e.message?.includes('UNIQUE')) return reply.code(409).send({ error: 'Username taken' });
      throw e;
    }
  });

  app.get('/players/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const db = getDb();
    const player = db.prepare(`SELECT * FROM players WHERE id = ?`).get(id) as any;
    if (!player) return reply.code(404).send({ error: 'Player not found' });
    const resources = db.prepare(`SELECT resource_id, amount FROM player_resources WHERE player_id = ?`).all(id) as any[];
    const resourceMap = Object.fromEntries(resources.map((r) => [r.resource_id, r.amount]));
    return { ...player, resources: resourceMap };
  });

  app.get('/players/:id/resources', async (req, reply) => {
    const { id } = req.params as { id: string };
    const db = getDb();
    const rows = db.prepare(`SELECT resource_id, amount FROM player_resources WHERE player_id = ?`).all(id) as any[];
    return Object.fromEntries(rows.map((r) => [r.resource_id, r.amount]));
  });
}
