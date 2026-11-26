import type { ShipDef } from '../data/ships.js';

export interface ShipInstance {
  instanceId: string;
  defId: string;
  def: ShipDef;
  upgradeLevel: number;
  currentHull: number;
  currentShield: number;
  assignedCrewIds: string[];
  equipmentIds: string[];
  isDestroyed: boolean;
}

export function createShipInstance(def: ShipDef, instanceId: string): ShipInstance {
  return {
    instanceId,
    defId: def.id,
    def,
    upgradeLevel: 1,
    currentHull: def.maxHull,
    currentShield: def.maxShield,
    assignedCrewIds: [],
    equipmentIds: [],
    isDestroyed: false,
  };
}

export function effectiveMaxHull(ship: ShipInstance): number {
  return Math.floor(ship.def.maxHull * (1 + (ship.upgradeLevel - 1) * 0.1));
}

export function effectiveMaxShield(ship: ShipInstance): number {
  return Math.floor(ship.def.maxShield * (1 + (ship.upgradeLevel - 1) * 0.08));
}
