// OpenRSC object/wall-object adapter — Stage 3, batch 1.
// Source: openrsc-vinilla/rsc-data/config/{wall-objects.json (214), objects.json (1,189)}.
//
// Wall objects and objects are imported as GEOMETRY (entityType "model") unless a
// verified mapping establishes a more specific identity. No Redshift game semantics
// (production, yields, respawn, combat) are derived from these sources.

import { ContentEnvelope, ProvenanceRecord, WallObjectPayload, ObjectPayload, ENTITY_TYPE_MODEL } from "../contracts.js";

export interface OpenRscObjectSource {
  name: string;
  description: string;
  commands: string[];
  height: number | null;
  itemHeight: number | null;
  width: number | null;
  type: string | null;
  model: string | null;
}

export interface WallObjectSource {
  name: string;
  description: string;
  commands: string[];
  height: number | null;
  colourFront: number | null;
  colourBack: number | null;
  textureFront: number | null;
  textureBack: number | null;
  blocked: boolean;
  invisible: boolean;
}

export interface WallObjectOptions {
  sourcePath: string;
  recordHash: string;
}

export function adaptWallObject(record: WallObjectSource, opts: WallObjectOptions, index: number): ContentEnvelope<WallObjectPayload> {
  const entityId = `wall-object:${index}`;
  const provenance: ProvenanceRecord = {
    source: "openrsc-vinilla",
    sourceId: record.name,
    sourcePath: opts.sourcePath,
    recordId: record.name,
    recordHash: opts.recordHash,
  };
  const payload: WallObjectPayload = {
    sourceId: record.name,
    name: record.name,
    description: record.description,
    height: record.height,
    width: null,
    colourFront: record.colourFront,
    colourBack: record.colourBack,
    textureFront: record.textureFront,
    textureBack: record.textureBack,
    blocked: record.blocked,
    invisible: record.invisible,
    commands: record.commands,
    type: "wall-object",
  };
  return { schemaVersion: 1, entityId, entityType: ENTITY_TYPE_MODEL, displayName: record.name, provenance: [provenance], payload };
}

export interface ObjectOptions {
  sourcePath: string;
  recordHash: string;
}

export function adaptOpenRscObject(record: OpenRscObjectSource, opts: ObjectOptions, index: number): ContentEnvelope<ObjectPayload> {
  const entityId = `object:${index}`;
  const provenance: ProvenanceRecord = {
    source: "openrsc-vinilla",
    sourceId: record.name,
    sourcePath: opts.sourcePath,
    recordId: record.name,
    recordHash: opts.recordHash,
  };
  const assetReferences: string[] = [];
  if (record.model) {
    assetReferences.push(record.model);
  }
  const payload: ObjectPayload = {
    sourceId: record.name,
    name: record.name,
    description: record.description,
    height: record.height,
    itemHeight: record.itemHeight,
    width: record.width,
    type: record.type,
    model: record.model,
    assetReferences,
  };
  return { schemaVersion: 1, entityId, entityType: ENTITY_TYPE_MODEL, displayName: record.name, provenance: [provenance], payload };
}
