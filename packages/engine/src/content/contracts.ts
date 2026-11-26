// Stage-3 content contract (approved draft v1).
// ContentEnvelope is the canonical IR that every source adapter writes.
// It is consumed by the Stage-4 runtime loader, never by the sources.
// Source path: packages/engine/src/content/contracts.ts

export interface ProvenanceRecord {
  source: string;
  sourceId: string;
  sourcePath: string;
  recordId: string;
  recordHash: string; // sha256 of the source record content (raw JSON text)
}

export type MappingClassification = "DIRECT" | "TRANSFORMED" | "DERIVED" | "UNSUPPORTED" | "UNVERIFIED";

export type EntityType =
  | "model"
  | "item"
  | "building"
  | "planet"
  | "resource_node"
  | "weapon"
  | "npc"
  | "animation"
  | "effect";

export interface ContentEnvelope<TPayload = unknown> {
  schemaVersion: 1;
  entityId: string; // Redshift-native identity; never derived from source ids
  entityType: EntityType;
  displayName: string;
  provenance: ProvenanceRecord[];
  payload: TPayload;
}

export interface ItemPayload {
  sourceId: string;
  name: string;
  description: string;
  sprite: number | null;
  price: number | null;
  stackable: boolean;
  equip: string[];
  colour: string | null;
  special: boolean;
  untradeable: boolean;
  members: boolean;
}

export interface WallObjectPayload {
  sourceId: string;
  name: string;
  description: string;
  height: number | null;
  width: number | null;
  colourFront: number | null;
  colourBack: number | null;
  textureFront: number | null;
  textureBack: number | null;
  blocked: boolean;
  invisible: boolean;
  commands: string[];
  type: string | null;
}

export interface ObjectPayload {
  sourceId: string;
  name: string;
  description: string;
  height: number | null;
  itemHeight: number | null;
  width: number | null;
  type: string | null;
  model: string | null;
  assetReferences: string[];
}

export interface TileRecord {
  tileIndex: number;
  tx: number;
  tz: number;
  flags: number | null;
  height: number | null;
}

export interface PlanetPayload {
  sourceId: string;
  name: string;
  zone: { internalName: string; bounds: Array<{ plane: number; xStart: number; zStart: number; xEnd: number; zEnd: number }> } | null;
  tileCount: number;
  sampleTile: TileRecord | null;
}

export interface ResourceNodePayload {
  sourceId: string;
  name: string;
  source: "rsmv-upstream" | "openrsc-vinilla";
  notes: string[];
}

export interface ModelPayload {
  sourceId: string;
  name: string;
  fileFormat: string;
  sourceFormat: string;
  sourceRevision: string | null;
  coordinateSystem: string | null;
  unitScale: number | null;
  transform: Record<string, unknown>;
  geometry: {
    positions: number[] | null;
    normals: number[] | null;
    uvs: number[] | null;
    indices: number[] | null;
  };
  assetReferences: string[];
}

export const VALID_ENTITY_TYPES: readonly string[] = [
  "model", "item", "building", "planet", "resource_node", "weapon", "npc", "animation", "effect",
];

export const ENTITY_TYPE_MODEL: "model" = "model";
export const ENTITY_TYPE_ITEM: "item" = "item";
export const ENTITY_TYPE_BUILDING: "building" = "building";
export const ENTITY_TYPE_PLANET: "planet" = "planet";
export const ENTITY_TYPE_RESOURCE_NODE: "resource_node" = "resource_node";
export const ENTITY_TYPE_WEAPON: "weapon" = "weapon";
export const ENTITY_TYPE_NPC: "npc" = "npc";
export const ENTITY_TYPE_ANIMATION: "animation" = "animation";
export const ENTITY_TYPE_EFFECT: "effect" = "effect";

export function isValidEntityType(type: string): boolean {
  return VALID_ENTITY_TYPES.includes(type);
}
