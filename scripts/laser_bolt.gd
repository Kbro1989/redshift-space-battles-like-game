extends Node3D

var direction: Vector3 = Vector3.FORWARD
var speed: float = 80.0
var damage: float = 20.0
var is_player: bool = true
var target: Node3D = null

var _time: float = 0.0
var _mesh: MeshInstance3D
var _light: OmniLight3D

const LIFETIME: float = 4.0

func _ready() -> void:
	_build_visuals()

func init(dir: Vector3, dmg: float, player: bool, tgt: Node3D) -> void:
	direction = dir.normalized()
	damage = dmg
	is_player = player
	target = tgt
	if direction != Vector3.ZERO and not direction.is_equal_approx(Vector3.UP) and not direction.is_equal_approx(Vector3.DOWN):
		look_at(global_position + direction, Vector3.UP)
	_apply_color()

func _build_visuals() -> void:
	_mesh = MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.05
	cyl.bottom_radius = 0.05
	cyl.height = 1.8
	_mesh.mesh = cyl
	_mesh.rotation_degrees = Vector3(90, 0, 0)
	add_child(_mesh)

	_light = OmniLight3D.new()
	_light.omni_range = 4.0
	_light.light_energy = 2.5
	add_child(_light)

	_apply_color()

func _apply_color() -> void:
	var col := Color(0.2, 0.8, 1.0) if is_player else Color(1.0, 0.35, 0.1)
	if is_instance_valid(_mesh):
		var m := StandardMaterial3D.new()
		m.albedo_color = col
		m.emission_enabled = true
		m.emission = col
		m.emission_energy_multiplier = 4.0
		_mesh.material_override = m
	if is_instance_valid(_light):
		_light.light_color = col

func _process(delta: float) -> void:
	_time += delta

	# Micro-guidance only for player lasers; enemy lasers fire ballistic 3D streaks
	if is_player and is_instance_valid(target) and not target.is_queued_for_deletion():
		var to_tgt := (target.global_position - global_position).normalized()
		direction = direction.lerp(to_tgt, delta * 1.5).normalized()
		if direction != Vector3.ZERO and not direction.is_equal_approx(Vector3.UP) and not direction.is_equal_approx(Vector3.DOWN):
			look_at(global_position + direction, Vector3.UP)

	global_position += direction * speed * delta

	# Impact check with realistic physical hit radius
	if is_instance_valid(target) and not target.is_queued_for_deletion():
		var hit_radius: float = 2.0
		if target.has_method("_ship_size"):
			hit_radius = float(target.call("_ship_size")) * 1.2
		if global_position.distance_to(target.global_position) < hit_radius:
			_on_hit()
			return

	if _time >= LIFETIME:
		queue_free()

func _on_hit() -> void:
	if is_instance_valid(target) and target.has_method("take_damage"):
		target.take_damage(damage)
	queue_free()
