import type { ResourceBundle } from './resources.js';

export type ShipClass = 'fighter' | 'frigate' | 'cruiser' | 'destroyer' | 'capital';
export type Faction = 'player' | 'galactic_union' | 'ngf_pirates' | 'neutral';
export type EvidenceStatus = 'VERIFIED' | 'CORROBORATED' | 'INFERRED' | 'PLACEHOLDER';

export interface WeaponConfig {
  id: string;
  label: string;
  damage: number;
  cooldownTicks: number;
  accuracy: number;
}

export interface ShipDef {
  id: string;
  label: string;
  shipClass: ShipClass;
  faction: Faction;
  evidenceStatus: EvidenceStatus;
  maxHull: number;
  maxShield: number;
  shieldRegenPerTick: number;
  weapons: WeaponConfig[];
  constructionCost: ResourceBundle;
  unlockLevel: number;
  isCapital: boolean;
}

/**
 * Ship registry — STATUS: PLACEHOLDER throughout.
 * Ship names and classes are INFERRED from genre conventions and available descriptions.
 */
export const SHIP_REGISTRY: Record<string, ShipDef> = {
  fighter: {
    id: 'fighter',
    label: 'Viper Fighter',
    shipClass: 'fighter',
    faction: 'player',
    evidenceStatus: 'CORROBORATED',
    maxHull: 100,
    maxShield: 50,
    shieldRegenPerTick: 0.5,
    weapons: [
      { id: 'light_laser', label: 'Light Pulse Laser', damage: 20, cooldownTicks: 15, accuracy: 0.85 },
    ],
    constructionCost: { credits: 200, metal: 100 },
    unlockLevel: 1,
    isCapital: false,
  },
  interceptor: {
    id: 'interceptor',
    label: 'Raptor Interceptor',
    shipClass: 'fighter',
    faction: 'player',
    evidenceStatus: 'CORROBORATED',
    maxHull: 80,
    maxShield: 40,
    shieldRegenPerTick: 0.8,
    weapons: [
      { id: 'missile_battery', label: 'Micro-Missile Rack', damage: 35, cooldownTicks: 20, accuracy: 0.80 },
    ],
    constructionCost: { credits: 350, metal: 150, crystal: 50 },
    unlockLevel: 2,
    isCapital: false,
  },
  cruiser: {
    id: 'cruiser',
    label: 'Titan Cruiser',
    shipClass: 'cruiser',
    faction: 'player',
    evidenceStatus: 'CORROBORATED',
    maxHull: 280,
    maxShield: 140,
    shieldRegenPerTick: 1.2,
    weapons: [
      { id: 'dual_cannon', label: 'Heavy Dual Turrets', damage: 55, cooldownTicks: 25, accuracy: 0.80 },
    ],
    constructionCost: { credits: 600, metal: 300, crystal: 120, helium3: 50 },
    unlockLevel: 4,
    isCapital: false,
  },
  battlecruiser: {
    id: 'battlecruiser',
    label: 'Union Battlecruiser',
    shipClass: 'capital',
    faction: 'player',
    evidenceStatus: 'CORROBORATED',
    maxHull: 460,
    maxShield: 220,
    shieldRegenPerTick: 2.0,
    weapons: [
      { id: 'artillery_barbettes', label: 'Dual Barbette Artillery', damage: 85, cooldownTicks: 30, accuracy: 0.82 },
    ],
    constructionCost: { credits: 950, metal: 500, crystal: 250, helium3: 120 },
    unlockLevel: 6,
    isCapital: true,
  },
  battleship: {
    id: 'battleship',
    label: 'Dreadnought Flagship',
    shipClass: 'capital',
    faction: 'player',
    evidenceStatus: 'CORROBORATED',
    maxHull: 650,
    maxShield: 320,
    shieldRegenPerTick: 3.0,
    weapons: [
      { id: 'super_heavy_battery', label: 'Triple Super-Heavy Battery', damage: 120, cooldownTicks: 45, accuracy: 0.85 },
    ],
    constructionCost: { credits: 1400, metal: 750, crystal: 380, helium3: 200 },
    unlockLevel: 10,
    isCapital: true,
  },
  ngf_raider: {
    id: 'ngf_raider',
    label: 'NGF Raider',
    shipClass: 'fighter',
    faction: 'ngf_pirates',
    evidenceStatus: 'CORROBORATED',
    maxHull: 90,
    maxShield: 30,
    shieldRegenPerTick: 0.2,
    weapons: [
      { id: 'scatter_gun', label: 'Pirate Scatter Cannon', damage: 18, cooldownTicks: 18, accuracy: 0.72 },
    ],
    constructionCost: {},
    unlockLevel: 0,
    isCapital: false,
  },
  galactic_union_patrol: {
    id: 'galactic_union_patrol',
    label: 'Union Patrol Cruiser',
    shipClass: 'cruiser',
    faction: 'galactic_union',
    evidenceStatus: 'CORROBORATED',
    maxHull: 240,
    maxShield: 120,
    shieldRegenPerTick: 1.0,
    weapons: [
      { id: 'union_cannon', label: 'Union Patrol Beams', damage: 45, cooldownTicks: 24, accuracy: 0.82 },
    ],
    constructionCost: {},
    unlockLevel: 0,
    isCapital: false,
  },
};
