# Redshift Space Battles (Godot 4 & Web Full-Stack)

Full reconstruction inspired by **Redshift Space Battles** by Clipwire Games (documented v4.5.2).

## 🚀 Features & Subsystems

✔ **3D Planetary Surface Exploration (World Landing)**:
- Touch down directly from orbit onto rocky alien world surfaces (**Kepler-186f** and **Gliese-667C**).
- Procedural terrain surface with landing beacon ring lights and automated dropship landing pads.
- Sub-surface geothermal **Helium-3 Extractor Rig** with animated reciprocating drill shafts.
- Pressurized **Bio-Dome** colonies and rotating long-range telemetry dishes.
- Swiveling **Surface Defense Flak Cannons** protecting colony airspace against hostile raiders.
- Active mineral harvesting of deep-core mineral nodes yielding live metals, crystals, and helium-3.

✔ **Multi-Resource Persistent Economy**:
- Authoritative accounting for **Credits**, **Metal**, **Crystal**, and **Helium-3**.
- Storage capacities, upgrade costs, and mining extraction yields persisted to `user://savegame.json` and web cloud storage.

✔ **Full Shipyard & Capital Fleet Roster**:
- **Viper Fighter**: Fast, agile dogfighter lethal in swarms.
- **Raptor Interceptor**: High-speed missile platform with swept wings.
- **Titan Cruiser**: Armored broadside capital warship with heavy dual turrets.
- **Union Battlecruiser**: Heavy artillery capital warship with reinforced dual barbettes.
- **Dreadnought Flagship**: Walking apocalypse super-capital warship with triple turret batteries (requires recovered Dreadnought Blueprint).

✔ **Officer & Crew Academy**:
- Recruit naval specialists granting passive armada-wide combat buffs:
  - **Cmdr. Sarah Vance** (Tactical): +22% laser damage and battery charge.
  - **Capt. Hector Reyes** (Helm): +25% combat velocity and agility.
  - **Dr. Sean Chen** (Shields): +30% barrier capacity & +5 HP/sec restoration.
  - **Chief Torg** (Engineering): +35% hull integrity & 20% kinetic mitigation.

✔ **Workshop & Collectible Schematics**:
- Recover and manufacture experimental components:
  - *Tachyonic Pulse Emitter* (+24 flat weapon damage)
  - *Ablative Nanite Plating* (+140 hull)
  - *Helium Overdrive Injector* (+6.5 combat velocity)
  - *Dreadnought Superstructure Blueprint* (unlocks super-capital flagship construction)

✔ **Sector Map, Planetary Raids & Co-op Rifts**:
- Navigate contested star sectors across the galaxy:
  - **Kepler Expanse** (Galactic Union Frontier)
  - **Asteroid Belt Xi-9** (NGF Pirate Harvesters)
  - **Veiled Nebula Outpost** (Dominion Vanguard Warlords)
  - **Cooperative Rift Sector Zero** (Abyssal Incursion high-tier boss raid with rare blueprint loot)

✔ **Competitive Fleet Ladder League**:
- Challenge ranked commander armadas in the Dominion Vanguard division.
- ELO ladder ratings, match histories, and bounty rewards.

✔ **Explosive 3D Tactical Combat Engine**:
- Dynamic cinematic cameras: Orbit, Flagship Focus, and Top-Down Tactical Overview.
- Micro-guided laser bolts, dynamic omni-light explosions, and screen shake.

---

## 🎮 How to Play

1. Run `launch_game.bat` inside this folder (or run `godot.exe`).
2. From the **Main Menu**:
   - Click **Command Fleet & Base** to access the Starbase Command Center.
   - Click **Planetary Surface Expedition** to touch down onto the 3D colony surface.
3. In the **Starbase Command Center**, navigate the tabs:
   - **Armada**: Monitor active ships and fleet power rating.
   - **Planetary Outpost**: Manage surface geothermal extraction and launch 3D surface landing.
   - **Shipyard**: Recruit strike fighters, cruisers, and capital battlecruisers.
   - **Officers & Crew**: Recruit specialized officers for fleet-wide buffs.
   - **Workshop & Schematics**: Fabricate advanced components.
   - **Sectors & Raids**: Deploy your armada on resource raids and rift incursions.
   - **Warzone & Ladder**: Campaign missions and competitive ELO ladder battles.

---

## 💻 Headless Simulation & Web Engine (`packages/`)

The repository also includes a deterministic TypeScript monorepo implementation:
- **`@redshift/engine`**: Headless, deterministic tick-based combat engine, authoritative transactional `ResourceLedger`, and canonical ship/building registries.
- **`@redshift/server`**: Fastify REST backend with SQLite persistence (`redshift.db`) for authoritative player profiles, resources, and combat results.
- **`@redshift/client`**: React 18 + Vite HUD interface with real-time resource monitors, base manager, and mission deployment.

```bash
# Install dependencies
pnpm install

# Run automated tests
pnpm test

# Launch dev server & web client
pnpm dev
```
