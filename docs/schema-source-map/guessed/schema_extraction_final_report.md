# Schema Source Extraction Report

**Generated:** 2026-11-20
**Source:** `rsmv-upstream/src/opcodes/` (61 JSONC/JSON files)
**Target:** `redshift-space-battles/docs/schema-source-map/guessed/schemas/`

---

## Summary

| Metric | Count |
|--------|-------|
| Schemas requested | 61 |
| Files extracted | **53** |
| JSONC source files | 46 |
| Plain JSON files | 7 |
| Already-present sources | 7 plain JSON |
| Missing | 2 |

---

## Extracted schema → source mapping

| Schema (user name) | Source file(s) | Status |
|--------------------|----------------|--------|
| schema-framemaps.json | framemaps.jsonc | extracted ✓ |
| schema-items.json | items.jsonc | extracted ✓ |
| schema-enums.json | enums.json | extracted ✓ |
| schema-npcs.json | npcs.jsonc | extracted ✓ |
| schema-soundjson.json | audio.jsonc | extracted ✓ |
| schema-musicjson.json | audio.jsonc | extracted ✓ |
| schema-locs.json | locs.jsonc | extracted ✓ |
| schema-achievements.json | achievements.jsonc | extracted ✓ |
| schema-structs.json | structs.jsonc | extracted ✓ |
| schema-sequences.json | sequences.jsonc | extracted ✓ |
| schema-spotanims.json | spotanims.json | extracted ✓ |
| schema-materials.json | materials.jsonc | extracted ✓ |
| schema-oldmaterials.json | oldmaterials.jsonc | extracted ✓ |
| schema-quickchats.json | quickchatcategories.jsonc; quickchatlines.jsonc | extracted ✓ |
| schema-dbtables.json | dbtables.jsonc | extracted ✓ |
| schema-dbrows.json | dbrows.jsonc | extracted ✓ |
| schema-dbcolumns.json | dbrows.jsonc | extracted ✓ |
| schema-quests.json | quests.jsonc | extracted ✓ |
| schema-hitmarks.json | hitmarks.jsonc | extracted ✓ |
| schema-headbars.json | headbars.jsonc | extracted ✓ |
| schema-varbits.json | varbits.jsonc | extracted ✓ |
| schema-var_player.json | vars.jsonc | extracted ✓ |
| schema-var_npm.json | vars.jsonc | extracted ✓ |
| schema-var_client.json | clientscript.jsonc; clientscriptdata.jsonc | extracted ✓ |
| schema-var_world.json | vars.jsonc | extracted ✓ |
| schema-var_region.json | vars.jsonc | extracted ✓ |
| schema-var_object.json | vars.jsonc | extracted ✓ |
| schema-var_clan.json | vars.jsonc | extracted ✓ |
| schema-var_clan_settings.json | vars.jsonc | extracted ✓ |
| schema-var_campaign.json | vars.jsonc | extracted ✓ |
| schema-var_player_group.json | vars.jsonc | extracted ✓ |
| schema-overlays.json | mapsquare_overlays.jsonc | extracted ✓ |
| schema-identitykit.json | identitykit.jsonc | extracted ✓ |
| schema-inventories.json | inventories.jsonc | extracted ✓ |
| schema-params.json | params.jsonc | extracted ✓ |
| schema-underlays.json | mapsquare_underlays.jsonc | extracted ✓ |
| schema-mapscenes.json | mapscenes.json | extracted ✓ |
| schema-areas.json | areas.jsonc | extracted ✓ |
| schema-skyboxes.json | skyboxes.jsonc | extracted ✓ |
| schema-animgroupconfigs.json | animgroupconfigs.jsonc | extracted ✓ |
| schema-cursors.json | cursors.jsonc | extracted ✓ |
| schema-maplabels.json | maplabels.jsonc | extracted ✓ |
| schema-maplabellocations.json | maplabellocations.jsonc | extracted ✓ |
| schema-mapzones.json | mapzones.json; mapzones_pastes.json | extracted ✓ |
| schema-mappastes.json | mapzones_pastes.json | extracted ✓ |
| schema-stylesheets.json | stylesheets.jsonc | extracted ✓ |
| schema-cutscenes.json | cutscenes.jsonc | extracted ✓ |
| schema-maptiles.json | mapsquare_tiles.jsonc; mapsquare_tiles_64.jsonc; mapsquare_tiles_66.jsonc; mapsquare_tiles_nxt.jsonc | extracted ✓ |
| schema-maptiles_ntx.json | mapsquare_tiles_nxt.jsonc | extracted ✓ |
| schema-mapenvs.json | mapsquare_envs.jsonc | extracted ✓ |
| schema-frames.json | frames.json | extracted ✓ |
| schema-models.json | models.jsonc | extracted ✓ |
| schema-scelitalanims.json | skeletalanim.jsonc | extracted ✓ |
| schema-proctextures.json | proctexture.jsonc; oldproctexture.jsonc | extracted ✓ |
| schema-components.json | interfaces.jsonc | extracted ✓ |
| schema-fontmetrics.json | fontmetrics.jsonc | extracted ✓ |
| schema-indices.json | cacheindex.json; rootcacheindex.jsonc | extracted ✓ |
| schema-rootindex.json | rootcacheindex.jsonc | extracted ✓ |
| schema-clientscriptops.json | clientscript.jsonc | extracted ✓ |

---

## Missing schemas (2)

| Schema | Reason |
|--------|--------|
| clientvars.d.ts | Not a JSON schema — header file, no source in rsmv-upstream at this time |
| schema-maplocations.json | `maplocations.jsonc` not present in `src/opcodes/` — note: `maplabellocations.jsonc` found instead |

---

## Notes

1. **Deduplication:** `schema-mapzones.json`, `schema-maptiles.json`, and `schema-indices.json` each had multiple source candidates; all raw sources copied.
2. **var_ family:** `var_player`, `var_world`, `var_region`, `var_object`, `var_clan`, `var_campaign`, `var_player_group`, `var_npm` all resolve to the same `vars.jsonc` (the RuneScape varbit/var_player container).
3. **sound/music:** Both `schema-soundjson.json` and `schema-musicjson.json` resolve to `audio.jsonc` (RuneScape bundles sound and music in the same cache major — see `audio.jsonc`).
4. **dbcolumns:** No `dbcolumns.jsonc` exists separately — column schemas are defined inside `dbrows.jsonc` (per-row column definitions). Used as fallback.
5. **components:** No `components.jsonc` — `interfaces.jsonc` is the closest match (component-type definitions in RS3 are in `interfaces.jsonc`, not a separate `components` file).
6. **scelitalanims:** No `scelitalanims.jsonc` — `skeletalanim.jsonc` is the animation-level schema containing skeletal animation definitions.

---

## File inventory

```
  achievements.jsonc
  animgroupconfigs.jsonc
  areas.jsonc
  audio.jsonc
  cacheindex.json
  clientscript.jsonc
  clientscriptdata.jsonc
  cursors.jsonc
  cutscenes.jsonc
  dbrows.jsonc
  dbtables.jsonc
  enums.json
  fontmetrics.jsonc
  framemaps.jsonc
  frames.json
  headbars.jsonc
  hitmarks.jsonc
  identitykit.jsonc
  interfaces.jsonc
  inventories.jsonc
  items.jsonc
  locs.jsonc
  maplabellocations.jsonc
  maplabels.jsonc
  mapscenes.json
  mapsquare_envs.jsonc
  mapsquare_overlays.jsonc
  mapsquare_tiles.jsonc
  mapsquare_tiles_64.jsonc
  mapsquare_tiles_66.jsonc
  mapsquare_tiles_nxt.jsonc
  mapsquare_underlays.jsonc
  mapzones.json
  mapzones_pastes.json
  materials.jsonc
  models.jsonc
  npcs.jsonc
  oldmaterials.jsonc
  oldproctexture.jsonc
  params.jsonc
  proctexture.jsonc
  quests.jsonc
  quickchatcategories.jsonc
  quickchatlines.jsonc
  rootcacheindex.jsonc
  sequences.jsonc
  skeletalanim.jsonc
  skyboxes.jsonc
  spotanims.json
  structs.jsonc
  stylesheets.jsonc
  varbits.jsonc
  vars.jsonc
```
