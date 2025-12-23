import state from '../state.js';

let currentItems = [];
let selectedItem = null;
let editorFontSize = 14;
let isMonokai = false;

export function renderFiles() {
    return `
        <!-- File Actions Toolbar (Sub-Header) -->
        <div style="padding: 0.8rem 1.5rem; border-bottom: 1px solid var(--border); background-color: rgba(26, 27, 38, 0.5); display: flex; align-items: center; justify-content: space-between;">
            <div id="breadcrumb" class="breadcrumb" style="flex: 1;">
                <span class="breadcrumb-item" onclick="window.files.loadPath('')">root</span>
            </div>
            <div style="display: flex; gap: 0.8rem;">
                <button class="btn btn-secondary" onclick="window.files.loadPath(window.files.getCurrentPath())" title="Refrescar">
                    <svg class="icon"><use href="#icon-refresh"></use></svg>
                </button>
                <button class="btn btn-primary" onclick="window.files.createFolderPrompt()">
                    <svg class="icon"><use href="#icon-folder-plus"></use></svg> Nueva Carpeta
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div style="padding: 2rem;">
            <div id="file-grid" class="file-grid">
                <!-- Items loaded via JS -->
            </div>
        </div>

        <!-- Edit Modal -->
        <div id="edit-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <svg class="icon" style="color: var(--accent);"><use href="#icon-file-code"></use></svg>
                        <span id="edit-filename" style="font-weight: bold;">filename.ts</span>
                    </div>
                    
                    <div class="editor-toolbar">
                        <button class="tool-btn" onclick="window.files.toggleTheme()" title="Cambiar Tema">
                            <svg class="icon"><use href="#icon-palette"></use></svg>
                        </button>
                        <button class="tool-btn" onclick="window.files.zoomEditor(-1)" title="Alejar">
                            <svg class="icon"><use href="#icon-zoom-out"></use></svg>
                        </button>
                        <button class="tool-btn" onclick="window.files.zoomEditor(1)" title="Acercar">
                            <svg class="icon"><use href="#icon-zoom-in"></use></svg>
                        </button>
                        <div style="width: 1px; height: 20px; background: var(--border); margin: 0 0.5rem;"></div>
                        <button class="btn btn-secondary" onclick="window.files.closeModal()">Cancelar</button>
                        <button class="btn btn-primary" onclick="window.files.saveFile()">
                            <svg class="icon"><use href="#icon-save"></use></svg> Guardar
                        </button>
                    </div>
                </div>
                
                <div class="editor-container" id="editor-container">
                    <div class="editor-gutter" id="editor-gutter">1</div>
                    <div class="editor-area" id="editor-area">
                        <pre class="editor-layer" id="editor-highlight"><code id="editor-code"></code></pre>
                        <textarea class="editor-layer" id="file-editor" spellcheck="false" oninput="window.files.updateEditor()" onscroll="window.files.syncScroll()" onkeydown="window.files.handleKey(event)"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- Context Menu -->
        <div id="context-menu">
            <div class="context-item delete" onclick="window.files.deleteSelectedItem()">
                 <svg class="icon"><use href="#icon-trash"></use></svg> Eliminar
            </div>
        </div>
    `;
}

// Logic - Ported from file-manager.js

export async function loadPath(path) {
    state.currentPath = path; // Update global state
    updateBreadcrumb();
    
    const grid = document.getElementById('file-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="color: var(--text-secondary);">Cargando...</div>';

    try {
        const res = await fetch(`/api/system/files/list?path=${encodeURIComponent(path)}`);
        const data = await res.json();

        if (data.success) {
            currentItems = data.items;
            renderGrid(data.items);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<div style="color: var(--danger);">Error de conexión</div>';
    }
}

function renderGrid(items) {
    const grid = document.getElementById('file-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; margin-top: 2rem;">Carpeta vacía</div>';
        return;
    }

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'file-item';
        // We'll attach the item to the function via a closure or pass unique ID, but we can't pass complex objects in onclick string.
        // We will store items in `currentItems` and pass index.
        const index = items.indexOf(item);
        
        el.oncontextmenu = (e) => showContextMenu(e, index);
        el.onclick = () => handleItemClick(index);

        const iconId = item.type === 'folder' ? 'icon-folder' : 'icon-file';
        const iconClass = item.type === 'folder' ? 'folder' : '';

        el.innerHTML = `
            <svg class="file-item-icon ${iconClass}"><use href="#${iconId}"></use></svg>
            <div class="file-name">${item.name}</div>
            <div class="file-meta">${formatBytes(item.size)}</div>
        `;
        grid.appendChild(el);
    });
}

function handleItemClick(index) {
    const item = currentItems[index];
    if (item.type === 'folder') {
        loadPath(item.path);
    } else {
        openEditor(item);
    }
}

function showContextMenu(e, index) {
    e.preventDefault();
    selectedItem = currentItems[index];
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
}

function updateBreadcrumb() {
    const container = document.getElementById('breadcrumb');
    if (!container) return;
    container.innerHTML = '<span class="breadcrumb-item" onclick="window.files.loadPath(\'\')">root</span>';
    
    if (!state.currentPath) return;

    const parts = state.currentPath.split('/');
    let buildPath = '';
    
    parts.forEach(part => {
        if (!part) return;
        buildPath += (buildPath ? '/' : '') + part;
        // Escape special chars in part if needed
        container.innerHTML += `
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item" onclick="window.files.loadPath('${buildPath}')">${part}</span>
        `;
    });
}

// Editor Logic
async function openEditor(item) {
    selectedItem = item;
    const modal = document.getElementById('edit-modal');
    const textarea = document.getElementById('file-editor');
    const highlight = document.getElementById('editor-code');
    const title = document.getElementById('edit-filename');
    
    title.textContent = item.name;
    textarea.value = 'Cargando...';
    highlight.innerHTML = '';
    modal.classList.add('active');

    try {
        const res = await fetch(`/api/system/files/read?path=${encodeURIComponent(item.path)}`);
        const data = await res.json();
        
        if (data.success) {
            textarea.value = data.content;
            updateEditor();
        } else {
            textarea.value = 'Error al leer archivo: ' + data.message;
            highlight.innerHTML = '';
        }
    } catch (e) {
        textarea.value = 'Error de conexión';
        highlight.innerHTML = '';
    }
}

function updateEditor() {
    updatehighlight();
    updateLineNumbers();
}

function updatehighlight() {
    const textarea = document.getElementById('file-editor');
    const codeBlock = document.getElementById('editor-code');
    const text = textarea.value;

    const masterRegex = /((['"`])(?:\\.|(?!\2)[^\\\r\n])*\2)|(\/\/.*|\/\*[\s\S]*?\*\/)|(\b(?:const|let|var|if|else|for|while|return|function|class|import|from|export|default|async|await|try|catch|new|this|extends|implements|interface|type|public|private|protected|readonly|static|void|null|true|false|undefined)\b)|(\b[A-Z][a-zA-Z0-9_$]*\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\())|(\b\d+\b)/g;

    let lastIndex = 0;
    let html = '';
    let match;

    function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    while ((match = masterRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            html += escapeHtml(text.slice(lastIndex, match.index));
        }
        let className = '';
        if (match[1]) className = 'token-string';
        else if (match[3]) className = 'token-comment';
        else if (match[4]) className = 'token-keyword';
        else if (match[5]) className = 'token-class';
        else if (match[6]) className = 'token-function';
        else if (match[7]) className = 'token-number';

        html += `<span class="${className}">${escapeHtml(match[0])}</span>`;
        lastIndex = masterRegex.lastIndex;
    }

    if (lastIndex < text.length) html += escapeHtml(text.slice(lastIndex));
    if (text.endsWith('\n')) html += ' ';

    codeBlock.innerHTML = html;
}

function updateLineNumbers() {
    const editor = document.getElementById('file-editor');
    const gutter = document.getElementById('editor-gutter');
    const box = editor.value;
    const lines = (box.match(/\n/g) || []).length + 1;
    let html = '';
    for (let i = 1; i <= lines; i++) html += i + '<br>';
    gutter.innerHTML = html;
}

function syncScroll() {
    const textarea = document.getElementById('file-editor');
    const highlightLayer = document.getElementById('editor-highlight');
    const gutter = document.getElementById('editor-gutter');
    highlightLayer.scrollTop = textarea.scrollTop;
    highlightLayer.scrollLeft = textarea.scrollLeft;
    gutter.scrollTop = textarea.scrollTop;
}

function handleKey(e) {
    if (e.key == 'Tab') {
        e.preventDefault();
        const textarea = document.getElementById('file-editor');
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        updateEditor();
    }
}

function zoomEditor(change) {
    editorFontSize += change;
    if (editorFontSize < 10) editorFontSize = 10;
    if (editorFontSize > 30) editorFontSize = 30;
    document.documentElement.style.setProperty('--editor-font-size', editorFontSize + 'px');
}

function toggleTheme() {
    isMonokai = !isMonokai;
    const container = document.getElementById('editor-container');
    if (isMonokai) container.classList.add('theme-monokai');
    else container.classList.remove('theme-monokai');
}

async function saveFile() {
    if (!selectedItem) return;
    const content = document.getElementById('file-editor').value;
    const btn = document.querySelector('#edit-modal .btn-primary');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = 'Guardando...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/system/files/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: selectedItem.path, content: content })
        });
        const data = await res.json();
        if (data.success) {
            const container = document.getElementById('editor-container');
            container.style.border = '1px solid var(--success)';
            setTimeout(() => container.style.border = 'none', 1000);
        } else {
            alert('Error al guardar: ' + data.message);
        }
    } catch (e) {
        alert('Error de conexión');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
    selectedItem = null;
}

async function deleteSelectedItem() {
    if (!selectedItem) return;
    if (!confirm(`¿Eliminar ${selectedItem.name}? Esta acción no se puede deshacer.`)) return;

    try {
        const res = await fetch(`/api/system/files/delete?path=${encodeURIComponent(selectedItem.path)}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('context-menu').style.display = 'none';
            loadPath(state.currentPath);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) {
        alert('Error de conexión');
    }
}

async function createFolderPrompt() {
    const name = prompt("Nombre de la nueva carpeta:");
    if (!name) return;

    try {
        const res = await fetch('/api/system/files/create-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: state.currentPath, name: name })
        });
        const data = await res.json();
        if (data.success) {
            loadPath(state.currentPath);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) {
        console.error(e);
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getCurrentPath() {
    return state.currentPath;
}

export function setupFilesEvents() {
    // Hide context menu on click
    document.addEventListener('click', () => {
        const menu = document.getElementById('context-menu');
        if (menu) menu.style.display = 'none';
    });
    
    window.files = {
        loadPath,
        createFolderPrompt,
        toggleTheme,
        zoomEditor,
        closeModal,
        saveFile,
        updateEditor,
        syncScroll,
        handleKey,
        deleteSelectedItem,
        getCurrentPath
    };
}
