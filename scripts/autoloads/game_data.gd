extends Node

# --- Ship catalogue ---
const SHIP_TYPES: Dictionary = {
	"fighter": {
		"name": "Viper Fighter",
		"description": "Fast attack craft, lethal in swarms",
		"cost": 200,
		"hull": 100,
		"shield": 50,
		"speed": 18.0,
		"damage": 20.0,
		"attack_range": 35.0,
		"fire_rate": 1.5,
		"color": Color(0.2, 0.6, 1.0)
	},
	"interceptor": {
		"name": "Raptor Interceptor",
		"description": "High-speed missile platform",
		"cost": 350,
		"hull": 80,
		"shield": 40,
		"speed": 25.0,
		"damage": 35.0,
		"attack_range": 30.0,
		"fire_rate": 2.0,
		"color": Color(0.9, 0.5, 0.1)
	},
	"cruiser": {
		"name": "Titan Cruiser",
		"description": "Heavy armor and multi-battery cannons",
		"cost": 600,
		"hull": 280,
		"shield": 140,
		"speed": 8.0,
		"damage": 55.0,
		"attack_range": 45.0,
		"fire_rate": 0.8,
		"color": Color(0.1, 0.9, 0.5)
	},
	"battlecruiser": {
		"name": "Union Battlecruiser",
		"description": "Heavy artillery capital warship with reinforced dual barbettes",
		"cost": 950,
		"hull": 460,
		"shield": 220,
		"speed": 6.5,
		"damage": 85.0,
		"attack_range": 50.0,
		"fire_rate": 0.65,
		"is_capital": true,
		"color": Color(0.3, 0.45, 0.95)
	},
	"battleship": {
		"name": "Dreadnought Flagship",
		"description": "Devastating super-capital dreadnought",
		"cost": 1400,
		"hull": 650,
		"shield": 320,
		"speed": 4.0,
		"damage": 120.0,
		"attack_range": 58.0,
		"fire_rate": 0.45,
		"is_capital": true,
		"requires_schematic": "schematic_dreadnought_hull",
		"color": Color(0.95, 0.2, 0.25)
	}
}

# --- Mission catalogue ---
const MISSIONS: Array = [
	{
		"id": "skirmish_1",
		"name": "Frontier Skirmish",
		"description": "Pirate scouting probe detected on our sector edge.",
		"difficulty": 1,
		"reward": 300,
		"enemy_fleet": [{"type": "fighter", "count": 2}]
	},
	{
		"id": "raid_2",
		"name": "Asteroid Belt Raid",
		"description": "Rival faction mining transports with escort wings.",
		"difficulty": 2,
		"reward": 500,
		"enemy_fleet": [{"type": "fighter", "count": 3}, {"type": "interceptor", "count": 1}]
	},
	{
		"id": "defense_3",
		"name": "Outpost Defense",
		"description": "Enemy Strike cruiser approaching humanity's perimeter base.",
		"difficulty": 3,
		"reward": 850,
		"enemy_fleet": [{"type": "fighter", "count": 2}, {"type": "cruiser", "count": 1}]
	},
	{
		"id": "assault_4",
		"name": "Dominion Counter-Assault",
		"description": "Heavy hostile armada patrolling contested coordinates.",
		"difficulty": 4,
		"reward": 1600,
		"enemy_fleet": [
			{"type": "fighter", "count": 4},
			{"type": "interceptor", "count": 2},
			{"type": "cruiser", "count": 2}
		]
	},
	{
		"id": "boss_5",
		"name": "The Leviathan Confrontation",
		"description": "Warlord flagship Dreadnought has entered orbit. Obliterate it.",
		"difficulty": 5,
		"reward": 3500,
		"enemy_fleet": [
			{"type": "fighter", "count": 4},
			{"type": "cruiser", "count": 2},
			{"type": "battleship", "count": 1}
		]
	}
]

# --- Officer & Crew Academy Catalogue ---
const OFFICERS_CATALOGUE: Dictionary = {
	"vance": {
		"id": "vance",
		"name": "Cmdr. Sarah Vance",
		"role": "Tactical Gunnery Master",
		"desc": "+22% Fleet laser weapon damage and critical battery charge",
		"stat_type": "damage",
		"bonus_val": 0.22,
		"cost": {"credits": 500, "crystal": 80}
	},
	"reyes": {
		"id": "reyes",
		"name": "Capt. Hector Reyes",
		"role": "Chief Helmsman",
		"desc": "+25% Ship sub-light maneuver velocity and banking agility",
		"stat_type": "speed",
		"bonus_val": 0.25,
		"cost": {"credits": 450, "helium3": 60}
	},
	"chen": {
		"id": "chen",
		"name": "Dr. Sean Chen",
		"role": "Deflector Shield Specialist",
		"desc": "+30% Shield capacity and +5 HP/sec combat barrier restoration",
		"stat_type": "shield",
		"bonus_val": 0.30,
		"cost": {"credits": 600, "crystal": 120}
	},
	"torg": {
		"id": "torg",
		"name": "Chief Torg",
		"role": "Superstructure Engineer",
		"desc": "+35% Hull integrity and 20% kinetic ballistic impact absorption",
		"stat_type": "hull",
		"bonus_val": 0.35,
		"cost": {"credits": 550, "metal": 250}
	}
}

# --- Schematics & Workshop Catalogue ---
const SCHEMATICS_CATALOGUE: Dictionary = {
	"schematic_tachyonic_laser": {
		"id": "schematic_tachyonic_laser",
		"name": "Tachyonic Pulse Emitter",
		"slot": "weapon",
		"desc": "Advanced particle accelerator yielding +24 Flat Laser Damage",
		"stat": "damage",
		"bonus": 24.0,
		"cost": {"metal": 220, "crystal": 110, "credits": 400}
	},
	"schematic_ablative_plating": {
		"id": "schematic_ablative_plating",
		"name": "Ablative Nanite Plating",
		"slot": "armor",
		"desc": "Self-healing dense composite alloy (+140 Hull Integrity)",
		"stat": "hull_max",
		"bonus": 140.0,
		"cost": {"metal": 300, "credits": 350}
	},
	"schematic_overdrive_engine": {
		"id": "schematic_overdrive_engine",
		"name": "Helium Overdrive Injector",
		"slot": "engine",
		"desc": "Sub-warp thruster bypass giving +6.5 Combat Velocity",
		"stat": "speed",
		"bonus": 6.5,
		"cost": {"metal": 160, "helium3": 90, "credits": 300}
	},
	"schematic_dreadnought_hull": {
		"id": "schematic_dreadnought_hull",
		"name": "Dreadnought Superstructure Blueprint",
		"slot": "hull_blueprint",
		"desc": "Master engineering schematic required to construct Dreadnought Flagships",
		"stat": "unlock",
		"bonus": 1.0,
		"cost": {"metal": 750, "crystal": 380, "helium3": 200, "credits": 1500}
	}
}

# --- Galactic Sectors & Planetary Raids ---
const SECTORS: Array = [
	{
		"id": "sec_kepler",
		"name": "Kepler Expanse",
		"faction": "Galactic Union Frontier",
		"risk": "Low",
		"desc": "Territory under Union orbital defense grid. Rich in deep-core minerals.",
		"raid_reward": {"credits": 450, "metal": 280, "crystal": 90},
		"enemy_fleet": [{"type": "fighter", "count": 3}]
	},
	{
		"id": "sec_belt",
		"name": "Asteroid Belt Xi-9",
		"faction": "NGF Pirate Harvesters",
		"risk": "Moderate",
		"desc": "Lawless mining corridor infested with pirate raiders and scavengers.",
		"raid_reward": {"credits": 800, "metal": 450, "crystal": 220, "helium3": 75},
		"enemy_fleet": [{"type": "fighter", "count": 3}, {"type": "interceptor", "count": 2}]
	},
	{
		"id": "sec_nebula",
		"name": "Veiled Nebula Outpost",
		"faction": "Dominion Vanguard Warlords",
		"risk": "High",
		"desc": "Hostile gas nebula with heavily armed pirate dreadnought escorts.",
		"raid_reward": {"credits": 1400, "metal": 600, "crystal": 380, "helium3": 180},
		"enemy_fleet": [{"type": "fighter", "count": 4}, {"type": "cruiser", "count": 2}]
	},
	{
		"id": "sec_rift",
		"name": "Cooperative Rift Sector Zero",
		"faction": "Abyssal Rift Incursion",
		"risk": "Extreme",
		"desc": "Tear in dimensional space-time. Hostile alien vanguard guarding rare blueprints.",
		"is_rift": true,
		"raid_reward": {"credits": 2800, "metal": 900, "crystal": 650, "helium3": 350, "schematic": "schematic_dreadnought_hull"},
		"enemy_fleet": [{"type": "fighter", "count": 4}, {"type": "cruiser", "count": 2}, {"type": "battleship", "count": 1}]
	}
]

# --- Competitive Fleet Ladder League ---
const LADDER_OPPONENTS: Array = [
	{
		"commander": "Cmdr. Valerius (7th Wing)",
		"division": "Vanguard Division",
		"rating": 1250,
		"power": 650,
		"bounty": 500,
		"fleet": [{"type": "fighter", "count": 3}, {"type": "interceptor", "count": 1}]
	},
	{
		"commander": "Admiral Thorne (Black Sun)",
		"division": "Fleet Admiral League",
		"rating": 1420,
		"power": 1150,
		"bounty": 950,
		"fleet": [{"type": "fighter", "count": 3}, {"type": "interceptor", "count": 2}, {"type": "cruiser", "count": 1}]
	},
	{
		"commander": "High Warlord Karr (Dominion Alpha)",
		"division": "Dominion Sovereign Tier",
		"rating": 1680,
		"power": 2200,
		"bounty": 2100,
		"fleet": [{"type": "fighter", "count": 4}, {"type": "cruiser", "count": 2}, {"type": "battlecruiser", "count": 1}]
	}
]

# --- State ---
var credits: int = 1200
var metal: int = 650
var crystal: int = 300
var helium3: int = 150
var storage_max: int = 8000

var player_fleet: Array = []
var victories: int = 0
var total_battles: int = 0
var current_mission: Dictionary = {}

var recruited_officers: Array = []
var unlocked_schematics: Array = ["schematic_tachyonic_laser", "schematic_ablative_plating", "schematic_overdrive_engine"]
var inventory_equipment: Array = []

var ladder_rating: int = 1200
var ladder_victories: int = 0

var current_colony_id: String = "kepler_186f"
var colonies: Dictionary = {
	"kepler_186f": {
		"name": "Kepler-186f Frontier Outpost",
		"type": "Terrestrial Frontier World",
		"color": Color(0.18, 0.55, 0.42),
		"buildings": {
			"dome": {"name": "Pressurized Command Dome", "level": 1, "desc": "Command habitat and telemetry station"},
			"drill": {"name": "Helium-3 Extractor Rig", "level": 1, "desc": "Sub-surface geothermal drill harvesting power cells", "cost": {"credits": 350, "metal": 180}},
			"refinery": {"name": "Deep-Core Metal Extractor", "level": 1, "desc": "Automated refinery generating construction metals", "cost": {"credits": 300, "metal": 140}},
			"turret": {"name": "Surface Defense Flak Cannon", "level": 1, "desc": "Planetary point-defense protecting colony airspace", "cost": {"credits": 400, "metal": 220, "crystal": 60}}
		},
		"harvest_available": true
	},
	"gliese_667c": {
		"name": "Gliese-667C Redoubt",
		"type": "Arid Crystal Badlands",
		"color": Color(0.75, 0.42, 0.22),
		"buildings": {
			"dome": {"name": "Sub-Surface Biosphere", "level": 1, "desc": "Reinforced radiation shelter"},
			"drill": {"name": "Crystal Siphon Quarry", "level": 1, "desc": "Excavator extracting rare energy crystals", "cost": {"credits": 450, "metal": 240}},
			"refinery": {"name": "Mineral Synthesizer", "level": 1, "desc": "High-yield heavy smelter", "cost": {"credits": 380, "metal": 200}},
			"turret": {"name": "Planetary Laser Battery", "level": 1, "desc": "Thermal defense beam network", "cost": {"credits": 500, "crystal": 120}}
		},
		"harvest_available": true
	}
}

const SAVE_PATH: String = "user://savegame.json"

func _ready() -> void:
	load_game()
	if player_fleet.is_empty():
		player_fleet.append(create_ship_instance("fighter"))
		player_fleet.append(create_ship_instance("interceptor"))
		save_game()

func save_game() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		var data := {
			"credits": credits,
			"metal": metal,
			"crystal": crystal,
			"helium3": helium3,
			"victories": victories,
			"total_battles": total_battles,
			"player_fleet": player_fleet,
			"recruited_officers": recruited_officers,
			"unlocked_schematics": unlocked_schematics,
			"inventory_equipment": inventory_equipment,
			"ladder_rating": ladder_rating,
			"ladder_victories": ladder_victories,
			"colonies": colonies
		}
		file.store_string(JSON.stringify(data, "\t"))
		file.close()

func load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return
	var text := file.get_as_text()
	file.close()
	var test_json_conv := JSON.new()
	var parse_err := test_json_conv.parse(text)
	if parse_err != OK:
		return
	var data: Variant = test_json_conv.data
	if data is Dictionary:
		credits = int(data.get("credits", 1200))
		metal = int(data.get("metal", 650))
		crystal = int(data.get("crystal", 300))
		helium3 = int(data.get("helium3", 150))
		victories = int(data.get("victories", 0))
		total_battles = int(data.get("total_battles", 0))
		ladder_rating = int(data.get("ladder_rating", 1200))
		ladder_victories = int(data.get("ladder_victories", 0))
		if data.has("player_fleet") and data["player_fleet"] is Array:
			player_fleet = data["player_fleet"]
		if data.has("recruited_officers") and data["recruited_officers"] is Array:
			recruited_officers = data["recruited_officers"]
		if data.has("unlocked_schematics") and data["unlocked_schematics"] is Array:
			unlocked_schematics = data["unlocked_schematics"]
		if data.has("inventory_equipment") and data["inventory_equipment"] is Array:
			inventory_equipment = data["inventory_equipment"]
		if data.has("colonies") and data["colonies"] is Dictionary:
			colonies = data["colonies"]

func can_afford(costs: Dictionary) -> bool:
	if credits < int(costs.get("credits", 0)): return false
	if metal < int(costs.get("metal", 0)): return false
	if crystal < int(costs.get("crystal", 0)): return false
	if helium3 < int(costs.get("helium3", 0)): return false
	return true

func spend_resources(costs: Dictionary) -> bool:
	if not can_afford(costs):
		return false
	credits -= int(costs.get("credits", 0))
	metal -= int(costs.get("metal", 0))
	crystal -= int(costs.get("crystal", 0))
	helium3 -= int(costs.get("helium3", 0))
	save_game()
	return true

func add_resources(gains: Dictionary) -> void:
	credits += int(gains.get("credits", 0))
	metal = mini(storage_max, metal + int(gains.get("metal", 0)))
	crystal = mini(storage_max, crystal + int(gains.get("crystal", 0)))
	helium3 = mini(storage_max, helium3 + int(gains.get("helium3", 0)))
	if gains.has("schematic"):
		var sc: String = gains["schematic"]
		if not unlocked_schematics.has(sc):
			unlocked_schematics.append(sc)
	save_game()

func create_ship_instance(type: String) -> Dictionary:
	var d: Dictionary = SHIP_TYPES[type].duplicate(true)
	var instance := {
		"id": "ship_%d_%d" % [Time.get_ticks_msec(), randi() % 10000],
		"type":           type,
		"name":           d["name"],
		"hull_max":       float(d["hull"]),
		"hull_current":   float(d["hull"]),
		"shield_max":     float(d["shield"]),
		"shield_current": float(d["shield"]),
		"speed":          float(d["speed"]),
		"damage":         float(d["damage"]),
		"attack_range":   float(d["attack_range"]),
		"fire_rate":      float(d["fire_rate"]),
		"color":          d["color"],
		"is_capital":      d.get("is_capital", false),
		"officer":        "",
		"modules":        []
	}
	_apply_officer_and_module_buffs(instance)
	return instance

func _apply_officer_and_module_buffs(ship: Dictionary) -> void:
	# Calculate and apply passive officer buffs
	for off_id in recruited_officers:
		if OFFICERS_CATALOGUE.has(off_id):
			var off = OFFICERS_CATALOGUE[off_id]
			match off["stat_type"]:
				"damage":
					ship["damage"] = ship["damage"] * (1.0 + off["bonus_val"])
				"speed":
					ship["speed"] = ship["speed"] * (1.0 + off["bonus_val"])
				"shield":
					ship["shield_max"] = ship["shield_max"] * (1.0 + off["bonus_val"])
					ship["shield_current"] = ship["shield_max"]
				"hull":
					ship["hull_max"] = ship["hull_max"] * (1.0 + off["bonus_val"])
					ship["hull_current"] = ship["hull_max"]

func get_fleet_power() -> int:
	var power: int = 0
	for ship in player_fleet:
		power += int(ship["hull_max"]) + int(ship["shield_max"]) + int(ship["damage"]) * 10
	return power

func repair_fleet() -> void:
	for ship in player_fleet:
		ship["hull_current"] = ship["hull_max"]
		ship["shield_current"] = ship["shield_max"]
	save_game()

func add_credits(amount: int) -> void:
	add_resources({"credits": amount})

func spend_credits(amount: int) -> bool:
	return spend_resources({"credits": amount})

func harvest_surface_node(planet_id: String) -> Dictionary:
	var col = colonies.get(planet_id, colonies["kepler_186f"])
	var yield_res: Dictionary = {}
	if planet_id == "kepler_186f":
		var drill_lvl: int = col["buildings"]["drill"]["level"]
		var ref_lvl: int = col["buildings"]["refinery"]["level"]
		yield_res = {
			"credits": 250 + drill_lvl * 75,
			"metal": 180 + ref_lvl * 80,
			"helium3": 60 + drill_lvl * 40
		}
	else:
		var drill_lvl: int = col["buildings"]["drill"]["level"]
		var ref_lvl: int = col["buildings"]["refinery"]["level"]
		yield_res = {
			"credits": 300 + drill_lvl * 80,
			"metal": 150 + ref_lvl * 60,
			"crystal": 120 + drill_lvl * 50
		}
	add_resources(yield_res)
	return yield_res

func upgrade_colony_building(planet_id: String, b_key: String) -> bool:
	if not colonies.has(planet_id): return false
	var col = colonies[planet_id]
	if not col["buildings"].has(b_key): return false
	var b = col["buildings"][b_key]
	var cost = b.get("cost", {"credits": 300, "metal": 150})
	if spend_resources(cost):
		b["level"] = b.get("level", 1) + 1
		# Scale cost for next tier
		for res in cost.keys():
			cost[res] = int(cost[res] * 1.5)
		save_game()
		return true
	return false

func recruit_officer(officer_id: String) -> bool:
	if recruited_officers.has(officer_id): return false
	if not OFFICERS_CATALOGUE.has(officer_id): return false
	var off = OFFICERS_CATALOGUE[officer_id]
	if spend_resources(off["cost"]):
		recruited_officers.append(officer_id)
		# Re-apply fleet buffs across armada
		for ship in player_fleet:
			_apply_officer_and_module_buffs(ship)
		save_game()
		return true
	return false

func craft_schematic(schematic_id: String) -> bool:
	if not SCHEMATICS_CATALOGUE.has(schematic_id): return false
	var item = SCHEMATICS_CATALOGUE[schematic_id]
	if spend_resources(item["cost"]):
		if item["slot"] == "hull_blueprint":
			if not unlocked_schematics.has(schematic_id):
				unlocked_schematics.append(schematic_id)
		else:
			inventory_equipment.append(item.duplicate(true))
		save_game()
		return true
	return false

func get_available_missions() -> Array:
	return MISSIONS
