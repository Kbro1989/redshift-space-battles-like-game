import { describe, it, expect } from 'vitest';
import { runCombat, DEFAULT_COMBAT_CONFIG } from '../src/combat/combat-engine.js';
import { createShipInstance } from '../src/fleet/ship-instance.js';
import { SHIP_REGISTRY } from '../src/data/ships.js';

describe('CombatEngine', () => {
  it('resolves to friendly_victory when enemy fleet is weaker', () => {
    const friendly = [
      createShipInstance(SHIP_REGISTRY.battleship, 'f1'),
      createShipInstance(SHIP_REGISTRY.cruiser, 'f2'),
    ];
    const enemy = [createShipInstance(SHIP_REGISTRY.ngf_raider, 'e1')];
    const result = runCombat(friendly, enemy, DEFAULT_COMBAT_CONFIG);
    expect(result.outcome).toBe('friendly_victory');
  });

  it('resolves to enemy_victory when friendly fleet is weaker', () => {
    const friendly = [createShipInstance(SHIP_REGISTRY.fighter, 'f1')];
    const enemy = [createShipInstance(SHIP_REGISTRY.battleship, 'e1')];
    const result = runCombat(friendly, enemy, DEFAULT_COMBAT_CONFIG);
    expect(result.outcome).toBe('enemy_victory');
  });

  it('is deterministic — same seed produces same result', () => {
    const fleet = () => [createShipInstance(SHIP_REGISTRY.interceptor, 'f1')];
    const eFleet = () => [createShipInstance(SHIP_REGISTRY.ngf_raider, 'e1')];
    const r1 = runCombat(fleet(), eFleet(), DEFAULT_COMBAT_CONFIG);
    const r2 = runCombat(fleet(), eFleet(), DEFAULT_COMBAT_CONFIG);
    expect(r1.outcome).toBe(r2.outcome);
    expect(r1.log.length).toBe(r2.log.length);
  });

  it('every battle has a valid terminal state', () => {
    const fleet = [createShipInstance(SHIP_REGISTRY.fighter, 'f1')];
    const eFleet = [createShipInstance(SHIP_REGISTRY.ngf_raider, 'e1')];
    const result = runCombat(fleet, eFleet, DEFAULT_COMBAT_CONFIG);
    expect(['friendly_victory', 'enemy_victory', 'draw']).toContain(result.outcome);
  });

  it('logs a battle_end event', () => {
    const fleet = [createShipInstance(SHIP_REGISTRY.cruiser, 'f1')];
    const eFleet = [createShipInstance(SHIP_REGISTRY.ngf_raider, 'e1')];
    const result = runCombat(fleet, eFleet, DEFAULT_COMBAT_CONFIG);
    const endEvents = result.log.filter((e) => e.type === 'battle_end');
    expect(endEvents.length).toBe(1);
  });

  it('no hull goes below zero', () => {
    const fleet = [createShipInstance(SHIP_REGISTRY.fighter, 'f1')];
    const eFleet = [createShipInstance(SHIP_REGISTRY.battleship, 'e1')];
    const result = runCombat(fleet, eFleet, DEFAULT_COMBAT_CONFIG);
    for (const ship of [...result.friendly, ...result.enemy]) {
      expect(ship.currentHull).toBeGreaterThanOrEqual(0);
    }
  });
});
