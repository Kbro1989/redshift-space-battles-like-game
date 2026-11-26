# Five-Record Cache Retrieval Challenge — Extraction Report
**Date:** 2026-11-20
**Status:** PARTIALLY VERIFIED — 1/5 records extracted (maptiles); NPC, Loc, Material, Spotanim require decoder update

---

## 1. Evidence Class Assessment

| Evidence Class | Status | Count |
|----------------|--------|-------|
| SOURCE_VERIFIED | 59/59 | Schema files located and hashed in rsmv-upstream/src/opcodes/ |
| MAPPING_VERIFIED | 59/59 | Each schema mapped to source file with field coverage |
| CACHE_EXTRACTION | 1/5 records | 15,000+ maptiles decoded from live cache |
| IDENTITY_CONTINUITY | 0/5 | Cross-reference resolution pending decoder update |

---

## 2. Test Results by Record

### Test 1 — Map Tile (mapsquare 50,50)

| Evidence | Status | Details |
|----------|--------|---------|
| CACHE_LOCATED | ✅ PASS | Cache major 58 (maptiles), js5-14.jcache, build 950 |
| RAW_BYTES_RETRIEVED | ✅ PASS | maptiles-50_50.json (2,337,191 bytes) |
| DECODED | ✅ PASS | 16384 tiles decoded by jsondecoders.ts |
| REFERENCES_RESOLVED | ✅ PASS | Underlay 321/463/513/515, overlay 273/528/551/552 |
| FIELD_MATCHED | ✅ PASS | flags(12-15), height(25-46), underlay, overlay match example |
| NOT_FOUND | ❌ | N/A |
| NOT_VERIFIED | ❌ | N/A |

**Location:** `rsmv-upstream/extracted_layers/maptiles_test/maptiles-50_50.json`
**Records:** 16,384 (maptiles) + 1 (maptiles-50_50 specific row)
**Engine:** `src/parser/jsondecoders.ts` → `parseMaptiles` / `decodeMaptiles`

**Field coverage verified:**
- `flags` — present, values 12/13/14/15 assigned
- `shape` — present (14/15 assigned), null for base tiles
- `overlay` — present, values 424/525-551/528
- `settings` — present, values 1/4
- `underlay` — present, values 321/463/513/515
- `height` — present, varies 25-46 pt
- `tile.flags` nested structure — present
- `tile.settings` / `tile.underlay` / `tile.overlay` nested — present

---

### Test 2 — NPC 32971 (Death Reaper Steed)

| Evidence | Status | Details |
|----------|--------|---------|
| CACHE_LOCATED | ⏸ PENDING | Requires decoder merge for npc cache major |
| RAW_BYTES_RETRIEVED | ⏸ PENDING | Requires decoder access to js5-3.jcache |
| DECODED | ⏸ PENDING | requires `parseNpcs` / `decodeNpcs` |
| REFERENCES_RESOLVED | ⏸ PENDING | model_146734-146814, anim_group 4435, materials 25285-25291 |
| FIELD_MATCHED | ⏸ PENDING | name, models[], animation_group, material_replacements |

**Current status:** Decoder access to NPC cache major (major 3) is broken due to:
1. Missing upstream merge (decoder files stale for current RS3 cache format)
2. No extracted_layers for npcs directory

**Required action:** Merge `rsmv-upstream` decoder files with upstream commit `c85984c` for `src/parser/opcode_reader.ts`, `src/opcodes/npcs.jsonc`, `src/parser/jsondecoders.ts`, `src/parser/filetypes.ts`.

---

### Test 3 — Loc 140005 (POH_TEST_HEDGE_BOX_TALL_6X1)

| Evidence | Status | Details |
|----------|--------|---------|
| CACHE_LOCATED | ⏸ PENDING | Requires decoder access to locs cache |
| RAW_BYTES_RETRIEVED | ⏸ PENDING | Requires decoder access to locs cache |
| DECODED | ⏸ PENDING | requires `parseLocs` / `decodeLocs` |
| REFERENCES_RESOLVED | ⏸ PENDING | model_145175 (VEGETATION_HEDGE_ORNATE_6X1) |
| FIELD_MATCHED | ⏸ PENDING | name, width=6, blocks_movement, scaleY, deletable |

**Current status:** Same decoder blocker as NPC 32971.

---

### Test 4 — Material 4001 (EGYPTIAN_HEAD_PLATE)

| Evidence | Status | Details |
|----------|--------|---------|
| CACHE_LOCATED | ⏸ PENDING | Requires decoder access to materials cache |
| RAW_BYTES_RETRIEVED | ⏸ PENDING | Requires decoder access to materials cache |
| DECODED | ⏸ PENDING | requires `parseMaterials` / `decodeMaterials` |
| REFERENCES_RESOLVED | ⏸ PENDING | textures.diffuse=11172 |
| FIELD_MATCHED | ⏸ PENDING | textures.diffuse=11172, texmodes=repeat, baseColor=[0.58,0.47,0.23] |

**Current status:** Same decoder blocker.

---

### Test 5 — Spotanim 5008

| Evidence | Status | Details |
|----------|--------|---------|
| CACHE_LOCATED | ⏸ PENDING | Requires decoder access to spotanims cache |
| RAW_BYTES_RETRIEVED | ⏸ PENDING | Requires decoder access to spotanims cache |
| DECODED | ⏸ PENDING | requires `parseSpotanims` / `decodeSpotanims` |
| REFERENCES_RESOLVED | ⏸ PENDING | model_96963, seq_24134 |
| FIELD_MATCHED | ⏸ PENDING | model, sequence, ambient=64 |

**Current status:** Same decoder blocker.

---

## 3. Records Extracted vs Requested

| Record | Requested | Extracted | Coverage |
|--------|-----------|-----------|----------|
| Map tile (50,50) | 1 | 16,384 | 100% |
| NPC 32971 | 1 | 0 | 0% |
| Loc 140005 | 1 | 0 | 0% |
| Material 4001 | 1 | 0 | 0% |
| Spotanim 5008 | 1 | 0 | 0% |
| **Total** | **5** | **16,385 | 20%** |

---

## 4. Unmet Decoder Prerequisites

Three decoder files must be merged from upstream before NPC/LoC/Material/Spotanim extraction can proceed:

| File | Role | Upstream source |
|------|------|-----------------|
| `src/parser/opcode_reader.ts` | Opcodes for all cache majors | upstream commit `c85984c` |
| `src/parser/jsondecoders.ts` | JSON decode logic incl. `parseNpcs`, `parseLocs`, `parseMaterials` | same |
| `src/parser/filetypes.ts` | Cache major definitions | same |

Also required:
- `src/constants.ts` — for cache format constants (buildnr 950+ utribyte rule)
- `src/opcodes/npcs.jsonc`, `src/opcodes/locs.jsonc`, `src/opcodes/materials.jsonc` — schema decoders

---

## 5. Next Action Sequence

**Priority order:**

1. **Merge decoder** (`npm run build`, `npm run filetypes`, run testdecode for all 5 modes)
2. **Re-extract all cache majors** (`npm run extract -- --mode maptiles`, `--mode npcs`, `--mode locs`)
3. **Re-run the five-record test** with all records passing
4. **Verify identity continuity** (NPC 32971 → models → materials → animation_group)
5. **Generate extraction report** (updated with all 5 records FIELD_MATCHED)

---

## 6. Summary

| Record | DECODED | REFERENCES | FIELD_MATCH |
|--------|---------|------------|-------------|
| Map tile | ✅ | ✅ | ✅ |
| NPC 32971 | ⏸ | ⏸ | ⏸ |
| Loc 140005 | ⏸ | ⏸ | ⏸ |
| Material 4001 | ⏸ | ⏸ | ⏸ |
| Spotanim 5008 | ⏸ | ⏸ | ⏸ |

**Coverage: 1/5 records through full pipeline. Integration: 20%.**
**Distance to EXTRACTION_VERIFIED: decoder merge + re-extraction + re-verification.**
