import { Router } from 'express';
import { SystemController } from '../controllers/SystemController';
import { basicAuth } from '../../../common/middlewares/basicAuth';

const router = Router();

// Apply Basic Auth to all routes
router.use(basicAuth);

router.get('/dashboard', SystemController.viewDashboard);
router.post('/logs', SystemController.getLogs);
router.post('/logs/export', SystemController.exportLogsToExcel);

router.post('/migrate', SystemController.runMigrations);
router.post('/seed', SystemController.runSeeders);
router.post('/reset', SystemController.resetDatabase);

export default router;
