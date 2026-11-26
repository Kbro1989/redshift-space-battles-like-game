// OpenRSC geometry adapter — Stage 3, batch 1.
// Source: rsmv-upstream/scripts/.pog2/sovereign/sovereign/public/models/kit_*.json (3 files,
// positions arrays present).
//
// Rule applied: geometry enters as entityType "model". A Redshift "ship" is only created
// when an independently verified mapping establishes identity + gameplay properties.
// No ship classification is inferred from these manifests.

import { ContentEnvelope, ProvenanceRecord, ModelPayload, ENTITY_TYPE_MODEL } from "../contracts.js";

export interface KitManifest {
  positions?: number[];
  normals?: number[];
  uvs?: number[];
  indices?: number[];
  metadata?: Record<string, unknown>;
}

export interface KitOptions {
  sourcePath: string;
  recordHash: string;
}

export function adaptKitManifest(manifest: KitManifest, opts: KitOptions, manifestName: string): ContentEnvelope<ModelPayload> {
  const positions = Array.isArray(manifest.positions) ? manifest.positions : null;
  const normals = Array.isArray(manifest.normals) ? manifest.normals : null;
  const uvs = Array.isArray(manifest.uvs) ? manifest.uvs : null;
  const indices = Array.isArray(manifest.indices) ? manifest.indices : null;

  const geometry: ModelPayload["geometry"] = {
    positions,
    normals,
    uvs,
    indices,
  };

  const missing = [];
  if (!positions) missing.push("positions");
  if (normals === null) missing.push("normals");
  if (uvs === null) missing.push("uvs");
  if (indices === null) missing.push("indices");

  const provenance: ProvenanceRecord = {
    source: "rsmv-upstream",
    sourceId: manifestName,
    sourcePath: opts.sourcePath,
    recordId: manifestName,
    recordHash: opts.recordHash,
  };

  const payload: ModelPayload = {
    sourceId: manifestName,
    name: `kit-model-${manifestName}`,
    fileFormat: "kit-json",
    sourceFormat: "kit-json",
    sourceRevision: null,
    coordinateSystem: null,
    unitScale: null,
    transform: {},
    geometry,
    assetReferences: [],
  };

  return {
    schemaVersion: 1,
    entityId: `model:${manifestName}`,
    entityType: ENTITY_TYPE_MODEL,
    displayName: payload.name,
    provenance: [provenance],
    payload,
  };
}
