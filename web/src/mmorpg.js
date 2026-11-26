import * as THREE from 'three';

// ============================================================================
// REDSHIFT: SPACE BATTLES — MMORPG PLANETARY LANDING & SURFACE WORLD ENGINE
// Modeled after OpenRSC / MMORPG 3D Map Plane Architecture
// ============================================================================

export const LANDABLE_PLANETS = [
  {
    id: 'planet_kepler',
    plane: 0,
    name: 'Kepler-186f',
    subtitle: 'Terrestrial Frontier Outpost',
    desc: 'Lush frontier world with deep-core geothermal drills, titanium crusts, and the primary human command bio-dome.',
    spacePos: new THREE.Vector3(58, 16, -78),
    radius: 19,
    color: 0x1d5e4d,
    glowColor: 0x00f0ff,
    hasRing: false,
    terrainColor: 0x2e4034,
    skyColor: 0x051b24,
    groundY: -60
  },
  {
    id: 'planet_gliese',
    plane: 1,
    name: 'Gliese-667C',
    subtitle: 'Arid Crystal Badlands',
    desc: 'Harsh amber desert world rich in resonant energy crystals, radiation shelters, and ancient alien xenolith monoliths.',
    spacePos: new THREE.Vector3(-66, -10, -92),
    radius: 23,
    color: 0x8a3a10,
    glowColor: 0xffaa00,
    hasRing: true,
    terrainColor: 0x5a2b12,
    skyColor: 0x240902,
    groundY: -60
  },
  {
    id: 'planet_xi9',
    plane: 2,
    name: 'Asteroid Belt Xi-9',
    subtitle: 'Mining & Scavenger Platform',
    desc: 'Low-gravity pirate corridor with scrap heaps, scavenger encampments, and unrefined geothermal helium-3 fissures.',
    spacePos: new THREE.Vector3(4, 28, -58),
    radius: 12,
    color: 0x484252,
    glowColor: 0xaf40ff,
    hasRing: false,
    terrainColor: 0x2c2635,
    skyColor: 0x0e061a,
    groundY: -60
  }
];

export const WORLD_NPCS = [
  // --- Kepler-186f (Plane 0) ---
  {
    id: 101,
    name: "Cmdr. Sarah Vance",
    title: "Tactical Gunnery Master",
    level: 48,
    planetId: "planet_kepler",
    tileX: -8, tileZ: -4,
    color: 0x00d0ff,
    avatarIcon: "👩‍🚀",
    dialogue: {
      greeting: "Greetings, Commander! Keeping our orbital boundaries clear of NGF raiders?",
      options: [
        { text: "I need advanced laser schematics for my armada.", response: "I've calibrated our tachyonic pulse emitters. Added +24 Laser Battery Blueprint to your inventory!", action: "grant_schematic_laser" },
        { text: "Join my armada as Tactical Officer (+22% Laser Damage).", response: "Orders received, Commander! I will synchronize battery fire from your bridge.", action: "recruit_vance" },
        { text: "What is the tactical situation on Kepler-186f?", response: "NGF pirate probes test our perimeter daily, but our surface flak network keeps them at bay." }
      ]
    }
  },
  {
    id: 102,
    name: "Dr. Sean Chen",
    title: "Shield & Bio-Research Scientist",
    level: 35,
    planetId: "planet_kepler",
    tileX: -14, tileZ: -8,
    color: 0x00ffaa,
    avatarIcon: "👨‍🔬",
    dialogue: {
      greeting: "The sub-surface crystalline resonance in this crater is extraordinary! Hello, Pilot.",
      options: [
        { text: "How do crystal matrices reinforce deflector shields?", response: "Resonant crystals oscillate at sub-quantum harmonics. Shield capacity increased by +30%!", action: "recruit_chen" },
        { text: "Can you analyze raw crystal samples from the crater?", response: "Bring me resonant crystal geodes and I will synthesize pure shield battery cells.", action: "trade_crystals" }
      ]
    }
  },
  {
    id: 103,
    name: "Chief Torg",
    title: "Colony Heavy Foundry Engineer",
    level: 52,
    planetId: "planet_kepler",
    tileX: 14, tileZ: -5,
    color: 0xffaa00,
    avatarIcon: "👷",
    dialogue: {
      greeting: "Watch the steam discharge from the drill shaft! What do you need fabricated, Commander?",
      options: [
        { text: "Can you upgrade our geothermal helium extractor?", response: "Give me the metal and credits, and I'll double our extraction yield!", action: "upgrade_drill" },
        { text: "Join my armada as Chief Superstructure Engineer (+35% Hull Armor).", response: "Aye, sir! I'll reinforce your warship bulkheads with ablative nanite plating.", action: "recruit_torg" }
      ]
    }
  },
  {
    id: 104,
    name: "Frontier Prospector Hal",
    title: "Deep-Core Mining Tech",
    level: 28,
    planetId: "planet_kepler",
    tileX: 4, tileZ: 14,
    color: 0xddbb55,
    avatarIcon: "⛏",
    dialogue: {
      greeting: "Strike the pickaxe true at the fault line, and the ore veins fracture cleanly!",
      options: [
        { text: "Teach me how to harvest planetary nodes.", response: "Walk up to any glowing crystal cluster or mineral outcrop and press [E] or click to mine it!" },
        { text: "Trade raw titanium ores for Credits.", response: "I buy titanium and helium at top frontier syndicate market rates.", action: "sell_ores" }
      ]
    }
  },

  // --- Gliese-667C (Plane 1) ---
  {
    id: 105,
    name: "Capt. Hector Reyes",
    title: "Outlaw Star Navigator",
    level: 44,
    planetId: "planet_gliese",
    tileX: -6, tileZ: 2,
    color: 0xff5522,
    avatarIcon: "🧑‍✈️",
    dialogue: {
      greeting: "Gliese-667C isn't for the faint of heart, Pilot. The crystal ion storms will fry your nav-computer.",
      options: [
        { text: "Join my armada as Chief Helmsman (+25% Combat Velocity).", response: "Let's burn thrusters across the outer rim, Commander!", action: "recruit_reyes" },
        { text: "Sell me black-market sub-warp injectors.", response: "Check out these helium overdrive thruster bypasses (+6.5 combat speed).", action: "grant_schematic_engine" }
      ]
    }
  },
  {
    id: 106,
    name: "Sentry Unit Omega-7",
    title: "Automated Patrol Mech",
    level: 60,
    planetId: "planet_gliese",
    tileX: 10, tileZ: 8,
    color: 0xff2244,
    avatarIcon: "🤖",
    dialogue: {
      greeting: "[BEEP] PERIMETER SCAN COMPLETE. ANCIENT MONOLITH SIGNALS DETECTED TO THE NORTH.",
      options: [
        { text: "Request sector threat assessment.", response: "[QUERY LOGGED] EXTREME RIFT INVASION VANGUARD PATROLLING HIGH ORBIT." },
        { text: "Authorize defensive weapon calibration.", response: "[STATUS] THERMAL DEFENSE BEAMS CHARGED TO 100% MAXIMUM POTENCY." }
      ]
    }
  },

  // --- Asteroid Belt Xi-9 (Plane 2) ---
  {
    id: 107,
    name: "Wandering Scavenger Jax",
    title: "Nomad Salvage Trader",
    level: 38,
    planetId: "planet_xi9",
    tileX: 6, tileZ: -6,
    color: 0xbf55ec,
    avatarIcon: "🧳",
    dialogue: {
      greeting: "Scrap, coils, derelict flight recorders... one pilot's wreckage is another's fortune!",
      options: [
        { text: "Show me rare blueprints salvaged from capital shipwrecks.", response: "I've recovered a Dreadnought Superstructure Blueprint from a destroyed Union flag!", action: "grant_dreadnought_blueprint" },
        { text: "Trade scrap metal for credits.", response: "Always buying titanium composite ingots. Deal!", action: "trade_scrap" }
      ]
    }
  }
];

export const WORLD_OBJECTS = [
  // --- Kepler-186f ---
  { id: 201, name: "Helium-3 Extractor Rig", planetId: "planet_kepler", tileX: 16, tileZ: -8, type: "drill", interactText: "Operate Geothermal Drill" },
  { id: 202, name: "Deep-Core Metal Smelter / Refinery", planetId: "planet_kepler", tileX: -14, tileZ: 14, type: "refinery", interactText: "Smelt Ores to Metals" },
  { id: 203, name: "Surface Defense Flak Battery", planetId: "planet_kepler", tileX: 12, tileZ: 12, type: "turret", interactText: "Calibrate Point-Defense Cannon" },
  { id: 204, name: "Pressurized Command Bio-Dome", planetId: "planet_kepler", tileX: -16, tileZ: -10, type: "dome", interactText: "Enter Settlement Habitat" },
  { id: 205, name: "Telemetry Radar Array", planetId: "planet_kepler", tileX: -12, tileZ: 14, type: "radar", interactText: "Access Deep-Space Telemetry" },
  { id: 206, name: "Orbital Dropship Landing Pad", planetId: "planet_kepler", tileX: 0, tileZ: 0, type: "pad", interactText: "Access Docking Terminal / Launch" },
  { id: 207, name: "Colony Supply Cache", planetId: "planet_kepler", tileX: -4, tileZ: -6, type: "cache", interactText: "Open Storage Vault" },

  // --- Gliese-667C ---
  { id: 211, name: "Crystal Siphon Quarry Excavator", planetId: "planet_gliese", tileX: 14, tileZ: -6, type: "drill", interactText: "Excavate Energy Crystals" },
  { id: 212, name: "Arid Outpost Smelter", planetId: "planet_gliese", tileX: -12, tileZ: 12, type: "refinery", interactText: "Process Rare Heavy Ores" },
  { id: 213, name: "Sub-Surface Biosphere Bunker", planetId: "planet_gliese", tileX: -14, tileZ: -8, type: "dome", interactText: "Enter Radiation Bunker" },
  { id: 214, name: "Thermal Beam Defense Battery", planetId: "planet_gliese", tileX: 10, tileZ: 10, type: "turret", interactText: "Check Thermal Beam Charge" },
  { id: 215, name: "Ancient Xenolith Monolith", planetId: "planet_gliese", tileX: 0, tileZ: -18, type: "monolith", interactText: "Commune with Xenolith Obelisk" },
  { id: 216, name: "Badlands Landing Gantry", planetId: "planet_gliese", tileX: 0, tileZ: 0, type: "pad", interactText: "Access Docking Terminal / Launch" },

  // --- Asteroid Xi-9 ---
  { id: 221, name: "Asteroid Mining Scraper", planetId: "planet_xi9", tileX: 12, tileZ: -4, type: "drill", interactText: "Scrape Asteroid Crust" },
  { id: 222, name: "Pirate Smuggling Depot", planetId: "planet_xi9", tileX: -10, tileZ: -8, type: "dome", interactText: "Enter Scavenger Den" },
  { id: 223, name: "Kinetic Point-Defense Array", planetId: "planet_xi9", tileX: 8, tileZ: 8, type: "turret", interactText: "Inspect Kinetic Flak" },
  { id: 224, name: "Scrap Metal Salvage Compactor", planetId: "planet_xi9", tileX: -8, tileZ: 10, type: "refinery", interactText: "Compact Salvage Scrap" },
  { id: 225, name: "Asteroid Clamping Cradle", planetId: "planet_xi9", tileX: 0, tileZ: 0, type: "pad", interactText: "Access Docking Terminal / Launch" }
];

export const WORLD_GROUND_NODES = [
  // Kepler nodes
  { id: 301, name: "Resonant Energy Crystal Cluster", planetId: "planet_kepler", tileX: -22, tileZ: -18, yieldType: "crystal", amount: 20, respawnSec: 12 },
  { id: 302, name: "Titanium Metal Crust Outcropping", planetId: "planet_kepler", tileX: 24, tileZ: 16, yieldType: "metal", amount: 35, respawnSec: 10 },
  { id: 303, name: "Geothermal Helium-3 Vent", planetId: "planet_kepler", tileX: 20, tileZ: -20, yieldType: "helium3", amount: 15, respawnSec: 15 },
  { id: 304, name: "Salvage Cargo Pod", planetId: "planet_kepler", tileX: -18, tileZ: 22, yieldType: "credits", amount: 250, respawnSec: 25 },

  // Gliese nodes
  { id: 311, name: "Pure Prismatic Crystal Geode", planetId: "planet_gliese", tileX: -18, tileZ: -14, yieldType: "crystal", amount: 45, respawnSec: 14 },
  { id: 312, name: "Heavy Obsidian Ore Vein", planetId: "planet_gliese", tileX: 22, tileZ: 18, yieldType: "metal", amount: 50, respawnSec: 12 },
  { id: 313, name: "Ancient Xenolith Artifact Shard", planetId: "planet_gliese", tileX: 2, tileZ: -24, yieldType: "credits", amount: 400, respawnSec: 35 },

  // Xi-9 nodes
  { id: 321, name: "Asteroid Nickel-Iron Deposit", planetId: "planet_xi9", tileX: -16, tileZ: 14, yieldType: "metal", amount: 40, respawnSec: 10 },
  { id: 322, name: "Vented Plasma Gas Pocket", planetId: "planet_xi9", tileX: 18, tileZ: -14, yieldType: "helium3", amount: 25, respawnSec: 15 },
  { id: 323, name: "Derelict Warship Scrap Heap", planetId: "planet_xi9", tileX: -12, tileZ: -16, yieldType: "credits", amount: 320, respawnSec: 20 }
];

export class MmorpgWorldEngine {
  constructor(scene, camera, renderer, state, sound, showToast, refreshCommanderUI, buildShipMesh) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.state = state;
    this.sound = sound;
    this.showToast = showToast;
    this.refreshCommanderUI = refreshCommanderUI;
    this.buildShipMesh = buildShipMesh;

    // Active planetary state
    this.activePlanetId = 'planet_kepler';
    this.activePlanet = LANDABLE_PLANETS[0];
    this.isLanding = false;
    this.isLaunching = false;

    // Three.js groups
    this.spacePlanetsGroup = new THREE.Group();
    this.surfaceWorldGroup = new THREE.Group();
    this.surfaceWorldGroup.position.set(0, -60, 0);

    this.scene.add(this.spacePlanetsGroup);
    this.scene.add(this.surfaceWorldGroup);

    // Entities collections
    this.orbitPlanetMeshes = [];
    this.npcMeshes = [];
    this.objectMeshes = [];
    this.nodeMeshes = [];
    this.floatingTexts = [];

    // Landed Ship & Avatar
    this.landedShip = null;
    this.avatar = null;
    this.avatarTarget = null;
    this.avatarLegs = [];
    this.avatarArms = [];

    // Camera control
    this.camAzimuth = 0.0;
    this.camElevation = 0.45;
    this.camDistance = 14.0;
    this.isRightMouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Mobile virtual joystick state
    this.mobileJoy = { x: 0, z: 0 };
    this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Raycaster for hover/click interactions
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredEntity = null;
    this.nearestInteractable = null;

    // Movement keys
    this.keys = {};

    this._initSpacePlanets();
    this._initSurfaceWorld();
    this._initAvatar();
    this._setupInputEvents();
  }

  // --------------------------------------------------------------------------
  // CELESTIAL SPACE / ORBIT PLANETS
  // --------------------------------------------------------------------------
  _initSpacePlanets() {
    LANDABLE_PLANETS.forEach(planet => {
      const pGroup = new THREE.Group();
      pGroup.position.copy(planet.spacePos);

      // Planet sphere
      const sphereGeo = new THREE.SphereGeometry(planet.radius, 32, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: planet.color,
        roughness: 0.75,
        metalness: 0.15,
        flatShading: true
      });
      const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
      pGroup.add(planetMesh);

      // Atmospheric glowing halo
      const atmoGeo = new THREE.SphereGeometry(planet.radius * 1.12, 24, 18);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: planet.glowColor,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      pGroup.add(atmoMesh);

      // Celestial ring (if applicable)
      if (planet.hasRing) {
        const ringGeo = new THREE.TorusGeometry(planet.radius * 1.6, planet.radius * 0.25, 4, 36);
        const ringMat = new THREE.MeshStandardMaterial({
          color: planet.glowColor,
          roughness: 0.5,
          metalness: 0.4,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 3;
        ringMesh.rotation.y = -Math.PI / 6;
        pGroup.add(ringMesh);
      }

      // Overhead 3D World Nameplate Tag
      const tagCanvas = document.createElement('canvas');
      tagCanvas.width = 320;
      tagCanvas.height = 64;
      const ctx = tagCanvas.getContext('2d');
      ctx.fillStyle = 'rgba(2, 10, 24, 0.85)';
      ctx.strokeStyle = `#${planet.glowColor.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 4;
      ctx.fillRect(4, 4, 312, 56);
      ctx.strokeRect(4, 4, 312, 56);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`🪐 ${planet.name}`, 160, 32);
      ctx.fillStyle = `#${planet.glowColor.toString(16).padStart(6, '0')}`;
      ctx.font = '16px monospace';
      ctx.fillText(`[ ${planet.subtitle} • LANDABLE ]`, 160, 52);

      const tagTexture = new THREE.CanvasTexture(tagCanvas);
      const tagMat = new THREE.SpriteMaterial({ map: tagTexture, depthTest: false });
      const tagSprite = new THREE.Sprite(tagMat);
      tagSprite.scale.set(16, 3.2, 1);
      tagSprite.position.set(0, planet.radius + 6.0, 0);
      pGroup.add(tagSprite);

      pGroup.userData = {
        type: 'planet_celestial',
        planetData: planet,
        rotSpeed: 0.003
      };

      this.spacePlanetsGroup.add(pGroup);
      this.orbitPlanetMeshes.push(pGroup);
    });
  }

  // --------------------------------------------------------------------------
  // 3D SURFACE WORLD PLANE & TILES
  // --------------------------------------------------------------------------
  _initSurfaceWorld() {
    this._rebuildSurfaceTerrain(this.activePlanet);
  }

  _rebuildSurfaceTerrain(planet) {
    // Clear old meshes
    while (this.surfaceWorldGroup.children.length > 0) {
      const child = this.surfaceWorldGroup.children[0];
      this.surfaceWorldGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }
    this.npcMeshes.length = 0;
    this.objectMeshes.length = 0;
    this.nodeMeshes.length = 0;

    // 1. Procedural Terrain Mesh matching heightmap
    const terrainGeo = new THREE.PlaneGeometry(180, 180, 36, 36);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = Math.hypot(x, z);
      let elev = 0;
      if (d > 20) {
        elev = Math.sin(x * 0.09) * Math.cos(z * 0.09) * 4.0 + Math.sin(x * 0.04 + z * 0.04) * 3.5;
        if (d < 32) elev *= (d - 20) / 12;
      } else {
        elev = (Math.random() - 0.5) * 0.15;
      }
      pos.setY(i, elev);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: planet.terrainColor,
      roughness: 0.9,
      metalness: 0.15,
      flatShading: true
    });
    this.terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    this.terrainMesh.userData = { type: 'ground' };
    this.surfaceWorldGroup.add(this.terrainMesh);

    // 2. Central Landing Pad at (0, 0.3, 0)
    const padGroup = new THREE.Group();
    const padMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(8.5, 9.0, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x1a2230, metalness: 0.85, roughness: 0.25 })
    );
    padMesh.position.y = 0.3;
    padGroup.add(padMesh);

    // Glowing landing beacon ring
    const ringGeo = new THREE.RingGeometry(7.0, 7.8, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: planet.glowColor, side: THREE.DoubleSide }));
    ringMesh.position.y = 0.62;
    padGroup.add(ringMesh);

    padGroup.position.set(0, this._sampleHeight(0, 0), 0);
    this.surfaceWorldGroup.add(padGroup);

    // 3. Spawn Landed Player Flagship
    this._spawnLandedShip();

    // 4. Spawn NPCs for current planet
    WORLD_NPCS.filter(npc => npc.planetId === planet.id).forEach(npc => {
      this._spawnNpcMesh(npc);
    });

    // 5. Spawn World Scenery & Interactive Objects
    WORLD_OBJECTS.filter(obj => obj.planetId === planet.id).forEach(obj => {
      this._spawnObjectMesh(obj);
    });

    // 6. Spawn Minable Ground Resource Nodes
    WORLD_GROUND_NODES.filter(node => node.planetId === planet.id).forEach(node => {
      this._spawnGroundNodeMesh(node);
    });
  }

  _sampleHeight(wx, wz) {
    const d = Math.hypot(wx, wz);
    if (d <= 20) return 0.0;
    let elev = Math.sin(wx * 0.09) * Math.cos(wz * 0.09) * 4.0 + Math.sin(wx * 0.04 + wz * 0.04) * 3.5;
    if (d < 32) elev *= (d - 20) / 12;
    return elev;
  }

  // --------------------------------------------------------------------------
  // SPAWN ENTITIES (NPCs, OBJECTS, NODES) WITH MMORPG IDS
  // --------------------------------------------------------------------------
  _spawnNpcMesh(npc) {
    const group = new THREE.Group();
    const y = this._sampleHeight(npc.tileX, npc.tileZ);
    group.position.set(npc.tileX, y, npc.tileZ);

    // Humanoid Body
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.1, 0.45),
      new THREE.MeshStandardMaterial({ color: npc.color, metalness: 0.6, roughness: 0.35 })
    );
    torso.position.y = 1.1;
    group.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xe0c8a8, roughness: 0.6 })
    );
    head.position.y = 1.85;
    group.add(head);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.14, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    visor.position.set(0, 1.88, 0.22);
    group.add(visor);

    // Legs
    [-0.22, 0.22].forEach(lx => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x111a28, metalness: 0.8, roughness: 0.3 })
      );
      leg.position.set(lx, 0.45, 0);
      group.add(leg);
    });

    // Overhead OpenRSC MMORPG Name Tag
    const tagSprite = this._createBillboardTag(`[NPC #${npc.id}] ${npc.name}`, `[${npc.title} • Lv ${npc.level}]`, '#ffd700', `#${npc.color.toString(16).padStart(6, '0')}`);
    tagSprite.position.y = 2.6;
    group.add(tagSprite);

    group.userData = {
      type: 'npc',
      data: npc,
      baseY: y
    };

    this.surfaceWorldGroup.add(group);
    this.npcMeshes.push(group);
  }

  _spawnObjectMesh(obj) {
    const group = new THREE.Group();
    const y = this._sampleHeight(obj.tileX, obj.tileZ);
    group.position.set(obj.tileX, y, obj.tileZ);

    let tagY = 5.0;

    switch (obj.type) {
      case 'drill': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.0, 4.5), new THREE.MeshStandardMaterial({ color: 0x3d2c18, metalness: 0.85, roughness: 0.25 }));
        base.position.y = 2.0;
        group.add(base);
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 4.0, 12), new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.9, roughness: 0.1 }));
        shaft.position.y = 4.2;
        group.add(shaft);
        group.userData.shaft = shaft;
        tagY = 6.8;
        break;
      }
      case 'dome': {
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(4.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: 0x163854, metalness: 0.5, roughness: 0.2, transparent: true, opacity: 0.85 })
        );
        group.add(dome);
        tagY = 5.5;
        break;
      }
      case 'turret': {
        const tBase = new THREE.Mesh(new THREE.BoxGeometry(3, 1.8, 3), new THREE.MeshStandardMaterial({ color: 0x223242, metalness: 0.85, roughness: 0.2 }));
        tBase.position.y = 0.9;
        group.add(tBase);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.15 }));
        barrel.rotation.x = Math.PI / 4;
        barrel.position.set(0, 2.2, 0);
        group.add(barrel);
        group.userData.barrel = barrel;
        tagY = 4.4;
        break;
      }
      case 'refinery': {
        const ref = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 5.0, 8), new THREE.MeshStandardMaterial({ color: 0x2b3848, metalness: 0.8, roughness: 0.3 }));
        ref.position.y = 2.5;
        group.add(ref);
        tagY = 5.8;
        break;
      }
      case 'monolith': {
        const mono = new THREE.Mesh(new THREE.ConeGeometry(1.6, 7.5, 4), new THREE.MeshStandardMaterial({ color: 0x050c18, metalness: 0.9, roughness: 0.1, emissive: 0x00ffff, emissiveIntensity: 0.4 }));
        mono.position.y = 3.8;
        group.add(mono);
        tagY = 8.0;
        break;
      }
      default: {
        const generic = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.0, 2.5), new THREE.MeshStandardMaterial({ color: 0x203550, metalness: 0.8, roughness: 0.25 }));
        generic.position.y = 1.0;
        group.add(generic);
        tagY = 3.2;
      }
    }

    // Overhead Tag
    const tag = this._createBillboardTag(`[Object #${obj.id}] ${obj.name}`, `[ ${obj.interactText} ]`, '#00e1ff', '#8cb0d0');
    tag.position.y = tagY;
    group.add(tag);

    group.userData.type = 'world_object';
    group.userData.data = obj;

    this.surfaceWorldGroup.add(group);
    this.objectMeshes.push(group);
  }

  _spawnGroundNodeMesh(node) {
    const group = new THREE.Group();
    const y = this._sampleHeight(node.tileX, node.tileZ);
    group.position.set(node.tileX, y, node.tileZ);

    let col = 0x00f0ff;
    if (node.yieldType === 'metal') col = 0xaabbcc;
    else if (node.yieldType === 'helium3') col = 0xffaa00;
    else if (node.yieldType === 'credits') col = 0xffd700;

    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.1, 1),
      new THREE.MeshStandardMaterial({ color: col, metalness: 0.85, roughness: 0.15, emissive: col, emissiveIntensity: 0.5 })
    );
    mesh.position.y = 0.8;
    group.add(mesh);

    const tag = this._createBillboardTag(`[Node #${node.id}] ${node.name}`, `[ Mine / Gather +${node.amount} ]`, '#00ffaa', '#ffd700');
    tag.position.y = 2.4;
    group.add(tag);

    group.userData = {
      type: 'ground_node',
      data: node,
      mesh,
      cooldown: 0
    };

    this.surfaceWorldGroup.add(group);
    this.nodeMeshes.push(group);
  }

  _createBillboardTag(line1, line2, col1 = '#ffffff', col2 = '#00e1ff') {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 64;
    const ctx = c.getContext('2d');

    ctx.fillStyle = 'rgba(4, 12, 28, 0.85)';
    ctx.strokeStyle = col1;
    ctx.lineWidth = 3;
    ctx.fillRect(4, 4, 312, 56);
    ctx.strokeRect(4, 4, 312, 56);

    ctx.fillStyle = col1;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(line1, 160, 28);

    ctx.fillStyle = col2;
    ctx.font = '14px monospace';
    ctx.fillText(line2, 160, 48);

    const texture = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(6.5, 1.3, 1);
    return sprite;
  }

  // --------------------------------------------------------------------------
  // LANDED SHIP & 3D ON-FOOT COMMANDER AVATAR
  // --------------------------------------------------------------------------
  _spawnLandedShip() {
    if (this.landedShip) {
      this.surfaceWorldGroup.remove(this.landedShip);
    }

    const shipData = this.state.fleet[0] || { type: 'fighter', color: 0x00a8ff };
    this.landedShip = this.buildShipMesh(shipData, true);
    this.landedShip.position.set(0, 1.2, 0);
    this.landedShip.rotation.set(0, Math.PI, 0);

    // Tag for Landed Ship
    const tag = this._createBillboardTag(`[Flagship] ${shipData.name || 'Viper Fighter'}`, `[ Press E to Board & Launch ]`, '#00ff88', '#ffffff');
    tag.position.y = 4.2;
    this.landedShip.add(tag);

    this.landedShip.userData.type = 'landed_ship';
    this.surfaceWorldGroup.add(this.landedShip);
  }

  _initAvatar() {
    this.avatar = new THREE.Group();

    // Torso with tactical flight armor
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.85, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x142848, metalness: 0.7, roughness: 0.3 })
    );
    torso.position.y = 0.95;
    this.avatar.add(torso);

    // Jetpack on back
    const jetpack = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.55, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x00aaff, metalness: 0.85, roughness: 0.2 })
    );
    jetpack.position.set(0, 0.95, -0.28);
    this.avatar.add(jetpack);

    // Helmet with visor
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0xd8e8f8, metalness: 0.8, roughness: 0.2 })
    );
    helmet.position.y = 1.55;
    this.avatar.add(helmet);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.12, 0.18),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    visor.position.set(0, 1.56, 0.2);
    this.avatar.add(visor);

    // Left & Right Arms
    this.avatarArms = [];
    [-0.42, 0.42].forEach(ax => {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.65, 8),
        new THREE.MeshStandardMaterial({ color: 0x102038, metalness: 0.7, roughness: 0.3 })
      );
      arm.position.set(ax, 0.95, 0);
      this.avatar.add(arm);
      this.avatarArms.push(arm);
    });

    // Left & Right Legs
    this.avatarLegs = [];
    [-0.18, 0.18].forEach(lx => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.75, 8),
        new THREE.MeshStandardMaterial({ color: 0x0a1424, metalness: 0.85, roughness: 0.3 })
      );
      leg.position.set(lx, 0.4, 0);
      this.avatar.add(leg);
      this.avatarLegs.push(leg);
    });

    // Player Overhead Tag
    const tag = this._createBillboardTag(`[Commander ${this.state.callsign || 'Ace'}]`, `[ Combat Lv 45 • Active ]`, '#00ffaa', '#ffffff');
    tag.position.y = 2.25;
    this.avatar.add(tag);

    // Initial position on pad
    this.avatar.position.set(3.5, 0.6, 2.0);
    this.avatar.visible = Boolean(this.state.onFoot);
    this.surfaceWorldGroup.add(this.avatar);
  }

  // --------------------------------------------------------------------------
  // INPUTS, RAYCASTING & CLICK-TO-MOVE (OPENRSC MECHANIC)
  // --------------------------------------------------------------------------
  _setupInputEvents() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'KeyE') {
        this._handleInteractKey();
      }
      if (e.code === 'KeyL' && this.state.viewMode !== 'surface') {
        this.landOnPlanet(this.activePlanetId);
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    // Mouse rotation (Right-click drag)
    window.addEventListener('mousedown', e => {
      if (e.button === 2) {
        this.isRightMouseDown = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else if (e.button === 0) {
        this._handleClick(e);
      }
    });

    window.addEventListener('mouseup', e => {
      if (e.button === 2) this.isRightMouseDown = false;
    });

    window.addEventListener('mousemove', e => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (this.isRightMouseDown) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.camAzimuth -= dx * 0.007;
        this.camElevation = Math.max(0.1, Math.min(1.4, this.camElevation + dy * 0.007));
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('wheel', e => {
      if (this.state.viewMode === 'surface') {
        this.camDistance = Math.max(6.0, Math.min(32.0, this.camDistance + e.deltaY * 0.02));
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', e => e.preventDefault());

    // Connect HTML HUD buttons
    const btnToggleFoot = document.getElementById('btn-toggle-foot-ship');
    if (btnToggleFoot) {
      btnToggleFoot.addEventListener('click', () => this.toggleFootOrShip());
    }

    const btnTogglePov = document.getElementById('btn-toggle-pov');
    if (btnTogglePov) {
      btnTogglePov.addEventListener('click', () => this.togglePov());
    }

    const btnBackpack = document.getElementById('btn-view-backpack');
    if (btnBackpack) {
      btnBackpack.addEventListener('click', () => this._toggleBackpackModal());
    }

    const btnCloseBackpack = document.getElementById('btn-close-backpack');
    if (btnCloseBackpack) {
      btnCloseBackpack.addEventListener('click', () => {
        const modal = document.getElementById('mmorpg-backpack-modal');
        if (modal) modal.style.display = 'none';
      });
    }

    const btnLandTarget = document.getElementById('btn-land-target-planet');
    if (btnLandTarget) {
      btnLandTarget.addEventListener('click', () => {
        this.landOnPlanet(this.activePlanetId);
      });
    }

    // Mobile virtual controls
    this._setupMobileJoystick();
  }

  _handleClick(e) {
    if (e.target.closest('#screen-commander') && !e.target.closest('#canvas3d')) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // If in Space view: detect clicks on celestial planets
    if (this.state.viewMode !== 'surface') {
      const hits = this.raycaster.intersectObjects(this.orbitPlanetMeshes, true);
      if (hits.length > 0) {
        let p = hits[0].object;
        while (p && !p.userData.planetData) p = p.parent;
        if (p && p.userData.planetData) {
          this._selectSpacePlanet(p.userData.planetData);
          return;
        }
      }
      return;
    }

    // In Surface view:
    // Check click on NPCs
    const npcHits = this.raycaster.intersectObjects(this.npcMeshes, true);
    if (npcHits.length > 0) {
      let n = npcHits[0].object;
      while (n && !n.userData.data) n = n.parent;
      if (n && n.userData.data) {
        this._openNpcDialogue(n.userData.data);
        return;
      }
    }

    // Check click on Resource Nodes
    const nodeHits = this.raycaster.intersectObjects(this.nodeMeshes, true);
    if (nodeHits.length > 0) {
      let nodeObj = nodeHits[0].object;
      while (nodeObj && !nodeObj.userData.data) nodeObj = nodeObj.parent;
      if (nodeObj && nodeObj.userData.data) {
        this._mineResourceNode(nodeObj);
        return;
      }
    }

    // Check click on Landed Ship
    if (this.landedShip) {
      const shipHits = this.raycaster.intersectObjects([this.landedShip], true);
      if (shipHits.length > 0) {
        this.toggleFootOrShip();
        return;
      }
    }

    // Click on Terrain -> Click-to-Move Pathing
    if (this.terrainMesh && this.state.onFoot) {
      const terrHits = this.raycaster.intersectObject(this.terrainMesh);
      if (terrHits.length > 0) {
        const pt = terrHits[0].point;
        this.avatarTarget = new THREE.Vector3(pt.x, this._sampleHeight(pt.x, pt.z), pt.z);
        this.sound.playUi('click');
        this._spawnMovePin(this.avatarTarget);
      }
    }
  }

  _spawnMovePin(pos) {
    const pin = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.6, 16),
      new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide })
    );
    pin.rotation.x = -Math.PI / 2;
    pin.position.set(pos.x, pos.y + 0.1, pos.z);
    this.surfaceWorldGroup.add(pin);
    setTimeout(() => {
      this.surfaceWorldGroup.remove(pin);
      pin.geometry.dispose();
      pin.material.dispose();
    }, 600);
  }

  // --------------------------------------------------------------------------
  // PLANETARY LANDING & ORBIT TRANSITIONS
  // --------------------------------------------------------------------------
  _selectSpacePlanet(planetData) {
    this.activePlanetId = planetData.id;
    this.activePlanet = planetData;
    this.sound.playUi('whoosh');

    const card = document.getElementById('space-planet-target-card');
    if (card) {
      card.style.display = 'block';
      document.getElementById('target-planet-name').innerText = planetData.name;
      document.getElementById('target-planet-desc').innerText = planetData.desc;
      document.getElementById('target-planet-badge').innerText = `Plane ${planetData.plane} • ${planetData.subtitle}`;
    }
    this.showToast(`🎯 Targeted ${planetData.name} in space. Click 'LAND SHIP' to initiate atmospheric descent!`, 'info');
  }

  landOnPlanet(planetId) {
    const planet = LANDABLE_PLANETS.find(p => p.id === planetId) || LANDABLE_PLANETS[0];
    this.activePlanetId = planet.id;
    this.activePlanet = planet;

    this.sound.playUi('whoosh');
    this.showToast(`🚀 Atmospheric Entry: Descending onto ${planet.name} surface...`, 'success');

    // Hide space target card
    const card = document.getElementById('space-planet-target-card');
    if (card) card.style.display = 'none';

    // Rebuild surface for target planet
    this._rebuildSurfaceTerrain(planet);

    // Switch view state
    this.state.viewMode = 'surface';
    this.state.onFoot = true; // start on foot or beside ship
    this.avatar.position.set(3.5, 0.6, 2.0);
    this.avatar.visible = true;

    // Show surface HUD
    const sHud = document.getElementById('mmorpg-surface-hud');
    if (sHud) {
      sHud.style.display = 'flex';
      document.getElementById('surface-hud-planet').innerText = `${planet.name} (Plane ${planet.plane})`;
      document.getElementById('surface-hud-state').innerText = 'On Foot (Exited Ship)';
    }

    // Mobile: show surface joystick controls
    if (this.isMobile) {
      const ms = document.getElementById('mobile-surface-controls');
      if (ms) ms.style.display = 'block';
    }

    this.refreshCommanderUI();
  }

  togglePov() {
    this.firstPerson = !this.firstPerson;
    const btn = document.getElementById('btn-toggle-pov');
    if (this.firstPerson) {
      if (btn) btn.innerText = '📷 POV: 1ST PERSON';
      this.camDistance = 0.5;
      this.camElevation = 0.15;
      if (this.avatar) {
        // Hide head/body in true 1st person
        this.avatar.traverse(c => {
          if (c.isMesh) c.visible = false;
        });
      }
      this.showToast('📷 First-Person POV Activated (Look with Right-Click / WASD)', 'info');
    } else {
      if (btn) btn.innerText = '📷 POV: 3RD PERSON';
      this.camDistance = 14.0;
      this.camElevation = 0.45;
      if (this.avatar) {
        this.avatar.traverse(c => {
          if (c.isMesh) c.visible = true;
        });
      }
      this.showToast('📷 Third-Person Chase Camera Activated', 'info');
    }
  }

  launchToOrbit() {
    this.sound.playUi('whoosh');
    this.showToast('🚀 Thrusters ignition: Ascending into orbital space citadel!', 'info');

    this.state.viewMode = 'orbit';
    this.state.onFoot = false;
    this.avatar.visible = false;

    // Hide surface HUD & dialogue
    const sHud = document.getElementById('mmorpg-surface-hud');
    if (sHud) sHud.style.display = 'none';
    const dBox = document.getElementById('mmorpg-dialogue-box');
    if (dBox) dBox.style.display = 'none';
    const pBox = document.getElementById('mmorpg-action-prompt');
    if (pBox) pBox.style.display = 'none';

    // Mobile: hide surface controls, reset joystick
    if (this.isMobile) {
      const ms = document.getElementById('mobile-surface-controls');
      if (ms) ms.style.display = 'none';
      this.mobileJoy.x = 0;
      this.mobileJoy.z = 0;
    }

    this.refreshCommanderUI();
  }

  toggleFootOrShip() {
    this.state.onFoot = !this.state.onFoot;
    this.avatar.visible = Boolean(this.state.onFoot);

    if (this.state.onFoot) {
      this.sound.playUi('mechanical');
      this.showToast('👨‍🚀 Exited cockpit. You are now exploring the surface on foot.', 'info');
      document.getElementById('surface-hud-state').innerText = 'On Foot (Exited Ship)';
      document.getElementById('btn-toggle-foot-ship').innerText = '🚀 BOARD SHIP & LAUNCH';
    } else {
      this.launchToOrbit();
    }
  }

  // --------------------------------------------------------------------------
  // MMORPG DIALOGUE SYSTEM (OPENRSC ARCHITECTURE)
  // --------------------------------------------------------------------------
  _openNpcDialogue(npc) {
    this.sound.playUi('whoosh');

    const dBox = document.getElementById('mmorpg-dialogue-box');
    if (!dBox) return;

    dBox.style.display = 'block';
    document.getElementById('dialogue-avatar').innerText = npc.avatarIcon || '👨‍🚀';
    document.getElementById('dialogue-name').innerText = npc.name;
    document.getElementById('dialogue-title').innerText = npc.title;
    document.getElementById('dialogue-id-badge').innerText = `NPC #${npc.id} • Level ${npc.level}`;
    document.getElementById('dialogue-text').innerText = npc.dialogue.greeting;

    const optContainer = document.getElementById('dialogue-options');
    optContainer.innerHTML = '';

    npc.dialogue.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-primary';
      btn.style.textAlign = 'left';
      btn.style.padding = '8px 14px';
      btn.style.fontSize = '13px';
      btn.innerHTML = `<span style="color:#ffd700; margin-right:6px;">[${idx + 1}]</span> ${opt.text}`;

      btn.addEventListener('click', () => {
        document.getElementById('dialogue-text').innerText = opt.response;
        this.sound.playUi('click');
        if (opt.action) {
          this._executeDialogueAction(opt.action, npc);
        }
      });
      optContainer.appendChild(btn);
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.fontSize = '12px';
    closeBtn.innerText = '◄ End Conversation';
    closeBtn.addEventListener('click', () => {
      dBox.style.display = 'none';
      this.sound.playUi('click');
    });
    optContainer.appendChild(closeBtn);
  }

  _executeDialogueAction(action, npc) {
    switch (action) {
      case 'recruit_vance':
      case 'recruit_chen':
      case 'recruit_torg':
      case 'recruit_reyes':
        this.sound.playUi('upgrade');
        this.showToast(`🎖 ${npc.name} recruited into your naval fleet command!`, 'success');
        break;
      case 'grant_schematic_laser':
      case 'grant_schematic_engine':
      case 'grant_dreadnought_blueprint':
        this.sound.playUi('upgrade');
        this.showToast(`📜 Blueprint added to your Commander Backpack!`, 'success');
        break;
      case 'upgrade_drill':
        this.state.credits += 300;
        this.sound.playUi('coins');
        this.showToast('⚙ Drill extraction overclocked: +300 CR bonus!', 'success');
        break;
      case 'sell_ores':
      case 'trade_crystals':
      case 'trade_scrap':
        this.state.credits += 450;
        this.sound.playUi('coins');
        this.showToast('💰 Mineral trade executed: +450 CR deposited!', 'success');
        this.refreshCommanderUI();
        break;
    }
  }

  // --------------------------------------------------------------------------
  // MINING / RESOURCE GATHERING
  // --------------------------------------------------------------------------
  _mineResourceNode(nodeGroup) {
    const node = nodeGroup.userData.data;
    if (nodeGroup.userData.cooldown > 0) {
      this.showToast(`⏳ ${node.name} depleted. Respawning shortly...`, 'warn');
      return;
    }

    this.sound.playUi('mining');

    // Laser beam effect from avatar to node
    const from = this.avatar.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    const to = nodeGroup.position.clone().add(new THREE.Vector3(0, 0.8, 0));
    const beam = this._createMiningBeam(from, to);

    setTimeout(() => {
      this.surfaceWorldGroup.remove(beam);
      beam.geometry.dispose();
      beam.material.dispose();

      // Yield resources
      if (node.yieldType === 'credits') {
        this.state.credits += node.amount;
        this.showToast(`💎 Scavenged cargo pod: +${node.amount} Credits!`, 'success');
      } else {
        this.state.credits += node.amount * 8;
        this.showToast(`⛏ Mined ${node.name}: +${node.amount} ${node.yieldType.toUpperCase()} (+${node.amount * 8} CR)!`, 'success');
      }

      this.sound.playUi('coins');
      this.refreshCommanderUI();

      // Deplete & trigger cooldown
      nodeGroup.userData.cooldown = node.respawnSec || 12;
      nodeGroup.userData.mesh.scale.set(0.3, 0.3, 0.3);
    }, 450);
  }

  _createMiningBeam(from, to) {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(0.06, 0.06, len, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const beam = new THREE.Mesh(geo, mat);

    beam.position.copy(from).add(dir.clone().multiplyScalar(0.5));
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    this.surfaceWorldGroup.add(beam);
    return beam;
  }

  _toggleBackpackModal() {
    const modal = document.getElementById('mmorpg-backpack-modal');
    if (!modal) return;
    const isVisible = modal.style.display === 'block';
    modal.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
      const list = document.getElementById('backpack-items-list');
      list.innerHTML = `
        <div style="display:flex; justify-content:space-between; padding:6px; background:rgba(0,30,60,0.5); border-radius:4px;">
          <span>⚡ Galactic Credits:</span>
          <strong style="color:#ffd700;">${this.state.credits.toLocaleString()} CR</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px; background:rgba(0,30,60,0.5); border-radius:4px;">
          <span>💠 Resonant Crystals:</span>
          <strong style="color:#00ffea;">45 Units</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px; background:rgba(0,30,60,0.5); border-radius:4px;">
          <span>🔩 Titanium Metal:</span>
          <strong style="color:#aaccff;">120 Units</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px; background:rgba(0,30,60,0.5); border-radius:4px;">
          <span>🔋 Geothermal Helium-3:</span>
          <strong style="color:#ffaa00;">28 Canisters</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:6px; background:rgba(0,30,60,0.5); border-radius:4px;">
          <span>📜 Recovered Blueprints:</span>
          <strong style="color:#00ffaa;">Tachyonic Laser, Dreadnought Hull</strong>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // PER-FRAME UPDATE LOOP
  // --------------------------------------------------------------------------
  update(delta, elapsed) {
    // 1. Rotate space celestial planets
    this.orbitPlanetMeshes.forEach(p => {
      p.rotation.y += p.userData.rotSpeed || 0.003;
    });

    // 2. Surface mode updates
    if (this.state.viewMode === 'surface') {
      this._updateSurface(delta, elapsed);
    }
  }

  _updateSurface(delta, elapsed) {
    // Animate drill shafts & radar
    this.objectMeshes.forEach(om => {
      if (om.userData.shaft) {
        om.userData.shaft.position.y = 4.2 + Math.sin(elapsed * 7.5) * 0.8;
      }
      if (om.userData.barrel) {
        om.userData.barrel.rotation.y = Math.sin(elapsed * 0.8) * 0.5;
      }
    });

    // Respawn resource nodes
    this.nodeMeshes.forEach(nm => {
      if (nm.userData.cooldown > 0) {
        nm.userData.cooldown -= delta;
        if (nm.userData.cooldown <= 0) {
          nm.userData.mesh.scale.set(1.0, 1.0, 1.0);
        }
      }
    });

    // Avatar movement & on-foot physics
    if (this.state.onFoot && this.avatar) {
      let moveX = 0;
      let moveZ = 0;
      const speed = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? 14.0 : 8.5;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

      // Mobile virtual joystick overrides keyboard input
      if (this.mobileJoy.x !== 0 || this.mobileJoy.z !== 0) {
        moveX = this.mobileJoy.x;
        moveZ = this.mobileJoy.z;
      }

      // Click-to-move pathing target
      if (this.avatarTarget) {
        const toTarget = new THREE.Vector2(this.avatarTarget.x - this.avatar.position.x, this.avatarTarget.z - this.avatar.position.z);
        if (toTarget.length() > 0.4) {
          toTarget.normalize();
          moveX = toTarget.x;
          moveZ = toTarget.y;
        } else {
          this.avatarTarget = null;
        }
      }

      const isMoving = (moveX !== 0 || moveZ !== 0);
      if (isMoving) {
        const moveVec = new THREE.Vector2(moveX, moveZ).normalize().multiplyScalar(speed * delta);
        this.avatar.position.x += moveVec.x;
        this.avatar.position.z += moveVec.y;
        this.avatar.position.y = this._sampleHeight(this.avatar.position.x, this.avatar.position.z) + 0.05;

        // Face movement direction
        const angle = Math.atan2(moveVec.x, moveVec.y);
        this.avatar.rotation.y = angle;

        // Limb walk cycle animation
        const swing = Math.sin(elapsed * 12.0) * 0.6;
        if (this.avatarLegs[0]) this.avatarLegs[0].rotation.x = swing;
        if (this.avatarLegs[1]) this.avatarLegs[1].rotation.x = -swing;
        if (this.avatarArms[0]) this.avatarArms[0].rotation.x = -swing;
        if (this.avatarArms[1]) this.avatarArms[1].rotation.x = swing;
      } else {
        if (this.avatarLegs[0]) this.avatarLegs[0].rotation.x = 0;
        if (this.avatarLegs[1]) this.avatarLegs[1].rotation.x = 0;
        if (this.avatarArms[0]) this.avatarArms[0].rotation.x = 0;
        if (this.avatarArms[1]) this.avatarArms[1].rotation.x = 0;
      }

      // Check proximity to nearby entities (NPCs, Objects, Nodes, Landed Ship)
      this._checkProximityInteractions();

      // Camera tracking avatar (1st-Person POV or 3rd-Person Chase)
      if (this.firstPerson) {
        // Eye-level POV
        const eyePos = new THREE.Vector3(
          this.avatar.position.x,
          this.avatar.position.y + 1.6,
          this.avatar.position.z
        );
        this.camera.position.lerp(eyePos, delta * 18.0);
        const lookTarget = new THREE.Vector3(
          eyePos.x - Math.sin(this.camAzimuth) * 10.0 * Math.cos(this.camElevation),
          eyePos.y - Math.sin(this.camElevation) * 10.0,
          eyePos.z - Math.cos(this.camAzimuth) * 10.0 * Math.cos(this.camElevation)
        );
        this.camera.lookAt(lookTarget);
      } else {
        const camTarget = new THREE.Vector3(
          this.avatar.position.x + Math.sin(this.camAzimuth) * this.camDistance * Math.cos(this.camElevation),
          this.avatar.position.y + this.camDistance * Math.sin(this.camElevation),
          this.avatar.position.z + Math.cos(this.camAzimuth) * this.camDistance * Math.cos(this.camElevation)
        );
        this.camera.position.lerp(camTarget, delta * 8.0);
        this.camera.lookAt(this.avatar.position.x, this.avatar.position.y + 1.2, this.avatar.position.z);
      }
    }
  }

  _checkProximityInteractions() {
    let closest = null;
    let closestDist = 4.8;
    const p = this.avatar.position;

    // Check Landed Ship
    if (this.landedShip) {
      const d = p.distanceTo(this.landedShip.position);
      if (d < 6.0) {
        closest = { type: 'ship', text: 'Board Flagship & Launch into Orbit' };
      }
    }

    // Check NPCs
    if (!closest) {
      this.npcMeshes.forEach(nm => {
        const d = p.distanceTo(nm.position);
        if (d < closestDist) {
          closestDist = d;
          closest = { type: 'npc', data: nm.userData.data, text: `Talk-to ${nm.userData.data.name} (NPC #${nm.userData.data.id})` };
        }
      });
    }

    // Check Objects
    if (!closest) {
      this.objectMeshes.forEach(om => {
        const d = p.distanceTo(om.position);
        if (d < 6.0) {
          closest = { type: 'object', data: om.userData.data, text: `Operate ${om.userData.data.name} (Object #${om.userData.data.id})` };
        }
      });
    }

    // Check Nodes
    if (!closest) {
      this.nodeMeshes.forEach(nm => {
        const d = p.distanceTo(nm.position);
        if (d < 4.2) {
          closest = { type: 'node', object: nm, data: nm.userData.data, text: `Mine ${nm.userData.data.name} (Node #${nm.userData.data.id})` };
        }
      });
    }

    this.nearestInteractable = closest;
    const promptEl = document.getElementById('mmorpg-action-prompt');
    if (promptEl) {
      if (closest) {
        promptEl.style.display = 'block';
        document.getElementById('action-prompt-text').innerText = closest.text;
      } else {
        promptEl.style.display = 'none';
      }
    }
  }

  _handleInteractKey() {
    if (!this.nearestInteractable) return;
    const it = this.nearestInteractable;

    if (it.type === 'ship') {
      this.toggleFootOrShip();
    } else if (it.type === 'npc') {
      this._openNpcDialogue(it.data);
    } else if (it.type === 'node') {
      this._mineResourceNode(it.object);
    } else if (it.type === 'object') {
      this.sound.playUi('mechanical');
      this.showToast(`⚙ Operating ${it.data.name} [Object #${it.data.id}]... Status optimal!`, 'info');
    }
  }

  // --------------------------------------------------------------------------
  // MOBILE VIRTUAL JOYSTICK & TOUCH CONTROLS
  // --------------------------------------------------------------------------
  _setupMobileJoystick() {
    if (!this.isMobile) return;

    // ── Surface Move Joystick ─────────────────────────────────────────────
    const outerEl = document.getElementById('joystick-outer');
    const innerEl = document.getElementById('joystick-inner');
    if (outerEl && innerEl) {
      const RADIUS = 52;
      let activeTouchId = null;
      let centerX = 0;
      let centerY = 0;

      const updateJoy = (tx, ty) => {
        const dx = tx - centerX;
        const dy = ty - centerY;
        const dist = Math.hypot(dx, dy);
        const clamp = Math.min(dist, RADIUS);
        const angle = Math.atan2(dy, dx);
        innerEl.style.transform = `translate(calc(-50% + ${Math.cos(angle) * clamp}px), calc(-50% + ${Math.sin(angle) * clamp}px))`;
        this.mobileJoy.x = (clamp / RADIUS) * Math.cos(angle);
        this.mobileJoy.z = (clamp / RADIUS) * Math.sin(angle);
      };

      const resetJoy = () => {
        innerEl.style.transform = 'translate(-50%, -50%)';
        this.mobileJoy.x = 0;
        this.mobileJoy.z = 0;
        activeTouchId = null;
      };

      outerEl.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (activeTouchId !== null) return;
        const t = e.changedTouches[0];
        activeTouchId = t.identifier;
        const r = outerEl.getBoundingClientRect();
        centerX = r.left + r.width / 2;
        centerY = r.top + r.height / 2;
        updateJoy(t.clientX, t.clientY);
      }, { passive: false });

      outerEl.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === activeTouchId) {
            updateJoy(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
            break;
          }
        }
      }, { passive: false });

      outerEl.addEventListener('touchend', (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === activeTouchId) { resetJoy(); break; }
        }
      }, { passive: false });
      outerEl.addEventListener('touchcancel', resetJoy, { passive: false });
    }

    // ── Camera Rotation — right-side touch drag ───────────────────────────
    const canvas = this.renderer.domElement;
    let camTouchId = null;
    let camLastX = 0;
    let camLastY = 0;

    canvas.addEventListener('touchstart', (e) => {
      if (this.state.viewMode !== 'surface') return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Only capture touches on the right 55% (not joystick zone)
        if (t.clientX > window.innerWidth * 0.42 && camTouchId === null) {
          camTouchId = t.identifier;
          camLastX = t.clientX;
          camLastY = t.clientY;
          break;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (this.state.viewMode !== 'surface' || camTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === camTouchId) {
          this.camAzimuth  -= (t.clientX - camLastX) * 0.007;
          this.camElevation = Math.max(0.1, Math.min(1.4, this.camElevation + (t.clientY - camLastY) * 0.007));
          camLastX = t.clientX;
          camLastY = t.clientY;
          break;
        }
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === camTouchId) { camTouchId = null; break; }
      }
      // Single-tap in orbit/space mode → select planet (synthesises click)
      if (this.state.viewMode !== 'surface' && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        this.mouse.x = (t.clientX / window.innerWidth)  *  2 - 1;
        this.mouse.y = -(t.clientY / window.innerHeight) *  2 + 1;
        this._handleClick({ target: canvas, button: 0 });
      }
    }, { passive: true });

    // ── Action Buttons ────────────────────────────────────────────────────
    const wire = (id, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false });
    };

    wire('mob-btn-interact', () => this._handleInteractKey());
    wire('mob-btn-board',    () => this.toggleFootOrShip());
    wire('mob-btn-inventory',() => this._toggleBackpackModal());

    const sprintBtn = document.getElementById('mob-btn-sprint');
    if (sprintBtn) {
      sprintBtn.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        this.keys['ShiftLeft'] = true;
        sprintBtn.style.background = 'rgba(255,180,0,0.95)';
        sprintBtn.style.boxShadow  = '0 0 18px rgba(255,200,0,0.6)';
      }, { passive: false });
      sprintBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys['ShiftLeft'] = false;
        sprintBtn.style.background = 'rgba(255,140,0,0.75)';
        sprintBtn.style.boxShadow  = '';
      }, { passive: false });
    }
  }
}
