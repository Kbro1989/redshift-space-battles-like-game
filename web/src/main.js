import * as THREE from 'three';
import { sound } from './sound.js';
import { MmorpgWorldEngine, LANDABLE_PLANETS, WORLD_NPCS, WORLD_OBJECTS, WORLD_GROUND_NODES } from './mmorpg.js';

// --- GAME DATA & CATALOGUES ---
const SHIP_TYPES = {
  fighter: {
    type: 'fighter',
    name: 'Viper Fighter',
    desc: 'Agile strike dogfighter, lethal in coordinated swarms',
    cost: 200,
    hull: 180,
    shield: 90,
    speed: 16.0,
    damage: 22.0,
    range: 35.0,
    fireRate: 1.6,
    color: 0x00a8ff
  },
  interceptor: {
    type: 'interceptor',
    name: 'Raptor Interceptor',
    desc: 'High-speed missile platform with swept wings',
    cost: 350,
    hull: 150,
    shield: 75,
    speed: 24.0,
    damage: 38.0,
    range: 30.0,
    fireRate: 2.0,
    color: 0xff8800
  },
  cruiser: {
    type: 'cruiser',
    name: 'Titan Cruiser',
    desc: 'Heavy broadside warship with dual cannon turrets',
    cost: 650,
    hull: 560,
    shield: 280,
    speed: 8.5,
    damage: 60.0,
    range: 48.0,
    fireRate: 0.9,
    color: 0x00ff88
  },
  battleship: {
    type: 'battleship',
    name: 'Dreadnought Flagship',
    desc: 'Colossal super-capital warship with devastating battery cannons',
    cost: 1300,
    hull: 1100,
    shield: 600,
    speed: 4.5,
    damage: 120.0,
    range: 60.0,
    fireRate: 0.45,
    color: 0xff2a4b
  }
};

const MISSIONS = [
  {
    id: 'm1',
    name: 'Kepler Orbit - Frontier Skirmish',
    planetId: 'planet_kepler',
    planetName: 'Kepler-186f',
    desc: 'Pirate raiders probing defensive boundaries around Kepler-186f. Clear the skies to access the colony.',
    diff: 1,
    reward: 350,
    enemies: [{ type: 'fighter', count: 2 }]
  },
  {
    id: 'm2',
    name: 'Xi-9 Corridor - Belt Ambush',
    planetId: 'planet_xi9',
    planetName: 'Asteroid Belt Xi-9',
    desc: 'Rival syndicate interceptors attacking deep-core mining ships. Secure the orbital corridor.',
    diff: 2,
    reward: 600,
    enemies: [{ type: 'fighter', count: 3 }, { type: 'interceptor', count: 1 }]
  },
  {
    id: 'm3',
    name: 'Gliese Expanse - Badlands Patrol',
    planetId: 'planet_gliese',
    planetName: 'Gliese-667C',
    desc: 'Hostile battlecruiser vanguard bearing down on the crystal monolith zone. Break their blockade.',
    diff: 3,
    reward: 950,
    enemies: [{ type: 'fighter', count: 3 }, { type: 'cruiser', count: 1 }]
  },
  {
    id: 'm4',
    name: 'Contested Dominion Sector',
    planetId: 'planet_gliese',
    planetName: 'Gliese-667C',
    desc: 'Heavy armada formation contesting primary warp beacon.',
    diff: 4,
    reward: 1800,
    enemies: [
      { type: 'fighter', count: 4 },
      { type: 'interceptor', count: 2 },
      { type: 'cruiser', count: 2 }
    ]
  },
  {
    id: 'm5',
    name: 'The Leviathan Siege',
    planetId: 'planet_kepler',
    planetName: 'Kepler-186f',
    desc: 'Warlord Dreadnought flagship has entered orbit. Obliterate the flag to pacify the entire sector.',
    diff: 5,
    reward: 3800,
    enemies: [
      { type: 'fighter', count: 5 },
      { type: 'cruiser', count: 2 },
      { type: 'battleship', count: 1 }
    ]
  }
];

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-msg ${type === 'warn' ? 'toast-warn' : (type === 'success' ? 'toast-success' : '')}`;
  const icon = type === 'warn' ? '⚠' : (type === 'success' ? '✓' : 'ℹ');
  toast.innerHTML = `<span style="font-size: 15px;">${icon}</span> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3200);
}

// --- PLAYER STATE ---
const state = {
  credits: 1000,
  victories: 0,
  defeats: 0,
  fleet: [],
  baseUpgrades: {
    shields: { name: 'Deflector Shield Matrix', level: 1, cost: 300, desc: '+15% Shield capacity across all ships' },
    repair: { name: 'Nanite Repair Dock', level: 1, cost: 450, desc: 'Instantly reconstructs damaged ships post-battle' },
    refinery: { name: 'Helium-3 Siphon', level: 1, cost: 500, desc: '+25% Credits gained from combat bounties' },
    telemetry: { name: 'Tachyonic Sensors', level: 1, cost: 400, desc: '+15% Laser targeting and attack range' }
  },
  currentMission: MISSIONS[0],
  mode: 'menu', // 'menu', 'commander', 'battle'
  viewMode: 'orbit', // 'orbit' or 'surface'
  callsign: 'Commander',
  surfaceTurretTier: 1,
  extractorTier: 1,
  mineralsHarvested: 0
};

function createShipInstance(typeKey) {
  const def = SHIP_TYPES[typeKey];
  const shieldMultiplier = 1 + (state.baseUpgrades.shields.level - 1) * 0.15;
  const rangeMultiplier = 1 + (state.baseUpgrades.telemetry.level - 1) * 0.15;

  return {
    id: Math.random().toString(36).substring(2, 9),
    type: typeKey,
    name: def.name,
    hullMax: def.hull,
    hullCurrent: def.hull,
    shieldMax: def.shield * shieldMultiplier,
    shieldCurrent: def.shield * shieldMultiplier,
    speed: def.speed,
    damage: def.damage,
    range: def.range * rangeMultiplier,
    fireRate: def.fireRate,
    color: def.color
  };
}

// State persistence
const STORAGE_KEY = 'redshift_space_battles_save_v1';

function saveState() {
  try {
    const saveData = {
      callsign: state.callsign,
      credits: state.credits,
      victories: state.victories,
      defeats: state.defeats,
      fleet: state.fleet,
      baseUpgrades: state.baseUpgrades,
      surfaceTurretTier: state.surfaceTurretTier,
      extractorTier: state.extractorTier,
      mineralsHarvested: state.mineralsHarvested
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.warn('Could not save state to localStorage:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      if (typeof data.callsign === 'string') state.callsign = data.callsign;
      if (typeof data.credits === 'number') state.credits = data.credits;
      if (typeof data.victories === 'number') state.victories = data.victories;
      if (typeof data.defeats === 'number') state.defeats = data.defeats;
      if (typeof data.surfaceTurretTier === 'number') state.surfaceTurretTier = data.surfaceTurretTier;
      if (typeof data.extractorTier === 'number') state.extractorTier = data.extractorTier;
      if (typeof data.mineralsHarvested === 'number') state.mineralsHarvested = data.mineralsHarvested;
      if (data.baseUpgrades) Object.assign(state.baseUpgrades, data.baseUpgrades);

      if (Array.isArray(data.fleet) && data.fleet.length > 0) {
        state.fleet = data.fleet.map(s => {
          const def = SHIP_TYPES[s.type] || SHIP_TYPES.fighter;
          const shieldMultiplier = 1 + ((state.baseUpgrades?.shields?.level || 1) - 1) * 0.15;
          const expectedHullMax = def.hull;
          const expectedShieldMax = def.shield * shieldMultiplier;
          return {
            ...s,
            hullMax: Math.max(s.hullMax || expectedHullMax, expectedHullMax),
            hullCurrent: Math.max(s.hullCurrent || expectedHullMax, expectedHullMax),
            shieldMax: Math.max(s.shieldMax || expectedShieldMax, expectedShieldMax),
            shieldCurrent: Math.max(s.shieldCurrent || expectedShieldMax, expectedShieldMax),
            speed: def.speed,
            damage: def.damage,
            fireRate: def.fireRate
          };
        });
      }
      return true;
    }
  } catch (e) {
    console.warn('Could not load state from localStorage:', e);
  }
  return false;
}

async function syncWithCloud(callsign) {
  state.callsign = callsign.trim() || 'Commander';
  saveState();
  const statusEl = document.getElementById('label-sync-status');
  if (statusEl) statusEl.innerText = '• Syncing...';

  try {
    // Attempt load
    const loadRes = await fetch(`./api/player/load?username=${encodeURIComponent(state.callsign)}`);
    if (loadRes.ok) {
      const cloudData = await loadRes.json();
      if (cloudData && cloudData.credits !== undefined) {
        if (typeof cloudData.credits === 'number') state.credits = cloudData.credits;
        if (typeof cloudData.victories === 'number') state.victories = cloudData.victories;
        if (typeof cloudData.defeats === 'number') state.defeats = cloudData.defeats;
        if (typeof cloudData.surfaceTurretTier === 'number') state.surfaceTurretTier = cloudData.surfaceTurretTier;
        if (typeof cloudData.extractorTier === 'number') state.extractorTier = cloudData.extractorTier;
        if (typeof cloudData.mineralsHarvested === 'number') state.mineralsHarvested = cloudData.mineralsHarvested;
        if (Array.isArray(cloudData.fleet)) state.fleet = cloudData.fleet;
        if (cloudData.baseUpgrades) Object.assign(state.baseUpgrades, cloudData.baseUpgrades);
        saveState();
        refreshCommanderUI();
        if (statusEl) statusEl.innerText = '• Cloud Loaded';
        showToast(`☁ Cloud profile for '${state.callsign}' loaded successfully!`, 'success');
        sound.playUi('upgrade');
        return;
      }
    }

    // Save to Cloudflare KV
    const saveRes = await fetch('./api/player/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.callsign,
        credits: state.credits,
        victories: state.victories,
        defeats: state.defeats,
        fleet: state.fleet,
        baseUpgrades: state.baseUpgrades,
        surfaceTurretTier: state.surfaceTurretTier,
        extractorTier: state.extractorTier,
        mineralsHarvested: state.mineralsHarvested
      })
    });

    if (saveRes.ok) {
      if (statusEl) statusEl.innerText = '• Synced to Cloud';
      showToast(`☁ Profile '${state.callsign}' synced to Cloudflare KV!`, 'success');
      sound.playUi('upgrade');
    } else {
      if (statusEl) statusEl.innerText = '• Local Mode';
      showToast('• Cloudflare KV offline - running in Local Storage mode', 'info');
    }
  } catch (err) {
    if (statusEl) statusEl.innerText = '• Local Mode';
    showToast('• Cloudflare KV offline - running in Local Storage mode', 'info');
  }
}

// Initialize fleet if no saved state
if (!loadState()) {
  state.fleet.push(createShipInstance('fighter'));
  state.fleet.push(createShipInstance('interceptor'));
  saveState();
}

// --- MATERIAL & GEOMETRY CACHE (mirrors openrsc-vinilla ThreejsSceneCache / EngineCache) ---
const MatCache = (() => {
  const _stdCache = new Map();
  const _basicCache = new Map();
  const _geoCache = new Map();

  function std(params) {
    const key = JSON.stringify(params);
    if (!_stdCache.has(key)) {
      _stdCache.set(key, new THREE.MeshStandardMaterial(params));
    }
    return _stdCache.get(key);
  }

  function basic(params) {
    const key = JSON.stringify(params);
    if (!_basicCache.has(key)) {
      _basicCache.set(key, new THREE.MeshBasicMaterial(params));
    }
    return _basicCache.get(key);
  }

  function geo(key, factory) {
    if (!_geoCache.has(key)) {
      _geoCache.set(key, factory());
    }
    return _geoCache.get(key);
  }

  return { std, basic, geo };
})();

// --- HEIGHTMAP SAMPLER (mirrors openrsc-vinilla HeightmapGrid / terrainHeightLocal) ---
const TerrainGrid = (() => {
  const TILES_X = 32;
  const TILES_Z = 32;
  const WORLD_W = 180;
  const WORLD_D = 180;
  const heights = new Float32Array((TILES_X + 1) * (TILES_Z + 1));

  // Compute heights matching the terrainGeo vertex layout (pre-rotation PlaneGeometry)
  for (let tz = 0; tz <= TILES_Z; tz++) {
    for (let tx = 0; tx <= TILES_X; tx++) {
      const x = (tx / TILES_X - 0.5) * WORLD_W;
      const z = (tz / TILES_Z - 0.5) * WORLD_D;
      const distCenter = Math.sqrt(x * x + z * z);
      let elev = 0;
      if (distCenter > 22) {
        elev = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3.5 + Math.sin(x * 0.05 + z * 0.05) * 4.0;
        if (distCenter < 34) {
          elev *= (distCenter - 22) / 12;
        }
      }
      heights[tz * (TILES_X + 1) + tx] = elev;
    }
  }

  function sample(wx, wz) {
    const lx = ((wx / WORLD_W) + 0.5) * TILES_X;
    const lz = ((wz / WORLD_D) + 0.5) * TILES_Z;
    const tx0 = Math.max(0, Math.min(TILES_X - 1, Math.floor(lx)));
    const tz0 = Math.max(0, Math.min(TILES_Z - 1, Math.floor(lz)));
    const tx1 = tx0 + 1;
    const tz1 = tz0 + 1;
    const fx = lx - tx0;
    const fz = lz - tz0;
    const h00 = heights[tz0 * (TILES_X + 1) + tx0];
    const h10 = heights[tz0 * (TILES_X + 1) + tx1];
    const h01 = heights[tz1 * (TILES_X + 1) + tx0];
    const h11 = heights[tz1 * (TILES_X + 1) + tx1];
    return (h00 * (1 - fx) + h10 * fx) * (1 - fz) + (h01 * (1 - fx) + h11 * fx) * fz;
  }

  return { sample };
})();

// --- THREE.JS INITIALIZATION ---
const canvas = document.getElementById('canvas3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020309);
scene.fog = new THREE.FogExp2(0x020309, 0.0025);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.5, 800);
camera.position.set(0, 6, 22);

// Lighting
const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
sunLight.position.set(40, 50, 30);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x2266bb, 0.8);
rimLight.position.set(-30, -20, -40);
scene.add(rimLight);

// --- COSMIC BACKGROUND ---
// Starfield
const starCount = 1400;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  const radius = 180 + Math.random() * 220;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);

  starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i3 + 2] = radius * Math.cos(phi);

  const col = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.6, 0.7 + Math.random() * 0.3);
  starColors[i3] = col.r;
  starColors[i3 + 1] = col.g;
  starColors[i3 + 2] = col.b;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 1.4,
  vertexColors: true,
  transparent: true,
  opacity: 0.95
});
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// Asteroid field
const asteroids = [];
const asteroidMat = MatCache.std({ color: 0x443e38, roughness: 0.85, metalness: 0.15 });

for (let i = 0; i < 24; i++) {
  const geo = new THREE.DodecahedronGeometry(1.2 + Math.random() * 3.5, 1);
  const ast = new THREE.Mesh(geo, asteroidMat);
  ast.position.set(
    (Math.random() - 0.5) * 160,
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 160
  );
  ast.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  ast.userData = {
    rx: (Math.random() - 0.5) * 0.01,
    ry: (Math.random() - 0.5) * 0.015
  };
  scene.add(ast);
  asteroids.push(ast);
}

// --- ORBITAL STARBASE CITADEL & HERO FLAGSHIP FLEET ---
const stationGroup = new THREE.Group();
stationGroup.position.set(0, 0, -4);
scene.add(stationGroup);

// Starbase Citadel Superstructure (midground)
const stationCitadel = new THREE.Group();
stationCitadel.position.set(-14, 6, -18);
stationGroup.add(stationCitadel);

const baseMat = MatCache.std({ color: 0x1a2638, metalness: 0.85, roughness: 0.25 });
const solarMat = MatCache.std({
  color: 0x0a2244,
  metalness: 0.9,
  roughness: 0.15,
  emissive: new THREE.Color(0x0044aa),
  emissiveIntensity: 0.5
});

const citadelCore = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 8), baseMat);
stationCitadel.add(citadelCore);

// Solar Arrays (Port & Starboard)
[-1, 1].forEach(side => {
  const panel = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 4.2), solarMat);
  panel.position.set(side * 10, 0, 0);
  stationCitadel.add(panel);
});

// Comms Spire & Beacon Light
const spireMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.6, 9, 8), baseMat);
spireMesh.position.y = 5.5;
stationCitadel.add(spireMesh);

const stationBeacon = new THREE.PointLight(0x00e1ff, 4, 35);
stationBeacon.position.set(0, 10.5, 0);
stationCitadel.add(stationBeacon);

// HERO FLAGSHIP (Foreground Hero Presentation)
const heroFlagship = new THREE.Group();
heroFlagship.position.set(0, 1.2, 2.5);
heroFlagship.rotation.set(-0.08, Math.PI * 0.9, 0.05);
stationGroup.add(heroFlagship);

const flagshipHullMat = MatCache.std({ color: 0x1e5095, metalness: 0.7, roughness: 0.3 });
const flagshipArmorMat = MatCache.std({ color: 0x141a26, metalness: 0.85, roughness: 0.2 });
const turretMat = MatCache.std({ color: 0x222a36, metalness: 0.9, roughness: 0.2 });
const bridgeGlowMat = MatCache.basic({ color: 0x00ffff });

// Main Hull
const flagHull = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 7.8), flagshipHullMat);
heroFlagship.add(flagHull);

// Forward Swept Armor Wings
[-1, 1].forEach(side => {
  const wing = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 5.8), flagshipArmorMat);
  wing.position.set(side * 2.0, 0, 0.4);
  wing.rotation.y = side * 0.1;
  heroFlagship.add(wing);
});

// Bridge Citadel & Viewport
const flagBridge = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.8), flagshipArmorMat);
flagBridge.position.set(0, 1.0, 1.5);
heroFlagship.add(flagBridge);

const flagWin = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.2, 0.6), bridgeGlowMat);
flagWin.position.set(0, 1.15, 0.9);
heroFlagship.add(flagWin);

// Dual Heavy Artillery Turrets
[-1.8, 0.2].forEach(zPos => {
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.2), turretMat);
  t.position.set(0, 0.85, zPos);
  heroFlagship.add(t);

  [-0.22, 0.22].forEach(bSide => {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.9, 8), turretMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(bSide, 0.85, zPos - 1.1);
    heroFlagship.add(barrel);
  });
});

// Stern Propulsion Engines with Cyan Glow
const engineLights = [];
[-0.8, 0, 0.8].forEach(xPos => {
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.6, 12), turretMat);
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.set(xPos, 0, 4.0);
  heroFlagship.add(nozzle);

  const elight = new THREE.PointLight(0x00d0ff, 3.5, 10);
  elight.position.set(xPos, 0, 4.5);
  heroFlagship.add(elight);
  engineLights.push(elight);
});

// Escort Fighters in Formation
function createEscortFighter(pos, col) {
  const fGroup = new THREE.Group();
  fGroup.position.copy(pos);
  fGroup.rotation.set(-0.1, Math.PI * 0.9, 0.08);

  const fHull = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 2.0), MatCache.std({ color: col, metalness: 0.65, roughness: 0.35 }));
  fGroup.add(fHull);

  const fWings = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.9), MatCache.std({ color: 0x151c28, metalness: 0.8, roughness: 0.3 }));
  fWings.position.set(0, 0, 0.2);
  fGroup.add(fWings);

  const fLight = new THREE.PointLight(0x00d0ff, 2.0, 6);
  fLight.position.set(0, 0, 1.2);
  fGroup.add(fLight);
  engineLights.push(fLight);

  return fGroup;
}

const escortPort = createEscortFighter(new THREE.Vector3(-5.5, -0.6, 1.0), 0x00a8ff);
const escortStarboard = createEscortFighter(new THREE.Vector3(5.5, 0.8, 2.0), 0xff8800);
stationGroup.add(escortPort);
stationGroup.add(escortStarboard);

// --- 3D PLANETARY SURFACE COLONY (WORLD LANDING) ---
const planetGroup = new THREE.Group();
planetGroup.position.set(0, -60, 0);
planetGroup.visible = false;
scene.add(planetGroup);

// Terrain grid with procedural elevation matching TerrainGrid sampler
const terrainGeo = new THREE.PlaneGeometry(180, 180, 32, 32);
terrainGeo.rotateX(-Math.PI / 2);
const posAttr = terrainGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i);
  const z = posAttr.getZ(i);
  const distCenter = Math.sqrt(x * x + z * z);
  if (distCenter > 22) {
    let elev = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3.5 + Math.sin(x * 0.05 + z * 0.05) * 4.0;
    if (distCenter < 34) elev *= (distCenter - 22) / 12;
    posAttr.setY(i, elev);
  } else {
    posAttr.setY(i, (Math.random() - 0.5) * 0.25);
  }
}
terrainGeo.computeVertexNormals();

const terrainMat = MatCache.std({ color: 0x3d3024, roughness: 0.9, metalness: 0.15, flatShading: true });
const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
planetGroup.add(terrainMesh);

// Central Landing Pad — snapped to terrain origin (y≈0 since dist<22 is flat)
const padGeo = new THREE.CylinderGeometry(8.0, 8.5, 0.6, 6);
const landingPad = new THREE.Mesh(padGeo, MatCache.std({ color: 0x1e2632, metalness: 0.8, roughness: 0.3 }));
landingPad.position.set(0, TerrainGrid.sample(0, 0) + 0.3, 0);
planetGroup.add(landingPad);

// Landing lights beacon
const padRingGeo = new THREE.RingGeometry(6.6, 7.3, 24);
padRingGeo.rotateX(-Math.PI / 2);
const padRing = new THREE.Mesh(padRingGeo, MatCache.basic({ color: 0x00ffaa, side: THREE.DoubleSide }));
padRing.position.set(0, TerrainGrid.sample(0, 0) + 0.62, 0);
planetGroup.add(padRing);

// Command Bio-Dome — snapped to terrain elevation at (-16, _, -10)
const domeGeo = new THREE.SphereGeometry(4.8, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
const domeMat = MatCache.std({ color: 0x1a4568, metalness: 0.5, roughness: 0.2, transparent: true, opacity: 0.85 });
const bioDome = new THREE.Mesh(domeGeo, domeMat);
bioDome.position.set(-16, TerrainGrid.sample(-16, -10) + 0.1, -10);
planetGroup.add(bioDome);

// Helium-3 Extractor Rig & Drill — snapped to terrain elevation at (16, _, -8)
const drillGroup = new THREE.Group();
const drillGroundY = TerrainGrid.sample(16, -8);
drillGroup.position.set(16, drillGroundY, -8);
const rigBase = new THREE.Mesh(
  MatCache.geo('rig_box', () => new THREE.BoxGeometry(4.5, 6, 4.5)),
  MatCache.std({ color: 0x403020, metalness: 0.85, roughness: 0.3 })
);
rigBase.position.y = 3;
drillGroup.add(rigBase);
const drillShaft = new THREE.Mesh(
  MatCache.geo('drill_cyl', () => new THREE.CylinderGeometry(0.5, 0.5, 4.5, 12)),
  MatCache.std({ color: 0xffaa00, metalness: 0.9, roughness: 0.1 })
);
drillShaft.position.y = 5;
drillGroup.add(drillShaft);

const drillLight = new THREE.PointLight(0xffbb00, 0, 20);
drillLight.position.set(0, 5, 0);
drillGroup.add(drillLight);
planetGroup.add(drillGroup);

// Radar Telemetry Tower & Rotating Dish — snapped to terrain at (-12, _, 14)
const radarTower = new THREE.Group();
radarTower.position.set(-12, TerrainGrid.sample(-12, 14), 14);
const mast = new THREE.Mesh(
  MatCache.geo('mast_cyl', () => new THREE.CylinderGeometry(0.3, 0.6, 8, 8)),
  MatCache.std({ color: 0x556677, metalness: 0.75, roughness: 0.35 })
);
mast.position.y = 4;
radarTower.add(mast);
const dishGeo = new THREE.CylinderGeometry(2.4, 0.2, 0.6, 16);
dishGeo.rotateX(Math.PI / 3);
const radarDish = new THREE.Mesh(dishGeo, MatCache.std({ color: 0xccddee, metalness: 0.9, roughness: 0.15 }));
radarDish.position.set(0, 8.2, 0);
radarTower.add(radarDish);
planetGroup.add(radarTower);

// Surface Point-Defense Cannon — snapped to terrain at (12, _, 12)
const surfaceTurret = new THREE.Group();
surfaceTurret.position.set(12, TerrainGrid.sample(12, 12), 12);
const turretBase = new THREE.Mesh(
  MatCache.geo('turret_box', () => new THREE.BoxGeometry(3, 2, 3)),
  MatCache.std({ color: 0x334455, metalness: 0.8, roughness: 0.3 })
);
turretBase.position.y = 1;
surfaceTurret.add(turretBase);

const turretGun = new THREE.Mesh(
  MatCache.geo('turret_gun_cyl', () => new THREE.CylinderGeometry(0.2, 0.2, 3.5, 8)),
  MatCache.std({ color: 0x8899aa, metalness: 0.9, roughness: 0.2 })
);
turretGun.rotation.x = Math.PI / 4;
turretGun.position.set(0, 2.5, 0);
surfaceTurret.add(turretGun);

// Flank barrels & shield projector for higher tiers
const turretGunLeft = new THREE.Mesh(
  MatCache.geo('turret_gun_cyl', () => new THREE.CylinderGeometry(0.16, 0.16, 3.2, 8)),
  MatCache.std({ color: 0x8899aa, metalness: 0.9, roughness: 0.2 })
);
turretGunLeft.rotation.x = Math.PI / 4;
turretGunLeft.position.set(-0.65, 2.3, 0);
surfaceTurret.add(turretGunLeft);

const turretGunRight = new THREE.Mesh(
  MatCache.geo('turret_gun_cyl', () => new THREE.CylinderGeometry(0.16, 0.16, 3.2, 8)),
  MatCache.std({ color: 0x8899aa, metalness: 0.9, roughness: 0.2 })
);
turretGunRight.rotation.x = Math.PI / 4;
turretGunRight.position.set(0.65, 2.3, 0);
surfaceTurret.add(turretGunRight);

const turretShieldRing = new THREE.Mesh(
  new THREE.TorusGeometry(2.4, 0.08, 6, 24),
  MatCache.basic({ color: 0x00e1ff, transparent: true, opacity: 0.6 })
);
turretShieldRing.rotation.x = Math.PI / 2;
turretShieldRing.position.set(0, 1.8, 0);
surfaceTurret.add(turretShieldRing);
planetGroup.add(surfaceTurret);

function updateTurretTierVisuals() {
  const tier = state.surfaceTurretTier || 1;
  turretGunLeft.visible = tier >= 2;
  turretGunRight.visible = tier >= 3;
  turretShieldRing.visible = tier >= 2;
  if (turretShieldRing.material) {
    turretShieldRing.material.opacity = Math.min(0.9, 0.35 + tier * 0.15);
  }
}
updateTurretTierVisuals();

// Glowing mineral crystal clusters across the Kepler-186F terrain
const crystalGroup = new THREE.Group();
const crystalMat = MatCache.std({
  color: 0x00f0ff,
  metalness: 0.9,
  roughness: 0.1,
  emissive: new THREE.Color(0x0088dd),
  emissiveIntensity: 1.6
});
for (let c = 0; c < 22; c++) {
  const cx = (Math.random() - 0.5) * 120;
  const cz = (Math.random() - 0.5) * 120;
  if (Math.hypot(cx, cz) < 22) continue;
  const cy = TerrainGrid.sample(cx, cz);
  const cMesh = new THREE.Mesh(new THREE.ConeGeometry(0.45 + Math.random() * 0.4, 2.8 + Math.random() * 2.2, 5), crystalMat);
  cMesh.position.set(cx, cy + 1.2, cz);
  cMesh.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
  crystalGroup.add(cMesh);
}
planetGroup.add(crystalGroup);

// --- 3D PROCEDURAL SHIP BUILDER ---
function buildShipMesh(shipData, isPlayer) {
  const group = new THREE.Group();
  const baseCol = shipData.color;
  const hullMat = MatCache.std({ color: baseCol, metalness: 0.65, roughness: 0.35 });
  const darkMat = MatCache.std({ color: 0x161c28, metalness: 0.85, roughness: 0.2 });
  const glowCol = isPlayer ? 0x00d0ff : 0xff4422;
  const engineMat = MatCache.basic({ color: glowCol });

  function addBox(w, h, d, x = 0, y = 0, z = 0, mat = hullMat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  }

  function addEngine(x, y, z, r = 0.35) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r, 0.5, 12), engineMat);
    eng.rotation.x = Math.PI / 2;
    eng.position.set(x, y, z);
    group.add(eng);

    const light = new THREE.PointLight(glowCol, 2.0, 8);
    light.position.set(x, y, z + 0.3);
    group.add(light);
  }

  switch (shipData.type) {
    case 'fighter':
      // Fuselage
      addBox(0.7, 0.35, 2.4, 0, 0, 0);
      // Swept delta wings
      addBox(2.8, 0.08, 1.1, 0, 0, 0.2, darkMat);
      // Wingtip cannons
      addBox(0.08, 0.08, 0.9, -1.35, 0, -0.2, darkMat);
      addBox(0.08, 0.08, 0.9, 1.35, 0, -0.2, darkMat);
      // Canopy
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
      canopy.scale.set(0.9, 0.7, 1.8);
      canopy.position.set(0, 0.22, -0.5);
      group.add(canopy);
      // Thruster
      addEngine(0, 0, 1.3, 0.4);
      break;

    case 'interceptor':
      // Sharp nose fuselage
      addBox(0.5, 0.28, 2.6, 0, 0, 0.2);
      // Swept forward wings
      const w1 = addBox(1.8, 0.08, 1.1, -1.0, 0, 0.4, darkMat);
      w1.rotation.y = 0.26;
      const w2 = addBox(1.8, 0.08, 1.1, 1.0, 0, 0.4, darkMat);
      w2.rotation.y = -0.26;
      // Twin engines
      addEngine(-0.25, 0, 1.45, 0.3);
      addEngine(0.25, 0, 1.45, 0.3);
      break;

    case 'cruiser':
      // Armored hull
      addBox(1.8, 0.8, 5.2, 0, 0, 0);
      // Side outriggers
      addBox(0.7, 0.6, 4.0, -1.4, 0, 0.2, darkMat);
      addBox(0.7, 0.6, 4.0, 1.4, 0, 0.2, darkMat);
      // Command bridge
      addBox(0.9, 0.5, 1.4, 0, 0.65, 1.0, darkMat);
      // Dual turrets
      addBox(0.6, 0.4, 0.8, 0, 0.55, -1.2, darkMat);
      addBox(0.6, 0.4, 0.8, 0, 0.55, 0.2, darkMat);
      // Heavy engines
      addEngine(-0.6, 0, 2.7, 0.5);
      addEngine(0.6, 0, 2.7, 0.5);
      break;

    case 'battleship':
      // Massive dreadnought chassis
      addBox(3.0, 1.3, 8.2, 0, 0, 0);
      // Broadside armor plating
      addBox(1.2, 1.0, 7.0, -2.2, 0, 0.4, darkMat);
      addBox(1.2, 1.0, 7.0, 2.2, 0, 0.4, darkMat);
      // Triple turret barbettes
      addBox(1.1, 0.6, 1.4, 0, 0.95, -2.6, darkMat);
      addBox(1.1, 0.6, 1.4, 0, 0.95, -0.6, darkMat);
      addBox(1.1, 0.6, 1.4, 0, 0.95, 1.6, darkMat);
      // Triple capital thrusters
      addEngine(-1.0, 0, 4.2, 0.7);
      addEngine(0.0, 0, 4.2, 0.8);
      addEngine(1.0, 0, 4.2, 0.7);
      break;
  }

  // Enemy ships point forward toward player fleet
  if (!isPlayer) {
    group.rotation.y = Math.PI;
  }

  // Create Health/Shield billboard sprite
  const canvasSprite = document.createElement('canvas');
  canvasSprite.width = 128;
  canvasSprite.height = 36;
  const ctx = canvasSprite.getContext('2d');

  const spriteTexture = new THREE.CanvasTexture(canvasSprite);
  const spriteMat = new THREE.SpriteMaterial({ map: spriteTexture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.5, 1.3, 1);
  sprite.position.y = shipData.type === 'battleship' ? 3.8 : shipData.type === 'cruiser' ? 2.8 : 2.0;
  group.add(sprite);

  group.userData = {
    ...shipData,
    isPlayer,
    target: null,
    fireTimer: isPlayer ? 0.4 : (-1.2 - Math.random() * 1.5),
    isDead: false,
    hudCanvas: canvasSprite,
    hudCtx: ctx,
    hudTexture: spriteTexture,
    hudSprite: sprite
  };

  updateShipHud(group);
  return group;
}

// --- MMORPG PLANETARY LANDING & SURFACE WORLD ENGINE ---
const mmorpg = new MmorpgWorldEngine(
  scene,
  camera,
  renderer,
  state,
  sound,
  showToast,
  () => { if (typeof refreshCommanderUI === 'function') refreshCommanderUI(); },
  buildShipMesh
);

function updateShipHud(shipGroup) {
  const d = shipGroup.userData;
  const ctx = d.hudCtx;
  const w = 128;
  const h = 36;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = 'rgba(0, 8, 20, 0.75)';
  ctx.fillRect(0, 0, w, h);

  // Hull bar
  const hpPct = Math.max(0, Math.min(1, d.hullCurrent / d.hullMax));
  ctx.fillStyle = d.isPlayer ? '#00ff88' : '#ff4444';
  ctx.fillRect(4, 4, (w - 8) * hpPct, 12);

  // Shield bar
  const shPct = Math.max(0, Math.min(1, d.shieldCurrent / d.shieldMax));
  ctx.fillStyle = '#00e1ff';
  ctx.fillRect(4, 20, (w - 8) * shPct, 10);

  d.hudTexture.needsUpdate = true;
}

// --- PROJECTILE & FX SYSTEMS ---
const projectiles = [];
const explosions = [];

function spawnLaser(fromPos, toPos, damage, isPlayer, target = null) {
  let dir = new THREE.Vector3().subVectors(toPos, fromPos).normalize();

  // Inaccuracy spread for hostile vessels (prevents laser-aimbot insta-kills)
  if (!isPlayer) {
    const spread = new THREE.Vector3(
      (Math.random() - 0.5) * 0.55,
      (Math.random() - 0.5) * 0.45,
      (Math.random() - 0.5) * 0.55
    );
    dir.add(spread).normalize();
  }

  const geom = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 8);
  const col = isPlayer ? 0x00f0ff : 0xff4411;
  const mat = new THREE.MeshBasicMaterial({ color: col });
  const mesh = new THREE.Mesh(geom, mat);

  mesh.position.copy(fromPos);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  scene.add(mesh);

  projectiles.push({
    mesh,
    dir,
    speed: 85.0,
    damage,
    isPlayer,
    target,
    life: 2.8
  });

  sound.playLaser(damage > 40);
}

function spawnExplosion(pos, size = 1.0) {
  const group = new THREE.Group();
  group.position.copy(pos);

  // Core flash sphere
  const flashGeo = new THREE.SphereGeometry(1.2 * size, 16, 16);
  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 1.0
  });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  group.add(flash);

  // Glowing debris
  const debris = [];
  for (let i = 0; i < 16 + size * 8; i++) {
    const dGeo = new THREE.SphereGeometry(0.12 * size, 8, 8);
    const dMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xff5511 : 0xffcc33
    });
    const dMesh = new THREE.Mesh(dGeo, dMat);
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 16 * size,
      (Math.random() - 0.5) * 16 * size,
      (Math.random() - 0.5) * 16 * size
    );
    group.add(dMesh);
    debris.push({ mesh: dMesh, vel });
  }

  scene.add(group);
  explosions.push({
    group,
    flash,
    debris,
    size,
    age: 0,
    duration: 0.8 + size * 0.3
  });

  sound.playExplosion(size);
}

// --- BATTLE ORCHESTRATION ---
const battleShips = [];
const spaceLandmarks = [];
let battleCamMode = 0; // 0: Orbit, 1: Flagship, 2: Top-Down
let battleTime = 0;
let battleResolved = false;

// Mobile battle joystick state (also read by the animate loop)
const mobileBattleJoy = { x: 0, z: 0, up: false, down: false, fire: false };

function startBattle(mission) {
  state.currentMission = mission;
  state.mode = 'battle';
  battleTime = 0;
  battleResolved = false;

  // Clear scene of existing battle items
  cleanupBattle();

  stationGroup.visible = false;
  document.getElementById('screen-menu').classList.remove('active');
  document.getElementById('screen-commander').classList.remove('active');
  document.getElementById('screen-battle').classList.add('active');
  document.getElementById('battle-mission-name').innerText = mission.name;

  // Spawn Player Fleet in spacious staggered tactical formation
  state.fleet.forEach((shipData, idx) => {
    const ship = buildShipMesh(shipData, true);
    const row = (idx % 3) - 1;
    const col = Math.floor(idx / 3);
    const altitude = (col * 5.0 - row * 4.0);
    // Spaced out starting sector: -70 to -95 on Z axis with wide lateral corridor
    ship.position.set(row * 16.0, altitude, -72.0 - col * 14.0);
    scene.add(ship);
    battleShips.push(ship);
  });

  // Spawn Enemy Fleet in opposing wide recon & siege formation
  let eIdx = 0;
  mission.enemies.forEach(group => {
    for (let i = 0; i < group.count; i++) {
      const eData = createShipInstance(group.type);
      const ship = buildShipMesh(eData, false);
      const row = (eIdx % 3) - 1;
      const col = Math.floor(eIdx / 3);
      const altitude = (col * 4.8 - row * 3.8) * -0.9;
      // Staggered distant hostile sector: +75 to +110 on Z axis
      ship.position.set(row * 18.0 + (Math.random() - 0.5) * 8.0, altitude, 76.0 + col * 15.0);
      scene.add(ship);
      battleShips.push(ship);
      eIdx++;
    }
  });

  // Spawn Deep Space Exploratory Landmarks & Navigational Beacons
  const beaconColors = [0x00d0ff, 0xffaa00, 0x00ff88, 0xbf55ec];
  for (let b = 0; b < 6; b++) {
    const beaconGroup = new THREE.Group();
    const bx = (Math.random() - 0.5) * 160;
    const by = (Math.random() - 0.5) * 40;
    const bz = (Math.random() - 0.5) * 140;
    beaconGroup.position.set(bx, by, bz);

    const bCol = beaconColors[b % beaconColors.length];
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.6, 0),
      MatCache.std({ color: bCol, metalness: 0.8, roughness: 0.2, emissive: new THREE.Color(bCol), emissiveIntensity: 0.6 })
    );
    beaconGroup.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.12, 8, 24),
      MatCache.basic({ color: bCol, transparent: true, opacity: 0.75 })
    );
    ring.rotation.x = Math.PI / 3;
    beaconGroup.add(ring);

    const pLight = new THREE.PointLight(bCol, 2.5, 30);
    beaconGroup.add(pLight);

    beaconGroup.userData = { rotSpeed: 0.02 + Math.random() * 0.03 };
    scene.add(beaconGroup);
    spaceLandmarks.push(beaconGroup);
  }

  retargetAll();
  updateBattleCounters();

  // Reset and wire mobile battle controls if on a touch device
  Object.assign(mobileBattleJoy, { x: 0, z: 0, up: false, down: false, fire: false });
  _initMobileBattleControls();
}

// --- MOBILE BATTLE CONTROLS ---
function _initMobileBattleControls() {
  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (!isMobile) return;

  const mbc = document.getElementById('mobile-battle-controls');
  if (mbc) mbc.style.display = 'block';
  // Hide surface controls while in battle
  const msc = document.getElementById('mobile-surface-controls');
  if (msc) msc.style.display = 'none';

  const outerEl = document.getElementById('battle-joystick-outer');
  const innerEl = document.getElementById('battle-joystick-inner');
  if (outerEl && innerEl) {
    const RADIUS = 52;
    let activeTouchId = null;
    let cX = 0, cY = 0;

    const updateJoy = (tx, ty) => {
      const dx = tx - cX, dy = ty - cY;
      const dist = Math.hypot(dx, dy);
      const clamp = Math.min(dist, RADIUS);
      const angle = Math.atan2(dy, dx);
      innerEl.style.transform = `translate(calc(-50% + ${Math.cos(angle)*clamp}px), calc(-50% + ${Math.sin(angle)*clamp}px))`;
      mobileBattleJoy.x = (clamp / RADIUS) * Math.cos(angle);
      mobileBattleJoy.z = (clamp / RADIUS) * Math.sin(angle);
    };

    const resetJoy = () => {
      innerEl.style.transform = 'translate(-50%,-50%)';
      mobileBattleJoy.x = 0; mobileBattleJoy.z = 0; activeTouchId = null;
    };

    // Clone to remove old listeners from previous battle
    const fresh = outerEl.cloneNode(true);
    outerEl.parentNode.replaceChild(fresh, outerEl);
    // Update innerEl reference after clone
    const freshInner = fresh.querySelector('#battle-joystick-inner') || document.getElementById('battle-joystick-inner');

    fresh.addEventListener('touchstart', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (activeTouchId !== null) return;
      const t = e.changedTouches[0];
      activeTouchId = t.identifier;
      const r = fresh.getBoundingClientRect();
      cX = r.left + r.width / 2; cY = r.top + r.height / 2;
      updateJoy(t.clientX, t.clientY);
    }, { passive: false });
    fresh.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          updateJoy(e.changedTouches[i].clientX, e.changedTouches[i].clientY); break;
        }
      }
    }, { passive: false });
    fresh.addEventListener('touchend',   (e) => { for (let i = 0; i < e.changedTouches.length; i++) { if (e.changedTouches[i].identifier === activeTouchId) { resetJoy(); break; } } }, { passive: false });
    fresh.addEventListener('touchcancel', resetJoy, { passive: false });
  }

  const wire = (id, onStart, onEnd) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); onStart(); }, { passive: false });
    if (onEnd) el.addEventListener('touchend',   (e) => { e.preventDefault(); onEnd(); },   { passive: false });
  };

  wire('mob-btn-fire',    () => { mobileBattleJoy.fire = true;  },  () => { mobileBattleJoy.fire = false; });
  wire('mob-btn-ascend',  () => { mobileBattleJoy.up   = true;  },  () => { mobileBattleJoy.up   = false; });
  wire('mob-btn-descend', () => { mobileBattleJoy.down = true;  },  () => { mobileBattleJoy.down = false; });
  wire('mob-btn-retreat-battle', () => {
    Object.assign(mobileBattleJoy, { x:0, z:0, up:false, down:false, fire:false });
    showScreen('commander');
    sound.playUi('click');
    showToast('⚑ Tactical retreat executed. Fleet returned to orbital starbase.', 'warn');
  });
}

function disposeHierarchy(obj) {
  if (!obj) return;
  obj.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      } else {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    }
  });
}

function cleanupBattle() {
  battleShips.forEach(s => {
    scene.remove(s);
    disposeHierarchy(s);
  });
  battleShips.length = 0;
  spaceLandmarks.forEach(m => {
    scene.remove(m);
    disposeHierarchy(m);
  });
  spaceLandmarks.length = 0;
  projectiles.forEach(p => {
    scene.remove(p.mesh);
    disposeHierarchy(p.mesh);
  });
  projectiles.length = 0;
  explosions.forEach(e => {
    scene.remove(e.group);
    disposeHierarchy(e.group);
  });
  explosions.length = 0;
}

function retargetAll() {
  const friends = battleShips.filter(s => s.userData.isPlayer && !s.userData.isDead);
  const foes = battleShips.filter(s => !s.userData.isPlayer && !s.userData.isDead);

  friends.forEach(f => {
    f.userData.target = findNearest(f, foes);
  });
  foes.forEach(e => {
    e.userData.target = findNearest(e, friends);
  });
}

function findNearest(ship, pool) {
  let nearest = null;
  let minDist = Infinity;
  pool.forEach(candidate => {
    const d = ship.position.distanceTo(candidate.position);
    if (d < minDist) {
      minDist = d;
      nearest = candidate;
    }
  });
  return nearest;
}

function updateBattleCounters() {
  const friends = battleShips.filter(s => s.userData.isPlayer && !s.userData.isDead).length;
  const foes = battleShips.filter(s => !s.userData.isPlayer && !s.userData.isDead).length;

  document.getElementById('battle-friendly-count').innerText = `FRIENDLY: ${friends}`;
  document.getElementById('battle-enemy-count').innerText = `HOSTILE: ${foes}`;

  if (!battleResolved && (friends === 0 || foes === 0)) {
    battleResolved = true;
    setTimeout(() => {
      showBattleOutcome(foes === 0);
    }, 2000);
  }
}

function showBattleOutcome(victory) {
  const modal = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const landBtn = document.getElementById('btn-land-surface-gate');
  const closeBtn = document.getElementById('btn-modal-close');

  modal.classList.add('active');
  if (victory) {
    state.victories++;
    const bountyMultiplier = 1 + (state.baseUpgrades.refinery.level - 1) * 0.25;
    const reward = Math.round(state.currentMission.reward * bountyMultiplier);
    state.credits += reward;

    // Post-battle repairs
    state.fleet.forEach(s => {
      s.hullCurrent = s.hullMax;
      s.shieldCurrent = s.shieldMax;
    });

    title.innerText = 'SECTOR CLEARED — PLANET IN RANGE';
    title.style.color = '#00ff88';
    body.innerHTML = `Hostile sector neutralized!<br><br><strong style="color: #ffd700; font-size: 22px;">+${reward} CREDITS REWARD</strong><br><br><span style="color:#00e1ff; font-weight:700;">Planetary Surface Access Unlocked:</span><br>Engage descent thrusters to explore the world on foot, extract deep-core nodes, and trade with outpost colonists — or return to fleet headquarters.`;
    if (landBtn) {
      landBtn.style.display = 'block';
    }
    if (closeBtn) {
      closeBtn.innerText = '↩ RETURN TO STARBASE COMMAND';
    }
    sound.playUi('upgrade');
  } else {
    state.defeats++;
    title.innerText = 'ARMADA DESTROYED';
    title.style.color = '#ff4444';
    body.innerHTML = `Your fleet was overwhelmed in the contested dominion.<br>Starbase emergency protocol dispatched fresh strike vessels.`;
    if (landBtn) {
      landBtn.style.display = 'none';
    }
    if (closeBtn) {
      closeBtn.innerText = 'RETURN TO STARBASE';
    }

    // Recommission if wiped
    if (state.fleet.length === 0) {
      state.fleet.push(createShipInstance('fighter'));
    }
  }
  saveState();
}

// --- UI EVENT BINDINGS & SCREEN NAVIGATION ---
function showScreen(name) {
  state.mode = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  // Always hide mobile battle HUD when leaving battle screen
  if (name !== 'battle') {
    const mbc = document.getElementById('mobile-battle-controls');
    if (mbc) mbc.style.display = 'none';
    Object.assign(mobileBattleJoy, { x: 0, z: 0, up: false, down: false, fire: false });
  }

  if (name === 'menu') {
    stationGroup.visible = true;
    cleanupBattle();
    document.getElementById('screen-menu').classList.add('active');
  } else if (name === 'commander') {
    stationGroup.visible = true;
    cleanupBattle();
    document.getElementById('screen-commander').classList.add('active');
    refreshCommanderUI();
  }
}

function refreshCommanderUI() {
  document.getElementById('label-credits').innerText = `⚡ ${state.credits.toLocaleString()} CR`;
  document.getElementById('label-stats').innerText = `W: ${state.victories} | L: ${state.defeats}`;

  // Fleet power
  let power = 0;
  state.fleet.forEach(s => {
    power += Math.round(s.hullMax + s.shieldMax + s.damage * 10);
  });
  document.getElementById('label-fleet-power').innerText = `Armada Rating: ${power.toLocaleString()}`;

  // Active fleet list
  const fleetList = document.getElementById('list-player-fleet');
  fleetList.innerHTML = '';
  state.fleet.forEach((ship, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: center;">
        <div style="width: 8px; height: 44px; background: #${ship.color.toString(16).padStart(6, '0')}; border-radius: 4px;"></div>
        <div>
          <div style="font-weight: bold; color: #eef; font-size: 15px;">${ship.name}</div>
          <div style="font-size: 12px; color: #70c4ff;">HP: ${Math.round(ship.hullCurrent)}/${ship.hullMax} • Shield: ${Math.round(ship.shieldCurrent)}/${Math.round(ship.shieldMax)}</div>
        </div>
      </div>
      <button class="btn-danger" style="padding: 6px 12px; font-size: 12px;" data-scrap="${idx}">Decommission</button>
    `;
    fleetList.appendChild(card);
  });

  // Fast buy list
  const quickList = document.getElementById('list-quick-buy');
  quickList.innerHTML = '';
  Object.keys(SHIP_TYPES).forEach(typeKey => {
    const def = SHIP_TYPES[typeKey];
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div>
        <div style="font-weight: bold; color: #fff;">${def.name}</div>
        <div style="font-size: 12px; color: #8cb0d0;">${def.cost} Credits</div>
      </div>
      <button class="btn-primary" style="padding: 8px 14px; font-size: 13px;" ${state.credits < def.cost ? 'disabled' : ''} data-buy="${typeKey}">
        Build
      </button>
    `;
    quickList.appendChild(card);
  });

  // Full Shipyard List
  const fullShipList = document.getElementById('list-full-shipyard');
  fullShipList.innerHTML = '';
  Object.keys(SHIP_TYPES).forEach(typeKey => {
    const def = SHIP_TYPES[typeKey];
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: center;">
        <div style="width: 10px; height: 60px; background: #${def.color.toString(16).padStart(6, '0')}; border-radius: 4px;"></div>
        <div>
          <div style="font-size: 16px; font-weight: bold; color: #fff;">${def.name}</div>
          <div style="font-size: 12px; color: #9abfd8; margin-bottom: 4px;">${def.desc}</div>
          <div style="font-size: 12px; color: #00ff88;">Hull: ${def.hull} | Shield: ${def.shield} | Damage: ${def.damage} | Speed: ${def.speed} | Range: ${def.range}</div>
        </div>
      </div>
      <button class="btn-primary" style="padding: 10px 18px; font-size: 14px;" ${state.credits < def.cost ? 'disabled' : ''} data-buy="${typeKey}">
        Build (${def.cost} CR)
      </button>
    `;
    fullShipList.appendChild(card);
  });

  // Base Upgrades
  const baseList = document.getElementById('list-base-upgrades');
  baseList.innerHTML = '';
  Object.keys(state.baseUpgrades).forEach(upKey => {
    const up = state.baseUpgrades[upKey];
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div>
        <div style="font-size: 16px; font-weight: bold; color: #00e1ff;">${up.name} (Level ${up.level})</div>
        <div style="font-size: 13px; color: #9abfd8;">${up.desc}</div>
      </div>
      <button class="btn-primary" style="padding: 10px 16px;" ${state.credits < up.cost ? 'disabled' : ''} data-upgrade="${upKey}">
        Upgrade (${up.cost} CR)
      </button>
    `;
    baseList.appendChild(card);
  });

  // Missions List
  const missionList = document.getElementById('list-missions');
  missionList.innerHTML = '';
  MISSIONS.forEach(mission => {
    const card = document.createElement('div');
    card.className = 'item-card';
    const stars = '★'.repeat(mission.diff) + '☆'.repeat(5 - mission.diff);
    card.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: center;">
        <span style="font-size: 20px; color: #ffaa00; min-width: 100px;">${stars}</span>
        <div>
          <div style="font-size: 16px; font-weight: bold; color: #fff;">${mission.name}</div>
          <div style="font-size: 12px; color: #9abfd8;">${mission.desc}</div>
          <div style="font-size: 13px; color: #ffd700; margin-top: 4px;">Bounty Reward: ${mission.reward} CR</div>
        </div>
      </div>
      <button class="btn-primary" style="padding: 10px 18px; font-size: 14px;" ${state.fleet.length === 0 ? 'disabled' : ''} data-launch="${mission.id}">
        ⚔ ENGAGE
      </button>
    `;
    missionList.appendChild(card);
  });

  // Planetary Outpost Updates
  const extStatus = document.getElementById('label-extractor-status');
  if (extStatus) {
    extStatus.innerText = `TIER ${state.extractorTier || 1} • HARVESTS: ${state.mineralsHarvested || 0}`;
  }

  const turretCost = 300 * (state.surfaceTurretTier || 1);
  const turretBtn = document.getElementById('btn-build-surface-turret');
  if (turretBtn) {
    turretBtn.innerText = `🛡 REINFORCE SURFACE DEFENSE TURRET (Tier ${(state.surfaceTurretTier || 1) + 1} - ${turretCost} CR)`;
    turretBtn.disabled = state.credits < turretCost;
  }

  const surfaceCamBtn = document.getElementById('btn-toggle-surface-cam');
  if (surfaceCamBtn) {
    surfaceCamBtn.innerText = state.viewMode === 'surface'
      ? '🚀 RETURN CAMERA TO ORBITAL CITADEL'
      : '🔭 SWITCH CAMERA TO SURFACE COLONY';
  }

  const callsignInput = document.getElementById('input-callsign');
  if (callsignInput && callsignInput.value !== state.callsign) {
    callsignInput.value = state.callsign;
  }

  if (typeof updateTurretTierVisuals === 'function') {
    updateTurretTierVisuals();
  }
}

// Global button click handlers
document.addEventListener('click', e => {
  const t = e.target;

  // Screen changes
  if (t.id === 'btn-explore-world') {
    showScreen('commander');
    // Activate the World Outpost tab and land on planet directly
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const worldTabBtn = document.querySelector('.tab-btn[data-tab="world"]');
    if (worldTabBtn) worldTabBtn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => {
      c.style.display = c.id === 'tab-world' ? 'grid' : 'none';
    });
    mmorpg.landOnPlanet(mmorpg.activePlanetId || 'planet_kepler');
    sound.playUi('whoosh');
  } else if (t.id === 'btn-land-surface-gate') {
    document.getElementById('modal-overlay').classList.remove('active');
    showScreen('commander');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const worldTabBtn = document.querySelector('.tab-btn[data-tab="world"]');
    if (worldTabBtn) worldTabBtn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => {
      c.style.display = c.id === 'tab-world' ? 'grid' : 'none';
    });
    mmorpg.landOnPlanet(mmorpg.activePlanetId || 'planet_kepler');
    sound.playUi('whoosh');
  } else if (t.id === 'btn-start' || t.id === 'btn-modal-close') {
    document.getElementById('modal-overlay').classList.remove('active');
    showScreen('commander');
    sound.playUi('click');
  } else if (t.id === 'btn-quick-battle') {
    startBattle(MISSIONS[0]);
    sound.playUi('click');
  } else if (t.id === 'btn-back-menu') {
    showScreen('menu');
    sound.playUi('click');
  } else if (t.id === 'btn-retreat') {
    showScreen('commander');
    sound.playUi('click');
    showToast('⚑ Tactical retreat executed. Fleet returned to orbital starbase.', 'warn');
  } else if (t.id === 'btn-cam-mode') {
    battleCamMode = (battleCamMode + 1) % 3;
    const names = ['🎥 CAM: ORBIT', '🎥 CAM: FLAGSHIP', '🎥 CAM: TACTICAL'];
    t.innerText = names[battleCamMode];
    sound.playUi('click');
  }

  // Planetary Outpost Actions
  if (t.id === 'btn-toggle-surface-cam') {
    if (state.viewMode === 'orbit') {
      mmorpg.landOnPlanet(mmorpg.activePlanetId || 'planet_kepler');
    } else {
      mmorpg.launchToOrbit();
    }
  } else if (t.id === 'btn-extract-minerals') {
    const refineryLevel = state.baseUpgrades?.refinery?.level || 1;
    const bonus = (refineryLevel - 1) * 50;
    const harvestReward = 200 + bonus;
    state.credits += harvestReward;
    state.mineralsHarvested = (state.mineralsHarvested || 0) + 1;
    drillLight.intensity = 6.5;
    sound.playUi('coins');
    sound.playUi('mechanical');
    showToast(`⛏ Harvested Deep-Core Mineral Node: +${harvestReward} CR!`, 'success');
    const statusBox = document.getElementById('colony-status-box');
    if (statusBox) {
      statusBox.innerHTML = `<span style="color: #00ffaa;">✓ Extraction Cycle #${state.mineralsHarvested} Complete:</span> +${harvestReward} CR deposited (${bonus > 0 ? `+${bonus} He-3 Siphon` : 'ore shipment'}). Drill rig cooling.`;
    }
    saveState();
    refreshCommanderUI();
  } else if (t.id === 'btn-build-surface-turret') {
    const cost = 300 * (state.surfaceTurretTier || 1);
    if (state.credits >= cost) {
      state.credits -= cost;
      state.surfaceTurretTier = (state.surfaceTurretTier || 1) + 1;
      sound.playUi('mechanical');
      sound.playUi('upgrade');
      showToast(`🛡 Surface Flak Cannon upgraded to Tier ${state.surfaceTurretTier}!`, 'success');
      const statusBox = document.getElementById('colony-status-box');
      if (statusBox) {
        statusBox.innerHTML = `<span style="color: #00e1ff;">🛡 Point-Defense upgraded to Tier ${state.surfaceTurretTier}:</span> Multibarrel array & planetary barrier online.`;
      }
      saveState();
      refreshCommanderUI();
    } else {
      sound.playUi('warning');
      showToast(`⚠ Insufficient Credits! Requires ${cost} CR for Tier ${(state.surfaceTurretTier || 1) + 1}.`, 'warn');
      const statusBox = document.getElementById('colony-status-box');
      if (statusBox) {
        statusBox.innerHTML = `<span style="color: #ff5555;">⚠ Outpost Upgrade Failed:</span> Need ${cost} CR (current balance: ${state.credits} CR).`;
      }
    }
  } else if (t.id === 'btn-sync-cloud') {
    const input = document.getElementById('input-callsign');
    const callsign = (input && input.value) ? input.value : state.callsign;
    showToast(`☁ Synchronizing profile '${callsign}' with Cloudflare KV...`, 'info');
    syncWithCloud(callsign);
  }

  // Tabs with responsive grid preservation & auto-camera transition
  if (t.classList.contains('tab-btn')) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    t.classList.add('active');
    const tabName = t.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(c => {
      c.style.display = c.id === `tab-${tabName}` ? (tabName === 'armada' || tabName === 'world' ? 'grid' : 'block') : 'none';
    });

    if (tabName === 'world') {
      mmorpg.landOnPlanet(mmorpg.activePlanetId || 'planet_kepler');
    } else {
      if (state.viewMode === 'surface') {
        mmorpg.launchToOrbit();
      }
    }
    refreshCommanderUI();
    sound.playUi('click');
  }

  // Ship buying
  const buyType = t.dataset.buy;
  if (buyType) {
    const def = SHIP_TYPES[buyType];
    if (state.credits >= def.cost) {
      state.credits -= def.cost;
      state.fleet.push(createShipInstance(buyType));
      saveState();
      refreshCommanderUI();
      sound.playUi('upgrade');
      showToast(`🚀 ${def.name} commissioned into active armada!`, 'success');
    }
  }

  // Ship decommissioning
  const scrapIdx = t.dataset.scrap;
  if (scrapIdx !== undefined) {
    const idx = parseInt(scrapIdx, 10);
    const ship = state.fleet[idx];
    if (ship) {
      const refund = Math.round(SHIP_TYPES[ship.type].cost * 0.5);
      state.credits += refund;
      state.fleet.splice(idx, 1);
      saveState();
      refreshCommanderUI();
      sound.playUi('click');
      showToast(`♻ Decommissioned ${ship.name}: +${refund} CR salvaged`, 'info');
    }
  }

  // Base upgrade
  const upKey = t.dataset.upgrade;
  if (upKey) {
    const up = state.baseUpgrades[upKey];
    if (state.credits >= up.cost) {
      state.credits -= up.cost;
      up.level++;
      up.cost = Math.round(up.cost * 1.5);
      saveState();
      refreshCommanderUI();
      sound.playUi('upgrade');
      showToast(`🏛 ${up.name} upgraded to Level ${up.level}!`, 'success');
    }
  }

  // Mission launch
  const missionId = t.dataset.launch;
  if (missionId) {
    const m = MISSIONS.find(mis => mis.id === missionId);
    if (m) {
      startBattle(m);
      sound.playUi('click');
      showToast(`⚔ Deploying armada into contested sector: ${m.name}!`, 'info');
    }
  }
});

// Keyboard controls for flagship manual flight
const activeKeys = {};
window.addEventListener('keydown', e => {
  activeKeys[e.code] = true;
  if (e.code === 'KeyC' && state.mode === 'battle') {
    battleCamMode = (battleCamMode + 1) % 3;
    const btn = document.getElementById('btn-cam-mode');
    if (btn) {
      const modes = ['🎥 CAM: ORBIT', '🎥 CAM: FLAGSHIP CHASE', '🎥 CAM: TOP-DOWN'];
      btn.innerText = modes[battleCamMode];
    }
  }
});
window.addEventListener('keyup', e => {
  activeKeys[e.code] = false;
});

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Callsign input events
const callsignInput = document.getElementById('input-callsign');
if (callsignInput) {
  callsignInput.addEventListener('change', () => {
    state.callsign = callsignInput.value.trim() || 'Commander';
    syncWithCloud(state.callsign);
  });
  callsignInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      state.callsign = callsignInput.value.trim() || 'Commander';
      syncWithCloud(state.callsign);
      callsignInput.blur();
    }
  });
}

// --- MAIN ANIMATION & SIMULATION LOOP ---
const clock = new THREE.Clock();

function updateControlsHud() {
  const map = {
    'hud-key-w': activeKeys['KeyW'] || activeKeys['ArrowUp'],
    'hud-key-s': activeKeys['KeyS'] || activeKeys['ArrowDown'],
    'hud-key-a': activeKeys['KeyA'] || activeKeys['ArrowLeft'],
    'hud-key-d': activeKeys['KeyD'] || activeKeys['ArrowRight'],
    'hud-key-q': activeKeys['KeyQ'],
    'hud-key-e': activeKeys['KeyE'],
    'hud-key-space': activeKeys['Space'],
    'hud-key-c': activeKeys['KeyC']
  };
  for (const [id, isPressed] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) {
      if (isPressed) el.classList.add('pressed');
      else el.classList.remove('pressed');
    }
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const elapsed = clock.getElapsedTime();

  // Asteroid drift
  asteroids.forEach(ast => {
    ast.rotation.x += ast.userData.rx;
    ast.rotation.y += ast.userData.ry;
  });

  // Menu Scene Active Hero Flagship & Planetary Colony Kinematics
  if (state.mode === 'menu' || state.mode === 'commander') {
    heroFlagship.position.y = 1.2 + Math.sin(elapsed * 1.5) * 0.25;
    heroFlagship.rotation.z = 0.05 + Math.sin(elapsed * 1.2) * 0.03;
    escortPort.position.y = -0.6 + Math.sin(elapsed * 1.6 + 0.5) * 0.3;
    escortStarboard.position.y = 0.8 + Math.sin(elapsed * 1.4 + 1.0) * 0.3;
    stationCitadel.rotation.y = elapsed * 0.06;

    engineLights.forEach((light, idx) => {
      light.intensity = 3.0 + Math.sin(elapsed * 10 + idx) * 0.8;
    });

    // Animate planetary colony machinery
    if (typeof drillShaft !== 'undefined') {
      drillShaft.position.y = 5.0 + Math.sin(elapsed * 7.0) * 0.85;
    }
    if (typeof radarDish !== 'undefined') {
      radarDish.rotation.y += delta * 1.4;
    }
    if (typeof turretGun !== 'undefined') {
      turretGun.rotation.y = Math.sin(elapsed * 0.85) * 0.65;
      if (typeof turretGunLeft !== 'undefined') turretGunLeft.rotation.y = turretGun.rotation.y;
      if (typeof turretGunRight !== 'undefined') turretGunRight.rotation.y = turretGun.rotation.y;
    }
    if (typeof drillLight !== 'undefined' && drillLight.intensity > 0) {
      drillLight.intensity = Math.max(0, drillLight.intensity - delta * 4.0);
    }

    // Dynamic Camera View Transition: Orbit vs Surface Colony
    if (state.viewMode === 'surface') {
      const angle = elapsed * 0.12;
      const camTargetPos = new THREE.Vector3(
        Math.sin(angle) * 36,
        -60 + 17,
        Math.cos(angle) * 36
      );
      camera.position.lerp(camTargetPos, delta * 3.5);
      camera.lookAt(0, -60 + 2.5, 0);
    } else {
      const camTargetPos = new THREE.Vector3(
        Math.sin(elapsed * 0.08) * 16,
        4 + Math.sin(elapsed * 0.04) * 1.5,
        18 + Math.cos(elapsed * 0.08) * 4
      );
      camera.position.lerp(camTargetPos, delta * 3.5);
      camera.lookAt(0, 1.2, 0);
    }
  }

  // Battle Simulation
  if (state.mode === 'battle') {
    battleTime += delta;
    updateControlsHud();

    // Animate deep space exploratory beacons
    spaceLandmarks.forEach(bm => {
      bm.rotation.y += bm.userData.rotSpeed || 0.02;
    });

    // Camera positioning
    let centroid = new THREE.Vector3();
    let aliveCount = 0;
    let playerFlagship = null;

    battleShips.forEach(s => {
      if (!s.userData.isDead) {
        centroid.add(s.position);
        aliveCount++;
        if (s.userData.isPlayer && !playerFlagship) {
          playerFlagship = s;
        }
      }
    });

    const isManualPiloting = Boolean(
      playerFlagship &&
      (activeKeys['KeyW'] || activeKeys['ArrowUp'] ||
       activeKeys['KeyS'] || activeKeys['ArrowDown'] ||
       activeKeys['KeyA'] || activeKeys['ArrowLeft'] ||
       activeKeys['KeyD'] || activeKeys['ArrowRight'] ||
       activeKeys['KeyQ'] || activeKeys['KeyE'] ||
       mobileBattleJoy.x !== 0 || mobileBattleJoy.z !== 0 ||
       mobileBattleJoy.up || mobileBattleJoy.down || mobileBattleJoy.fire)
    );

    // Manual Flight Controls for Player Lead Flagship
    if (playerFlagship && !playerFlagship.userData.isDead) {
      if (activeKeys['KeyA'] || activeKeys['ArrowLeft']) {
        playerFlagship.rotation.y += delta * 2.2;
      }
      if (activeKeys['KeyD'] || activeKeys['ArrowRight']) {
        playerFlagship.rotation.y -= delta * 2.2;
      }
      if (activeKeys['KeyW'] || activeKeys['ArrowUp']) {
        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(playerFlagship.quaternion);
        playerFlagship.position.addScaledVector(fwd, playerFlagship.userData.speed * delta * 1.8);
      }
      if (activeKeys['KeyS'] || activeKeys['ArrowDown']) {
        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(playerFlagship.quaternion);
        playerFlagship.position.addScaledVector(fwd, -playerFlagship.userData.speed * delta * 0.7);
      }
      if (activeKeys['KeyQ']) {
        playerFlagship.position.y += playerFlagship.userData.speed * delta * 0.9;
      }
      if (activeKeys['KeyE']) {
        playerFlagship.position.y -= playerFlagship.userData.speed * delta * 0.9;
      }

      // Mobile battle joystick inputs
      if (mobileBattleJoy.x < -0.15) {
        playerFlagship.rotation.y += delta * 2.2 * Math.abs(mobileBattleJoy.x);
      } else if (mobileBattleJoy.x > 0.15) {
        playerFlagship.rotation.y -= delta * 2.2 * mobileBattleJoy.x;
      }
      if (mobileBattleJoy.z < -0.15) {
        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(playerFlagship.quaternion);
        playerFlagship.position.addScaledVector(fwd, playerFlagship.userData.speed * delta * 1.8 * Math.abs(mobileBattleJoy.z));
      } else if (mobileBattleJoy.z > 0.15) {
        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(playerFlagship.quaternion);
        playerFlagship.position.addScaledVector(fwd, -playerFlagship.userData.speed * delta * 0.7 * mobileBattleJoy.z);
      }
      if (mobileBattleJoy.up)   playerFlagship.position.y += playerFlagship.userData.speed * delta * 0.9;
      if (mobileBattleJoy.down) playerFlagship.position.y -= playerFlagship.userData.speed * delta * 0.9;

      // Smooth banking roll into turns (keyboard + mobile)
      const isTurningLeft  = activeKeys['KeyA'] || activeKeys['ArrowLeft']  || mobileBattleJoy.x < -0.15;
      const isTurningRight = activeKeys['KeyD'] || activeKeys['ArrowRight'] || mobileBattleJoy.x >  0.15;
      const targetRoll = isTurningLeft ? 0.4 : (isTurningRight ? -0.4 : 0);
      playerFlagship.rotation.z = THREE.MathUtils.lerp(playerFlagship.rotation.z, targetRoll, delta * 5.0);

      if (activeKeys['Space'] || mobileBattleJoy.fire) {
        const fd = playerFlagship.userData;
        if (battleTime - (fd.lastFire || 0) >= (1.0 / fd.fireRate)) {
          fd.lastFire = battleTime;
          const laserOrigin = playerFlagship.position.clone().add(new THREE.Vector3(0, 0, 2).applyQuaternion(playerFlagship.quaternion));
          const laserTarget = laserOrigin.clone().add(new THREE.Vector3(0, 0, 50).applyQuaternion(playerFlagship.quaternion));
          spawnLaser(laserOrigin, laserTarget, fd.damage, true, fd.target);
          sound.playLaser(true);
        }
      }
    }

    if (aliveCount > 0) {
      centroid.divideScalar(aliveCount);
    }

    if (battleCamMode === 0) {
      // Cinematic Orbit
      const angle = battleTime * 0.15;
      const dist = Math.max(28, 55 - battleTime * 0.35);
      camera.position.set(
        centroid.x + Math.sin(angle) * dist,
        centroid.y + 18,
        centroid.z + Math.cos(angle) * dist
      );
      camera.lookAt(centroid.x, centroid.y + 1, centroid.z);
    } else if (battleCamMode === 1 && playerFlagship) {
      // Flagship Chase Cam
      const backOffset = new THREE.Vector3(0, 4, -16).applyQuaternion(playerFlagship.quaternion);
      camera.position.lerp(playerFlagship.position.clone().add(backOffset), delta * 4);
      camera.lookAt(playerFlagship.position.clone().add(new THREE.Vector3(0, 1, 12).applyQuaternion(playerFlagship.quaternion)));
    } else {
      // Top-Down Overview
      camera.position.set(centroid.x, centroid.y + 65, centroid.z + 0.01);
      camera.lookAt(centroid.x, centroid.y, centroid.z);
    }

    // Ship Kinematics & AI
    let needsRetarget = false;
    battleShips.forEach(ship => {
      const d = ship.userData;
      if (d.isDead) return;

      const target = d.target;
      if (!target || target.userData.isDead) {
        needsRetarget = true;
        return;
      }

      // Passive shield capacitor regeneration for player ships
      if (d.isPlayer && d.shieldCurrent < d.shieldMax) {
        d.shieldCurrent = Math.min(d.shieldMax, d.shieldCurrent + delta * 3.5);
        updateShipHud(ship);
      }

      const dist = ship.position.distanceTo(target.position);
      const rawDir = new THREE.Vector3().subVectors(target.position, ship.position).normalize();

      // True 3D kinematic maneuver: climbing/diving vertical oscillation
      const shipSeed = (typeof ship.userData.id === 'string' && ship.userData.id.length > 0
        ? ship.userData.id.charCodeAt(0)
        : 5) % 7;
      const vertWave = Math.sin(battleTime * 1.8 + shipSeed) * 3.5;
      const target3D = target.position.clone().add(new THREE.Vector3(0, vertWave, 0));
      const dir3D = new THREE.Vector3().subVectors(target3D, ship.position).normalize();
      if (isNaN(dir3D.x) || isNaN(dir3D.y) || isNaN(dir3D.z)) return;

      // Steering & 3D Flight Banking
      if (ship === playerFlagship && isManualPiloting) {
        // Player manual flight in control — no AI fighting the player
      } else if (dist > d.range * 0.7) {
        ship.position.addScaledVector(dir3D, d.speed * delta);
        const lookTarget = ship.position.clone().add(dir3D);
        ship.lookAt(lookTarget);

        // Bank into turns
        const yawDiff = Math.sin(battleTime * 2.0 + shipSeed) * 0.35;
        ship.rotation.z = -yawDiff;
      } else {
        // 3D helical strafing & altitude circling
        const tangent = new THREE.Vector3(-rawDir.z, 0, rawDir.x).normalize();
        const vertDrift = new THREE.Vector3(0, Math.cos(battleTime * 2.2 + shipSeed) * 0.8, 0);
        ship.position.addScaledVector(tangent.add(vertDrift).normalize(), d.speed * 0.45 * delta);
        ship.lookAt(target.position);
      }

      // Weapons firing with ballistic projectile spawn (damage applied upon physical collision)
      d.fireTimer += delta;
      const safeRate = Math.max(0.1, d.fireRate);
      if (dist <= d.range && d.fireTimer >= 1.0 / safeRate) {
        d.fireTimer = 0;
        const muzzlePos = ship.position.clone().add(rawDir.clone().multiplyScalar(2.0));
        spawnLaser(muzzlePos, target.position, d.damage, d.isPlayer, target);
      }
    });

    if (needsRetarget) {
      retargetAll();
    }

    // Projectile updates & physical 3D collision detection
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.life -= delta;
      p.mesh.position.addScaledVector(p.dir, p.speed * delta);

      // Check physical hit on target in 3D space
      if (p.target && !p.target.userData.isDead) {
        let hitRadius = p.target.userData.type === 'battleship' ? 3.8 : p.target.userData.type === 'cruiser' ? 2.6 : 1.8;
        // Require pinpoint aim for NPC fire hitting player ships
        if (!p.isPlayer && p.target.userData.isPlayer) {
          hitRadius *= 0.65;
        }

        if (p.mesh.position.distanceTo(p.target.position) < hitRadius) {
          const tData = p.target.userData;
          let incomingDmg = p.damage;

          // Armor Damage Resistance for User / Player Ships (avoids instant-kill arcade feel)
          if (tData.isPlayer) {
            incomingDmg *= 0.35; // 65% armor damage resistance for player fleet
          }

          if (tData.shieldCurrent > 0) {
            const absorbed = Math.min(tData.shieldCurrent, incomingDmg);
            tData.shieldCurrent -= absorbed;
            incomingDmg -= absorbed;
          }
          if (incomingDmg > 0) {
            tData.hullCurrent -= incomingDmg;
          }
          updateShipHud(p.target);

          if (tData.hullCurrent <= 0 && !tData.isDead) {
            tData.isDead = true;
            spawnExplosion(p.target.position, tData.type === 'battleship' ? 3.0 : 1.2);
            scene.remove(p.target);
            updateBattleCounters();
            retargetAll();
          }

          // Destroy projectile upon impact
          scene.remove(p.mesh);
          disposeHierarchy(p.mesh);
          projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.life <= 0) {
        scene.remove(p.mesh);
        disposeHierarchy(p.mesh);
        projectiles.splice(i, 1);
      }
    }

    // Explosion updates
    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.age += delta;
      const progress = exp.age / exp.duration;

      if (progress >= 1.0) {
        scene.remove(exp.group);
        explosions.splice(i, 1);
      } else {
        const fade = 1.0 - progress;
        exp.flash.scale.setScalar(1.0 + progress * 8 * exp.size);
        exp.flash.material.opacity = fade;

        exp.debris.forEach(d => {
          d.mesh.position.addScaledVector(d.vel, delta);
          d.mesh.scale.setScalar(fade);
        });
      }
    }
  }

  renderer.render(scene, camera);
}

// Start simulation
animate();
