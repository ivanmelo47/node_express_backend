import { Router, Request, Response, NextFunction } from 'express';
import { SystemController } from '../controllers/SystemController';
import { SystemFileController } from '../controllers/SystemFileController';
import { basicAuth } from '../../../common/middlewares/basicAuth';

const router = Router();

// Feature Flag: Check if System Module is enabled
router.use((req: Request, res: Response, next: NextFunction) => {
    if (process.env.SYSTEM_MODULE_ENABLED !== 'true') {
        return res.status(404).send('Not Found');
    }
    next();
});

// Apply Basic Auth to all routes
router.use(basicAuth);

// API Routes - Logs & Actions
router.post('/logs', SystemController.getLogs);
router.post('/logs/export', SystemController.exportLogsToExcel);
router.post('/test-mail', SystemController.testMail);

router.post('/migrate', SystemController.runMigrations);
router.post('/seed', SystemController.runSeeders);
router.post('/reset', SystemController.resetDatabase);

// API Routes - File Manager (Specific paths first)
router.get('/files/list', SystemFileController.listFiles);
router.get('/files/read', SystemFileController.readFile);
router.post('/files/save', SystemFileController.saveFile);
router.post('/files/create-folder', SystemFileController.createFolder);
router.delete('/files/delete', SystemFileController.deleteItem);

// View Routes (SPA) - Catch-all routes must be last
// Matches any GET request not handled by previous API routes (dashboard, files, etc.)
router.get(/.*/, SystemController.viewApp);

export default router;
