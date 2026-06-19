const fs = require('fs');
const path = require('path');

// Target file where all architecture markdown files will be merged
const OUTPUT_FILE = path.join(__dirname, '../doc/compiled_architecture.md');
// Directories to scan
const SCAN_DIRS = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../embedded')
];

// Helper to recursively find files matching a name
function findFiles(dir, fileName, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and version control dirs
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
        findFiles(filePath, fileName, fileList);
      }
    } else if (file.toLowerCase() === fileName.toLowerCase()) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function mergeArchitectureDocs() {
  console.log('Starte Continuous Documentation Aggregator...');
  let mergedContent = `# Systemarchitektur & Datenfluss Dokumentation\n\n`;
  mergedContent += `*Automatisch generiert am ${new Date().toLocaleString('de-DE')}*\n\n`;
  mergedContent += `> Diese Dokumentation wurde automatisch aus den dezentralen \`architecture.md\` Dateien des Projekts zusammengeführt.\n\n---\n\n`;

  let foundAny = false;

  SCAN_DIRS.forEach(scanDir => {
    if (!fs.existsSync(scanDir)) return;
    console.log(`Scanne Verzeichnis: ${scanDir}`);
    const files = findFiles(scanDir, 'architecture.md');

    files.forEach(filePath => {
      foundAny = true;
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const componentName = path.basename(path.dirname(filePath));

      console.log(`Gefunden: ${relativePath}`);

      mergedContent += `## Komponente: ${componentName}\n\n`;
      mergedContent += `**Quelle:** [\`${relativePath}\`](./${relativePath.replace(/\\/g, '/')})\n\n`;
      mergedContent += `<!-- START COMPONENT DOC -->\n`;
      mergedContent += content.trim();
      mergedContent += `\n<!-- END COMPONENT DOC -->\n\n---\n\n`;
    });
  });

  if (!foundAny) {
    mergedContent += `*Keine \`architecture.md\` Dateien in ${SCAN_DIRS.map(d => path.basename(d)).join(', ')} gefunden. Erstelle eine Datei namens \`architecture.md\` in einem der Unterordner, um sie hier aufzuführen.*\n`;
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, mergedContent, 'utf8');
  console.log(`Dokumentation erfolgreich zusammengeführt in: ${OUTPUT_FILE}`);
}

mergeArchitectureDocs();
