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

    // --- ACTION METHODS ---

    static async runMigrations(req: Request, res: Response) {
        try {
            console.log("Starting migrations...");

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

            return res.json({
                success: true,
                message: "Migrations executed successfully",
                details: {
                    migration: migrationOutput
                }
            });
        } catch (error: any) {
            console.error("Execution failed:", error);
            return res.status(500).json({
                success: false,
                message: "Execution failed",
                error: error.message
            });
        }
    }

    static async runSeeders(req: Request, res: Response) {
        try {
            console.log("Starting seeders...");

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

            return res.json({
                success: true,
                message: "Seeds executed successfully",
                details: {
                    seed: seedOutput
                }
            });
        } catch (error: any) {
            console.error("Execution failed:", error);
            return res.status(500).json({
                success: false,
                message: "Execution failed",
                error: error.message
            });
        }
    }

    static async resetDatabase(req: Request, res: Response) {
        try {
            console.log("Resetting database (dropping all tables)...");

            // Disable foreign key checks
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

            // Drop all tables
            await sequelize.drop();

            // Drop SequelizeMeta table explicitly
            await sequelize.query('DROP TABLE IF EXISTS SequelizeMeta', { raw: true });

            // Enable foreign key checks
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

            return res.json({
                success: true,
                message: "Database reset successfully (all tables dropped including SequelizeMeta)",
            });
        } catch (error: any) {
            console.error("Execution failed:", error);
            return res.status(500).json({
                success: false,
                message: "Execution failed",
                error: error.message
            });
        }
    }

    static async getLogs(req: Request, res: Response) {
        const fs = require('fs');
        const logPath = path.join(__dirname, '../../../logs/system.log');

        if (!fs.existsSync(logPath)) {
            return res.send("No logs found.");
        }

        // Read last 100 lines or full file
        fs.readFile(logPath, 'utf8', (err: any, data: string) => {
            if (err) {
                return res.status(500).send("Error reading logs");
            }
            res.set('Content-Type', 'text/plain');
            res.send(data);
        });
    }
}
