extends Control

var _credits_label: Label
var _res_label: Label
var _stats_label: Label
var _fleet_power_label: Label
var _fleet_container: VBoxContainer
var _shop_container: VBoxContainer
var _colony_container: VBoxContainer
var _officers_container: VBoxContainer
var _schematics_container: VBoxContainer
var _sectors_container: VBoxContainer
var _missions_container: VBoxContainer
var _ladder_container: VBoxContainer
var _base_container: VBoxContainer
var _status_label: Label

var _base_upgrades: Dictionary = {
	"shields": {"name": "Defense Shield Grid", "level": 1, "cost": 300, "desc": "+10% Shield capacity to all fleet ships"},
	"foundry": {"name": "Nanite Repair Bay", "level": 1, "cost": 450, "desc": "Repairs ships automatically post-combat"},
	"refinery": {"name": "Helium-3 Harvester", "level": 1, "cost": 500, "desc": "+25% Mission credits bounty yield"},
	"sensor": {"name": "Long-Range Tachyonic Sensor", "level": 1, "cost": 350, "desc": "+15% Weapon range targeting telemetry"}
}

func _ready() -> void:
	_build_ui()
	_refresh()

func _build_ui() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	var bg := ColorRect.new()
	bg.color = Color(0.012, 0.018, 0.035)
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var root_vb := VBoxContainer.new()
	root_vb.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root_vb.add_theme_constant_override("separation", 6)
	add_child(root_vb)

	# TOP BAR
	var top_panel := _make_panel(Color(0.04, 0.07, 0.14))
	top_panel.custom_minimum_size = Vector2(0, 60)
	root_vb.add_child(top_panel)

	var top_hb := HBoxContainer.new()
	top_hb.add_theme_constant_override("separation", 18)
	top_panel.add_child(top_hb)

	var title := Label.new()
	title.text = "⬢ REDSHIFT STARBASE COMMAND"
	title.add_theme_font_size_override("font_size", 22)
	title.add_theme_color_override("font_color", Color(0.3, 0.8, 1.0))
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_hb.add_child(title)

	_credits_label = Label.new()
	_credits_label.add_theme_font_size_override("font_size", 18)
	_credits_label.add_theme_color_override("font_color", Color(1.0, 0.9, 0.3))
	top_hb.add_child(_credits_label)

	_res_label = Label.new()
	_res_label.add_theme_font_size_override("font_size", 14)
	_res_label.add_theme_color_override("font_color", Color(0.4, 0.9, 1.0))
	top_hb.add_child(_res_label)

	_stats_label = Label.new()
	_stats_label.add_theme_font_size_override("font_size", 16)
	_stats_label.add_theme_color_override("font_color", Color(0.7, 0.85, 1.0))
	top_hb.add_child(_stats_label)

	var menu_btn := Button.new()
	menu_btn.text = "Main Menu"
	menu_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/main_menu.tscn"))
	top_hb.add_child(menu_btn)

	# MAIN TAB SYSTEM
	var tab_container := TabContainer.new()
	tab_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root_vb.add_child(tab_container)

	# TAB 1: FLEET & SHIPYARD
	var fleet_tab := HBoxContainer.new()
	fleet_tab.name = "🚀 Armada"
	fleet_tab.add_theme_constant_override("separation", 10)
	tab_container.add_child(fleet_tab)

	# Left: Your Fleet
	var f_panel := _make_panel(Color(0.02, 0.04, 0.09))
	f_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fleet_tab.add_child(f_panel)

	var f_vb := VBoxContainer.new()
	f_vb.add_theme_constant_override("separation", 8)
	f_panel.add_child(f_vb)

	var f_hdr := Label.new()
	f_hdr.text = "ACTIVE FLEET ARMADA"
	f_hdr.add_theme_font_size_override("font_size", 18)
	f_hdr.add_theme_color_override("font_color", Color(0.4, 1.0, 0.6))
	f_vb.add_child(f_hdr)

	_fleet_power_label = Label.new()
	_fleet_power_label.add_theme_font_size_override("font_size", 13)
	_fleet_power_label.add_theme_color_override("font_color", Color(0.6, 0.85, 1.0))
	f_vb.add_child(_fleet_power_label)

	var f_scroll := ScrollContainer.new()
	f_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	f_vb.add_child(f_scroll)

	_fleet_container = VBoxContainer.new()
	_fleet_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_fleet_container.add_theme_constant_override("separation", 6)
	f_scroll.add_child(_fleet_container)

	# Right: Quick Shop
	var s_panel := _make_panel(Color(0.02, 0.04, 0.09))
	s_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fleet_tab.add_child(s_panel)

	var s_vb := VBoxContainer.new()
	s_vb.add_theme_constant_override("separation", 8)
	s_panel.add_child(s_vb)

	var s_hdr := Label.new()
	s_hdr.text = "RAPID REINFORCEMENTS"
	s_hdr.add_theme_font_size_override("font_size", 18)
	s_hdr.add_theme_color_override("font_color", Color(1.0, 0.75, 0.3))
	s_vb.add_child(s_hdr)

	var s_scroll := ScrollContainer.new()
	s_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	s_vb.add_child(s_scroll)

	_shop_container = VBoxContainer.new()
	_shop_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_shop_container.add_theme_constant_override("separation", 8)
	s_scroll.add_child(_shop_container)

	# TAB 2: PLANETARY COLONY & WORLD LANDING
	var col_tab := VBoxContainer.new()
	col_tab.name = "🌍 Planetary Outpost"
	col_tab.add_theme_constant_override("separation", 10)
	tab_container.add_child(col_tab)

	var col_desc := Label.new()
	col_desc.text = "Land directly onto extraterrestrial world surfaces. Manage deep-core geothermal drills, bio-domes, and surface flak batteries."
	col_desc.add_theme_font_size_override("font_size", 14)
	col_desc.add_theme_color_override("font_color", Color(0.4, 0.95, 0.7))
	col_tab.add_child(col_desc)

	var col_scroll := ScrollContainer.new()
	col_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	col_tab.add_child(col_scroll)

	_colony_container = VBoxContainer.new()
	_colony_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_colony_container.add_theme_constant_override("separation", 10)
	col_scroll.add_child(_colony_container)

	# TAB 3: CREW & OFFICER ACADEMY
	var off_tab := VBoxContainer.new()
	off_tab.name = "👨‍🚀 Officers & Crew"
	off_tab.add_theme_constant_override("separation", 10)
	tab_container.add_child(off_tab)

	var off_desc := Label.new()
	off_desc.text = "Recruit distinguished naval officers to grant fleet-wide passive combat buffs in laser damage, evasion velocity, and shield modulation."
	off_desc.add_theme_font_size_override("font_size", 14)
	off_desc.add_theme_color_override("font_color", Color(0.8, 0.85, 1.0))
	off_tab.add_child(off_desc)

	var off_scroll := ScrollContainer.new()
	off_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	off_tab.add_child(off_scroll)

	_officers_container = VBoxContainer.new()
	_officers_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_officers_container.add_theme_constant_override("separation", 10)
	off_scroll.add_child(_officers_container)

	# TAB 4: SCHEMATICS & WORKSHOP
	var sch_tab := VBoxContainer.new()
	sch_tab.name = "📜 Workshop & Schematics"
	sch_tab.add_theme_constant_override("separation", 10)
	tab_container.add_child(sch_tab)

	var sch_desc := Label.new()
	sch_desc.text = "Manufacture experimental warship components and unlock capital ship blueprints using extracted metals, crystals, and helium-3."
	sch_desc.add_theme_font_size_override("font_size", 14)
	sch_desc.add_theme_color_override("font_color", Color(1.0, 0.85, 0.4))
	sch_tab.add_child(sch_desc)

	var sch_scroll := ScrollContainer.new()
	sch_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sch_tab.add_child(sch_scroll)

	_schematics_container = VBoxContainer.new()
	_schematics_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_schematics_container.add_theme_constant_override("separation", 10)
	sch_scroll.add_child(_schematics_container)

	# TAB 5: SECTOR MAP & PLANETARY RAIDS
	var sec_tab := VBoxContainer.new()
	sec_tab.name = "🌌 Sectors & Raids"
	sec_tab.add_theme_constant_override("separation", 10)
	tab_container.add_child(sec_tab)

	var sec_desc := Label.new()
	sec_desc.text = "Navigate contested star sectors and deploy your armada to raid rival syndicates or confront cooperative space-time rifts."
	sec_desc.add_theme_font_size_override("font_size", 14)
	sec_desc.add_theme_color_override("font_color", Color(0.9, 0.6, 1.0))
	sec_tab.add_child(sec_desc)

	var sec_scroll := ScrollContainer.new()
	sec_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sec_tab.add_child(sec_scroll)

	_sectors_container = VBoxContainer.new()
	_sectors_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_sectors_container.add_theme_constant_override("separation", 10)
	sec_scroll.add_child(_sectors_container)

	# TAB 6: STARBASE EXPANSION
	var base_tab := VBoxContainer.new()
	base_tab.name = "🏛 Starbase Expansion"
	base_tab.add_theme_constant_override("separation", 10)
	tab_container.add_child(base_tab)

	var b_desc := Label.new()
	b_desc.text = "Expand orbital defense grids, nanite repair bays, and tachyonic telemetry scanners."
	b_desc.add_theme_font_size_override("font_size", 14)
	b_desc.add_theme_color_override("font_color", Color(0.7, 0.8, 0.9))
	base_tab.add_child(b_desc)

	var b_scroll := ScrollContainer.new()
	b_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	base_tab.add_child(b_scroll)

	_base_container = VBoxContainer.new()
	_base_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_base_container.add_theme_constant_override("separation", 10)
	b_scroll.add_child(_base_container)

	# TAB 7: MISSIONS & LADDER
	var miss_tab := VBoxContainer.new()
	miss_tab.name = "⚔ Warzone & Ladder"
	miss_tab.add_theme_constant_override("separation", 8)
	tab_container.add_child(miss_tab)

	var m_desc := Label.new()
	m_desc.text = "Standard tactical campaign ops and competitive Fleet Ladder League combat trials."
	m_desc.add_theme_font_size_override("font_size", 14)
	m_desc.add_theme_color_override("font_color", Color(0.9, 0.7, 0.5))
	miss_tab.add_child(m_desc)

	var m_scroll := ScrollContainer.new()
	m_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	miss_tab.add_child(m_scroll)

	_missions_container = VBoxContainer.new()
	_missions_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_missions_container.add_theme_constant_override("separation", 8)
	m_scroll.add_child(_missions_container)

	# BOTTOM STATUS BAR
	_status_label = Label.new()
	_status_label.custom_minimum_size = Vector2(0, 32)
	_status_label.add_theme_font_size_override("font_size", 14)
	_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root_vb.add_child(_status_label)

func _make_panel(bg: Color) -> PanelContainer:
	var pc := PanelContainer.new()
	var sty := StyleBoxFlat.new()
	sty.bg_color = bg
	sty.border_color = Color(0.18, 0.28, 0.5, 0.6)
	sty.set_border_width_all(1)
	sty.set_corner_radius_all(6)
	sty.set_content_margin_all(10)
	pc.add_theme_stylebox_override("panel", sty)
	return pc

func _refresh() -> void:
	var gd = GameData
	_credits_label.text = "⚡ %d Credits" % gd.credits
	_res_label.text = "Metal: %d | Crystal: %d | He-3: %d" % [gd.metal, gd.crystal, gd.helium3]
	_stats_label.text = "Record: %d W / %d L | 🏆 %d ELO" % [gd.victories, gd.total_battles - gd.victories, gd.ladder_rating]
	_fleet_power_label.text = "Armada Rating: %d Power" % gd.get_fleet_power()

	_clear_children(_fleet_container)
	_clear_children(_shop_container)
	_clear_children(_colony_container)
	_clear_children(_officers_container)
	_clear_children(_schematics_container)
	_clear_children(_sectors_container)
	_clear_children(_base_container)
	_clear_children(_missions_container)

	# Populate fleet
	if gd.player_fleet.is_empty():
		var lbl := Label.new()
		lbl.text = "No vessels in hangar! Recruit ships from the Roster."
		lbl.add_theme_color_override("font_color", Color(0.6, 0.6, 0.6))
		_fleet_container.add_child(lbl)
	else:
		for i in gd.player_fleet.size():
			_add_fleet_row(gd.player_fleet[i], i)

	# Populate shop
	for type_key in GameData.SHIP_TYPES.keys():
		_add_shop_row(type_key)

	# Populate planetary colony
	_populate_colony_tab()

	# Populate officers
	for off_key in GameData.OFFICERS_CATALOGUE.keys():
		_add_officer_row(off_key)

	# Populate schematics
	for sch_key in GameData.SCHEMATICS_CATALOGUE.keys():
		_add_schematic_row(sch_key)

	# Populate sectors & raids
	for sec in GameData.SECTORS:
		_add_sector_row(sec)

	# Populate base upgrades
	for up_key in _base_upgrades.keys():
		_add_base_row(up_key)

	# Populate missions & ladder
	for mission in gd.get_available_missions():
		_add_mission_row(mission)
	for opp in GameData.LADDER_OPPONENTS:
		_add_ladder_row(opp)

func _clear_children(c: Control) -> void:
	for child in c.get_children():
		child.queue_free()

func _add_fleet_row(ship: Dictionary, idx: int) -> void:
	var pc := _make_panel(Color(0.04, 0.06, 0.12))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 10)
	pc.add_child(hb)

	var bar := ColorRect.new()
	bar.color = ship.get("color", Color.WHITE)
	bar.custom_minimum_size = Vector2(8, 48)
	hb.add_child(bar)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	name_lbl.text = ship.get("name", "Ship")
	name_lbl.add_theme_font_size_override("font_size", 15)
	name_lbl.add_theme_color_override("font_color", Color(0.9, 0.95, 1.0))
	vb.add_child(name_lbl)

	var stats_lbl := Label.new()
	stats_lbl.text = "Hull: %d/%d  •  Shield: %d/%d  •  DPS: %.0f  •  Spd: %.0f" % [
		ship.get("hull_current", ship.get("hull_max", 100)),
		ship.get("hull_max", 100),
		ship.get("shield_current", ship.get("shield_max", 50)),
		ship.get("shield_max", 50),
		ship.get("damage", 20) * ship.get("fire_rate", 1.5),
		ship.get("speed", 10)
	]
	stats_lbl.add_theme_font_size_override("font_size", 11)
	stats_lbl.add_theme_color_override("font_color", Color(0.4, 0.85, 0.6))
	vb.add_child(stats_lbl)

	var scrap_btn := Button.new()
	scrap_btn.text = "Scrap"
	scrap_btn.custom_minimum_size = Vector2(60, 36)
	scrap_btn.pressed.connect(func():
		var refund = int(GameData.SHIP_TYPES[ship["type"]]["cost"]) / 2
		GameData.player_fleet.remove_at(idx)
		GameData.add_credits(refund)
		_status_label.text = "Vessel decommissioned (+%d credits recovered)" % refund
		_status_label.add_theme_color_override("font_color", Color(0.9, 0.8, 0.4))
		_refresh()
	)
	hb.add_child(scrap_btn)

	_fleet_container.add_child(pc)

func _add_shop_row(type_key: String) -> void:
	var def: Dictionary = GameData.SHIP_TYPES[type_key]
	var pc := _make_panel(Color(0.03, 0.05, 0.1))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 10)
	pc.add_child(hb)

	var bar := ColorRect.new()
	bar.color = def["color"]
	bar.custom_minimum_size = Vector2(8, 54)
	hb.add_child(bar)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	var cap_tag := " [CAPITAL WARSHIP]" if def.get("is_capital", false) else ""
	name_lbl.text = "%s%s — %s" % [def["name"], cap_tag, def["description"]]
	name_lbl.add_theme_font_size_override("font_size", 14)
	name_lbl.add_theme_color_override("font_color", Color(0.9, 0.95, 1.0))
	vb.add_child(name_lbl)

	var stats_lbl := Label.new()
	stats_lbl.text = "Hull: %d  |  Shield: %d  |  Dmg: %.0f  |  Speed: %.0f  |  Range: %.0f" % [
		def["hull"], def["shield"], def["damage"], def["speed"], def["attack_range"]
	]
	stats_lbl.add_theme_font_size_override("font_size", 11)
	stats_lbl.add_theme_color_override("font_color", Color(0.5, 0.8, 0.6))
	vb.add_child(stats_lbl)

	var cost_dict := {
		"credits": int(def["cost"]),
		"metal": int(def.get("metal_cost", 0)),
		"crystal": int(def.get("crystal_cost", 0)),
		"helium3": int(def.get("helium3_cost", 0))
	}

	var req_schematic: String = def.get("requires_schematic", "")
	var has_schematic: bool = req_schematic == "" or GameData.unlocked_schematics.has(req_schematic)

	var buy_btn := Button.new()
	if not has_schematic:
		buy_btn.text = "LOCKED\nNeed Blueprint"
		buy_btn.disabled = true
	else:
		var cost_str := "%d cr" % def["cost"]
		if def.get("metal_cost", 0) > 0:
			cost_str += "\n+%d Metal" % def["metal_cost"]
		buy_btn.text = "Build\n" + cost_str
		buy_btn.disabled = not GameData.can_afford(cost_dict)

	buy_btn.custom_minimum_size = Vector2(95, 48)
	buy_btn.pressed.connect(func():
		if GameData.spend_resources(cost_dict):
			GameData.player_fleet.append(GameData.create_ship_instance(type_key))
			_status_label.text = "Commissioned %s into active armada!" % def["name"]
			_status_label.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5))
			_refresh()
	)
	hb.add_child(buy_btn)

	_shop_container.add_child(pc)

func _populate_colony_tab() -> void:
	var gd = GameData
	var col = gd.colonies[gd.current_colony_id]

	var col_header := _make_panel(Color(0.04, 0.08, 0.16))
	var ch_vb := VBoxContainer.new()
	ch_vb.add_theme_constant_override("separation", 8)
	col_header.add_child(ch_vb)

	var name_lbl := Label.new()
	name_lbl.text = "🌍 CURRENT EXPEDITION SITE: %s" % col["name"].to_upper()
	name_lbl.add_theme_font_size_override("font_size", 17)
	name_lbl.add_theme_color_override("font_color", Color(0.3, 1.0, 0.7))
	ch_vb.add_child(name_lbl)

	var type_lbl := Label.new()
	type_lbl.text = "Classification: %s  •  Atmospheric Defenses: ONLINE" % col["type"]
	type_lbl.add_theme_font_size_override("font_size", 12)
	type_lbl.add_theme_color_override("font_color", Color(0.7, 0.85, 0.95))
	ch_vb.add_child(type_lbl)

	var btn_row := HBoxContainer.new()
	btn_row.add_theme_constant_override("separation", 10)
	ch_vb.add_child(btn_row)

	var land_btn := Button.new()
	land_btn.text = "🔭 TOUCH DOWN ON PLANETARY SURFACE (3D EXPLORATION)"
	land_btn.custom_minimum_size = Vector2(360, 42)
	land_btn.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world_colony.tscn"))
	btn_row.add_child(land_btn)

	var harvest_btn := Button.new()
	harvest_btn.text = "⛏ HARVEST DEEP-CORE MINERAL NODE"
	harvest_btn.custom_minimum_size = Vector2(250, 42)
	harvest_btn.pressed.connect(func():
		var y = GameData.harvest_surface_node(GameData.current_colony_id)
		_status_label.text = "Extracted mineral node (+%d CR, +%d Metal, +%d Crystal/He-3)" % [
			y.get("credits", 0), y.get("metal", 0), y.get("crystal", y.get("helium3", 0))
		]
		_status_label.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5))
		_refresh()
	)
	btn_row.add_child(harvest_btn)

	var switch_btn := Button.new()
	switch_btn.text = "🔄 Change Colony World"
	switch_btn.pressed.connect(func():
		if GameData.current_colony_id == "kepler_186f":
			GameData.current_colony_id = "gliese_667c"
		else:
			GameData.current_colony_id = "kepler_186f"
		_refresh()
	)
	btn_row.add_child(switch_btn)

	_colony_container.add_child(col_header)

	# List colony buildings
	for b_key in col["buildings"].keys():
		var b = col["buildings"][b_key]
		var b_panel := _make_panel(Color(0.02, 0.05, 0.11))
		var bh := HBoxContainer.new()
		bh.add_theme_constant_override("separation", 12)
		b_panel.add_child(bh)

		var b_vb := VBoxContainer.new()
		b_vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		bh.add_child(b_vb)

		var blbl := Label.new()
		blbl.text = "%s (Tier %d)" % [b["name"], b.get("level", 1)]
		blbl.add_theme_font_size_override("font_size", 14)
		blbl.add_theme_color_override("font_color", Color(0.3, 0.85, 1.0))
		b_vb.add_child(blbl)

		var bdesc := Label.new()
		bdesc.text = b.get("desc", "")
		bdesc.add_theme_font_size_override("font_size", 11)
		bdesc.add_theme_color_override("font_color", Color(0.7, 0.75, 0.85))
		b_vb.add_child(bdesc)

		if b.has("cost"):
			var up_btn := Button.new()
			var c = b["cost"]
			up_btn.text = "Upgrade\n%d cr, %d met" % [c.get("credits", 0), c.get("metal", 0)]
			up_btn.custom_minimum_size = Vector2(120, 44)
			up_btn.disabled = not GameData.can_afford(c)
			up_btn.pressed.connect(func():
				if GameData.upgrade_colony_building(GameData.current_colony_id, b_key):
					_status_label.text = "Upgraded %s to Tier %d!" % [b["name"], b["level"]]
					_status_label.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5))
					_refresh()
			)
			bh.add_child(up_btn)

		_colony_container.add_child(b_panel)

func _add_officer_row(off_key: String) -> void:
	var off = GameData.OFFICERS_CATALOGUE[off_key]
	var pc := _make_panel(Color(0.03, 0.05, 0.12))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 12)
	pc.add_child(hb)

	var icon_box := ColorRect.new()
	icon_box.custom_minimum_size = Vector2(48, 48)
	icon_box.color = Color(0.15, 0.35, 0.6)
	hb.add_child(icon_box)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	name_lbl.text = "%s  —  [%s]" % [off["name"], off["role"]]
	name_lbl.add_theme_font_size_override("font_size", 14)
	name_lbl.add_theme_color_override("font_color", Color(0.4, 0.9, 1.0))
	vb.add_child(name_lbl)

	var desc_lbl := Label.new()
	desc_lbl.text = off["desc"]
	desc_lbl.add_theme_font_size_override("font_size", 11)
	desc_lbl.add_theme_color_override("font_color", Color(0.8, 0.85, 0.9))
	vb.add_child(desc_lbl)

	var is_recruited: bool = GameData.recruited_officers.has(off_key)
	var rec_btn := Button.new()
	if is_recruited:
		rec_btn.text = "ACTIVE IN FLEET"
		rec_btn.disabled = true
	else:
		var c = off["cost"]
		rec_btn.text = "Recruit\n%d cr" % c.get("credits", 0)
		rec_btn.disabled = not GameData.can_afford(c)
		rec_btn.pressed.connect(func():
			if GameData.recruit_officer(off_key):
				_status_label.text = "Recruited %s to Naval Command!" % off["name"]
				_status_label.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5))
				_refresh()
		)
	rec_btn.custom_minimum_size = Vector2(110, 44)
	hb.add_child(rec_btn)

	_officers_container.add_child(pc)

func _add_schematic_row(sch_key: String) -> void:
	var item = GameData.SCHEMATICS_CATALOGUE[sch_key]
	var pc := _make_panel(Color(0.04, 0.05, 0.12))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 12)
	pc.add_child(hb)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	name_lbl.text = "%s  [%s]" % [item["name"], item["slot"].to_upper()]
	name_lbl.add_theme_font_size_override("font_size", 14)
	name_lbl.add_theme_color_override("font_color", Color(1.0, 0.85, 0.35))
	vb.add_child(name_lbl)

	var desc_lbl := Label.new()
	desc_lbl.text = item["desc"]
	desc_lbl.add_theme_font_size_override("font_size", 11)
	desc_lbl.add_theme_color_override("font_color", Color(0.7, 0.75, 0.85))
	vb.add_child(desc_lbl)

	var c = item["cost"]
	var craft_btn := Button.new()
	craft_btn.text = "Manufacture\n%d Metal, %d Cr" % [c.get("metal", 0), c.get("credits", 0)]
	craft_btn.custom_minimum_size = Vector2(130, 44)
	craft_btn.disabled = not GameData.can_afford(c)
	craft_btn.pressed.connect(func():
		if GameData.craft_schematic(sch_key):
			_status_label.text = "Fabricated %s in Starbase Workshop!" % item["name"]
			_status_label.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5))
			_refresh()
	)
	hb.add_child(craft_btn)

	_schematics_container.add_child(pc)

func _add_sector_row(sec: Dictionary) -> void:
	var pc := _make_panel(Color(0.03, 0.05, 0.13))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 12)
	pc.add_child(hb)

	var risk_badge := Label.new()
	risk_badge.text = "[%s]" % sec.get("risk", "Med")
	risk_badge.add_theme_font_size_override("font_size", 13)
	risk_badge.add_theme_color_override("font_color", Color(1.0, 0.4, 0.3) if sec.get("is_rift", false) else Color(0.4, 0.9, 0.7))
	risk_badge.custom_minimum_size = Vector2(70, 0)
	hb.add_child(risk_badge)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	name_lbl.text = "%s  —  Faction: %s" % [sec["name"], sec["faction"]]
	name_lbl.add_theme_font_size_override("font_size", 14)
	name_lbl.add_theme_color_override("font_color", Color(0.9, 0.95, 1.0))
	vb.add_child(name_lbl)

	var desc_lbl := Label.new()
	var rw = sec["raid_reward"]
	desc_lbl.text = "%s\nLoot: %d Cr, %d Metal, %d Crystal" % [
		sec["desc"], rw.get("credits", 0), rw.get("metal", 0), rw.get("crystal", 0)
	]
	desc_lbl.add_theme_font_size_override("font_size", 11)
	desc_lbl.add_theme_color_override("font_color", Color(0.7, 0.75, 0.85))
	vb.add_child(desc_lbl)

	var raid_btn := Button.new()
	raid_btn.text = "⚔ ENTER RIFT" if sec.get("is_rift", false) else "⚔ RAID SECTOR"
	raid_btn.custom_minimum_size = Vector2(130, 46)
	raid_btn.disabled = GameData.player_fleet.is_empty()
	raid_btn.pressed.connect(func():
		GameData.current_mission = {
			"name": sec["name"],
			"difficulty": 4 if sec.get("is_rift", false) else 2,
			"enemy_fleet": sec["enemy_fleet"],
			"raid_reward": sec["raid_reward"]
		}
		get_tree().change_scene_to_file("res://scenes/battle.tscn")
	)
	hb.add_child(raid_btn)

	_sectors_container.add_child(pc)

func _add_ladder_row(opp: Dictionary) -> void:
	var pc := _make_panel(Color(0.04, 0.05, 0.12))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 12)
	pc.add_child(hb)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	name_lbl.text = "🏆 %s  —  %s" % [opp["commander"], opp["division"]]
	name_lbl.add_theme_font_size_override("font_size", 14)
	name_lbl.add_theme_color_override("font_color", Color(1.0, 0.8, 0.3))
	vb.add_child(name_lbl)

	var stats_lbl := Label.new()
	stats_lbl.text = "Rating: %d ELO  •  Power: %d  •  Bounty: +%d CR" % [opp["rating"], opp["power"], opp["bounty"]]
	stats_lbl.add_theme_font_size_override("font_size", 11)
	stats_lbl.add_theme_color_override("font_color", Color(0.5, 0.85, 0.7))
	vb.add_child(stats_lbl)

	var fight_btn := Button.new()
	fight_btn.text = "⚔ CHALLENGE FLEET"
	fight_btn.custom_minimum_size = Vector2(150, 44)
	fight_btn.disabled = GameData.player_fleet.is_empty()
	fight_btn.pressed.connect(func():
		GameData.current_mission = {
			"name": "Ladder: " + opp["commander"],
			"difficulty": 4,
			"reward": opp["bounty"],
			"enemy_fleet": opp["fleet"],
			"is_ladder": true
		}
		get_tree().change_scene_to_file("res://scenes/battle.tscn")
	)
	hb.add_child(fight_btn)

	_missions_container.add_child(pc)

func _add_base_row(up_key: String) -> void:
	var up = _base_upgrades[up_key]
	var pc := _make_panel(Color(0.03, 0.05, 0.1))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 12)
	pc.add_child(hb)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	name_lbl.text = "%s (Level %d)" % [up["name"], up["level"]]
	name_lbl.add_theme_font_size_override("font_size", 15)
	name_lbl.add_theme_color_override("font_color", Color(0.3, 0.85, 1.0))
	vb.add_child(name_lbl)

	var desc_lbl := Label.new()
	desc_lbl.text = up["desc"]
	desc_lbl.add_theme_font_size_override("font_size", 12)
	desc_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.8))
	vb.add_child(desc_lbl)

	var up_btn := Button.new()
	up_btn.text = "Upgrade\n%d cr" % up["cost"]
	up_btn.custom_minimum_size = Vector2(100, 48)
	up_btn.disabled = GameData.credits < up["cost"]
	up_btn.pressed.connect(func():
		if GameData.spend_credits(up["cost"]):
			up["level"] += 1
			up["cost"] = int(up["cost"] * 1.5)
			_status_label.text = "Upgraded %s to Level %d!" % [up["name"], up["level"]]
			_status_label.add_theme_color_override("font_color", Color(0.3, 1.0, 0.5))
			_refresh()
	)
	hb.add_child(up_btn)

	_base_container.add_child(pc)

func _add_mission_row(mission: Dictionary) -> void:
	var pc := _make_panel(Color(0.04, 0.05, 0.11))
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 14)
	pc.add_child(hb)

	var diff: int = mission.get("difficulty", 1)
	var diff_lbl := Label.new()
	diff_lbl.text = "★".repeat(diff) + "☆".repeat(5 - diff)
	diff_lbl.add_theme_font_size_override("font_size", 16)
	diff_lbl.add_theme_color_override("font_color", Color.from_hsv((1.0 - diff / 5.0) * 0.35, 0.9, 0.95))
	diff_lbl.custom_minimum_size = Vector2(90, 0)
	hb.add_child(diff_lbl)

	var vb := VBoxContainer.new()
	vb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hb.add_child(vb)

	var name_lbl := Label.new()
	name_lbl.text = mission.get("name", "Mission")
	name_lbl.add_theme_font_size_override("font_size", 15)
	name_lbl.add_theme_color_override("font_color", Color(0.95, 0.8, 0.6))
	vb.add_child(name_lbl)

	var desc_lbl := Label.new()
	desc_lbl.text = mission.get("description", "")
	desc_lbl.add_theme_font_size_override("font_size", 11)
	desc_lbl.add_theme_color_override("font_color", Color(0.7, 0.7, 0.75))
	vb.add_child(desc_lbl)

	var rew_lbl := Label.new()
	rew_lbl.text = "Reward: %d cr" % mission.get("reward", 300)
	rew_lbl.add_theme_font_size_override("font_size", 14)
	rew_lbl.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
	rew_lbl.custom_minimum_size = Vector2(110, 0)
	hb.add_child(rew_lbl)

	var launch_btn := Button.new()
	launch_btn.text = "⚔ ENGAGE"
	launch_btn.custom_minimum_size = Vector2(110, 48)
	launch_btn.add_theme_font_size_override("font_size", 14)
	launch_btn.disabled = GameData.player_fleet.is_empty()
	launch_btn.pressed.connect(func():
		GameData.current_mission = mission
		get_tree().change_scene_to_file("res://scenes/battle.tscn")
	)
	hb.add_child(launch_btn)

	_missions_container.add_child(pc)
