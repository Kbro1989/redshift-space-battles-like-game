# Stage 2.1 — End-to-End Verification Tests (bounded)

Audit date: 2026-11-19
Scope: exactly three tests — Animation, Spatial, Interaction. No synthetic records.
Status: Audit complete, 1 PASS, 2 NOT_TESTABLE. Stage 3 not yet authorized.

---

## Test 1 — Animation

**Status: NOT_TESTABLE — SOURCE DATA ABSENT**

**Source data audit (what exists):**
| Field | Value |
|---|---|
| Source path | `rsmv-upstream/src/opcodes/frames.json` (171 B, sha256 39a515c8fa3c9056) |
| Source path | `rsmv-upstream/src/opcodes/spotanims.json` (1,061 B, sha256 99f671b7bdb3b088) |
| Source path | `rsmv-upstream/src/opcodes/sequences.json` — **MISSING** |
| Source path | `rsmv-upstream/src/3d/anims/` — **EMPTY** (4,096 B directory) |
| Extracted frame data | **NONE.** No frame/sequence data array present anywhere in `extracted_layers/` |
| Extracted spotanim data | **NONE.** No spotanim dump present |

**Raw input**  
`frames.json` is a 171-byte struct schema: `header_always_2` (ubyte), `framemap_id` (ushort), `flags` (array ushort/ubyte), `animdata` (buffer bytesleft).  
`spotanims.json` is a 1,061-byte opcode table (0x01 model, 0x02 sequence, 0x04-0x0a scales/rotation/ambient/contrast, 0x28 replace_colors, 0x29 replace_materials). Neither is a data stream; both are decoder definitions.

**Structural validation** — PASS on the schema files (all fields typed, x-rsmv-type annotations consistent with other schemas).

**Semantic validation** — **NOT_TESTABLE**: no frame record or spot-animation record exists to decode. `sequences.json` is absent from `src/opcodes/`; no frame data array was found by exhaustive scan of `extracted_layers/`.

**Failure details / unresolved dependencies**  
- Missing `sequences.json` (required to decode a real sequence)  
- `src/3d/anims/` empty — no frame file storage on disk  
- Pointer: a real frame/sequence record must be extracted (from cache) before a decode test can run

---

## Test 2 — Spatial

**Status: PASS** (structural + semantic reconstruction on real data)

**Source paths**
| Field | Value |
|---|---|
| Source path | `extracted_layers/maptiles_more/maptiles-58_52.json` (2,318,908 B, sha256 d47e0ffc6ed5a6e2) |
| Source path | `extracted_layers/mapzones_test/mapzones-1.json` (1,329 B, sha256 c05b826ae5ae30a0) |
| Source path | `extracted_layers/maplocations_58_52/maplocations-58_52.json` (116 B, empty `locations` array) |
| Schema | `.schema-maptiles.json` (9,585 B, sha256 f47a1995f69e7556) |

**Structural validation** — PASS. All tiles carry `flags` (u8), `shape` (u8|null), `overlay` (u16|null), `underlay` (u8|null), `settings` (u8|null), `height` (u8) per `.schema-maptiles.json`. Zone records carry `internal_name`/`name`/`center` (coordgrid), `background` (rgb), `show`, `default_zoom`, and `bounds[]` with `plane` + `src{xstart,zstart,xend,zend}` per `.schema-mapzones.json`.

**Semantic validation** — PASS (reconstruction of one map square):
- Grid decoding: maptiles is a 128×128 grid (16,384 records = 128 × 128). Tile index `i` decodes to `tx = i % 128`, `tz = i // 128`.
- Sample tiles (all identical flag profile 15/0/112/164/1/scale 1): idx 0 → (0,0); idx 127 → (127,0); idx 128 → (0,1); idx 255 → (127,1); idx 4096 → (0,32); idx 8192 → (0,64); idx 16383 → (127,127).
- Blank tiles detected (flags=0, all fields null): idx 4096 and idx 8192 — real data, not a decoder artifact. Reconstructed height field present as `height: 1` on non-blank tiles.
- Zone reconstruction: `mapzones-1.json` = zanaris, `center` 40882464, `show: true`, `default_zoom: 100`; bounds plane 0 with `src{xstart,zstart,xend,zend}` = x 2368..2495, z 4352..4479. Coordinates, heights and spatial attributes reconstructable from the schema.
- `maplocations_58_52` locations array is empty (0 records) — no live location records in this dump.

**Raw input / output artifacts**
- Raw: 2,318,908-byte Maptiles JSONL-derived file; 1,329-byte Mapzones JSON.
- Output: reconstructed grid positions (16,384 → (tx,tz) pairs) + zone bounds reconstructed.

---

## Test 3 — Interaction (client script)

**Status: NOT_TESTABLE — SOURCE DATA ABSENT**

**What exists**
| Field | Value |
|---|---|
| Source path | `rsmv-upstream/src/clientscript/` (ast.ts 67,774 B, ast_nodes.ts 26,831 B, interpreter.ts 30,612 B, definitions.ts 29,320 B, callibrator.ts, jsonwriter.ts, util.ts) |
| Entry points | `index.ts` / `index.d.ts` export `compileClientScript`, `prepareClientScript`, `renderClientScript` — a real parser/interpreter path |
| Interface declarations | `generated/interfaces.d.ts` (3,631 B) |
| Logic config | `src/logic/SovereignVarbitBridge.ts` + `prifddinas_logic.json` (1,243,702 B) |
| Script records | **NONE.** `extracted_layers/clientscript/` contains only `.schema-clientscriptops.json` (no script source files). No `.cs2`/`.lua`/`.sc` files anywhere under `rsmv-upstream` |

**Structural validation** — PASS on the parser/interpreter implementation (ast, interpreter, definitions, jsonwriter all present as real TS files).

**Semantic validation** — **NOT_TESTABLE**: no client-script record exists to parse. `src/clientscript/index.ts` and `index.d.ts` declare `compileClientScript(source, code)` — the entry point requires a script source that is not present in the extraction artifacts.

**Failure details / unresolved dependencies**
- `extracted_layers/clientscript/` contains only the opcode schema file (`.schema-clientscriptops.json`); no compiled or source script records
- No `scripts/*.cs2` or `.lua` input anywhere in the repo
- Pointer: a real client-script record (or a decoder-managed script fetch) must be supplied before a parse-and-execute test can run

---

## Summary

| Test | Status | Evidence |
|---|---|---|
| Animation | NOT_TESTABLE — SOURCE DATA ABSENT | frames.json + spotanims.json are decoder definitions only; sequences.json absent; anims/ empty |
| Spatial | PASS | maptiles-58_52.json (16,384 tiles, 128×128); mapzones-1.json (zanaris) bounds decoded; height + coords reconstructable |
| Interaction | NOT_TESTABLE — SOURCE DATA ABSENT | parser/interpreter implemented but no client-script record exists on disk |

**Gate decision:** the animation and interaction tests cannot pass because their source data is absent — recorded as NOT_TESTABLE, not as failures. Spatial passes on real artifacts and is the only demonstrated extraction path entering Stage 3.
