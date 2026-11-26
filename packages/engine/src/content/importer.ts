// Stage 3 import pipeline — extraction (read source) -> adaptation (adapters) -> load
// (validate against the approved contract). No source data is written to disk by this module;
// only the runner writes the ledger/manifest artifacts.

import type { MappingClassification } from "./contracts.js";
import type { ItemSource } from "./adapters/openrscItems.js";
import type { WallObjectSource, OpenRscObjectSource } from "./adapters/openrscObjects.js";
import type { KitManifest } from "./adapters/geometry.js";
import type { PlanetPayload } from "./contracts.js";

export type ImportStage = "discovered" | "parsed" | "mapped" | "accepted" | "rejected";

export interface LedgerEntry {
  stage: ImportStage;
  sourcePath: string;
  sourceRecordId: string;
  sourceHash: string; // sha256 of the source FILE
  recordHash: string; // sha256 of the source record content
  entityId: string | null;
  entityType: string | null;
  mapping: MappingClassification | null;
  transformationHistory: string[];
  resolvedAssetReferences: string[];
  schemaValidation: "PASS" | "FAIL";
  rejectionReason: string | null;
  timestamp: string;
}

export interface ImportResult {
  source: string;
  accepted: number;
  rejected: number;
  unresolved: number;
  entries: LedgerEntry[];
}

export interface ImportBatch {
  label: string;
  sourcePath: string;
  records: unknown[];
  sourceHash: string;
}

export interface BatchResult {
  label: string;
  accepted: number;
  rejected: number;
  unresolved: number;
  entries: LedgerEntry[];
}

export function makeTimestamp(): string {
  // replaced by the runner with a real ISO timestamp at runtime
  return "2026-11-19T00:00:00.000Z";
}

export function isSchemaValid(entityType: string, payload: unknown): boolean {
  if (typeof entityType !== "string" || !VALID_ENTITY_TYPES.includes(entityType as (typeof VALID_ENTITY_TYPES)[number])) return false;
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return false;
  return true;
}

const VALID_ENTITY_TYPES = [
  "model", "item", "building", "planet", "resource_node", "weapon", "npc", "animation", "effect",
] as const;

export function schemaValidate(entityType: string, payload: unknown): "PASS" | "FAIL" {
  if (typeof entityType !== "string") return "FAIL";
  if (!VALID_ENTITY_TYPES.includes(entityType as (typeof VALID_ENTITY_TYPES)[number])) return "FAIL";
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) return "FAIL";
  return "PASS";
}
