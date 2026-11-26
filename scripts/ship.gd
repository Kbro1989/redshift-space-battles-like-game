extends Node3D
class_name Ship

signal died(ship: Ship)
signal health_changed(hull: float, hull_max: float, shield: float, shield_max: float)

var ship_data: Dictionary = {}
var is_player_ship: bool = true

var hull_current: float = 100.0
var hull_max: float = 100.0
var shield_current: float = 50.0
var shield_max: float = 50.0
var move_speed: float = 12.0
var damage: float = 20.0
var attack_range: float = 35.0
var fire_rate: float = 1.5
var damage_resistance: float = 0.45 # 45% armor resistance on player ships

var target: Ship = null
var _is_dead: bool = false
var _fire_timer: float = 0.0
var _time: float = 0.0

var is_player_controlled: bool = false
var auto_pilot_enabled: bool = false
var manual_throttle: float = 0.0
var manual_steer_yaw: float = 0.0
var manual_steer_pitch: float = 0.0
var manual_roll: float = 0.0
var is_boosting: bool = false
var current_combat_speed: float = 0.0

var _mesh_root: Node3D
var _health_label: Label3D
var _laser_scene: PackedScene
var _exp_scene: PackedScene
var _engine_lights: Array = []

const LASER_SCENE := "res://scenes/effects/laser_bolt.tscn"
const EXP_SCENE   := "res://scenes/effects/explosion.tscn"

func _ready() -> void:
	_laser_scene = load(LASER_SCENE)
	_exp_scene = load(EXP_SCENE)
	_mesh_root = Node3D.new()
	add_child(_mesh_root)
	_build_visuals()
	_build_health_label()

func init(data: Dictionary, player: bool) -> void:
	ship_data = data
	is_player_ship = player
	hull_max = data.get("hull_max", data.get("hull", 100.0))
	hull_current = data.get("hull_current", hull_max)
	shield_max = data.get("shield_max", data.get("shield", 50.0))
	shield_current = data.get("shield_current", shield_max)
	move_speed = data.get("speed", 12.0)
	damage = data.get("damage", 20.0)
	attack_range = data.get("attack_range", 35.0)
	fire_rate = data.get("fire_rate", 1.5)

func _mat(col: Color, metal: float = 0.7, rough: float = 0.3, emit: Color = Color.BLACK, emit_e: float = 0.0) -> StandardMaterial3D:
	var key: String = "ship_mat_%s_%d_%d_%d" % [col.to_html(false), int(metal * 100), int(rough * 100), int(emit_e * 10)]
	return AssetCache.get_material(key, col, metal, rough, emit, emit_e)

func _add_box(parent: Node3D, size: Vector3, mat: StandardMaterial3D, pos: Vector3 = Vector3.ZERO, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = size
	mi.mesh = bm
	mi.material_override = mat
	mi.position = pos
	mi.rotation_degrees = rot
	parent.add_child(mi)
	return mi

func _add_sphere(parent: Node3D, radius: float, mat: StandardMaterial3D, pos: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = radius
	sm.height = radius * 2.0
	mi.mesh = sm
	mi.material_override = mat
	mi.position = pos
	parent.add_child(mi)
	return mi

func _add_cylinder(parent: Node3D, r_top: float, r_bot: float, height: float, mat: StandardMaterial3D, pos: Vector3 = Vector3.ZERO, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = r_top
	cm.bottom_radius = r_bot
	cm.height = height
	mi.mesh = cm
	mi.material_override = mat
	mi.position = pos
	mi.rotation_degrees = rot
	parent.add_child(mi)
	return mi

func _add_engine(pos: Vector3, r: float = 0.4) -> void:
	var light := OmniLight3D.new()
	light.position = pos
	light.light_color = Color(0.3, 0.7, 1.0) if is_player_ship else Color(1.0, 0.4, 0.1)
	light.light_energy = 2.5
	light.omni_range = r * 6.0
	_mesh_root.add_child(light)
	_engine_lights.append(light)

	var glow := MeshInstance3D.new()
	var sm := SphereMesh.new()
	sm.radius = r * 0.35
	sm.height = sm.radius * 2.0
	glow.mesh = sm
	glow.material_override = _mat(light.light_color, 0.0, 1.0, light.light_color, 5.0)
	glow.position = pos
	_mesh_root.add_child(glow)

func _build_visuals() -> void:
	if not is_player_ship:
		_mesh_root.rotation_degrees.y = 180.0

	var col: Color = ship_data.get("color", Color(0.3, 0.6, 1.0))
	match ship_data.get("type", "fighter"):
		"fighter": _build_fighter(col)
		"interceptor": _build_interceptor(col)
		"cruiser": _build_cruiser(col)
		"battlecruiser": _build_battlecruiser(col)
		"battleship": _build_battleship(col)
		_: _build_fighter(col)

func _build_fighter(col: Color) -> void:
	var hull := _mat(col, 0.6, 0.3)
	var accent := _mat(Color(0.85, 0.9, 0.95), 0.8, 0.2)
	# Fuselage
	_add_box(_mesh_root, Vector3(0.7, 0.35, 2.4), hull)
	# Wings
	_add_box(_mesh_root, Vector3(2.6, 0.09, 1.1), accent, Vector3(0, 0, 0.3))
	# Cockpit canopy
	_add_sphere(_mesh_root, 0.25, _mat(Color(0.1, 0.7, 1.0), 0.1, 0.0, Color(0.1, 0.7, 1.0), 1.2), Vector3(0, 0.25, -0.6))
	# Wingtip cannons
	_add_cylinder(_mesh_root, 0.04, 0.04, 1.0, hull, Vector3(-1.25, 0, -0.1), Vector3(90, 0, 0))
	_add_cylinder(_mesh_root, 0.04, 0.04, 1.0, hull, Vector3(1.25, 0, -0.1), Vector3(90, 0, 0))
	# Thruster
	_add_engine(Vector3(0, 0, 1.3), 0.45)

func _build_interceptor(col: Color) -> void:
	var hull := _mat(col, 0.75, 0.2)
	var dark := _mat(col.darkened(0.4), 0.9, 0.2)
	# Needle nose body
	_add_cylinder(_mesh_root, 0.0, 0.3, 1.8, hull, Vector3(0, 0, -1.0), Vector3(90, 0, 0))
	_add_box(_mesh_root, Vector3(0.5, 0.3, 1.8), hull, Vector3(0, 0, 0.5))
	# Swept forward delta wings
	_add_box(_mesh_root, Vector3(1.8, 0.08, 1.2), dark, Vector3(-0.9, 0, 0.4), Vector3(0, 16, 0))
	_add_box(_mesh_root, Vector3(1.8, 0.08, 1.2), dark, Vector3(0.9, 0, 0.4), Vector3(0, -16, 0))
	# Twin tailfins
	_add_box(_mesh_root, Vector3(0.06, 0.6, 0.8), dark, Vector3(-0.35, 0.35, 1.0), Vector3(0, 0, -15))
	_add_box(_mesh_root, Vector3(0.06, 0.6, 0.8), dark, Vector3(0.35, 0.35, 1.0), Vector3(0, 0, 15))
	# Dual Engines
	_add_engine(Vector3(-0.2, 0, 1.4), 0.35)
	_add_engine(Vector3(0.2, 0, 1.4), 0.35)

func _build_cruiser(col: Color) -> void:
	var hull := _mat(col, 0.6, 0.4)
	var plating := _mat(col.darkened(0.3), 0.7, 0.3)
	var turret := _mat(Color(0.2, 0.22, 0.3), 0.9, 0.2)
	# Main hull chassis
	_add_box(_mesh_root, Vector3(1.8, 0.8, 5.2), hull)
	# Side armor outriggers
	_add_box(_mesh_root, Vector3(0.7, 0.6, 4.0), plating, Vector3(-1.4, 0, 0.2))
	_add_box(_mesh_root, Vector3(0.7, 0.6, 4.0), plating, Vector3(1.4, 0, 0.2))
	# Bridge tower
	_add_box(_mesh_root, Vector3(0.9, 0.5, 1.2), plating, Vector3(0, 0.65, 1.0))
	# Heavy gun turrets
	_add_box(_mesh_root, Vector3(0.5, 0.35, 0.8), turret, Vector3(0, 0.55, -1.2))
	_add_cylinder(_mesh_root, 0.06, 0.06, 1.4, turret, Vector3(-0.15, 0.55, -2.0), Vector3(90, 0, 0))
	_add_cylinder(_mesh_root, 0.06, 0.06, 1.4, turret, Vector3(0.15, 0.55, -2.0), Vector3(90, 0, 0))
	# Engines
	_add_engine(Vector3(-0.6, 0, 2.7), 0.55)
	_add_engine(Vector3(0.6, 0, 2.7), 0.55)

func _build_battlecruiser(col: Color) -> void:
	var hull := _mat(col, 0.65, 0.35)
	var plating := _mat(col.darkened(0.3), 0.8, 0.25)
	var guns := _mat(Color(0.18, 0.2, 0.26), 0.9, 0.15)
	# Sleek capital battlecruiser hull
	_add_box(_mesh_root, Vector3(2.4, 1.0, 6.8), hull)
	# Lateral forward armor wings
	_add_box(_mesh_root, Vector3(0.9, 0.7, 5.0), plating, Vector3(-1.8, 0.1, 0.3), Vector3(0, 5, 0))
	_add_box(_mesh_root, Vector3(0.9, 0.7, 5.0), plating, Vector3(1.8, 0.1, 0.3), Vector3(0, -5, 0))
	# Elevated bridge citadel
	_add_box(_mesh_root, Vector3(1.1, 0.8, 1.6), plating, Vector3(0, 0.9, 1.4))
	# Twin heavy turret mounts
	_add_box(_mesh_root, Vector3(0.8, 0.45, 1.1), guns, Vector3(0, 0.75, -1.6))
	_add_cylinder(_mesh_root, 0.07, 0.07, 1.8, guns, Vector3(-0.22, 0.75, -2.5), Vector3(90, 0, 0))
	_add_cylinder(_mesh_root, 0.07, 0.07, 1.8, guns, Vector3(0.22, 0.75, -2.5), Vector3(90, 0, 0))
	_add_box(_mesh_root, Vector3(0.8, 0.45, 1.1), guns, Vector3(0, 0.75, 0.2))
	_add_cylinder(_mesh_root, 0.07, 0.07, 1.8, guns, Vector3(-0.22, 0.75, -0.7), Vector3(90, 0, 0))
	_add_cylinder(_mesh_root, 0.07, 0.07, 1.8, guns, Vector3(0.22, 0.75, -0.7), Vector3(90, 0, 0))
	# Quad Stern Propulsion Engines
	_add_engine(Vector3(-0.8, 0.2, 3.5), 0.55)
	_add_engine(Vector3(0.8, 0.2, 3.5), 0.55)
	_add_engine(Vector3(-0.4, -0.2, 3.5), 0.5)
	_add_engine(Vector3(0.4, -0.2, 3.5), 0.5)

func _build_battleship(col: Color) -> void:
	var hull := _mat(col, 0.5, 0.5)
	var armor := _mat(col.darkened(0.35), 0.8, 0.3)
	var guns := _mat(Color(0.15, 0.15, 0.2), 0.95, 0.15)
	# Heavy dreadnought superstructure
	_add_box(_mesh_root, Vector3(3.2, 1.4, 8.4), hull)
	# Massive armored broadsides
	_add_box(_mesh_root, Vector3(1.2, 1.1, 7.2), armor, Vector3(-2.3, 0, 0.4))
	_add_box(_mesh_root, Vector3(1.2, 1.1, 7.2), armor, Vector3(2.3, 0, 0.4))
	# Bridge tower command deck
	_add_box(_mesh_root, Vector3(1.4, 1.2, 2.0), armor, Vector3(0, 1.3, 1.6))
	# Triple turret barbettes
	var turret_z = [-2.6, -0.6, 2.8]
	for z_pos in turret_z:
		_add_box(_mesh_root, Vector3(1.1, 0.6, 1.4), guns, Vector3(0, 0.95, z_pos))
		_add_cylinder(_mesh_root, 0.08, 0.08, 2.0, guns, Vector3(-0.3, 0.95, z_pos - 1.4), Vector3(90, 0, 0))
		_add_cylinder(_mesh_root, 0.08, 0.08, 2.0, guns, Vector3(0.3, 0.95, z_pos - 1.4), Vector3(90, 0, 0))
	# Capital Thrusters
	_add_engine(Vector3(-1.1, 0, 4.3), 0.75)
	_add_engine(Vector3(0.0, 0, 4.3), 0.85)
	_add_engine(Vector3(1.1, 0, 4.3), 0.75)

func _build_health_label() -> void:
	_health_label = Label3D.new()
	_health_label.position = Vector3(0, _get_label_height(), 0)
	_health_label.font_size = 28
	_health_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	_health_label.no_depth_test = true
	_update_health_label()
	add_child(_health_label)

func _get_label_height() -> float:
	match ship_data.get("type", "fighter"):
		"battleship": return 4.5
		"battlecruiser": return 3.8
		"cruiser": return 3.0
		_: return 2.2

func _update_health_label() -> void:
	if not is_instance_valid(_health_label):
		return
	var hp_pct := hull_current / hull_max if hull_max > 0.0 else 0.0
	var sh_pct := shield_current / shield_max if shield_max > 0.0 else 0.0
	var hp_bars := int(clampf(hp_pct * 8, 0, 8))
	var sh_bars := int(clampf(sh_pct * 6, 0, 6))
	_health_label.text = (
		"HULL [" + "■".repeat(hp_bars) + "░".repeat(8 - hp_bars) + "]\n" +
		"SHLD [" + "◆".repeat(sh_bars) + "·".repeat(6 - sh_bars) + "]"
	)
	_health_label.modulate = Color(0.3, 1.0, 0.6) if is_player_ship else Color(1.0, 0.4, 0.4)

func _process(delta: float) -> void:
	if _is_dead:
		return
	_time += delta

	# Engine thrust flicker
	for light in _engine_lights:
		if is_instance_valid(light):
			(light as OmniLight3D).light_energy = 2.5 + sin(_time * 8.0) * 0.5

	# Passive shield capacitor recharge for player armada
	if is_player_ship and shield_current < shield_max:
		shield_current = minf(shield_max, shield_current + delta * 3.5)
		_update_health_label()

	# DIRECT MANUAL FLIGHT PILOTING
	if is_player_controlled and not auto_pilot_enabled:
		_process_manual_flight(delta)
		return

	if target == null or not is_instance_valid(target) or target._is_dead:
		# Idle cruising drift if no target
		if is_player_ship:
			global_position += -basis.z * (move_speed * 0.3) * delta
		return

	var dist: float = global_position.distance_to(target.global_position)
	var raw_dir: Vector3 = (target.global_position - global_position).normalized()

	# True 3D kinematic maneuver: climbing/diving vertical oscillation
	var vert_wave: float = sin(_time * 1.8 + float(get_instance_id() % 7)) * 3.5
	var target_3d_pos: Vector3 = target.global_position + Vector3(0, vert_wave, 0)
	var dir_3d: Vector3 = (target_3d_pos - global_position).normalized()

	# Movement & 3D steering with flight banking
	if dist > attack_range * 0.7:
		global_position += dir_3d * move_speed * delta
		if dir_3d != Vector3.ZERO and not dir_3d.is_equal_approx(Vector3.UP) and not dir_3d.is_equal_approx(Vector3.DOWN):
			var target_basis := Basis.looking_at(dir_3d, Vector3.UP)
			# Bank into turn based on yaw rate
			var yaw_diff := -basis.z.cross(dir_3d).y
			var roll_angle := clampf(yaw_diff * 1.4, -0.65, 0.65)
			target_basis = target_basis.rotated(dir_3d, -roll_angle)
			basis = basis.slerp(target_basis, delta * 2.8)
	else:
		# 3D helical strafing & altitude circling
		var tangent := raw_dir.cross(Vector3.UP).normalized()
		var vertical_drift := Vector3.UP * (cos(_time * 2.2 + float(get_instance_id() % 5)) * 0.8)
		global_position += (tangent + vertical_drift).normalized() * (move_speed * 0.45) * delta
		if not raw_dir.is_equal_approx(Vector3.UP) and not raw_dir.is_equal_approx(Vector3.DOWN):
			basis = basis.slerp(Basis.looking_at(raw_dir, Vector3.UP), delta * 3.2)

	# Weapon cycling
	_fire_timer += delta
	var safe_rate := maxf(fire_rate, 0.1)
	if dist <= attack_range and _fire_timer >= (1.0 / safe_rate):
		_fire_timer = 0.0
		_shoot()

func _shoot() -> void:
	if _laser_scene == null or target == null:
		return
	var bolt: Node3D = _laser_scene.instantiate()
	get_parent().add_child(bolt)
	var fire_origin := global_position - basis.z * (2.0 if is_player_ship else -2.0)
	bolt.global_position = fire_origin
	var dir := (target.global_position - fire_origin).normalized()

	# Inaccuracy spread for enemy vessels (prevents laser-aimbot insta-kills)
	if not is_player_ship:
		var spread := Vector3(
			randf_range(-0.16, 0.16),
			randf_range(-0.14, 0.14),
			randf_range(-0.16, 0.16)
		)
		dir = (dir + spread).normalized()

	if bolt.has_method("init"):
		bolt.call("init", dir, damage, is_player_ship, target)

func _process_manual_flight(delta: float) -> void:
	# Flight attitude rotation
	rotate_object_local(Vector3.UP, -manual_steer_yaw * delta * 2.2)
	rotate_object_local(Vector3.RIGHT, -manual_steer_pitch * delta * 2.0)
	rotate_object_local(Vector3.FORWARD, manual_roll * delta * 2.5)

	# Combat speed & afterburner boost
	var speed_multiplier: float = 1.8 if is_boosting else 1.0
	var target_speed: float = move_speed * manual_throttle * speed_multiplier
	current_combat_speed = lerpf(current_combat_speed, target_speed, delta * 4.0)

	# Move forward in local orientation
	global_position += -basis.z * current_combat_speed * delta

	# Boost thruster FX
	for light in _engine_lights:
		if is_instance_valid(light):
			var target_energy: float = 6.0 if is_boosting else (2.5 + sin(_time * 8.0) * 0.5)
			(light as OmniLight3D).light_energy = lerpf((light as OmniLight3D).light_energy, target_energy, delta * 6.0)

	_fire_timer += delta

func manual_fire_primary() -> bool:
	if _is_dead or _laser_scene == null:
		return false
	var safe_rate := maxf(fire_rate, 0.1)
	if _fire_timer < (1.0 / safe_rate):
		return false
	_fire_timer = 0.0

	var bolt: Node3D = _laser_scene.instantiate()
	get_parent().add_child(bolt)
	var fire_origin := global_position - basis.z * 2.2
	bolt.global_position = fire_origin

	var fire_dir := -basis.z
	if is_instance_valid(target) and not target._is_dead:
		var to_tgt := (target.global_position - fire_origin).normalized()
		if fire_dir.dot(to_tgt) > 0.4:
			fire_dir = fire_dir.lerp(to_tgt, 0.4).normalized()

	if bolt.has_method("init"):
		bolt.call("init", fire_dir, damage, true, target)
	return true

func manual_fire_missile() -> bool:
	if _is_dead or _laser_scene == null:
		return false
	var bolt: Node3D = _laser_scene.instantiate()
	get_parent().add_child(bolt)
	var fire_origin := global_position - basis.z * 2.5
	bolt.global_position = fire_origin
	bolt.scale = Vector3(1.8, 1.8, 1.8)
	var fire_dir := -basis.z
	if is_instance_valid(target) and not target._is_dead:
		fire_dir = (target.global_position - fire_origin).normalized()
	if bolt.has_method("init"):
		bolt.call("init", fire_dir, damage * 2.4, true, target)
	return true

func take_damage(amount: float) -> void:
	if _is_dead:
		return

	# Apply armor damage resistance to player ships
	if is_player_ship:
		amount *= (1.0 - damage_resistance)

	if shield_current > 0.0:
		var absorbed := minf(shield_current, amount)
		shield_current -= absorbed
		amount -= absorbed
	if amount > 0.0:
		hull_current -= amount
		_flash_red()
	hull_current = maxf(hull_current, 0.0)
	_update_health_label()
	health_changed.emit(hull_current, hull_max, shield_current, shield_max)
	if hull_current <= 0.0:
		_die()

func _flash_red() -> void:
	var tw := create_tween()
	tw.tween_property(_mesh_root, "scale", Vector3(1.08, 1.08, 1.08), 0.05)
	tw.tween_property(_mesh_root, "scale", Vector3.ONE, 0.08)

func _die() -> void:
	if _is_dead:
		return
	_is_dead = true
	if _exp_scene:
		var exp_node: Node3D = _exp_scene.instantiate()
		get_parent().add_child(exp_node)
		exp_node.global_position = global_position
		if exp_node.has_method("init"):
			exp_node.call("init", _ship_size())
	died.emit(self)
	queue_free()

func _ship_size() -> float:
	match ship_data.get("type", "fighter"):
		"interceptor": return 1.2
		"cruiser": return 2.6
		"battlecruiser": return 3.8
		"battleship": return 4.8
		_: return 1.0
