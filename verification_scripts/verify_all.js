const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Configuration
const SCRIPTS_DIR = __dirname;
const GROUPS = ['auth', 'database', 'misc', 'security', 'upload'];

// Parse arguments
const args = process.argv.slice(2);
let targetGroup = null;

const groupIndex = args.indexOf('--group');
if (groupIndex !== -1 && args[groupIndex + 1]) {
    targetGroup = args[groupIndex + 1];
    if (!GROUPS.includes(targetGroup)) {
        console.error(`Invalid group: ${targetGroup}. Available groups: ${GROUPS.join(', ')}`);
        process.exit(1);
    }
}

// Helper to run a single script
function runScript(scriptPath) {
    return new Promise((resolve) => {
        const scriptName = path.relative(SCRIPTS_DIR, scriptPath);
        console.log(`\n> Running: ${scriptName}`);
        
        const child = spawn('node', [scriptPath], {
            stdio: 'inherit', // Pipe output directly to parent
            cwd: path.resolve(__dirname, '../') // Run in project root
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${scriptName} passed`);
                resolve({ name: scriptName, status: 'passed' });
            } else {
                console.error(`❌ ${scriptName} failed (Exit code: ${code})`);
                resolve({ name: scriptName, status: 'failed', code });
            }
        });

        child.on('error', (err) => {
            console.error(`❌ ${scriptName} failed to start: ${err.message}`);
            resolve({ name: scriptName, status: 'error', error: err.message });
        });
    });
}

async function main() {
    console.log('==========================================');
    console.log('   MASTER VERIFICATION SCRIPT');
    console.log('==========================================');

    let scriptsToRun = [];

    // Determine directories to scan
    const dirsToScan = targetGroup ? [targetGroup] : GROUPS;

    // Collect all scripts
    for (const group of dirsToScan) {
        const groupDir = path.join(SCRIPTS_DIR, group);
        if (fs.existsSync(groupDir)) {
            const files = fs.readdirSync(groupDir).filter(f => f.endsWith('.js'));
            files.forEach(file => {
                scriptsToRun.push(path.join(groupDir, file));
            });
        } else {
            console.warn(`Warning: Group directory '${group}' not found.`);
        }
    }

    if (scriptsToRun.length === 0) {
        console.log('No scripts found to run.');
        return;
    }

    console.log(`Found ${scriptsToRun.length} scripts in groups: ${dirsToScan.join(', ')}`);
    console.log('Starting execution...\n');

    const results = [];
    
    // Execute sequentially
    for (const script of scriptsToRun) {
        const result = await runScript(script);
        results.push(result);
    }

    // Summary
    console.log('\n==========================================');
    console.log('   VERIFICATION SUMMARY');
    console.log('==========================================');
    
    let passed = 0;
    let failed = 0;

    results.forEach(res => {
        if (res.status === 'passed') {
            passed++;
            console.log(`✅ ${res.name}`);
        } else {
            failed++;
            console.log(`❌ ${res.name} (Code/Error: ${res.code || res.error})`);
        }
    });

    console.log('------------------------------------------');
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    
    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

main();
