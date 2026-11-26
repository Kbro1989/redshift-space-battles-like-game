import type { ShipInstance } from '../fleet/ship-instance.js';
import { effectiveMaxShield } from '../fleet/ship-instance.js';

export interface CombatShip extends ShipInstance {
  weaponCooldowns: number[];
}

export interface CombatState {
  tick: number;
  friendly: CombatShip[];
  enemy: CombatShip[];
  log: CombatEvent[];
  outcome: 'ongoing' | 'friendly_victory' | 'enemy_victory' | 'draw';
}

export interface CombatEvent {
  tick: number;
  type: 'shot' | 'miss' | 'shield_hit' | 'hull_hit' | 'ship_destroyed' | 'battle_end';
  attackerId: string;
  targetId?: string;
  weaponId?: string;
  damage?: number;
  note?: string;
}

function toCombatShip(s: ShipInstance): CombatShip {
  return { ...s, weaponCooldowns: s.def.weapons.map(() => 0) };
}

function living(ships: CombatShip[]): CombatShip[] {
  return ships.filter((s) => !s.isDestroyed);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function selectTarget(defenders: CombatShip[]): CombatShip | null {
  const alive = living(defenders);
  if (alive.length === 0) return null;
  return alive.reduce((best, s) => (s.currentHull < best.currentHull ? s : best), alive[0]);
}

function applyDamage(
  target: CombatShip,
  raw: number,
  log: CombatEvent[],
  tick: number,
  attackerId: string,
  weaponId: string
): void {
  let remaining = raw;
  if (target.currentShield > 0) {
    const shieldAbsorb = Math.min(target.currentShield, remaining);
    target.currentShield -= shieldAbsorb;
    remaining -= shieldAbsorb;
    log.push({ tick, type: 'shield_hit', attackerId, targetId: target.instanceId, weaponId, damage: shieldAbsorb });
  }
  if (remaining > 0) {
    target.currentHull -= remaining;
    log.push({ tick, type: 'hull_hit', attackerId, targetId: target.instanceId, weaponId, damage: remaining });
    if (target.currentHull <= 0) {
      target.currentHull = 0;
      target.isDestroyed = true;
      log.push({ tick, type: 'ship_destroyed', attackerId, targetId: target.instanceId });
    }
  }
}

export interface CombatConfig {
  maxTicks: number;
  ticksPerSecond: number;
  seed: number;
}

export const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  maxTicks: 6000,
  ticksPerSecond: 20,
  seed: 42,
};

export function runCombat(
  friendlyFleet: ShipInstance[],
  enemyFleet: ShipInstance[],
  config: CombatConfig = DEFAULT_COMBAT_CONFIG,
): CombatState {
  const rng = seededRng(config.seed);
  const state: CombatState = {
    tick: 0,
    friendly: friendlyFleet.map(toCombatShip),
    enemy: enemyFleet.map(toCombatShip),
    log: [],
    outcome: 'ongoing',
  };

  while (state.tick < config.maxTicks && state.outcome === 'ongoing') {
    state.tick++;

    for (const ship of [...state.friendly, ...state.enemy]) {
      if (!ship.isDestroyed && ship.def.maxShield > 0) {
        const maxSh = effectiveMaxShield(ship);
        ship.currentShield = Math.min(maxSh, ship.currentShield + ship.def.shieldRegenPerTick);
      }
    }

    const processTeam = (attackers: CombatShip[], defenders: CombatShip[]) => {
      for (const attacker of living(attackers)) {
        for (let wi = 0; wi < attacker.def.weapons.length; wi++) {
          if (attacker.weaponCooldowns[wi] > 0) {
            attacker.weaponCooldowns[wi]--;
            continue;
          }
          const weapon = attacker.def.weapons[wi];
          const target = selectTarget(defenders);
          if (!target) continue;
          attacker.weaponCooldowns[wi] = weapon.cooldownTicks;
          const hit = rng() <= weapon.accuracy;
          if (!hit) {
            state.log.push({ tick: state.tick, type: 'miss', attackerId: attacker.instanceId, targetId: target.instanceId, weaponId: weapon.id });
            continue;
          }
          state.log.push({ tick: state.tick, type: 'shot', attackerId: attacker.instanceId, targetId: target.instanceId, weaponId: weapon.id, damage: weapon.damage });
          applyDamage(target, weapon.damage, state.log, state.tick, attacker.instanceId, weapon.id);
        }
      }
    };

    processTeam(state.friendly, state.enemy);
    processTeam(state.enemy, state.friendly);

    const friendlyAlive = living(state.friendly).length;
    const enemyAlive = living(state.enemy).length;
    if (friendlyAlive === 0 && enemyAlive === 0) state.outcome = 'draw';
    else if (enemyAlive === 0) state.outcome = 'friendly_victory';
    else if (friendlyAlive === 0) state.outcome = 'enemy_victory';
  }

  if (state.outcome === 'ongoing') state.outcome = 'draw';
  state.log.push({ tick: state.tick, type: 'battle_end', attackerId: '', note: state.outcome });
  return state;
}
