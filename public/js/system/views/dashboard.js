import state from '../state.js';

export function renderDashboard() {
    return `
        <div style="padding: 2rem;">
            <div class="dashboard-grid">
                <!-- Migrations -->
                <div class="card">
                    <div style="display: flex; gap: 1rem; align-items: flex-start;">
                        <div class="card-icon">
                            <svg class="icon"><use href="#icon-rocket"></use></svg>
                        </div>
                        <div style="flex: 1;">
                            <div class="card-title">Migraciones</div>
                            <div class="card-desc">Ejecuta migraciones pendientes para actualizar la estructura de la base de datos.</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="window.dashboard.runAction('migrate')">
                        Ejecutar Migraciones
                    </button>
                </div>

                <!-- Seeders -->
                <div class="card">
                    <div style="display: flex; gap: 1rem; align-items: flex-start;">
                        <div class="card-icon" style="color: var(--warning); background-color: rgba(224, 175, 104, 0.1);">
                            <svg class="icon"><use href="#icon-database"></use></svg>
                        </div>
                        <div style="flex: 1;">
                            <div class="card-title">Seeders</div>
                            <div class="card-desc">Puebla la base de datos con datos de prueba o iniciales.</div>
                        </div>
                    </div>
                    <button class="btn btn-warning" style="width: 100%;" onclick="window.dashboard.runAction('seed')">
                        Ejecutar Seeders
                    </button>
                </div>

                <!-- System Logs -->
                <div class="card">
                    <div style="display: flex; gap: 1rem; align-items: flex-start;">
                        <div class="card-icon" style="color: var(--text-primary); background-color: rgba(169, 177, 214, 0.1);">
                            <svg class="icon"><use href="#icon-terminal"></use></svg>
                        </div>
                        <div style="flex: 1;">
                            <div class="card-title">Logs del Sistema</div>
                            <div class="card-desc">Visualiza o descarga el historial de actividades del sistema.</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; width: 100%;">
                        <button class="btn btn-secondary" style="flex: 1;" onclick="window.dashboard.viewLogs()">
                            Ver Logs
                        </button>
                        <button class="btn btn-success" style="flex: 1;" onclick="window.dashboard.exportLogs()">
                            Excel
                        </button>
                    </div>
                </div>

                <!-- Reset DB -->
                <div class="card">
                    <div style="display: flex; gap: 1rem; align-items: flex-start;">
                        <div class="card-icon" style="color: var(--danger); background-color: rgba(247, 118, 142, 0.1);">
                            <svg class="icon"><use href="#icon-alert"></use></svg>
                        </div>
                        <div style="flex: 1;">
                            <div class="card-title">Reset Database</div>
                            <div class="card-desc">¡PELIGRO! Borra y recrea toda la base de datos desde cero.</div>
                        </div>
                    </div>
                    <button class="btn btn-danger" style="width: 100%;" onclick="window.dashboard.confirmReset()">
                        Resetear Todo
                    </button>
                </div>

                <!-- Test Email -->
                <div class="card">
                    <div style="display: flex; gap: 1rem; align-items: flex-start;">
                        <div class="card-icon" style="color: var(--success); background-color: rgba(158, 206, 106, 0.1);">
                            <svg class="icon"><use href="#icon-envelope"></use></svg>
                        </div>
                        <div style="flex: 1;">
                            <div class="card-title">Test Email</div>
                            <div class="card-desc">Envía un correo de prueba con un archivo adjunto para verificar la configuración.</div>
                        </div>
                    </div>
                     <button class="btn btn-success" style="width: 100%;" onclick="window.dashboard.runAction('test-mail')">
                        Enviar Prueba
                    </button>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: var(--text-secondary); margin: 0;">Salida de Consola</h3>
                <button class="btn btn-secondary" onclick="window.dashboard.clearLog()" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">
                    Limpiar
                </button>
            </div>
            <div id="output" class="console-output">Esperando acciones...</div>
        </div>
    `;
}

// Logic
function log(message, type = 'info') {
    const output = document.getElementById('output');
    if (!output) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;
    if (output.innerHTML === 'Esperando acciones...') output.innerHTML = '';
    output.appendChild(entry);
    output.scrollTop = output.scrollHeight;
}

async function runAction(action) {
    const token = prompt("Introduce el SYSTEM_MASTER_TOKEN para confirmar esta acción:");
    if (!token) return;

    log(`Iniciando acción: ${action}...`, 'info');
    
    try {
        const res = await fetch(`/api/system/${action}`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token }) 
        });
        const data = await res.json();
        
        if (data.success) {
            log(data.message, 'success');
            if (data.output) log(data.output, 'info');
            if (data.details && typeof data.details === 'object') {
                 log(JSON.stringify(data.details, null, 2), 'info');
            }
        } else {
            log('Error: ' + data.message, 'error');
        }
    } catch (error) {
        log('Error de conexión: ' + error.message, 'error');
    }
}

async function viewLogs() {
    const token = prompt("Introduce el SYSTEM_MASTER_TOKEN para ver los logs:");
    if (!token) return;

    log('Obteniendo logs del sistema...', 'info');
    try {
        const res = await fetch('/api/system/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });
        const data = await res.json();
        if (data.success) {
            log('Logs obtenidos correctamente:', 'success');
            const output = document.getElementById('output');
            output.innerHTML = data.logs || 'Sin logs.';
            output.scrollTop = output.scrollHeight;
        } else {
            log('Error al obtener logs: ' + data.message, 'error');
        }
    } catch (error) {
         log('Error de conexión: ' + error.message, 'error');
    }
}

async function exportLogs() {
    const token = prompt("Introduce el SYSTEM_MASTER_TOKEN para descargar los logs:");
    if (!token) return;

     log('Generando exportación de Excel...', 'info');
     try {
        const res = await fetch('/api/system/logs/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'system_logs.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            log('Descarga iniciada.', 'success');
        } else {
            const data = await res.json();
            log('Error al exportar: ' + (data.message || res.statusText), 'error');
        }
     } catch (error) {
         log('Error de conexión: ' + error.message, 'error');
     }
}

function confirmReset() {
    if (confirm('¿ESTÁS SEGURO? Esto borrará TDOOS los datos.')) {
        runAction('reset');
    }
}

function clearLog() {
    const output = document.getElementById('output');
    if (output) output.innerHTML = 'Esperando acciones...';
}

export function setupDashboardEvents() {
    // Expose logic to window for onclick handlers
    window.dashboard = {
        runAction,
        viewLogs,
        exportLogs,
        confirmReset,
        clearLog
    };
}
