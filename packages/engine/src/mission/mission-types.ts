import type { ResourceBundle } from '../data/resources.js';

export type MissionStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'failed';

export interface EnemyWave {
  shipDefId: string;
  count: number;
}

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  sectorId: string;
  evidenceStatus: 'VERIFIED' | 'CORROBORATED' | 'INFERRED' | 'PLACEHOLDER';
  requiredPlayerLevel: number;
  requiredShipClasses: string[];
  enemyWaves: EnemyWave[];
  objectives: string[];
  rewards: ResourceBundle;
  prerequisites: string[];
  unlocks: string[];
}
