import { Request, Response } from 'express';
import path from 'path';

export class ReportsController {
    static async viewApp(req: Request, res: Response) {
        // Serve the centralized SPA shell with dynamic script injection
        try {
            const fs = require('fs');
            // Path relative to dist/modules/reports/controllers/ -> ../../../views/spa.html
            const viewPath = path.join(__dirname, '../../../views/spa.html');
            let html = fs.readFileSync(viewPath, 'utf8');

            // Inject Reports Module Entry Point
            html = html.replace('{{MODULE_JS}}', '/public/modules/reports/js/app.js');

            res.send(html);
        } catch (error) {
            console.error("Error serving reports view:", error);
            res.status(500).send("Error loading reports view");
        }
    }

    static async getStats(req: Request, res: Response) {
        // Mock data for the example
        res.json({
            sales: 15000,
            visitors: 3200,
            growth: 15
        });
    }
}
