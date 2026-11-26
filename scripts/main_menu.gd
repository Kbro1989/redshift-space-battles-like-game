extends Node3D

var _time: float = 0.0
var _flagship_root: Node3D
var _escort_port: Node3D
var _escort_starboard: Node3D
var _starbase_root: Node3D
var _planet_mesh: MeshInstance3D
var _planet_ring: MeshInstance3D
var _engine_lights: Array = []

func _ready() -> void:
	_setup_environment()
	_setup_camera()
	_setup_celestial_planet()
	_setup_space_station()
	_setup_flagship_and_escorts()
	_setup_stars()
	_setup_ui()

func _setup_environment() -> void:
	var env_node := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.004, 0.005, 0.02)
	env.ambient_light_color = Color(0.08, 0.1, 0.2)
	env.ambient_light_energy = 0.9
	env.glow_enabled = true
	env.glow_intensity = 0.7
	env.glow_bloom = 0.15
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env_node.environment = env
	add_child(env_node)

func _setup_camera() -> void:
	var cam := Camera3D.new()
	cam.position = Vector3(0, 4.5, 18)
	cam.rotation_degrees = Vector3(-8, 0, 0)
	cam.fov = 65.0
	add_child(cam)

func _mat(col: Color, metal: float = 0.7, rough: float = 0.3, emit: Color = Color.BLACK, emit_e: float = 0.0) -> StandardMaterial3D:
	var key: String = "menu_mat_%s_%d_%d_%d" % [col.to_html(false), int(metal * 100), int(rough * 100), int(emit_e * 10)]
	return AssetCache.get_material(key, col, metal, rough, emit, emit_e)

func _setup_celestial_planet() -> void:
	# Giant ringed planet in the deep cosmic background
	var planet_root := Node3D.new()
	planet_root.position = Vector3(55, -12, -90)
	add_child(planet_root)

	_planet_mesh = MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = 28.0
	sm.height = 56.0
	_planet_mesh.mesh = sm
	var p_mat := _mat(Color(0.22, 0.45, 0.75), 0.3, 0.8, Color(0.05, 0.2, 0.5), 0.4)
	_planet_mesh.material_override = p_mat
	planet_root.add_child(_planet_mesh)

	# Celestial planetary rings
	_planet_ring = MeshInstance3D.new()
	var tor := TorusMesh.new()
	tor.inner_radius = 35.0
	tor.outer_radius = 48.0
	_planet_ring.mesh = tor
	var r_mat := _mat(Color(0.55, 0.65, 0.8, 0.5), 0.5, 0.5)
	r_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_planet_ring.material_override = r_mat
	_planet_ring.rotation_degrees = Vector3(25, -35, 15)
	planet_root.add_child(_planet_ring)

func _setup_space_station() -> void:
	# Starbase Citadel in the background gantry
	_starbase_root = Node3D.new()
	_starbase_root.position = Vector3(-16, 8, -25)
	add_child(_starbase_root)

	var hub := MeshInstance3D.new()
	var hm := BoxMesh.new()
	hm.size = Vector3(10.0, 4.0, 10.0)
	hub.mesh = hm
	hub.material_override = _mat(Color(0.18, 0.24, 0.36), 0.85, 0.25)
	_starbase_root.add_child(hub)

	# Massive Photovoltaic Solar Arrays
	for side in [-1, 1]:
		var panel := MeshInstance3D.new()
		var pm := BoxMesh.new()
		pm.size = Vector3(14.0, 0.15, 5.0)
		panel.mesh = pm
		panel.material_override = _mat(Color(0.08, 0.22, 0.45), 0.9, 0.15, Color(0.05, 0.35, 0.8), 0.6)
		panel.position = Vector3(side * 14.0, 0, 0)
		_starbase_root.add_child(panel)

	# Orbital Antenna Spire & Warning Beacon
	var spire := MeshInstance3D.new()
	var spm := CylinderMesh.new()
	spm.top_radius = 0.2
	spm.bottom_radius = 0.8
	spm.height = 12.0
	spire.mesh = spm
	spire.material_override = _mat(Color(0.4, 0.45, 0.55), 0.8, 0.3)
	spire.position.y = 7.0
	_starbase_root.add_child(spire)

	var beacon := OmniLight3D.new()
	beacon.position = Vector3(0, 13.5, 0)
	beacon.light_color = Color(0.2, 0.8, 1.0)
	beacon.light_energy = 5.0
	beacon.omni_range = 28.0
	_starbase_root.add_child(beacon)

func _setup_flagship_and_escorts() -> void:
	# HERO FLAGSHIP in center foreground
	_flagship_root = Node3D.new()
	_flagship_root.position = Vector3(0, 1.2, 2.5)
	_flagship_root.rotation_degrees = Vector3(-5, 160, 4)
	add_child(_flagship_root)

	var hull_mat := _mat(Color(0.2, 0.45, 0.85), 0.65, 0.3)
	var armor_mat := _mat(Color(0.12, 0.16, 0.25), 0.85, 0.2)
	var turret_mat := _mat(Color(0.18, 0.2, 0.28), 0.95, 0.15)
	var window_mat := _mat(Color(0.3, 0.9, 1.0), 0.2, 0.1, Color(0.3, 0.9, 1.0), 4.5)

	# Main superstructure chassis
	var hull := MeshInstance3D.new()
	var hm := BoxMesh.new()
	hm.size = Vector3(2.6, 1.2, 7.8)
	hull.mesh = hm
	hull.material_override = hull_mat
	_flagship_root.add_child(hull)

	# Swept forward broadside armor wings
	for side in [-1, 1]:
		var wing := MeshInstance3D.new()
		var wm := BoxMesh.new()
		wm.size = Vector3(1.1, 0.8, 5.8)
		wing.mesh = wm
		wing.material_override = armor_mat
		wing.position = Vector3(side * 2.0, 0, 0.4)
		wing.rotation_degrees = Vector3(0, side * 6, 0)
		_flagship_root.add_child(wing)

	# Bridge Command Citadel
	var bridge := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(1.2, 0.9, 1.8)
	bridge.mesh = bm
	bridge.material_override = armor_mat
	bridge.position = Vector3(0, 1.0, 1.5)
	_flagship_root.add_child(bridge)

	# Illuminated Bridge Viewport Band
	var win := MeshInstance3D.new()
	var wnm := BoxMesh.new()
	wnm.size = Vector3(1.22, 0.2, 0.6)
	win.mesh = wnm
	win.material_override = window_mat
	win.position = Vector3(0, 1.15, 0.9)
	_flagship_root.add_child(win)

	# Heavy Turret Barbettes
	var turret_z = [-1.8, 0.2]
	for z_pos in turret_z:
		var t := MeshInstance3D.new()
		var tm := BoxMesh.new()
		tm.size = Vector3(0.9, 0.5, 1.2)
		t.mesh = tm
		t.material_override = turret_mat
		t.position = Vector3(0, 0.85, z_pos)
		_flagship_root.add_child(t)

		# Twin heavy barrels
		for b_side in [-0.22, 0.22]:
			var barrel := MeshInstance3D.new()
			var brm := CylinderMesh.new()
			brm.top_radius = 0.08
			brm.bottom_radius = 0.08
			brm.height = 1.9
			barrel.mesh = brm
			barrel.material_override = turret_mat
			barrel.position = Vector3(b_side, 0.85, z_pos - 1.1)
			barrel.rotation_degrees = Vector3(90, 0, 0)
			_flagship_root.add_child(barrel)

	# Pulsing Stern Propulsion Engines
	var eng_positions = [Vector3(-0.8, 0, 4.0), Vector3(0, 0, 4.1), Vector3(0.8, 0, 4.0)]
	for ep in eng_positions:
		var nozzle := MeshInstance3D.new()
		var nm := CylinderMesh.new()
		nm.top_radius = 0.45
		nm.bottom_radius = 0.35
		nm.height = 0.6
		nozzle.mesh = nm
		nozzle.material_override = turret_mat
		nozzle.position = ep
		nozzle.rotation_degrees = Vector3(90, 0, 0)
		_flagship_root.add_child(nozzle)

		var elight := OmniLight3D.new()
		elight.position = ep + Vector3(0, 0, 0.5)
		elight.light_color = Color(0.1, 0.7, 1.0)
		elight.light_energy = 3.5
		elight.omni_range = 8.0
		_flagship_root.add_child(elight)
		_engine_lights.append(elight)

	# ESCORT FIGHTERS
	_escort_port = _build_escort_fighter(Vector3(-5.5, -0.6, 1.0), Color(0.2, 0.6, 1.0))
	add_child(_escort_port)

	_escort_starboard = _build_escort_fighter(Vector3(5.5, 0.8, 2.0), Color(0.9, 0.5, 0.1))
	add_child(_escort_starboard)

func _build_escort_fighter(pos: Vector3, col: Color) -> Node3D:
	var f_root := Node3D.new()
	f_root.position = pos
	f_root.rotation_degrees = Vector3(-6, 162, 8)

	var f_hull := MeshInstance3D.new()
	var hm := BoxMesh.new()
	hm.size = Vector3(0.6, 0.3, 2.0)
	f_hull.mesh = hm
	f_hull.material_override = _mat(col, 0.65, 0.3)
	f_root.add_child(f_hull)

	var wings := MeshInstance3D.new()
	var wm := BoxMesh.new()
	wm.size = Vector3(2.2, 0.08, 0.9)
	wings.mesh = wm
	wings.material_override = _mat(Color(0.15, 0.18, 0.25), 0.8, 0.25)
	wings.position = Vector3(0, 0, 0.2)
	f_root.add_child(wings)

	var eng_light := OmniLight3D.new()
	eng_light.position = Vector3(0, 0, 1.2)
	eng_light.light_color = Color(0.2, 0.8, 1.0)
	eng_light.light_energy = 2.5
	eng_light.omni_range = 5.0
	f_root.add_child(eng_light)
	_engine_lights.append(eng_light)

	return f_root

func _setup_stars() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	for _i in 300:
		var star := MeshInstance3D.new()
		var tier: int = rng.randi_range(0, 2)
		var star_mat: StandardMaterial3D = AssetCache.get_material(
			"star_tier_" + str(tier),
			Color.WHITE, 0.0, 1.0,
			Color(1.0, 1.0, 0.8 + 0.1 * tier),
			1.0 + float(tier) * 1.5
		)
		var sph := SphereMesh.new()
		sph.radius = 0.05 + float(tier) * 0.03
		sph.height = sph.radius * 2.0
		star.mesh = sph
		star.material_override = star_mat
		star.position = Vector3(
			rng.randf_range(-70, 70),
			rng.randf_range(-40, 40),
			rng.randf_range(-90, -15)
		)
		add_child(star)

func _setup_ui() -> void:
	var canvas := CanvasLayer.new()

	var vignette := ColorRect.new()
	vignette.color = Color(0, 0, 0, 0.3)
	vignette.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	canvas.add_child(vignette)

	var center := VBoxContainer.new()
	center.alignment = BoxContainer.ALIGNMENT_CENTER
	center.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	center.offset_left = -250.0
	center.offset_right = 250.0
	center.offset_top = -200.0
	center.offset_bottom = 200.0
	center.add_theme_constant_override("separation", 16)
	canvas.add_child(center)

	var title := Label.new()
	title.text = "REDSHIFT\nSPACE BATTLES"
	title.add_theme_font_size_override("font_size", 48)
	title.add_theme_color_override("font_color", Color(0.3, 0.8, 1.0))
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center.add_child(title)

	var tag := Label.new()
	tag.text = "Build your base • Recruit ships • Conquer the Dominion"
	tag.add_theme_font_size_override("font_size", 14)
	tag.add_theme_color_override("font_color", Color(0.6, 0.8, 1.0))
	tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center.add_child(tag)

	var play_btn := Button.new()
	play_btn.text = "▶  COMMAND FLEET & BASE"
	play_btn.custom_minimum_size = Vector2(380, 58)
	play_btn.add_theme_font_size_override("font_size", 20)
	play_btn.add_theme_color_override("font_color", Color(0.3, 1.0, 0.6))
	play_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/fleet_manager.tscn"))
	center.add_child(play_btn)

	var land_btn := Button.new()
	land_btn.text = "🌍  PLANETARY SURFACE EXPEDITION"
	land_btn.custom_minimum_size = Vector2(380, 52)
	land_btn.add_theme_font_size_override("font_size", 16)
	land_btn.add_theme_color_override("font_color", Color(0.4, 0.95, 0.75))
	land_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world_colony.tscn"))
	center.add_child(land_btn)

	var quit_btn := Button.new()
	quit_btn.text = "✕  QUIT GAME"
	quit_btn.custom_minimum_size = Vector2(380, 50)
	quit_btn.add_theme_font_size_override("font_size", 18)
	quit_btn.pressed.connect(get_tree().quit)
	center.add_child(quit_btn)

	var footer := Label.new()
	footer.text = "REAL 3D Tactical Combat Engine • Godot 4"
	footer.add_theme_font_size_override("font_size", 12)
	footer.add_theme_color_override("font_color", Color(0.4, 0.45, 0.55))
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center.add_child(footer)

	add_child(canvas)

func _process(delta: float) -> void:
	_time += delta

	# Flagship gentle space stabilization drift & hover
	if is_instance_valid(_flagship_root):
		_flagship_root.position.y = 1.2 + sin(_time * 1.4) * 0.25
		_flagship_root.rotation_degrees.z = 4.0 + sin(_time * 1.1) * 1.5
		_flagship_root.rotation_degrees.x = -5.0 + cos(_time * 0.9) * 1.0

	# Escort fighter formation banking
	if is_instance_valid(_escort_port):
		_escort_port.position.y = -0.6 + sin(_time * 1.6 + 0.5) * 0.35
		_escort_port.rotation_degrees.z = 8.0 + cos(_time * 1.2) * 2.0

	if is_instance_valid(_escort_starboard):
		_escort_starboard.position.y = 0.8 + sin(_time * 1.5 + 1.0) * 0.35
		_escort_starboard.rotation_degrees.z = -8.0 + cos(_time * 1.3) * 2.0

	# Plasma thruster flickering & energy modulation
	for light in _engine_lights:
		if is_instance_valid(light):
			(light as OmniLight3D).light_energy = 3.2 + sin(_time * 12.0 + float(light.get_instance_id() % 7)) * 0.8

	# Slow rotation of orbital starbase and celestial planet
	if is_instance_valid(_starbase_root):
		_starbase_root.rotation_degrees.y += delta * 1.5

	if is_instance_valid(_planet_mesh):
		_planet_mesh.rotation_degrees.y += delta * 0.8

	if is_instance_valid(_planet_ring):
		_planet_ring.rotation_degrees.z += delta * 0.4
