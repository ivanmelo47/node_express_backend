import { renderLayout, updateActiveNav, setupLayoutEvents } from './components/layout.js';
import state from './state.js';
import { renderDashboard, setupDashboardEvents } from './views/dashboard.js';
import { renderFiles, setupFilesEvents, loadPath } from './views/files.js';

class Router {
    constructor() {
        this.app = document.getElementById('app');
        this.init();
    }

    init() {
        // Render Layout once
        this.app.innerHTML = renderLayout();
        setupLayoutEvents();
        
        // Handle Back/Forward
        window.onpopstate = () => this.handleRoute();

        // Initial Route
        this.handleRoute();
    }

    navigate(view, path = null) {
        // Simple hash routing for now to avoid server rewrites complexity for specific sub-paths if not configured
        // But since we control the server, we can mostly trust it.
        // Let's use simple string logic for now.
        
        state.currentView = view;
        
        if (view === 'files' && path !== null) {
            state.currentPath = path;
        }

        this.renderView();
        updateActiveNav(view);
        
        // Update URL just for show (optional if we don't fully rely on history api for deep linking yet)
        history.pushState({}, '', `/api/system/${view}`);
        // For now, let's keep it simple.
    }

    handleRoute() {
        const path = window.location.pathname;
        if (path.includes('/files')) {
            this.navigate('files');
        } else {
            this.navigate('dashboard');
        }
    }

    async renderView() {
        const container = document.getElementById('view-content');
        container.innerHTML = ''; // sensitive, might lose state if not careful, but okay for switching views

        if (state.currentView === 'dashboard') {
            container.innerHTML = renderDashboard();
            setupDashboardEvents();
        } else if (state.currentView === 'files') {
            container.innerHTML = renderFiles();
            setupFilesEvents();
            // Load initial path if not set
            // The file manager logic will need to handle this
            loadPath(state.currentPath || '');
        }
    }
}

// Global Router instance for onclick access from layout
window.router = new Router();
