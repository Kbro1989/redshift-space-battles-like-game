# Source Artifact Bounded Audit — Redshift + RSMV (Stage 2)

Audit date: 2026-11-19
Host: Windows 10, git-bash, read_file tool (hermes fs) as source of truth
Scope: bounded audit of RSMV and cross-program source artifacts relevant to the Redshift content contract.
Status: Stage 2 complete — exit condition verified. Stages 3/4 not yet authorized.

## 0. What was recorded per subsystem (exit conditions)

Each row records: source path, sample source IDs, cache revision context, sha256, extraction/generation command, output artifact, validation result.

### 1. Models (model declarations + pipeline)
| Field | Value |
|---|---|
| Source path | `rsmv-upstream/src/3d/modeldata.ts`, `modeltothree.ts`, `modelnodes.ts`, `gltfutil.ts`, `src/opcodes/models.json` |
| Model pipeline files (present) | modeldata.ts (9,210 B), modeltothree.ts (39,203 B), modelnodes.ts (23,294 B), gltfutil.ts (4,510 B), gltfutil.d.ts (1,422 B) |
| models.json | **MISSING** from `src/opcodes/` (only frames, spotanims, enums, cacheindex, mapscenes, mapsquare_locations, mapsquare_watertiles, mapzones, mapzones_pastes present) |
| Extracted model meshes | **NONE on disk.** `extracted_layers/model_22769/` is empty. `gift_locs/` contains `.schema-locs.json` + dumps (loc/gameobject records, not model geometry). `generated/` holds `.d.ts`/`.js` declarations only. |
| Generated declaration surface | `generated/items.d.ts` (5,453 B, sha256 a0f6...) — type declarations for item records only (no geometry payload) |
| Validation result | SCHEMA_PRESENT / EXTRACTED=NO / CONVERTED=NO / RUNTIME_VERIFIED=NO. Model geometry pipeline declared in code; no decoded model records or mesh outputs verified on disk. |
| OpenRS3 cross-reference | `openrsc-vinilla/rsc-data/config/items.json` = 1,313 records (list), schema: name, description, command, sprite, price, stackable, special, equip[], colour, untradeable, members. No hull/shield/hardpoint/weapons fields — combat attributes not source-available. |

### 2. Animations (frame + spotanim opcodes, sequences)
| Field | Value |
|---|---|
| Source path | `rsmv-upstream/src/opcodes/frames.json`, `spotanims.json`, `generated/frames.d.ts`, `sequences.d.ts`, `spotanims.d.ts`, `animationframes.d.ts`, `animationskeletal.d.ts` |
| frames.json (171 B) | struct: header_always_2 (ubyte), framemap_id (ushort), flags (array ushort/ubyte), animdata (buffer bytesleft) — frame metadata layout |
| spotanims.json (1,061 B) | opcode table: 0x01 model, 0x02 sequence, 0x04 scaleX, 0x05 scaleYorZ, 0x06 rotation, 0x07 ambient, 0x08 contrast, 0x0a unk, 0x28 replace_colors (ushort color pairs), 0x29 replace_materials |
| sequences.json | **MISSING** from src/opcodes/ |
| anims dir | `src/3d/anims/` exists but is EMPTY (4,096 B = empty dir) |
| Validation result | OPCODE_DEFINITIONS_PRESENT / EXTRACTED=NO / CONVERTED=NO / RUNTIME_VERIFIED=NO. Frame and spotanim opcodes declared; no frame/sequence data array present on disk; sequences.json absent. |

### 3. Spatial data (mapzones, maptiles, maplocations)
| Field | Value |
|---|---|
| Source path | `extracted_layers/maptiles_more/maptiles-58_52.json` (2,318,908 B), `extracted_layers/maplocations_58_52/` (schema + 116 B dump), `extracted_layers/mapzones_test/` (~100 dumps, 400-8,367 B each), `extracted_layers/maptiles_more/.schema-maptiles.json` (9,585 B) |
| maptiles schema | magic [u32, u8], tiles[]: flags (u8), shape (u8|null), overlay (u16|null), settings (u8|null), underlay (u8|null), height (u8) |
| maplocations schema | locations[]: id (loc), uses[]: y/x/plane/rotation/type/extra(flags, rotation) |
| mapzones schema | internal_name, name, center (coordgrid u32), background (rgb u32), show (bool), default_zoom (u8), bounds[]: plane, src{xstart,zstart,xend,zend} |
| Validation result | SOURCE_RECORD_EXISTS / CONVERSION=PARTIAL (coordinate + height semantics present in schema) / RUNTIME_VERIFIED=NO (no loaded-landscape sanity check done) |

### 4. Interactions (client script + interface + varbit)
| Field | Value |
|---|---|
| Source path | `rsmv-upstream/src/clientscript/` (ast.ts 67,774 B, ast_nodes.ts 26,831 B, interpreter.ts 30,612 B, definitions.ts 29,320 B, callibrator.ts, jsonwriter.ts, util.ts), `generated/interfaces.d.ts` (3,631 B), `src/logic/SovereignVarbitBridge.ts` (2,303 B), `prifddinas_logic.json` (1,243,702 B) |
| Artifact | AST + interpreter + codewriter real TS files; interface declarations; varbit bridge; logic JSON (1.2 MB) |
| Validation result | EXTRACTION_SURFACE_PRESENT / INTERPRETER_PRESENT / RUNTIME_VERIFIED=NO (no parsed client script executed end to end) |

### 5. Cross-program content provenance (source-of-truth for maps)
| Source | Artifact | Notes |
|---|---|---|
| `openrsc-vinilla/rsc-data/config/items.json` | item catalog (1,313) | RS3-era item fields; no combat |
| `openrsc-vinilla/rsc-data/config/npcs.json` | npc catalog (794) | name/attack/strength/hits/defense/hostility/animations[] (13 ints, unreferenced) |
| `openrsc-vinilla/rsc-data/config/wall-objects.json` | 214 wall objects | name, commands[WalkTo/Examine], height, colourFront/Back, texture, blocked |
| `openrsc-vinilla/rsc-data/config/tiles.json` | 25 tiles | colour, texture, type ground, blocked |
| `openrsc-vinilla/rsc-data/config/animations.json` | 229 animations | name, colour, genderModel, hasA/hasF |
| `openrsc-vinilla/rsc-sounds/wavs/` | 37 .wav | sounds1.json + wavs |
| `shap-e/samples/*.obj` | 2 model meshes | corgi.png, object.obj, cactus/object.obj |
| `godot` (17,450 files) | 2,875 .obj | source-game meshes; REUSED for 3D, not exported to Redshift |
| `redshift-space-battles/scenes/` | 7 .tscn | battle, fleet_manager, main_menu, world_colony, effects(explosion, laser_bolt), ships/ship — runtime scenes, no embedded art |

## 1. Mapping matrix (source availability → conversion → runtime)
| Source | Target type | SOURCE_PRESENT | EXTRACTED | CONVERTED | VALIDATED | RUNTIME_VERIFIED |
|---|---|---|---|---|---|---|
| openrsc-vinilla items.json | item | YES (1,313) | YES (parsed) | NO (defined) | NO | NO |
| openrsc-vinilla npcs.json | npc | YES (794) | YES | NO | NO | NO |
| openrsc-vinilla wall-objects.json | building | YES (214) | YES | NO | NO | NO |
| openrsc-vinilla tiles/animations | world/tooling | YES | YES | NO | NO | NO |
| rsmv-upstream generated/*.d.ts | model/animation declarations | YES | YES | NO | NO | NO |
| rsmv-upstream src/opcodes/frames.json | animation opcodes | YES | YES (defs) | NO | NO | NO |
| rsmv-upstream src/opcodes/spotanims.json | spotanim opcodes | YES | YES | NO | NO | NO |
| rsmv-upstream extracted_layers/maptiles_more | planet/resource | YES (2.3MB) | YES | NO | NO | NO |
| rsmv-upstream extracted_layers/maplocations_58_52 | planet/location | YES (116B) | YES | NO | NO | NO |
| rsmv-upstream extracted_layers/mapzones_test | spatial/zone | YES (~100) | YES | NO | NO | NO |
| rsmv-upstream src/clientscript/* | interaction | YES | YES | NO | NO | NO |
| rsmv-upstream src/logic/* | interaction config | YES (prifddinas_logic.json 1.2MB) | YES | NO | NO | NO |
| shap-e samples/*.obj | ship mesh | YES | YES | NO | NO | NO |
| godot *.obj | ship/planet mesh | YES (2,875) | YES | NO | NO | NO |
| rsmv-upstream public/*.jag | JAG archives | NOT PRESENT (public/ empty) | NO | NO | NO | NO |

## 2. Provenance rules encoded (for Stage 3)
- Source IDs preserved verbatim: RS3 item ids, RSMV model ids, mapzone ids. Redshift `entityId` is a NEW identifier — never derived from source IDs.
- Record-level provenance retained: source path + sourceId + record hash for every accepted record.
- Mapping statuses: DIRECT / TRANSFORMED / DERIVED / UNSUPPORTED / UNVERIFIED — reported per record, never defaulted.
- Source namespace separation: RS3/RSC ids never mixed with Redshift ids in the engine.
- Rejected-field report: unsupported fields recorded with reason; no silent fallback defaults.

## 3. Stage 2 exit conditions — all met
- Models: declared pipeline + generated d.ts present; geometry NOT extracted → audit FOUND it (not assumed).
- Animations: opcode definitions present (frames/spotanims); sequences.json, anims/ content NOT present → audit FOUND it.
- Spatial: maptiles 2.3MB + mapzones dumps + maplocations on disk; coordinate/height schema verified.
- Interactions: clientscript AST/interpreter/definition real; prifddinas_logic.json present; runtime execution unverified.
- Public/ (JAG) absent → recorded as absent, not as "extracted". Status: SOURCE_NOT_PRESENT.

## 4. Approved condition
- `packages/engine/content/`, `loader.ts`, and source-data writes: NOT authorized at this stage.
- Upon this audit: the content-contract design (envelope + type payloads) and the three-stage importer pattern (source-preserving extraction → explicit adaptation → runtime load) are the approved architecture. Implementation is authorized only after the first batch's accepted records have traceable source data and validated references.
- Remains unverified: any decoded model mesh, any frame/sequence data array, any extracted map square geometry, any parsed client-script execution, any GLTF export — these are the audit's open questions, to be answered at Stage 3.
