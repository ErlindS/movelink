document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State
    const state = {
        activeTab: 'docs-tab',
        activeFile: 'doc/Requirements.md',
        searchQuery: '',
        treeFilter: '',
        physicsEnabled: true,
        network: null,
        theme: 'dark'
    };

    // Fallback if data.js didn't load or is empty
    if (typeof DOCS_DATA === 'undefined') {
        window.DOCS_DATA = { files: [], definitions: {}, references: {} };
    }

    // Expose app to window for inline onclick handlers
    window.app = {
        showTraceDetails,
        openCodeView,
        navigateToHeader
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
        
        // Tree
        traceTree: document.getElementById('traceTree'),
        treeFilter: document.getElementById('treeFilter'),
        expandAllTree: document.getElementById('expandAllTree'),
        collapseAllTree: document.getElementById('collapseAllTree'),
        
        // Matrix
        traceMatrix: document.getElementById('traceMatrix'),
        
        // Graph
        networkGraph: document.getElementById('networkGraph'),
        fitGraphBtn: document.getElementById('fitGraphBtn'),
        togglePhysicsBtn: document.getElementById('togglePhysicsBtn'),
        graphDetailContent: document.getElementById('graphDetailContent'),
        
        // Modal
        codeModal: document.getElementById('codeModal'),
        codeModalTitle: document.getElementById('codeModalTitle'),
        codeModalBlock: document.getElementById('codeModalBlock'),
        codeModalClose: document.getElementById('codeModalClose')
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
                'trace-tree-tab': 'E2E Trace-Baum',
                'matrix-tab': 'Matrix-Ansicht',
                'graph-tab': 'Netzwerk-Graph'
            };
            elements.activeTabTitle.textContent = labelMap[target];
            
            // Render target tab contents if needed
            if (target === 'trace-tree-tab') {
                renderTraceTree();
            } else if (target === 'matrix-tab') {
                renderTraceMatrix();
            } else if (target === 'graph-tab') {
                initNetworkGraph();
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
        
        // Re-initialize graph if it exists to adapt to new theme colors
        if (state.network && state.activeTab === 'graph-tab') {
            initNetworkGraph();
        }
    });

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

    // 7. Render File Navigation Sidebar
    function renderFileList() {
        elements.fileList.innerHTML = '';
        
        // Group files by directory
        const groups = {};
        
        DOCS_DATA.files.forEach(file => {
            if (state.searchQuery) {
                const matchesSearch = 
                    file.path.toLowerCase().includes(state.searchQuery) ||
                    file.title.toLowerCase().includes(state.searchQuery) ||
                    file.content.toLowerCase().includes(state.searchQuery);
                    
                if (!matchesSearch) return;
            }
            
            const parts = file.path.split('/');
            const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'Wurzelverzeichnis';
            
            if (!groups[dir]) groups[dir] = [];
            groups[dir].push(file);
        });
        
        Object.keys(groups).forEach(dir => {
            const dirHeader = document.createElement('div');
            dirHeader.className = 'nav-section-title';
            dirHeader.style.marginTop = '10px';
            dirHeader.style.fontSize = '9px';
            dirHeader.innerHTML = `<i class="fa-regular fa-folder"></i> ${dir}`;
            elements.fileList.appendChild(dirHeader);
            
            groups[dir].forEach(file => {
                const li = document.createElement('li');
                const btn = document.createElement('button');
                btn.className = `nav-btn doc-btn ${file.path === state.activeFile ? 'active' : ''}`;
                btn.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${file.title}`;
                btn.addEventListener('click', () => {
                    selectFile(file.path);
                });
                li.appendChild(btn);
                elements.fileList.appendChild(li);
            });
        });
    }

    // 8. Select and Render Active Markdown File
    function selectFile(filePath) {
        state.activeFile = filePath;
        
        // Update active class in sidebar
        const buttons = elements.fileList.querySelectorAll('.doc-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Re-render sidebar to highlight active
        renderFileList();
        
        // Get file data
        const file = DOCS_DATA.files.find(f => f.path === filePath);
        if (!file) return;
        
        elements.docPathLabel.innerHTML = `<i class="fa-regular fa-folder-open"></i> ${file.path}`;
        
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
            mermaid.init(undefined, '.mermaid');
        } catch (e) {
            console.error('Mermaid render error:', e);
        }
        Prism.highlightAllUnder(elements.markdownRender);
        
        // Render TOC
        renderTOC(file.headings);
        
        // If we are not on the docs tab, switch to it
        if (state.activeTab !== 'docs-tab') {
            const docBtn = document.querySelector('[data-target="docs-tab"]');
            if (docBtn) docBtn.click();
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

    // 9. Render E2E Traceability Tree
    function renderTraceTree() {
        elements.traceTree.innerHTML = '';
        
        // Find all Use Cases (UC-X)
        const useCases = Object.values(DOCS_DATA.definitions)
            .filter(d => d.type === 'UC')
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
            
        if (useCases.length === 0) {
            elements.traceTree.innerHTML = '<div class="detail-placeholder"><i class="fa-solid fa-triangle-exclamation"></i> Kein Trace-Baum Daten vorhanden. Scrape erneut.</div>';
            return;
        }
        
        useCases.forEach(uc => {
            // Check if matches tree filter
            const filter = state.treeFilter.toLowerCase();
            
            // Find linked requirements
            const linkedReqs = Object.values(DOCS_DATA.definitions)
                .filter(d => d.type !== 'UC' && d.links.includes(uc.id))
                .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
                
            let matchesFilter = !filter || 
                                uc.id.toLowerCase().includes(filter) || 
                                uc.title.toLowerCase().includes(filter);
                                
            if (!matchesFilter) {
                // If Use Case itself doesn't match, check if any of its requirements match the filter
                const reqMatches = linkedReqs.some(req => 
                    req.id.toLowerCase().includes(filter) || 
                    req.title.toLowerCase().includes(filter) ||
                    (DOCS_DATA.references[req.id] && DOCS_DATA.references[req.id].some(ref => ref.file.toLowerCase().includes(filter)))
                );
                
                if (reqMatches) matchesFilter = true;
            }
            
            if (!matchesFilter) return; // Skip if filter is set and doesn't match
            
            const ucNode = document.createElement('div');
            ucNode.className = 'tree-node expanded'; // Default expanded
            
            const ucHeader = document.createElement('div');
            ucHeader.className = 'tree-node-header';
            ucHeader.innerHTML = `
                <i class="fa-solid fa-chevron-right tree-toggle-icon"></i>
                <span class="node-badge usecase">${uc.id}</span>
                <span class="node-title">${uc.title}</span>
                <span class="node-subtext">${uc.file}:${uc.line}</span>
            `;
            
            // Toggle open / close
            ucHeader.addEventListener('click', () => {
                ucNode.classList.toggle('expanded');
            });
            
            const ucChildren = document.createElement('div');
            ucChildren.className = 'tree-node-children';
            
            // Render linked requirements
            if (linkedReqs.length === 0) {
                ucChildren.innerHTML = '<div class="code-ref-node" style="color:var(--text-muted)"><i class="fa-solid fa-info-circle"></i> Keine Anforderungen verknüpft</div>';
            } else {
                linkedReqs.forEach(req => {
                    const reqNode = document.createElement('div');
                    reqNode.className = 'tree-node expanded';
                    
                    const reqHeader = document.createElement('div');
                    reqHeader.className = 'tree-node-header';
                    reqHeader.innerHTML = `
                        <i class="fa-solid fa-chevron-right tree-toggle-icon"></i>
                        <span class="node-badge requirement">${req.id}</span>
                        <span class="node-title">${req.title}</span>
                        <span class="node-subtext">${req.file}:${req.line}</span>
                    `;
                    
                    reqHeader.addEventListener('click', (e) => {
                        e.stopPropagation();
                        reqNode.classList.toggle('expanded');
                    });
                    
                    const reqChildren = document.createElement('div');
                    reqChildren.className = 'tree-node-children';
                    
                    // Render code files implementing this requirement
                    const refs = DOCS_DATA.references[req.id] || [];
                    
                    if (refs.length === 0) {
                        reqChildren.innerHTML = '<div class="code-ref-node" style="color:var(--text-muted)"><i class="fa-solid fa-triangle-exclamation"></i> Nicht im Code referenziert</div>';
                    } else {
                        refs.forEach(ref => {
                            const refLeaf = document.createElement('div');
                            refLeaf.className = 'code-ref-node';
                            
                            const isCode = ref.file.endsWith('.ts') || ref.file.endsWith('.tsx') || ref.file.endsWith('.ino') || ref.file.endsWith('.cpp');
                            const iconClass = isCode ? 'fa-solid fa-code code-file-icon' : 'fa-regular fa-file-lines';
                            
                            refLeaf.innerHTML = `
                                <i class="${iconClass}"></i>
                                <span><strong>${ref.file}</strong> (Zeile ${ref.line})</span>
                                <span class="code-snippet">${escapeHtml(ref.context)}</span>
                            `;
                            
                            refLeaf.addEventListener('click', (e) => {
                                e.stopPropagation();
                                openCodeView(ref.file, ref.line);
                            });
                            
                            reqChildren.appendChild(refLeaf);
                        });
                    }
                    
                    reqNode.appendChild(reqHeader);
                    reqNode.appendChild(reqChildren);
                    ucChildren.appendChild(reqNode);
                });
            }
            
            ucNode.appendChild(ucHeader);
            ucNode.appendChild(ucChildren);
            elements.traceTree.appendChild(ucNode);
        });
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Tree filters and control buttons
    elements.treeFilter.addEventListener('input', (e) => {
        state.treeFilter = e.target.value;
        renderTraceTree();
    });

    elements.expandAllTree.addEventListener('click', () => {
        const nodes = elements.traceTree.querySelectorAll('.tree-node');
        nodes.forEach(n => n.classList.add('expanded'));
    });

    elements.collapseAllTree.addEventListener('click', () => {
        const nodes = elements.traceTree.querySelectorAll('.tree-node');
        nodes.forEach(n => n.classList.remove('expanded'));
    });

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

    // 11. Render Network Dependency Graph (Vis.js)
    function initNetworkGraph() {
        if (state.network) {
            state.network.destroy();
            state.network = null;
        }
        
        const nodes = [];
        const edges = [];
        const uniqueEdges = new Set();
        
        // Node design parameters based on active theme
        const isDark = document.body.classList.contains('dark-mode');
        const colors = {
            UC: { background: '#0d2e27', border: '#00d4aa', font: isDark ? '#f0f4f3' : '#1e2e2b' },
            FA: { background: '#1e1b4b', border: '#818cf8', font: isDark ? '#f0f4f3' : '#1e2e2b' },
            NF: { background: '#3b0764', border: '#d8b4fe', font: isDark ? '#f0f4f3' : '#1e2e2b' },
            R:  { background: '#451a03', border: '#f97316', font: isDark ? '#f0f4f3' : '#1e2e2b' },
            File: { background: isDark ? '#141b18' : '#e6eeec', border: isDark ? '#4a5c59' : '#a3b8b5', font: isDark ? '#a3b8b5' : '#4a5c59' }
        };
        
        // 1. Add Use Case / Requirements Nodes
        Object.values(DOCS_DATA.definitions).forEach(def => {
            nodes.push({
                id: def.id,
                label: def.id,
                title: `<b>${def.id}:</b> ${def.title}`,
                shape: 'dot',
                size: def.type === 'UC' ? 24 : 16,
                color: {
                    background: colors[def.type].background,
                    border: colors[def.type].border,
                    highlight: { background: colors[def.type].border, border: colors[def.type].border }
                },
                font: { color: colors[def.type].font, face: 'Inter' }
            });
            
            // Add edges from Requirements to Use Cases
            def.links.forEach(link => {
                const edgeKey = `${def.id}->${link}`;
                if (!uniqueEdges.has(edgeKey)) {
                    uniqueEdges.add(edgeKey);
                    edges.push({
                        from: def.id,
                        to: link,
                        arrows: 'to',
                        color: { color: isDark ? 'rgba(0, 212, 170, 0.4)' : 'rgba(0, 166, 133, 0.4)' },
                        width: 1.5
                    });
                }
            });
        });
        
        // 2. Add Code File Nodes & Edges to Requirements
        const fileNodesSet = new Set();
        
        Object.keys(DOCS_DATA.references).forEach(itemId => {
            const refs = DOCS_DATA.references[itemId] || [];
            
            refs.forEach(ref => {
                const fileId = `file:${ref.file}`;
                
                // Add file node if not already added
                if (!fileNodesSet.has(fileId)) {
                    fileNodesSet.add(fileId);
                    nodes.push({
                        id: fileId,
                        label: ref.file.split('/').pop(), // just filename
                        title: `<b>Datei:</b> ${ref.file}`,
                        shape: 'box',
                        margin: 8,
                        color: {
                            background: colors.File.background,
                            border: colors.File.border,
                            highlight: { background: colors.File.border, border: colors.File.border }
                        },
                        font: { color: colors.File.font, face: 'monospace', size: 10 }
                    });
                }
                
                // Add edge: File -> Requirement / Use Case
                const edgeKey = `${fileId}->${itemId}`;
                if (!uniqueEdges.has(edgeKey)) {
                    uniqueEdges.add(edgeKey);
                    edges.push({
                        from: fileId,
                        to: itemId,
                        arrows: 'to',
                        color: { color: isDark ? 'rgba(129, 140, 248, 0.3)' : 'rgba(100, 116, 139, 0.3)' },
                        width: 1.2,
                        dashes: true
                    });
                }
            });
        });
        
        // 3. Render Graph using Vis.js Network
        const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
        const options = {
            nodes: {
                borderWidth: 2,
                shadow: true
            },
            edges: {
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'none',
                    roundness: 0.5
                }
            },
            physics: {
                enabled: state.physicsEnabled,
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.3,
                    springLength: 95,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.5
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            }
        };
        
        state.network = new vis.Network(elements.networkGraph, data, options);
        
        // Select event
        state.network.on('selectNode', (params) => {
            const nodeId = params.nodes[0];
            showGraphDetail(nodeId);
        });
        
        // Deselect event
        state.network.on('deselectNode', () => {
            showGraphDetail(null);
        });
    }

    function showGraphDetail(nodeId) {
        if (!nodeId) {
            elements.graphDetailContent.innerHTML = `
                <div class="detail-placeholder">
                    <i class="fa-solid fa-circle-info"></i>
                    <p>Wähle einen Knoten im Netzwerk-Graph aus, um detaillierte Informationen und Verbindungen anzuzeigen.</p>
                </div>
            `;
            return;
        }
        
        // Case A: Selected a file
        if (nodeId.startsWith('file:')) {
            const relPath = nodeId.substring(5);
            
            // Find what requirements this file references
            const implementedReqs = [];
            Object.keys(DOCS_DATA.references).forEach(itemId => {
                const list = DOCS_DATA.references[itemId];
                if (list.some(ref => ref.file === relPath)) {
                    implementedReqs.push(itemId);
                }
            });
            
            elements.graphDetailContent.innerHTML = `
                <div class="detail-header">
                    <span class="node-badge code detail-badge">DATEI</span>
                    <h4 class="detail-title">${relPath.split('/').pop()}</h4>
                    <span style="font-size:11px;color:var(--text-muted);font-family:monospace">${relPath}</span>
                </div>
                
                <div class="detail-section-title">Erfüllte / Referenzierte IDs</div>
                <ul class="detail-links-list">
                    ${implementedReqs.map(reqId => {
                        const def = DOCS_DATA.definitions[reqId] || { title: '' };
                        return `
                            <li class="detail-link-item" onclick="window.app.showTraceDetails('${reqId}')">
                                <span class="node-badge ${reqId.startsWith('UC') ? 'usecase' : 'requirement'}">${reqId}</span>
                                <span>${def.title.substring(0, 40)}...</span>
                            </li>
                        `;
                    }).join('') || '<li style="font-size:12px;color:var(--text-muted)">Keine Verbindungen</li>'}
                </ul>
                
                <button class="btn btn-secondary" onclick="window.app.openCodeView('${relPath}', 1)" style="width:100%">
                    <i class="fa-solid fa-eye"></i> Datei im Editor anzeigen
                </button>
            `;
        }
        // Case B: Selected a requirement or Use Case ID
        else {
            const def = DOCS_DATA.definitions[nodeId];
            if (!def) return;
            
            const badgeClass = def.type === 'UC' ? 'usecase' : (def.type === 'FA' ? 'requirement' : 'code');
            const refs = DOCS_DATA.references[nodeId] || [];
            
            // Build linked items HTML
            let linkedHtml = '';
            if (def.type === 'UC') {
                // Find requirements pointing to this use case
                const linkedReqs = Object.values(DOCS_DATA.definitions).filter(d => d.links.includes(def.id));
                linkedHtml = `
                    <div class="detail-section-title">Verknüpfte Anforderungen</div>
                    <ul class="detail-links-list">
                        ${linkedReqs.map(r => `
                            <li class="detail-link-item" onclick="window.app.showTraceDetails('${r.id}')">
                                <span class="node-badge requirement">${r.id}</span>
                                <span>${r.title.substring(0, 30)}...</span>
                            </li>
                        `).join('') || '<li style="font-size:12px;color:var(--text-muted)">Keine verknüpften Anforderungen</li>'}
                    </ul>
                `;
            } else {
                // Pointing to use cases
                linkedHtml = `
                    <div class="detail-section-title">Erfüllt Use Case</div>
                    <ul class="detail-links-list">
                        ${def.links.map(ucId => `
                            <li class="detail-link-item" onclick="window.app.showTraceDetails('${ucId}')">
                                <span class="node-badge usecase">${ucId}</span>
                                <span>${(DOCS_DATA.definitions[ucId] || {title:''}).title}</span>
                            </li>
                        `).join('') || '<li style="font-size:12px;color:var(--text-muted)">Keine Use Case Verbindung</li>'}
                    </ul>
                `;
            }
            
            elements.graphDetailContent.innerHTML = `
                <div class="detail-header">
                    <span class="node-badge ${badgeClass} detail-badge">${def.type}</span>
                    <h4 class="detail-title">${def.id}</h4>
                </div>
                
                <div class="detail-description">${def.title}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">
                    Definiert in: <span class="btn-text-link" onclick="window.app.showTraceDetails('${def.id}')">${def.file} (Z. ${def.line})</span>
                </div>
                
                ${linkedHtml}
                
                <div class="detail-section-title">Implementiert in Dateien</div>
                <ul class="detail-links-list">
                    ${refs.map(ref => `
                        <li class="detail-link-item" onclick="window.app.openCodeView('${ref.file}', ${ref.line})">
                            <i class="fa-solid fa-code" style="color:var(--primary)"></i>
                            <span><strong>${ref.file.split('/').pop()}</strong> (Z. ${ref.line})</span>
                        </li>
                    `).join('') || '<li style="font-size:12px;color:var(--text-muted)">Kein Code-Bezug gefunden</li>'}
                </ul>
            `;
        }
    }

    // Graph UI Controls
    elements.fitGraphBtn.addEventListener('click', () => {
        if (state.network) {
            state.network.fit({ animation: true });
        }
    });

    elements.togglePhysicsBtn.addEventListener('click', () => {
        state.physicsEnabled = !state.physicsEnabled;
        if (state.network) {
            state.network.setOptions({ physics: { enabled: state.physicsEnabled } });
            elements.togglePhysicsBtn.innerHTML = state.physicsEnabled ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';
            elements.togglePhysicsBtn.style.color = state.physicsEnabled ? 'var(--primary)' : 'var(--text-muted)';
        }
    });

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

    // 14. Start Application
    updateStats();
    renderFileList();
    selectFile(state.activeFile);
});
