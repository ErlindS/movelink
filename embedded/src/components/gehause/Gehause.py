# @implements FA2.6
# Generiert das physische 3D-Druck-Gehäuse für den Xiao nRF52840 Sense Controller.

import bpy
import math

def create_perfect_25mm_tactical_case():
    # --- 1. Vorbereitung und saubere Umgebung ---
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')

    # --- 2. Maße in Metern ---
    w = 0.048        # Gesamtlänge exakt 48 mm (X-Achse)
    d = 0.024        # Breite 24 mm (Y-Achse)
    strap_w = 0.025  # 25 mm Breite für dein Gurtband-Set
    h = 0.016        # Gesamthöhe (von 13mm auf 16mm erhöht, da der Schalter 12.4mm Tiefe + 2mm Wandung braucht)
    wall = 0.002     # Stabile Außenwandstärke (2 mm)
    lid_h = 0.003    # 3 mm Höhe des Deckels
    base_h = h - lid_h # Höhe des Unterteils
    tol = 0.0002     # 0.2 mm Toleranz für sauberen Druck

    lid_y_offset = d + 0.020  # Abstand für den Deckel im Viewport

    # Hilfsfunktion für Booleans
    def apply_boolean(target, cutter, operation='DIFFERENCE'):
        bpy.context.view_layer.objects.active = target
        mod = target.modifiers.new(name="Bool", type='BOOLEAN')
        mod.operation = operation
        mod.object = cutter
        mod.solver = 'EXACT'
        bpy.ops.object.modifier_apply(modifier="Bool")
        bpy.data.objects.remove(cutter, do_unlink=True)

    # ==========================================
    # --- 3. UNTERTEIL BASIS ---
    # ==========================================
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, base_h/2))
    base = bpy.context.active_object
    base.name = "WHOOP_Unterteil"
    base.scale = (w, d, base_h)
    bpy.ops.object.transform_apply(scale=True)

    # Stealth-Chamfer für die Gehäuse-Ecken
    chamfer_size = 0.003
    for x_sign in [-1, 1]:
        for y_sign in [-1, 1]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_sign * w/2, y_sign * d/2, base_h/2))
            cc = bpy.context.active_object
            cc.rotation_euler = (0, 0, math.radians(45))
            cc.scale = (chamfer_size, chamfer_size, base_h * 2.0)
            bpy.ops.object.transform_apply(scale=False, rotation=True)
            bpy.ops.object.transform_apply(scale=True)
            apply_boolean(base, cc, 'DIFFERENCE')

    # ==========================================
    # --- 4. ROBUSTE EXO-WINGS ---
    # ==========================================
    lugs_ext = 0.006              # Ausladung nach außen (6mm)
    lug_wall_outer = 0.003        # Sichere 3mm Fleisch an den Seiten der Schlitze
    lug_width = strap_w + (2 * lug_wall_outer) # Automatisch berechnete Gesamtbreite
    slot_thick = 0.0028           # Perfekt für dicke 25mm Taktik-Gurte

    for side in [-1, 1]:
        # Erstelle den soliden Flügel-Block
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, side * (d/2 + lugs_ext/2), base_h/2))
        lug_block = bpy.context.active_object
        lug_block.scale = (lug_width, lugs_ext, base_h)
        bpy.ops.object.transform_apply(scale=True)
        
        # Ecken-Abschrägung der Flügel
        wing_chamfer = 0.002
        for x_sign in [-1, 1]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_sign * lug_width/2, side * (d/2 + lugs_ext), base_h/2))
            w_cutter = bpy.context.active_object
            w_cutter.rotation_euler = (0, 0, math.radians(45))
            w_cutter.scale = (wing_chamfer, wing_chamfer, base_h * 2.5)
            bpy.ops.object.transform_apply(scale=False, rotation=True)
            bpy.ops.object.transform_apply(scale=True)
            apply_boolean(lug_block, w_cutter, 'DIFFERENCE')
            
        # Erst den sauberen Flügel an das Hauptgehäuse anschließen
        apply_boolean(base, lug_block, 'UNION')

    # Jetzt erst die Gurtschlitze exakt herausschneiden
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, side * (d/2 + lugs_ext/2), base_h/2))
        slot_cutter = bpy.context.active_object
        slot_cutter.scale = (strap_w, slot_thick, base_h * 2.5)
        bpy.ops.object.transform_apply(scale=True)
        apply_boolean(base, slot_cutter, 'DIFFERENCE')

    # ==========================================
    # --- 5. INNENRAUM AUSHÖHLEN ---
    # ==========================================
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, wall + base_h/2))
    base_hollow = bpy.context.active_object
    base_hollow.scale = (w - 2*wall, d - 2*wall, base_h)
    bpy.ops.object.transform_apply(scale=True)
    apply_boolean(base, base_hollow)

    # Halb hohe Innenwand wieder sauber einsetzen
    wall_len = 0.020      
    wall_thick = 0.0015   
    inner_wall_h = (base_h - wall) / 2 
    wall_x = - (w / 2) + wall + (wall_len / 2) - 0.0001
    wall_y = (d / 2) - wall - 0.005 - (wall_thick / 2)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(wall_x, wall_y, wall + inner_wall_h / 2))
    inner_wall = bpy.context.active_object
    inner_wall.scale = (wall_len + 0.0002, wall_thick, inner_wall_h)
    bpy.ops.object.transform_apply(scale=True)
    apply_boolean(base, inner_wall, operation='UNION')

    # ==========================================
    # --- 6. VERSCHLUSS-RILLEN & USB-C & SCHIEBESCHALTER ---
    # ==========================================
    snap_w = 0.005
    snap_h = 0.0009
    snap_thick = 0.0009
    
    for side in [-1, 1]:
        for x_pos in [-w/4, w/4]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_pos, side * (d/2 - wall/2), base_h - 0.0015))
            groove = bpy.context.active_object
            groove.scale = (snap_w, snap_thick * 2.0, snap_h)
            bpy.ops.object.transform_apply(scale=True)
            apply_boolean(base, groove, operation='DIFFERENCE')

    # --- USB-C Port (auf der rechten Seite, +X) ---
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

    # --- MINIATUR SCHIEBESCHALTER FREI (auf der linken Seite, -X) ---
    # Maße laut Datenblatt: Einbauöffnung 15.5mm, Höhe 7.5mm (wird im Gehäuse vertikal/horizontal zentriert)
    switch_cut_w = 0.0155  # Einbaumaß Länge 15.5 mm (hier auf Y-Achse ausgerichtet)
    switch_cut_h = 0.0075  # Breite 7.5 mm (hier auf Z-Achse ausgerichtet)
    switch_z_pos = base_h / 2 # Zentriert in der Höhe des Unterteils
    
    # Hauptausschnitt für den Schalterkörper
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-w/2 + wall, 0, switch_z_pos))
    switch_cutter = bpy.context.active_object
    switch_cutter.scale = (wall * 6, switch_cut_w, switch_cut_h)
    bpy.ops.object.transform_apply(scale=True)
    apply_boolean(base, switch_cutter)

    # Schraublöcher (Lochabstand 19 mm -> jeweils 9.5 mm von der Mitte entfernt)
    screw_dist_y = 0.019 / 2
    screw_radius = 0.0011 # M2 Schraube (2.2mm Durchmesser für sicheren Halt)
    
    for y_sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=screw_radius, depth=wall * 6, 
                                            location=(-w/2 + wall, y_sign * screw_dist_y, switch_z_pos))
        # Zylinder rotieren, damit er durch die X-Wand schneidet
        screw_cutter = bpy.context.active_object
        screw_cutter.rotation_euler = (0, math.radians(90), 0)
        bpy.ops.object.transform_apply(scale=False, rotation=True)
        bpy.ops.object.transform_apply(scale=True)
        apply_boolean(base, screw_cutter)


    # ==========================================
    # --- 7. DECKEL ERSTELLEN ---
    # ==========================================
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, lid_y_offset, lid_h/2))
    lid = bpy.context.active_object
    lid.name = "WHOOP_Deckel"
    lid.scale = (w, d, lid_h)
    bpy.ops.object.transform_apply(scale=True)

    # Stealth-Chamfer für den Deckel
    for x_sign in [-1, 1]:
        for y_sign in [-1, 1]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_sign * w/2, lid_y_offset + y_sign * d/2, lid_h/2))
            cc_lid = bpy.context.active_object
            cc_lid.rotation_euler = (0, 0, math.radians(45))
            cc_lid.scale = (chamfer_size, chamfer_size, lid_h * 3.0)
            bpy.ops.object.transform_apply(scale=False, rotation=True)
            bpy.ops.object.transform_apply(scale=True)
            apply_boolean(lid, cc_lid, 'DIFFERENCE')

    # LED-Schlitz & Panel Lines auf Deckel
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, lid_y_offset, lid_h))
    led_slot = bpy.context.active_object
    led_slot.scale = (w * 0.35, 0.0012, 0.0012) 
    bpy.ops.object.transform_apply(scale=True)
    apply_boolean(lid, led_slot, 'DIFFERENCE')

    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(side * 0.013, lid_y_offset, lid_h))
        groove = bpy.context.active_object
        groove.scale = (0.0008, d * 0.4, 0.0008) 
        bpy.ops.object.transform_apply(scale=True)
        apply_boolean(lid, groove, 'DIFFERENCE')

    # Cyber-Bolt Pockets
    for x_sign in [-1, 1]:
        for y_sign in [-1, 1]:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.0012, depth=0.0016, 
                                                location=(x_sign * (w/2 - 0.005), lid_y_offset + y_sign * (d/2 - 0.004), lid_h))
            apply_boolean(lid, bpy.context.active_object, operation='DIFFERENCE')

    # Innenlippe für den Deckel
    lip_h = 0.002 
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, lid_y_offset, lid_h + lip_h/2))
    lip = bpy.context.active_object
    lip.scale = (w - 2*wall - 2*tol, d - 2*wall - 2*tol, lip_h)
    bpy.ops.object.transform_apply(scale=True)
    apply_boolean(lid, lip, operation='UNION')

    # Klick-Noppen an der Innenlippe
    for side in [-1, 1]:
        for x_pos in [-w/4, w/4]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_pos, lid_y_offset + side * (d/2 - wall - tol), lid_h + lip_h/2))
            bump = bpy.context.active_object
            bump.scale = (snap_w - tol, snap_thick, snap_h - tol)
            bpy.ops.object.transform_apply(scale=True)
            apply_boolean(lid, bump, operation='UNION')

    # ==========================================
    # --- 8. FINALE ABKANTUNG (BEVEL) ---
    # ==========================================
    bevel_width = 0.0004  
    for obj in [base, lid]:
        if obj:
            bpy.context.view_layer.objects.active = obj
            bevel_mod = obj.modifiers.new(name="SciFi_Finish", type='BEVEL')
            bevel_mod.width = bevel_width
            bevel_mod.segments = 4          
            bevel_mod.limit_method = 'ANGLE' 
            bevel_mod.angle_limit = math.radians(35)
            bpy.ops.object.modifier_apply(modifier="SciFi_Finish")

    # Fokus im Viewport
    bpy.ops.object.select_all(action='DESELECT')
    base.select_set(True)
    if lid: lid.select_set(True)
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for region in area.regions:
                if region.type == 'WINDOW':
                    with bpy.context.temp_override(area=area, region=region):
                        bpy.ops.view3d.view_selected(use_all_regions=False)
                    break
            break

create_perfect_25mm_tactical_case()