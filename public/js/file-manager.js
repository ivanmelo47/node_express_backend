let currentPath = '';
let currentItems = [];
let selectedItem = null;
let editorFontSize = 14;
let isMonokai = false;

document.addEventListener('DOMContentLoaded', () => {
    loadPath('');
    
    document.addEventListener('click', () => {
        const menu = document.getElementById('context-menu');
        if (menu) menu.style.display = 'none';
    });
    
});

// --- EDITOR LOGIC ---

function updateEditor() {
    updatehighlight();
    updateLineNumbers();
}

// Robust Tokenizer based highlighter (Avoids recursive replacement bug)
function updatehighlight() {
    const textarea = document.getElementById('file-editor');
    const codeBlock = document.getElementById('editor-code');
    const text = textarea.value;

    // Master regex combining all tokens
    // Improved string regex to handle escaped quotes: (['"`])(?:\\.|(?!\2)[^\\\r\n])*\2
    // Group 1: String
    // Group 2: Quote char (backreference)
    // Group 3: Comment
    // Group 4: Keyword
    // Group 5: Class
    // Group 6: Function
    // Group 7: Number
    
    const masterRegex = /((['"`])(?:\\.|(?!\2)[^\\\r\n])*\2)|(\/\/.*|\/\*[\s\S]*?\*\/)|(\b(?:const|let|var|if|else|for|while|return|function|class|import|from|export|default|async|await|try|catch|new|this|extends|implements|interface|type|public|private|protected|readonly|static|void|null|true|false|undefined)\b)|(\b[A-Z][a-zA-Z0-9_$]*\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\())|(\b\d+\b)/g;

    let lastIndex = 0;
    let html = '';
    let match;

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    while ((match = masterRegex.exec(text)) !== null) {
        // Add plain text before match
        if (match.index > lastIndex) {
            html += escapeHtml(text.slice(lastIndex, match.index));
        }

        // Determine match type
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

    // Add remaining text
    if (lastIndex < text.length) {
        html += escapeHtml(text.slice(lastIndex));
    }

    // Fix trailing newline for display
    if (text.endsWith('\n')) {
        html += ' ';
    }

    codeBlock.innerHTML = html;
}

function updateLineNumbers() {
    const editor = document.getElementById('file-editor');
    const gutter = document.getElementById('editor-gutter');
    const box = editor.value;
    const lines = (box.match(/\n/g) || []).length + 1;
    
    let html = '';
    for (let i = 1; i <= lines; i++) {
        html += i + '<br>';
    }
    gutter.innerHTML = html;
}

function syncScroll() {
    const textarea = document.getElementById('file-editor');
    const highlightLayer = document.getElementById('editor-highlight');
    const gutter = document.getElementById('editor-gutter');
    
    // Sync Top and Left
    highlightLayer.scrollTop = textarea.scrollTop;
    highlightLayer.scrollLeft = textarea.scrollLeft;
    gutter.scrollTop = textarea.scrollTop;
}

// This handles tabs
function handleKey(e) {
    if (e.key == 'Tab') {
        e.preventDefault();
        const textarea = document.getElementById('file-editor');
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) +
        "\t" + textarea.value.substring(end);
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
    if (isMonokai) {
        container.classList.add('theme-monokai');
    } else {
        container.classList.remove('theme-monokai');
    }
}

// --- FILE MANAGER LOGIC (Basic) ---

async function loadPath(path) {
    currentPath = path;
    updateBreadcrumb();
    
    const grid = document.getElementById('file-grid');
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
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; margin-top: 2rem;">Carpeta vacía</div>';
        return;
    }

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'file-item';
        el.oncontextmenu = (e) => showContextMenu(e, item);
        el.onclick = () => handleItemClick(item);

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

function handleItemClick(item) {
    if (item.type === 'folder') {
        loadPath(item.path);
    } else {
        openEditor(item);
    }
}

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
            body: JSON.stringify({
                path: selectedItem.path,
                content: content
            })
        });
        const data = await res.json();

        if (data.success) {
            const originalBorder = document.getElementById('editor-container').style.borderColor;
            document.getElementById('editor-container').style.border = '1px solid var(--success)';
            setTimeout(() => document.getElementById('editor-container').style.border = 'none', 1000);
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

async function createFolderPrompt() {
    const name = prompt("Nombre de la nueva carpeta:");
    if (!name) return;

    try {
        const res = await fetch('/api/system/files/create-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: currentPath,
                name: name
            })
        });
        const data = await res.json();
        if (data.success) {
            refreshCurrentPath();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) {
        console.error(e);
    }
}

function showContextMenu(e, item) {
    e.preventDefault();
    selectedItem = item;
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
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
            refreshCurrentPath();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (e) {
        alert('Error de conexión');
    }
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
    selectedItem = null;
}

function refreshCurrentPath() {
    loadPath(currentPath);
}

function updateBreadcrumb() {
    const container = document.getElementById('breadcrumb');
    container.innerHTML = '<span class="breadcrumb-item" onclick="loadPath(\'\')">root</span>';
    
    if (!currentPath) return;

    const parts = currentPath.split('/');
    let buildPath = '';
    
    parts.forEach(part => {
        if (!part) return;
        buildPath += (buildPath ? '/' : '') + part;
        container.innerHTML += `
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item" onclick="loadPath('${buildPath}')">${part}</span>
        `;
    });
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
