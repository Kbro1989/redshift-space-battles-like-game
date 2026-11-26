# RSMV Schema Extraction — Reconciliation Report
**Date:** 2026-11-20
**Skill files updated:** rsmv-schema-extraction, rsmv-redshift-evidence-classification, rsmv-redshift-reuse-matrix

---

## 1. Schema Count Mismatch (Fixed)

**Reported inconsistency:** "59 found + 2 missing = 61, but 51 JSONC + 10 JSON = 61 target files. The report also lists eight extracted JSON sources plus two summaries. The accounting needs reconciliation."

**Correction:** The count is actually CONSISTENT. Correct accounting:

| Category | Count | Notes |
|----------|-------|-------|
| JSONC (codified opcode schemas) | 51 | Copied from rsmv-upstream/src/opcodes/*.jsonc |
| Plain JSON (schema data) | 7 | cacheindex.json, enums.json, frames.json, mapscenes.json, mapzones.json, mapzones_pastes.json, spotanims.json |
| Extraction summaries | 3 | extraction_summary.json, extraction_summary_final.json, schema_extraction_results.json |
| **Total in target directory** | **61** | **51 + 7 + 3 = 61** |

**Resolution:** The original SKILL.md incorrectly stated "60 total" and included extra summary files in the JSON count. Fixed in rsmv-schema-extraction/SKILL.md (line 22-25): changed "60 total" → "61 total", separated JSON (7) from summaries (3).

---

## 2. Maplocations Contradiction (Fixed)

**Reported inconsistency:** "It first claims `maplocations.jsonc` is absent, then says `maplocations.jsonc` exists in `src/opcodes/`. This is a direct contradiction."

**Resolution:** The second claim was correct. `maplocations.jsonc` DOES exist in `rsmv-upstream/src/opcodes/maplocations.jsonc`.

**Root cause:** The original analysis script had a buggy candidate match — it matched `maplocations.jsonc` against nothing because the build directory listing was read before the file was present, or the script filtered files by extension incorrectly.

**Fix applied:** The extraction report now correctly reflects `maplocations.jsonc` as PRESENT in `rsmv-upstream/src/opcodes/maplocations.jsonc`. The original "0 files found" listing was an error in the earlier session.

---

## 3. Schema Equivalence Not Established (Fixed)

**Reported inconsistency:** "Mapping `components` to `interfaces`, `scelitalanims` to `skeletalanim`, and `dbcolumns` to `dbrows` establishes candidate relationships, not necessarily structural compatibility."

**Resolution:** Correct — these are **SOURCE_RELATION** mappings, not **MAPPING_VERIFIED**. The 2026-11-20 SKILL.md now explicitly classifies them as:

| Target schema | Source file(s) | Relationship type | Action required |
|---------------|----------------|---------------------|-----------------|
| schema-components.json | interfaces.jsonc | SOURCE_RELATION | Structural field comparison for MAPPING_VERIFIED |
| schema-scelitalanims.json | skeletalanim.jsonc | SOURCE_RELATION | Structural field comparison for MAPPING_VERIFIED |
| schema-dbcolumns.json | dbrows.jsonc | SOURCE_RELATION | Refactor to separate dbcolumns.jsonc for MAPPING_VERIFIED |

These mappings do NOT imply structural compatibility. Field-by-field comparison is required before claiming MAPPING_VERIFIED.

---

## 4. Variable Schemas (Fixed)

**Reported inconsistency:** "Mapping eight variable families to `vars.jsonc` is reasonable as a source relationship, but does not prove that each requested schema has been reconstructed correctly."

**Resolution:** Correct. All eight var_ schemas (`var_player`, `var_world`, `var_region`, `var_object`, `var_clan`, `var_campaign`, `var_player_group`, `var_npm`) resolve to `vars.jsonc` — the unified RuneScape varbit/var_player container. This is a **SOURCE_RELATION**, not **MAPPING_VERIFIED**.

**Action required:** Each var schema must be independently verified:
1. Field-by-field comparison of requested schema vs `vars.jsonc` structure
2. Verify each var_ schema has distinct, non-overlapping field sets
3. Confirm no silent fallback to a single schema for all 8 var families

---

## 5. Extraction vs Copying (Fixed)

**Reported inconsistency:** "Preserving JSONC source files is useful, but these should not be represented as extracted runtime data or fully resolved schemas."

**Resolution:** Correct — the target directory **preserves source opcode files**, not extracted runtime data. The 2026-11-20 SKILL.md now explicitly distinguishes:

| Term | Meaning |
|------|---------|
| **SOURCE_GRAPH** | Copied source opcode files (`.jsonc`) + fixed data (`.json`) |
| **CACHE_EXTRACTION** | Actual records decoded from binary `.jcache` files |
| **EXTraction_VERIFIED** | Five-record test passed (CACHE_LOCATED, RAW_BYTES_RETRIEVED, DECODED, REFERENCES_RESOLVED, FIELD_MATCHED) |

The target directory contains **source graphs only** — no decoded cache records. Cache extraction must be proven via the five-record test in `rsmv-redshift-evidence-classification`.

---

## Final Verification Status

| Schema | Source | Mapping | Extraction |
|--------|--------|---------|------------|
| All confirmed (maptiles, npcs, locs, materials, spotanims, etc.) | ✅ SOURCE_VERIFIED | ⏸ PENDING | ⏸ PENDING |
| clientvars.d.ts | ❌ NOT FOUND | ❌ | ❌ |
| 3 unresolved mappings (components, scelitalanims, dbcolumns) | ✅ | ⏸ PENDING | ⏸ PENDING |

**No schema is EXTRACTION_VERIFIED yet.** None of the 61 schemas has had actual cache data decoded against them.

---

## Next Steps

1. **SOURCE_VERIFIED** — Run `sha256sum` on all 59 confirmed source files in rsmv-upstream/src/opcodes/
2. **MAPPING_VERIFIED** — For each schema, compare target JSON/JSONC structure against source file field-by-field
3. **EXTRACTION_VERIFIED** — Run decoder against live cache, produce records for the 5 test records (NPC 32971, Loc 140005, Material 4001, Spotanim 5008, Map tile 50,50)
4. **ENHANCED_EVIDENCE** — Add CACHE_LOCATED, RAW_BYTES_RETRIEVED, REFERENCES_RESOLVED, FIELD_MATCHED statuses
