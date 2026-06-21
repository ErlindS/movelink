import sys
import json
import re
import math
from pathlib import Path

# Auto-install ReportLab if not present
try:
    import reportlab
except ImportError:
    import subprocess
    print("ReportLab library not found. Installing ReportLab...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
        import reportlab
    except Exception as e:
        print(f"Error installing reportlab: {e}")
        sys.exit(1)

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Preformatted
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

# --- Numbered Canvas for Page X of Y ---
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip decorations on title cover page
            
        self.saveState()
        
        # Colors
        teal = colors.HexColor('#00a685')
        slate = colors.HexColor('#0c1816')
        muted = colors.HexColor('#627c78')
        
        # Header (Top)
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(slate)
        self.drawString(54, 795, "MOVELINK  |  SYSTEM-DOKUMENTATION & TRACEABILITY")
        
        self.setStrokeColor(teal)
        self.setLineWidth(0.6)
        self.line(54, 787, 541, 787)
        
        # Footer (Bottom)
        self.line(54, 55, 541, 55)
        self.setFont("Helvetica", 8)
        self.setFillColor(muted)
        self.drawString(54, 42, "Generiert am 20. Juni 2026")
        
        page_text = f"Seite {self._pageNumber} von {page_count}"
        self.drawRightString(541, 42, page_text)
        
        self.restoreState()

# --- Markdown Utilities ---
def clean_md_tags(text):
    # Escape HTML special chars
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    # Bold: **text** -> <b>text</b>
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Italic: *text* -> <i>text</i>
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    # Inline code: `code` -> <font face="Courier">\1</font>
    text = re.sub(r'`(.*?)`', r'<font face="Courier" size="9">\1</font>', text)
    # Highlight IDs: UC-X, FA-X, NF-X, R-X
    text = re.sub(r'\b(UC-\d+|FA\d+|NF\d+|R\d+)\b', r'<b><font color="#00a685">\1</font></b>', text)
    return text

def markdown_to_flowables(text, styles):
    flowables = []
    lines = text.split('\n')
    in_code_block = False
    code_text = []
    
    for line in lines:
        if line.startswith('```'):
            if in_code_block:
                in_code_block = False
                code_content = '\n'.join(code_text)
                flowables.append(Preformatted(code_content, styles['CodeStyle']))
                flowables.append(Spacer(1, 8))
                code_text = []
            else:
                in_code_block = True
            continue
            
        if in_code_block:
            code_text.append(line)
            continue
            
        line_strip = line.strip()
        if not line_strip:
            flowables.append(Spacer(1, 4))
            continue
            
        # Headers
        if line.startswith('# '):
            flowables.append(Paragraph(clean_md_tags(line[2:]), styles['Heading1']))
            flowables.append(Spacer(1, 8))
        elif line.startswith('## '):
            flowables.append(Paragraph(clean_md_tags(line[3:]), styles['Heading2']))
            flowables.append(Spacer(1, 6))
        elif line.startswith('### '):
            flowables.append(Paragraph(clean_md_tags(line[4:]), styles['Heading3']))
            flowables.append(Spacer(1, 6))
        # Lists
        elif line_strip.startswith('•') or line_strip.startswith('-') or line_strip.startswith('*'):
            bullet_text = line_strip[1:].strip()
            flowables.append(Paragraph(f"&bull; {clean_md_tags(bullet_text)}", styles['BulletStyle']))
            flowables.append(Spacer(1, 3))
        elif re.match(r'^\d+\.', line_strip):
            match = re.match(r'^(\d+)\.(.*)$', line_strip)
            num = match.group(1)
            content = match.group(2).strip()
            flowables.append(Paragraph(f"{num}. {clean_md_tags(content)}", styles['BulletStyle']))
            flowables.append(Spacer(1, 3))
        # Regular text
        else:
            flowables.append(Paragraph(clean_md_tags(line_strip), styles['NormalText']))
            flowables.append(Spacer(1, 4))
            
    return flowables

# --- C4 Diagram Render Helpers ---
def draw_c4_box(d, x, y, w, h, title, tech, desc, box_type):
    # Set colors based on box_type
    if box_type == 'actor':
        fill = colors.HexColor('#0d3a58')
        stroke = colors.HexColor('#0284c7')
        text_color = colors.HexColor('#e0f2fe')
        desc_color = colors.HexColor('#bae6fd')
        tech_color = colors.HexColor('#7dd3fc')
        rx, ry = 18, 18
    elif box_type == 'external':
        fill = colors.HexColor('#262626')
        stroke = colors.HexColor('#4a4a4a')
        text_color = colors.HexColor('#f5f5f5')
        desc_color = colors.HexColor('#d4d4d4')
        tech_color = colors.HexColor('#a3a3a3')
        rx, ry = 6, 6
    elif box_type == 'component':
        fill = colors.HexColor('#1f1c2c')
        stroke = colors.HexColor('#8b5cf6')
        text_color = colors.HexColor('#f5f3ff')
        desc_color = colors.HexColor('#ddd6fe')
        tech_color = colors.HexColor('#c084fc')
        rx, ry = 6, 6
    else: # system-context or container
        fill = colors.HexColor('#0a1d1a')
        stroke = colors.HexColor('#00a685')
        text_color = colors.HexColor('#f0f4f3')
        desc_color = colors.HexColor('#ccd7d5')
        tech_color = colors.HexColor('#5eead4')
        rx, ry = 6, 6

    # Draw background box
    d.add(Rect(x, y, w, h, rx=rx, ry=ry, fillColor=fill, strokeColor=stroke, strokeWidth=1.5))
    
    # Draw Title (bold)
    d.add(String(x + w/2, y + h - 18, title, fontName='Helvetica-Bold', fontSize=9.5, textAnchor='middle', fillColor=text_color))
    
    # Draw Tech (italic/oblique)
    d.add(String(x + w/2, y + h - 28, f"[{tech}]", fontName='Helvetica-Oblique', fontSize=7, textAnchor='middle', fillColor=tech_color))
    
    # Wrap and draw description
    def wrap_text(text, max_chars=28):
        words = text.split(' ')
        lines = []
        curr_line = ""
        for w in words:
            if len(curr_line) + len(w) + 1 <= max_chars:
                curr_line += (" " if curr_line else "") + w
            else:
                lines.append(curr_line)
                curr_line = w
        if curr_line:
            lines.append(curr_line)
        return lines

    desc_lines = wrap_text(desc, max_chars=28)
    start_y = y + (h/2) - 5 + (len(desc_lines) * 4)
    for idx, line in enumerate(desc_lines):
        line_y = start_y - idx * 9
        d.add(String(x + w/2, line_y, line, fontName='Helvetica', fontSize=7, textAnchor='middle', fillColor=desc_color))

def draw_c4_arrow(d, x1, y1, x2, y2, label, stroke_color, is_dashed=False):
    # Draw main line
    line = Line(x1, y1, x2, y2, strokeColor=stroke_color, strokeWidth=1.2)
    if is_dashed:
        line.strokeDashArray = [4, 4]
    d.add(line)
    
    # Calculate arrowhead geometry
    dx = x2 - x1
    dy = y2 - y1
    dist = math.sqrt(dx*dx + dy*dy)
    if dist > 0:
        ux = dx / dist
        uy = dy / dist
        
        # 6pt back, 3pt perpendicular
        back_x = x2 - ux * 6
        back_y = y2 - uy * 6
        perp_x = -uy * 3
        perp_y = ux * 3
        
        arrow = Polygon(
            [x2, y2, back_x + perp_x, back_y + perp_y, back_x - perp_x, back_y - perp_y],
            fillColor=stroke_color,
            strokeColor=stroke_color
        )
        d.add(arrow)
        
    # Draw midpoint text label
    if label:
        mid_x = (x1 + x2) / 2
        mid_y = (y1 + y2) / 2
        
        # Estimate text width
        p_w = len(label) * 4.2 + 8
        p_h = 10
        
        # Background rect for text label
        d.add(Rect(mid_x - p_w/2, mid_y - p_h/2, p_w, p_h, rx=2, ry=2, fillColor=colors.HexColor('#ffffff'), strokeColor=colors.HexColor('#cccccc'), strokeWidth=0.5))
        d.add(String(mid_x, mid_y - 2.5, label, fontName='Helvetica', fontSize=6.5, textAnchor='middle', fillColor=colors.HexColor('#333333')))

def create_system_context_diagram():
    d = Drawing(480, 130)
    d.add(Rect(0, 0, 480, 130, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    teal = colors.HexColor('#00a685')
    grey = colors.HexColor('#666666')
    
    # Draw boxes
    draw_c4_box(d, 20, 30, 110, 70, "Trainierender", "Person", "Benutzer, der seine Übungsausführung in Echtzeit analysieren möchte.", "actor")
    draw_c4_box(d, 185, 30, 110, 70, "MoveLink System", "Software System", "Erfasst, filtert und visualisiert Bewegungsdaten, klassifiziert Übungen lokal.", "system")
    draw_c4_box(d, 350, 30, 110, 70, "Datenbank", "PostgreSQL", "Speichert Benutzerprofile und historische Trainingsdaten.", "external")
    
    # Draw arrows
    draw_c4_arrow(d, 130, 65, 185, 65, "Nutzt für Training", teal)
    draw_c4_arrow(d, 295, 65, 350, 65, "Speichert Daten", grey, is_dashed=True)
    return d

def create_container_diagram():
    d = Drawing(480, 130)
    d.add(Rect(0, 0, 480, 130, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    teal = colors.HexColor('#00a685')
    
    # Draw boxes
    draw_c4_box(d, 20, 30, 110, 70, "Sensor Firmware", "Arduino C/C++", "Erfasst Sensordaten, wendet Filter an und sendet BLE Pakete.", "container")
    draw_c4_box(d, 185, 30, 110, 70, "Mobile App", "React Native", "Bietet UI für Verbindung, Live-Visualisierung und Verlauf.", "container")
    draw_c4_box(d, 350, 30, 110, 70, "Backend", "Node.js / Express", "Verwaltet Nutzer und speichert Trainingsverlauf.", "container")
    
    # Draw arrows
    draw_c4_arrow(d, 130, 65, 185, 65, "BLE Data Stream", teal)
    draw_c4_arrow(d, 295, 65, 350, 65, "HTTPS / WebSockets", teal)
    return d

def create_firmware_components_diagram():
    d = Drawing(480, 135)
    d.add(Rect(0, 0, 480, 135, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    purple = colors.HexColor('#8b5cf6')
    
    # Draw boxes
    draw_c4_box(d, 20, 40, 110, 70, "LSM6DS3 Reader", "C++ Module", "Periodische Erfassung der Rohbeschleunigungs- und Gyroskopwerte mit 50Hz.", "component")
    draw_c4_box(d, 185, 40, 110, 70, "Edge Impulse SDK", "Inferenzbibliothek", "Lokale Ausführung des trainierten neuronalen Netzes (CNN) zur Curl-Klassifizierung.", "component")
    draw_c4_box(d, 350, 40, 110, 70, "BLE Service", "ArduinoBLE", "Stellt Characteristics bereit und verwaltet Verbindungsnotifikationen.", "component")
    
    # Draw direct arrows
    draw_c4_arrow(d, 130, 75, 185, 75, "Liefert Sensor-Rohdaten", purple)
    draw_c4_arrow(d, 295, 75, 350, 75, "Überträgt Klassifikation", purple)
    
    # Draw segmented arrow (imu_reader -> ble_service)
    d.add(Line(75, 40, 75, 15, strokeColor=purple, strokeWidth=1.2))
    d.add(Line(75, 15, 405, 15, strokeColor=purple, strokeWidth=1.2))
    d.add(Line(405, 15, 405, 40, strokeColor=purple, strokeWidth=1.2))
    arrow = Polygon([405, 40, 402, 34, 408, 34], fillColor=purple, strokeColor=purple)
    d.add(arrow)
    label = "Streamt Rohdaten"
    p_w = len(label) * 4.2 + 8
    d.add(Rect(240 - p_w/2, 15 - 5, p_w, 10, rx=2, ry=2, fillColor=colors.white, strokeColor=colors.HexColor('#cccccc'), strokeWidth=0.5))
    d.add(String(240, 15 - 2.5, label, fontName='Helvetica', fontSize=6.5, textAnchor='middle', fillColor=colors.HexColor('#333333')))
    return d

def create_app_components_diagram():
    d = Drawing(480, 220)
    d.add(Rect(0, 0, 480, 220, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    purple = colors.HexColor('#8b5cf6')
    
    # Row 2 (Top, y=125)
    draw_c4_box(d, 15, 125, 100, 75, "SensorCard UI", "React Native", "Steuert den Verbindungszustand und das Bluetooth-Pairing.", "component")
    draw_c4_box(d, 127, 125, 100, 75, "LiveChart UI", "SVG Canvas", "Echtzeit-Zeichnung des IMU-Verlaufs.", "component")
    draw_c4_box(d, 239, 125, 100, 75, "SessionCard UI", "React Native", "Zusammenfassung einer vergangenen Trainingseinheit.", "component")
    draw_c4_box(d, 351, 125, 114, 75, "ProfileCard UI", "React Native", "Darstellung der Benutzerdaten und Authentifizierung.", "component")
    
    # Row 1 (Bottom, y=25)
    draw_c4_box(d, 70, 25, 130, 60, "useBLE Hook", "TypeScript Hook", "Custom Hook für Scanning und BLE-Verbindung.", "component")
    draw_c4_box(d, 280, 25, 130, 60, "useWebSocket Hook", "TypeScript Hook", "Verbindung zum Backend zwecks Live-Datentransfer.", "component")
    
    # Draw arrows
    draw_c4_arrow(d, 65, 125, 110, 85, "Steuert BLE", purple)
    draw_c4_arrow(d, 177, 125, 160, 85, "Liest IMU", purple)
    draw_c4_arrow(d, 289, 125, 320, 85, "Lädt Daten", purple)
    draw_c4_arrow(d, 408, 125, 370, 85, "Nutzt API", purple)
    return d

# --- Main PDF Generator ---
def main():
    root_dir = Path(__file__).parent.resolve()
    data_js_path = root_dir / 'docs_site' / 'data.js'
    pdf_out_path = root_dir / 'docs_site' / 'documentation_report.pdf'
    
    if not data_js_path.exists():
        print("Error: docs_site/data.js does not exist. Run scrape_docs.py first.")
        sys.exit(1)
        
    print(f"Reading data from {data_js_path}...")
    with open(data_js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
        
    # Strip JS assignment to get pure JSON
    json_str = js_content.replace('const DOCS_DATA = ', '').strip().rstrip(';')
    data = json.loads(json_str)
    
    # Setup PDF document
    # Margins: 54 points = 0.75 in (~1.9 cm)
    doc = SimpleDocTemplate(
        str(pdf_out_path),
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styling
    primary_color = colors.HexColor('#00a685')
    text_color = colors.HexColor('#1e2e2b')
    code_bg = colors.HexColor('#f3f7f6')
    
    styles.add(ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=32,
        leading=38,
        textColor=colors.HexColor('#0c1816'),
        spaceAfter=12
    ))
    
    styles.add(ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#627c78'),
        spaceAfter=40
    ))
    
    styles.add(ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=primary_color
    ))

    # Overwrite default styles
    styles['Heading1'].fontName = 'Helvetica-Bold'
    styles['Heading1'].fontSize = 20
    styles['Heading1'].leading = 24
    styles['Heading1'].textColor = colors.HexColor('#0c1816')
    styles['Heading1'].spaceBefore = 18
    styles['Heading1'].spaceAfter = 10
    styles['Heading1'].keepWithNext = True
    
    styles['Heading2'].fontName = 'Helvetica-Bold'
    styles['Heading2'].fontSize = 14
    styles['Heading2'].leading = 18
    styles['Heading2'].textColor = primary_color
    styles['Heading2'].spaceBefore = 14
    styles['Heading2'].spaceAfter = 8
    styles['Heading2'].keepWithNext = True
    
    styles['Heading3'].fontName = 'Helvetica-Bold'
    styles['Heading3'].fontSize = 11
    styles['Heading3'].leading = 14
    styles['Heading3'].textColor = colors.HexColor('#0c1816')
    styles['Heading3'].spaceBefore = 10
    styles['Heading3'].spaceAfter = 6
    styles['Heading3'].keepWithNext = True
    
    styles['Normal'].textColor = text_color
    styles['Normal'].fontSize = 10
    styles['Normal'].leading = 14
    
    styles.add(ParagraphStyle(
        'NormalText',
        parent=styles['Normal'],
        spaceAfter=6
    ))
    
    styles.add(ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    ))
    
    styles.add(ParagraphStyle(
        'CodeStyle',
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1f2937'),
        backColor=code_bg,
        borderColor=colors.HexColor('#e5e7eb'),
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=8
    ))
    
    styles.add(ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        textColor=colors.white,
        alignment=1 # Center
    ))
    
    styles.add(ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontSize=9,
        leading=12
    ))

    styles.add(ParagraphStyle(
        'TableCellCenter',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        alignment=1
    ))

    story = []
    
    # ------------------ COVER PAGE ------------------
    story.append(Spacer(1, 150))
    story.append(Paragraph("MOVELINK", styles['CoverMeta']))
    story.append(Spacer(1, 10))
    story.append(Paragraph("System-Dokumentation &amp; Traceability-Report", styles['CoverTitle']))
    
    # Decorative line
    story.append(Table(
        [['']], 
        colWidths=[487], 
        rowHeights=[4], 
        style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), primary_color),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ])
    ))
    story.append(Spacer(1, 15))
    story.append(Paragraph("Anforderungs- &amp; Abdeckungsanalyse der MoveLink App", styles['CoverSubtitle']))
    
    story.append(Spacer(1, 120))
    meta_text = """
    <b>Status:</b> Freigegeben<br/>
    <b>Sprache:</b> Deutsch<br/>
    <b>Autoren:</b> Erlind &amp; AI Assistant Antigravity<br/>
    <b>Dokumentenversion:</b> v1.1.0 (Scraped Live)<br/>
    <b>Veröffentlichungsdatum:</b> 20. Juni 2026
    """
    story.append(Paragraph(meta_text, styles['Normal']))
    story.append(PageBreak())
    
    # ------------------ SECTION 1: SCRAPED DOCUMENTS ------------------
    story.append(Paragraph("1. Dokumente aus dem Projekt", styles['Heading1']))
    story.append(Paragraph("In diesem Abschnitt werden die im Projekt gefundenen Markdown-Dateien im Volltext aufgeführt. Diese Dokumente bilden die Grundlage für die Anforderungen und Use Cases.", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    # Order files: Requirements first, then UseCases, then others
    sorted_files = sorted(data['files'], key=lambda x: (
        0 if 'Requirements' in x['path'] else 
        1 if 'UseCases' in x['path'] else 2, 
        x['path']
    ))
    
    for file in sorted_files:
        if file['path'] in ['README.md', 'Befehle_App_Build.md']:
            continue # skip build notes / README to keep report focused
            
        story.append(Paragraph(f"Datei: {file['path']}", styles['Heading2']))
        # Parse markdown lines into ReportLab paragraphs
        flowables = markdown_to_flowables(file['content'], styles)
        story.extend(flowables)
        story.append(Spacer(1, 12))
        
    story.append(PageBreak())
    
    # ------------------ SECTION 2: TRACE MATRIX ------------------
    story.append(Paragraph("2. Requirements vs. Use Cases Matrix", styles['Heading1']))
    story.append(Paragraph("Die folgende Matrix veranschaulicht die Beziehungen zwischen den definierten funktionalen Anforderungen (FA) / nicht-funktionalen Anforderungen (NF) / Rahmenbedingungen (R) und den Use Cases (UC).", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    use_cases = sorted([d for d in data['definitions'].values() if d['type'] == 'UC'], key=lambda x: x['id'])
    reqs = sorted([d for d in data['definitions'].values() if d['type'] != 'UC'], key=lambda x: (x['type'], x['id']))
    
    # Table data
    # Header row
    header_row = [Paragraph("<b>Anforderung / ID</b>", styles['TableHeader'])]
    for uc in use_cases:
        header_row.append(Paragraph(f"<b>{uc['id']}</b>", styles['TableHeader']))
    matrix_data = [header_row]
    
    # Rows
    for req in reqs:
        row = [Paragraph(f"<b>{req['id']}:</b> {req['title'][:45]}...", styles['TableCell'])]
        for uc in use_cases:
            is_linked = uc['id'] in req['links']
            cell_text = "<b>X</b>" if is_linked else "-"
            row.append(Paragraph(cell_text, styles['TableCellCenter'] if is_linked else styles['TableCellCenter']))
        matrix_data.append(row)
        
    # Column widths: 487 total width
    col_widths = [187] + [100] * len(use_cases)
    matrix_table = Table(matrix_data, colWidths=col_widths)
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('BACKGROUND', (0,1), (0,-1), colors.HexColor('#f9fafb')),
        ('ROWBACKGROUNDS', (1,1), (-1,-1), [colors.white, colors.HexColor('#f9fafb')]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    
    story.append(matrix_table)
    story.append(Spacer(1, 15))
    story.append(Paragraph("<i>Hinweis: Ein 'X' kennzeichnet eine direkte Verknüpfung im Pflichtenheft bzw. den Anforderungsdokumenten.</i>", styles['NormalText']))
    story.append(PageBreak())
    
    # ------------------ SECTION 3: E2E TRACE TREE ------------------
    story.append(Paragraph("3. End-to-End Rückverfolgbarkeits-Baum", styles['Heading1']))
    story.append(Paragraph("Hier ist der vollständige Trace-Pfad von den Anwendungsfällen über die funktionalen Anforderungen bis hin zu den konkreten Code-Implementierungen (z. B. React Native-Dateien, Arduino-Skripte) dargestellt.", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    for uc in use_cases:
        story.append(Paragraph(f"Anwendungsfall {uc['id']}: {uc['title']}", styles['Heading2']))
        
        # Find requirements linking to this Use Case
        linked_reqs = sorted([r for r in reqs if uc['id'] in r['links']], key=lambda x: x['id'])
        
        if not linked_reqs:
            story.append(Paragraph("<i>Keine verknüpften Anforderungen gefunden.</i>", styles['BulletStyle']))
        else:
            for req in linked_reqs:
                # Requirement Header
                story.append(Paragraph(f"<b>&bull; Anforderung {req['id']}:</b> {req['title']}", styles['BulletStyle']))
                
                # Code References
                refs = data['references'].get(req['id'], [])
                if not refs:
                    story.append(Paragraph("   <font color='#dc2626'>[!] Warnung: Keine Code-Referenzen gefunden.</font>", styles['BulletStyle']))
                else:
                    for ref in refs:
                        ref_text = f"   - <b>Implementiert in:</b> <font face='Courier' size='9'>{ref['file']}</font> (Zeile {ref['line']})<br/>     <i>Kontext:</i> <font face='Courier' size='8'>{ref['context']}</font>"
                        story.append(Paragraph(ref_text, styles['NormalText']))
                story.append(Spacer(1, 3))
        story.append(Spacer(1, 10))
        
    story.append(PageBreak())
    
    # ------------------ SECTION 4: C4 MODEL DIAGRAMS ------------------
    story.append(Paragraph("4. System-Architektur (C4 Modell)", styles['Heading1']))
    story.append(Paragraph("In diesem Abschnitt wird die Systemarchitektur auf den verschiedenen C4-Ebenen (System-Kontext, Container und Komponenten) visualisiert.", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("4.1 System-Kontext-Diagramm", styles['Heading2']))
    story.append(Paragraph("Das System-Kontext-Diagramm zeigt die Position von MoveLink in Bezug auf Benutzer und das externe Datenbanksystem.", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_system_context_diagram())
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("4.2 Container-Diagramm", styles['Heading2']))
    story.append(Paragraph("Das Container-Diagramm veranschaulicht die Aufteilung des MoveLink Systems in eigenständige, ausführbare Subsysteme (Mobile App, Firmware und Backend) sowie deren Kommunikationspfade.", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_container_diagram())
    story.append(Spacer(1, 15))
    
    story.append(PageBreak())
    
    story.append(Paragraph("4.3 Komponenten-Diagramm (Sensor-Firmware)", styles['Heading2']))
    story.append(Paragraph("Das Komponenten-Diagramm zeigt das Innenleben der Sensor-Firmware, die auf dem Xiao-Mikrocontroller läuft, sowie die Kopplung von Sensorik, Inferenz (Edge Impulse) und Bluetooth BLE.", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_firmware_components_diagram())
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("4.4 Komponenten-Diagramm (Mobile App)", styles['Heading2']))
    story.append(Paragraph("Dieses Diagramm zeigt die internen Komponenten des React Native Containers (Mobile App), aufgeteilt in UI-Elemente und Custom Hooks, die mit BLE und dem WebSocket-Server interagieren.", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_app_components_diagram())
    story.append(Spacer(1, 10))
    
    # Build Document
    print(f"Building PDF report in {pdf_out_path}...")
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generation completed successfully.")

if __name__ == '__main__':
    main()
