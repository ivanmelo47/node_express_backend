import { Request, Response } from 'express';
import { exec } from 'child_process';
import sequelize from '../../../config/database';
import path from 'path';

const AUTH_COOKIE_NAME = 'system_auth_token';

export class SystemController {

    // --- VIEW METHODS ---

    static async viewLogin(req: Request, res: Response) {
        if (req.cookies[AUTH_COOKIE_NAME]) {
            return res.redirect('/api/system/dashboard');
        }
        res.sendFile(path.join(__dirname, '../views/login.html'));
    }

    static async viewDashboard(req: Request, res: Response) {
        if (!req.cookies[AUTH_COOKIE_NAME]) {
            return res.redirect('/api/system/login');
        }
        res.sendFile(path.join(__dirname, '../views/dashboard.html'));
    }

    // --- AUTH METHODS ---

    static async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            const validUser = process.env.SYSTEM_USER;
            const validPass = process.env.SYSTEM_PASSWORD;

            if (!validUser || !validPass) {
                console.error("System credentials not configured in environment variables.");
                return res.status(500).json({ success: false, message: 'Server configuration error: Missing env vars' });
            }

            if (username === validUser && password === validPass) {
                res.cookie(AUTH_COOKIE_NAME, 'valid_session', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure in production
                    sameSite: 'strict',
                    maxAge: 3600000 // 1 hour
                });
                return res.json({ success: true, message: 'Login successful' });
            }

            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        } catch (error: any) {
            console.error("Login error:", error);
            return res.status(500).json({
                success: false,
                message: "Login failed due to server error",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    static async logout(req: Request, res: Response) {
        res.clearCookie(AUTH_COOKIE_NAME);
        return res.json({ success: true, message: 'Logged out' });
    }

    // --- ACTION METHODS ---

    private static checkAuth(req: Request): boolean {
        return req.cookies[AUTH_COOKIE_NAME] === 'valid_session';
    }

    static async runMigrations(req: Request, res: Response) {
        if (!SystemController.checkAuth(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

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
        if (!SystemController.checkAuth(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

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
        if (!SystemController.checkAuth(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

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
        /* if (!SystemController.checkAuth(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        } */

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
