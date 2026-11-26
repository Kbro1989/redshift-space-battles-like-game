# RSMV Historical Usage Promotion — Redshift Architecture Expansion

**Generated:** 2026-11-20
**Source:** Prior project discussions (including 2026-11-08) and cross-project evidence

---

## 1. Historical RSMV Usage Inventory

### A. Interface Reconstruction & Execution (Previously Documented)

| Component | File | Actual Responsibility | Redshift Opportunity | Evidence Class |
|-----------|------|----------------------|---------------------|----------------|
| `renderrsinterface.ts` | `scripts/renderrsinterface.ts` | Reconstructs RS interface hierarchies: parent-child, sprites/models, text, hidden components, dynamic components, highlighting, callbacks, DOM updates/disposal | UI reconstruction, interaction graph | **IMPLEMENTED** (script exists) |
| `gameinterfaces.ts` | `scripts/gameinterfaces.ts` | Interface data access | Interface registry | **IMPLEMENTED** |
| `extract_interface_advanced.ts` | `scripts/extract_interface_advanced.ts` | Advanced interface extraction | Content extraction | **IMPLEMENTED** |
| `dump_interface_scripts.ts` | `scripts/dump_interface_scripts.ts` | Script extraction from interfaces | Interaction metadata | **IMPLEMENTED** |
| `rsuiviewer.tsx` | `viewer/rsuiviewer.tsx` | Interface inspection UI | UI tooling | **IMPLEMENTED** |
| `cs2viewer.tsx` | `viewer/cs2viewer.tsx` | ClientScript inspection | Script debugging | **IMPLEMENTED** |
| `scriptsui.tsx` | `viewer/scriptsui.tsx` | Script tooling UI | Interaction inspection | **IMPLEMENTED** |
| `SovereignHUD.tsx` | `viewer/SovereignHUD.tsx` | Sovereign HUD integration | Game HUD | **IMPLEMENTED** |
| `scriptrunner.ts` | `scriptrunner.ts` | Script execution surface | Runtime interaction | **IMPLEMENTED** |

**Limitation:** Mouse X/Y and operation-number values substituted with zero in callback execution → **full interaction fidelity NOT established**.

### B. ClientScript API (Previously Identified)

| Function | Capability | Status |
|----------|------------|--------|
| `findChild` | Locate interface children | **IMPLEMENTED** |
| `getNextChildId` | Resolve child identifiers | **IMPLEMENTED** |
| `createChild` | Create interface components | **IMPLEMENTED** |
| `setText` | Update interface text | **IMPLEMENTED** |
| `getText` | Retrieve interface text | **IMPLEMENTED** |
| `getGraphic` | Retrieve interface graphics | **IMPLEMENTED** |

**ClientScriptInterpreter** — callback execution reconstructed, but with zero-substituted mouse/operation values → **partial execution fidelity**.

### C. Direct RSMV → Widgets Integration (Cross-Project Evidence)

**`rehydrate_interaction_vocab.ts`** — Direct integration pipeline:

```
RSMV cache
    ↓
Opcode decoding (GameCacheLoader + parse + cacheMajors + cacheConfigPages)
    ↓
Interaction vocabulary extraction:
  - Item IDs + names
  - NPC IDs + names  
  - Object IDs + names
  - Action text
  - Action slots
  - Membership info
    ↓
RUNESCAPE-WIDGETS
```

This is **executed cross-project integration**, not proposed architecture.

### D. Additional Architecture from Prior Inventory

| Subsystem | Existing Usage | Proposed Redshift Role | Evidence |
|-----------|---------------|------------------------|----------|
| Interface graph | `renderrsinterface.ts` | Interaction graph | Script exists |
| ClientScript runtime | `ClientScriptInterpreter` | Event execution | Partial (zero-substituted) |
| Interaction vocabulary | `rehydrate_interaction_vocab.ts` | Entity action registry | Cross-project integration |
| UI extraction | `extract_interface_advanced.ts` | UI asset ingestion | Script exists |
| UI inspection | `cs2viewer.tsx` | Development tooling | Viewer component |
| Spatial management | `RSSpatialManager.ts` | World-coordinate services | Need confirmation |
| Scene graph | `scenenodes.tsx` | Scene hierarchy | Need confirmation |
| Engine | `RSEngine.ts` | Runtime integration | Need confirmation |
| Three.js rendering | `threejsrender.ts` | Rendering adapter | Need confirmation |

---

## 2. RSMV Lineage Classification (Critical)

| Lineage | Description | Current Status | Reusable? |
|---------|-------------|----------------|-----------|
| **skillbert/rsmv** | Upstream decoder + viewer substrate | Reference only | ❌ (upstream) |
| **Kbro1989/rsmv** | User fork with additional tooling | `C:/Users/krist/Desktop/rsmv` (50 gen types) | ⚠️ (validate) |
| **POG2 vendored RSMV** | Historical research/extraction | Frozen (destroyed device) | ❌ (stale) |
| **rsmv-upstream** | Current inspected working surface | `C:/Users/krist/Desktop/rsmv-upstream` (70+ gen types) | ✅ (validate) |
| **Redshift** | Consumer architecture | Requires explicit adapters | Target |

**DO NOT COLLAPSE** — historical POG2 functionality ≠ current upstream checkout.

---

## 3. Expanded Reuse Priority Matrix

| Priority | Subsystem | Reason | Evidence Gate |
|----------|-----------|--------|---------------|
| **P0** | Cache & opcode decoding | Foundation for source ingestion | `parse()`, `detectClassicVersions` |
| **P0** | Model identity & geometry | Foundation for 3D assets | `EngineCache`, `ob3ModelToThree` |
| **P0** | Spatial reconstruction | Stage 2.1 demonstrated (128×128 PASS) | `getClassicMapData`, `runMapRender` |
| **P1** | Interface reconstruction | Substantial existing implementation | `renderrsinterface.ts`, `rsuiviewer.tsx` |
| **P1** | Interaction vocabulary | Cross-project integration demonstrated | `rehydrate_interaction_vocab.ts` |
| **P1** | ClientScript runtime | Potential gameplay substrate | `compileClientScript`, interpreter (partial) |
| **P1** | Scene graph & rendering | Reuse rendering architecture | `scenenodes.tsx`, `threejsrender.ts` |
| **P2** | Avatar & identity-kit | Historical POG2 work; lineage needs validation | `extract_kit_pipeline.ts` (POG2, frozen) |
| **P2** | Animation | Source data absent | `sequences.json` missing, `src/3d/anims/` empty |
| **P2** | Runtime state/varbit bridge | Requires live cache + execution tests | `SovereignVarbitBridge.ts` |

---

## 3. Function-Level Historical Capabilities (To Add to Reuse Matrix)

### Interface Reconstruction

| Source Function | File | Input | Output | Redshift Integration | Exec Status |
|-----------------|------|-------|--------|---------------------|-------------|
| Interface hierarchy reconstruction | `scripts/renderrsinterface.ts` | Cache + interface ID | Full DOM-like tree with sprites, text, hidden, dynamic components, callbacks | Interaction graph builder | **IMPLEMENTED** (script) |
| Interface data access | `scripts/gameinterfaces.ts` | Interface ID | Raw interface data | Registry lookup | **IMPLEMENTED** |
| Advanced extraction | `scripts/extract_interface_advanced.ts` | Cache | Complete interface dump | Batch ingestion | **IMPLEMENTED** |
| Script extraction | `scripts/dump_interface_scripts.ts` | Interface | Associated scripts | Interaction metadata | **IMPLEMENTED** |

### ClientScript Execution

| Source Function | File | Input | Output | Limitation | Exec Status |
|-----------------|------|-------|--------|------------|-------------|
| `compileClientScript` | `clientscript/index.ts` | Source + code | Compiled script | — | **IMPLEMENTED** |
| `renderClientScript` | `clientscript/index.ts` | Source + buf + fileid | Decompiled script | — | **IMPLEMENTED** |
| `prepareClientScript` | `clientscript/index.ts` | Source | Prepared script | — | **IMPLEMENTED** |
| `ClientScriptInterpreter` | `clientscript/interpreter.ts` | Compiled script | Execution with callbacks | Mouse X/Y = 0, op-num = 0 | **PARTIAL** |
| `CS2Api` methods | `clientscript/definitions.ts` | — | findChild, getNextChildId, createChild, setText, getText, getGraphic | — | **IMPLEMENTED** |

### Interaction Vocabulary (Cross-Project)

| Source Function | File | Input | Output | Provenance |
|-----------------|------|-------|--------|------------|
| `rehydrate_interaction_vocab.ts` | `scripts/rehydrate_interaction_vocab.ts` | RSMV cache | Item/NPC/Object IDs, names, action text, slots, membership | **RUNESCAPE-WIDGETS integration** |

---

## 4. Cross-Repository Provenance

| Redshift Need | POG2 Source | rsmv-upstream Source | Kbro1989/rsmv Source | Status |
|---------------|-------------|---------------------|---------------------|--------|
| Cache decoding | `rsmv_inspector` (frozen) | `src/cache/`, `src/parser/` | `src/cache/`, `src/opdecoder.ts` | Upstream preferred |
| Model decoding | `rsmv_inspector/rt7model.ts` | `src/3d/meshes/rt7model.ts` | `src/3d/modeltothree.ts` | Upstream preferred |
| Interface reconstruction | Not in POG2 | Not found in upstream | `scripts/renderrsinterface.ts` | Kbro1989/rsmv only |
| ClientScript | Not in POG2 | `src/clientscript/` | `src/clientscript/` | Both |
| Interaction vocab | `rehydrate_interaction_vocab.ts` | Not found | `scripts/rehydrate_interaction_vocab.ts` | Kbro1989/rsmv only |
| Spatial | POG2 map tools | `src/map/`, `src/3d/classicmap.ts` | `src/map/`, `src/3d/classicmap.ts` | Both |
| Kit extraction | `extract_kit_pipeline.ts` (POG2) | `src/scripts/` + `src/viewer/SovereignWorldLoader.ts` | Not found | POG2 logic → upstream |
| Avatar/kit assembly | `avatar.ts` (POG2) | `src/3d/scene/avatar.ts` | `src/3d/avatar.ts` | Both (validate) |
| Animation | Not in POG2 | `src/3d/anims/` | `src/3d/animationframes.ts` | Upstream only |

---

## 5. Detached / Stale / Unavailable Dependencies

| Dependency | Location | Status | Impact on Redshift |
|------------|----------|--------|-------------------|
| `sequences.json` | `generated/` | **MISSING** (435B stub) | Animation pipeline NOT_TESTABLE |
| `frames.json` | `generated/` | **MISSING** (261B stub) | Animation pipeline NOT_TESTABLE |
| `framemaps.json` | `generated/` | **MISSING** (435B stub) | Animation pipeline NOT_TESTABLE |
| `.cs2` client scripts | Cache | **NONE ON DISK** | ClientScript execution NOT_TESTABLE |
| `kit_*.json` manifests | POG2/`kingwen_train_data` | **NOT IN RSMV REPO** | Kit adapter needs external source |
| `D:/sovereign/` paths | POG2 scripts | **DESTROYED DEVICE** | POG2 extraction scripts non-functional |
| `RSSpatialManager.ts` | Inventory claim | **NOT FOUND** | Need confirmation |
| `RSEngine.ts` | Inventory claim | **NOT FOUND** | Need confirmation |
| `scenenodes.tsx` | Inventory claim | `src/viewer/scenenodes.tsx` exists | Confirmed in viewer |
| `threejsrender.ts` | Inventory claim | `src/viewer/threejsrender.ts` exists | Confirmed in viewer |

---

## 6. Promotion Eligibility & Evidence Gates

| Capability | Promotion Eligibility | Evidence Gate | Current Evidence |
|------------|----------------------|---------------|------------------|
| Cache decoding | ✅ PROMOTE | Build clean + live cache decode | rsmv-upstream builds |
| Model geometry | ✅ PROMOTE | Model extract + Three.js convert | `ob3ModelToThree` exists |
| Spatial 128×128 | ✅ PROMOTE | Stage 2.1 PASS | 16,384 tiles reconstructed |
| Interface reconstruction | ✅ PROMOTE (P1) | Script execution + output validation | `renderrsinterface.ts` exists |
| Interaction vocabulary | ✅ PROMOTE (P1) | Cross-project output verified | RUNESCAPE-WIDGETS integration |
| ClientScript runtime | ⚠️ CONDITIONAL (P1) | Full callback fidelity test | Zero-substituted mouse/op |
| Scene graph/rendering | ⚠️ CONDITIONAL (P1) | Viewer component test | `threejsrender.ts` exists |
| Avatar/kit assembly | ⚠️ CONDITIONAL (P2) | Kit manifest + slot parity test | POG2 frozen, upstream validate |
| Animation | ❌ EXCLUDE (P2) | Source data present + decode test | Data absent |
| Varbit bridge | ❌ EXCLUDE (P2) | Live cache + execution test | Requires live cache |

---

## 7. Revised Redshift Architecture (Incorporating Historical Usages)

```
┌─────────────────────────────────────────────────────────────┐
│                    REDSHIFT RUNTIME                         │
├─────────────────────────────────────────────────────────────┤
│  content-loader      ← schema validation + runtime refs     │
│  identity-registry   ← item/NPC/object/avatar/kit graph     │
│  interaction-graph   ← interface hierarchy + callbacks      │
│  spatial-services    ← coordinates, zones, collision        │
│  rendering-adapter   ← Three.js scene + material pipeline   │
├─────────────────────────────────────────────────────────────┤
│  rsmv-bridge (reusable subsystem)                           │
│  ├─ cache-decoder      ← parse(), detectClassicVersions    │
│  ├─ model-decoder      ← EngineCache, ob3ModelToThree      │
│  ├─ interface-recon    ← renderrsinterface.ts              │
│  ├─ clientscript-runtime ← compile/prepare/interpreter    │
│  ├─ vocab-extractor    ← rehydrate_interaction_vocab.ts    │
│  └─ spatial-engine     ← getClassicMapData, MapRenderer    │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Next Deliverable

**`docs/audit/rsmv-redshift-historical-usage-promotion-2026-11-20.md`** — this document.

**No loader changes or runtime claims should follow from historical inventory alone.** Each promoted capability must pass its evidence gate against the current rsmv-upstream checkout before integration.