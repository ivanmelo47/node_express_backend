import { Request, Response } from 'express';
import { exec } from 'child_process';
import sequelize from '../../../config/database';
import path from 'path';

const AUTH_COOKIE_NAME = 'system_auth_token';

export class SystemController {

    // --- VIEW METHODS ---

    static async viewDashboard(req: Request, res: Response) {
        res.sendFile(path.join(__dirname, '../views/dashboard.html'));
    }

    // --- HELPER METHODS ---

    private static logToSystem(action: string, status: string, details: string = '') {
        try {
            const fs = require('fs');
            // Go up 4 levels to get out of dist/modules/system/controllers to root
            const logPath = path.join(__dirname, '../../../../logs/system.log');

            // Ensure directory exists
            const logDir = path.dirname(logPath);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] ACTION: ${action} | STATUS: ${status} | DETAILS: ${details}\n`;
            fs.appendFileSync(logPath, logEntry);
        } catch (e) {
            console.error("Failed to write to log file:", e);
        }
    }

    // --- ACTION METHODS ---

    static async runMigrations(req: Request, res: Response) {
        try {
            const { token } = req.body;
            const masterToken = process.env.SYSTEM_MASTER_TOKEN;

            if (!masterToken) {
                return res.status(500).json({ success: false, message: 'Server configuration error: Missing master token' });
            }

            if (token !== masterToken) {
                SystemController.logToSystem('MIGRATE', 'FAILED', 'Invalid Master Token');
                return res.status(403).json({ success: false, message: 'Invalid Master Token' });
            }

            console.log("Starting migrations...");
            SystemController.logToSystem('MIGRATE', 'STARTED', 'Executing migrations...');

            const migrationOutput = await new Promise<string>((resolve, reject) => {
                exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Migration error: ${error.message}`);
                        return reject(error);
                    }
                    console.log(`Migration stdout: ${stdout}`);
                    resolve(stdout);
                });
            });

            SystemController.logToSystem('MIGRATE', 'SUCCESS', 'Migrations executed successfully');

            return res.json({
                success: true,
                message: "Migrations executed successfully",
                details: {
                    migration: migrationOutput
                }
            });
        } catch (error: any) {
            console.error("Execution failed:", error);
            SystemController.logToSystem('MIGRATE', 'ERROR', error.message);
            return res.status(500).json({
                success: false,
                message: "Execution failed",
                error: error.message
            });
        }
    }

    static async runSeeders(req: Request, res: Response) {
        try {
            const { token } = req.body;
            const masterToken = process.env.SYSTEM_MASTER_TOKEN;

            if (!masterToken) {
                return res.status(500).json({ success: false, message: 'Server configuration error: Missing master token' });
            }

            if (token !== masterToken) {
                SystemController.logToSystem('SEED', 'FAILED', 'Invalid Master Token');
                return res.status(403).json({ success: false, message: 'Invalid Master Token' });
            }

            console.log("Starting seeders...");
            SystemController.logToSystem('SEED', 'STARTED', 'Executing seeders...');

            const seedOutput = await new Promise<string>((resolve, reject) => {
                exec('npx sequelize-cli db:seed:all', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Seed error: ${error.message}`);
                        return reject(error);
                    }
                    console.log(`Seed stdout: ${stdout}`);
                    resolve(stdout);
                });
            });

            SystemController.logToSystem('SEED', 'SUCCESS', 'Seeders executed successfully');

            return res.json({
                success: true,
                message: "Seeds executed successfully",
                details: {
                    seed: seedOutput
                }
            });
        } catch (error: any) {
            console.error("Execution failed:", error);
            SystemController.logToSystem('SEED', 'ERROR', error.message);
            return res.status(500).json({
                success: false,
                message: "Execution failed",
                error: error.message
            });
        }
    }

    static async resetDatabase(req: Request, res: Response) {
        try {
            const { token } = req.body;
            const masterToken = process.env.SYSTEM_MASTER_TOKEN;

            if (!masterToken) {
                return res.status(500).json({ success: false, message: 'Server configuration error: Missing master token' });
            }

            if (token !== masterToken) {
                SystemController.logToSystem('RESET', 'FAILED', 'Invalid Master Token');
                return res.status(403).json({ success: false, message: 'Invalid Master Token' });
            }

            console.log("Resetting database (dropping all tables)...");
            SystemController.logToSystem('RESET', 'STARTED', 'Dropping all tables...');

            // Disable foreign key checks
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

            // Drop all tables
            await sequelize.drop();

            // Drop SequelizeMeta table explicitly
            await sequelize.query('DROP TABLE IF EXISTS SequelizeMeta', { raw: true });

            // Enable foreign key checks
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

            SystemController.logToSystem('RESET', 'SUCCESS', 'Database reset successfully');

            return res.json({
                success: true,
                message: "Database reset successfully (all tables dropped including SequelizeMeta)",
            });
        } catch (error: any) {
            console.error("Execution failed:", error);
            SystemController.logToSystem('RESET', 'ERROR', error.message);
            return res.status(500).json({
                success: false,
                message: "Execution failed",
                error: error.message
            });
        }
    }

    static async getLogs(req: Request, res: Response) {
        const { token } = req.body;
        const masterToken = process.env.SYSTEM_MASTER_TOKEN;

        if (!masterToken) {
            return res.status(500).json({ success: false, message: 'Server configuration error: Missing master token' });
        }

        if (token !== masterToken) {
            return res.status(403).json({ success: false, message: 'Invalid Master Token' });
        }

        const fs = require('fs');
        const logPath = path.join(__dirname, '../../../../logs/system.log');

        if (!fs.existsSync(logPath)) {
            return res.json({ success: true, message: "No logs found.", logs: "" });
        }

        // Read last 100 lines or full file
        fs.readFile(logPath, 'utf8', (err: any, data: string) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error reading logs", error: err.message });
            }
            return res.json({ success: true, message: "Logs retrieved successfully", logs: data });
        });
    }

    static async exportLogsToExcel(req: Request, res: Response) {
        try {
            const { token } = req.body;
            const masterToken = process.env.SYSTEM_MASTER_TOKEN;

            if (!masterToken) {
                return res.status(500).json({ success: false, message: 'Server configuration error: Missing master token' });
            }

            if (token !== masterToken) {
                return res.status(403).json({ success: false, message: 'Invalid Master Token' });
            }

            const fs = require('fs');
            const logPath = path.join(__dirname, '../../../../logs/system.log');

            if (!fs.existsSync(logPath)) {
                return res.status(404).json({ success: false, message: "No logs found to export." });
            }

            const logContent = fs.readFileSync(logPath, 'utf8');
            const lines = logContent.split('\n').filter((line: string) => line.trim() !== '');

            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('System Logs');

            worksheet.columns = [
                { header: 'Timestamp', key: 'timestamp', width: 30 },
                { header: 'Action', key: 'action', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Details', key: 'details', width: 50 }
            ];

            // Regex to parse log line: [TIMESTAMP] ACTION: ... | STATUS: ... | DETAILS: ...
            const logRegex = /^\[(.*?)\] ACTION: (.*?) \| STATUS: (.*?) \| DETAILS: (.*)$/;

            lines.forEach((line: string) => {
                const match = line.match(logRegex);
                if (match) {
                    worksheet.addRow({
                        timestamp: match[1],
                        action: match[2],
                        status: match[3],
                        details: match[4]
                    });
                } else {
                    // Fallback for unformatted lines
                    worksheet.addRow({
                        timestamp: 'UNKNOWN',
                        action: 'UNKNOWN',
                        status: 'UNKNOWN',
                        details: line
                    });
                }
            });

            // Style header row
            worksheet.getRow(1).font = { bold: true };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=system_logs.xlsx');

            await workbook.xlsx.write(res);
            res.end();

        } catch (error: any) {
            console.error("Export failed:", error);
            return res.status(500).json({
                success: false,
                message: "Export failed",
                error: error.message
            });
        }
    }

    static async testMail(req: Request, res: Response) {
        try {
            // Lazy load dependencies to avoid circular deps or unnecessary imports
            // adjusting path to point to 'src/common/mails' from 'src/modules/system/controllers'
            // ../../../common/mails
            const ConfirmationMail = require('../../../common/mails/ConfirmationMail').default;
            const Transporter = require('../../../common/mails/Transporter').default;
            const ExcelJS = require('exceljs');

            const mockUser = {
                email: 'test@example.com',
                name: 'Test Administrator'
            };
            const mockToken = 'test-token-123';

            // Generate sample Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Test Sheet');
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Message', key: 'message', width: 30 }
            ];
            worksheet.addRow({ id: 1, message: 'Hello from System Controller!' });
            worksheet.addRow({ id: 2, message: 'This is a test attachment.' });

            // buffer
            const buffer = await workbook.xlsx.writeBuffer();

            const mail = new ConfirmationMail(mockUser, mockToken);

            // Transporter is already instantiated as default export
            await Transporter.send({
                to: mail.to,
                subject: mail.subject + ' (With Attachment)',
                html: mail.html,
                attachments: [{
                    filename: 'test-report.xlsx',
                    content: buffer,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }]
            });

            return res.json({
                success: true,
                message: "Test email sent successfully to test@example.com. Check Mailhog."
            });

        } catch (error: any) {
            console.error("Test mail failed:", error);
            return res.status(500).json({
                success: false,
                message: "Test mail failed",
                error: error.message
            });
        }
    }
}
