// OpenRSC item adapter — Stage 3, batch 1.
// Source: openrsc-vinilla/rsc-data/config/items.json (1,313 records).
// Payload: item representation ONLY. No combat fields are derived from this source.
//
// Per-record ledger: source path, source record id (name), source sha256,
// record hash, mapping classification, transformation history, rejection reason.

import { ContentEnvelope, ProvenanceRecord, ItemPayload, ENTITY_TYPE_ITEM } from "../contracts.js";

export interface ItemSource {
  name: string;
  description: string;
  command: string;
  sprite: number | null;
  price: number | null;
  stackable: boolean;
  special: boolean;
  equip: string[];
  colour: string | null;
  untradeable: boolean;
  members: boolean;
}

export interface ItemOptions {
  sourcePath: string;
  recordHash: string;
}

export function adaptOpenRscItem(record: ItemSource, opts: ItemOptions): ContentEnvelope<ItemPayload> {
  const entityId = `item:${record.name}`;
  const provenance: ProvenanceRecord = {
    source: "openrsc-vinilla",
    sourceId: record.name,
    sourcePath: opts.sourcePath,
    recordId: record.name,
    recordHash: opts.recordHash,
  };

  const payload: ItemPayload = {
    sourceId: record.name,
    name: record.name,
    description: record.description,
    sprite: record.sprite,
    price: record.price,
    stackable: record.stackable,
    equip: record.equip,
    colour: record.colour,
    special: record.special,
    untradeable: record.untradeable,
    members: record.members,
  };

  return {
    schemaVersion: 1,
    entityId,
    entityType: ENTITY_TYPE_ITEM,
    displayName: record.name,
    provenance: [provenance],
    payload,
  };
}
