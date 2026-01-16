export function renderLayout() {
    return `
    <div class="sidebar" id="sidebar">
        <div class="logo">
            <div style="display: flex; align-items: center;">
                <svg class="icon" style="color: var(--accent); margin-right: 8px;"><use href="#icon-terminal"></use></svg> 
                <span class="nav-text">SYS.MANAGER</span>
            </div>
            <button class="btn-icon-only" onclick="window.toggleSidebar()" style="margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer;">
                <svg class="icon"><use href="#icon-menu"></use></svg>
            </button>
        </div>
        <div class="nav-item" id="nav-dashboard" onclick="window.router.navigate('dashboard')">
            <svg class="icon"><use href="#icon-dashboard"></use></svg> 
            <span class="nav-text">Dashboard</span>
        </div>
        <div class="nav-item" id="nav-files" onclick="window.router.navigate('files')">
            <svg class="icon"><use href="#icon-folder-open"></use></svg> 
            <span class="nav-text">Archivos</span>
        </div>
        <div style="flex: 1;"></div>
    </div>

    <div class="main">
        <!-- Global Header -->
        <div class="toolbar">
            <div style="font-weight: bold; font-size: 1.1rem;">System Manager</div>
            <button class="btn btn-logout" onclick="window.location.href = window.location.protocol + '//logout:logout@' + window.location.host + '/api/v1/system'">
                <svg class="icon"><use href="#icon-logout"></use></svg> <span class="nav-text">Cerrar Sesión</span>
            </button>
        </div>

        <!-- View Content -->
        <div id="view-content" style="height: 100%; display: flex; flex-direction: column;"></div>
    </div>
    `;
}

export function updateActiveNav(view) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const active = document.getElementById(`nav-${view}`);
    if (active) active.classList.add('active');
}

export function setupLayoutEvents() {
    window.toggleSidebar = function () {
        const sidebar = document.getElementById('sidebar');

        if (window.innerWidth <= 768) {
            // Mobile: Toggle open/close menu
            sidebar.classList.toggle('mobile-open');
        } else {
            // Desktop: Toggle collapse/expand sidebar
            sidebar.classList.toggle('collapsed');

            // Adjust hamburger button margin on desktop collapse
            const btn = sidebar.querySelector('.logo button');
            if (sidebar.classList.contains('collapsed')) {
                btn.style.marginLeft = '0';
            } else {
                btn.style.marginLeft = 'auto';
            }
        }
    };

    // Auto-close menu on selection (Mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.remove('mobile-open');
            }
        });
    });
}
