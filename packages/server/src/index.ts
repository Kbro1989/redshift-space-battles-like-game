import Fastify from 'fastify';
import { playerRoutes } from './routes/players.js';
import { combatRoutes } from './routes/combat.js';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok', game: 'Redshift: Space Battles', version: '0.1.0' }));

await app.register(playerRoutes);
await app.register(combatRoutes);

const PORT = Number(process.env.PORT ?? 3001);

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Redshift server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
