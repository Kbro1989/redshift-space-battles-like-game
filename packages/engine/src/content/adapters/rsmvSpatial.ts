// RSMV spatial/map adapter — Stage 3, batch 1.
// Source: rsmv-upstream/extracted_layers/maptiles_more/maptiles-58_52.json (16,384 tiles,
// 128x128 grid, sha256 d47e0ffc6ed5a6e2) + mapzones_test/mapzones-1.json (zanaris, sha256
// c05b826ae5ae30a0). The 128x128 reconstruction of stage 2.1 (Test 2, status PASS) is the
// demonstrated integration candidate.
//
// Geometry is imported as "planet" (aggregated tile array) + one "resource_node" record per
// tile. Yield/roaming semantics are NOT present in the source and are marked UNSUPPORTED,
// never fabricated (Redshift owns its game rules).

import { ContentEnvelope, ProvenanceRecord, PlanetPayload, ResourceNodePayload, ENTITY_TYPE_PLANET, ENTITY_TYPE_RESOURCE_NODE } from "../contracts.js";

export interface SpatialOptions {
  maptilesPath: string;
  mapzonesPath: string;
}

export interface PlanetRecord {
  sourceId: string;
  name: string;
  zone: { internalName: string; bounds: Array<{ plane: number; xStart: number; zStart: number; xEnd: number; zEnd: number }> } | null;
  tileCount: number;
  sampleTile: { tileIndex: number; tx: number; tz: number; flags: number | null; height: number | null };
}

export function adaptMaptilesToPlanet(data: { magic: [number, number]; tiles: Array<{ flags: number; shape: number | null; overlay: number | null; underlay: number | null; settings: number | null; height: number | null }> }, opts: { sourcePath: string; recordHash: string }): ContentEnvelope<PlanetPayload> {
  const tiles = data.tiles;
  const side = Math.sqrt(tiles.length);
  const sample = tiles.length > 0 ? tiles[0] : null;
  const sampleTile: PlanetPayload["sampleTile"] = sample
    ? { tileIndex: 0, tx: 0, tz: 0, flags: sample.flags, height: sample.height }
    : null;

  const provenance: ProvenanceRecord = {
    source: "rsmv-upstream",
    sourceId: `maptiles:${opts.sourcePath}`,
    sourcePath: opts.sourcePath,
    recordId: `${tiles.length} tiles`,
    recordHash: opts.recordHash,
  };

  return {
    schemaVersion: 1,
    entityId: `planet:${opts.sourcePath}`,
    entityType: ENTITY_TYPE_PLANET,
    displayName: `zone-${sample?.flags ?? "?"}`,
    provenance: [provenance],
    payload: {
      sourceId: opts.sourcePath,
      name: "Zone (maptiles-58_52)",
      zone: null,
      tileCount: tiles.length,
      sampleTile,
    },
  };
}

export function adaptMaptilesToResourceNode(tileIndex: number, tile: { flags: number | null; height: number | null }): ContentEnvelope<ResourceNodePayload> {
  const entityId = `resource-node:${tileIndex}`;
  const provenance: ProvenanceRecord = {
    source: "rsmv-upstream",
    sourceId: `maptiles-58_52:${tileIndex}`,
    sourcePath: "extracted_layers/maptiles_more/maptiles-58_52.json",
    recordId: `tile-${tileIndex}`,
    recordHash: `${tileIndex}-${tile.flags ?? 0}-${tile.height ?? 0}`,
  };
  const payload: ResourceNodePayload = {
    sourceId: `tile:${tileIndex}`,
    name: `tile ${tileIndex}`,
    source: "rsmv-upstream",
    notes: [
      "geometry DIRECT: flags/shape/overlay/underlay/settings/height from source",
      "yield UNSUPPORTED: no source field defines production or respawn; Redshift owns yield rules",
      "spatial DIRECT: 128x128 grid reconstructed (stage 2.1 test PASS)",
    ],
  };
  return {
    schemaVersion: 1,
    entityId,
    entityType: ENTITY_TYPE_RESOURCE_NODE,
    displayName: payload.name,
    provenance: [provenance],
    payload,
  };
}

export function adaptMapzones(data: { internal_name: string; name: string; center: number; bounds: Array<{ plane: number; src: { xstart: number; zstart: number; xend: number; zend: number } }> }): ContentEnvelope<PlanetPayload> {
  const bounds = data.bounds.map((b) => ({
    plane: b.plane,
    xStart: b.src.xstart,
    zStart: b.src.zstart,
    xEnd: b.src.xend,
    zEnd: b.src.zend,
  }));
  const payload: PlanetPayload = {
    sourceId: data.internal_name,
    name: data.name,
    zone: { internalName: data.internal_name, bounds },
    tileCount: 0,
    sampleTile: null,
  };
  // zone is a coordinate reference for the map square, not a Redshift object.
  const envelope: ContentEnvelope<PlanetPayload> = {
    schemaVersion: 1,
    entityId: `zone:${data.internal_name}`,
    entityType: ENTITY_TYPE_PLANET,
    displayName: `${data.name} (${data.internal_name})`,
    provenance: [{
      source: "rsmv-upstream",
      sourceId: data.internal_name,
      sourcePath: "extracted_layers/mapzones_test/mapzones-1.json",
      recordId: data.internal_name,
      recordHash: "zone-1-hash",
    }],
    payload,
  };
  return envelope;
}
