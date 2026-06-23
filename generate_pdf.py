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

# --- Matrix Traceability Helpers ---
def parse_container_components(container_content):
    mappings = []
    if not container_content:
        return mappings
    lines = container_content.split('\n')
    for line in lines:
        # Pattern 1: **FA2.1** -> **[Sensordatenerfassung (Loop)](file:///...)**: ...
        arrow_match = re.search(r'\*\*(FA\d+(?:\.\d+)*(?:\s*,\s*FA\d+(?:\.\d+)*)*)\*\*\s*->\s*(?:\*\*)?\[([^\]]+)\]\(([^)]+)\)', line)
        if arrow_match:
            reqs = [r.strip() for r in arrow_match.group(1).split(',')]
            comp_name = arrow_match.group(2).strip()
            comp_link = arrow_match.group(3).strip().replace('file:///c:/Users/erlin/repo/movelink/', '')
            for req_id in reqs:
                mappings.append({'reqId': req_id, 'name': comp_name, 'path': comp_link})
            continue

        # Pattern 2: 1. **[SideNav](file:///...)**: ... (Erfüllt: FA1.1)
        fulfills_match = re.search(r'(?:\*\*)?\[([^\]]+)\]\(([^)]+)\)(?:\*\*)?.*\(Erfüllt:\s*(FA\d+(?:\.\d+)*(?:\s*,\s*FA\d+(?:\.\d+)*)*).*\)', line, re.IGNORECASE)
        if fulfills_match:
            comp_name = fulfills_match.group(1).strip()
            comp_link = fulfills_match.group(2).strip().replace('file:///c:/Users/erlin/repo/movelink/', '')
            reqs = [r.strip() for r in fulfills_match.group(3).split(',')]
            for req_id in reqs:
                mappings.append({'reqId': req_id, 'name': comp_name, 'path': comp_link})
            continue

        # Pattern 3: 1. **ProfileController / Auth Service**: ... (Erfüllt: FA3.1)
        text_fulfills_match = re.search(r'\*\*(.*?)\*\*\s*:.*\(Erfüllt:\s*(FA\d+(?:\.\d+)*(?:\s*,\s*FA\d+(?:\.\d+)*)*).*\)', line, re.IGNORECASE)
        if text_fulfills_match:
            comp_name = text_fulfills_match.group(1).strip()
            reqs = [r.strip() for r in text_fulfills_match.group(2).split(',')]
            for req_id in reqs:
                mappings.append({'reqId': req_id, 'name': comp_name, 'path': ''})
            continue
            
    return mappings

def get_component_classes(component_path, code_contents):
    if not component_path:
        return []
    
    classes = []
    normalized_link = component_path.replace('file:///c:/Users/erlin/repo/movelink/', '').replace('../', '')
    
    is_code_file = normalized_link.endswith(('.ts', '.tsx', '.cpp', '.ino', '.h', '.py'))
    
    target_files = []
    if is_code_file:
        target_files.append(normalized_link)
    elif normalized_link.endswith('.md'):
        dir_path = normalized_link.rsplit('/', 1)[0] if '/' in normalized_link else ''
        for file in code_contents.keys():
            if file.startswith(dir_path + '/') and file != normalized_link:
                target_files.append(file)
                
    for file in target_files:
        content = code_contents.get(file)
        if not content:
            continue
            
        lines = content.split('\n')
        for index, line in enumerate(lines):
            line_num = index + 1
            name = ''
            
            class_match = re.search(r'(?:class|interface|struct)\s+(\w+)', line)
            func_match = re.search(r'(?:function|void|int|float|double|bool)\s+(\w+)\s*\(', line)
            const_func_match = re.search(r'const\s+(\w+)\s*=\s*(?:\(\)|function|\w+)', line)
            
            if class_match:
                name = class_match.group(1)
            elif func_match:
                name = func_match.group(1) + '()'
            elif const_func_match:
                name = const_func_match.group(1)
                
            if name and name.replace('()', '') not in ['if', 'for', 'while', 'switch', 'catch', 'setup', 'loop']:
                if not any(c['name'] == name and c['file'] == file for c in classes):
                    classes.append({'name': name, 'file': file, 'line': line_num})
                    
        if not any(c['file'] == file for c in classes):
            filename = file.split('/')[-1]
            classes.append({'name': filename, 'file': file, 'line': 1})
            
    return classes

def get_class_for_req(req_id, references):
    refs = references.get(req_id, [])
    classes = []
    for ref in refs:
        file = ref['file']
        if file.endswith(('.ts', '.tsx', '.cpp', '.ino', '.h', '.py')):
            context = ref.get('context', '')
            if '@implements' in context:
                continue
            
            name = ''
            class_match = re.search(r'(?:class|interface|struct)\s+(\w+)', context)
            func_match = re.search(r'(?:function|void|int|float|double|bool)\s+(\w+)\s*\(', context)
            const_func_match = re.search(r'const\s+(\w+)\s*=\s*(?:\(\)|function|\w+)', context)
            
            if class_match:
                name = class_match.group(1)
            elif func_match:
                name = func_match.group(1) + '()'
            elif const_func_match:
                name = const_func_match.group(1)
            else:
                filename = file.split('/')[-1]
                name = f"{filename}:{ref['line']}"
                
            classes.append({'name': name, 'file': file, 'line': ref['line']})
    return classes

def create_mappings_drawing(total_rows, row_height, use_cases, tree, data):
    d = Drawing(30, total_rows * row_height)
    
    # Calculate row spans
    uc_spans = []
    remaining = total_rows
    for i in range(len(use_cases)):
        span = remaining if i == len(use_cases) - 1 else total_rows // len(use_cases)
        uc_spans.append(span)
        remaining -= span
        
    uc_centers = []
    curr_row = 0
    for span in uc_spans:
        center_row = curr_row + (span - 1) / 2.0
        y = (total_rows - 1 - center_row + 0.5) * row_height
        uc_centers.append(y)
        curr_row += span
        
    fa_centers = {}
    curr_row = 0
    for container in tree:
        container_total_rows = 0
        for sub in container['subFAs']:
            sub_rows = len(sub['detailFAs']) if sub['detailFAs'] else 1
            container_total_rows += sub_rows
        center_row = curr_row + (container_total_rows - 1) / 2.0
        y = (total_rows - 1 - center_row + 0.5) * row_height
        fa_centers[container['id']] = y
        curr_row += container_total_rows
        
    connections = []
    for container in tree:
        container_id = container['id']
        def_info = data['definitions'].get(container_id)
        if def_info and def_info.get('links'):
            for uc_id in def_info['links']:
                uc_idx = -1
                for idx, uc in enumerate(use_cases):
                    if uc['id'] == uc_id:
                        uc_idx = idx
                        break
                if uc_idx != -1:
                    color = colors.HexColor('#627c78')
                    if container_id == 'FA2':
                        color = colors.HexColor('#f97316')
                    elif container_id == 'FA3':
                        color = colors.HexColor('#22c55e')
                    connections.append((uc_idx, container_id, color))
                    
    for uc_idx, fa_id, color in connections:
        y_from = uc_centers[uc_idx]
        y_to = fa_centers[fa_id]
        d.add(Line(0, y_from, 30, y_to, strokeColor=color, strokeWidth=1.5))
        
    return d

RENDERED_ANCHORS = set()

def make_requirement_card(item_id, title, desc_text, styles):
    RENDERED_ANCHORS.add(item_id)
    content = f"<a name='req_{item_id}'></a><b><font color='#00a685'>{item_id}</font></b>"
    if title:
        content += f" &ndash; <b>{title}</b>"
    if desc_text:
        content += f"<br/>{desc_text}"
        
    p = Paragraph(content, styles['NormalText'])
    card_table = Table([[p]], colWidths=[487])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f3f7f6')),
        ('LINELEFT', (0,0), (0,-1), 3, colors.HexColor('#00a685')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return card_table

def get_clean_markdown(content):
    lines = content.split('\n')
    clean_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('# ') or stripped == '# FA2':
            continue
        clean_lines.append(line)
    return '\n'.join(clean_lines)

def markdown_to_flowables(text, styles):
    flowables = []
    lines = text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        line_strip = line.strip()
        
        if not line_strip:
            flowables.append(Spacer(1, 4))
            i += 1
            continue
            
        # 1. Skip code blocks completely (no code in the doc), but map mermaid diagrams
        if line_strip.startswith('```'):
            is_mermaid = 'mermaid' in line_strip
            mermaid_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                if is_mermaid:
                    mermaid_lines.append(lines[i])
                i += 1
            i += 1  # skip the closing ```
            
            if is_mermaid:
                mermaid_code = "".join(mermaid_lines)
                if "Loop in Executable.ino" in mermaid_code:
                    flowables.append(Spacer(1, 5))
                    flowables.append(create_sensordatenerfassung_diagram())
                    flowables.append(Spacer(1, 5))
                elif "LSM6DS3 Sensor (Hardware)" in mermaid_code or "Sensordatenerfassung" in mermaid_code:
                    flowables.append(Spacer(1, 5))
                    flowables.append(create_firmware_dataflow_diagram())
                    flowables.append(Spacer(1, 5))
                elif "CNN Modell" in mermaid_code or "run_classifier" in mermaid_code:
                    flowables.append(Spacer(1, 5))
                    flowables.append(create_inferenz_engine_diagram())
                    flowables.append(Spacer(1, 5))
                elif "Feedback-Logik" in mermaid_code or "Welche Klasse?" in mermaid_code:
                    flowables.append(Spacer(1, 5))
                    flowables.append(create_led_display_controller_diagram())
                    flowables.append(Spacer(1, 5))
                elif "GATT Notification" in mermaid_code or "GATT-Service" in mermaid_code:
                    flowables.append(Spacer(1, 5))
                    flowables.append(create_ble_streamer_diagram())
                    flowables.append(Spacer(1, 5))
                elif "Physische Platzierung" in mermaid_code or "Armbandlaschen" in mermaid_code:
                    flowables.append(Spacer(1, 5))
                    flowables.append(create_gehause_diagram())
                    flowables.append(Spacer(1, 5))
                elif "React Native App Container" in mermaid_code:
                    flowables.append(Spacer(1, 5))
                    flowables.append(create_container_diagram())
                    flowables.append(Spacer(1, 5))
            continue
            
        # 2. Check for decision blocks
        if line_strip.startswith('Entscheidung:'):
            decision_text = line_strip[13:].strip()
            p_style = ParagraphStyle(
                'DecisionStyle',
                parent=styles['Normal'],
                fontName='Helvetica-Bold',
                fontSize=9.5,
                textColor=colors.HexColor('#0c1816'),
                backColor=colors.HexColor('#eafaf1'), # Light green background
                borderColor=colors.HexColor('#22c55e'), # Green border
                borderWidth=1,
                borderPadding=8,
                spaceBefore=6,
                spaceAfter=12
            )
            flowables.append(Paragraph(f"<font color='#22c55e'>✔</font> <b>Entscheidung:</b> {decision_text}", p_style))
            i += 1
            continue
            
        # 3. Check for table blocks
        if line_strip.startswith('|'):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
                
            if len(table_lines) >= 2:
                # Parse header
                header_cells = [c.strip() for c in table_lines[0].split('|')[1:-1]]
                
                # Check for separator row
                sep_cells = [c.strip() for c in table_lines[1].split('|')[1:-1]]
                has_separator = all(re.match(r'^[-:\s]+$', c) for c in sep_cells)
                
                data_start_idx = 2 if has_separator else 1
                
                table_data = []
                # Header row
                header_row = [Paragraph(f"<b>{clean_md_tags(cell)}</b>", ParagraphStyle('TH', parent=styles['Normal'], textColor=colors.white, fontName='Helvetica-Bold', fontSize=8.5, alignment=1)) for cell in header_cells]
                table_data.append(header_row)
                
                # Data rows
                for r_idx in range(data_start_idx, len(table_lines)):
                    row_cells = [c.strip() for c in table_lines[r_idx].split('|')[1:-1]]
                    row_flowables = []
                    for cell in row_cells:
                        cleaned = clean_md_tags(cell)
                        if cleaned.startswith('+'):
                            cleaned = f"<b><font color='#16a34a'>+</font></b> {cleaned[1:].strip()}"
                        elif cleaned.startswith('-'):
                            cleaned = f"<b><font color='#dc2626'>-</font></b> {cleaned[1:].strip()}"
                        row_flowables.append(Paragraph(cleaned, styles['TableCell']))
                    while len(row_flowables) < len(header_cells):
                        row_flowables.append(Paragraph("", styles['TableCell']))
                    table_data.append(row_flowables[:len(header_cells)])
                
                col_width = 487 / len(header_cells)
                t = Table(table_data, colWidths=[col_width] * len(header_cells))
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0c1816')),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
                    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f9fafb')]),
                    ('TOPPADDING', (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ('LEFTPADDING', (0,0), (-1,-1), 8),
                    ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ]))
                flowables.append(t)
                flowables.append(Spacer(1, 8))
            continue

        # 4. Check for requirement definition header like **UC-1**: or **FA1**: or **NF1**:
        is_def_header = re.match(r'^\*\*(UC-\d+|FA\d+(?:\.\d+)*|NF\d+(?:\.\d+)*|R\d+(?:\.\d+)*)\*\*:\s*(.*)$', line_strip)
        if is_def_header:
            item_id = is_def_header.group(1)
            title = is_def_header.group(2).strip()
            
            # Look ahead for description lines
            desc_lines = []
            next_idx = i + 1
            while next_idx < len(lines):
                next_line = lines[next_idx].strip()
                if not next_line:
                    next_idx += 1
                    continue
                if (next_line.startswith('#') or 
                    next_line.startswith('---') or 
                    next_line.startswith('*') or 
                    next_line.startswith('-') or 
                    next_line.startswith('•') or 
                    re.match(r'^\d+\.', next_line) or
                    re.match(r'^\*\*(UC-\d+|FA\d+(?:\.\d+)*|NF\d+(?:\.\d+)*|R\d+(?:\.\d+)*)\*\*:', next_line)):
                    break
                desc_lines.append(next_line)
                next_idx += 1
                
            desc_text = " ".join(desc_lines) if desc_lines else ""
            
            clean_title = clean_md_tags(title)
            clean_desc = clean_md_tags(desc_text)
            
            card = make_requirement_card(item_id, clean_title, clean_desc, styles)
            flowables.append(card)
            flowables.append(Spacer(1, 6))
            
            i = next_idx
            continue

        # 5. Horizontal Rule
        if line_strip == '---' or line_strip == '***':
            line_table = Table([['']], colWidths=[487], rowHeights=[1], style=TableStyle([
                ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            flowables.append(Spacer(1, 6))
            flowables.append(line_table)
            flowables.append(Spacer(1, 6))
            i += 1
            continue
            
        # 6. Blockquote
        if line_strip.startswith('>'):
            quote_text = line_strip[1:].strip()
            quote_style = ParagraphStyle(
                'BlockQuote',
                parent=styles['NormalText'],
                fontName='Helvetica-Oblique',
                leftIndent=15,
                textColor=colors.HexColor('#4b5563')
            )
            flowables.append(Paragraph(clean_md_tags(quote_text), quote_style))
            flowables.append(Spacer(1, 4))
            i += 1
            continue

        # 7. Headers (notify TOC implicitly if subclassed MyDocTemplate handles Heading1/2)
        if line.startswith('# '):
            flowables.append(Paragraph(clean_md_tags(line[2:]), styles['Heading1']))
            flowables.append(Spacer(1, 8))
        elif line.startswith('## '):
            flowables.append(Paragraph(clean_md_tags(line[3:]), styles['Heading2']))
            flowables.append(Spacer(1, 6))
        elif line.startswith('### '):
            flowables.append(Paragraph(clean_md_tags(line[4:]), styles['Heading3']))
            flowables.append(Spacer(1, 6))
        elif line.startswith('#### '):
            flowables.append(Paragraph(clean_md_tags(line[5:]), styles['Heading4']))
            flowables.append(Spacer(1, 4))
        # 8. Lists
        elif line_strip.startswith('•') or line_strip.startswith('-') or line_strip.startswith('*'):
            bullet_text = line_strip[1:].strip()
            flowables.append(Paragraph(f"&bull; {clean_md_tags(bullet_text)}", styles['BulletStyle']))
            flowables.append(Spacer(1, 3))
        elif re.match(r'^\d+\.', line_strip):
            match = re.match(r'^(\d+)\.(.*)$', line_strip)
            num = match.group(1)
            content = match.group(2).strip()
            
            left_indent = 15
            if line.startswith('  ') or line.startswith('\t'):
                left_indent = 25
                
            num_style = ParagraphStyle(
                'NumList',
                parent=styles['Normal'],
                leftIndent=left_indent,
                firstLineIndent=-10,
                spaceAfter=3
            )
            flowables.append(Paragraph(f"{num}. {clean_md_tags(content)}", num_style))
        # 9. Regular text
        else:
            flowables.append(Paragraph(clean_md_tags(line_strip), styles['NormalText']))
            flowables.append(Spacer(1, 4))
            
        i += 1
            
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
    d.add(String(x + w/2, y + h - 14, title, fontName='Helvetica-Bold', fontSize=9, textAnchor='middle', fillColor=text_color))
    
    # Draw Tech (italic/oblique)
    d.add(String(x + w/2, y + h - 24, f"[{tech}]", fontName='Helvetica-Oblique', fontSize=7, textAnchor='middle', fillColor=tech_color))
    
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

    desc_lines = wrap_text(desc, max_chars=26)
    start_y = y + h - 34
    for idx, line in enumerate(desc_lines):
        line_y = start_y - idx * 8.5
        d.add(String(x + w/2, line_y, line, fontName='Helvetica', fontSize=6.2, textAnchor='middle', fillColor=desc_color))

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

def create_data_control_flow_diagram():
    d = Drawing(480, 185)
    d.add(Rect(0, 0, 480, 185, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    
    teal = colors.HexColor('#00a685')
    purple = colors.HexColor('#8b5cf6')
    grey = colors.HexColor('#666666')
    
    # Draw 5 blocks
    draw_c4_box(d, 15, 60, 80, 60, "LSM6DS3 Sensor", "Hardware IMU", "Erfasst Rohbeschleunigung & Gyro mit 50Hz.", "external")
    draw_c4_box(d, 105, 60, 80, 60, "XIAO MCU", "nRF52840 MCU", "Filtert Rohwerte, führt Edge Impulse Inferenz aus.", "component")
    draw_c4_box(d, 200, 60, 80, 60, "Mobile App", "React Native", "Empfängt BLE-Pakete, aktualisiert UI State.", "container")
    draw_c4_box(d, 295, 60, 80, 60, "Backend API", "Node.js Express", "Empfängt Trainingsdaten per WebSockets.", "container")
    draw_c4_box(d, 390, 60, 80, 60, "Datenbank", "PostgreSQL", "Speichert historische Trainingsdaten.", "external")
    
    # --- Forward Data Flow (Upper path, y=95) ---
    draw_c4_arrow(d, 95, 95, 105, 95, "Rohwerte", grey)
    draw_c4_arrow(d, 185, 95, 200, 95, "BLE Daten", teal)
    draw_c4_arrow(d, 280, 95, 295, 95, "WS Daten", teal)
    draw_c4_arrow(d, 375, 95, 390, 95, "SQL Insert", grey)
    
    # --- Backward Control & Feedback Flow (Lower path, y=85) ---
    draw_c4_arrow(d, 390, 85, 375, 85, "Ack OK", grey, is_dashed=True)
    draw_c4_arrow(d, 295, 85, 280, 85, "Sync OK", teal, is_dashed=True)
    draw_c4_arrow(d, 200, 85, 185, 85, "BLE Ctrl", teal, is_dashed=True)
    
    # Explanatory annotations
    d.add(String(240, 25, "Datenfluss: Sensorik (50Hz) -> Inferenz -> BLE Notification -> UI State -> WebSockets -> DB", fontName='Helvetica-Oblique', fontSize=7, textAnchor='middle', fillColor=colors.HexColor('#4b5563')))
    d.add(String(240, 13, "Kontroll- & Feedbackfluss: Datenbank-Ack -> Sync-Bestätigung -> BLE-Steuerung", fontName='Helvetica-Oblique', fontSize=7, textAnchor='middle', fillColor=colors.HexColor('#4b5563')))
    return d

def create_firmware_dataflow_diagram():
    d = Drawing(480, 175)
    d.add(Rect(0, 0, 480, 175, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    
    teal = colors.HexColor('#00a685')
    purple = colors.HexColor('#8b5cf6')
    grey = colors.HexColor('#666666')
    
    # Draw boxes
    draw_c4_box(d, 15, 105, 85, 50, "LSM6DS3 Sensor", "Hardware IMU", "Beschleunigung & Gyro.", "external")
    draw_c4_box(d, 120, 105, 95, 50, "Sensordatenerfassung", "C++ Component", "Taktet Erfassung mit 50Hz.", "component")
    draw_c4_box(d, 240, 105, 95, 50, "Inferenz-Engine", "CNN Classifier", "Klassifiziert Curls.", "component")
    draw_c4_box(d, 360, 105, 105, 50, "BLE-Streamer", "C++ Component", "Streamt Daten via GATT.", "component")
    
    draw_c4_box(d, 360, 15, 105, 50, "Mobile App", "React Native", "Empfängt BLE Pakete.", "external")
    draw_c4_box(d, 240, 15, 95, 50, "LED-Controller", "C++ Component", "Steuert Feedback-LEDs.", "component")
    draw_c4_box(d, 120, 15, 95, 50, "RGB-LEDs", "Hardware LED", "Zeigt Status rot/grün/blau.", "external")
    
    # Draw arrows
    draw_c4_arrow(d, 100, 130, 120, 130, "Rohwerte", grey)
    draw_c4_arrow(d, 215, 130, 240, 130, "Buffer", purple)
    draw_c4_arrow(d, 335, 130, 360, 130, "Ergebnis", purple)
    draw_c4_arrow(d, 412, 105, 412, 65, "BLE Notify", teal)
    draw_c4_arrow(d, 287, 105, 287, 65, "Klasse", purple)
    draw_c4_arrow(d, 240, 40, 215, 40, "Signal", purple)
    
    return d

def create_sensordatenerfassung_diagram():
    d = Drawing(480, 95)
    d.add(Rect(0, 0, 480, 95, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    
    teal = colors.HexColor('#00a685')
    purple = colors.HexColor('#8b5cf6')
    grey = colors.HexColor('#666666')
    
    # Draw boxes
    draw_c4_box(d, 15, 20, 95, 50, "LSM6DS3 Sensor", "Hardware IMU", "Erfasst Beschleunigung & Drehung.", "external")
    draw_c4_box(d, 130, 20, 95, 50, "Executable.ino (Loop)", "C++ Component", "Taktet Erfassung mit 50Hz.", "component")
    draw_c4_box(d, 245, 20, 105, 50, "Skalierung & Filter", "C++ Modul", "Rechnet in m/s^2 um & clampt auf 2G.", "component")
    draw_c4_box(d, 370, 20, 95, 50, "DSP Puffer", "Memory Buffer", "Speichert Daten für Inferenz-Engine.", "component")
    
    # Draw arrows
    draw_c4_arrow(d, 110, 45, 130, 45, "I2C Rohwert", grey)
    draw_c4_arrow(d, 225, 45, 245, 45, "Clamping 2G", purple)
    draw_c4_arrow(d, 350, 45, 370, 45, "Befüllen", purple)
    
    return d

def create_inferenz_engine_diagram():
    d = Drawing(480, 95)
    d.add(Rect(0, 0, 480, 95, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    
    purple = colors.HexColor('#8b5cf6')
    
    # Draw boxes
    draw_c4_box(d, 15, 20, 95, 50, "DSP Puffer (6 Achsen)", "Data Buffer", "Hält 6-Achsen-Messdaten.", "component")
    draw_c4_box(d, 130, 20, 95, 50, "CNN Modell", "TensorFlow Lite", "Klassifiziert Bewegungsmuster.", "component")
    draw_c4_box(d, 245, 20, 105, 50, "Klassenauswertung", "C++ Modul", "Bestimmt beste Klasse & Wahrscheinlichkeit.", "component")
    draw_c4_box(d, 370, 20, 95, 50, "Feedback / PC-Stream", "Output Interface", "Gibt Ergebnisse lokal & seriell aus.", "component")
    
    # Draw arrows
    draw_c4_arrow(d, 110, 45, 130, 45, "run_classifier", purple)
    draw_c4_arrow(d, 225, 45, 245, 45, "Scores", purple)
    draw_c4_arrow(d, 350, 45, 370, 45, "Treffer", purple)
    
    return d

def create_led_display_controller_diagram():
    d = Drawing(480, 140)
    d.add(Rect(0, 0, 480, 140, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    
    teal = colors.HexColor('#00a685')
    purple = colors.HexColor('#8b5cf6')
    
    # Draw boxes
    draw_c4_box(d, 15, 45, 90, 50, "Inferenz-Ergebnis", "Data Input", "Klassifikation & Konfidenz.", "component")
    draw_c4_box(d, 135, 45, 90, 50, "Feedback-Logik", "C++ Component", "Entscheidet über Anzeige/LED Farbe.", "component")
    
    draw_c4_box(d, 265, 90, 100, 40, "IDLE (Blau leuchten)", "OLED / LED Action", "OLED: Status IDLE", "external")
    draw_c4_box(d, 265, 45, 100, 40, "PERFEKT (Grün leuchten)", "OLED / LED Action", "OLED: Curl PERFEKT", "external")
    draw_c4_box(d, 265, 0, 100, 40, "FEHLER (Rot leuchten)", "OLED / LED Action", "OLED: Achtung FEHLER", "external")
    
    # Draw arrows
    draw_c4_arrow(d, 105, 70, 135, 70, "Treffer", purple)
    
    # Branching arrows
    draw_c4_arrow(d, 225, 80, 265, 110, "idle / <60%", teal)
    draw_c4_arrow(d, 225, 70, 265, 65, "curl_sauber", teal)
    draw_c4_arrow(d, 225, 60, 265, 20, "fehler", teal)
    
    return d

def create_ble_streamer_diagram():
    d = Drawing(480, 95)
    d.add(Rect(0, 0, 480, 95, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    
    teal = colors.HexColor('#00a685')
    purple = colors.HexColor('#8b5cf6')
    
    # Draw boxes
    draw_c4_box(d, 20, 20, 100, 50, "Sensor-Rohwerte", "Data Source", "Liefert ax, ay, az, gx, gy, gz.", "external")
    draw_c4_box(d, 190, 20, 100, 50, "BLE-Streamer Component", "nRF52840 BLE Service", "Paketiert Daten in 24-Byte-GATT-Puffer.", "component")
    draw_c4_box(d, 360, 20, 100, 50, "Mobile App", "useBLE Hook", "Empfängt und parst Datenpakete.", "external")
    
    # Draw arrows
    draw_c4_arrow(d, 120, 45, 190, 45, "IMU Werte", purple)
    draw_c4_arrow(d, 290, 45, 360, 45, "GATT Notify", teal)
    
    return d

def create_gehause_diagram():
    d = Drawing(480, 140)
    d.add(Rect(0, 0, 480, 140, rx=10, ry=10, fillColor=colors.HexColor('#f9fafb'), strokeColor=colors.HexColor('#e5e7eb'), strokeWidth=0.5))
    
    teal = colors.HexColor('#00a685')
    purple = colors.HexColor('#8b5cf6')
    
    # Draw boxes
    draw_c4_box(d, 20, 75, 110, 45, "XIAO Controller", "Hardware Core", "XIAO nRF52840 Sense + OLED.", "component")
    draw_c4_box(d, 20, 15, 110, 45, "LiPo-Akku", "Hardware Power", "Bietet Energie für autonomen Betrieb.", "component")
    draw_c4_box(d, 185, 42, 110, 50, "3D-Druck Gehäuse", "Physical Enclosure", "Umschließt und schützt die Hardware.", "component")
    draw_c4_box(d, 350, 42, 110, 50, "Sportarmband (20mm)", "Wearable Strap", "Fixiert den Sensor stabil am Arm des Nutzers.", "external")
    
    # Draw arrows
    draw_c4_arrow(d, 130, 97, 185, 77, "Umschlossen", purple)
    draw_c4_arrow(d, 130, 37, 185, 57, "Umschlossen", purple)
    draw_c4_arrow(d, 295, 67, 350, 67, "Befestigt", teal)
    
    return d

def get_component_clean_markdown(content, section_num):
    content_clean = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    lines = content_clean.split('\n')
    clean_lines = []
    for line in lines:
        stripped = line.strip()
        if line.startswith('# '):
            title = line[2:].strip()
            clean_lines.append(f"### {section_num} {title}")
        elif line.startswith('## '):
            title = line[3:].strip()
            clean_lines.append(f"#### {title}")
        elif line.startswith('### '):
            title = line[4:].strip()
            clean_lines.append(f"**{title}**")
        else:
            clean_lines.append(line)
    return '\n'.join(clean_lines)

def get_container_clean_markdown(content):
    content_clean = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    lines = content_clean.split('\n')
    clean_lines = []
    clean_lines.append("### 4.1.1 Container-Architektur & Beschreibung")
    for line in lines:
        stripped = line.strip()
        if line.startswith('# ') or stripped == '# FA2':
            continue
        if line.startswith('## '):
            title = line[3:].strip()
            clean_lines.append(f"#### {title}")
        elif line.startswith('### '):
            title = line[4:].strip()
            clean_lines.append(f"**{title}**")
        else:
            clean_lines.append(line)
    return '\n'.join(clean_lines)

# --- Subclass SimpleDocTemplate for Table of Contents ---
class MyDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            style = flowable.style.name
            text = flowable.getPlainText()
            if style in ('Heading1', 'Heading2'):
                level = 0 if style == 'Heading1' else 1
                key = f"h_{id(flowable)}"
                # Register bookmark destination
                self.canv.bookmarkPage(key)
                try:
                    self.canv.addOutlineEntry(text, key, level=level, closed=False)
                except Exception as e:
                    # In some passes canv might not support addOutlineEntry
                    pass
                # Notify TOC with the bookmark key
                self.notify('TOCEntry', (level, text, self.page, key))
                print(f"[TOC] {style} detected: {text} on page {self.page} (key: {key})")

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
    doc = MyDocTemplate(
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
    
    styles.add(ParagraphStyle(
        'MatrixCell',
        parent=styles['Normal'],
        fontSize=7.2,
        leading=9.0,
        textColor=text_color
    ))

    styles['Heading4'].parent = styles['Normal']
    styles['Heading4'].fontName = 'Helvetica-Bold'
    styles['Heading4'].fontSize = 10
    styles['Heading4'].leading = 13
    styles['Heading4'].textColor = colors.HexColor('#627c78')
    styles['Heading4'].spaceBefore = 8
    styles['Heading4'].spaceAfter = 4
    styles['Heading4'].keepWithNext = True

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
    
    # ------------------ TABLE OF CONTENTS ------------------
    toc_title_style = ParagraphStyle(
        'TOCTitleStyle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0c1816'),
        spaceBefore=0,
        spaceAfter=15,
        keepWithNext=True
    )
    story.append(Paragraph("Gliederung (Inhaltsverzeichnis)", toc_title_style))
    story.append(Paragraph("Dieses Dokument gliedert sich in die folgenden Abschnitte:", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    from reportlab.platypus.tableofcontents import TableOfContents
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(
            name='TOCHeading1',
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#0c1816'),
            spaceBefore=6,
            spaceAfter=4
        ),
        ParagraphStyle(
            name='TOCHeading2',
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            leftIndent=20,
            textColor=colors.HexColor('#627c78')
        ),
    ]
    story.append(toc)
    story.append(PageBreak())
    
    # Create a dictionary for easy access to the markdown files by their relative path
    files_by_path = {f['path']: f for f in data['files']}
    
    # ------------------ SECTION 1: USE CASES ------------------
    story.append(Paragraph("1. Anwendungsfälle (Use Cases)", styles['Heading1']))
    story.append(Paragraph("In diesem Abschnitt werden die primären Anwendungsfälle (Use Cases) des MoveLink-Systems beschrieben. Diese Use Cases definieren die Benutzerinteraktionen und Systemantworten für das Verbinden von Geräten, das Echtzeit-Training und das Einsehen historischer Daten.", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    if 'doc/UseCases.md' in files_by_path:
        content = files_by_path['doc/UseCases.md']['content']
        content_lines = content.split('\n')
        # Skip the main title of the markdown file to avoid duplicate headers
        if content_lines and content_lines[0].startswith('# '):
            content_lines = content_lines[1:]
        flowables = markdown_to_flowables('\n'.join(content_lines), styles)
        story.extend(flowables)
    else:
        story.append(Paragraph("Warnung: doc/UseCases.md wurde nicht im Scrape-Datensatz gefunden.", styles['NormalText']))
        
    story.append(PageBreak())
    
    # ------------------ SECTION 2: SYSTEMANFORDERNUGEN (REQUIREMENTS) ------------------
    story.append(Paragraph("2. Systemanforderungen (Requirements)", styles['Heading1']))
    story.append(Paragraph("Dieser Abschnitt enthält die funktionalen Anforderungen (FA), nicht-funktionalen Anforderungen (NF) und Randbedingungen (R) des MoveLink-Systems.", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    if 'doc/Requirements.md' in files_by_path:
        content = files_by_path['doc/Requirements.md']['content']
        # We split to get everything except the 'Abwägungen' section, which goes into Section 3
        parts = content.split('## Abwägungen')
        reqs_content = parts[0]
        reqs_lines = reqs_content.split('\n')
        # Skip main title
        if reqs_lines and reqs_lines[0].startswith('# '):
            reqs_lines = reqs_lines[1:]
        flowables = markdown_to_flowables('\n'.join(reqs_lines), styles)
        story.extend(flowables)
    else:
        story.append(Paragraph("Warnung: doc/Requirements.md wurde nicht im Scrape-Datensatz gefunden.", styles['NormalText']))
        
    story.append(PageBreak())
    
    # ------------------ SECTION 3: ARCHITEKTURENTSCHEIDUNGEN (ADR) ------------------
    story.append(Paragraph("3. Architekturentscheidungen (ADR / Abwägungen)", styles['Heading1']))
    story.append(Paragraph("In diesem Abschnitt werden die zentralen Architekturentscheidungen (Architecture Decision Records) und Abwägungen bezüglich Hardware, App-Framework und Auswertungstechnologie dokumentiert.", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    if 'doc/Requirements.md' in files_by_path:
        content = files_by_path['doc/Requirements.md']['content']
        parts = content.split('## Abwägungen')
        if len(parts) > 1:
            adr_content = "## Abwägungen\n" + parts[1]
            flowables = markdown_to_flowables(adr_content, styles)
            story.extend(flowables)
        else:
            story.append(Paragraph("Warnung: Keine Abwägungen in doc/Requirements.md gefunden.", styles['NormalText']))
    else:
        story.append(Paragraph("Warnung: doc/Requirements.md wurde nicht im Scrape-Datensatz gefunden.", styles['NormalText']))
        
    story.append(PageBreak())
    
    # ------------------ SECTION 4: C4 MODEL WITH SUB-SECTIONS ------------------
    story.append(Paragraph("4. System-Architektur (C4 Modell)", styles['Heading1']))
    story.append(Paragraph("Die Software-Architektur von MoveLink ist nach dem C4-Modell strukturiert. Im Folgenden werden die einzelnen Container des Systems (Embedded Firmware, Mobile App und Datenbank & Backend) im Detail beschrieben. Für jeden dieser Unterpunkte werden die C4-Komponenten und Datenflüsse visuell und textuell dargestellt, gefolgt von den Anforderungen und der Architekturentscheidung (ADR).", styles['NormalText']))
    story.append(Spacer(1, 10))
    
    # --- 4.1 embedded ---
    story.append(Paragraph("<a name='sec_embedded'></a>4.1 Embedded Sensor-Firmware (Xiao MCU)", styles['Heading2']))
    story.append(Paragraph("Die Sensor-Firmware läuft auf dem <b>XIAO nRF52840 Sense Controller</b>. Sie erfasst Beschleunigungs- und Rotationsdaten über den LSM6DS3-Sensor, wendet Filter an und überträgt Daten per BLE oder wertet sie per Edge-Inferenz direkt auf dem Chip aus.", styles['NormalText']))
    story.append(Spacer(1, 8))
    
    # Show Component diagram first
    story.append(Paragraph("Architektur-Abbildung (Komponenten)", styles['Heading3']))
    story.append(Paragraph("Das folgende Komponenten-Diagramm zeigt die inneren Module der Sensor-Firmware sowie die Kopplung von Sensor-Loop, Edge Impulse Inferenz und dem BLE Service:", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_firmware_components_diagram())
    story.append(Spacer(1, 10))
    
    # Parse the clean markdown containing requirements, dataflow diagram (automatically mapped by the parser), and ADR
    if 'embedded/architecture.md' in files_by_path:
        raw_content = files_by_path['embedded/architecture.md']['content']
        parts = raw_content.split('## Abwägungen')
        
        # 4.1.1 Container-Architektur & Beschreibung
        part1 = parts[0]
        clean_part1 = get_container_clean_markdown(part1)
        story.extend(markdown_to_flowables(clean_part1, styles))
        
        # 4.1.2 to 4.1.6 Component Sub-chapters
        embedded_components = [
            ('embedded/components/sensordatenerfassung/architecture.md', '4.1.2'),
            ('embedded/components/inferenz_engine/architecture.md', '4.1.3'),
            ('embedded/components/led_display_controller/architecture.md', '4.1.4'),
            ('embedded/components/ble_streamer/architecture.md', '4.1.5'),
            ('embedded/components/gehause/architecture.md', '4.1.6')
        ]
        for comp_path, section_num in embedded_components:
            if comp_path in files_by_path:
                story.append(Spacer(1, 10))
                comp_content = get_component_clean_markdown(files_by_path[comp_path]['content'], section_num)
                story.extend(markdown_to_flowables(comp_content, styles))
                
        # 4.1.7 Abwägungen & Architekturentscheidungen (ADR)
        if len(parts) > 1:
            story.append(Spacer(1, 10))
            adr_content = "### 4.1.7 Abwägungen & Architekturentscheidungen\n" + parts[1]
            story.extend(markdown_to_flowables(adr_content, styles))
                
    story.append(PageBreak())
    
    # --- 4.2 App ---
    story.append(Paragraph("<a name='sec_app'></a>4.2 Mobile App (React Native)", styles['Heading2']))
    story.append(Paragraph("Die Mobile App bildet das Benutzer-Interface (UI) des Systems. Sie verbindet sich per BLE mit der Xiao MCU, visualisiert Live-Bewegungsdaten und synchronisiert sie mit dem Backend.", styles['NormalText']))
    story.append(Spacer(1, 8))
    
    # Show Component diagram first
    story.append(Paragraph("Architektur-Abbildung (Komponenten)", styles['Heading3']))
    story.append(Paragraph("Das folgende Komponenten-Diagramm veranschaulicht die Benutzeroberflächen-Module und Custom React Hooks des App-Containers:", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_app_components_diagram())
    story.append(Spacer(1, 10))
    
    # Parse app/architecture.md
    if 'app/architecture.md' in files_by_path:
        clean_content = get_clean_markdown(files_by_path['app/architecture.md']['content'])
        story.extend(markdown_to_flowables(clean_content, styles))
        
    # ADR
    story.append(Paragraph("Architekturentscheidung (ADR / Abwägungen)", styles['Heading3']))
    story.append(Paragraph("<b>Entscheidung:</b> Verwendung von <b>React Native (Hybrid-App)</b> zur plattformübergreifenden Entwicklung mit hoher Code-Wiederverwendbarkeit und schnellen UI-Iterationen, bei gleichzeitiger Optimierung des SVG-Diagramm-Renderings für den 50Hz Datenstrom.", styles['NormalText']))
    story.append(Spacer(1, 8))
    story.append(PageBreak())
    
    # --- 4.3 Datenbank ---
    story.append(Paragraph("<a name='sec_database'></a>4.3 Datenbank & Backend (PostgreSQL & Node.js)", styles['Heading2']))
    story.append(Paragraph("Der Datenbank- und Backend-Container dient als zentraler Speicher und API-Gateway des Gesamtsystems. Er nimmt Profile und Trainingshistorien auf und stellt diese persistent bereit.", styles['NormalText']))
    story.append(Spacer(1, 8))
    
    # Show System Context diagram first
    story.append(Paragraph("System-Kontext-Diagramm (C4 Level 1)", styles['Heading3']))
    story.append(Paragraph("Das folgende System-Kontext-Diagramm zeigt die Position des MoveLink-Systems in seiner Betriebsumgebung, die Interaktion mit dem Trainierenden sowie die Verbindung zur persistenten Datenbank:", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_system_context_diagram())
    story.append(Spacer(1, 10))
    
    # Parse database/architecture.md
    if 'database/architecture.md' in files_by_path:
        clean_content = get_clean_markdown(files_by_path['database/architecture.md']['content'])
        story.extend(markdown_to_flowables(clean_content, styles))
        
    # End-to-End flow diagram
    story.append(Paragraph("System-Daten- &amp; Kontrollfluss-Diagramm", styles['Heading3']))
    story.append(Paragraph("Das folgende Diagramm visualisiert den End-to-End Daten- und Kontrollfluss im Gesamtsystem:", styles['NormalText']))
    story.append(Spacer(1, 5))
    story.append(create_data_control_flow_diagram())
    story.append(Spacer(1, 10))
    
    # ADR
    story.append(Paragraph("Architekturentscheidung (ADR / Abwägungen)", styles['Heading3']))
    story.append(Paragraph("<b>Entscheidung:</b> Verwendung einer <b>PostgreSQL-Datenbank</b> zur persistenten und relationalen Ablage von Trainingsdaten und Nutzerprofilen. Das Backend wird mit <b>Node.js & Express</b> realisiert, um hohe Parallelität zu gewährleisten und asynchrone WebSocket-Verbindungen für Live-Streaming-Daten ressourcenschonend zu verarbeiten.", styles['NormalText']))
    story.append(Spacer(1, 8))
    story.append(PageBreak())
    
    # ------------------ SECTION 5: TRACEABILITY MATRIX (AT THE END) ------------------
    story.append(Paragraph("5. Rückverfolgbarkeits-Matrix (Traceability)", styles['Heading1']))
    story.append(Paragraph("Die folgende Matrix veranschaulicht die Beziehungen und Verknüpfungen zwischen den Use Cases, den funktionalen Anforderungen (FA), den Systemkomponenten und den entsprechenden Klassen/Code-Dateien im System. Klicken Sie auf eine Anforderungs-ID, um zu deren Definition zu springen, oder auf eine Komponente, um deren C4-Modell-Kapitel aufzurufen.", styles['NormalText']))
    story.append(Spacer(1, 10))

    # Build the data tree
    container_ids = ['FA1', 'FA2', 'FA3']
    container_names = {
        'FA1': 'Applikation (Mobile App)',
        'FA2': 'Trainingsgerät (Sensor-Firmware)',
        'FA3': 'Datenbank & Backend'
    }
    
    container_files = [f for f in data['files'] if f.get('c4_level') == 'Container']
    use_cases = sorted([d for d in data['definitions'].values() if d['type'] == 'UC'], key=lambda x: x['id'])
    
    # Natural sort helper for requirements
    def get_sort_key(item_id):
        if not item_id:
            return [0]
        cleaned = re.sub(r'[^0-9.]', '', item_id)
        parts = cleaned.split('.')
        return [int(p) for p in parts if p.isdigit()]

    tree = []
    for container_id in container_ids:
        # Find container file
        container_file = None
        for f in container_files:
            if container_id == 'FA1' and 'app/' in f['path']:
                container_file = f
                break
            if container_id == 'FA2' and 'embedded/' in f['path']:
                container_file = f
                break
            if container_id == 'FA3' and 'database/' in f['path']:
                container_file = f
                break
        
        container_title = container_names.get(container_id, container_file['title'] if container_file else container_id)
        
        # Parse container components
        container_content = container_file['content'] if container_file else ""
        container_components = parse_container_components(container_content)
        
        # Find all Sub-FAs for this container (like FA1.1, FA1.2...)
        sub_fas = []
        for d in data['definitions'].values():
            if d['id'].startswith(container_id + '.') and d['id'].count('.') == 1:
                sub_fas.append(d)
        sub_fas = sorted(sub_fas, key=lambda x: get_sort_key(x['id']))
        
        sub_fa_tree = []
        for sub_fa in sub_fas:
            # Find all Detail-FAs (like FA1.1.1, FA1.1.2...)
            detail_fas = []
            for d in data['definitions'].values():
                if d['id'].startswith(sub_fa['id'] + '.') and d['id'].count('.') == 2:
                    detail_fas.append(d)
            detail_fas = sorted(detail_fas, key=lambda x: get_sort_key(x['id']))
            
            # Find matching component map
            comp_map = None
            for c in container_components:
                if c['reqId'] == sub_fa['id']:
                    comp_map = c
                    break
            
            component_name = comp_map['name'] if comp_map else '-'
            component_path = comp_map['path'] if comp_map else ''
            
            # Resolve classes
            if comp_map:
                classes = get_component_classes(comp_map['path'], data.get('codeContents', {}))
            else:
                classes = get_class_for_req(sub_fa['id'], data.get('references', {}))
                
            sub_fa_tree.append({
                'id': sub_fa['id'],
                'title': sub_fa['title'],
                'detailFAs': detail_fas,
                'component': component_name,
                'componentPath': component_path,
                'classes': classes
            })
            
        if not sub_fa_tree:
            sub_fa_tree.append({
                'id': '',
                'title': '(unbenannt)',
                'detailFAs': [],
                'component': '-',
                'componentPath': '',
                'classes': []
            })
            
        tree.append({
            'id': container_id,
            'title': container_title,
            'subFAs': sub_fa_tree
        })

    # Generate rows & rowspans
    rendered_rows = []
    for container in tree:
        container_total_rows = 0
        for sub in container['subFAs']:
            sub_rows = len(sub['detailFAs']) if sub['detailFAs'] else 1
            container_total_rows += sub_rows
            
        for sub_idx, sub in enumerate(container['subFAs']):
            sub_rows = len(sub['detailFAs']) if sub['detailFAs'] else 1
            
            if not sub['detailFAs']:
                rendered_rows.append({
                    'container': container,
                    'container_row_span': container_total_rows if sub_idx == 0 else 0,
                    'sub_fa': sub,
                    'sub_fa_row_span': 1,
                    'detail_fa': None,
                    'classes': sub['classes'],
                    'is_first_row': sub_idx == 0
                })
            else:
                for det_idx, det in enumerate(sub['detailFAs']):
                    rendered_rows.append({
                        'container': container,
                        'container_row_span': container_total_rows if (sub_idx == 0 and det_idx == 0) else 0,
                        'sub_fa': sub,
                        'sub_fa_row_span': sub_rows if det_idx == 0 else 0,
                        'detail_fa': det,
                        'classes': sub['classes'],
                        'is_first_row': sub_idx == 0 and det_idx == 0
                    })

    # Compute Use Case spans
    total_rows = len(rendered_rows)
    uc_count = len(use_cases)
    uc_spans = []
    remaining = total_rows
    for i in range(uc_count):
        span = remaining if i == uc_count - 1 else total_rows // uc_count
        uc_spans.append(span)
        remaining -= span

    # Table data construction
    table_data = [[
        Paragraph("<b>Use Case (UC)</b>", styles['TableHeader']),
        Paragraph("<b>Mappings</b>", styles['TableHeader']),
        Paragraph("<b>FA Ebene 1</b>", styles['TableHeader']),
        Paragraph("<b>Sub-FA Ebene 2</b>", styles['TableHeader']),
        Paragraph("<b>Component</b>", styles['TableHeader']),
        Paragraph("<b>Detail-FA Ebene 3</b>", styles['TableHeader']),
        Paragraph("<b>Klassenebene (Klasse)</b>", styles['TableHeader'])
    ]]

    uc_current_idx = 0
    uc_row_count = 0
    table_spans = []

    for r_idx, row in enumerate(rendered_rows):
        row_cells = [""] * 7
        
        # Column 1: Use Case
        if r_idx == 0 or uc_row_count >= uc_spans[uc_current_idx]:
            if r_idx > 0:
                uc_current_idx += 1
            uc_row_count = 0
            uc = use_cases[uc_current_idx] if uc_current_idx < len(use_cases) else {'id': f'UC-{uc_current_idx+1}', 'title': ''}
            span = uc_spans[uc_current_idx]
            
            uc_text = f"<b>{uc['id']}</b><br/><font size='6.5' color='#627c78'>{uc['title']}</font>"
            row_cells[0] = Paragraph(uc_text, styles['MatrixCell'])
            
            if span > 1:
                table_spans.append(('SPAN', (0, r_idx + 1), (0, r_idx + span)))
            
        uc_row_count += 1
        
        # Column 2: Mappings (embedded Drawing spanning all rows)
        if r_idx == 0:
            row_height = 28
            draw = create_mappings_drawing(total_rows, row_height, use_cases, tree, data)
            row_cells[1] = draw
            if total_rows > 1:
                table_spans.append(('SPAN', (1, 1), (1, total_rows)))
            
        # Column 3: FA Ebene 1
        if row['container_row_span'] > 0:
            fa_text = f"<b>{row['container']['id']}</b><br/><font size='6.5' color='#627c78'>{row['container']['title']}</font>"
            row_cells[2] = Paragraph(fa_text, styles['MatrixCell'])
            if row['container_row_span'] > 1:
                table_spans.append(('SPAN', (2, r_idx + 1), (2, r_idx + row['container_row_span'])))
            
        # Column 4: Sub-FA Ebene 2
        # Column 5: Component
        if row['sub_fa_row_span'] > 0:
            sub_fa = row['sub_fa']
            if sub_fa['id']:
                # Link to req card
                sub_fa_text = f"<a href='#req_{sub_fa['id']}'><b>{sub_fa['id']}</b></a>"
            else:
                sub_fa_text = "<i>(unbenannt)</i>"
            row_cells[3] = Paragraph(sub_fa_text, styles['MatrixCell'])
            if row['sub_fa_row_span'] > 1:
                table_spans.append(('SPAN', (3, r_idx + 1), (3, r_idx + row['sub_fa_row_span'])))
            
            comp_name = sub_fa['component']
            target_link = ""
            if sub_fa['id'].startswith('FA1'):
                target_link = "sec_app"
            elif sub_fa['id'].startswith('FA2'):
                target_link = "sec_embedded"
            elif sub_fa['id'].startswith('FA3'):
                target_link = "sec_database"
                
            if comp_name != '-' and target_link:
                comp_text = f"<a href='#{target_link}'><b>{comp_name}</b></a>"
            else:
                comp_text = comp_name
            row_cells[4] = Paragraph(comp_text, styles['MatrixCell'])
            if row['sub_fa_row_span'] > 1:
                table_spans.append(('SPAN', (4, r_idx + 1), (4, r_idx + row['sub_fa_row_span'])))
            
        # Column 6: Detail-FA Ebene 3
        det = row['detail_fa']
        if det:
            det_text = f"<b>{det['id']}</b> {det['title']}"
            row_cells[5] = Paragraph(det_text, styles['MatrixCell'])
        else:
            row_cells[5] = Paragraph("-", styles['MatrixCell'])
            
        # Column 7: Klassenebene (Klasse)
        classes = row['classes']
        if classes:
            class_links = []
            for cls in classes:
                cls_name = cls['name'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                link_href = f"file:///c:/Users/erlin/repo/movelink/{cls['file']}#L{cls['line']}"
                class_links.append(f"<a href='{link_href}'>{cls_name}</a>")
            row_cells[6] = Paragraph(" &nbsp;<font color='#00a685'>&lt;/&gt;</font>&nbsp; ".join(class_links), styles['MatrixCell'])
        else:
            row_cells[6] = Paragraph("<i>(Zielstruktur)</i>", styles['MatrixCell'])
            
        table_data.append(row_cells)

    # Column widths total 487
    col_widths = [70, 30, 85, 45, 65, 102, 90]
    row_heights = [20] + [28] * total_rows
    
    matrix_table = Table(table_data, colWidths=col_widths, rowHeights=row_heights)
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]
    t_style.extend(table_spans)
    matrix_table.setStyle(TableStyle(t_style))
    story.append(matrix_table)
    story.append(Spacer(1, 15))

    # Build Document
    print(f"Building PDF report in {pdf_out_path}...")
    doc.multiBuild(story, canvasmaker=NumberedCanvas)
    print("PDF generation completed successfully.")

if __name__ == '__main__':
    main()
