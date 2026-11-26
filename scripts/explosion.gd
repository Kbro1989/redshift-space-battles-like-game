extends Node3D

var _duration: float = 1.3
var _size: float = 1.0
var _time: float = 0.0
var _particles: Array = []
var _lights: Array = []

func _ready() -> void:
	pass

func init(size: float = 1.0) -> void:
	_size = size
	_duration = 0.8 + size * 0.35
	_spawn()

func _spawn() -> void:
	var rng := RandomNumberGenerator.new()
	rng.randomize()

	# Core bright light flash
	var flash := OmniLight3D.new()
	flash.light_color = Color(1.0, 0.7, 0.25)
	flash.light_energy = 12.0 * _size
	flash.omni_range = 22.0 * _size
	add_child(flash)
	_lights.append(flash)

	# Warm ambient glow
	var warm := OmniLight3D.new()
	warm.light_color = Color(1.0, 0.25, 0.05)
	warm.light_energy = 6.0 * _size
	warm.omni_range = 15.0 * _size
	add_child(warm)
	_lights.append(warm)

	# Fireball shockwave sphere expanding
	var shock := MeshInstance3D.new()
	var ss := SphereMesh.new()
	ss.radius = 0.5 * _size
	ss.height = ss.radius * 2.0
	shock.mesh = ss
	var smat := StandardMaterial3D.new()
	smat.albedo_color = Color(1.0, 0.5, 0.1, 0.85)
	smat.emission_enabled = true
	smat.emission = Color(1.0, 0.6, 0.2)
	smat.emission_energy_multiplier = 4.0
	smat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	shock.material_override = smat
	shock.set_meta("shockwave", true)
	shock.set_meta("growth", 14.0 * _size)
	add_child(shock)
	_particles.append(shock)

	# Debris & sparks
	var count: int = int(18.0 + _size * 12.0)
	for _i in count:
		var mi := MeshInstance3D.new()
		var sm := SphereMesh.new()
		sm.radius = rng.randf_range(0.06, 0.35) * _size
		sm.height = sm.radius * 2.0
		mi.mesh = sm

		var t := rng.randf()
		var m := StandardMaterial3D.new()
		m.albedo_color = Color(1.0, 0.4 + 0.5 * t, 0.1 * t)
		m.emission_enabled = true
		m.emission = m.albedo_color
		m.emission_energy_multiplier = rng.randf_range(2.5, 7.0)
		mi.material_override = m

		var vel := Vector3(
			rng.randf_range(-1.0, 1.0),
			rng.randf_range(-0.8, 0.8),
			rng.randf_range(-1.0, 1.0)
		).normalized() * rng.randf_range(3.0, 12.0) * _size

		mi.set_meta("vel", vel)
		mi.set_meta("spin", Vector3(rng.randf_range(-6, 6), rng.randf_range(-6, 6), rng.randf_range(-6, 6)))
		add_child(mi)
		_particles.append(mi)

func _process(delta: float) -> void:
	_time += delta
	var t: float = _time / _duration
	if t >= 1.0:
		queue_free()
		return
	var fade: float = 1.0 - t * t

	for light in _lights:
		if is_instance_valid(light):
			(light as OmniLight3D).light_energy = (light as OmniLight3D).light_energy * maxf(0.0, 1.0 - delta * 4.0)

	for p in _particles:
		if not is_instance_valid(p):
			continue
		if p.has_meta("shockwave"):
			var cur_scale: float = p.scale.x + float(p.get_meta("growth")) * delta
			p.scale = Vector3.ONE * cur_scale
			if p.material_override:
				p.material_override.albedo_color.a = fade * 0.7
		else:
			var vel: Vector3 = p.get_meta("vel")
			p.position += vel * delta
			p.rotation += (p.get_meta("spin") as Vector3) * delta
			p.set_meta("vel", vel * maxf(0.0, 1.0 - delta * 2.5))
			p.scale = Vector3.ONE * maxf(0.02, (1.0 - t) * (1.0 + _size * 0.2))
