extends Node3D

var _player_ships: Array = []
var _enemy_ships: Array = []
var _camera: Camera3D
var _cam_target: Vector3 = Vector3.ZERO
var _cam_angle: float = 0.0
var _cam_dist: float = 42.0
var _cam_height: float = 18.0
var _cam_mode: int = 1 # 0: Cinematic Orbit, 1: Direct Flagship Pilot, 2: Action Overview
var _time: float = 0.0
var _battle_over: bool = false
var _result_shown: bool = false
var _hud: CanvasLayer
var _fleet_label: Label
var _status_banner: Label
var _telemetry_label: Label
var _reticle_label: Label
var _controls_hint_label: Label
var _retarget_timer: float = 0.0
var _ship_scene: PackedScene
var _shake_amount: float = 0.0
var _flagship: Node3D = null

func _ready() -> void:
	_ship_scene = load("res://scenes/ships/ship.tscn")
	_build_environment()
	_build_camera()
	_build_lighting()
	_build_asteroids()
	_spawn_fleets()
	_build_hud()

func _build_environment() -> void:
	var en := WorldEnvironment.new()
	var e := Environment.new()
	e.background_mode = Environment.BG_COLOR
	e.background_color = Color(0.005, 0.008, 0.02)
	e.ambient_light_color = Color(0.08, 0.1, 0.18)
	e.ambient_light_energy = 1.0
	e.glow_enabled = true
	e.glow_intensity = 0.8
	e.glow_bloom = 0.15
	e.glow_hdr_threshold = 0.5
	e.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	en.environment = e
	add_child(en)

	# Stars
	var rng := RandomNumberGenerator.new()
	rng.seed = 12345
	for _i in 400:
		var mi := MeshInstance3D.new()
		var sm := SphereMesh.new()
		sm.radius = rng.randf_range(0.03, 0.14)
		sm.height = sm.radius * 2.0
		mi.mesh = sm
		var m := StandardMaterial3D.new()
		m.albedo_color = Color.WHITE
		m.emission_enabled = true
		m.emission = Color(rng.randf_range(0.8, 1.0), rng.randf_range(0.85, 1.0), 1.0)
		m.emission_energy_multiplier = rng.randf_range(0.5, 4.0)
		mi.material_override = m
		mi.position = Vector3(
			rng.randf_range(-220, 220),
			rng.randf_range(-120, 120),
			rng.randf_range(-260, 260)
		)
		add_child(mi)

	# Nebulae
	rng.seed = 67890
	var nebula_colors = [Color(0.2, 0.4, 0.9, 0.05), Color(0.8, 0.2, 0.6, 0.04), Color(0.1, 0.8, 0.5, 0.04)]
	for i in 6:
		var mi := MeshInstance3D.new()
		var sm := SphereMesh.new()
		sm.radius = rng.randf_range(35, 70)
		sm.height = sm.radius * 2.0
		mi.mesh = sm
		var m := StandardMaterial3D.new()
		var col = nebula_colors[i % nebula_colors.size()]
		m.albedo_color = col
		m.emission_enabled = true
		m.emission = Color(col.r, col.g, col.b)
		m.emission_energy_multiplier = 0.1
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mi.material_override = m
		mi.position = Vector3(
			rng.randf_range(-150, 150),
			rng.randf_range(-80, 80),
			rng.randf_range(-180, -60)
		)
		add_child(mi)

	# Approach planet — large sphere visible ahead, StarFox style
	var planet_mi := MeshInstance3D.new()
	var planet_mesh := SphereMesh.new()
	planet_mesh.radius = 60.0
	planet_mesh.height = 120.0
	planet_mi.mesh = planet_mesh
	var planet_mat := StandardMaterial3D.new()
	planet_mat.albedo_color = Color(0.1, 0.35, 0.65)
	planet_mat.emission_enabled = true
	planet_mat.emission = Color(0.05, 0.2, 0.5)
	planet_mat.emission_energy_multiplier = 0.4
	planet_mat.roughness = 0.8
	planet_mi.material_override = planet_mat
	planet_mi.position = Vector3(10.0, -20.0, -300.0)
	add_child(planet_mi)

func _build_asteroids() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 333
	var ast_mat := StandardMaterial3D.new()
	ast_mat.albedo_color = Color(0.25, 0.22, 0.2)
	ast_mat.roughness = 0.9
	ast_mat.metallic = 0.1

	for _i in 18:
		var mi := MeshInstance3D.new()
		var sm := SphereMesh.new()
		sm.radius = rng.randf_range(1.5, 5.0)
		sm.height = sm.radius * 1.8
		mi.mesh = sm
		mi.material_override = ast_mat
		mi.position = Vector3(
			rng.randf_range(-90, 90),
			rng.randf_range(-15, 15),
			rng.randf_range(-80, 80)
		)
		mi.rotation_degrees = Vector3(rng.randf_range(0, 360), rng.randf_range(0, 360), rng.randf_range(0, 360))
		add_child(mi)

func _build_camera() -> void:
	_camera = Camera3D.new()
	_camera.fov = 70.0
	add_child(_camera)
	_move_camera()

func _build_lighting() -> void:
	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-45, 35, 0)
	sun.light_color = Color(1.0, 0.95, 0.9)
	sun.light_energy = 1.8
	sun.shadow_enabled = true
	add_child(sun)

	var rim := DirectionalLight3D.new()
	rim.rotation_degrees = Vector3(40, -145, 0)
	rim.light_color = Color(0.25, 0.4, 0.7)
	rim.light_energy = 0.6
	add_child(rim)

func _spawn_fleets() -> void:
	var gd := GameData

	# Player fleet
	for i in gd.player_fleet.size():
		var ship := _make_ship(gd.player_fleet[i], true)
		add_child(ship)
		ship.global_position = _formation_pos(i, true)
		ship.died.connect(_on_ship_died.bind(true))
		if i == 0:
			ship.set("is_player_controlled", true)
			_flagship = ship
		_player_ships.append(ship)

	# Enemy fleet
	var e_idx := 0
	var enemy_groups = gd.current_mission.get("enemy_fleet", [{"type": "fighter", "count": 2}])
	for group in enemy_groups:
		for _j in group.get("count", 1):
			var data := gd.create_ship_instance(group.get("type", "fighter"))
			var ship := _make_ship(data, false)
			add_child(ship)
			ship.global_position = _formation_pos(e_idx, false)
			ship.died.connect(_on_ship_died.bind(false))
			_enemy_ships.append(ship)
			e_idx += 1

	_reassign_targets()

func _make_ship(data: Dictionary, player: bool) -> Node3D:
	var ship: Node3D = _ship_scene.instantiate()
	ship.call("init", data, player)
	return ship

func _formation_pos(idx: int, player: bool) -> Vector3:
	var row := idx % 3
	var col := idx / 3
	var z := -28.0 if player else 120.0
	var spacing_x := 8.5
	var spacing_z := 7.0
	# True 3D altitude staggering across human and alien fleet wings
	var altitude := (col * 4.5 - (row - 1) * 3.5) * (1.0 if player else -0.85)
	return Vector3(
		(row - 1) * spacing_x,
		altitude,
		z + col * (-spacing_z if player else 15.0)
	)

func _reassign_targets() -> void:
	for ps in _player_ships:
		if is_instance_valid(ps) and not ps.get("_is_dead"):
			ps.set("target", _nearest(ps, _enemy_ships))
	for es in _enemy_ships:
		if is_instance_valid(es) and not es.get("_is_dead"):
			es.set("target", _nearest(es, _player_ships))

func _nearest(ship: Node3D, pool: Array) -> Node3D:
	var best: Node3D = null
	var best_d: float = INF
	for s in pool:
		if not is_instance_valid(s) or s.get("_is_dead"):
			continue
		var d := ship.global_position.distance_to(s.global_position)
		if d < best_d:
			best_d = d
			best = s
	return best

func _build_hud() -> void:
	_hud = CanvasLayer.new()
	add_child(_hud)

	var panel := PanelContainer.new()
	var sty := StyleBoxFlat.new()
	sty.bg_color = Color(0.04, 0.06, 0.12, 0.8)
	sty.border_color = Color(0.2, 0.4, 0.8, 0.6)
	sty.set_border_width_all(1)
	sty.set_corner_radius_all(4)
	sty.set_content_margin_all(12)
	panel.add_theme_stylebox_override("panel", sty)
	panel.position = Vector2(20, 20)
	_hud.add_child(panel)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	panel.add_child(vb)

	var title := Label.new()
	title.text = "REDSHIFT COMBAT ENGAGEMENT"
	title.add_theme_font_size_override("font_size", 18)
	title.add_theme_color_override("font_color", Color(0.3, 0.85, 1.0))
	vb.add_child(title)

	var mission_lbl := Label.new()
	mission_lbl.text = "Sector: " + GameData.current_mission.get("name", "Patrol")
	mission_lbl.add_theme_font_size_override("font_size", 14)
	mission_lbl.add_theme_color_override("font_color", Color(0.8, 0.8, 0.9))
	vb.add_child(mission_lbl)

	_fleet_label = Label.new()
	_fleet_label.add_theme_font_size_override("font_size", 15)
	_fleet_label.add_theme_color_override("font_color", Color(0.4, 1.0, 0.6))
	vb.add_child(_fleet_label)

	_telemetry_label = Label.new()
	_telemetry_label.add_theme_font_size_override("font_size", 13)
	_telemetry_label.add_theme_color_override("font_color", Color(0.3, 0.9, 1.0))
	vb.add_child(_telemetry_label)

	var btn_row := HBoxContainer.new()
	btn_row.add_theme_constant_override("separation", 8)
	vb.add_child(btn_row)

	var cam_btn := Button.new()
	cam_btn.text = "🎥 Cam Mode"
	cam_btn.pressed.connect(_cycle_camera)
	btn_row.add_child(cam_btn)

	var pilot_btn := Button.new()
	pilot_btn.text = "🚀 Toggle Auto-Pilot (C)"
	pilot_btn.pressed.connect(_toggle_autopilot)
	btn_row.add_child(pilot_btn)

	var retreat_btn := Button.new()
	retreat_btn.text = "⚑ Retreat"
	retreat_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/fleet_manager.tscn"))
	btn_row.add_child(retreat_btn)

	_status_banner = Label.new()
	_status_banner.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	_status_banner.position.y = 30
	_status_banner.add_theme_font_size_override("font_size", 24)
	_status_banner.add_theme_color_override("font_color", Color(1.0, 0.8, 0.2))
	_status_banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_hud.add_child(_status_banner)

	# Central Pilot Crosshair
	_reticle_label = Label.new()
	_reticle_label.text = "⬡\n[ + ]"
	_reticle_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	_reticle_label.offset_left = -30
	_reticle_label.offset_top = -25
	_reticle_label.offset_right = 30
	_reticle_label.offset_bottom = 25
	_reticle_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_reticle_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_reticle_label.add_theme_font_size_override("font_size", 16)
	_reticle_label.add_theme_color_override("font_color", Color(0.0, 1.0, 0.8, 0.75))
	_hud.add_child(_reticle_label)

	# Controls helper bar at bottom
	_controls_hint_label = Label.new()
	_controls_hint_label.text = "[W/S] Throttle  •  [A/D] Turn  •  [R/F] Pitch  •  [Q/E] Bank  •  [Shift] Overdrive  •  [Space / L-Click] Cannons  •  [X / R-Click] Torpedo  •  [C] Auto-Pilot  •  [Tab] Target"
	_controls_hint_label.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	_controls_hint_label.position.y = -36
	_controls_hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_controls_hint_label.add_theme_font_size_override("font_size", 12)
	_controls_hint_label.add_theme_color_override("font_color", Color(0.65, 0.75, 0.85, 0.8))
	_hud.add_child(_controls_hint_label)

func _toggle_autopilot() -> void:
	if is_instance_valid(_flagship) and not _flagship.get("_is_dead"):
		var cur_auto: bool = _flagship.get("auto_pilot_enabled")
		_flagship.set("auto_pilot_enabled", not cur_auto)
		_status_banner.text = "FLIGHT MODE: " + ("AUTO-PILOT ASSIST" if not cur_auto else "DIRECT MANUAL PILOT")
		_status_banner.modulate.a = 1.0
		var tw = create_tween()
		tw.tween_interval(1.2)
		tw.tween_property(_status_banner, "modulate:a", 0.0, 0.4)

func _cycle_target() -> void:
	if not is_instance_valid(_flagship) or _flagship.get("_is_dead"): return
	var cur_target = _flagship.get("target")
	var idx := _enemy_ships.find(cur_target)
	for i in _enemy_ships.size():
		var next_idx = (idx + 1 + i) % _enemy_ships.size()
		var candidate = _enemy_ships[next_idx]
		if is_instance_valid(candidate) and not candidate.get("_is_dead"):
			_flagship.set("target", candidate)
			_status_banner.text = "TARGET LOCKED: " + candidate.ship_data.get("name", "Hostile")
			_status_banner.modulate.a = 1.0
			var tw = create_tween()
			tw.tween_interval(1.0)
			tw.tween_property(_status_banner, "modulate:a", 0.0, 0.4)
			break

func _cycle_camera() -> void:
	_cam_mode = (_cam_mode + 1) % 3
	var modes = ["Cinematic Orbit", "Flagship Pilot Chase", "Tactical Overview"]
	_status_banner.text = "Camera: " + modes[_cam_mode]
	_reticle_label.visible = (_cam_mode == 1)
	var tw = create_tween()
	tw.tween_property(_status_banner, "modulate:a", 1.0, 0.1)
	tw.tween_interval(1.2)
	tw.tween_property(_status_banner, "modulate:a", 0.0, 0.5)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_C:
			_toggle_autopilot()
		elif event.keycode == KEY_TAB:
			_cycle_target()
		elif event.keycode == KEY_V:
			_cycle_camera()

func _process(delta: float) -> void:
	_time += delta

	# Enemy dogfight oscillation — weaving approach / sphere orbit overlay
	for i in _enemy_ships.size():
		var es = _enemy_ships[i]
		if not is_instance_valid(es) or es.get("_is_dead"):
			continue
		var ref_pos: Vector3 = Vector3.ZERO
		if is_instance_valid(_flagship) and not _flagship.get("_is_dead"):
			ref_pos = _flagship.global_position
		var dist_z: float = es.global_position.z - ref_pos.z
		# Phase offset per ship for variety
		var phase: float = float(i) * 1.3
		# While far away (z > 20): weave on X/Y as they approach
		# Once close (z < 20): orbit in a sphere pattern
		if dist_z > 20.0:
			var sway_x: float = sin(_time * 1.1 + phase) * 5.5
			var sway_y: float = cos(_time * 0.85 + phase * 0.7) * 2.5
			es.global_position.x = es.global_position.x + (sway_x - es.global_position.x + ref_pos.x) * delta * 0.4
			es.global_position.y = es.global_position.y + (sway_y + ref_pos.y - es.global_position.y) * delta * 0.3
		else:
			# Sphere orbit around flagship once close
			var orbit_r: float = 18.0 + float(i % 3) * 5.0
			var orbit_speed: float = 0.55 + float(i % 2) * 0.2
			var azimuth: float = _time * orbit_speed + phase
			var elevation: float = sin(_time * 0.4 + phase) * 0.6
			var target_orbit := ref_pos + Vector3(
				sin(azimuth) * cos(elevation) * orbit_r,
				sin(elevation) * orbit_r * 0.5,
				cos(azimuth) * cos(elevation) * orbit_r
			)
			es.global_position = es.global_position.lerp(target_orbit, delta * 1.2)

	# Flagship Direct Manual Piloting & Weapons Control
	if is_instance_valid(_flagship) and not _flagship.get("_is_dead"):
		var throttle: float = 0.0
		if Input.is_key_pressed(KEY_W): throttle += 1.0
		if Input.is_key_pressed(KEY_S): throttle -= 0.6
		_flagship.set("manual_throttle", throttle)

		var yaw: float = 0.0
		if Input.is_key_pressed(KEY_D): yaw += 1.0
		if Input.is_key_pressed(KEY_A): yaw -= 1.0
		_flagship.set("manual_steer_yaw", yaw)

		var pitch: float = 0.0
		if Input.is_key_pressed(KEY_F) or Input.is_key_pressed(KEY_DOWN): pitch += 1.0
		if Input.is_key_pressed(KEY_R) or Input.is_key_pressed(KEY_UP): pitch -= 1.0
		_flagship.set("manual_steer_pitch", pitch)

		var roll: float = 0.0
		if Input.is_key_pressed(KEY_E): roll += 1.0
		if Input.is_key_pressed(KEY_Q): roll -= 1.0
		_flagship.set("manual_roll", roll)

		var boosting: bool = Input.is_key_pressed(KEY_SHIFT)
		_flagship.set("is_boosting", boosting)

		if Input.is_key_pressed(KEY_SPACE) or Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
			_flagship.call("manual_fire_primary")

		if Input.is_key_pressed(KEY_X) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
			_flagship.call("manual_fire_missile")

		# Update flight telemetry on HUD
		var spd: float = _flagship.get("current_combat_speed")
		var is_auto: bool = _flagship.get("auto_pilot_enabled")
		var boost_txt: String = " [OVERDRIVE ON]" if boosting else ""
		var mode_txt: String = "AUTO-PILOT ASSIST" if is_auto else "DIRECT MANUAL PILOT"
		var tgt = _flagship.get("target")
		var dist_txt: String = ""
		if is_instance_valid(tgt) and not tgt.get("_is_dead"):
			var d := _flagship.global_position.distance_to(tgt.global_position)
			dist_txt = " | TGT DIST: %.0fM" % d
		if is_instance_valid(_telemetry_label):
			_telemetry_label.text = "SPEED: %.1f KTS%s | FLIGHT: %s%s" % [spd, boost_txt, mode_txt, dist_txt]

	# Camera Shake
	var shake_offset := Vector3.ZERO
	if _shake_amount > 0.0:
		_shake_amount = maxf(0.0, _shake_amount - delta * 3.5)
		shake_offset = Vector3(
			randf_range(-1.0, 1.0),
			randf_range(-1.0, 1.0),
			randf_range(-1.0, 1.0)
		) * _shake_amount

	# Update Camera tracking
	_cam_angle += delta * 0.12
	var centroid := Vector3.ZERO
	var alive := 0

	match _cam_mode:
		0: # Orbit around all surviving units
			for s in _player_ships + _enemy_ships:
				if is_instance_valid(s) and not s.get("_is_dead"):
					centroid += s.global_position
					alive += 1
			if alive > 0:
				_cam_target = _cam_target.lerp(centroid / alive, delta * 2.0)
			_cam_dist = maxf(22.0, 42.0 - _time * 0.35)
			_cam_height = maxf(9.0, 18.0 - _time * 0.2)
			_move_camera(shake_offset)
		1: # Direct Flagship Chase Camera
			if is_instance_valid(_flagship) and not _flagship.get("_is_dead"):
				var f_basis: Basis = _flagship.global_basis
				var behind_offset := f_basis.z * 13.0 + f_basis.y * 3.8
				var target_pos := _flagship.global_position + behind_offset + shake_offset
				_camera.global_position = _camera.global_position.lerp(target_pos, delta * 7.0)
				var look_target := _flagship.global_position - f_basis.z * 22.0
				_camera.look_at(look_target, f_basis.y)
				var boost: bool = _flagship.get("is_boosting")
				_camera.fov = lerpf(_camera.fov, 82.0 if boost else 70.0, delta * 3.5)
			else:
				# Fallback if flagship lost
				_cam_mode = 0
		2: # Top-Down Tactical overview
			for s in _player_ships + _enemy_ships:
				if is_instance_valid(s) and not s.get("_is_dead"):
					centroid += s.global_position
					alive += 1
			if alive > 0:
				_cam_target = _cam_target.lerp(centroid / alive, delta * 2.0)
			_cam_dist = 8.0
			_cam_height = 52.0
			_move_camera(shake_offset)

	# Fleet HUD counters
	var ap := _count_alive(_player_ships)
	var ae := _count_alive(_enemy_ships)
	_fleet_label.text = "Friendly Fleet: %d/%d   |   Hostile Armada: %d/%d" % [
		ap, _player_ships.size(), ae, _enemy_ships.size()
	]

	# Periodic target refreshing
	_retarget_timer += delta
	if _retarget_timer >= 2.5:
		_retarget_timer = 0.0
		_reassign_targets()

	# Battle outcome resolution
	if not _battle_over and (ap == 0 or ae == 0):
		_battle_over = true
		get_tree().create_timer(2.5).timeout.connect(_show_result.bind(ae == 0))

func _move_camera(shake: Vector3 = Vector3.ZERO) -> void:
	if _cam_mode == 2:
		_camera.position = _cam_target + Vector3(0, _cam_height, 0.01) + shake
		_camera.look_at(_cam_target, Vector3.FORWARD)
	else:
		var x := sin(_cam_angle) * _cam_dist
		var z := cos(_cam_angle) * _cam_dist
		_camera.position = _cam_target + Vector3(x, _cam_height, z) + shake
		_camera.look_at(_cam_target + Vector3(0, 1.0, 0), Vector3.UP)

func _count_alive(pool: Array) -> int:
	var n := 0
	for s in pool:
		if is_instance_valid(s) and not s.get("_is_dead"):
			n += 1
	return n

func _on_ship_died(was_player: bool) -> void:
	_shake_amount = 1.2
	_reassign_targets()

func _show_result(victory: bool) -> void:
	if _result_shown:
		return
	_result_shown = true

	GameData.total_battles += 1
	var loot_summary := ""
	if victory:
		GameData.victories += 1
		if GameData.current_mission.has("raid_reward"):
			var rew_dict: Dictionary = GameData.current_mission["raid_reward"]
			GameData.add_resources(rew_dict)
			loot_summary = "Bounty Claimed: +%d CR | +%d Metal | +%d Crystal | +%d He-3" % [
				rew_dict.get("credits", 0),
				rew_dict.get("metal", 0),
				rew_dict.get("crystal", 0),
				rew_dict.get("helium3", 0)
			]
			if rew_dict.has("schematic"):
				loot_summary += "\n★ RARE BLUEPRINT RECOVERED: " + rew_dict["schematic"]
		else:
			var base_reward: int = GameData.current_mission.get("reward", 400)
			var m_gain: int = int(base_reward * 0.5)
			var c_gain: int = int(base_reward * 0.2)
			GameData.add_resources({
				"credits": base_reward,
				"metal": m_gain,
				"crystal": c_gain
			})
			loot_summary = "Bounty Claimed: +%d CR | +%d Metal | +%d Crystal" % [base_reward, m_gain, c_gain]

		if GameData.current_mission.get("is_ladder", false):
			GameData.ladder_rating += 25
			GameData.ladder_victories += 1
			loot_summary += "\n🏆 Ladder Rating Increased (+25 Points) -> %d ELO" % GameData.ladder_rating
			GameData.save_game()

		GameData.repair_fleet()

	var overlay := ColorRect.new()
	overlay.color = Color(0.01, 0.02, 0.05, 0.85)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_hud.add_child(overlay)

	var vb := VBoxContainer.new()
	vb.alignment = BoxContainer.ALIGNMENT_CENTER
	vb.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	vb.offset_left = -260.0
	vb.offset_right = 260.0
	vb.offset_top = -160.0
	vb.offset_bottom = 160.0
	vb.add_theme_constant_override("separation", 14)
	_hud.add_child(vb)

	var res_lbl := Label.new()
	res_lbl.text = "SECTOR CLEARED — PLANET IN RANGE" if victory else "FLEET ANNIHILATED"
	res_lbl.add_theme_font_size_override("font_size", 42)
	res_lbl.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5) if victory else Color(1.0, 0.3, 0.3))
	res_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(res_lbl)

	if victory:
		var subtitle_lbl := Label.new()
		subtitle_lbl.text = "Enemy forces neutralized. Planetary surface access unlocked.\nDeploy ground team or return to fleet command."
		subtitle_lbl.add_theme_font_size_override("font_size", 15)
		subtitle_lbl.add_theme_color_override("font_color", Color(0.6, 0.9, 1.0))
		subtitle_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vb.add_child(subtitle_lbl)

	if victory:
		var rew := Label.new()
		rew.text = loot_summary + "\nAll surviving ships repaired in starbase dock."
		rew.add_theme_font_size_override("font_size", 18)
		rew.add_theme_color_override("font_color", Color(1.0, 0.9, 0.3))
		rew.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vb.add_child(rew)
	else:
		var def_lbl := Label.new()
		def_lbl.text = "Dominion forces overwhelmed your armada.\nEmergency reserves dispatched."
		def_lbl.add_theme_font_size_override("font_size", 16)
		def_lbl.add_theme_color_override("font_color", Color(0.85, 0.7, 0.7))
		def_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vb.add_child(def_lbl)

	if victory:
		var warp_btn := Button.new()
		warp_btn.text = "🚀 Engage Warp to Planet Surface"
		warp_btn.custom_minimum_size = Vector2(340, 55)
		warp_btn.add_theme_font_size_override("font_size", 18)
		warp_btn.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5))
		warp_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world_colony.tscn"))
		vb.add_child(warp_btn)

		var fleet_btn := Button.new()
		fleet_btn.text = "↩ Return to Fleet Command"
		fleet_btn.custom_minimum_size = Vector2(340, 45)
		fleet_btn.add_theme_font_size_override("font_size", 16)
		fleet_btn.add_theme_color_override("font_color", Color(0.3, 0.8, 1.0))
		fleet_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/fleet_manager.tscn"))
		vb.add_child(fleet_btn)
	else:
		var return_btn := Button.new()
		return_btn.text = "Return to Starbase Fleet Commander"
		return_btn.custom_minimum_size = Vector2(340, 55)
		return_btn.add_theme_font_size_override("font_size", 18)
		return_btn.add_theme_color_override("font_color", Color(0.3, 0.8, 1.0))
		return_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/fleet_manager.tscn"))
		vb.add_child(return_btn)

	if not victory:
		var reset_btn := Button.new()
		reset_btn.text = "Recommission Fresh Squadron"
		reset_btn.custom_minimum_size = Vector2(340, 45)
		reset_btn.add_theme_font_size_override("font_size", 15)
		reset_btn.pressed.connect(func():
			GameData.credits = 1000
			GameData.player_fleet = [
				GameData.create_ship_instance("fighter"),
				GameData.create_ship_instance("interceptor")
			]
			get_tree().change_scene_to_file("res://scenes/fleet_manager.tscn")
		)
		vb.add_child(reset_btn)
