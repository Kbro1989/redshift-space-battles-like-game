// Stage 3 canonical asset registry builder.
// Produces content/canonical_asset_registry.json + content/status_summary.json.

import { ContentEnvelope } from "./contracts.js";
import type { LedgerEntry } from "./importer.js";
import { createHash } from "node:crypto";

export interface RegistryEntry {
  entityId: string;
  entityType: string;
  source: string;
  sourceRecordId: string;
  sourceHash: string;
  recordHash: string;
  mapping: import("./contracts.js").MappingClassification;
  transformationHistory: string[];
  resolvedAssetReferences: string[];
  schemaValidation: "PASS" | "FAIL";
  timestamp: string;
}

export interface RegistrySummary {
  total: number;
  accepted: number;
  rejected: number;
  unresolved: number;
  sourceFiles: Record<string, string>;
  registrySha256: string;
  writtenAt: string;
}

export function buildRegistry(entries: LedgerEntry[], sourceHashes: Record<string, string>, timestamp: string): { registry: RegistryEntry[]; summary: RegistrySummary } {
  const registry: RegistryEntry[] = entries.map((e) => ({
    entityId: e.entityId!,
    entityType: e.entityType!,
    source: e.sourcePath.split(/[\\/]/).pop() || e.sourcePath,
    sourceRecordId: e.sourceRecordId,
    sourceHash: e.sourceHash,
    recordHash: e.recordHash,
    mapping: e.mapping!,
    transformationHistory: e.transformationHistory,
    resolvedAssetReferences: e.resolvedAssetReferences,
    schemaValidation: e.schemaValidation,
    timestamp,
  }));

  const accepted = registry.filter((r) => r.schemaValidation === "PASS").length;
  const rejected = registry.filter((r) => r.schemaValidation === "FAIL").length;
  const unresolved = registry.filter((r) => r.mapping === "UNVERIFIED").length;

  const registrySha256 = createHash("sha256").update(JSON.stringify(registry)).digest("hex");

  return {
    registry,
    summary: {
      total: registry.length,
      accepted,
      rejected,
      unresolved,
      sourceFiles: sourceHashes,
      registrySha256,
      writtenAt: timestamp,
    },
  };
}
