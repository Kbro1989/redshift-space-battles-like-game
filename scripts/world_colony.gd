extends Node3D

var _camera: Camera3D
var _cam_angle: float = 0.0
var _cam_dist: float = 38.0
var _cam_height: float = 16.0
var _cam_target: Vector3 = Vector3(0, 2, 0)

var _drill_shaft: MeshInstance3D
var _radar_dish: MeshInstance3D
var _turret_gun: MeshInstance3D
var _heightmap: RefCounted = null
var _time: float = 0.0

var _hud: CanvasLayer
var _status_label: Label
var _res_label: Label
var _colony_info_label: Label
var _harvest_btn: Button
var _explore_banner: Label

# In-Person Space-Scape Player System
var _player: Node3D = null
var _player_mesh_root: Node3D = null
var _player_body: MeshInstance3D = null
var _player_head: MeshInstance3D = null
var _player_leg_l: MeshInstance3D = null
var _player_leg_r: MeshInstance3D = null
var _player_arm_l: MeshInstance3D = null
var _player_arm_r: MeshInstance3D = null
var _tool_mesh: MeshInstance3D = null

var _first_person: bool = true # In-Person Player POV by default
var _explore_mode: bool = true # Live 3D on-world exploration active on start
var _player_yaw: float = 0.0
var _player_pitch: float = 0.0
var _walk_anim_time: float = 0.0
var _vertical_velocity: float = 0.0
var _is_grounded: bool = true
var _laser_beam: MeshInstance3D = null

# Interactive World Nodes System
var _world_nodes: Array = []
var _targeted_node: Dictionary = {}
var _active_action_node: Dictionary = {}
var _action_timer: float = 0.0
var _action_duration: float = 0.0
var _current_action_name: String = ""

# Space-Scape Skills & Inventory
var _skills: Dictionary = {
	"mining":      {"lvl": 1, "xp": 0, "name": "Mining", "icon": "⛏"},
	"foraging":    {"lvl": 1, "xp": 0, "name": "Foraging", "icon": "🌿"},
	"combat":      {"lvl": 1, "xp": 0, "name": "Combat", "icon": "⚔"},
	"engineering": {"lvl": 1, "xp": 1, "name": "Engineering", "icon": "🔧"},
	"scavenging":  {"lvl": 1, "xp": 0, "name": "Scavenging", "icon": "🔍"}
}

var _inventory: Dictionary = {
	"crystal_ore": 0,
	"he3_fuel": 0,
	"bio_spores": 0,
	"scrap_metal": 0,
	"chitin_plate": 0
}

# Space-Scape UI Components
var _reticle_label: Label = null
var _context_prompt: Label = null
var _action_progress_bar: ProgressBar = null
var _action_desc_label: Label = null
var _xp_drops_box: VBoxContainer = null
var _chat_log_vbox: VBoxContainer = null
var _chat_scroll: ScrollContainer = null
var _minimap_draw: Control = null
var _side_drawer: PanelContainer = null
var _side_drawer_tab: String = "inventory" # "inventory" or "skills"
var _drawer_content_box: VBoxContainer = null
var _level_up_banner: Label = null
var _pov_indicator: Label = null

var _npcs: Array = []

func _ready() -> void:
	_setup_environment()
	_setup_camera()
	_setup_lighting()
	_setup_terrain()
	_setup_structures()
	_setup_world_nodes()
	_setup_audio_and_effects()
	_spawn_player()
	_setup_ui()
	_refresh_ui()
	_enter_exploration_mode()

func _setup_environment() -> void:
	var env_node := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	var planet_col: Color = GameData.colonies[GameData.current_colony_id].get("color", Color(0.18, 0.45, 0.35))
	env.background_color = Color(planet_col.r * 0.15, planet_col.g * 0.18, planet_col.b * 0.25)
	env.ambient_light_color = planet_col.lightened(0.2)
	env.ambient_light_energy = 0.8
	env.glow_enabled = true
	env.glow_intensity = 0.8
	env.glow_bloom = 0.2
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env_node.environment = env
	add_child(env_node)

func _setup_camera() -> void:
	_camera = Camera3D.new()
	_camera.fov = 65.0
	add_child(_camera)
	_update_cam_pos()

func _setup_lighting() -> void:
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-35, 45, 0)
	sun.light_color = Color(1.0, 0.95, 0.85)
	sun.light_energy = 1.9
	sun.shadow_enabled = true
	add_child(sun)

	var fill := DirectionalLight3D.new()
	fill.rotation_degrees = Vector3(25, -135, 0)
	fill.light_color = Color(0.25, 0.4, 0.6)
	fill.light_energy = 0.6
	add_child(fill)

func _mat(col: Color, metal: float = 0.6, rough: float = 0.4, emit: Color = Color.BLACK, emit_e: float = 0.0) -> StandardMaterial3D:
	var key: String = "mat_%s_%d_%d_%d" % [col.to_html(false), int(metal * 100), int(rough * 100), int(emit_e * 10)]
	return AssetCache.get_material(key, col, metal, rough, emit, emit_e)

func _setup_terrain() -> void:
	var colony_data: Dictionary = GameData.colonies.get(GameData.current_colony_id, {})
	var planet_col: Color = colony_data.get("color", Color(0.25, 0.22, 0.18))
	var colony_seed: int = 777 if GameData.current_colony_id == "kepler_186f" else 999

	_heightmap = AssetCache.create_heightmap_terrain(48, 48, 3.5)
	var terrain_mesh: ArrayMesh = _heightmap.generate_surface(colony_seed, planet_col.darkened(0.45))

	var terrain_node := MeshInstance3D.new()
	terrain_node.mesh = terrain_mesh
	var terr_mat := AssetCache.get_material("terrain_" + GameData.current_colony_id, planet_col.darkened(0.5), 0.1, 0.9)
	terrain_node.material_override = terr_mat
	add_child(terrain_node)

	# Mountainous rocky outcroppings and mineral crystal clusters placed at exact surface elevations
	var rng := RandomNumberGenerator.new()
	rng.seed = colony_seed
	for _i in 22:
		var rx: float = rng.randf_range(-75.0, 75.0)
		var rz: float = rng.randf_range(-75.0, 75.0)
		if Vector2(rx, rz).length() < 24.0:
			var push := Vector2(rx, rz).normalized() * 26.0
			rx = push.x
			rz = push.y

		var ry: float = _heightmap.sample_height(rx, rz)

		var rock := MeshInstance3D.new()
		var cyl := CylinderMesh.new()
		cyl.top_radius = rng.randf_range(1.2, 3.8)
		cyl.bottom_radius = rng.randf_range(3.8, 7.2)
		cyl.height = rng.randf_range(5.0, 14.0)
		rock.mesh = cyl
		rock.material_override = AssetCache.get_material("rock_crust_" + GameData.current_colony_id, planet_col.darkened(0.65), 0.25, 0.8)
		rock.position = Vector3(rx, ry + cyl.height * 0.42, rz)
		add_child(rock)

		# Add mineral crystals sprouting from slopes
		if rng.randf() > 0.45:
			var crystal := MeshInstance3D.new()
			var cm := CylinderMesh.new()
			cm.top_radius = 0.05
			cm.bottom_radius = rng.randf_range(0.4, 0.9)
			cm.height = rng.randf_range(2.5, 5.0)
			crystal.mesh = cm
			var c_color := Color(0.2, 0.8, 1.0) if GameData.current_colony_id == "kepler_186f" else Color(1.0, 0.45, 0.1)
			crystal.material_override = AssetCache.get_material("crystal_ore_" + GameData.current_colony_id, c_color, 0.8, 0.2, c_color, 2.5)
			crystal.position = Vector3(rx + rng.randf_range(-3, 3), ry + 0.5, rz + rng.randf_range(-3, 3))
			crystal.rotation_degrees = Vector3(rng.randf_range(-25, 25), rng.randf_range(0, 360), rng.randf_range(-25, 25))
			add_child(crystal)

func _setup_structures() -> void:
	# Central Dropship Landing Pad flush with plateau
	var pad_y: float = _heightmap.sample_height(0.0, 0.0) if _heightmap else 0.0
	var pad := MeshInstance3D.new()
	var pad_mesh := CylinderMesh.new()
	pad_mesh.top_radius = 9.0
	pad_mesh.bottom_radius = 9.5
	pad_mesh.height = 0.8
	pad.mesh = pad_mesh
	pad.material_override = AssetCache.get_material("pad_tarmac", Color(0.12, 0.16, 0.24), 0.85, 0.25)
	pad.position = Vector3(0, pad_y + 0.4, 0)
	add_child(pad)

	# Landing beacon ring lights
	for i in 8:
		var beacon := OmniLight3D.new()
		var ang := i * PI * 0.25
		beacon.position = Vector3(cos(ang) * 8.2, pad_y + 1.0, sin(ang) * 8.2)
		beacon.light_color = Color(0.0, 1.0, 0.6)
		beacon.light_energy = 3.0
		beacon.omni_range = 7.0
		add_child(beacon)

		var b_mesh := MeshInstance3D.new()
		var bm := SphereMesh.new()
		bm.radius = 0.25
		bm.height = 0.5
		b_mesh.mesh = bm
		b_mesh.material_override = AssetCache.get_material("beacon_glow", Color(0.0, 1.0, 0.6), 0.0, 0.0, Color(0.0, 1.0, 0.6), 4.0)
		b_mesh.position = beacon.position
		add_child(b_mesh)

	# Biosphere Command Dome snapped to terrain elevation
	var dome_x: float = -18.0
	var dome_z: float = -12.0
	var dome_y: float = _heightmap.sample_height(dome_x, dome_z) if _heightmap else 0.0

	var dome := MeshInstance3D.new()
	var dm := SphereMesh.new()
	dm.radius = 5.2
	dm.height = 10.4
	dome.mesh = dm
	var dome_mat := AssetCache.get_material("dome_glass", Color(0.15, 0.45, 0.65), 0.4, 0.1, Color(0.1, 0.6, 0.9), 1.2, 0.8)
	dome.material_override = dome_mat
	dome.position = Vector3(dome_x, dome_y + 1.2, dome_z)
	add_child(dome)

	var dome_base := MeshInstance3D.new()
	var db_mesh := CylinderMesh.new()
	db_mesh.top_radius = 5.6
	db_mesh.bottom_radius = 5.8
	db_mesh.height = 1.4
	dome_base.mesh = db_mesh
	dome_base.material_override = AssetCache.get_material("structure_metal", Color(0.2, 0.25, 0.35), 0.8, 0.3)
	dome_base.position = Vector3(dome_x, dome_y + 0.7, dome_z)
	add_child(dome_base)

	# Sub-Surface Helium-3 Geothermal Mining Rig
	var rig_x: float = 18.0
	var rig_z: float = -10.0
	var rig_y: float = _heightmap.sample_height(rig_x, rig_z) if _heightmap else 0.0

	var rig := Node3D.new()
	rig.position = Vector3(rig_x, rig_y, rig_z)
	var rig_chassis := MeshInstance3D.new()
	var rm := BoxMesh.new()
	rm.size = Vector3(5.0, 6.5, 5.0)
	rig_chassis.mesh = rm
	rig_chassis.material_override = AssetCache.get_material("rig_chassis", Color(0.35, 0.28, 0.2), 0.85, 0.3)
	rig_chassis.position.y = 3.25
	rig.add_child(rig_chassis)

	_drill_shaft = MeshInstance3D.new()
	var dsm := CylinderMesh.new()
	dsm.top_radius = 0.6
	dsm.bottom_radius = 0.6
	dsm.height = 5.5
	_drill_shaft.mesh = dsm
	_drill_shaft.material_override = AssetCache.get_material("drill_shaft", Color(1.0, 0.7, 0.1), 0.95, 0.1, Color(1.0, 0.6, 0.0), 2.0)
	_drill_shaft.position.y = 5.5
	rig.add_child(_drill_shaft)
	add_child(rig)

	# Rotating Radar Telemetry Dish Tower
	var tower_x: float = -14.0
	var tower_z: float = 16.0
	var tower_y: float = _heightmap.sample_height(tower_x, tower_z) if _heightmap else 0.0

	var tower := Node3D.new()
	tower.position = Vector3(tower_x, tower_y, tower_z)
	var mast := MeshInstance3D.new()
	var mm := CylinderMesh.new()
	mm.top_radius = 0.4
	mm.bottom_radius = 0.7
	mm.height = 9.0
	mast.mesh = mm
	mast.material_override = AssetCache.get_material("tower_mast", Color(0.35, 0.4, 0.5), 0.75, 0.35)
	mast.position.y = 4.5
	tower.add_child(mast)

	_radar_dish = MeshInstance3D.new()
	var rdm := CylinderMesh.new()
	rdm.top_radius = 2.8
	rdm.bottom_radius = 0.3
	rdm.height = 0.7
	_radar_dish.mesh = rdm
	_radar_dish.material_override = AssetCache.get_material("radar_dish", Color(0.85, 0.9, 0.95), 0.9, 0.2)
	_radar_dish.position.y = 9.2
	_radar_dish.rotation_degrees = Vector3(55, 0, 0)
	tower.add_child(_radar_dish)
	add_child(tower)

	# Surface Point-Defense Flak Turret
	var turret_x: float = 14.0
	var turret_z: float = 14.0
	var turret_y: float = _heightmap.sample_height(turret_x, turret_z) if _heightmap else 0.0

	var turret := Node3D.new()
	turret.position = Vector3(turret_x, turret_y, turret_z)
	var t_base := MeshInstance3D.new()
	var tbm := BoxMesh.new()
	tbm.size = Vector3(3.6, 2.2, 3.6)
	t_base.mesh = tbm
	t_base.material_override = AssetCache.get_material("turret_base", Color(0.25, 0.3, 0.4), 0.8, 0.3)
	t_base.position.y = 1.1
	turret.add_child(t_base)

	_turret_gun = MeshInstance3D.new()
	var tgm := CylinderMesh.new()
	tgm.top_radius = 0.25
	tgm.bottom_radius = 0.25
	tgm.height = 4.2
	_turret_gun.mesh = tgm
	_turret_gun.material_override = AssetCache.get_material("turret_gun", Color(0.5, 0.55, 0.65), 0.9, 0.2)
	_turret_gun.position.y = 2.6
	_turret_gun.rotation_degrees = Vector3(40, 0, 0)
	turret.add_child(_turret_gun)
	add_child(turret)

func _setup_audio_and_effects() -> void:
	# Laser mining/blaster beam node
	_laser_beam = MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.05
	cyl.bottom_radius = 0.05
	cyl.height = 1.0
	_laser_beam.mesh = cyl
	var beam_mat := StandardMaterial3D.new()
	beam_mat.albedo_color = Color(0.2, 0.9, 1.0)
	beam_mat.emission_enabled = true
	beam_mat.emission = Color(0.2, 0.9, 1.0)
	beam_mat.emission_energy_multiplier = 4.0
	_laser_beam.material_override = beam_mat
	_laser_beam.visible = false
	add_child(_laser_beam)

func _play_sfx(sound_name: String, pitch_rnd: float = 0.08) -> void:
	var path := "res://assets/audio/%s.wav" % sound_name
	if not ResourceLoader.exists(path):
		return
	var player := AudioStreamPlayer.new()
	player.stream = load(path)
	player.pitch_scale = randf_range(1.0 - pitch_rnd, 1.0 + pitch_rnd)
	add_child(player)
	player.play()
	player.finished.connect(player.queue_free)

func _setup_world_nodes() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 54321
	var colony_data: Dictionary = GameData.colonies.get(GameData.current_colony_id, {})
	var is_kepler: bool = (GameData.current_colony_id == "kepler_186f")
	var crystal_color := Color(0.2, 0.85, 1.0) if is_kepler else Color(1.0, 0.5, 0.15)

	# 1. LUMINESCENT CRYSTAL NODES (Mining)
	for i in 12:
		var ang := rng.randf_range(0.0, TAU)
		var dist := rng.randf_range(18.0, 68.0)
		var nx := cos(ang) * dist
		var nz := sin(ang) * dist
		var ny: float = _heightmap.sample_height(nx, nz) if _heightmap else 0.0

		var root := Node3D.new()
		root.position = Vector3(nx, ny, nz)
		add_child(root)

		# Rocky base crag
		var base := MeshInstance3D.new()
		var bm := CylinderMesh.new()
		bm.top_radius = 1.1
		bm.bottom_radius = 1.8
		bm.height = 1.4
		base.mesh = bm
		base.material_override = AssetCache.get_material("crystal_base_mat", Color(0.22, 0.22, 0.25), 0.3, 0.8)
		base.position.y = 0.7
		root.add_child(base)

		# Cluster of sharp crystals
		var crystal_cluster := Node3D.new()
		crystal_cluster.position.y = 1.2
		root.add_child(crystal_cluster)

		var c_mat: StandardMaterial3D = AssetCache.get_material("c_active_%d" % i, crystal_color, 0.8, 0.15, crystal_color, 3.2)
		var dep_mat: StandardMaterial3D = AssetCache.get_material("c_depleted", Color(0.3, 0.3, 0.35), 0.1, 0.9)

		for j in 4:
			var spire := MeshInstance3D.new()
			var cm := CylinderMesh.new()
			cm.top_radius = 0.02
			cm.bottom_radius = rng.randf_range(0.18, 0.32)
			cm.height = rng.randf_range(1.6, 2.8)
			spire.mesh = cm
			spire.material_override = c_mat
			spire.position = Vector3(rng.randf_range(-0.45, 0.45), cm.height * 0.45, rng.randf_range(-0.45, 0.45))
			spire.rotation_degrees = Vector3(rng.randf_range(-20, 20), rng.randf_range(0, 360), rng.randf_range(-20, 20))
			crystal_cluster.add_child(spire)

		var light := OmniLight3D.new()
		light.position.y = 1.8
		light.light_color = crystal_color
		light.light_energy = 2.2
		light.omni_range = 5.0
		root.add_child(light)

		_world_nodes.append({
			"id": "crystal_%d" % i,
			"type": "crystal",
			"name": "Luminescent Crystal Geode",
			"action_verb": "Mine",
			"skill": "mining",
			"req_level": 1,
			"xp": 35,
			"root": root,
			"display_mesh": crystal_cluster,
			"light": light,
			"normal_mat": c_mat,
			"depleted_mat": dep_mat,
			"position": root.position,
			"respawn_timer": 0.0,
			"is_depleted": false
		})

	# 2. SUB-SURFACE HELIUM-3 VENTS (Engineering)
	for i in 6:
		var ang := rng.randf_range(0.0, TAU)
		var dist := rng.randf_range(22.0, 62.0)
		var nx := cos(ang) * dist
		var nz := sin(ang) * dist
		var ny: float = _heightmap.sample_height(nx, nz) if _heightmap else 0.0

		var root := Node3D.new()
		root.position = Vector3(nx, ny, nz)
		add_child(root)

		# Vent chimney collar
		var collar := MeshInstance3D.new()
		var cm := CylinderMesh.new()
		cm.top_radius = 1.2
		cm.bottom_radius = 1.8
		cm.height = 1.2
		collar.mesh = cm
		collar.material_override = AssetCache.get_material("vent_collar", Color(0.28, 0.32, 0.38), 0.75, 0.3)
		collar.position.y = 0.6
		root.add_child(collar)

		# Glowing geothermal plasma core
		var core := MeshInstance3D.new()
		var sm := SphereMesh.new()
		sm.radius = 0.75
		sm.height = 1.5
		core.mesh = sm
		var core_mat: StandardMaterial3D = AssetCache.get_material("core_plasma", Color(0.1, 0.9, 1.0), 0.1, 0.1, Color(0.1, 0.9, 1.0), 4.5)
		core.material_override = core_mat
		core.position.y = 0.9
		root.add_child(core)

		var light := OmniLight3D.new()
		light.position.y = 1.5
		light.light_color = Color(0.1, 0.9, 1.0)
		light.light_energy = 3.5
		light.omni_range = 6.0
		root.add_child(light)

		_world_nodes.append({
			"id": "vent_%d" % i,
			"type": "vent",
			"name": "Helium-3 Geothermal Fissure",
			"action_verb": "Siphon",
			"skill": "engineering",
			"req_level": 1,
			"xp": 45,
			"root": root,
			"display_mesh": core,
			"light": light,
			"normal_mat": core_mat,
			"depleted_mat": AssetCache.get_material("vent_depleted", Color(0.2, 0.25, 0.3), 0.5, 0.5),
			"position": root.position,
			"respawn_timer": 0.0,
			"is_depleted": false
		})

	# 3. BIOLUMINESCENT XENOFLORA (Foraging)
	for i in 8:
		var ang := rng.randf_range(0.0, TAU)
		var dist := rng.randf_range(20.0, 65.0)
		var nx := cos(ang) * dist
		var nz := sin(ang) * dist
		var ny: float = _heightmap.sample_height(nx, nz) if _heightmap else 0.0

		var root := Node3D.new()
		root.position = Vector3(nx, ny, nz)
		add_child(root)

		# Fungal stem
		var stem := MeshInstance3D.new()
		var sm := CylinderMesh.new()
		sm.top_radius = 0.25
		sm.bottom_radius = 0.5
		sm.height = 2.4
		stem.mesh = sm
		stem.material_override = AssetCache.get_material("flora_stem", Color(0.18, 0.35, 0.25), 0.2, 0.8)
		stem.position.y = 1.2
		root.add_child(stem)

		# Spore cap
		var cap := MeshInstance3D.new()
		var cpm := SphereMesh.new()
		cpm.radius = 1.2
		cpm.height = 0.9
		cap.mesh = cpm
		var cap_mat: StandardMaterial3D = AssetCache.get_material("flora_cap_%d" % i, Color(0.2, 1.0, 0.6), 0.2, 0.3, Color(0.2, 1.0, 0.5), 3.0)
		cap.material_override = cap_mat
		cap.position.y = 2.4
		root.add_child(cap)

		var light := OmniLight3D.new()
		light.position.y = 2.8
		light.light_color = Color(0.2, 1.0, 0.6)
		light.light_energy = 2.0
		light.omni_range = 4.5
		root.add_child(light)

		_world_nodes.append({
			"id": "flora_%d" % i,
			"type": "flora",
			"name": "Bioluminescent Xenoflora Spore-Cap",
			"action_verb": "Harvest",
			"skill": "foraging",
			"req_level": 1,
			"xp": 28,
			"root": root,
			"display_mesh": cap,
			"light": light,
			"normal_mat": cap_mat,
			"depleted_mat": AssetCache.get_material("flora_depleted", Color(0.2, 0.3, 0.2), 0.1, 0.9),
			"position": root.position,
			"respawn_timer": 0.0,
			"is_depleted": false
		})

	# 4. DERELICT DOMINION CARGO CRATES (Scavenging)
	for i in 6:
		var ang := rng.randf_range(0.0, TAU)
		var dist := rng.randf_range(25.0, 68.0)
		var nx := cos(ang) * dist
		var nz := sin(ang) * dist
		var ny: float = _heightmap.sample_height(nx, nz) if _heightmap else 0.0

		var root := Node3D.new()
		root.position = Vector3(nx, ny, nz)
		add_child(root)

		var pod := MeshInstance3D.new()
		var pm := BoxMesh.new()
		pm.size = Vector3(1.8, 1.1, 2.2)
		pod.mesh = pm
		var pod_mat: StandardMaterial3D = AssetCache.get_material("crate_mat", Color(0.8, 0.45, 0.1), 0.85, 0.25, Color(1.0, 0.5, 0.0), 0.8)
		pod.material_override = pod_mat
		pod.position.y = 0.55
		pod.rotation_degrees = Vector3(rng.randf_range(-12, 12), rng.randf_range(0, 360), rng.randf_range(-12, 12))
		root.add_child(pod)

		var light := OmniLight3D.new()
		light.position.y = 1.2
		light.light_color = Color(1.0, 0.6, 0.1)
		light.light_energy = 2.0
		light.omni_range = 4.0
		root.add_child(light)

		_world_nodes.append({
			"id": "crate_%d" % i,
			"type": "crate",
			"name": "Derelict Dominion Supply Pod",
			"action_verb": "Decrypt",
			"skill": "scavenging",
			"req_level": 1,
			"xp": 55,
			"root": root,
			"display_mesh": pod,
			"light": light,
			"normal_mat": pod_mat,
			"depleted_mat": AssetCache.get_material("crate_depleted", Color(0.2, 0.2, 0.2), 0.8, 0.5),
			"position": root.position,
			"respawn_timer": 0.0,
			"is_depleted": false
		})

	# 5. ALIEN CREATURES / WILDLIFE (Combat)
	for i in 6:
		var ang := rng.randf_range(0.0, TAU)
		var dist := rng.randf_range(28.0, 65.0)
		var nx := cos(ang) * dist
		var nz := sin(ang) * dist
		var ny: float = _heightmap.sample_height(nx, nz) if _heightmap else 0.0

		var root := Node3D.new()
		root.position = Vector3(nx, ny + 0.6, nz)
		add_child(root)

		var c_body := MeshInstance3D.new()
		var bm := SphereMesh.new()
		bm.radius = 0.65
		bm.height = 1.1
		c_body.mesh = bm
		var creature_mat: StandardMaterial3D = AssetCache.get_material("creature_%d" % i, Color(0.9, 0.2, 0.25), 0.3, 0.5, Color(1.0, 0.2, 0.2), 1.5)
		c_body.material_override = creature_mat
		c_body.position.y = 0.4
		root.add_child(c_body)

		# Floating name & health indicator
		var label := Label3D.new()
		label.text = "Xeno-Crawler [Lvl 3]\nHP: 80/80"
		label.position.y = 1.6
		label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		label.font_size = 20
		label.modulate = Color(1.0, 0.35, 0.35)
		label.no_depth_test = true
		root.add_child(label)

		_world_nodes.append({
			"id": "creature_%d" % i,
			"type": "creature",
			"name": "Xeno-Crawler [Lvl 3]",
			"action_verb": "Attack",
			"skill": "combat",
			"req_level": 1,
			"xp": 65,
			"root": root,
			"display_mesh": c_body,
			"label3d": label,
			"hp": 80.0,
			"max_hp": 80.0,
			"wander_phase": float(i) * 1.7,
			"position": root.position,
			"respawn_timer": 0.0,
			"is_depleted": false
		})

	# 6. CENTRAL STARBASE UPLINK TERMINAL (Base Operations / Return to Orbit)
	var term_root := Node3D.new()
	var pad_y: float = _heightmap.sample_height(0.0, 0.0) if _heightmap else 0.0
	term_root.position = Vector3(5.0, pad_y + 0.4, 3.0)
	add_child(term_root)

	var term_mesh := MeshInstance3D.new()
	var tm := BoxMesh.new()
	tm.size = Vector3(1.2, 1.8, 0.8)
	term_mesh.mesh = tm
	var term_mat: StandardMaterial3D = AssetCache.get_material("term_mat", Color(0.2, 0.4, 0.7), 0.85, 0.2, Color(0.1, 0.8, 1.0), 2.5)
	term_mesh.material_override = term_mat
	term_mesh.position.y = 0.9
	term_root.add_child(term_mesh)

	var t_light := OmniLight3D.new()
	t_light.position.y = 1.8
	t_light.light_color = Color(0.2, 0.85, 1.0)
	t_light.light_energy = 3.0
	t_light.omni_range = 5.0
	term_root.add_child(t_light)

	_world_nodes.append({
		"id": "terminal_base",
		"type": "terminal",
		"name": "Starbase Telemetry Terminal",
		"action_verb": "Access",
		"skill": "none",
		"req_level": 1,
		"xp": 0,
		"root": term_root,
		"display_mesh": term_mesh,
		"light": t_light,
		"position": term_root.position,
		"respawn_timer": 0.0,
		"is_depleted": false
	})

func _spawn_player() -> void:
	_player = Node3D.new()
	var pad_y: float = _heightmap.sample_height(0.0, 0.0) if _heightmap else 0.0
	_player.position = Vector3(0.0, pad_y + 1.1, 0.0)
	add_child(_player)

	_player_mesh_root = Node3D.new()
	_player.add_child(_player_mesh_root)

	# Spacesuit Body
	_player_body = MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(0.55, 0.95, 0.35)
	_player_body.mesh = bm
	_player_body.material_override = AssetCache.get_material("suit_chassis", Color(0.18, 0.55, 0.85), 0.6, 0.4)
	_player_body.position.y = 0.95
	_player_mesh_root.add_child(_player_body)

	# Helmet with Glowing Visor
	_player_head = MeshInstance3D.new()
	var hm := SphereMesh.new()
	hm.radius = 0.26
	hm.height = 0.52
	_player_head.mesh = hm
	_player_head.material_override = AssetCache.get_material("visor_glow", Color(0.2, 0.8, 1.0), 0.2, 0.1, Color(0.2, 0.8, 1.0), 2.5)
	_player_head.position = Vector3(0.0, 1.62, -0.05)
	_player_mesh_root.add_child(_player_head)

	# Legs
	_player_leg_l = MeshInstance3D.new()
	var lm := BoxMesh.new()
	lm.size = Vector3(0.2, 0.65, 0.22)
	_player_leg_l.mesh = lm
	_player_leg_l.material_override = AssetCache.get_material("suit_armor", Color(0.12, 0.28, 0.45), 0.7, 0.3)
	_player_leg_l.position = Vector3(-0.16, 0.35, 0.0)
	_player_mesh_root.add_child(_player_leg_l)

	_player_leg_r = MeshInstance3D.new()
	_player_leg_r.mesh = lm
	_player_leg_r.material_override = AssetCache.get_material("suit_armor", Color(0.12, 0.28, 0.45), 0.7, 0.3)
	_player_leg_r.position = Vector3(0.16, 0.35, 0.0)
	_player_mesh_root.add_child(_player_leg_r)

	# Arms
	_player_arm_l = MeshInstance3D.new()
	var am := BoxMesh.new()
	am.size = Vector3(0.16, 0.6, 0.18)
	_player_arm_l.mesh = am
	_player_arm_l.material_override = AssetCache.get_material("suit_armor", Color(0.12, 0.28, 0.45), 0.7, 0.3)
	_player_arm_l.position = Vector3(-0.38, 0.95, 0.0)
	_player_mesh_root.add_child(_player_arm_l)

	_player_arm_r = MeshInstance3D.new()
	_player_arm_r.mesh = am
	_player_arm_r.material_override = AssetCache.get_material("suit_armor", Color(0.12, 0.28, 0.45), 0.7, 0.3)
	_player_arm_r.position = Vector3(0.38, 0.95, 0.0)
	_player_mesh_root.add_child(_player_arm_r)

	# Personal Multi-Tool Laser Pickaxe (held in right hand)
	_tool_mesh = MeshInstance3D.new()
	var tm := BoxMesh.new()
	tm.size = Vector3(0.1, 0.12, 0.6)
	_tool_mesh.mesh = tm
	_tool_mesh.material_override = AssetCache.get_material("tool_chrome", Color(0.85, 0.9, 1.0), 0.9, 0.2, Color(0.3, 0.8, 1.0), 1.8)
	_tool_mesh.position = Vector3(0.42, 0.7, -0.35)
	_player_mesh_root.add_child(_tool_mesh)

func _setup_ui() -> void:
	_hud = CanvasLayer.new()
	add_child(_hud)

	# TOP STATUS BAR
	var top := PanelContainer.new()
	var sty := StyleBoxFlat.new()
	sty.bg_color = Color(0.03, 0.05, 0.11, 0.9)
	sty.border_color = Color(0.18, 0.5, 0.85, 0.7)
	sty.set_border_width_all(1)
	sty.set_corner_radius_all(6)
	sty.set_content_margin_all(10)
	top.add_theme_stylebox_override("panel", sty)
	top.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	top.offset_left = 12
	top.offset_right = -12
	top.offset_top = 8
	top.offset_bottom = 54
	_hud.add_child(top)

	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 14)
	top.add_child(hb)

	var title := Label.new()
	title.text = "🪐 SPACE-SCAPE: EXPEDITION"
	title.add_theme_font_size_override("font_size", 17)
	title.add_theme_color_override("font_color", Color(0.3, 1.0, 0.7))
	hb.add_child(title)

	_colony_info_label = Label.new()
	_colony_info_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_colony_info_label.add_theme_font_size_override("font_size", 14)
	_colony_info_label.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0))
	hb.add_child(_colony_info_label)

	_res_label = Label.new()
	_res_label.add_theme_font_size_override("font_size", 14)
	_res_label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
	hb.add_child(_res_label)

	_pov_indicator = Label.new()
	_pov_indicator.text = "[V] 1st-Person POV"
	_pov_indicator.add_theme_font_size_override("font_size", 13)
	_pov_indicator.add_theme_color_override("font_color", Color(0.4, 0.9, 1.0))
	hb.add_child(_pov_indicator)

	var pov_btn := Button.new()
	pov_btn.text = "📷 Toggle POV (V)"
	pov_btn.pressed.connect(_toggle_pov)
	hb.add_child(pov_btn)

	var drawer_btn := Button.new()
	drawer_btn.text = "🎒 Skills & Pack (Tab)"
	drawer_btn.pressed.connect(func(): _toggle_drawer())
	hb.add_child(drawer_btn)

	var orbit_btn := Button.new()
	orbit_btn.text = "🚀 Return to Orbit"
	orbit_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/fleet_manager.tscn"))
	hb.add_child(orbit_btn)

	# CENTRAL CROSSHAIR & RUNESCAPE CONTEXT RETICLE
	var crosshair_box := Control.new()
	crosshair_box.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	_hud.add_child(crosshair_box)

	_reticle_label = Label.new()
	_reticle_label.text = "· [ + ] ·"
	_reticle_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	_reticle_label.offset_left = -30
	_reticle_label.offset_right = 30
	_reticle_label.offset_top = -15
	_reticle_label.offset_bottom = 15
	_reticle_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_reticle_label.add_theme_font_size_override("font_size", 18)
	_reticle_label.add_theme_color_override("font_color", Color(0.2, 0.9, 1.0, 0.75))
	crosshair_box.add_child(_reticle_label)

	_context_prompt = Label.new()
	_context_prompt.text = ""
	_context_prompt.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	_context_prompt.offset_left = -260
	_context_prompt.offset_right = 260
	_context_prompt.offset_top = 22
	_context_prompt.offset_bottom = 50
	_context_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_context_prompt.add_theme_font_size_override("font_size", 15)
	_context_prompt.add_theme_color_override("font_color", Color(1.0, 0.9, 0.2))
	crosshair_box.add_child(_context_prompt)

	# INTERACTION PROGRESS BAR
	_action_bar_setup(crosshair_box)

	# FLOATING XP DROPS BOX (Above crosshair)
	_xp_drops_box = VBoxContainer.new()
	_xp_drops_box.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	_xp_drops_box.offset_left = -150
	_xp_drops_box.offset_right = 150
	_xp_drops_box.offset_top = -140
	_xp_drops_box.offset_bottom = -30
	_xp_drops_box.alignment = BoxContainer.ALIGNMENT_END
	_hud.add_child(_xp_drops_box)

	# LEVEL-UP ANNOUNCEMENT BANNER
	_level_up_banner = Label.new()
	_level_up_banner.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	_level_up_banner.position.y = 70.0
	_level_up_banner.offset_left = -350
	_level_up_banner.offset_right = 350
	_level_up_banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_level_up_banner.add_theme_font_size_override("font_size", 24)
	_level_up_banner.add_theme_color_override("font_color", Color(1.0, 0.85, 0.1))
	_level_up_banner.modulate.a = 0.0
	_hud.add_child(_level_up_banner)

	# RUNESCAPE-STYLE RADAR MINIMAP (Top Right)
	_setup_radar_minimap()

	# RUNESCAPE-STYLE ACTION/CHAT LOG (Bottom Left)
	_setup_chatbox()

	# SKILLS & BACKPACK SIDEBAR DRAWER (Right Side)
	_setup_side_drawer()

	# Quick Controls Help Legend at very bottom
	var help := Label.new()
	help.text = "[WASD] Walk  •  [Shift] Sprint  •  [Space] Jump  •  [Mouse] Look  •  [E / L-Click] Interact Node  •  [V] 1st/3rd POV  •  [Tab] Skills/Pack"
	help.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	help.position.y = -26
	help.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	help.add_theme_font_size_override("font_size", 12)
	help.add_theme_color_override("font_color", Color(0.65, 0.75, 0.85, 0.85))
	_hud.add_child(help)

func _action_bar_setup(parent: Control) -> void:
	_action_progress_bar = ProgressBar.new()
	_action_progress_bar.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	_action_progress_bar.offset_left = -110
	_action_progress_bar.offset_right = 110
	_action_progress_bar.offset_top = 54
	_action_progress_bar.offset_bottom = 68
	_action_progress_bar.max_value = 1.0
	_action_progress_bar.show_percentage = false
	_action_progress_bar.visible = false

	var fill_sb := StyleBoxFlat.new()
	fill_sb.bg_color = Color(0.2, 0.85, 1.0)
	fill_sb.set_corner_radius_all(3)
	_action_progress_bar.add_theme_stylebox_override("fill", fill_sb)

	var bg_sb := StyleBoxFlat.new()
	bg_sb.bg_color = Color(0.05, 0.08, 0.15, 0.85)
	bg_sb.border_color = Color(0.2, 0.45, 0.75, 0.6)
	bg_sb.set_border_width_all(1)
	bg_sb.set_corner_radius_all(3)
	_action_progress_bar.add_theme_stylebox_override("background", bg_sb)
	parent.add_child(_action_progress_bar)

	_action_desc_label = Label.new()
	_action_desc_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	_action_desc_label.offset_left = -150
	_action_desc_label.offset_right = 150
	_action_desc_label.offset_top = 70
	_action_desc_label.offset_bottom = 90
	_action_desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_action_desc_label.add_theme_font_size_override("font_size", 12)
	_action_desc_label.add_theme_color_override("font_color", Color(0.8, 0.9, 1.0))
	_action_desc_label.visible = false
	parent.add_child(_action_desc_label)

func _setup_radar_minimap() -> void:
	var m_panel := PanelContainer.new()
	var m_sty := StyleBoxFlat.new()
	m_sty.bg_color = Color(0.04, 0.06, 0.12, 0.88)
	m_sty.border_color = Color(0.3, 0.7, 1.0, 0.8)
	m_sty.set_border_width_all(2)
	m_sty.set_corner_radius_all(65)
	m_panel.add_theme_stylebox_override("panel", m_sty)
	m_panel.position = Vector2(get_viewport().size.x - 145, 68) if get_viewport() else Vector2(1000, 68)
	m_panel.custom_minimum_size = Vector2(130, 130)
	_hud.add_child(m_panel)

	_minimap_draw = Control.new()
	_minimap_draw.custom_minimum_size = Vector2(130, 130)
	_minimap_draw.draw.connect(_on_draw_minimap)
	m_panel.add_child(_minimap_draw)

func _on_draw_minimap() -> void:
	if _minimap_draw == null:
		return
	var center := Vector2(65, 65)
	var radius := 58.0

	# Radar sweep / compass ring
	_minimap_draw.draw_circle(center, radius, Color(0.03, 0.07, 0.14, 0.85))
	_minimap_draw.draw_arc(center, radius, 0, TAU, 32, Color(0.2, 0.6, 0.9, 0.8), 1.5)
	_minimap_draw.draw_arc(center, radius * 0.5, 0, TAU, 24, Color(0.15, 0.35, 0.55, 0.5), 1.0)

	# Compass Markings
	_minimap_draw.draw_string(ThemeDB.fallback_font, center + Vector2(-4, -radius + 12), "N", HORIZONTAL_ALIGNMENT_CENTER, -1, 10, Color(0.9, 0.3, 0.3))
	_minimap_draw.draw_string(ThemeDB.fallback_font, center + Vector2(radius - 12, 4), "E", HORIZONTAL_ALIGNMENT_CENTER, -1, 9, Color(0.6, 0.7, 0.8))

	if not is_instance_valid(_player):
		return

	var p_pos := _player.global_position
	var range_m := 65.0
	var scale_factor := radius / range_m

	# Draw interactive world node blips
	for node in _world_nodes:
		if node.get("is_depleted", false):
			continue
		var n_pos: Vector3 = node.get("position", Vector3.ZERO)
		var diff := n_pos - p_pos
		var map_offset := Vector2(diff.x, diff.z) * scale_factor

		if map_offset.length() <= radius - 4.0:
			var blip_col := Color.YELLOW
			match node.get("type", ""):
				"crystal": blip_col = Color(0.2, 0.9, 1.0)
				"vent": blip_col = Color(0.1, 0.7, 1.0)
				"flora": blip_col = Color(0.2, 1.0, 0.5)
				"crate": blip_col = Color(1.0, 0.6, 0.1)
				"creature": blip_col = Color(1.0, 0.25, 0.25)
				"terminal": blip_col = Color(1.0, 0.85, 0.2)
			_minimap_draw.draw_circle(center + map_offset, 2.5, blip_col)

	# Player center marker with heading pointer
	_minimap_draw.draw_circle(center, 3.2, Color.WHITE)
	var pointer_dir := Vector2(-sin(_player_yaw), -cos(_player_yaw)) * 8.0
	_minimap_draw.draw_line(center, center + pointer_dir, Color(0.3, 1.0, 0.8), 2.0)

func _setup_chatbox() -> void:
	var chat_panel := PanelContainer.new()
	var sty := StyleBoxFlat.new()
	sty.bg_color = Color(0.02, 0.04, 0.08, 0.82)
	sty.border_color = Color(0.2, 0.45, 0.75, 0.6)
	sty.set_border_width_all(1)
	sty.set_corner_radius_all(6)
	sty.set_content_margin_all(8)
	chat_panel.add_theme_stylebox_override("panel", sty)
	chat_panel.position = Vector2(16, get_viewport().size.y - 175) if get_viewport() else Vector2(16, 500)
	chat_panel.custom_minimum_size = Vector2(360, 140)
	_hud.add_child(chat_panel)

	_chat_scroll = ScrollContainer.new()
	_chat_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	chat_panel.add_child(_chat_scroll)

	_chat_log_vbox = VBoxContainer.new()
	_chat_log_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_chat_log_vbox.add_theme_constant_override("separation", 3)
	_chat_scroll.add_child(_chat_log_vbox)

	_add_chat_message("Welcome to Space-Scape - Planetary Expedition.", Color(0.3, 0.85, 1.0))
	_add_chat_message("Target crystal nodes, thermal vents, and bio-flora to harvest.", Color(0.7, 0.85, 0.9))
	_add_chat_message("[V] Toggle POV  •  [Tab] Skills & Backpack  •  [E / L-Click] Interact.", Color(1.0, 0.85, 0.3))

func _add_chat_message(msg: String, col: Color = Color.WHITE) -> void:
	if _chat_log_vbox == null:
		return
	var lbl := Label.new()
	lbl.text = msg
	lbl.add_theme_font_size_override("font_size", 12)
	lbl.add_theme_color_override("font_color", col)
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	_chat_log_vbox.add_child(lbl)

	# Keep chat buffer clean (last 25 lines)
	if _chat_log_vbox.get_child_count() > 25:
		_chat_log_vbox.get_child(0).queue_free()

	await get_tree().process_frame
	if is_instance_valid(_chat_scroll):
		_chat_scroll.scroll_vertical = 99999

func _setup_side_drawer() -> void:
	_side_drawer = PanelContainer.new()
	var sty := StyleBoxFlat.new()
	sty.bg_color = Color(0.03, 0.05, 0.11, 0.92)
	sty.border_color = Color(0.2, 0.5, 0.85, 0.75)
	sty.set_border_width_all(1)
	sty.set_corner_radius_all(6)
	sty.set_content_margin_all(10)
	_side_drawer.add_theme_stylebox_override("panel", sty)
	_side_drawer.position = Vector2(get_viewport().size.x - 300, 210) if get_viewport() else Vector2(850, 210)
	_side_drawer.custom_minimum_size = Vector2(285, 310)
	_hud.add_child(_side_drawer)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 8)
	_side_drawer.add_child(vb)

	# Tab Header Row
	var tab_row := HBoxContainer.new()
	tab_row.add_theme_constant_override("separation", 6)
	vb.add_child(tab_row)

	var pack_tab_btn := Button.new()
	pack_tab_btn.text = "🎒 Backpack"
	pack_tab_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pack_tab_btn.pressed.connect(func(): _switch_drawer_tab("inventory"))
	tab_row.add_child(pack_tab_btn)

	var skills_tab_btn := Button.new()
	skills_tab_btn.text = "📊 Skills"
	skills_tab_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	skills_tab_btn.pressed.connect(func(): _switch_drawer_tab("skills"))
	tab_row.add_child(skills_tab_btn)

	_drawer_content_box = VBoxContainer.new()
	_drawer_content_box.add_theme_constant_override("separation", 6)
	vb.add_child(_drawer_content_box)

	_update_drawer_content()

func _switch_drawer_tab(tab_name: String) -> void:
	_side_drawer_tab = tab_name
	_update_drawer_content()
	_play_sfx("click")

func _toggle_drawer() -> void:
	if _side_drawer:
		_side_drawer.visible = not _side_drawer.visible
		_play_sfx("click")
		if _side_drawer.visible:
			_update_drawer_content()

func _update_drawer_content() -> void:
	if _drawer_content_box == null:
		return
	for c in _drawer_content_box.get_children():
		c.queue_free()

	if _side_drawer_tab == "inventory":
		var hdr := Label.new()
		hdr.text = "— EXPEDITION CARGO POD —"
		hdr.add_theme_font_size_override("font_size", 13)
		hdr.add_theme_color_override("font_color", Color(0.4, 0.85, 1.0))
		_drawer_content_box.add_child(hdr)

		var items = [
			{"name": "Luminescent Crystals", "key": "crystal_ore", "icon": "💎", "col": Color(0.2, 0.9, 1.0)},
			{"name": "Helium-3 Fuel Cells", "key": "he3_fuel", "icon": "⚡", "col": Color(0.2, 0.8, 1.0)},
			{"name": "Bio-Active Spores", "key": "bio_spores", "icon": "🍄", "col": Color(0.3, 1.0, 0.5)},
			{"name": "Scrap Military Alloys", "key": "scrap_metal", "icon": "🔩", "col": Color(0.9, 0.75, 0.3)},
			{"name": "Xeno-Chitin Plating", "key": "chitin_plate", "icon": "🛡", "col": Color(1.0, 0.4, 0.4)}
		]

		for item in items:
			var row := HBoxContainer.new()
			var name_lbl := Label.new()
			name_lbl.text = "%s %s" % [item["icon"], item["name"]]
			name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			name_lbl.add_theme_font_size_override("font_size", 12)
			name_lbl.add_theme_color_override("font_color", item["col"])
			row.add_child(name_lbl)

			var count_lbl := Label.new()
			count_lbl.text = str(_inventory.get(item["key"], 0))
			count_lbl.add_theme_font_size_override("font_size", 13)
			count_lbl.add_theme_color_override("font_color", Color.WHITE)
			row.add_child(count_lbl)
			_drawer_content_box.add_child(row)

		var sep := HSeparator.new()
		_drawer_content_box.add_child(sep)

		var cr_lbl := Label.new()
		cr_lbl.text = "💰 Credits: %d CR" % GameData.credits
		cr_lbl.add_theme_font_size_override("font_size", 13)
		cr_lbl.add_theme_color_override("font_color", Color(1.0, 0.85, 0.2))
		_drawer_content_box.add_child(cr_lbl)
	else:
		var hdr := Label.new()
		hdr.text = "— RUNESCAPE-STYLE SKILL RANKS —"
		hdr.add_theme_font_size_override("font_size", 13)
		hdr.add_theme_color_override("font_color", Color(0.3, 1.0, 0.7))
		_drawer_content_box.add_child(hdr)

		for s_key in _skills.keys():
			var s_data: Dictionary = _skills[s_key]
			var lvl: int = s_data["lvl"]
			var cur_xp: int = s_data["xp"]
			var next_xp: int = _calc_xp_for_level(lvl + 1)
			var base_xp: int = _calc_xp_for_level(lvl)

			var row := VBoxContainer.new()
			row.add_theme_constant_override("separation", 2)

			var top_row := HBoxContainer.new()
			var name_l := Label.new()
			name_l.text = "%s %s" % [s_data["icon"], s_data["name"]]
			name_l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			name_l.add_theme_font_size_override("font_size", 12)
			name_l.add_theme_color_override("font_color", Color(0.85, 0.9, 0.95))
			top_row.add_child(name_l)

			var lvl_l := Label.new()
			lvl_l.text = "Lvl %d (%d/%d XP)" % [lvl, cur_xp, next_xp]
			lvl_l.add_theme_font_size_override("font_size", 11)
			lvl_l.add_theme_color_override("font_color", Color(0.3, 0.9, 1.0))
			top_row.add_child(lvl_l)
			row.add_child(top_row)

			var bar := ProgressBar.new()
			bar.custom_minimum_size = Vector2(0, 6)
			bar.min_value = float(base_xp)
			bar.max_value = float(next_xp)
			bar.value = float(cur_xp)
			bar.show_percentage = false
			var b_sty := StyleBoxFlat.new()
			b_sty.bg_color = Color(0.2, 0.8, 0.5)
			b_sty.set_corner_radius_all(2)
			bar.add_theme_stylebox_override("fill", b_sty)
			row.add_child(bar)

			_drawer_content_box.add_child(row)

func _refresh_ui() -> void:
	var gd = GameData
	var col = gd.colonies[gd.current_colony_id]
	_colony_info_label.text = "%s (%s)" % [col["name"], col["type"]]
	_res_label.text = "CR: %d | Metal: %d | Crystal: %d | He-3: %d" % [
		gd.credits, gd.metal, gd.crystal, gd.helium3
	]

func _enter_exploration_mode() -> void:
	_explore_mode = true
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	_update_pov_visibility()

func _toggle_explore_mode() -> void:
	_explore_mode = not _explore_mode
	if _explore_mode:
		Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
	else:
		Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	_update_pov_visibility()

func _toggle_pov() -> void:
	_first_person = not _first_person
	_play_sfx("click")
	if is_instance_valid(_pov_indicator):
		_pov_indicator.text = "[V] 1st-Person POV" if _first_person else "[V] 3rd-Person Chase"
	_update_pov_visibility()

func _update_pov_visibility() -> void:
	if not is_instance_valid(_player_mesh_root):
		return
	if _first_person and _explore_mode:
		# In true first-person POV, hide player torso/head to give unobstructed sightlines
		if is_instance_valid(_player_head): _player_head.visible = false
		if is_instance_valid(_player_body): _player_body.visible = false
		if is_instance_valid(_player_arm_l): _player_arm_l.visible = false
		if is_instance_valid(_player_arm_r): _player_arm_r.visible = true
		if is_instance_valid(_tool_mesh): _tool_mesh.visible = true
	else:
		if is_instance_valid(_player_head): _player_head.visible = true
		if is_instance_valid(_player_body): _player_body.visible = true
		if is_instance_valid(_player_arm_l): _player_arm_l.visible = true
		if is_instance_valid(_player_arm_r): _player_arm_r.visible = true
		if is_instance_valid(_tool_mesh): _tool_mesh.visible = true

func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and _explore_mode and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		_player_yaw -= event.relative.x * 0.0028
		_player_pitch = clampf(_player_pitch - event.relative.y * 0.0028, -1.35, 1.35)
		if is_instance_valid(_player):
			_player.rotation.y = _player_yaw

	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_V:
			_toggle_pov()
		elif event.keycode == KEY_TAB:
			_toggle_drawer()
		elif event.keycode == KEY_T:
			_toggle_explore_mode()
		elif event.keycode == KEY_ESCAPE:
			if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
				Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
			else:
				Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
		elif event.keycode == KEY_E:
			_trigger_node_interaction()

	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if Input.get_mouse_mode() != Input.MOUSE_MODE_CAPTURED:
				Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
			else:
				_trigger_node_interaction()
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
			if not _first_person:
				_toggle_pov()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			if _first_person:
				_toggle_pov()

func _process(delta: float) -> void:
	_time += delta

	# Animated sub-surface reciprocating drill
	if is_instance_valid(_drill_shaft):
		_drill_shaft.position.y = 5.5 + sin(_time * 6.0) * 0.8

	# Animated rotating telemetry dish
	if is_instance_valid(_radar_dish):
		_radar_dish.rotation_degrees.y += delta * 24.0

	# Slow scanning planetary defense turret
	if is_instance_valid(_turret_gun):
		_turret_gun.rotation_degrees.y = sin(_time * 0.8) * 40.0

	# Process Active World Node Respawns & Creature AI
	_process_world_nodes(delta)

	# Process In-Person Player Movement and Camera
	if _explore_mode and is_instance_valid(_player):
		_process_player_exploration(delta)
	else:
		_cam_angle += delta * 0.08
		_update_cam_pos()

	# Process Ongoing Interaction / Channeling
	_process_action_channel(delta)

	# Redraw live radar minimap
	if is_instance_valid(_minimap_draw):
		_minimap_draw.queue_redraw()

func _process_player_exploration(delta: float) -> void:
	var move_input := Vector3.ZERO
	if Input.is_key_pressed(KEY_W): move_input -= _player.basis.z
	if Input.is_key_pressed(KEY_S): move_input += _player.basis.z
	if Input.is_key_pressed(KEY_A): move_input -= _player.basis.x
	if Input.is_key_pressed(KEY_D): move_input += _player.basis.x
	move_input.y = 0.0

	var is_sprinting: bool = Input.is_key_pressed(KEY_SHIFT)
	var speed: float = 14.0 if is_sprinting else 8.5

	if move_input.length() > 0.01:
		move_input = move_input.normalized()
		_player.global_position += move_input * speed * delta
		_walk_anim_time += delta * (14.0 if is_sprinting else 9.0)

		# Walking leg swing animation
		if is_instance_valid(_player_leg_l):
			_player_leg_l.rotation.x = sin(_walk_anim_time) * 0.55
		if is_instance_valid(_player_leg_r):
			_player_leg_r.rotation.x = -sin(_walk_anim_time) * 0.55
		if is_instance_valid(_player_arm_l):
			_player_arm_l.rotation.x = -sin(_walk_anim_time) * 0.45
	else:
		if is_instance_valid(_player_leg_l): _player_leg_l.rotation.x = lerpf(_player_leg_l.rotation.x, 0.0, delta * 8.0)
		if is_instance_valid(_player_leg_r): _player_leg_r.rotation.x = lerpf(_player_leg_r.rotation.x, 0.0, delta * 8.0)
		if is_instance_valid(_player_arm_l): _player_arm_l.rotation.x = lerpf(_player_arm_l.rotation.x, 0.0, delta * 8.0)

	# Gravity & Jump
	if Input.is_key_pressed(KEY_SPACE) and _is_grounded:
		_vertical_velocity = 8.5
		_is_grounded = false
		_play_sfx("click")

	_vertical_velocity -= 22.0 * delta
	_player.global_position.y += _vertical_velocity * delta

	# Clamp to procedural terrain surface
	var ground_y: float = _heightmap.sample_height(_player.global_position.x, _player.global_position.z) if _heightmap else 0.0
	if _player.global_position.y <= ground_y + 1.1:
		_player.global_position.y = ground_y + 1.1
		_vertical_velocity = maxf(0.0, _vertical_velocity)
		_is_grounded = true

	# Camera Positioning based on POV
	if _first_person:
		# First-person eye level
		var eye_pos := _player.global_position + Vector3(0.0, 1.55, 0.0)
		_camera.global_position = eye_pos
		_camera.rotation = Vector3(_player_pitch, _player_yaw, 0.0)
	else:
		# Third-person over-the-shoulder chase view
		var pitch_basis := Basis(Vector3.RIGHT, _player_pitch)
		var yaw_basis := Basis(Vector3.UP, _player_yaw)
		var combined_basis := yaw_basis * pitch_basis
		var cam_offset := combined_basis * Vector3(0.0, 1.6, 4.8)
		var target_pos := _player.global_position + cam_offset
		_camera.global_position = _camera.global_position.lerp(target_pos, delta * 12.0)
		_camera.look_at(_player.global_position + Vector3(0.0, 1.3, 0.0), Vector3.UP)

	# Scan for Interactive Nodes in Sightline / Proximity
	_scan_target_node()

func _scan_target_node() -> void:
	var best_node: Dictionary = {}
	var best_score: float = -999.0
	var cam_fwd := -_camera.global_basis.z
	var cam_pos := _camera.global_position

	for node in _world_nodes:
		if node.get("is_depleted", false):
			continue
		var n_pos: Vector3 = node.get("position", Vector3.ZERO)
		var to_node := n_pos - cam_pos
		var dist := to_node.length()

		if dist > 18.0:
			continue

		var dir := to_node.normalized()
		var dot := cam_fwd.dot(dir)

		# Prioritize nodes aimed directly at, or very close by
		var score := dot * 10.0 - (dist * 0.4)
		if dot > 0.65 or dist < 4.5:
			if score > best_score:
				best_score = score
				best_node = node

	_targeted_node = best_node

	if not _targeted_node.is_empty():
		var verb: String = _targeted_node.get("action_verb", "Interact")
		var n_name: String = _targeted_node.get("name", "Node")
		var req: int = _targeted_node.get("req_level", 1)
		_context_prompt.text = "[E / Click] %s %s (Lvl %d)" % [verb, n_name, req]
		_reticle_label.modulate = Color(0.2, 1.0, 0.6)
	else:
		_context_prompt.text = ""
		_reticle_label.modulate = Color(0.2, 0.9, 1.0, 0.75)

func _trigger_node_interaction() -> void:
	if _targeted_node.is_empty():
		return

	var node_type: String = _targeted_node.get("type", "")

	if node_type == "creature":
		_attack_creature(_targeted_node)
		return

	if node_type == "terminal":
		_play_sfx("click")
		_add_chat_message("[Starbase] Terminal uplink engaged. Outpost operational.", Color(0.3, 1.0, 0.8))
		_toggle_drawer()
		return

	# Channeling interaction for resource nodes
	_start_channel_action(_targeted_node)

func _start_channel_action(node: Dictionary) -> void:
	_active_action_node = node
	_action_timer = 0.0

	match node.get("type", ""):
		"crystal":
			_action_duration = 1.2
			_current_action_name = "Mining Luminescent Crystal..."
			_play_sfx("mechanical")
		"vent":
			_action_duration = 1.4
			_current_action_name = "Siphoning Helium-3 Gas..."
			_play_sfx("mechanical")
		"flora":
			_action_duration = 1.0
			_current_action_name = "Harvesting Xenoflora Spores..."
			_play_sfx("click")
		"crate":
			_action_duration = 1.6
			_current_action_name = "Decrypting Cargo Crate..."
			_play_sfx("click")
		_:
			_action_duration = 1.0
			_current_action_name = "Interacting..."

	_action_progress_bar.max_value = _action_duration
	_action_progress_bar.value = 0.0
	_action_progress_bar.visible = true
	_action_desc_label.text = _current_action_name
	_action_desc_label.visible = true

	# Show laser mining beam
	if is_instance_valid(_laser_beam):
		_laser_beam.visible = true
		_update_beam_visual(node.get("position", Vector3.ZERO))

func _process_action_channel(delta: float) -> void:
	if _active_action_node.is_empty():
		return

	_action_timer += delta
	_action_progress_bar.value = _action_timer

	var target_pos: Vector3 = _active_action_node.get("position", Vector3.ZERO)
	if _player.global_position.distance_to(target_pos) > 16.0:
		_cancel_channel_action("Action cancelled: moved too far.")
		return

	_update_beam_visual(target_pos)

	if _action_timer >= _action_duration:
		_complete_channel_action()

func _update_beam_visual(target_pos: Vector3) -> void:
	if not is_instance_valid(_laser_beam) or not is_instance_valid(_player):
		return
	var tool_origin := _player.global_position + Vector3(0.3, 1.2, -0.4)
	var mid := (tool_origin + target_pos) * 0.5
	var dist := tool_origin.distance_to(target_pos)
	_laser_beam.global_position = mid
	if dist > 0.01:
		_laser_beam.look_at(target_pos, Vector3.UP)
		_laser_beam.scale = Vector3(1.0, 1.0, dist)

func _cancel_channel_action(reason: String) -> void:
	_active_action_node = {}
	_action_progress_bar.visible = false
	_action_desc_label.visible = false
	if is_instance_valid(_laser_beam):
		_laser_beam.visible = false
	if not reason.is_empty():
		_add_chat_message(reason, Color(1.0, 0.4, 0.4))

func _complete_channel_action() -> void:
	var node = _active_action_node
	_active_action_node = {}
	_action_progress_bar.visible = false
	_action_desc_label.visible = false
	if is_instance_valid(_laser_beam):
		_laser_beam.visible = false

	if node.is_empty():
		return

	# Deplete node
	node["is_depleted"] = true
	node["respawn_timer"] = 14.0

	var d_mesh: MeshInstance3D = node.get("display_mesh")
	if is_instance_valid(d_mesh) and node.has("depleted_mat"):
		d_mesh.material_override = node["depleted_mat"]
		var tw := create_tween()
		tw.tween_property(d_mesh, "scale", Vector3(0.5, 0.3, 0.5), 0.3)

	var light: OmniLight3D = node.get("light")
	if is_instance_valid(light):
		light.light_energy = 0.2

	# Award yields & XP
	var skill_key: String = node.get("skill", "")
	var xp_gain: int = node.get("xp", 25)

	match node.get("type", ""):
		"crystal":
			_inventory["crystal_ore"] = _inventory.get("crystal_ore", 0) + 1
			GameData.add_resources({"crystal": 15, "credits": 45})
			_add_chat_message("[Mining] You extract luminescent crystal! (+%d XP, +45 CR)" % xp_gain, Color(0.2, 0.9, 1.0))
			_play_sfx("coins")
		"vent":
			_inventory["he3_fuel"] = _inventory.get("he3_fuel", 0) + 1
			GameData.add_resources({"helium3": 12, "credits": 55})
			_add_chat_message("[Engineering] Siphoned Helium-3 canisters! (+%d XP, +55 CR)" % xp_gain, Color(0.1, 0.85, 1.0))
			_play_sfx("coins")
		"flora":
			_inventory["bio_spores"] = _inventory.get("bio_spores", 0) + 1
			GameData.add_resources({"credits": 35})
			_add_chat_message("[Foraging] Collected rare xenoflora spores! (+%d XP, +35 CR)" % xp_gain, Color(0.3, 1.0, 0.5))
			_play_sfx("coins")
		"crate":
			_inventory["scrap_metal"] = _inventory.get("scrap_metal", 0) + 1
			GameData.add_resources({"metal": 35, "credits": 75})
			_add_chat_message("[Scavenging] Bypassed security! Recovered alloy and cache. (+%d XP, +75 CR)" % xp_gain, Color(1.0, 0.65, 0.15))
			_play_sfx("advance")

	_gain_skill_xp(skill_key, xp_gain)
	_refresh_ui()
	_update_drawer_content()

func _attack_creature(node: Dictionary) -> void:
	_play_sfx("combat1a")
	var dmg: float = randf_range(25.0, 42.0)
	var cur_hp: float = node.get("hp", 80.0) - dmg
	node["hp"] = cur_hp

	# Flash creature red
	var mesh: MeshInstance3D = node.get("display_mesh")
	if is_instance_valid(mesh):
		var tw := create_tween()
		tw.tween_property(mesh, "scale", Vector3(1.3, 1.3, 1.3), 0.08)
		tw.tween_property(mesh, "scale", Vector3.ONE, 0.1)

	var label: Label3D = node.get("label3d")
	if is_instance_valid(label):
		label.text = "Xeno-Crawler [Lvl 3]\nHP: %d/%d" % [maxi(0, int(cur_hp)), int(node.get("max_hp", 80.0))]

	_add_chat_message("[Combat] Hit Xeno-Crawler for %d laser damage!" % int(dmg), Color(1.0, 0.4, 0.4))

	if cur_hp <= 0.0:
		# Creature defeated
		node["is_depleted"] = true
		node["respawn_timer"] = 20.0
		if is_instance_valid(node.get("root")):
			node["root"].visible = false

		_play_sfx("death")
		_inventory["chitin_plate"] = _inventory.get("chitin_plate", 0) + 1
		GameData.add_resources({"credits": 85})
		var combat_xp: int = node.get("xp", 65)
		_add_chat_message("★ [Combat] Xeno-Crawler eliminated! Bounties claimed: +85 CR, +Chitin Plate! (+%d XP)" % combat_xp, Color(1.0, 0.85, 0.2))
		_gain_skill_xp("combat", combat_xp)
		_refresh_ui()
		_update_drawer_content()

func _gain_skill_xp(skill_key: String, amount: int) -> void:
	if not _skills.has(skill_key):
		return
	var s: Dictionary = _skills[skill_key]
	s["xp"] += amount
	_spawn_xp_drop(s["name"], amount)

	var old_lvl: int = s["lvl"]
	var new_lvl: int = _calc_level_from_xp(s["xp"])
	if new_lvl > old_lvl:
		s["lvl"] = new_lvl
		_trigger_level_up(s["name"], new_lvl)

func _calc_xp_for_level(lvl: int) -> int:
	var total := 0
	for l in range(1, lvl):
		total += int(floor(float(l) + 100.0 * pow(2.0, float(l) / 7.0)))
	return total / 4

func _calc_level_from_xp(xp: int) -> int:
	for lvl in range(1, 99):
		if xp < _calc_xp_for_level(lvl + 1):
			return lvl
	return 99

func _spawn_xp_drop(skill_name: String, amount: int) -> void:
	if _xp_drops_box == null:
		return
	var lbl := Label.new()
	lbl.text = "+%d %s XP" % [amount, skill_name]
	lbl.add_theme_font_size_override("font_size", 16)
	lbl.add_theme_color_override("font_color", Color(0.2, 1.0, 0.6))
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_xp_drops_box.add_child(lbl)

	var tw := create_tween()
	tw.tween_property(lbl, "position:y", lbl.position.y - 35.0, 1.1)
	tw.parallel().tween_property(lbl, "modulate:a", 0.0, 1.1)
	tw.tween_callback(lbl.queue_free)

func _trigger_level_up(skill_name: String, new_lvl: int) -> void:
	_play_sfx("advance")
	_add_chat_message("★ LEVEL UP! Your %s level is now %d! ★" % [skill_name, new_lvl], Color(1.0, 0.9, 0.1))
	if is_instance_valid(_level_up_banner):
		_level_up_banner.text = "★ LEVEL UP! ★\nYour %s level is now %d!" % [skill_name, new_lvl]
		_level_up_banner.modulate.a = 1.0
		var tw := create_tween()
		tw.tween_interval(2.5)
		tw.tween_property(_level_up_banner, "modulate:a", 0.0, 0.6)

func _process_world_nodes(delta: float) -> void:
	for node in _world_nodes:
		if node.get("is_depleted", false):
			var timer: float = node.get("respawn_timer", 0.0) - delta
			node["respawn_timer"] = timer
			if timer <= 0.0:
				# Respawn node
				node["is_depleted"] = false
				if node.get("type", "") == "creature":
					node["hp"] = node.get("max_hp", 80.0)
					if is_instance_valid(node.get("root")):
						node["root"].visible = true
				else:
					var d_mesh: MeshInstance3D = node.get("display_mesh")
					if is_instance_valid(d_mesh) and node.has("normal_mat"):
						d_mesh.material_override = node["normal_mat"]
						var tw := create_tween()
						tw.tween_property(d_mesh, "scale", Vector3.ONE, 0.4)
					var light: OmniLight3D = node.get("light")
					if is_instance_valid(light):
						light.light_energy = 2.5

		# Wander alive creatures
		if node.get("type", "") == "creature" and not node.get("is_depleted", false):
			var root: Node3D = node.get("root")
			if is_instance_valid(root):
				var phase: float = node.get("wander_phase", 0.0)
				root.global_position.x += sin(_time * 0.5 + phase) * 0.5 * delta
				root.global_position.z += cos(_time * 0.4 + phase * 1.2) * 0.5 * delta
				if _heightmap:
					root.global_position.y = _heightmap.sample_height(root.global_position.x, root.global_position.z) + 0.6
				node["position"] = root.global_position

func _on_switch_planet() -> void:
	if GameData.current_colony_id == "kepler_186f":
		GameData.current_colony_id = "gliese_667c"
	else:
		GameData.current_colony_id = "kepler_186f"
	get_tree().reload_current_scene()

func _on_harvest_node() -> void:
	var yield_res = GameData.harvest_surface_node(GameData.current_colony_id)
	_add_chat_message("Outpost Automated Harvester: +%d CR, +%d Metal, +%d Crystal/He-3!" % [
		yield_res.get("credits", 0),
		yield_res.get("metal", 0),
		yield_res.get("crystal", yield_res.get("helium3", 0))
	], Color(0.3, 1.0, 0.5))
	_refresh_ui()

func _on_upgrade_building(b_key: String) -> void:
	var ok = GameData.upgrade_colony_building(GameData.current_colony_id, b_key)
	if ok:
		_add_chat_message("Colony facility successfully upgraded!", Color(0.3, 1.0, 0.5))
	else:
		_add_chat_message("Insufficient resources to upgrade facility.", Color(1.0, 0.35, 0.35))
	_refresh_ui()

func _update_cam_pos() -> void:
	var x := sin(_cam_angle) * _cam_dist
	var z := cos(_cam_angle) * _cam_dist
	_camera.position = _cam_target + Vector3(x, _cam_height, z)
	_camera.look_at(_cam_target, Vector3.UP)

