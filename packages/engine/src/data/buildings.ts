import type { ResourceBundle } from './resources.js';

export interface BuildingDef {
  id: string;
  label: string;
  description: string;
  evidenceStatus: 'VERIFIED' | 'CORROBORATED' | 'INFERRED' | 'PLACEHOLDER';
  maxLevel: number;
  levelCosts: ResourceBundle[];
  productionPerTick: Partial<Record<string, number>>[];
  prerequisites: string[];
  constructionTimeSec: number[];
}

export const BUILDING_REGISTRY: Record<string, BuildingDef> = {
  command_dome: {
    id: 'command_dome',
    label: 'Pressurized Command Dome',
    description: 'Frontier world planetary settlement headquarters and colony telemetry station.',
    evidenceStatus: 'CORROBORATED',
    maxLevel: 10,
    prerequisites: [],
    levelCosts: [
      { credits: 300, metal: 150 },
      { credits: 600, metal: 300, crystal: 100 },
      { credits: 1200, metal: 600, crystal: 250, helium3: 100 },
    ],
    productionPerTick: [{}, {}, {}],
    constructionTimeSec: [60, 180, 360],
  },
  helium_drill: {
    id: 'helium_drill',
    label: 'Helium-3 Extractor Rig',
    description: 'Sub-surface geothermal drill harvesting power cells and helium isotopes.',
    evidenceStatus: 'CORROBORATED',
    maxLevel: 10,
    prerequisites: ['command_dome'],
    levelCosts: [
      { credits: 350, metal: 180 },
      { credits: 700, metal: 360, helium3: 50 },
      { credits: 1400, metal: 720, helium3: 150 },
    ],
    productionPerTick: [{ helium3: 1 }, { helium3: 2.5 }, { helium3: 5 }],
    constructionTimeSec: [45, 120, 240],
  },
  metal_extractor: {
    id: 'metal_extractor',
    label: 'Deep-Core Metal Extractor',
    description: 'Automated planetary crust refinery generating structural construction metals.',
    evidenceStatus: 'CORROBORATED',
    maxLevel: 10,
    prerequisites: ['command_dome'],
    levelCosts: [
      { credits: 300, metal: 140 },
      { credits: 650, metal: 300, crystal: 50 },
      { credits: 1300, metal: 650, crystal: 120 },
    ],
    productionPerTick: [{ metal: 2 }, { metal: 5 }, { metal: 10 }],
    constructionTimeSec: [30, 90, 180],
  },
  surface_turret: {
    id: 'surface_turret',
    label: 'Surface Defense Flak Cannon',
    description: 'Planetary point-defense kinetic network protecting colony airspace from raiders.',
    evidenceStatus: 'CORROBORATED',
    maxLevel: 10,
    prerequisites: ['command_dome', 'metal_extractor'],
    levelCosts: [
      { credits: 400, metal: 220, crystal: 60 },
      { credits: 850, metal: 450, crystal: 150 },
    ],
    productionPerTick: [{}, {}],
    constructionTimeSec: [60, 150],
  },
  nanite_repair_bay: {
    id: 'nanite_repair_bay',
    label: 'Nanite Repair Bay',
    description: 'Automated drydock facility restoring fleet hull and barrier integrity.',
    evidenceStatus: 'CORROBORATED',
    maxLevel: 10,
    prerequisites: ['command_dome'],
    levelCosts: [{ credits: 450, metal: 200, crystal: 80 }],
    productionPerTick: [{}],
    constructionTimeSec: [90],
  },
};
