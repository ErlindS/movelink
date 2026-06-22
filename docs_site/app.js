
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
                'graph-tab': 'Netzwerk-Graph',
                'c4-tab': 'C4-Modell Explorer',
                'flow-tab': 'Daten- & Kontrollfluss'
            };
            elements.activeTabTitle.textContent = labelMap[target];

            // Render target tab contents if needed
            if (target === 'trace-tree-tab') {
                renderTraceTree();
            } else if (target === 'matrix-tab') {
                renderTraceMatrix();
            } else if (target === 'graph-tab') {
                initNetworkGraph();
            } else if (target === 'c4-tab') {
                renderC4Explorer();
            } else if (target === 'flow-tab') {
                if (typeof mermaid !== 'undefined') {
                    mermaid.init(undefined, document.querySelectorAll('#flow-tab .mermaid'));
                }
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
        if (state.activeTab === 'c4-tab') {
            drawC4Connections();
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
    // Helper to resolve a physical file to its logical C4 Component or Container
    function getC4ElementForFile(filePath, reqId) {
        // 1. Check direct component file matches from C4 data
        for (const containerId in C4_DATA.components) {
            const containerComponents = C4_DATA.components[containerId].elements;
            for (const comp of containerComponents) {
                if (filePath === comp.file) {
                    return { name: comp.title, type: 'component', id: comp.id, container: containerId };
                }
            }
        }

        // 2. Fallbacks / mappings for source code files to logical components
        const lowerPath = filePath.toLowerCase();

        if (lowerPath.includes('sensorcard.tsx')) {
            return { name: 'SensorCard UI', type: 'component', id: 'sensor_card', container: 'app' };
        }
        if (lowerPath.includes('livechart.tsx')) {
            return { name: 'LiveChart UI', type: 'component', id: 'live_chart', container: 'app' };
        }
        if (lowerPath.includes('sessioncard.tsx')) {
            return { name: 'SessionCard UI', type: 'component', id: 'session_card', container: 'app' };
        }
        if (lowerPath.includes('profilecard') || lowerPath.includes('profile')) {
            return { name: 'ProfileCard UI', type: 'component', id: 'profile_card', container: 'app' };
        }
        if (lowerPath.includes('useble.ts')) {
            return { name: 'useBLE Hook', type: 'component', id: 'use_ble', container: 'app' };
        }
        if (lowerPath.includes('usewebsocket.ts') || lowerPath.includes('websocket')) {
            return { name: 'useWebSocket Hook', type: 'component', id: 'use_ws', container: 'app' };
        }

        if (lowerPath.includes('imureader')) {
            return { name: 'Sensordatenerfassung (Loop)', type: 'component', id: 'imu_reader', container: 'firmware' };
        }
        if (lowerPath.includes('inferenceengine')) {
            return { name: 'Inferenz-Engine (Edge Impulse)', type: 'component', id: 'inference_engine', container: 'firmware' };
        }
        if (lowerPath.includes('visualfeedback')) {
            return { name: 'LED- & Display-Controller', type: 'component', id: 'led_display_controller', container: 'firmware' };
        }
        if (lowerPath.includes('executable.ino') && (reqId === 'FA5' || reqId === 'FA4')) {
            return { name: 'Inferenz-Engine (Edge Impulse)', type: 'component', id: 'inference_engine', container: 'firmware' };
        }
        if (lowerPath.includes('executable.ino') && reqId === 'FA9') {
            return { name: 'LED- & Display-Controller', type: 'component', id: 'led_display_controller', container: 'firmware' };
        }
        if (lowerPath.includes('executable.ino')) {
            return { name: 'Sensordatenerfassung (Loop)', type: 'component', id: 'imu_reader', container: 'firmware' };
        }
        if (lowerPath.includes('gehause.py') || lowerPath.includes('gehäuse')) {
            return { name: 'Gehäuse', type: 'component', id: 'gehause', container: 'firmware' };
        }
        if (lowerPath.includes('imu') || lowerPath.includes('sensor')) {
            return { name: 'Sensordatenerfassung (Loop)', type: 'component', id: 'imu_reader', container: 'firmware' };
        }
        if (lowerPath.includes('ble')) {
            return { name: 'BLE Service', type: 'component', id: 'ble_service', container: 'firmware' };
        }

        // 3. Container-level mappings based on directory
        if (lowerPath.startsWith('app/') || lowerPath.includes('/app/')) {
            return { name: 'Mobile App Container', type: 'container', id: 'app' };
        }
        if (lowerPath.startsWith('embedded/') || lowerPath.includes('/embedded/')) {
            return { name: 'Sensor Firmware Container', type: 'container', id: 'firmware' };
        }
        if (lowerPath.startsWith('doc/') || lowerPath.includes('backend') || lowerPath.includes('pflichtenheft')) {
            return { name: 'Backend Container', type: 'container', id: 'backend' };
        }

        // Fallback
        return { name: 'MoveLink System', type: 'system-context', id: 'system' };
    }

    // 9. Render E2E Traceability Tree (Horizontal Flow Chart)
    function renderTraceTree() {
        elements.traceTree.innerHTML = '';

        // Hide tree-controls since everything is displayed in a clean table grid
        const controls = document.querySelector('.tree-controls');
        if (controls) controls.style.display = 'none';

        const filter = state.treeFilter.toLowerCase();

        // Find all Use Cases (UC-X)
        const useCases = Object.values(DOCS_DATA.definitions)
            .filter(d => d.type === 'UC')
            .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

        if (useCases.length === 0) {
            elements.traceTree.innerHTML = '<div class="detail-placeholder"><i class="fa-solid fa-triangle-exclamation"></i> Kein Trace-Baum Daten vorhanden. Scrape erneut.</div>';
            return;
        }

        // Build flat table rows with pre-calculated rowspans
        const tableRows = [];

        useCases.forEach(uc => {
            // Find linked requirements
            const linkedReqs = Object.values(DOCS_DATA.definitions)
                .filter(d => d.type !== 'UC' && d.links.includes(uc.id))
                .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

            let matchesFilter = !filter ||
                uc.id.toLowerCase().includes(filter) ||
                uc.title.toLowerCase().includes(filter);

            if (!matchesFilter) {
                // Check if any of its requirements or code files match the filter
                const reqMatches = linkedReqs.some(req =>
                    req.id.toLowerCase().includes(filter) ||
                    req.title.toLowerCase().includes(filter) ||
                    (DOCS_DATA.references[req.id] && DOCS_DATA.references[req.id].some(ref => ref.file.toLowerCase().includes(filter)))
                );

                if (reqMatches) matchesFilter = true;
            }

            if (!matchesFilter) return; // Skip if filter is set and doesn't match

            const ucRows = [];
            if (linkedReqs.length === 0) {
                ucRows.push({
                    uc: uc,
                    req: null,
                    ref: null,
                    ucSpan: 0,
                    reqSpan: 0
                });
            } else {
                linkedReqs.forEach(req => {
                    const refs = DOCS_DATA.references[req.id] || [];
                    if (refs.length === 0) {
                        ucRows.push({
                            uc: uc,
                            req: req,
                            ref: null,
                            ucSpan: 0,
                            reqSpan: 0
                        });
                    } else {
                        refs.forEach(ref => {
                            ucRows.push({
                                uc: uc,
                                req: req,
                                ref: ref,
                                ucSpan: 0,
                                reqSpan: 0
                            });
                        });
                    }
                });
            }

            // Set ucSpan on first row
            if (ucRows.length > 0) {
                ucRows[0].ucSpan = ucRows.length;
            }

            // Calculate reqSpan
            let currentReqId = null;
            let currentReqStartIndex = 0;
            ucRows.forEach((row, index) => {
                if (row.req) {
                    if (row.req.id !== currentReqId) {
                        if (currentReqId !== null) {
                            ucRows[currentReqStartIndex].reqSpan = index - currentReqStartIndex;
                        }
                        currentReqId = row.req.id;
                        currentReqStartIndex = index;
                    }
                } else {
                    if (currentReqId !== null) {
                        ucRows[currentReqStartIndex].reqSpan = index - currentReqStartIndex;
                    }
                    currentReqId = null;
                }
            });
            if (currentReqId !== null) {
                ucRows[currentReqStartIndex].reqSpan = ucRows.length - currentReqStartIndex;
            }

            tableRows.push(...ucRows);
        });

        // Create Confluence style Table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'trace-table-container';

        const table = document.createElement('table');
        table.className = 'trace-confluence-table';

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Anwendungsfall (Use Case)</th>
                    <th>Systemanforderung</th>
                    <th class="text-center">@Priorität</th>
                    <th class="text-center">Status</th>
                    <th>C4 Komponente</th>
                    <th>Quellcode-Referenz</th>
                </tr>
            </thead>
            <tbody id="traceTableBody"></tbody>
        `;

        const tbody = table.querySelector('tbody');

        tableRows.forEach(row => {
            const tr = document.createElement('tr');
            let rowHtml = '';

            // 1. UC Column
            if (row.ucSpan > 0) {
                rowHtml += `
                    <td rowspan="${row.ucSpan}" class="matrix-cell uc-cell">
                        <div class="trace-badge-container">
                            <span class="node-badge usecase">${row.uc.id}</span>
                            <span class="trace-title">${row.uc.title}</span>
                        </div>
                    </td>
                `;
            }

            // 2. Req Column, Priority, Status
            if (row.req) {
                if (row.reqSpan > 0) {
                    const reqBadgeClass = row.req.type === 'FA' ? 'requirement' : (row.req.type === 'NF' ? 'code' : 'usecase');

                    // Priority mappings
                    let priorityLabel = 'LOW';
                    let priorityClass = 'priority-low';
                    if (row.req.type === 'FA') {
                        priorityLabel = 'CRITICAL';
                        priorityClass = 'priority-critical';
                    } else if (row.req.type === 'NF') {
                        priorityLabel = 'MEDIUM';
                        priorityClass = 'priority-medium';
                    }

                    // Status mappings (CLOSED if implements are found, otherwise OPEN)
                    const refs = DOCS_DATA.references[row.req.id] || [];
                    const isImplemented = refs.length > 0;
                    const statusLabel = isImplemented ? 'CLOSED' : 'OPEN';
                    const statusClass = isImplemented ? 'status-closed' : 'status-open';

                    rowHtml += `
                        <td rowspan="${row.reqSpan}" class="matrix-cell req-cell">
                            <div class="trace-badge-container">
                                <span class="node-badge ${reqBadgeClass}">${row.req.id}</span>
                                <span class="trace-title">${row.req.title}</span>
                            </div>
                        </td>
                        <td rowspan="${row.reqSpan}" class="text-center">
                            <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
                        </td>
                        <td rowspan="${row.reqSpan}" class="text-center">
                            <span class="status-badge ${statusClass}">${statusLabel}</span>
                        </td>
                    `;
                }
            } else {
                rowHtml += `
                    <td class="text-muted italic">Keine Anforderungen verknüpft</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                `;
            }

            // 3. C4 Component & Reference Link
            if (row.ref) {
                const isCode = row.ref.file.endsWith('.ts') || row.ref.file.endsWith('.tsx') || row.ref.file.endsWith('.ino') || row.ref.file.endsWith('.cpp');
                const iconClass = isCode ? 'fa-solid fa-code' : 'fa-regular fa-file-lines';
                const c4El = getC4ElementForFile(row.ref.file, row.req ? row.req.id : '');
                const borderLeftColor = c4El.type === 'container' ? 'var(--primary)' : (c4El.type === 'component' ? '#8b5cf6' : '#627c78');
                const filename = row.ref.file.split('/').pop();

                rowHtml += `
                    <td>
                        <div class="component-ref-cell">
                            <span class="c4-color-dot" style="background-color: ${borderLeftColor}"></span>
                            <strong>${c4El.name}</strong>
                        </div>
                    </td>
                    <td>
                        <div class="jira-like-link" onclick="window.app.openCodeView('${row.ref.file}', ${row.ref.line})" title="Klicke, um Code anzuzeigen">
                            <i class="${iconClass}"></i>
                            <span>${filename} (Z. ${row.ref.line})</span>
                        </div>
                    </td>
                `;
            } else {
                rowHtml += `
                    <td class="text-muted italic">-</td>
                    <td class="text-muted italic"><i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-z)"></i> Nicht referenziert</td>
                `;
            }

            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });

        tableContainer.appendChild(table);
        elements.traceTree.appendChild(tableContainer);
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
            R: { background: '#451a03', border: '#f97316', font: isDark ? '#f0f4f3' : '#1e2e2b' },
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
                                <span>${(DOCS_DATA.definitions[ucId] || { title: '' }).title}</span>
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
                { id: 'backend', type: 'container', title: 'Backend Container', description: 'Node.js/Express API und PostgreSQL Datenbank. Verwaltet Nutzer und speichert Trainingsverlauf.', tech: 'Node.js, Express, PostgreSQL', deployable: true, file: 'doc/Pflichtenheft/pflichtenheft.tex' }
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
                    { id: 'sensor_card', type: 'component', title: 'SensorCard UI', description: 'Steuert den Verbindungszustand und das Bluetooth-Geräte-Pairing.', tech: 'React Native Component', file: 'app/components/architecture.md' },
                    { id: 'live_chart', type: 'component', title: 'LiveChart UI', description: 'Echtzeit-Zeichnung des Beschleunigungs- und Gyroskop-Verlaufs.', tech: 'SVG Canvas Component', file: 'app/components/architecture.md' },
                    { id: 'session_card', type: 'component', title: 'SessionCard UI', description: 'Zeigt eine Zusammenfassung einer vergangenen Trainingseinheit.', tech: 'React Native Component', file: 'app/components/SessionCard.tsx' },
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
                    { id: 'imu_reader', type: 'component', title: 'Sensordatenerfassung (Loop)', description: 'Periodische Erfassung der Rohbeschleunigungs- und Gyroskopwerte mit 50Hz.', tech: 'C++ Module', file: 'embedded/components/sensordatenerfassung/architecture.md' },
                    { id: 'inference_engine', type: 'component', title: 'Inferenz-Engine (Edge Impulse)', description: 'Lokale Ausführung des trainierten neuronalen Netzes (CNN) zur Curl-Klassifizierung.', tech: 'Inferenzbibliothek', file: 'embedded/components/inferenz_engine/architecture.md' },
                    { id: 'led_display_controller', type: 'component', title: 'LED- & Display-Controller', description: 'Gibt dem Trainierenden direktes visuelles Feedback zur Qualität der Übungsausführung.', tech: 'C++ Module', file: 'embedded/components/led_display_controller/architecture.md' },
                    { id: 'ble_streamer', type: 'component', title: 'BLE-Streamer', description: 'Überträgt die erfassten 6-Achsen-Messwerte über Bluetooth Low Energy (BLE) an die Mobile App.', tech: 'C++ Module', file: 'embedded/components/ble_streamer/architecture.md' },
                    { id: 'gehause', type: 'component', title: 'Gehäuse', description: 'Physisches, schützendes 3D-Druck-Gehäuse des Sensors.', tech: '3D CAD Model (Blender Python)', file: 'embedded/components/gehause/architecture.md' },
                    { id: 'app_ghost', type: 'external', title: 'Mobile App Container', description: 'Visualisiert Echtzeitdaten, steuert Geräte-Pairing und verwaltet Trainings.', tech: 'C4 Container (React Native)' }
                ],
                connections: [
                    { from: 'imu_reader', to: 'inference_engine', text: 'Liefert Sensor-Rohdaten' },
                    { from: 'inference_engine', to: 'led_display_controller', text: 'Steuert Status-LED/Display' },
                    { from: 'imu_reader', to: 'ble_streamer', text: 'Überträgt Rohdaten' },
                    { from: 'ble_streamer', to: 'app_ghost', text: 'BLE Data Stream' }
                ]
            }
        },
        classes: {
            imu_reader: {
                title: "Sensordatenerfassung Klassen & Funktionen",
                elements: [
                    { id: 'init_imu', type: 'class', title: 'initIMU()', description: 'Initialisiert die LSM6DS3 IMU-Hardware über den I2C-Bus.', tech: 'C++ Function', file: 'embedded/components/sensordatenerfassung/IMUReader.cpp', line: 12 },
                    { id: 'read_sensor_data', type: 'class', title: 'readSensorData()', description: 'Liest Beschleunigungs- und Drehratenwerte mit 50Hz, clampt auf 2G und skaliert in m/s².', tech: 'C++ Function', file: 'embedded/components/sensordatenerfassung/IMUReader.cpp', line: 17 }
                ],
                connections: []
            },
            inference_engine: {
                title: "Inferenz-Engine Klassen & Funktionen",
                elements: [
                    { id: 'run_model_inference', type: 'class', title: 'runModelInference()', description: 'Erstellt das Signal aus dem DSP-Puffer und führt den CNN-Klassifikator aus.', tech: 'C++ Function', file: 'embedded/components/inferenz_engine/InferenceEngine.cpp', line: 7 }
                ],
                connections: []
            },
            led_display_controller: {
                title: "LED- & Display-Controller Klassen & Funktionen",
                elements: [
                    { id: 'init_feedback', type: 'class', title: 'initFeedback()', description: 'Initialisiert OLED-Display (U8x8) und konfiguriert RGB LED Pins (11, 12, 13) als Ausgang.', tech: 'C++ Function', file: 'embedded/components/led_display_controller/VisualFeedback.cpp', line: 12 },
                    { id: 'update_feedback', type: 'class', title: 'updateFeedback()', description: 'Steuert Low-Active RGB-LEDs (Blau=Idle, Grün=Perfekt, Rot=Fehler) und zeigt Statusmeldungen an.', tech: 'C++ Function', file: 'embedded/components/led_display_controller/VisualFeedback.cpp', line: 25 },
                    { id: 'send_json_to_pc', type: 'class', title: 'sendJsonToPC()', description: 'Formatiert Inferenzwerte, Konfidenz und Tipps als JSON-String und sendet diese via Serial.', tech: 'C++ Function', file: 'embedded/components/led_display_controller/VisualFeedback.cpp', line: 68 }
                ],
                connections: [
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
            sensor_card: {
                title: "SensorCard UI Komponenten",
                elements: [
                    { id: 'sensor_card_comp', type: 'class', title: 'SensorCard()', description: 'Funktionale React-Komponente, die das BLE-Koppel-UI und Verbindungsstatus anzeigt.', tech: 'JSX React Component', file: 'app/components/SensorCard.tsx', line: 5 }
                ],
                connections: []
            },
            live_chart: {
                title: "LiveChart UI Komponenten",
                elements: [
                    { id: 'live_chart_comp', type: 'class', title: 'LiveChart()', description: 'Zeichnet eintreffende IMU-Beschleunigungs- und Drehratendaten in Echtzeit auf einem SVG-Canvas.', tech: 'JSX React Component', file: 'app/components/LiveChart.tsx', line: 5 }
                ],
                connections: []
            },
            session_card: {
                title: "SessionCard UI Komponenten",
                elements: [
                    { id: 'session_card_comp', type: 'class', title: 'SessionCard()', description: 'Zeigt Metadaten und Diagramme vergangener Trainingseinheiten an.', tech: 'JSX React Component', file: 'app/components/SessionCard.tsx', line: 5 }
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
                    { id: 'init_ble', type: 'class', title: 'initBLE()', description: 'Initialisiert den BLE-Stack des nRF52840, konfiguriert den GATT-Service und startet Advertising.', tech: 'C++ Function', file: 'embedded/components/ble_streamer/BLEStreamer.cpp', line: 8 },
                    { id: 'stream_imu_data', type: 'class', title: 'streamIMUData()', description: 'Formatiert 6-Achsen-Daten in einen 24-Byte-Puffer und updatet die BLE GATT Characteristic.', tech: 'C++ Function', file: 'embedded/components/ble_streamer/BLEStreamer.cpp', line: 27 }
                ],
                connections: []
            }
        }
    };

    state.c4Level = 'context';
    state.c4ActiveContainer = null;

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
            if (state.c4ActiveContainer === 'app') {
                board.classList.add('c4-grid-app');
            } else if (state.c4ActiveContainer === 'firmware') {
                board.classList.add('c4-grid-firmware');
            } else {
                board.classList.add('c4-grid-components');
            }
            const elementsList = C4_DATA.components[state.c4ActiveContainer].elements;

            elementsList.forEach(el => {
                const card = createC4Card(el);

                // Clicking component drills down to code/class level
                card.title = "Klicke zum Betrachten der Code-Ebene (Klassen & Funktionen)";
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    zoomToLevel('code', state.c4ActiveContainer, el.id);
                });

                board.appendChild(card);
            });
        }
        else if (state.c4Level === 'code') {
            board.classList.add('c4-grid-components');
            const componentData = C4_DATA.classes[state.c4ActiveComponent];

            if (componentData && componentData.elements) {
                componentData.elements.forEach(el => {
                    const card = createC4Card(el);
                    board.appendChild(card);
                });
            } else {
                board.innerHTML = `
                    <div class="detail-placeholder" style="grid-column: span 3; text-align: center;">
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
        } else if (state.c4Level === 'components' && state.c4ActiveContainer) {
            connections = C4_DATA.components[state.c4ActiveContainer].connections || [];
        } else if (state.c4Level === 'code' && state.c4ActiveComponent) {
            connections = (C4_DATA.classes[state.c4ActiveComponent] && C4_DATA.classes[state.c4ActiveComponent].connections) || [];
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

            if (state.c4Level === 'components' && state.c4ActiveContainer === 'firmware' && conn.from === 'imu_reader' && conn.to === 'ble_streamer') {
                const startX = boxA.x + boxA.w / 2;
                const startY = boxA.y + boxA.h + 8; // 8px gap from start card bottom
                const endX = boxB.x + boxB.w / 2;
                const endY = boxB.y + boxB.h + 12; // 12px gap from end card bottom

                pathData = `M ${startX} ${startY} L ${startX} ${startY + 25} L ${endX} ${startY + 25} L ${endX} ${endY}`;
                isSegmented = true;
            }

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
                    const startY = boxA.y + boxA.h;
                    const endX = boxB.x + boxB.w / 2;

                    midX = (startX + endX) / 2;
                    midY = startY + 30;
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

    // Recalculate on window resize
    window.addEventListener('resize', () => {
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

    // 14. Start Application
    updateStats();
    renderFileList();
    selectFile(state.activeFile);
});
