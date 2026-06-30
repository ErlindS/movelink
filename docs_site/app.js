
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Mermaid
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
    }

    // 1. Initialize State
    const state = {
        activeTab: 'docs-tab',
        activeFile: 'doc/Requirements.md',
        searchQuery: '',
        treeFilter: '',
        theme: 'light',
        expandedFolders: {},
        c4Level: 'context',
        c4ActiveContainer: null,
        c4ActiveComponent: null
    };

    // Fallback if data.js didn't load or is empty
    if (typeof DOCS_DATA === 'undefined') {
        window.DOCS_DATA = { files: [], definitions: {}, references: {} };
    }

    // Expose app to window for inline onclick handlers
    window.app = {
        showTraceDetails,
        openCodeView,
        navigateToHeader,
        onC4MermaidNodeClick,
        onC4MermaidComponentClick
    };

    // 2. DOM Elements
    const elements = {
        fileList: document.getElementById('fileList'),
        markdownRender: document.getElementById('markdownRender'),
        docPathLabel: document.getElementById('docPathLabel'),
        docTocContainer: document.getElementById('docTocContainer'),
        tocList: document.getElementById('tocList'),
        docSearch: document.getElementById('docSearch'),
        navButtons: document.querySelectorAll('.nav-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        activeTabTitle: document.getElementById('activeTabTitle'),
        themeToggle: document.getElementById('themeToggle'),

        // Stats
        statFiles: document.getElementById('statFiles'),
        statReqs: document.getElementById('statReqs'),
        statLinks: document.getElementById('statLinks'),


        // Matrix
        traceMatrix: document.getElementById('traceMatrix'),

        // Modal
        codeModal: document.getElementById('codeModal'),
        codeModalTitle: document.getElementById('codeModalTitle'),
        codeModalBlock: document.getElementById('codeModalBlock'),
        codeModalClose: document.getElementById('codeModalClose'),

        // Matrix Toggle Elements
        toggleArchMatrixBtn: document.getElementById('toggleArchMatrixBtn'),
        toggleClassicMatrixBtn: document.getElementById('toggleClassicMatrixBtn'),
        archMatrixView: document.getElementById('archMatrixView'),
        classicMatrixView: document.getElementById('classicMatrixView')
    };


    // 3. Setup Navigation & Tabs
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');

            // Toggle nav active class
            elements.navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle tab active class
            elements.tabContents.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === target) {
                    tab.classList.add('active');
                }
            });

            state.activeTab = target;

            // Set header title
            const labelMap = {
                'docs-tab': 'Dokumenten-Ansicht',
                'matrix-tab': 'Matrix-Ansicht',
                'c4-tab': 'C4-Modell'
            };
            elements.activeTabTitle.textContent = labelMap[target] || '';

            // Render target tab contents if needed
            if (target === 'matrix-tab') {
                renderTraceMatrix();
                renderDynamicArchMatrix();
            } else if (target === 'c4-tab') {
                renderC4Explorer();
            }
        });
    });

    // 4. Setup Theme Toggle
    elements.themeToggle.addEventListener('click', () => {
        const body = document.body;
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            elements.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> <span>Heller Modus</span>';
            state.theme = 'light';
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            elements.themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> <span>Dunkler Modus</span>';
            state.theme = 'dark';
        }
        
        // Redraw SVG arrows/connections on theme change to match new styles
        if (state.activeTab === 'matrix-tab' && elements.toggleArchMatrixBtn && elements.toggleArchMatrixBtn.classList.contains('active')) {
            drawArchMatrixArrows();
        } else if (state.activeTab === 'c4-tab') {
            drawC4Connections();
        }
    });

    // 4.5 Setup Matrix Toggle Click Listeners
    if (elements.toggleArchMatrixBtn && elements.toggleClassicMatrixBtn) {
        elements.toggleArchMatrixBtn.addEventListener('click', () => {
            elements.toggleArchMatrixBtn.classList.add('active');
            elements.toggleClassicMatrixBtn.classList.remove('active');
            elements.archMatrixView.style.display = 'block';
            elements.classicMatrixView.style.display = 'none';
        });

        elements.toggleClassicMatrixBtn.addEventListener('click', () => {
            elements.toggleClassicMatrixBtn.classList.add('active');
            elements.toggleArchMatrixBtn.classList.remove('active');
            elements.archMatrixView.style.display = 'none';
            elements.classicMatrixView.style.display = 'block';
        });
    }

    // 5. Setup Search
    elements.docSearch.addEventListener('input', (e) => {

        state.searchQuery = e.target.value.toLowerCase();
        renderFileList();
    });

    // 6. Setup Stats
    function updateStats() {
        const fileCount = DOCS_DATA.files.length;
        const reqCount = Object.keys(DOCS_DATA.definitions).length;

        let linkCount = 0;
        Object.values(DOCS_DATA.definitions).forEach(d => {
            linkCount += d.links.length;
        });
        Object.values(DOCS_DATA.references).forEach(rList => {
            linkCount += rList.length;
        });

        elements.statFiles.textContent = fileCount;
        elements.statReqs.textContent = reqCount;
        elements.statLinks.textContent = linkCount;
    }

    // Helper to build a nested tree structure from flat files
    function buildFileTree(files) {
        const root = {
            name: 'Wurzelverzeichnis',
            path: '',
            type: 'folder',
            children: {},
            files: []
        };

        files.forEach(file => {
            // Filter by search query if present
            if (state.searchQuery) {
                const matchesSearch =
                    file.path.toLowerCase().includes(state.searchQuery) ||
                    file.title.toLowerCase().includes(state.searchQuery) ||
                    file.content.toLowerCase().includes(state.searchQuery);

                if (!matchesSearch) return;
            }

            const parts = file.path.split('/');
            let current = root;

            // Traverse directories
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        path: parts.slice(0, i + 1).join('/'),
                        type: 'folder',
                        children: {},
                        files: []
                    };
                }
                current = current.children[part];
            }

            current.files.push(file);
        });

        return root;
    }

    // Helper to recursively render tree nodes
    function renderTreeNodes(node, container, depth = 0) {
        // Sort folders alphabetically
        const sortedFolders = Object.keys(node.children)
            .sort((a, b) => a.localeCompare(b))
            .map(key => node.children[key]);

        // Sort files alphabetically by title
        const sortedFiles = [...node.files].sort((a, b) => a.title.localeCompare(b.title));

        // Render subfolders first
        sortedFolders.forEach(subfolder => {
            const folderNode = document.createElement('div');
            folderNode.className = 'folder-node';

            // Determine if folder should be expanded
            const isExpanded = !!(
                state.searchQuery || 
                state.expandedFolders[subfolder.path] || 
                (state.activeFile && state.activeFile.startsWith(subfolder.path + '/'))
            );

            if (isExpanded) {
                folderNode.classList.add('expanded');
            }

            // Create folder row button
            const folderRow = document.createElement('button');
            folderRow.className = 'folder-row';
            folderRow.style.paddingLeft = `${14 + depth * 12}px`;
            
            const chevronIcon = document.createElement('i');
            chevronIcon.className = 'fa-solid fa-chevron-right folder-chevron';
            
            const folderIcon = document.createElement('i');
            folderIcon.className = `fa-regular ${isExpanded ? 'fa-folder-open' : 'fa-folder'} folder-icon`;
            
            const folderName = document.createElement('span');
            folderName.className = 'folder-name';
            folderName.textContent = subfolder.name;

            folderRow.appendChild(chevronIcon);
            folderRow.appendChild(folderIcon);
            folderRow.appendChild(folderName);
            folderNode.appendChild(folderRow);

            // Create children container
            const folderChildren = document.createElement('ul');
            folderChildren.className = 'folder-children';
            
            // Recursively render children
            renderTreeNodes(subfolder, folderChildren, depth + 1);
            folderNode.appendChild(folderChildren);

            // Click listener to toggle folder
            folderRow.addEventListener('click', (e) => {
                e.stopPropagation();
                const nowExpanded = !folderNode.classList.contains('expanded');
                
                // Update state
                state.expandedFolders[subfolder.path] = nowExpanded;
                
                // Toggle DOM classes/icons directly for instant response
                if (nowExpanded) {
                    folderNode.classList.add('expanded');
                    folderIcon.className = 'fa-regular fa-folder-open folder-icon';
                } else {
                    folderNode.classList.remove('expanded');
                    folderIcon.className = 'fa-regular fa-folder folder-icon';
                }
            });

            container.appendChild(folderNode);
        });

        // Render files next
        sortedFiles.forEach(file => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            const isActive = file.path === state.activeFile;
            btn.className = `nav-btn doc-btn ${isActive ? 'active' : ''}`;
            btn.style.paddingLeft = `${32 + depth * 12}px`;
            btn.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${file.title}`;
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectFile(file.path);
            });
            
            li.appendChild(btn);
            container.appendChild(li);
        });
    }

    // 7. Render File Navigation Sidebar
    function renderFileList() {
        elements.fileList.innerHTML = '';
        const fileTree = buildFileTree(DOCS_DATA.files);
        renderTreeNodes(fileTree, elements.fileList, 0);
    }

    // 8. Select and Render Active Markdown File
    function selectFile(filePath) {
        state.activeFile = filePath;

        // Auto-expand all parent folders of the active file
        const parts = filePath.split('/');
        for (let i = 1; i < parts.length; i++) {
            const folderPath = parts.slice(0, i).join('/');
            state.expandedFolders[folderPath] = true;
        }

        // Update active class in sidebar
        const buttons = elements.fileList.querySelectorAll('.doc-btn');
        buttons.forEach(btn => btn.classList.remove('active'));

        // Re-render sidebar to highlight active
        renderFileList();

        // Get file data
        const file = DOCS_DATA.files.find(f => f.path === filePath);
        if (!file) return;

        let metaHtml = `<i class="fa-regular fa-folder-open"></i> ${file.path}`;
        if (file.c4_level) {
            const isDeployable = file.deployable && (file.deployable.toLowerCase() === 'ja' || file.deployable.toLowerCase() === 'yes');
            const badgeClass = isDeployable ? 'usecase' : 'code';
            const label = isDeployable ? 'C4 Container' : 'C4 Component';
            metaHtml += ` <span class="node-badge ${badgeClass}" style="margin-left: 12px; vertical-align: middle;">${label}</span>`;
            if (isDeployable) {
                metaHtml += ` <span class="node-badge requirement" style="margin-left: 6px; vertical-align: middle;"><i class="fa-solid fa-cloud-arrow-up"></i> Deployable</span>`;
            }
        }
        elements.docPathLabel.innerHTML = metaHtml;

        // Render Markdown content
        let html = renderMarkdownWithTraceBadges(file.content);
        elements.markdownRender.innerHTML = html;

        // Handle table wrapping
        const tables = elements.markdownRender.querySelectorAll('table');
        tables.forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.style.overflowX = 'auto';
            wrapper.style.marginBottom = '16px';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
        // Trigger Mermaid and Prism
        try {
            if (typeof mermaid !== 'undefined') {
                const mermaidBlocks = elements.markdownRender.querySelectorAll('code.language-mermaid');
                if (mermaidBlocks.length > 0) {
                    mermaidBlocks.forEach((block, index) => {
                        const pre = block.parentElement;
                        const div = document.createElement('div');
                        div.className = 'mermaid';
                        div.id = `mermaid-dyn-${Date.now()}-${index}`;
                        div.textContent = block.textContent;
                        pre.parentNode.replaceChild(div, pre);
                    });
                    if (typeof mermaid.run === 'function') {
                        mermaid.run({ querySelector: '.mermaid' });
                    } else if (typeof mermaid.init === 'function') {
                        mermaid.init(undefined, '.mermaid');
                    }
                }
            }
        } catch (e) {
            console.error('Mermaid render error:', e);
        }
        if (typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(elements.markdownRender);
        }
        // Render TOC
        renderTOC(file.headings);

        // If we are not on the docs tab, switch to it
        if (state.activeTab !== 'docs-tab') {
            const docBtn = document.querySelector('[data-target="docs-tab"]');
            if (docBtn) {
                docBtn.click();
            } else {
                // Toggling classes manually if button is removed from navigation menu
                state.activeTab = 'docs-tab';
                elements.navButtons.forEach(b => b.classList.remove('active'));
                elements.tabContents.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.id === 'docs-tab') {
                        tab.classList.add('active');
                    }
                });
                elements.activeTabTitle.textContent = 'Dokumenten-Ansicht';
            }
        }

        // Scroll to top
        elements.markdownRender.parentElement.scrollTop = 0;
    }

    // Custom Markdown parser that converts raw MD to HTML and highlights trace IDs (UC-1, FA1, etc.)
    function renderMarkdownWithTraceBadges(markdown) {
        // First convert code block placeholders to avoid parsing badges inside code blocks
        const codeBlocks = [];
        let cleanMd = markdown.replace(/(```[\s\S]*?```|`[^`\n]*?`)/g, (match) => {
            codeBlocks.push(match);
            return `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length - 1}__`;
        });

        // Convert titles/headers anchors
        // Convert markdown definitions / list bullets with IDs
        cleanMd = cleanMd.replace(
            /\b(UC-\d+|FA\d+|NF\d+|R\d+)\b/g,
            '<span class="trace-badge" onclick="window.app.showTraceDetails(\'$1\')">$1</span>'
        );

        // Restore code blocks
        codeBlocks.forEach((block, index) => {
            cleanMd = cleanMd.replace(`__CODE_BLOCK_PLACEHOLDER_${index}__`, block);
        });

        // Run marked parser
        return marked.parse(cleanMd);
    }

    // Render Table of Contents
    function renderTOC(headings) {
        elements.tocList.innerHTML = '';
        if (!headings || headings.length === 0) {
            elements.docTocContainer.style.display = 'none';
            return;
        }

        elements.docTocContainer.style.display = 'block';

        headings.forEach(h => {
            const li = document.createElement('li');
            li.className = `level-${h.level}`;

            // Create a slug for linking
            const slug = h.text.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            li.innerHTML = `<a href="#${slug}" onclick="event.preventDefault(); window.app.navigateToHeader('${slug}')">${h.text}</a>`;
            elements.tocList.appendChild(li);
        });
    }

    function navigateToHeader(slug) {
        const target = document.getElementById(slug);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Find by heading text match if ID slug fails
            const headings = elements.markdownRender.querySelectorAll('h1, h2, h3, h4, h5, h6');
            for (let h of headings) {
                const hSlug = h.textContent.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                if (hSlug === slug || hSlug.includes(slug)) {
                    h.scrollIntoView({ behavior: 'smooth' });
                    break;
                }
            }
        }
    }

    // 10. Render Traceability Matrix Grid
    function renderTraceMatrix() {
        elements.traceMatrix.innerHTML = '';

        // Use cases
        const useCases = Object.values(DOCS_DATA.definitions)
            .filter(d => d.type === 'UC')
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

        // Requirements
        const requirements = Object.values(DOCS_DATA.definitions)
            .filter(d => d.type !== 'UC')
            .sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.id.localeCompare(b.id, undefined, { numeric: true });
            });

        if (useCases.length === 0 || requirements.length === 0) {
            elements.traceMatrix.innerHTML = '<tr><td>Keine Daten für Matrix vorhanden.</td></tr>';
            return;
        }

        // 1. Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        headerRow.innerHTML = '<th class="row-header">Anforderung / ID</th>';
        useCases.forEach(uc => {
            headerRow.innerHTML += `<th class="matrix-header-rotated" title="${uc.title}">${uc.id}</th>`;
        });

        thead.appendChild(headerRow);
        elements.traceMatrix.appendChild(thead);

        // 2. Create table body
        const tbody = document.createElement('tbody');

        requirements.forEach(req => {
            const row = document.createElement('tr');

            // Row header with requirement details
            const rowHeader = document.createElement('td');
            rowHeader.className = 'row-header';

            const badgeClass = req.type === 'FA' ? 'requirement' : (req.type === 'NF' ? 'code' : 'usecase');
            rowHeader.innerHTML = `
                <div class="matrix-req-cell">
                    <span class="node-badge ${badgeClass}" onclick="window.app.showTraceDetails('${req.id}')" style="cursor:pointer">${req.id}</span>
                    <span title="${req.title}">${req.title.substring(0, 50)}${req.title.length > 50 ? '...' : ''}</span>
                </div>
            `;
            row.appendChild(rowHeader);

            // Check link state for each Use Case
            useCases.forEach(uc => {
                const cell = document.createElement('td');
                const isDirect = req.links.includes(uc.id);

                // Transitive connection check (e.g. if code references both, or other files link them)
                let isTransitive = false;
                if (!isDirect) {
                    // Check if they are referenced in the same code file
                    const reqFiles = (DOCS_DATA.references[req.id] || []).map(r => r.file);
                    const ucFiles = (DOCS_DATA.references[uc.id] || []).map(r => r.file);
                    const intersection = reqFiles.filter(f => ucFiles.includes(f));
                    if (intersection.length > 0) isTransitive = true;
                }

                if (isDirect) {
                    cell.innerHTML = `<span class="matrix-marker direct" onclick="window.app.showTraceDetails('${req.id}')" title="Direkt verknüpft (im Pflichtenheft definiert) aus ${uc.id}"><i class="fa-solid fa-circle-check"></i></span>`;
                } else if (isTransitive) {
                    cell.innerHTML = `<span class="matrix-marker transitive" onclick="window.app.showTraceDetails('${req.id}')" title="Transitive Verknüpfung (beide im selben Code-Kontext)"><i class="fa-solid fa-link"></i></span>`;
                } else {
                    cell.innerHTML = '-';
                    cell.style.color = 'var(--text-muted)';
                }

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        elements.traceMatrix.appendChild(tbody);
    }

    // 10.5 Render C4 Architecture Traceability Matrix (Drawing-Based, Dynamic)
    function renderDynamicArchMatrix() {
        const tbody = document.querySelector('.arch-matrix-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // 1. Gather Use Cases
        const useCases = Object.values(DOCS_DATA.definitions)
            .filter(d => d.type === 'UC')
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

        // 2. Gather Container files
        const containerFiles = DOCS_DATA.files.filter(f => f.c4_level === 'Container');
        
        // Helper to resolve component name and path dynamically from container markdown content
        function parseContainerComponents(containerFile) {
            const mappings = [];
            if (!containerFile || !containerFile.content) return mappings;
            
            const lines = containerFile.content.split('\n');
            lines.forEach(line => {
                // Pattern 1: **FA2.1** -> **[Sensordatenerfassung (Loop)](file:///...)**: ...
                const arrowMatch = line.match(/\*\*(FA\d+(?:\.\d+)*(?:\s*,\s*FA\d+(?:\.\d+)*)*)\*\*\s*->\s*(?:\*\*)?\[([^\]]+)\]\(([^)]+)\)/);
                if (arrowMatch) {
                    const reqs = arrowMatch[1].split(',').map(r => r.trim());
                    const compName = arrowMatch[2].trim();
                    const compLink = arrowMatch[3].trim().replace(/^file:\/\/\/.*\/movelink\//, '');
                    reqs.forEach(reqId => {
                        mappings.push({ reqId, name: compName, path: compLink });
                    });
                    return;
                }

                // Pattern 2: 1. **[SideNav](file:///...)**: ... (Erfüllt: FA1.1)
                const fulfillsMatch = line.match(/(?:\*\*)?\[([^\]]+)\]\(([^)]+)\)(?:\*\*)?.*\(Erfüllt:\s*(FA\d+(?:\.\d+)*(?:\s*,\s*FA\d+(?:\.\d+)*)*).*\)/i);
                if (fulfillsMatch) {
                    const compName = fulfillsMatch[1].trim();
                    const compLink = fulfillsMatch[2].trim().replace(/^file:\/\/\/.*\/movelink\//, '');
                    const reqs = fulfillsMatch[3].split(',').map(r => r.trim());
                    reqs.forEach(reqId => {
                        mappings.push({ reqId, name: compName, path: compLink });
                    });
                    return;
                }

                // Pattern 3: 1. **ProfileController / Auth Service**: ... (Erfüllt: FA3.1)
                const textFulfillsMatch = line.match(/\*\*(.*?)\*\*\s*:.*\(Erfüllt:\s*(FA\d+(?:\.\d+)*(?:\s*,\s*FA\d+(?:\.\d+)*)*).*\)/i);
                if (textFulfillsMatch) {
                    const compName = textFulfillsMatch[1].trim();
                    const reqs = textFulfillsMatch[2].split(',').map(r => r.trim());
                    reqs.forEach(reqId => {
                        mappings.push({ reqId, name: compName, path: '' });
                    });
                    return;
                }
            });

            return mappings;
        }

        // Helper to resolve classes dynamically
        function getComponentClasses(componentPath) {
            if (!componentPath) return [];
            
            const classes = [];
            const normalizedLink = componentPath.replace(/^file:\/\/\/.*\/movelink\//, '').replace('../', '');
            
            // Case 1: Component link is a direct code file
            const isCodeFile = normalizedLink.endsWith('.ts') || normalizedLink.endsWith('.tsx') || normalizedLink.endsWith('.cpp') || normalizedLink.endsWith('.ino') || normalizedLink.endsWith('.h') || normalizedLink.endsWith('.py');
            
            let targetFiles = [];
            if (isCodeFile) {
                targetFiles.push(normalizedLink);
            } else if (normalizedLink.endsWith('.md')) {
                // Component is a markdown file.
                // Let's find all files in the same directory as this markdown file!
                const dirPath = normalizedLink.substring(0, normalizedLink.lastIndexOf('/'));
                
                // Find all files in DOCS_DATA.codeContents that start with this dirPath
                const codeFiles = Object.keys(DOCS_DATA.codeContents || {});
                codeFiles.forEach(file => {
                    if (file.startsWith(dirPath + '/') && file !== normalizedLink) {
                        targetFiles.push(file);
                    }
                });
                
                // Also look inside the component's markdown file content for code links
                const fileObj = DOCS_DATA.files.find(f => f.path === normalizedLink);
                if (fileObj && fileObj.content) {
                    const codeLinkMatches = fileObj.content.match(/\[([^\]]+\.(?:ts|tsx|cpp|ino|h|py))\]\(([^)]+)\)/g);
                    if (codeLinkMatches) {
                        codeLinkMatches.forEach(match => {
                            const pathMatch = match.match(/\(([^)]+)\)/);
                            if (pathMatch) {
                                const path = pathMatch[1].replace(/^file:\/\/\/.*\/movelink\//, '').replace('../', '');
                                // If it is indeed a code file, add it
                                if (!targetFiles.includes(path)) {
                                    targetFiles.push(path);
                                }
                            }
                        });
                    }
                }
            }

            // Now, scan targetFiles to extract class / function names
            targetFiles.forEach(file => {
                const content = DOCS_DATA.codeContents[file];
                if (!content) return;

                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    const lineNum = index + 1;
                    let name = '';
                    
                    const classMatch = line.match(/(?:class|interface|struct)\s+(\w+)/);
                    const funcMatch = line.match(/(?:function|void|int|float|double|bool)\s+(\w+)\s*\(/);
                    const constFuncMatch = line.match(/const\s+(\w+)\s*=\s*(?:\(\)|function|\w+)/);

                    if (classMatch) name = classMatch[1];
                    else if (funcMatch) name = funcMatch[1] + '()';
                    else if (constFuncMatch) name = constFuncMatch[1];

                    if (name && !['if', 'for', 'while', 'switch', 'catch', 'setup', 'loop'].includes(name.replace('()', ''))) {
                        if (!classes.some(c => c.name === name && c.file === file)) {
                            classes.push({ name, file, line: lineNum });
                        }
                    }
                });

                if (classes.filter(c => c.file === file).length === 0) {
                    const filename = file.split('/').pop();
                    classes.push({ name: filename, file, line: 1 });
                }
            });

            return classes;
        }

        // Helper to resolve class names dynamically from code files (fallback when no component path is found)
        function getClassForReq(reqId) {
            const refs = DOCS_DATA.references[reqId] || [];
            const classes = [];
            for (const ref of refs) {
                if (ref.file.endsWith('.ts') || ref.file.endsWith('.tsx') || ref.file.endsWith('.cpp') || ref.file.endsWith('.ino') || ref.file.endsWith('.h') || ref.file.endsWith('.py')) {
                    let name = '';
                    const context = ref.context || '';
                    if (context.includes('@implements')) continue;

                    const classMatch = context.match(/(?:class|interface|struct)\s+(\w+)/);
                    const funcMatch = context.match(/(?:function|void|int|float|double|bool)\s+(\w+)\s*\(/);
                    const constFuncMatch = context.match(/const\s+(\w+)\s*=\s*(?:\(\)|function|\w+)/);

                    if (classMatch) name = classMatch[1];
                    else if (funcMatch) name = funcMatch[1] + '()';
                    else if (constFuncMatch) name = constFuncMatch[1];
                    else {
                        const filename = ref.file.split('/').pop();
                        name = `${filename}:${ref.line}`;
                    }

                    classes.push({ name, file: ref.file, line: ref.line });
                }
            }
            return classes;
        }

        // 3. Structure data hierarchically: Container -> Sub-FA -> Detail-FA
        const containerIds = ['FA1', 'FA2', 'FA3'];
        const containerNames = {
            'FA1': 'Applikation (Mobile App)',
            'FA2': 'Trainingsgerät (Sensor-Firmware)',
            'FA3': 'Datenbank & Backend'
        };

        const tree = containerIds.map(containerId => {
            const containerFile = containerFiles.find(f => {
                if (containerId === 'FA1' && f.path.includes('app/')) return true;
                if (containerId === 'FA2' && f.path.includes('embedded/')) return true;
                if (containerId === 'FA3' && f.path.includes('database/')) return true;
                return false;
            });

            const containerTitle = containerNames[containerId] || (containerFile ? containerFile.title : containerId);
            const containerComponents = parseContainerComponents(containerFile);

            // Find all Sub-FAs for this container (like FA1.1, FA1.2...)
            const subFAs = Object.values(DOCS_DATA.definitions)
                .filter(d => d.id.startsWith(containerId + '.') && (d.id.match(/\./g) || []).length === 1)
                .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

            const subFATree = subFAs.map(subFa => {
                // Find all Detail-FAs (like FA1.1.1, FA1.1.2...)
                const detailFAs = Object.values(DOCS_DATA.definitions)
                    .filter(d => d.id.startsWith(subFa.id + '.') && (d.id.match(/\./g) || []).length === 2)
                    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

                const compMap = containerComponents.find(c => c.reqId === subFa.id);
                const componentName = compMap ? compMap.name : '-';
                const componentPath = compMap ? compMap.path : '';

                // Resolve classes: if component is mapped, extract dynamically. Otherwise, fallback to @implements references.
                const classes = compMap ? getComponentClasses(compMap.path) : getClassForReq(subFa.id);

                return {
                    id: subFa.id,
                    title: subFa.title,
                    detailFAs: detailFAs,
                    component: componentName,
                    componentPath: componentPath,
                    classes: classes
                };
            });

            // Fallback placeholder rows if no sub-elements exist yet
            if (subFATree.length === 0) {
                subFATree.push({
                    id: '',
                    title: '(unbenannt)',
                    detailFAs: [],
                    component: '-',
                    componentPath: '',
                    classes: []
                });
            }

            return {
                id: containerId,
                title: containerTitle,
                subFAs: subFATree
            };
        });

        // 4. Generate rows & rowspans
        const renderedRows = [];

        tree.forEach(container => {
            let containerTotalRows = 0;
            container.subFAs.forEach(sub => {
                const subRows = sub.detailFAs.length > 0 ? sub.detailFAs.length : 1;
                containerTotalRows += subRows;
            });

            container.subFAs.forEach((sub, subIdx) => {
                const subRows = sub.detailFAs.length > 0 ? sub.detailFAs.length : 1;

                if (sub.detailFAs.length === 0) {
                    renderedRows.push({
                        container: container,
                        containerRowSpan: subIdx === 0 ? containerTotalRows : 0,
                        subFa: sub,
                        subFaRowSpan: 1,
                        detailFa: null,
                        classes: sub.classes,
                        isFirstRow: subIdx === 0
                    });
                } else {
                    sub.detailFAs.forEach((det, detIdx) => {
                        renderedRows.push({
                            container: container,
                            containerRowSpan: (subIdx === 0 && detIdx === 0) ? containerTotalRows : 0,
                            subFa: sub,
                            subFaRowSpan: detIdx === 0 ? subRows : 0,
                            detailFa: det,
                            classes: sub.classes,
                            isFirstRow: subIdx === 0 && detIdx === 0
                        });
                    });
                }
            });
        });

        // Compute dynamic rowspans for Column 1: Use Cases
        const totalRows = renderedRows.length;
        const ucCount = useCases.length;
        const ucSpans = [];
        let remaining = totalRows;
        for (let i = 0; i < ucCount; i++) {
            const span = i === ucCount - 1 ? remaining : Math.floor(totalRows / ucCount);
            ucSpans.push(span);
            remaining -= span;
        }

        let ucCurrentIndex = 0;
        let ucRowCount = 0;

        // 5. Render rows to tbody
        renderedRows.forEach((row, idx) => {
            const tr = document.createElement('tr');
            let trHtml = '';

            // Column 1: Use Cases (UC) - spanned dynamically
            if (idx === 0 || ucRowCount >= ucSpans[ucCurrentIndex]) {
                if (idx > 0) {
                    ucCurrentIndex++;
                }
                ucRowCount = 0;
                const uc = useCases[ucCurrentIndex] || { id: `UC-${ucCurrentIndex+1}`, title: '' };
                const span = ucSpans[ucCurrentIndex];

                trHtml += `
                    <td rowspan="${span}" class="uc-cell" data-uc-id="${uc.id}">
                        <strong>${uc.id}</strong><br>
                        <span style="font-size: 10px; font-weight: normal; color: var(--text-secondary);">${uc.title}</span>
                    </td>
                `;

                if (idx === 0) {
                    trHtml += `
                        <td rowspan="${totalRows}" class="svg-cell">
                            <svg id="archMatrixSvg" width="100%" height="100%" style="display: block; position: absolute; top: 0; left: 0;">
                                <defs>
                                    <marker id="arrow-white-matrix" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f0f4f3" />
                                    </marker>
                                    <marker id="arrow-orange-matrix" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f97316" />
                                    </marker>
                                    <marker id="arrow-green-matrix" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" />
                                    </marker>
                                </defs>
                            </svg>
                        </td>
                    `;
                }
            }
            ucRowCount++;

            // Column 3: FA Ebene 1 (Containers)
            if (row.containerRowSpan > 0) {
                trHtml += `
                    <td rowspan="${row.containerRowSpan}" class="fa-cell" data-fa-id="${row.container.id}">
                        <strong>${row.container.id}</strong><br>
                        <span style="font-size: 10px; font-weight: normal; color: var(--text-secondary);">${row.container.title}</span>
                    </td>
                `;
            }

            // Column 4: Sub-FA Ebene 2
            if (row.subFaRowSpan > 0) {
                trHtml += `
                    <td rowspan="${row.subFaRowSpan}" class="sub-fa-cell">
                        ${row.subFa.id ? `
                            <div class="jira-like-link" onclick="window.app.showTraceDetails('${row.subFa.id}')" title="Gehe zu ${row.subFa.id}">
                                <strong>${row.subFa.id}</strong>
                            </div>
                        ` : `<span style="color: var(--text-muted); font-style: italic;">(unbenannt)</span>`}
                    </td>
                    <td rowspan="${row.subFaRowSpan}" class="component-cell">
                        ${row.subFa.componentPath ? `
                            <div class="jira-like-link" onclick="window.app.openCodeView('${row.subFa.componentPath}', 1)" style="font-weight: 600;" title="Klicke, um Komponente anzuzeigen">
                                ${row.subFa.component}
                            </div>
                        ` : row.subFa.component}
                    </td>
                `;
            }

            // Column 6: Detail-FA Ebene 3
            if (row.detailFa) {
                trHtml += `
                    <td class="detail-fa-cell">
                        <strong>${row.detailFa.id}</strong> ${row.detailFa.title}
                    </td>
                `;
            } else {
                trHtml += `<td class="detail-fa-cell" style="color: var(--text-muted);">-</td>`;
            }

            // Column 7: Klassenebene (Klasse)
            if (row.classes && row.classes.length > 0) {
                const classLinks = row.classes.map(cls => `
                    <div class="jira-like-link" onclick="window.app.openCodeView('${cls.file}', ${cls.line})" style="font-size: 11px; margin-bottom: 2px; text-decoration: underline; color: var(--primary);" title="Öffne ${cls.file}">
                        <i class="fa-solid fa-code"></i> ${cls.name}
                    </div>
                `).join('');
                trHtml += `<td class="class-cell">${classLinks}</td>`;
            } else {
                trHtml += `<td class="class-cell" style="color: var(--text-muted); font-style: italic;">(Zielstruktur)</td>`;
            }

            tr.innerHTML = trHtml;
            tbody.appendChild(tr);
        });

        // Trigger layout drawing of paths
        setTimeout(() => {
            drawArchMatrixArrows();
        }, 50);
    }

    function drawArchMatrixArrows() {
        const svg = document.getElementById('archMatrixSvg');
        if (!svg) return;

        // Clear existing paths (keep defs)
        const paths = svg.querySelectorAll('path');
        paths.forEach(p => p.remove());

        const svgRect = svg.getBoundingClientRect();

        // Find UC cells and get Y centers relative to SVG
        const ucElements = {};
        document.querySelectorAll('.arch-matrix-table .uc-cell').forEach(el => {
            const id = el.getAttribute('data-uc-id');
            const rect = el.getBoundingClientRect();
            ucElements[id] = rect.top + rect.height / 2 - svgRect.top;
        });

        // Find FA cells and get Y centers relative to SVG
        const faElements = {};
        document.querySelectorAll('.arch-matrix-table .fa-cell').forEach(el => {
            const id = el.getAttribute('data-fa-id');
            const rect = el.getBoundingClientRect();
            faElements[id] = rect.top + rect.height / 2 - svgRect.top;
        });

        // Dynamically build connections from actual requirements database
        const connections = [];
        const containerIds = ['FA1', 'FA2', 'FA3'];
        
        containerIds.forEach(containerId => {
            const def = DOCS_DATA.definitions[containerId];
            if (def && def.links) {
                def.links.forEach(ucId => {
                    let color = '#f0f4f3';
                    let marker = 'arrow-white-matrix';
                    if (containerId === 'FA2') {
                        color = '#f97316';
                        marker = 'arrow-orange-matrix';
                    } else if (containerId === 'FA3') {
                        color = '#22c55e';
                        marker = 'arrow-green-matrix';
                    }
                    connections.push({ from: ucId, to: containerId, color, marker });
                });
            }
        });

        connections.forEach(conn => {
            const yFrom = ucElements[conn.from];
            const yTo = faElements[conn.to];

            if (yFrom !== undefined && yTo !== undefined) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = `M 5 ${yFrom} C 40 ${yFrom}, 80 ${yTo}, 115 ${yTo}`;
                path.setAttribute('d', d);
                path.setAttribute('stroke', conn.color);
                path.setAttribute('stroke-width', '2.5');
                path.setAttribute('fill', 'none');
                path.setAttribute('marker-end', `url(#${conn.marker})`);
                svg.appendChild(path);
            }
        });
    }


    // 12. Show Traceability Details (Navigates to source Markdown file and highlights the definition)
    function showTraceDetails(id) {
        const def = DOCS_DATA.definitions[id];
        if (!def) return;

        // Select file in sidebar
        selectFile(def.file);

        // Wait briefly for render, then scroll to the text containing the ID definition
        setTimeout(() => {
            const badges = elements.markdownRender.querySelectorAll('.trace-badge');
            for (let badge of badges) {
                if (badge.textContent === id) {
                    badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight effect
                    badge.style.backgroundColor = 'var(--accent-z)';
                    badge.style.color = '#000';
                    badge.style.boxShadow = '0 0 16px var(--accent-z)';

                    setTimeout(() => {
                        badge.style.backgroundColor = '';
                        badge.style.color = '';
                        badge.style.boxShadow = '';
                    }, 2000);
                    break;
                }
            }
        }, 100);
    }

    // 12.5 C4 Mermaid Node Click handler (Code Level)
    function onC4MermaidNodeClick(nodeId) {
        if (!state.c4ActiveComponent) return;
        const componentData = C4_DATA.classes[state.c4ActiveComponent];
        if (!componentData) return;
        const el = componentData.elements.find(e => e.id === nodeId);
        if (el) {
            showC4Detail(el);
            if (el.file) {
                openCodeView(el.file, el.line || 1);
            }
        }
    }

    // 12.6 C4 Mermaid Component Click handler (Components Level -> drills into Code Level)
    function onC4MermaidComponentClick(nodeId) {
        if (!state.c4ActiveContainer) return;
        const containerData = C4_DATA.components[state.c4ActiveContainer];
        if (!containerData) return;
        const el = containerData.elements.find(e => e.id === nodeId);
        if (el) {
            // Show detail in sidebar
            showC4Detail(el);
            // Only drill down for real components (not ghosts/externals)
            if (el.type === 'component' && C4_DATA.classes[el.id]) {
                zoomToLevel('code', state.c4ActiveContainer, el.id);
            }
        }
    }

    // 13. Open Source Code Modal View
    function openCodeView(filePath, lineNum) {
        elements.codeModalTitle.textContent = `Datei: ${filePath} (Zeile ${lineNum})`;

        // Clear old content
        elements.codeModalBlock.textContent = 'Lade Inhalt...';
        elements.codeModal.classList.add('active');

        // Identify file language for Prism syntax highlighting
        let langClass = 'language-tsx';
        if (filePath.endsWith('.ino') || filePath.endsWith('.cpp') || filePath.endsWith('.h')) {
            langClass = 'language-cpp';
        } else if (filePath.endsWith('.ts')) {
            langClass = 'language-typescript';
        } else if (filePath.endsWith('.tex')) {
            langClass = 'language-latex';
        } else if (filePath.endsWith('.md')) {
            langClass = 'language-markdown';
        }

        elements.codeModalBlock.className = langClass;

        // Use pre-included code contents from data.js if available, or fetch
        if (DOCS_DATA.codeContents && DOCS_DATA.codeContents[filePath]) {
            displayCode(DOCS_DATA.codeContents[filePath], lineNum);
        } else {
            // Relative path calculation to locate file relative to docs_site/index.html
            const relativePath = '../' + filePath;
            fetch(relativePath)
                .then(res => {
                    if (!res.ok) throw new Error(`Fetch failed with HTTP ${res.status}`);
                    return res.text();
                })
                .then(text => {
                    displayCode(text, lineNum);
                })
                .catch(err => {
                    console.warn('CORS or file access issue, using fallback:', err);
                    // Fallback to show context snippet stored in definitions / references
                    let fallbackText = `// [HINWEIS] Lokale Datei konnte aufgrund von CORS/Browser-Sicherheitsrichtlinien nicht direkt per AJAX geladen werden.\n// Dies tritt meist auf, wenn das Dashboard per file:// statt http:// geladen wird.\n\n`;
                    fallbackText += `// Gefundener Code-Kontext aus Scraper:\n`;
                    fallbackText += `Zeile ${lineNum}: ${getContextSnippet(filePath, lineNum)}`;
                    displayCode(fallbackText, 1);
                });
        }
    }

    function getContextSnippet(filePath, lineNum) {
        // Look up context in references
        for (let itemId in DOCS_DATA.references) {
            const list = DOCS_DATA.references[itemId];
            const ref = list.find(r => r.file === filePath && r.line === lineNum);
            if (ref) return ref.context;
        }
        return "// Keine Vorschau verfügbar";
    }

    function displayCode(codeText, lineNum) {
        elements.codeModalBlock.textContent = codeText;
        Prism.highlightElement(elements.codeModalBlock);

        // Scroll to the line
        setTimeout(() => {
            const pre = elements.codeModalBlock.parentElement;
            const lines = codeText.split('\n');
            const totalLines = lines.length;

            // Simple scroll calculation: height of pre container divided by total lines
            const containerHeight = pre.scrollHeight;
            const approximateLineHeight = containerHeight / totalLines;
            const scrollTarget = (lineNum - 1) * approximateLineHeight - (pre.clientHeight / 2);

            pre.scrollTop = Math.max(0, scrollTarget);
        }, 150);
    }

    // Close Modal Event
    elements.codeModalClose.addEventListener('click', () => {
        elements.codeModal.classList.remove('active');
    });

    elements.codeModal.addEventListener('click', (e) => {
        if (e.target === elements.codeModal) {
            elements.codeModal.classList.remove('active');
        }
    });

    // Recalculate on window resize
    window.addEventListener('resize', () => {
        if (state.activeTab === 'matrix-tab') {
            if (elements.toggleArchMatrixBtn && elements.toggleArchMatrixBtn.classList.contains('active')) {
                drawArchMatrixArrows();
            }
        }
        if (state.activeTab === 'c4-tab') {
            drawC4Connections();
        }
    });

    // Also draw connections on scroll to prevent alignment lag
    const c4BoardContainer = document.getElementById('c4BoardContainer');
    if (c4BoardContainer) {
        c4BoardContainer.addEventListener('scroll', () => {
            if (state.activeTab === 'c4-tab') {
                drawC4Connections();
            }
        });
    }

    // 13.5 C4 Model Explorer Logic
    const C4_DATA = {
        context: {
            title: "MoveLink System",
            description: "System zur Echtzeit-Bewegungsanalyse von Fitnessübungen mittels IMU-Sensorik.",
            elements: [
                { id: 'user', type: 'actor', title: 'Trainierender', description: 'Benutzer, der seine Übungsausführung in Echtzeit analysieren möchte.', tech: 'Person' },
                { id: 'system', type: 'system-context', title: 'MoveLink System', description: 'Erfasst, filtert und visualisiert Bewegungsdaten, klassifiziert Übungen lokal und persistiert historische Datensätze.', tech: 'Software System' },
                { id: 'external_db', type: 'external', title: 'Datenbank', description: 'Speichert Benutzerprofile und historische Trainingsdaten persistent.', tech: 'PostgreSQL' }
            ],
            connections: [
                { from: 'user', to: 'system', text: 'Nutzt für Training' },
                { from: 'system', to: 'external_db', text: 'Speichert Daten' }
            ]
        },
        containers: {
            elements: [
                { id: 'firmware', type: 'container', title: 'Sensor Firmware Container', description: 'Arduino C++ Code auf dem XIAO-Mikrocontroller. Erfasst Sensordaten, wendet Filter an und sendet BLE Pakete.', tech: 'Arduino C/C++, Edge Impulse SDK', deployable: true, file: 'embedded/architecture.md' },
                { id: 'app', type: 'container', title: 'Mobile App Container', description: 'React Native / Expo App für Smartphones. Bietet UI für Verbindung, Live-Visualisierung und Verlauf.', tech: 'React Native, TypeScript, Zustand', deployable: true, file: 'app/architecture.md' },
                { id: 'backend', type: 'container', title: 'Backend & Database Container', description: 'Node.js/Express API und PostgreSQL/SQLite Datenbank. Speichert Benutzerprofile und historische Trainingsdaten.', tech: 'Node.js, Express, PostgreSQL / SQLite', deployable: true, file: 'database/architecture.md' }
            ],
            connections: [
                { from: 'firmware', to: 'app', text: 'BLE Data Stream' },
                { from: 'app', to: 'backend', text: 'HTTPS / WebSockets' }
            ]
        },

        components: {
            app: {
                title: "Mobile App Komponenten",
                elements: [
                    { id: 'firmware_ghost', type: 'external', title: 'Sensor-Firmware Container', description: 'Erfasst Sensordaten und klassifiziert Übungen lokal.', tech: 'C4 Container (nRF52840)' },
                    { id: 'side_nav', type: 'component', title: 'SideNav UI', description: 'Navigationskomponente für die App-Steuerung auf Tablets und Web.', tech: 'React Native Component', file: 'app/components/side_nav/architecture.md' },
                    { id: 'sensor_card', type: 'component', title: 'SensorCard UI', description: 'Steuert den Verbindungszustand und das Bluetooth-Geräte-Pairing.', tech: 'React Native Component', file: 'app/components/sensor_card/architecture.md' },
                    { id: 'live_chart', type: 'component', title: 'LiveChart UI', description: 'Echtzeit-Zeichnung des Beschleunigungs- und Gyroskop-Verlaufs.', tech: 'SVG Canvas Component', file: 'app/components/live_chart/architecture.md' },
                    { id: 'session_card', type: 'component', title: 'SessionCard UI', description: 'Zeigt eine Zusammenfassung einer vergangenen Trainingseinheit.', tech: 'React Native Component', file: 'app/components/session_card/architecture.md' },
                    { id: 'profile_card', type: 'component', title: 'ProfileCard UI', description: 'Komponente zur Darstellung der Benutzerdaten und Authentifizierung.', tech: 'React Native Component', file: 'app/components/ProfileCard/architecture.md' },
                    { id: 'use_ble', type: 'component', title: 'useBLE Hook', description: 'Custom React Hook für das Scanning und die BLE-Verbindung.', tech: 'TypeScript Hook', file: 'app/hooks/useBLE.ts' },
                    { id: 'use_ws', type: 'component', title: 'useWebSocket Hook', description: 'Verbindung zum Backend zwecks Live-Datentransfer.', tech: 'TypeScript Hook', file: 'app/hooks/useWebSocket.ts' },
                    { id: 'backend_ghost', type: 'external', title: 'Backend Container', description: 'API und PostgreSQL Datenbank zur Verwaltung und Speicherung.', tech: 'C4 Container (Node.js)' }
                ],
                connections: [
                    { from: 'firmware_ghost', to: 'use_ble', text: 'BLE Data Stream' },
                    { from: 'sensor_card', to: 'use_ble', text: 'Steuert BLE-Verbindung' },
                    { from: 'live_chart', to: 'use_ble', text: 'Liest IMU-Daten' },
                    { from: 'profile_card', to: 'use_ws', text: 'Nutzt API' },
                    { from: 'session_card', to: 'use_ws', text: 'Lädt historische Daten' },
                    { from: 'use_ws', to: 'backend_ghost', text: 'HTTPS / WebSockets' }
                ]
            },
            firmware: {
                title: "Sensor-Firmware Komponenten",
                elements: [
                    { id: 'imu_reader', type: 'component', title: 'Sensordatenerfassung (Loop)', description: 'Periodische Erfassung der Rohbeschleunigungs- und Gyroskopwerte mit 50Hz.', tech: 'C++ Module', file: 'embedded/src/components/sensordatenerfassung/architecture.md' },
                    { id: 'inference_engine', type: 'component', title: 'Inferenz-Engine (Edge Impulse)', description: 'Lokale Ausführung des trainierten neuronalen Netzes (CNN) zur Curl-Klassifizierung.', tech: 'Inferenzbibliothek', file: 'embedded/src/components/inferenz_engine/architecture.md' },
                    { id: 'led_display_controller', type: 'component', title: 'LED- & Display-Controller', description: 'Gibt dem Trainierenden direktes visuelles Feedback zur Qualität der Übungsausführung.', tech: 'C++ Module', file: 'embedded/src/components/led_display_controller/architecture.md' },
                    { id: 'ble_streamer', type: 'component', title: 'BLE-Streamer', description: 'Überträgt die erfassten 6-Achsen-Messwerte über Bluetooth Low Energy (BLE) an die Mobile App.', tech: 'C++ Module', file: 'embedded/src/components/ble_streamer/architecture.md' },
                    { id: 'gehause', type: 'component', title: 'Gehäuse', description: 'Physisches, schützendes 3D-Druck-Gehäuse des Sensors.', tech: '3D CAD Model (Blender Python)', file: 'embedded/src/components/gehause/architecture.md' },
                    { id: 'app_ghost', type: 'external', title: 'Mobile App Container', description: 'Visualisiert Echtzeitdaten, steuert Geräte-Pairing und verwaltet Trainings.', tech: 'C4 Container (React Native)' }
                ],
                connections: [
                    { from: 'imu_reader', to: 'inference_engine', text: 'Arrays([accelerometerX, accelerometerY, accelerometerZ, gyroscopeX, gyroscopeY, gyroscopeZ])' },
                    { from: 'inference_engine', to: 'led_display_controller', text: '{ klasse, wahrscheinlichkeit, anomalie_score }' },
                    { from: 'inference_engine', to: 'ble_streamer', text: '{ klasse, wahrscheinlichkeit, anomalie_score }' },
                    { from: 'imu_reader', to: 'ble_streamer', text: 'Raw IMU Data (6-Axis)' },
                    { from: 'ble_streamer', to: 'app_ghost', text: 'Json ({"event": "inferenz_ergebnis", "klasse": "LateralRaises", "wahrscheinlichkeit": 0.824, "anomalie_score": 4.515, "tipp": "Warte auf Bluetooth-Verbindung..."})' }
                ]
            }
        },
        classes: {
            imu_reader: {
                title: "Sensordatenerfassung Klassen & Funktionen",
                elements: [
                    { id: 'init_imu', type: 'class', title: 'initIMU()', description: 'Initialisiert die LSM6DS3 IMU-Hardware über den I2C-Bus.', tech: 'C++ Function', file: 'embedded/src/components/sensordatenerfassung/IMUReader.cpp', line: 12 },
                    { id: 'read_sensor_data', type: 'class', title: 'readSensorData()', description: 'Liest Beschleunigungs- und Drehratenwerte mit 50Hz, clampt auf 2G und skaliert in m/s².', tech: 'C++ Function', file: 'embedded/src/components/sensordatenerfassung/IMUReader.cpp', line: 17 }
                ],
                connections: [
                    { from: 'init_imu', to: 'read_sensor_data' }
                ]
            },
            inference_engine: {
                title: "Inferenz-Engine Klassen & Funktionen",
                elements: [
                    { id: 'run_model_inference', type: 'class', title: 'runModelInference()', description: 'Erstellt das Signal aus dem DSP-Puffer und führt den CNN-Klassifikator aus.', tech: 'C++ Function', file: 'embedded/src/components/inferenz_engine/InferenceEngine_impl.h', line: 7 }
                ],
                connections: []
            },
            led_display_controller: {
                title: "LED- & Display-Controller Klassen & Funktionen",
                elements: [
                    { id: 'init_feedback', type: 'class', title: 'initFeedback()', description: 'Initialisiert OLED-Display (U8x8) und konfiguriert RGB LED Pins (11, 12, 13) als Ausgang.', tech: 'C++ Function', file: 'embedded/src/components/led_display_controller/VisualFeedback.cpp', line: 12 },
                    { id: 'update_feedback', type: 'class', title: 'updateFeedback()', description: 'Steuert Low-Active RGB-LEDs (Blau=Idle, Grün=Perfekt, Rot=Fehler) und zeigt Statusmeldungen an.', tech: 'C++ Function', file: 'embedded/src/components/led_display_controller/VisualFeedback.cpp', line: 25 },
                    { id: 'send_json_to_pc', type: 'class', title: 'sendJsonToPC()', description: 'Formatiert Inferenzwerte, Konfidenz und Tipps als JSON-String und sendet diese via Serial.', tech: 'C++ Function', file: 'embedded/src/components/led_display_controller/VisualFeedback.cpp', line: 68 }
                ],
                connections: [
                    { from: 'init_feedback', to: 'update_feedback' },
                    { from: 'update_feedback', to: 'send_json_to_pc', text: 'ruft auf' }
                ]
            },
            gehause: {
                title: "Gehäuse Design-Skripte",
                elements: [
                    { id: 'create_ultimate_whoop_case', type: 'class', title: 'create_ultimate_whoop_case()', description: 'Baut Unterteil, Armbandlaschen, USB-C-Anschluss, Deckel und Schnapper per Blender API auf.', tech: 'Python Function', file: 'embedded/src/Gehause.py', line: 3 }
                ],
                connections: []
            },
            side_nav: {
                title: "SideNav UI Komponenten",
                elements: [
                    { id: 'side_nav_comp', type: 'class', title: 'SideNav()', description: 'Funktionale React-Komponente für die Seiten-Navigation.', tech: 'JSX React Component', file: 'app/components/side_nav/SideNav.tsx', line: 19 }
                ],
                connections: []
            },
            sensor_card: {
                title: "SensorCard UI Komponenten",
                elements: [
                    { id: 'sensor_card_comp', type: 'class', title: 'SensorCard()', description: 'Funktionale React-Komponente, die das BLE-Koppel-UI und Verbindungsstatus anzeigt.', tech: 'JSX React Component', file: 'app/components/sensor_card/SensorCard.tsx', line: 55 }
                ],
                connections: []
            },
            live_chart: {
                title: "LiveChart UI Komponenten",
                elements: [
                    { id: 'live_chart_comp', type: 'class', title: 'LiveChart()', description: 'Zeichnet eintreffende IMU-Beschleunigungs- und Drehratendaten in Echtzeit auf einem SVG-Canvas.', tech: 'JSX React Component', file: 'app/components/live_chart/LiveChart.tsx', line: 66 }
                ],
                connections: []
            },
            session_card: {
                title: "SessionCard UI Komponenten",
                elements: [
                    { id: 'session_card_comp', type: 'class', title: 'SessionCard()', description: 'Zeigt Metadaten und Diagramme vergangener Trainingseinheiten an.', tech: 'JSX React Component', file: 'app/components/session_card/SessionCard.tsx', line: 30 }
                ],
                connections: []
            },
            use_ble: {
                title: "useBLE Hook Funktionen",
                elements: [
                    { id: 'use_ble_hook', type: 'class', title: 'useBLE()', description: 'Führt das Bluetooth LE Scanning aus, stellt die Verbindung her und abonniert die IMU-Characteristic.', tech: 'React Custom Hook', file: 'app/hooks/useBLE.ts', line: 5 }
                ],
                connections: []
            },
            use_ws: {
                title: "useWebSocket Hook Funktionen",
                elements: [
                    { id: 'use_ws_hook', type: 'class', title: 'useWebSocket()', description: 'Öffnet einen WebSocket-Kanal zum Backend für das Echtzeit-Streaming der Bewegungsdaten.', tech: 'React Custom Hook', file: 'app/hooks/useWebSocket.ts', line: 5 }
                ],
                connections: []
            },
            ble_streamer: {
                title: "BLE-Streamer Klassen & Funktionen",
                elements: [
                    { id: 'init_ble', type: 'class', title: 'initBLE()', description: 'Initialisiert den BLE-Stack des nRF52840, konfiguriert den GATT-Service und startet Advertising.', tech: 'C++ Function', file: 'embedded/src/components/ble_streamer/BLEStreamer.cpp', line: 8 },
                    { id: 'stream_imu_data', type: 'class', title: 'streamIMUData()', description: 'Formatiert 6-Achsen-Daten in einen 24-Byte-Puffer und updatet die BLE GATT Characteristic.', tech: 'C++ Function', file: 'embedded/src/components/ble_streamer/BLEStreamer.cpp', line: 27 }
                ],
                connections: [
                    { from: 'init_ble', to: 'stream_imu_data' }
                ]
            }
        }
    };

    function renderC4Explorer() {
        const board = document.getElementById('c4Board');
        const breadcrumbs = document.getElementById('c4Breadcrumbs');
        const zoomOutBtn = document.getElementById('c4ZoomOutBtn');
        const detailContent = document.getElementById('c4DetailContent');

        if (!board) return;

        board.innerHTML = '';
        const svg = document.getElementById('c4Svg');
        if (svg) {
            const defs = svg.querySelector('defs');
            svg.innerHTML = '';
            if (defs) svg.appendChild(defs);
        }

        // Reset CSS classes
        board.className = 'c4-board';

        // 1. Breadcrumbs update
        let breadcrumbHtml = `<span class="breadcrumb-item clickable" id="c4BcSystem" style="color: var(--primary); cursor: pointer;"><i class="fa-solid fa-network-wired"></i> System-Kontext</span>`;

        if (state.c4Level === 'containers' || state.c4Level === 'components' || state.c4Level === 'code') {
            breadcrumbHtml += ` <span class="separator">&gt;</span> <span class="breadcrumb-item clickable" id="c4BcContainers" style="color: var(--primary); cursor: pointer;">MoveLink System</span>`;
        }
        if (state.c4Level === 'components' || state.c4Level === 'code') {
            const containerName = state.c4ActiveContainer === 'app' ? 'Mobile App Container' : 'Sensor Firmware Container';
            breadcrumbHtml += ` <span class="separator">&gt;</span> <span class="breadcrumb-item clickable" id="c4BcComponents" style="color: var(--primary); cursor: pointer;">${containerName}</span>`;
        }
        if (state.c4Level === 'code') {
            const componentName = getComponentName(state.c4ActiveComponent);
            breadcrumbHtml += ` <span class="separator">&gt;</span> <span class="breadcrumb-item active">${componentName}</span>`;
        }
        breadcrumbs.innerHTML = breadcrumbHtml;

        // Wire breadcrumb clicks
        document.getElementById('c4BcSystem').addEventListener('click', () => {
            zoomToLevel('context');
        });
        const bcContainers = document.getElementById('c4BcContainers');
        if (bcContainers) {
            bcContainers.addEventListener('click', () => {
                zoomToLevel('containers');
            });
        }
        const bcComponents = document.getElementById('c4BcComponents');
        if (bcComponents) {
            bcComponents.addEventListener('click', () => {
                zoomToLevel('components', state.c4ActiveContainer);
            });
        }

        // 2. Zoom Out Button update
        if (state.c4Level === 'context') {
            zoomOutBtn.style.display = 'none';
        } else {
            zoomOutBtn.style.display = 'block';
        }

        zoomOutBtn.onclick = () => {
            if (state.c4Level === 'code') {
                zoomToLevel('components', state.c4ActiveContainer);
            } else if (state.c4Level === 'components') {
                zoomToLevel('containers');
            } else if (state.c4Level === 'containers') {
                zoomToLevel('context');
            }
        };

        // 3. Render Cards based on active level
        if (state.c4Level === 'context') {
            board.classList.add('c4-grid-context');
            const elementsList = C4_DATA.context.elements;

            elementsList.forEach(el => {
                const card = createC4Card(el);

                // Clicking system context card drills down to container view
                if (el.id === 'system') {
                    card.style.borderStyle = 'dashed';
                    card.title = "Klicke zum Öffnen der Container-Ebene";
                    card.addEventListener('click', (e) => {
                        e.stopPropagation();
                        zoomToLevel('containers');
                    });
                }

                board.appendChild(card);
            });
        }
        else if (state.c4Level === 'containers') {
            board.classList.add('c4-grid-containers');
            const elementsList = C4_DATA.containers.elements;

            elementsList.forEach(el => {
                const card = createC4Card(el);

                // Double check if clickable container
                if (el.id === 'app' || el.id === 'firmware') {
                    card.title = "Klicke zum Betrachten der Komponenten-Ebene";
                    card.addEventListener('click', (e) => {
                        e.stopPropagation();
                        zoomToLevel('components', el.id);
                    });
                }

                board.appendChild(card);
            });
        }
        else if (state.c4Level === 'components') {
            board.classList.add('c4-mermaid-view');
            const containerData = C4_DATA.components[state.c4ActiveContainer];
            const elementsList = containerData.elements;
            const connections = containerData.connections || [];

            // Helper to reliably extract original node id from Mermaid generated SVG node
            const extractId = (nodeEl, knownIds) => {
                let raw = nodeEl.id || nodeEl.getAttribute('data-id') || '';
                let cleaned = raw.replace(/^flowchart-/, '').replace(/-\d+$/, '');
                if (knownIds.includes(cleaned)) return cleaned;
                for (const id of knownIds) {
                    if (raw === id || raw.startsWith('flowchart-' + id + '-') || raw.includes('-' + id + '-')) {
                        return id;
                    }
                }
                return cleaned;
            };

            const knownComponentIds = elementsList.map(e => e.id);

            // Build clean Mermaid flowchart with high-contrast palette
            let mmd = 'flowchart LR\n';
            mmd += '    classDef comp fill:#1e293b,stroke:#a855f7,stroke-width:3px,color:#f8fafc\n';
            mmd += '    classDef ext fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#e2e8f0\n';

            elementsList.forEach(el => {
                const label = el.title.replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ');
                const cls = el.type === 'external' ? 'ext' : 'comp';
                mmd += `    ${el.id}["${label}"]:::${cls}\n`;
            });

            connections.forEach(conn => {
                let label = (conn.text || '').replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ').trim();
                if (label.length > 35) label = label.substring(0, 33) + '...';
                if (label) {
                    mmd += `    ${conn.from} -->|"${label}"|${conn.to}\n`;
                } else {
                    mmd += `    ${conn.from} --> ${conn.to}\n`;
                }
            });

            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.id = 'c4-components-mermaid';
            mermaidDiv.textContent = mmd;
            board.appendChild(mermaidDiv);

            setTimeout(async () => {
                try {
                    if (typeof mermaid !== 'undefined') {
                        await mermaid.run({ querySelector: '#c4-components-mermaid' });
                        const svgEl = mermaidDiv.querySelector('svg');
                        if (svgEl) {
                            svgEl.querySelectorAll('.node').forEach(nodeEl => {
                                const nodeId = extractId(nodeEl, knownComponentIds);
                                if (!nodeId || !knownComponentIds.includes(nodeId)) return;
                                nodeEl.style.cursor = 'pointer';
                                nodeEl.classList.add('clickable');
                                nodeEl.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    onC4MermaidComponentClick(nodeId);
                                });
                            });
                        }
                    }
                } catch (err) {
                    console.error('Mermaid components render error:', err);
                }
            }, 100);
        }
        else if (state.c4Level === 'code') {
            board.classList.add('c4-mermaid-view');
            const componentData = C4_DATA.classes[state.c4ActiveComponent];

            if (componentData && componentData.elements) {
                let parentContainerData = state.c4ActiveContainer ? C4_DATA.components[state.c4ActiveContainer] : null;
                if (!parentContainerData) {
                    for (const key in C4_DATA.components) {
                        if (C4_DATA.components[key].elements.some(e => e.id === state.c4ActiveComponent)) {
                            parentContainerData = C4_DATA.components[key];
                            break;
                        }
                    }
                }

                const compTitleMap = {};
                if (parentContainerData && parentContainerData.elements) {
                    parentContainerData.elements.forEach(el => {
                        compTitleMap[el.id] = el.title.replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ').trim();
                    });
                }

                const inputs = parentContainerData && parentContainerData.connections ?
                    parentContainerData.connections.filter(c => c.to === state.c4ActiveComponent) : [];
                const outputs = parentContainerData && parentContainerData.connections ?
                    parentContainerData.connections.filter(c => c.from === state.c4ActiveComponent) : [];

                // Helper to reliably extract original node id from Mermaid generated SVG node
                const extractId = (nodeEl, knownIds) => {
                    let raw = nodeEl.id || nodeEl.getAttribute('data-id') || '';
                    let cleaned = raw.replace(/^flowchart-/, '').replace(/-\d+$/, '');
                    if (knownIds.includes(cleaned)) return cleaned;
                    for (const id of knownIds) {
                        if (raw === id || raw.startsWith('flowchart-' + id + '-') || raw.includes('-' + id + '-')) {
                            return id;
                        }
                    }
                    return cleaned;
                };

                const internalIds = componentData.elements.map(e => e.id);
                const ghostInIds = inputs.map((_, i) => 'ghost_in_' + i);
                const ghostOutIds = outputs.map((_, i) => 'ghost_out_' + i);
                const allKnownIds = [...internalIds, ...ghostInIds, ...ghostOutIds];

                let mmd = 'flowchart LR\n';
                mmd += '    classDef cls fill:#1e293b,stroke:#a855f7,stroke-width:3px,color:#f8fafc\n';
                mmd += '    classDef ghost fill:#0f172a,stroke:#38bdf8,stroke-width:2px,stroke-dasharray:5 5,color:#38bdf8\n';

                // Ghost inputs
                inputs.forEach((inp, i) => {
                    const ghostId = 'ghost_in_' + i;
                    const ghostLabel = compTitleMap[inp.from] || inp.from;
                    mmd += `    ${ghostId}["⬅ ${ghostLabel}"]:::ghost\n`;
                });

                // Internal classes/functions
                componentData.elements.forEach(el => {
                    const label = el.title.replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ');
                    const tech = (el.tech || '').replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ');
                    mmd += `    ${el.id}["${label} (${tech})"]:::cls\n`;
                });

                // Ghost outputs
                outputs.forEach((out, i) => {
                    const ghostId = 'ghost_out_' + i;
                    const ghostLabel = compTitleMap[out.to] || out.to;
                    mmd += `    ${ghostId}["${ghostLabel} ➡"]:::ghost\n`;
                });

                // Connect ghost inputs to first internal element
                if (componentData.elements.length > 0) {
                    const firstEl = componentData.elements[0].id;
                    inputs.forEach((inp, i) => {
                        let label = (inp.text || '').replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ').trim();
                        if (label.length > 35) label = label.substring(0, 33) + '...';
                        if (label) {
                            mmd += `    ghost_in_${i} -->|"${label}"|${firstEl}\n`;
                        } else {
                            mmd += `    ghost_in_${i} --> ${firstEl}\n`;
                        }
                    });
                }

                // Internal connections
                if (componentData.connections && componentData.connections.length > 0) {
                    componentData.connections.forEach(conn => {
                        let label = (conn.text || '').replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ').trim();
                        if (label) {
                            mmd += `    ${conn.from} -->|"${label}"|${conn.to}\n`;
                        } else {
                            mmd += `    ${conn.from} --> ${conn.to}\n`;
                        }
                    });
                }

                // Connect last internal element to ghost outputs
                if (componentData.elements.length > 0) {
                    const lastEl = componentData.elements[componentData.elements.length - 1].id;
                    outputs.forEach((out, i) => {
                        let label = (out.text || '').replace(/"/g, "'").replace(/[[\]{}()<>|&]/g, ' ').trim();
                        if (label.length > 35) label = label.substring(0, 33) + '...';
                        if (label) {
                            mmd += `    ${lastEl} -->|"${label}"|ghost_out_${i}\n`;
                        } else {
                            mmd += `    ${lastEl} --> ghost_out_${i}\n`;
                        }
                    });
                }

                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.id = 'c4-code-mermaid';
                mermaidDiv.textContent = mmd;
                board.appendChild(mermaidDiv);

                setTimeout(async () => {
                    try {
                        if (typeof mermaid !== 'undefined') {
                            await mermaid.run({ querySelector: '#c4-code-mermaid' });
                            const svgEl = mermaidDiv.querySelector('svg');
                            if (svgEl) {
                                svgEl.querySelectorAll('.node').forEach(nodeEl => {
                                    const rawId = extractId(nodeEl, allKnownIds);
                                    if (!rawId || !allKnownIds.includes(rawId)) return;
                                    nodeEl.style.cursor = 'pointer';
                                    nodeEl.classList.add('clickable');
                                    if (internalIds.includes(rawId)) {
                                        nodeEl.addEventListener('click', (e) => {
                                            e.stopPropagation();
                                            onC4MermaidNodeClick(rawId);
                                        });
                                    } else if (rawId.startsWith('ghost_in_')) {
                                        const idx = parseInt(rawId.replace('ghost_in_', ''), 10);
                                        if (!isNaN(idx) && inputs[idx] && C4_DATA.classes[inputs[idx].from]) {
                                            nodeEl.title = 'Drilldown in ' + (compTitleMap[inputs[idx].from] || inputs[idx].from);
                                            nodeEl.addEventListener('click', (e) => {
                                                e.stopPropagation();
                                                zoomToLevel('code', state.c4ActiveContainer, inputs[idx].from);
                                            });
                                        }
                                    } else if (rawId.startsWith('ghost_out_')) {
                                        const idx = parseInt(rawId.replace('ghost_out_', ''), 10);
                                        if (!isNaN(idx) && outputs[idx] && C4_DATA.classes[outputs[idx].to]) {
                                            nodeEl.title = 'Drilldown in ' + (compTitleMap[outputs[idx].to] || outputs[idx].to);
                                            nodeEl.addEventListener('click', (e) => {
                                                e.stopPropagation();
                                                zoomToLevel('code', state.c4ActiveContainer, outputs[idx].to);
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    } catch (err) {
                        console.error('Mermaid code view render error:', err);
                    }
                }, 100);
            } else {
                board.innerHTML = `
                    <div class="detail-placeholder" style="text-align: center; margin: auto;">
                        <i class="fa-solid fa-code"></i>
                        <p>Keine detaillierten Klassen oder Funktionen für diese Komponente modelliert.</p>
                    </div>
                `;
            }
        }

        // 4. Update Use Cases section visibility and content
        const ucSection = document.getElementById('c4UseCasesSection');
        const ucGrid = document.getElementById('c4UseCasesGrid');

        if (state.c4Level === 'context') {
            if (ucSection && ucGrid) {
                ucSection.style.display = 'block';
                ucGrid.innerHTML = '';

                const useCasesFile = DOCS_DATA.files.find(f => f.path === 'doc/UseCases.md');
                if (useCasesFile) {
                    const sections = useCasesFile.content.split('---');
                    sections.forEach(sec => {
                        const ucMatch = sec.match(/\*\*(UC-\d+)\*\*:\s*(.*)/);
                        if (ucMatch) {
                            const ucId = ucMatch[1];
                            const ucTitle = ucMatch[2].trim();

                            const actorMatch = sec.match(/\*\*(?:Akteur|Actor)\*\*:\s*(.*)/i);
                            const preCondMatch = sec.match(/\*\*(?:Vorbedingung|Precondition)\*\*:\s*(.*)/i);
                            const descMatch = sec.match(/\*\*(?:Beschreibung|Description)\*\*:\s*(.*)/i);

                            const actor = actorMatch ? actorMatch[1].trim() : 'Trainierender';
                            const precondition = preCondMatch ? preCondMatch[1].trim() : '';
                            const description = descMatch ? descMatch[1].trim() : '';

                            const card = document.createElement('div');
                            card.className = 'uc-card';

                            card.innerHTML = `
                                <div class="uc-card-header">
                                    <span class="node-badge usecase" style="font-size: 10px; font-weight: 700; padding: 3px 8px;">${ucId}</span>
                                    <span class="uc-card-actor">
                                        <i class="fa-solid fa-user"></i> ${actor}
                                    </span>
                                </div>
                                <h4 class="uc-card-title">${ucTitle}</h4>
                                <p class="uc-card-desc">${description}</p>
                                ${precondition ? `<div class="uc-card-precond"><strong>Vorbedingung:</strong> ${precondition}</div>` : ''}
                            `;

                            card.addEventListener('click', () => {
                                selectFile('doc/UseCases.md');
                                const docsTabBtn = document.querySelector('[data-target="docs-tab"]');
                                if (docsTabBtn) {
                                    docsTabBtn.click();

                                    // Scroll to the specific Use Case header in the document
                                    setTimeout(() => {
                                        const headings = document.querySelectorAll('#markdownRender h1, #markdownRender h2, #markdownRender h3, #markdownRender h4, #markdownRender p, #markdownRender strong');
                                        for (const h of headings) {
                                            if (h.textContent.includes(ucId)) {
                                                h.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                // Temporarily highlight the text
                                                const originalBackground = h.style.backgroundColor;
                                                h.style.backgroundColor = 'var(--primary-glow)';
                                                h.style.borderRadius = '4px';
                                                h.style.padding = '2px 6px';
                                                h.style.transition = 'background-color 0.8s ease';
                                                setTimeout(() => {
                                                    h.style.backgroundColor = originalBackground;
                                                }, 2000);
                                                break;
                                            }
                                        }
                                    }, 100);
                                }
                            });

                            ucGrid.appendChild(card);
                        }
                    });
                }
            }
        } else {
            if (ucSection) {
                ucSection.style.display = 'none';
            }
        }

        // Trigger connector rendering after browser layout
        setTimeout(drawC4Connections, 100);
    }

    function getComponentName(id) {
        for (const containerId in C4_DATA.components) {
            const comp = C4_DATA.components[containerId].elements.find(e => e.id === id);
            if (comp) return comp.title;
        }
        return id;
    }

    function createC4Card(el) {
        const card = document.createElement('div');
        card.className = `c4-card ${el.type}`;
        card.setAttribute('data-id', el.id);

        const isDeployable = el.deployable;
        const deployableBadge = isDeployable ? `<span class="node-badge requirement" style="font-size: 8px;"><i class="fa-solid fa-cloud-arrow-up"></i> Deployable</span>` : '';

        card.innerHTML = `
            <div class="c4-header-row">
                <span class="c4-tech">${el.tech}</span>
                ${deployableBadge}
            </div>
            <div class="c4-title">${el.title}</div>
            <div class="c4-desc">${el.description}</div>
        `;

        card.addEventListener('click', (e) => {
            // Check if it was double click or drill-down target. We still highlight it first.
            const cards = document.querySelectorAll('.c4-card');
            cards.forEach(c => c.style.borderColor = '');
            card.style.borderColor = 'var(--primary)';

            // Show details in sidebar
            showC4Detail(el);
        });

        return card;
    }

    function zoomToLevel(level, containerId = null, componentId = null) {
        state.c4Level = level;
        state.c4ActiveContainer = containerId;
        state.c4ActiveComponent = componentId;
        renderC4Explorer();

        // Clear details
        showC4Detail(null);
    }

    function showC4Detail(el) {
        const detailContent = document.getElementById('c4DetailContent');
        if (!detailContent) return;

        if (!el) {
            detailContent.innerHTML = `
                <div class="detail-placeholder">
                    <i class="fa-solid fa-cube"></i>
                    <p>Klicke auf ein Element (eine Box) im C4-Modell, um Details, Technologiestack und Implementierungsdateien anzuzeigen.</p>
                </div>
            `;
            return;
        }

        const isContainer = el.type === 'container';
        const isComponent = el.type === 'component';

        let c4LevelLabel = '';
        if (el.type === 'actor') c4LevelLabel = 'Person / Stakeholder';
        if (el.type === 'system-context') c4LevelLabel = 'System Kontext';
        if (el.type === 'container') c4LevelLabel = 'Container (Deployable)';
        if (el.type === 'component') c4LevelLabel = 'Component';
        if (el.type === 'class') c4LevelLabel = 'Klasse / Funktion';
        if (el.type === 'external') c4LevelLabel = 'Externes System';

        let badgeClass = el.type === 'container' ? 'usecase' : (el.type === 'component' ? 'code' : 'requirement');

        let fileLinkHtml = '';
        if (el.file) {
            const isSource = el.file.endsWith('.ts') || el.file.endsWith('.tsx') || el.file.endsWith('.ino') || el.file.endsWith('.cpp') || el.file.endsWith('.py');
            if (isSource) {
                const lineNum = el.line || 1;
                fileLinkHtml = `
                    <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">
                        Quellcode: <span class="btn-text-link" onclick="window.app.openCodeView('${el.file}', ${lineNum})">${el.file}:${lineNum}</span>
                    </div>
                    <button class="btn btn-secondary" onclick="window.app.openCodeView('${el.file}', ${lineNum})" style="width:100%; margin-top: 8px;">
                        <i class="fa-solid fa-code"></i> Code im Editor anzeigen
                    </button>
                `;
            } else {
                fileLinkHtml = `
                    <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">
                        Dokumentiert in: <span class="btn-text-link" onclick="window.app.showTraceDetails('${el.title}')" style="cursor:pointer">${el.file}</span>
                    </div>
                    <button class="btn btn-secondary" onclick="window.app.showTraceDetails('${el.title}')" style="width:100%; margin-top: 8px;">
                        <i class="fa-regular fa-file-lines"></i> Dokumentation anzeigen
                    </button>
                `;
            }
        }

        detailContent.innerHTML = `
            <div class="detail-header">
                <span class="node-badge ${badgeClass} detail-badge">${c4LevelLabel}</span>
                <h4 class="detail-title">${el.title}</h4>
            </div>
            
            <div class="detail-description">${el.description}</div>
            
            <div class="detail-section-title">Technologie</div>
            <div style="font-size:12px;color:var(--text-secondary);background:rgba(0,0,0,0.1);padding:6px 10px;border-radius:6px;font-family:monospace;margin-bottom:16px">
                ${el.tech || 'Keine Angabe'}
            </div>
            
            ${fileLinkHtml}
        `;
    }

    function getBoxIntersection(x1, y1, x2, y2, rx, ry, rw, rh) {
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;
        let tMin = 1;
        const dx = x2 - cx;
        const dy = y2 - cy;

        if (Math.abs(dx) > 1e-5) {
            let t = (rx - cx) / dx;
            if (t > 0 && t < tMin) {
                const y = cy + t * dy;
                if (y >= ry && y <= ry + rh) tMin = t;
            }
            t = (rx + rw - cx) / dx;
            if (t > 0 && t < tMin) {
                const y = cy + t * dy;
                if (y >= ry && y <= ry + rh) tMin = t;
            }
        }

        if (Math.abs(dy) > 1e-5) {
            let t = (ry - cy) / dy;
            if (t > 0 && t < tMin) {
                const x = cx + t * dx;
                if (x >= rx && x <= rx + rw) tMin = t;
            }
            t = (ry + rh - cy) / dy;
            if (t > 0 && t < tMin) {
                const x = cx + t * dx;
                if (x >= rx && x <= rx + rw) tMin = t;
            }
        }

        return {
            x: cx + tMin * dx,
            y: cy + tMin * dy
        };
    }

    function drawC4Connections() {
        const svg = document.getElementById('c4Svg');
        const container = document.getElementById('c4BoardContainer');
        if (!svg || !container) return;

        // Clear existing drawn paths and texts (keep defs)
        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        if (defs) svg.appendChild(defs);

        // Get connections based on active level
        let connections = [];
        if (state.c4Level === 'context') {
            connections = C4_DATA.context.connections || [];
        } else if (state.c4Level === 'containers') {
            connections = C4_DATA.containers.connections || [];
        } else if (state.c4Level === 'components') {
            connections = []; // Mermaid handles connections natively
        } else if (state.c4Level === 'code') {
            connections = []; // Mermaid handles connections natively
        }

        if (connections.length === 0) {
            svg.style.width = '0px';
            svg.style.height = '0px';
            return;
        }

        // Set SVG size to match container scrollHeight and scrollWidth
        const scrollWidth = container.scrollWidth;
        const scrollHeight = container.scrollHeight;
        svg.setAttribute('width', scrollWidth);
        svg.setAttribute('height', scrollHeight);
        svg.style.width = scrollWidth + 'px';
        svg.style.height = scrollHeight + 'px';

        const containerRect = container.getBoundingClientRect();
        const isDark = document.body.classList.contains('dark-mode');

        connections.forEach(conn => {
            const elFrom = document.querySelector(`[data-id="${conn.from}"]`);
            const elTo = document.querySelector(`[data-id="${conn.to}"]`);

            if (!elFrom || !elTo) return;

            const rectFrom = elFrom.getBoundingClientRect();
            const rectTo = elTo.getBoundingClientRect();

            // Card positions relative to the container, considering scrolling
            const boxA = {
                x: rectFrom.left - containerRect.left + container.scrollLeft,
                y: rectFrom.top - containerRect.top + container.scrollTop,
                w: rectFrom.width,
                h: rectFrom.height
            };

            const boxB = {
                x: rectTo.left - containerRect.left + container.scrollLeft,
                y: rectTo.top - containerRect.top + container.scrollTop,
                w: rectTo.width,
                h: rectTo.height
            };

            const cxA = boxA.x + boxA.w / 2;
            const cyA = boxA.y + boxA.h / 2;
            const cxB = boxB.x + boxB.w / 2;
            const cyB = boxB.y + boxB.h / 2;

            // Calculate start and end at boundaries of boxes
            const start = getBoxIntersection(cxA, cyA, cxB, cyB, boxA.x, boxA.y, boxA.w, boxA.h);
            const end = getBoxIntersection(cxB, cyB, cxA, cyA, boxB.x, boxB.y, boxB.w, boxB.h);

            // Shorten start and end to leave a gap from the card borders (improves arrowhead visibility)
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 30) {
                const startGap = 8;
                const endGap = 12;
                start.x += (dx / dist) * startGap;
                start.y += (dy / dist) * startGap;
                end.x -= (dx / dist) * endGap;
                end.y -= (dy / dist) * endGap;
            }

            // Determine stroke color and marker arrowhead
            let strokeColor = isDark ? '#00d4aa' : '#00a685';
            let markerId = isDark ? 'arrow-teal' : 'arrow-teal-light';

            if (state.c4Level === 'components') {
                strokeColor = '#8b5cf6';
                markerId = 'arrow-purple';
            } else if (state.c4Level === 'code') {
                strokeColor = '#f97316';
                markerId = 'arrow-orange';
            }

            // Draw line
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            let pathData = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            let isSegmented = false;


            path.setAttribute('d', pathData);
            path.setAttribute('stroke', strokeColor);
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', `url(#${markerId})`);

            // Context lines to external or database can be dashed
            if (conn.to === 'external_db' || elTo.classList.contains('external')) {
                path.setAttribute('stroke-dasharray', '5,5');
            }

            svg.appendChild(path);

            // Add text label centered on the line
            if (conn.text) {
                let midX = (start.x + end.x) / 2;
                let midY = (start.y + end.y) / 2;

                if (isSegmented) {
                    const startX = boxA.x + boxA.w / 2;
                    const startY = boxA.y;
                    const endX = boxB.x + boxB.w / 2;

                    midX = (startX + endX) / 2;
                    midY = startY - 35;
                }

                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.textContent = conn.text;
                text.setAttribute('font-size', '11px');
                text.setAttribute('font-family', 'var(--font-body)');
                text.setAttribute('font-weight', '600');
                text.setAttribute('fill', isDark ? '#f0f4f3' : '#1e2e2b');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'middle');
                text.setAttribute('x', midX);
                text.setAttribute('y', midY);

                // Add to SVG to calculate width/height
                svg.appendChild(text);
                const bbox = text.getBBox();
                svg.removeChild(text);

                // Add a styled background rectangle for the text
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', bbox.x - 8);
                rect.setAttribute('y', bbox.y - 4);
                rect.setAttribute('width', bbox.width + 16);
                rect.setAttribute('height', bbox.height + 8);
                rect.setAttribute('fill', isDark ? '#0b1614' : '#eaf2f0'); // Pill background matching theme
                rect.setAttribute('rx', '6');
                rect.setAttribute('ry', '6');
                rect.setAttribute('stroke', strokeColor); // Border matching the line color
                rect.setAttribute('stroke-width', '1.2');

                g.appendChild(rect);
                g.appendChild(text);
                svg.appendChild(g);
            }
        });
    }

    // 14. Start Application
    updateStats();
    renderFileList();
    selectFile(state.activeFile);
});
