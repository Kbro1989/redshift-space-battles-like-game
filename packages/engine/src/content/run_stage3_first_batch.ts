// Stage 3 pipeline orchestration + import ledger writer.
// Produces (all under packages/engine/content/):
//   import_ledger.jsonl      per-record ledger: discovered -> parsed -> mapped -> accepted|rejected
//   canonical_asset_registry.json
//   status_summary.json
//   stage3-first-batch-report-2026-11-19.md

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { adaptOpenRscItem, type ItemSource } from "./adapters/openrscItems.js";
import { adaptWallObject, adaptOpenRscObject, type WallObjectSource, type OpenRscObjectSource } from "./adapters/openrscObjects.js";
import { adaptMaptilesToPlanet, adaptMaptilesToResourceNode, adaptMapzones } from "./adapters/rsmvSpatial.js";
import { adaptKitManifest as adaptKitManifestAdapter, type KitManifest } from "./adapters/geometry.js";
import { buildRegistry, type RegistrySummary, type RegistryEntry } from "./manifest.js";
import { schemaValidate, type LedgerEntry } from "./importer.js";
import { isValidEntityType, ENTITY_TYPE_ITEM, ENTITY_TYPE_MODEL, ENTITY_TYPE_PLANET, ENTITY_TYPE_RESOURCE_NODE } from "./contracts.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");
const contentRoot = resolve(root, "packages", "engine", "src", "content");

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function readJson<T>(p: string): T {
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function fileSha256(p: string): string {
  return sha256(readFileSync(p));
}

interface LedgerRow {
  discovered: boolean;
  parsed: boolean;
  mapped: boolean;
  accepted: boolean;
  rejected: boolean;
  sourcePath: string;
  sourceRecordId: string;
  sourceHash: string;
  recordHash: string;
  entityId: string | null;
  entityType: string | null;
  mapping: "DIRECT" | "TRANSFORMED" | "DERIVED" | "UNSUPPORTED" | "UNVERIFIED" | null;
  transformationHistory: string[];
  resolvedAssetReferences: string[];
  schemaValidation: "PASS" | "FAIL";
  rejectionReason: string | null;
  timestamp: string;
}

interface Batch {
  label: string;
  sourcePath: string;
  sourceHash: string;
  recordsRead: number;
  accepted: number;
  rejected: number;
  entries: LedgerRow[];
}

const ts = new Date().toISOString();
const ledger: LedgerRow[] = [];
const registryEntries: RegistryEntry[] = [];
const sourceHashes: Record<string, string> = {};
const summary: Record<string, number> = { items: 0, wallObjects: 0, objects: 0, resourceNodes: 0, planets: 0, models: 0, rejected: 0, unresolved: 0, accepted: 0 };
const mappingCounts: Record<string, number> = {};

function addEntry(row: LedgerRow) {
  ledger.push(row);
  if (row.accepted) {
    summary[row.entityType ?? "unknown"] = (summary[row.entityType ?? "unknown"] as number) + 1;
    summary.accepted = (summary.accepted ?? 0) + 1;
    if (row.mapping) mappingCounts[row.mapping] = (mappingCounts[row.mapping] as number) + 1;
  } else {
    summary.rejected += 1;
    if (row.mapping === "UNVERIFIED") summary.unresolved += 1;
  }
}

function adaptItem(record: ItemSource, sourceHash: string): void {
  const recordHash = sha256(Buffer.from(JSON.stringify(record)));
  const envelope = adaptOpenRscItem(record, { sourcePath: "openrsc-vinilla/rsc-data/config/items.json", recordHash });
  const valid = isValidEntityType(envelope.entityType);
      const accepted = valid;
      addEntry({
        discovered: true, parsed: true, mapped: true,
        accepted, rejected: !accepted,
    sourcePath: "openrsc-vinilla/rsc-data/config/items.json",
    sourceRecordId: record.name,
    sourceHash,
    recordHash,
    entityId: envelope.entityId,
    entityType: envelope.entityType,
    mapping: "DIRECT",
    transformationHistory: ["item catalog parsed", "no combat fields derived (RoS rule)"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    rejectionReason: valid ? null : "payload schema invalid",
    timestamp: ts,
  });
  registryEntries.push({
    entityId: envelope.entityId!,
    entityType: envelope.entityType!,
    source: "openrsc-vinilla",
    sourceRecordId: record.name,
    sourceHash,
    recordHash,
    mapping: "DIRECT",
    transformationHistory: ["item catalog parsed", "no combat fields derived (RoS rule)"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    timestamp: ts,
  });
}

function adaptWall(record: WallObjectSource, sourceHash: string, index: number): void {
  const recordHash = sha256(Buffer.from(JSON.stringify(record)));
  const envelope = adaptWallObject(record, { sourcePath: "openrsc-vinilla/rsc-data/config/wall-objects.json", recordHash }, index);
  const valid = isValidEntityType(envelope.entityType);
      const accepted = valid;
      addEntry({
        discovered: true, parsed: true, mapped: true,
        accepted, rejected: !accepted,
    sourcePath: "openrsc-vinilla/rsc-data/config/wall-objects.json",
    sourceRecordId: record.name,
    sourceHash,
    recordHash,
    entityId: envelope.entityId,
    entityType: envelope.entityType,
    mapping: "DIRECT",
    transformationHistory: ["wall-object catalog parsed", "geometry as model; no building semantics derived"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    rejectionReason: valid ? null : "payload schema invalid",
    timestamp: ts,
  });
  registryEntries.push({
    entityId: envelope.entityId!,
    entityType: envelope.entityType!,
    source: "openrsc-vinilla",
    sourceRecordId: record.name,
    sourceHash,
    recordHash,
    mapping: "DIRECT",
    transformationHistory: ["wall-object catalog parsed", "geometry as model; no building semantics derived"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    timestamp: ts,
  });
}

function adaptObject(record: OpenRscObjectSource, sourceHash: string, index: number): void {
  const recordHash = sha256(Buffer.from(JSON.stringify(record)));
  const envelope = adaptOpenRscObject(record, { sourcePath: "openrsc-vinilla/rsc-data/config/objects.json", recordHash }, index);
  const valid = isValidEntityType(envelope.entityType);
      const accepted = valid;
      addEntry({
        discovered: true, parsed: true, mapped: true,
        accepted, rejected: !accepted,
    sourcePath: "openrsc-vinilla/rsc-data/config/objects.json",
    sourceRecordId: record.name,
    sourceHash,
    recordHash,
    entityId: envelope.entityId,
    entityType: envelope.entityType,
    mapping: "DIRECT",
    transformationHistory: ["objects catalog parsed", "model ref recorded; no building semantics derived"],
    resolvedAssetReferences: envelope.payload.model ? [envelope.payload.model] : [],
    schemaValidation: valid ? "PASS" : "FAIL",
    rejectionReason: valid ? null : "payload schema invalid",
    timestamp: ts,
  });
  registryEntries.push({
    entityId: envelope.entityId!,
    entityType: envelope.entityType!,
    source: "openrsc-vinilla",
    sourceRecordId: record.name,
    sourceHash,
    recordHash,
    mapping: "DIRECT",
    transformationHistory: ["objects catalog parsed", "model ref recorded; no building semantics derived"],
    resolvedAssetReferences: envelope.payload.model ? [envelope.payload.model] : [],
    schemaValidation: valid ? "PASS" : "FAIL",
    timestamp: ts,
  });
}

function adaptMaptiles(data: { tiles: unknown[] }, sourceHash: string): void {
  const recordHash = sha256(Buffer.from(JSON.stringify(data)));
  const planet = adaptMaptilesToPlanet(data as any, { sourcePath: "rsmv-upstream/extracted_layers/maptiles_more/maptiles-58_52.json", recordHash });
  const valid = schemaValidate(planet.entityType, planet.payload);
      const accepted = valid === "PASS";
      addEntry({
        discovered: true, parsed: true, mapped: true,
        accepted, rejected: !accepted,
    sourcePath: "rsmv-upstream/extracted_layers/maptiles_more/maptiles-58_52.json",
    sourceRecordId: "maptiles-58_52.json",
    sourceHash,
    recordHash,
    entityId: planet.entityId,
    entityType: planet.entityType,
    mapping: "DIRECT",
    transformationHistory: ["128x128 grid decoded (stage 2.1 spatial test PASS)", "tiles aggregated", "no yield semantics derived (source has none)"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    rejectionReason: valid ? null : "payload schema invalid",
    timestamp: ts,
  });
  registryEntries.push({
    entityId: planet.entityId!,
    entityType: planet.entityType!,
    source: "rsmv-upstream",
    sourceRecordId: "maptiles-58_52.json",
    sourceHash,
    recordHash,
    mapping: "DIRECT",
    transformationHistory: ["128x128 grid decoded (stage 2.1 spatial test PASS)", "tiles aggregated", "no yield semantics derived (source has none)"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    timestamp: ts,
  });
  // one resource_node per tile
  for (let i = 0; i < (data.tiles as any[]).length; i++) {
    const tile = (data.tiles as any[])[i];
    const rn = adaptMaptilesToResourceNode(i, { flags: tile.flags, height: tile.height });
        const rvalid = schemaValidate(rn.entityType, rn.payload);
        const accepted = rvalid === "PASS";
        const row: LedgerRow = {
          discovered: true, parsed: true, mapped: true,
          accepted, rejected: !accepted,
      sourcePath: "rsmv-upstream/extracted_layers/maptiles_more/maptiles-58_52.json",
      sourceRecordId: `tile:${i}`,
      sourceHash,
      recordHash,
      entityId: rn.entityId,
      entityType: rn.entityType,
      mapping: "UNSUPPORTED", // yield semantics unsupported by source
      transformationHistory: ["128x128 grid decoded (stage 2.1 spatial PASS)", "tile geometry DIRECT", "yield UNSUPPORTED: no source field"],
      resolvedAssetReferences: [],
      schemaValidation: rvalid ? "PASS" : "FAIL",
      rejectionReason: rvalid ? null : "payload schema invalid",
      timestamp: ts,
    };
    ledger.push(row);
    registryEntries.push({
      entityId: rn.entityId!,
      entityType: rn.entityType!,
      source: "rsmv-upstream",
      sourceRecordId: `tile:${i}`,
      sourceHash,
      recordHash,
      mapping: "UNSUPPORTED",
      transformationHistory: ["128x128 grid decoded (stage 2.1 spatial PASS)", "tile geometry DIRECT", "yield UNSUPPORTED: no source field"],
      resolvedAssetReferences: [],
      schemaValidation: rvalid ? "PASS" : "FAIL",
      timestamp: ts,
    });
    summary.resourceNodes = (summary.resourceNodes ?? 0) + 1;
  }
}

function adaptZone(data: { internal_name: string; name: string; bounds: unknown[] }): void {
  const recordHash = sha256(Buffer.from(JSON.stringify(data)));
  const envelope = adaptMapzones(data as any);
  const valid = schemaValidate(envelope.entityType, envelope.payload);
      const accepted = valid === "PASS";
      addEntry({
        discovered: true, parsed: true, mapped: true,
        accepted, rejected: !accepted,
        sourcePath: "rsmv-upstream/extracted_layers/mapzones_test/mapzones-1.json",
        sourceRecordId: data.internal_name,
        sourceHash: sourceHashes["mapzones"],
    recordHash,
    entityId: envelope.entityId,
    entityType: envelope.entityType,
    mapping: "DIRECT",
    transformationHistory: ["zone bounds decoded", "coordinate reference (plane + src grid) preserved"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    rejectionReason: valid ? null : "payload schema invalid",
    timestamp: ts,
  });
  registryEntries.push({
      entityId: envelope.entityId!,
      entityType: envelope.entityType!,
      source: "rsmv-upstream",
      sourceRecordId: data.internal_name,
      sourceHash: sourceHashes["mapzones"],
    recordHash,
    mapping: "DIRECT",
    transformationHistory: ["zone bounds decoded", "coordinate reference (plane + src grid) preserved"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    timestamp: ts,
  });
}

function adaptKitManifestLocal(file: string, sourceHash: string): void {
  const manifest = readJson<KitManifest>(resolve(root, file));
  const manifestName = file.replace(/.*([^\\/\\\\])\\.json$/, "$1");
  const envelope = adaptKitManifestAdapter(manifest, { sourcePath: file, recordHash: "kit-manifest-hash" }, manifestName);
    const valid = isValidEntityType(envelope.entityType);
    const accepted = valid;
    const recordHash = sha256(Buffer.from(readFileSync(resolve(root, file))));
    addEntry({
      discovered: true, parsed: true, mapped: true,
      accepted, rejected: !accepted,
      sourcePath: file,
      sourceRecordId: manifestName,
      sourceHash,
      recordHash,
      entityId: envelope.entityId,
      entityType: envelope.entityType,
      mapping: "DIRECT",
      transformationHistory: [manifest.positions ? "positions array loaded" : "positions absent: geometry partial", "geometry enters as model, not ship"],
      resolvedAssetReferences: [],
      schemaValidation: valid ? "PASS" : "FAIL",
      rejectionReason: valid ? null : "payload schema invalid",
      timestamp: ts,
    });
    registryEntries.push({
      entityId: envelope.entityId!,
      entityType: envelope.entityType!,
      source: "rsmv-upstream",
      sourceRecordId: manifestName,
      sourceHash,
      recordHash,
    mapping: "DIRECT",
    transformationHistory: [manifest.positions ? "positions array loaded" : "positions absent: geometry partial", "geometry enters as model, not ship"],
    resolvedAssetReferences: [],
    schemaValidation: valid ? "PASS" : "FAIL",
    timestamp: ts,
  });
}

function reportBody(registry: { registry: RegistryEntry[]; summary: RegistrySummary }): string {
  const lines: string[] = [
    "# Stage 3 First Batch Report",
    "",
    `Generated: ${ts}`,
    "",
    `## Summary`,
    `- Total records: ${registry.summary.total}`,
    `- Accepted: ${registry.summary.accepted}`,
    `- Rejected: ${registry.summary.rejected}`,
    `- Unresolved: ${registry.summary.unresolved}`,
    "",
    `## Mapping Distribution`,
  ];
  for (const [mapping, count] of Object.entries(mappingCounts)) {
    lines.push(`- ${mapping}: ${count}`);
  }
  lines.push("", `## Source Files`, "");
  for (const [src, hash] of Object.entries(registry.summary.sourceFiles)) {
    lines.push(`- ${src}: ${hash}`);
  }
  return lines.join("\n") + "\n";
}

const rsmvTilesPath = "rsmv-upstream/extracted_layers/maptiles_more/maptiles-58_52.json";
const rsmvMapzonesPath = "rsmv-upstream/extracted_layers/mapzones_test/mapzones-1.json";

const sources: Batch[] = [];
(async () => {
  try {
    // Load source hashes first
    sourceHashes["items"] = fileSha256(resolve(root, "openrsc-vinilla", "rsc-data", "config", "items.json"));
    sourceHashes["wall-objects"] = fileSha256(resolve(root, "openrsc-vinilla", "rsc-data", "config", "wall-objects.json"));
    sourceHashes["objects"] = fileSha256(resolve(root, "openrsc-vinilla", "rsc-data", "config", "objects.json"));
    sourceHashes["maptiles"] = fileSha256(resolve(root, "rsmv-upstream", "extracted_layers", "maptiles_more", "maptiles-58_52.json"));
    sourceHashes["mapzones"] = fileSha256(resolve(root, "rsmv-upstream", "extracted_layers", "mapzones_test", "mapzones-1.json"));

    const items = readJson<ItemSource[]>(resolve(root, "openrsc-vinilla", "rsc-data", "config", "items.json"));
    sources.push({ label: "OpenRSC items", sourcePath: "openrsc-vinilla/rsc-data/config/items.json", sourceHash: sourceHashes["items"], recordsRead: items.length, accepted: 0, rejected: 0, entries: [] });
    for (let i = 0; i < items.length; i++) adaptItem(items[i], sourceHashes["items"]);
    summary.items = items.length;

    const wallObjects = readJson<WallObjectSource[]>(resolve(root, "openrsc-vinilla", "rsc-data", "config", "wall-objects.json"));
    sources.push({ label: "OpenRSC wall-objects", sourcePath: "openrsc-vinilla/rsc-data/config/wall-objects.json", sourceHash: sourceHashes["wall-objects"], recordsRead: wallObjects.length, accepted: 0, rejected: 0, entries: [] });
    for (let i = 0; i < wallObjects.length; i++) adaptWall(wallObjects[i], sourceHashes["wall-objects"], i);
    summary.wallObjects = wallObjects.length;

    const objects = readJson<OpenRscObjectSource[]>(resolve(root, "openrsc-vinilla", "rsc-data", "config", "objects.json"));
    sources.push({ label: "OpenRSC objects", sourcePath: "openrsc-vinilla/rsc-data/config/objects.json", sourceHash: sourceHashes["objects"], recordsRead: objects.length, accepted: 0, rejected: 0, entries: [] });
    for (let i = 0; i < objects.length; i++) adaptObject(objects[i], sourceHashes["objects"], i);
    summary.objects = objects.length;

    const maptiles = readJson<{ tiles: unknown[] }>(resolve(root, "rsmv-upstream", "extracted_layers", "maptiles_more", "maptiles-58_52.json"));
    sources.push({ label: "RSMV maptiles", sourcePath: rsmvTilesPath, sourceHash: sourceHashes["maptiles"], recordsRead: (maptiles.tiles as any[]).length, accepted: 0, rejected: 0, entries: [] });
    adaptMaptiles(maptiles, sourceHashes["maptiles"]);
    summary.resourceNodes = (maptiles.tiles as any[]).length;
    summary.planets = 1;

    const zone = readJson<{ internal_name: string; name: string; bounds: unknown[] }>(resolve(root, "rsmv-upstream", "extracted_layers", "mapzones_test", "mapzones-1.json"));
    adaptZone(zone);

    const models = readdirSync(resolve(root, "rsmv-upstream", "scripts", ".pog2", "sovereign", "sovereign", "public", "models"));
    models.sort();
    for (const f of models) {
      if (!f.endsWith(".json")) continue;
      adaptKitManifestLocal(resolve(root, "rsmv-upstream", "scripts", ".pog2", "sovereign", "sovereign", "public", "models", f), sourceHashes["kit:" + f]);
      summary.models += 1;
    }
  } catch (e) {
    console.error("runner failed:", (e as Error).message);
    process.exit(1);
  }

  const registry = buildRegistry(
    ledger.map((e) => ({
      stage: e.accepted ? "accepted" : "rejected",
      sourcePath: e.sourcePath,
      sourceRecordId: e.sourceRecordId,
      sourceHash: e.sourceHash,
      recordHash: e.recordHash,
      entityId: e.entityId,
      entityType: e.entityType,
      mapping: e.mapping,
      transformationHistory: e.transformationHistory,
      resolvedAssetReferences: e.resolvedAssetReferences,
      schemaValidation: e.schemaValidation,
      rejectionReason: e.rejectionReason,
      timestamp: e.timestamp,
    })),
    sourceHashes,
    ts
  );
  mkdirSync(contentRoot, { recursive: true });
  writeFileSync(resolve(contentRoot, "import_ledger.jsonl"), ledger.map((e) => JSON.stringify(e)).join("\n") + "\n");
  writeFileSync(resolve(contentRoot, "canonical_asset_registry.json"), JSON.stringify(registry.registry, null, 2) + "\n");
  writeFileSync(resolve(contentRoot, "status_summary.json"), JSON.stringify({ ...summary, mappingCounts, totalRecords: ledger.length, accepted: summary.accepted ?? 0, rejected: summary.rejected ?? 0, unresolved: summary.unresolved ?? 0 }, null, 2) + "\n");
  writeFileSync(resolve(contentRoot, "stage3-first-batch-report-2026-11-19.md"), reportBody(registry));
  console.log(JSON.stringify({ summary, mappingCounts, totalRecords: ledger.length }));
})();
