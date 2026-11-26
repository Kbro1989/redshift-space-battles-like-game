# POG2 RSMV Usage vs rsmv-upstream Verification Gap

**Generated:** 2026-11-20
**Finding:** POG2 RSMV usage is frozen against an old cache version; rsmv-upstream has evolved significantly. **No POG2 RSMV usage should be reused without validation against rsmv-upstream.**

---

## 1. POG2 RSMV Usage Surface (Frozen)

| Location | Purpose | Status |
|----------|---------|--------|
| `pog2/scratch/extract_kit_pipeline.ts` | Kit extraction pipeline | **FROZEN** — hardcoded `D:/sovereign/cache_pedagogy/rsmv_inspector` path (destroyed device) |
| `pog2/rsmv_inspector/` | Inspector toolkit | **FROZEN** — standalone copy with own `opdecoder.ts`, `rt7model.ts`, `opcode_reader.ts` |
| `pog2/scripts/.pog2/sovereign/` | Sovereign RSMV integration | **NOT FOUND** (directory doesn't exist) |

**Key evidence of staleness:**
- `extract_kit_pipeline.ts:9` — `const inspectorPath = 'D:/sovereign/cache_pedagogy/rsmv_inspector';` → **path does not exist**
- `rsmv_inspector/` has its own frozen `opdecoder.ts`, `opcode_reader.ts`, `rt7model.ts` — not synced with upstream
- POG2's `scripts/` references `rsmv_inspector` dist outputs, not source

---

## 2. rsmv-upstream Structure (Current)

```
src/
├── 3d/
│   ├── anims/              # NEW: animationframes.ts, animationframestoskeletal.ts, animationskeletal.ts
│   ├── scene/              # NEW: avatar.ts, index.ts, mapchunk.ts, model.ts
│   ├── meshes/             # rt2model.ts, rt5model.ts, rt7model.ts
│   ├── materials/          # jmat.ts, proceduraltexture.ts, etc.
│   ├── classicmap.ts
│   ├── gltfutil.ts
│   ├── mapsquare.ts
│   ├── modeltothree.ts
│   └── modeldata.ts
├── cache/                  # autocache, classicloader, compression, etc.
├── clientscript/           # ast, ast_nodes, definitions, index, interpreter, etc.
├── parser/                 # filelookup, filetypes, jsondecoders, jsonschemas, opcode_reader
├── viewer/                 # SovereignBridge, SovereignValidator, SovereignWorldLoader, etc.
├── logic/                  # SovereignVarbitBridge
├── map/                    # backends, chunksummary, collisionimage, grounding_logic, etc.
├── utils/                  # logger, RSMVCacheDB, SovereignPathResolver, SovereignRosettaStone
├── scripts/                # 50+ forensic/extraction scripts
├── tools/                  # auditors, spatial, admin scanning
└── types/                  # pedagogy.ts
```

**Key differences from POG2/rsmv fork:**
| Aspect | POG2/rsmv fork | rsmv-upstream |
|--------|---------------|---------------|
| Animation | `src/3d/animationframes.ts` (flat) | `src/3d/anims/` (modular) |
| Scene | `src/3d/avatar.ts` | `src/3d/scene/avatar.ts` + `model.ts` + `mapchunk.ts` |
| Viewer | Basic Three.js | SovereignBridge, SovereignValidator, SovereignWorldLoader |
| Parser | `src/opdecoder.ts` | `src/parser/opcode_reader.ts` + `jsondecoders.ts` |
| Generated types | 50 files | 70+ files (more complete: `varbits.d.ts`, `vars.d.ts`, `mapzones_pastes.d.ts`, etc.) |
| Build | `tsc` + webpack | webpack only (`noEmit: true` in tsconfig) |
| Tests | None | None |

---

## 3. Verification Gap Matrix

| POG2 Usage | rsmv-upstream Equivalent | Validation Required |
|------------|-------------------------|---------------------|
| `extract_kit_pipeline.ts` → `rsmv_inspector` opdecoder | `src/parser/opcode_reader.ts` + `opdecoder.ts` | **REQUIRED** — decode format may have changed |
| `rsmv_inspector/rt7model.ts` | `src/3d/meshes/rt7model.ts` | **REQUIRED** — model format v5 handling |
| `rsmv_inspector/opcode_reader.ts` | `src/parser/opcode_reader.ts` | **REQUIRED** — opcode schema updates |
| `rsmv_inspector/extract_kit_pipeline.ts` → kit extraction | `src/scripts/` + `src/viewer/SovereignWorldLoader.ts` | **REQUIRED** — kit definition format |
| `avatar.ts` slot mappings | `src/3d/scene/avatar.ts` | **REQUIRED** — slot/kit parity |
| `modeltothree.ts` → Three.js conversion | `src/3d/modeltothree.ts` + `src/viewer/threejsrender.ts` | **REQUIRED** — material/geometry pipeline |

---

## 4. Required Verification Protocol

Before any POG2 RSMV usage is promoted to Redshift:

```bash
# 1. Clone rsmv-upstream fresh
git clone https://github.com/skillbert/rsmv.git rsmv-upstream-fresh
cd rsmv-upstream-fresh
npm install
npm run build  # must be green (0 errors)

# 2. Run extraction against live cache (build 950+)
node dist/cli.js extract --mode items --ids 0-10 --source "C:\ProgramData\Jagex\RuneScape"
# Verify no "unknown chunk 0xNN" errors

# 3. Test model decoding for known IDs
node -e "
const { GameCacheLoader } = require('./dist/cache/sqlite.js');
const { parse } = require('./dist/opdecoder.js');
const cache = new GameCacheLoader('C:\\ProgramData\\Jagex\\RuneScape');
const buf = await cache.getFile(47, 31149);
const model = parse.models.read(buf, cache, { clientVersion: 1149 });
console.log('Model 31149:', model?.meshdata?.renders?.length, 'renders');
"

# 4. Compare kit extraction output format
# Run POG2's extract_kit_pipeline.ts against rsmv-upstream-fresh dist outputs
# Verify kit_*.json structure matches Redshift KitManifest interface
```

---

## 5. Specific Redshift Impact

| Redshift Adapter | POG2 Dependency | Risk if Unverified |
|------------------|----------------|-------------------|
| `adaptKitManifest` (geometry.ts) | `kit_*.json` from POG2/rsmv_inspector | Kit manifest schema mismatch → invalid geometry |
| `adaptMaptilesToPlanet` | RSMV map decoding | Coordinate system drift → broken spatial |
| `identity-registry` | POG2 avatar/kit mappings | Duplicate models, broken character assembly |

---

## 6. Recommendation

**Do not promote any POG2 RSMV usage to Redshift until:**

1. ✅ rsmv-upstream builds clean (`npm run build` → 0 errors)
2. ✅ Model extraction works against current live cache (build 950+)
3. ✅ Kit manifest output format validated against `KitManifest` interface
4. ✅ Animation frame decoding tested (if needed) — `3d/anims/` vs POG2 frozen
5. ✅ Opcode schema cross-checked — `parser/opcode_reader.ts` vs `opdecoder.ts`

**If validation fails:** Use rsmv-upstream directly as the `rsmv-bridge` subsystem, not POG2's frozen copy. The POG2 sovereign work (kit extraction logic, identity-kit assembly) can be ported to use rsmv-upstream's decoded outputs.

---

## 7. Current Status

| Surface | Build Status | Cache Version | Reusable? |
|---------|-------------|---------------|-----------|
| POG2 `rsmv_inspector` | Unknown (no build) | Old (pre-destruction) | ❌ NO |
| POG2 `extract_kit_pipeline.ts` | No (hardcoded dead path) | Old | ❌ NO |
| rsmv-upstream | ✅ webpack builds | Current (build 950+) | ✅ YES (after test) |
| Redshift adapters | ✅ tsc clean | N/A | ⚠️ BLOCKED on data |

**Bottom line:** The POG2 RSMV work is valuable intellectual property but **technically frozen**. rsmv-upstream is the live decoding surface. Port the POG2 logic (kit selection, identity assembly) to consume rsmv-upstream outputs.