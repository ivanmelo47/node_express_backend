import { Router } from 'express';
import { SystemController } from '../controllers/SystemController';
import { basicAuth } from '../../../common/middlewares/basicAuth';

const router = Router();

// Apply Basic Auth to all routes
router.use(basicAuth);

router.get('/dashboard', SystemController.viewDashboard);
router.get('/logs', SystemController.getLogs);

router.get('/migrate', SystemController.runMigrations);
router.get('/seed', SystemController.runSeeders);
router.get('/reset', SystemController.resetDatabase);

export default router;
