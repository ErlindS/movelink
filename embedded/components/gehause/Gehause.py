# @implements FA2.6
# Generiert das physische 3D-Druck-Gehäuse für den Xiao nRF52840 Sense Controller.

import bpy

def create_ultimate_whoop_case():
    # --- 1. Vorbereitung und saubere Umgebung ---
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')

    # --- 2. Maße in Metern ---
    w = 0.048        # Gesamtlänge exakt 48 mm (X-Achse)
    d = 0.024        # Breite 24 mm (Y-Achse)
    strap_w = 0.020  # 20 mm standardmäßige Armbandbreite
    h = 0.016        # Gesamthöhe exakt 16 mm (Z-Achse)
    wall = 0.002     # Stabile Außenwandstärke (2 mm)
    lid_h = 0.003    # 3 mm Höhe des Deckels
    base_h = h - lid_h # 13 mm Höhe des Unterteils
    tol = 0.0002     # 0.2 mm Toleranz für sauberen 3D-Druck

    # Viewport anpassen
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            area.spaces[0].clip_start = 0.001

    # Hilfsfunktion für Booleans
    def apply_boolean(target, cutter, operation='DIFFERENCE'):
        bpy.context.view_layer.objects.active = target
        mod = target.modifiers.new(name="Bool", type='BOOLEAN')
        mod.operation = operation
        mod.object = cutter
        mod.solver = 'EXACT'
        bpy.ops.object.modifier_apply(modifier="Bool")
        bpy.data.objects.remove(cutter, do_unlink=True)

    # Hilfsfunktion zum Verschmelzen von Bauteilen
    def batch_union_to_target(target, cutter_list):
        if not cutter_list:
            return
        bpy.ops.object.select_all(action='DESELECT')
        for obj in cutter_list:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = cutter_list[0]
        bpy.ops.object.join()
        joined_cutter = bpy.context.active_object
        apply_boolean(target, joined_cutter, operation='UNION')

    # ==========================================
    # --- 3. UNTERTEIL ERSTELLEN ---
    # ==========================================
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, base_h/2))
    base = bpy.context.active_object
    base.name = "WHOOP_Unterteil"
    base.scale = (w, d, base_h)
    bpy.ops.object.transform_apply(scale=True)

    # Innenraum aushöhlen
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, wall + base_h/2))
    base_hollow = bpy.context.active_object
    base_hollow.scale = (w - 2*wall, d - 2*wall, base_h)
    bpy.ops.object.transform_apply(scale=True)
    apply_boolean(base, base_hollow)

    # ==========================================
    # --- NEU: HALB HOHE & KOMBINIERTE INNENWAND ---
    # ==========================================
    wall_len = 0.020      # 20 mm lang
    wall_thick = 0.0015   # Ursprüngliche stabile Dicke (1.5 mm)
    # Höhe um die Hälfte verkleinert (halbe Innenraumhöhe)
    inner_wall_h = (base_h - wall) / 2 
    
    # X-Position: Schiebt die Wand nach links und verbindet sie bündig mit der kurzen Außenwand
    wall_x = - (w / 2) + wall + (wall_len / 2) - 0.0001
    
    # Y-Position: Exakt 5 mm Abstand von der inneren langen Wand
    wall_y = (d / 2) - wall - 0.005 - (wall_thick / 2)
    
    # Z-Position: Setzt die Wand sauber auf den Gehäuseboden auf
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wall_x, wall_y, wall + inner_wall_h / 2))
    inner_wall = bpy.context.active_object
    inner_wall.scale = (wall_len + 0.0002, wall_thick, inner_wall_h)
    bpy.ops.object.transform_apply(scale=True)
    
    # Wand stabil mit dem Unterteil verschmelzen
    apply_boolean(base, inner_wall, operation='UNION')

    # ==========================================
    # --- 4. ARMBAND-DURCHFÜHRUNG ---
    # ==========================================
    lugs_ext = 0.004   
    slot_thick = 0.002  # Wieder zurück auf die funktionierende Ursprungshöhe gesetzt
    lugs = []

    for side in [-1, 1]: 
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, side * (d/2 + lugs_ext/2), base_h/2))
        lug_block = bpy.context.active_object
        lug_block.scale = (strap_w + 0.004, lugs_ext, base_h)
        bpy.ops.object.transform_apply(scale=True)
        lugs.append(lug_block)

    batch_union_to_target(base, lugs)

    slots = []
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, side * (d/2 + lugs_ext/2), base_h/2))
        slot_cutter = bpy.context.active_object
        slot_cutter.scale = (strap_w, slot_thick, base_h + 0.002) 
        bpy.ops.object.transform_apply(scale=True)
        slots.append(slot_cutter)
        
    bpy.ops.object.select_all(action='DESELECT')
    for s in slots: s.select_set(True)
    bpy.context.view_layer.objects.active = slots[0]
    bpy.ops.object.join()
    apply_boolean(base, bpy.context.active_object, operation='DIFFERENCE')

    # ==========================================
    # --- 5. USB-C PORT ---
    # ==========================================
    usbc_w = 0.0095   
    usbc_h = 0.0038   
    usbc_rad = 0.0017 
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(w/2 - wall, 0, wall + 0.001 + usbc_h/2))
    cutter = bpy.context.active_object
    cutter.scale = (wall * 6, usbc_w, usbc_h) 
    bpy.ops.object.transform_apply(scale=True)

    bev_cut = cutter.modifiers.new(name="Oval", type='BEVEL')
    bev_cut.width = usbc_rad
    bev_cut.segments = 6
    bpy.ops.object.modifier_apply(modifier="Oval")

    apply_boolean(base, cutter)

    # ==========================================
    # --- 6. DECKEL MIT INNENLIPPE ERSTELLEN ---
    # ==========================================
    lid_y_offset = d + 0.015 
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, lid_y_offset, lid_h/2))
    lid = bpy.context.active_object
    lid.name = "WHOOP_Deckel"
    lid.scale = (w, d, lid_h)
    bpy.ops.object.transform_apply(scale=True)

    lip_h = 0.002 
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, lid_y_offset, lid_h + lip_h/2))
    lip = bpy.context.active_object
    lip.scale = (w - 2*wall - 2*tol, d - 2*wall - 2*tol, lip_h)
    bpy.ops.object.transform_apply(scale=True)
    apply_boolean(lid, lip, operation='UNION')

    # ==========================================
    # --- 7. EXTRA FESTER SCHLIEẞMECHANISMUS ---
    # ==========================================
    snap_w = 0.006      
    snap_h = 0.001      
    snap_thick = 0.0010 # Beibehalten auf stark einrastenden 1.0 mm Vorsprung

    snap_bumps = []
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * (w/2 - wall - tol), lid_y_offset, lid_h + lip_h/2))
        bump = bpy.context.active_object
        bump.scale = (snap_thick, snap_w, snap_h)
        bpy.ops.object.transform_apply(scale=True)
        snap_bumps.append(bump)
        
    batch_union_to_target(lid, snap_bumps)

    snap_grooves = []
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * (w/2 - wall - tol), 0, base_h - lip_h/2))
        groove = bpy.context.active_object
        groove.scale = (snap_thick * 1.15, snap_w + 0.0002, snap_h + 0.0002)
        bpy.ops.object.transform_apply(scale=True)
        snap_grooves.append(groove)
        
    bpy.ops.object.select_all(action='DESELECT')
    for g in snap_grooves: g.select_set(True)
    bpy.context.view_layer.objects.active = snap_grooves[0]
    bpy.ops.object.join()
    apply_boolean(base, bpy.context.active_object, operation='DIFFERENCE')

    # ==========================================
    # --- 8. ECKEN ABRUNDEN (BEVEL) ---
    # ==========================================
    bevel_width = 0.0015  # 1.5 mm Abrundung (sicher für 2 mm Wände)
    
    for obj in [base, lid]:
        bpy.context.view_layer.objects.active = obj
        bevel_mod = obj.modifiers.new(name="Abgerundete_Ecken", type='BEVEL')
        bevel_mod.width = bevel_width
        bevel_mod.segments = 6          # Sorgt für eine glatte Rundung
        bevel_mod.limit_method = 'ANGLE' # Wendet es nur auf echte Kanten an
        
        # Modifier direkt anwenden, um die Geometrie für den Export zu fixieren
        bpy.ops.object.modifier_apply(modifier="Abgerundete_Ecken")

    # --- Finish & Viewport-Fokus ---
    bpy.ops.object.select_all(action='DESELECT')
    base.select_set(True)
    lid.select_set(True)
    
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for region in area.regions:
                if region.type == 'WINDOW':
                    with bpy.context.temp_override(area=area, region=region):
                        bpy.ops.view3d.view_selected(use_all_regions=False)
                    break
            break
        
    print("Gehäuse mit abgerundeten Ecken erfolgreich generiert!")

# Ausführen
create_ultimate_whoop_case()