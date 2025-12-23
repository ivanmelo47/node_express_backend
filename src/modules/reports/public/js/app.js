import { renderLayout, updateActiveNav, setupLayoutEvents } from '/public/modules/system/js/components/layout.js';
// We can reuse system layout or create a new one. For now, let's reuse to show modularity.

class ReportsApp {
    constructor() {
        this.app = document.getElementById('app');
        this.init();
    }

    init() {
        // Reuse System Layout (mix and match!)
        this.app.innerHTML = renderLayout();
        setupLayoutEvents();
        
        // Update Brand or Menu to reflect this is Reports
        const brand = document.querySelector('.logo .nav-text');
        if (brand) brand.textContent = 'SYS.REPORTS';

        // Render content
        this.renderOverview();
        
        // Mark active nav (mocking it since we don't have a real reports menu yet)
        // In a real app, layout would be more dynamic or passed as config
    }

    async renderOverview() {
        const viewContent = document.getElementById('view-content');
        viewContent.innerHTML = `
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-title">Ventas Totales</div>
                    <div class="card-desc">Reporte de ingresos mensuales</div>
                    <div class="card-icon" style="background: rgba(158, 206, 106, 0.15); color: var(--success);">$15k</div>
                </div>
                <div class="card">
                    <div class="card-title">Visitantes</div>
                    <div class="card-desc">Tráfico web acumulado</div>
                    <div class="card-icon">3.2k</div>
                </div>
            </div>
            <div class="console-output">
                <div class="log-entry log-info">> Módulo de Reportes cargado correctamente.</div>
                <div class="log-entry log-success">> Datos sincronizados.</div>
            </div>
        `;
    }
    navigate(view) {
        updateActiveNav(view);
        
        if (view === 'dashboard' || view === 'files') {
            alert('Navegando al módulo System... (Simulación)');
            // In a real app, this would redirect: window.location.href = '/api/system/dashboard';
            window.location.href = `/api/system/${view}`;
        }
    }
}

// Global Router instance attached to window so layout onclick works
window.router = new ReportsApp();
