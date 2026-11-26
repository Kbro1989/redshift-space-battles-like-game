extends Node

# AssetCache: Centralized 3D asset, material palette, and procedural terrain registry.
# Modeled after the caching and landscape buffer architecture of openrsc-vinilla (rsmv/src/3d).

var _materials: Dictionary = {}
var _meshes: Dictionary = {}

class HeightmapGrid:
	var width: int = 48
	var depth: int = 48
	var tile_size: float = 3.5
	var origin_x: float = -84.0
	var origin_z: float = -84.0
	var heights: Array = []
	var normals: Array = []

	func _init(w: int = 48, d: int = 48, t_size: float = 3.5) -> void:
		width = w
		depth = d
		tile_size = t_size
		origin_x = -float(width) * tile_size * 0.5
		origin_z = -float(depth) * tile_size * 0.5
		heights.resize(width * depth)
		normals.resize(width * depth)

	func get_grid_height(gx: int, gz: int) -> float:
		gx = clampi(gx, 0, width - 1)
		gz = clampi(gz, 0, depth - 1)
		return heights[gz * width + gx]

	func set_grid_height(gx: int, gz: int, h: float) -> void:
		if gx >= 0 and gx < width and gz >= 0 and gz < depth:
			heights[gz * width + gx] = h

	func sample_height(world_x: float, world_z: float) -> float:
		var lx: float = (world_x - origin_x) / tile_size
		var lz: float = (world_z - origin_z) / tile_size
		var gx0: int = clampi(int(floor(lx)), 0, width - 2)
		var gz0: int = clampi(int(floor(lz)), 0, depth - 2)
		var gx1: int = gx0 + 1
		var gz1: int = gz0 + 1

		var fx: float = clampf(lx - float(gx0), 0.0, 1.0)
		var fz: float = clampf(lz - float(gz0), 0.0, 1.0)

		var h00: float = get_grid_height(gx0, gz0)
		var h10: float = get_grid_height(gx1, gz0)
		var h01: float = get_grid_height(gx0, gz1)
		var h11: float = get_grid_height(gx1, gz1)

		var h0: float = lerpf(h00, h10, fx)
		var h1: float = lerpf(h01, h11, fx)
		return lerpf(h0, h1, fz)

	func sample_normal(world_x: float, world_z: float) -> Vector3:
		var delta: float = 0.5
		var hL: float = sample_height(world_x - delta, world_z)
		var hR: float = sample_height(world_x + delta, world_z)
		var hD: float = sample_height(world_x, world_z - delta)
		var hU: float = sample_height(world_x, world_z + delta)

		var dx := Vector3(2.0 * delta, hR - hL, 0.0)
		var dz := Vector3(0.0, hU - hD, 2.0 * delta)
		return dz.cross(dx).normalized()

	func generate_surface(seed_val: int, base_color: Color) -> ArrayMesh:
		var rng := RandomNumberGenerator.new()
		rng.seed = seed_val

		# 1. Compute multi-frequency heightmap elevation
		for gz in depth:
			for gx in width:
				var wx: float = origin_x + float(gx) * tile_size
				var wz: float = origin_z + float(gz) * tile_size
				var dist_from_center: float = sqrt(wx * wx + wz * wz)

				# Rolling ridges & crater depressions
				var wave1: float = sin(wx * 0.045 + 1.2) * cos(wz * 0.045 - 0.7) * 4.8
				var wave2: float = sin(wx * 0.09 - 0.5) * sin(wz * 0.08 + 0.3) * 2.2
				var wave3: float = cos(wx * 0.18 + wz * 0.15) * 1.1

				# Crater basin around (25, 20)
				var c_dist: float = sqrt(pow(wx - 28.0, 2) + pow(wz - 22.0, 2))
				var crater: float = 0.0
				if c_dist < 18.0:
					crater = -4.5 * (1.0 - (c_dist / 18.0)) + sin(c_dist * 0.8) * 1.5

				var elev: float = wave1 + wave2 + wave3 + crater

				# Flatten central landing pad and colony settlement area (radius < 26.0)
				if dist_from_center < 16.0:
					elev = 0.0
				elif dist_from_center < 28.0:
					var blend: float = (dist_from_center - 16.0) / 12.0
					elev = lerpf(0.0, elev, blend * blend)

				set_grid_height(gx, gz, elev)

		# 2. Compute smooth vertex normals using adjacent height differentials
		for gz in depth:
			for gx in width:
				var hL: float = get_grid_height(gx - 1, gz)
				var hR: float = get_grid_height(gx + 1, gz)
				var hD: float = get_grid_height(gx, gz - 1)
				var hU: float = get_grid_height(gx, gz + 1)
				var dx := Vector3(2.0 * tile_size, hR - hL, 0.0)
				var dz := Vector3(0.0, hU - hD, 2.0 * tile_size)
				normals[gz * width + gx] = dz.cross(dx).normalized()

		# 3. Assemble indexed geometry buffers
		var st := SurfaceTool.new()
		st.begin(Mesh.PRIMITIVE_TRIANGLES)

		for gz in range(depth - 1):
			for gx in range(width - 1):
				var i00: int = gz * width + gx
				var i10: int = gz * width + (gx + 1)
				var i01: int = (gz + 1) * width + gx
				var i11: int = (gz + 1) * width + (gx + 1)

				var wx0: float = origin_x + float(gx) * tile_size
				var wz0: float = origin_z + float(gz) * tile_size
				var wx1: float = wx0 + tile_size
				var wz1: float = wz0 + tile_size

				var p00 := Vector3(wx0, heights[i00], wz0)
				var p10 := Vector3(wx1, heights[i10], wz0)
				var p01 := Vector3(wx0, heights[i01], wz1)
				var p11 := Vector3(wx1, heights[i11], wz1)

				var n00: Vector3 = normals[i00]
				var n10: Vector3 = normals[i10]
				var n01: Vector3 = normals[i01]
				var n11: Vector3 = normals[i11]

				var uv00 := Vector2(float(gx) / float(width), float(gz) / float(depth))
				var uv10 := Vector2(float(gx + 1) / float(width), float(gz) / float(depth))
				var uv01 := Vector2(float(gx) / float(width), float(gz + 1) / float(depth))
				var uv11 := Vector2(float(gx + 1) / float(width), float(gz + 1) / float(depth))

				# Procedural terrain color tint based on elevation and slope
				var col00: Color = _calc_vertex_color(p00.y, n00.y, base_color)
				var col10: Color = _calc_vertex_color(p10.y, n10.y, base_color)
				var col01: Color = _calc_vertex_color(p01.y, n01.y, base_color)
				var col11: Color = _calc_vertex_color(p11.y, n11.y, base_color)

				# Triangle 1: p00 -> p10 -> p01
				st.set_color(col00); st.set_uv(uv00); st.set_normal(n00); st.add_vertex(p00)
				st.set_color(col10); st.set_uv(uv10); st.set_normal(n10); st.add_vertex(p10)
				st.set_color(col01); st.set_uv(uv01); st.set_normal(n01); st.add_vertex(p01)

				# Triangle 2: p10 -> p11 -> p01
				st.set_color(col10); st.set_uv(uv10); st.set_normal(n10); st.add_vertex(p10)
				st.set_color(col11); st.set_uv(uv11); st.set_normal(n11); st.add_vertex(p11)
				st.set_color(col01); st.set_uv(uv01); st.set_normal(n01); st.add_vertex(p01)

		st.index()
		return st.commit()

	func _calc_vertex_color(elevation: float, slope_dot: float, base_col: Color) -> Color:
		var c: Color = base_col
		if slope_dot < 0.75:
			# Steep crag/rock face
			c = c.darkened(0.4)
		elif elevation < -1.5:
			# Mineral basin / depression
			c = Color(0.2, 0.45, 0.55).blend(c.darkened(0.2))
		elif elevation > 3.0:
			# High ridge
			c = c.lightened(0.25)
		return c

func get_material(key: String, col: Color = Color.WHITE, metal: float = 0.6, rough: float = 0.4, emit: Color = Color.BLACK, emit_e: float = 0.0, alpha: float = 1.0) -> StandardMaterial3D:
	if _materials.has(key):
		return _materials[key]

	var m := StandardMaterial3D.new()
	m.albedo_color = Color(col.r, col.g, col.b, alpha)
	m.metallic = metal
	m.roughness = rough
	if emit_e > 0.0:
		m.emission_enabled = true
		m.emission = emit
		m.emission_energy_multiplier = emit_e
	if alpha < 0.999:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.vertex_color_use_as_albedo = true

	_materials[key] = m
	return m

func get_mesh(key: String, factory: Callable) -> Mesh:
	if _meshes.has(key):
		return _meshes[key]
	var m: Mesh = factory.call()
	_meshes[key] = m
	return m

func create_heightmap_terrain(width: int = 48, depth: int = 48, tile_size: float = 3.5) -> HeightmapGrid:
	return HeightmapGrid.new(width, depth, tile_size)
