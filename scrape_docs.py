import os
import re
import json
from pathlib import Path

# Paths to exclude
EXCLUDE_DIRS = {
    '.git', 'node_modules', '.gradle', '.expo', 'android', 'ios', 'docs_site', 'build', 'dist', 'bin', 'obj'
}

# Regex to match Use Case and Requirement IDs
ID_PATTERN = re.compile(r'\b(UC-\d+|FA\d+|NF\d+|R\d+)\b')

# Regex to match definitions in Markdown
# Looks for headings or list items starting with the ID
DEF_PATTERN = re.compile(
    r'^\s*(?:[-*•+]\s+|\d+\.\s+)?(?:\*\*)?(UC-\d+|FA\d+|NF\d+|R\d+)(?:\*\*)?\s*[:-–]\s*(.*)$'
)

def scan_files(root_dir):
    md_files = []
    code_files = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        
        for filename in filenames:
            file_path = Path(dirpath) / filename
            rel_path = file_path.relative_to(root_dir).as_posix()
            
            if filename.endswith('.md'):
                md_files.append(rel_path)
            elif filename.endswith(('.ts', '.tsx', '.js', '.jsx', '.ino', '.cpp', '.h', '.tex')):
                code_files.append(rel_path)
                
    return md_files, code_files

def parse_markdown_file(root_dir, rel_path):
    abs_path = Path(root_dir) / rel_path
    with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()
        
    content = "".join(lines)
    
    # Extract Title
    title = rel_path
    for line in lines:
        if line.startswith('# '):
            title = line.strip('# \n')
            break
            
    # Extract Headings
    headings = []
    for i, line in enumerate(lines):
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            text = line.strip('# \n')
            headings.append({
                'level': level,
                'text': text,
                'line': i + 1
            })
            
    # Extract definitions
    definitions = {}
    current_def_id = None
    
    for i, line in enumerate(lines):
        line_num = i + 1
        match = DEF_PATTERN.match(line)
        if match:
            item_id = match.group(1)
            desc = match.group(2).strip()
            
            definitions[item_id] = {
                'id': item_id,
                'title': desc,
                'file': rel_path,
                'line': line_num,
                'links': [],
                'type': 'UC' if item_id.startswith('UC') else ('FA' if item_id.startswith('FA') else ('NF' if item_id.startswith('NF') else 'R'))
            }
            current_def_id = item_id
        else:
            # If there's a current definition, check if we should append this line (multi-line description)
            if current_def_id and line.strip() and not line.startswith('#'):
                # Reset if it's a section header or contains section indicators
                if any(h in line for h in ["Anforderungen", "Rahmenbedingungen", "Vorbedingung", "Beschreibung", "Akteur"]):
                    current_def_id = None
                # Avoid appending if it looks like a new list item
                elif not re.match(r'^\s*[-*•+]\s+', line) and not re.match(r'^\s*\d+\.\s+', line):
                    definitions[current_def_id]['title'] += " " + line.strip()
                else:
                    current_def_id = None
            elif not line.strip():
                current_def_id = None
                
    # Post-process to extract links
    for item_id, def_info in definitions.items():
        desc = def_info['title']
        links = [link for link in ID_PATTERN.findall(desc) if link != item_id]
        def_info['links'] = sorted(list(set(links)))
            
    return {
        'path': rel_path,
        'title': title,
        'content': content,
        'headings': headings,
        'definitions': definitions
    }


def scan_references(root_dir, code_files, md_files, definitions):
    references = {item_id: [] for item_id in definitions.keys()}
    
    # Helper to check lines for references
    def check_file(rel_path):
        abs_path = Path(root_dir) / rel_path
        with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f):
                line_num = i + 1
                found_ids = ID_PATTERN.findall(line)
                for item_id in found_ids:
                    # Only map if the ID is defined
                    if item_id in definitions:
                        # Avoid matching a definition itself as a reference in the same line of the same file
                        is_def = (
                            definitions[item_id]['file'] == rel_path and 
                            definitions[item_id]['line'] == line_num
                        )
                        if not is_def:
                            references[item_id].append({
                                'file': rel_path,
                                'line': line_num,
                                'context': line.strip()
                            })
                            
    # Scan both code and md files for references
    for file_path in code_files + md_files:
        check_file(file_path)
        
    return references

def main():
    root_dir = Path(__file__).parent.resolve()
    print(f"Scanning workspace in: {root_dir}")
    
    md_files, code_files = scan_files(root_dir)
    print(f"Found {len(md_files)} Markdown files and {len(code_files)} code files.")
    
    parsed_files = []
    all_definitions = {}
    
    # Parse markdown files
    for rel_path in md_files:
        res = parse_markdown_file(root_dir, rel_path)
        parsed_files.append({
            'path': res['path'],
            'title': res['title'],
            'content': res['content'],
            'headings': res['headings']
        })
        all_definitions.update(res['definitions'])
        
    # Scan references
    references = scan_references(root_dir, code_files, md_files, all_definitions)
    
    # Collect code contents of referenced files for CORS-free local viewing
    code_contents = {}
    referenced_files = set()
    for ref_list in references.values():
        for ref in ref_list:
            referenced_files.add(ref['file'])
            
    for rel_path in referenced_files:
        abs_path = root_dir / rel_path
        if abs_path.exists() and abs_path.is_file():
            try:
                with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                    code_contents[rel_path] = f.read()
            except Exception as e:
                print(f"Error reading {rel_path}: {e}")
    
    # Save directory
    site_dir = root_dir / 'docs_site'
    site_dir.mkdir(exist_ok=True)
    
    data_js_path = site_dir / 'data.js'
    
    docs_data = {
        'files': parsed_files,
        'definitions': all_definitions,
        'references': references,
        'codeContents': code_contents
    }
    
    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.write("const DOCS_DATA = ")
        json.dump(docs_data, f, indent=2, ensure_ascii=False)
        f.write(";")
        
    print(f"Successfully compiled data to {data_js_path}")

if __name__ == '__main__':
    main()
