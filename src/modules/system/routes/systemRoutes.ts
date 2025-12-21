import { Router } from 'express';
import { SystemController } from '../controllers/SystemController';
import { systemLoginLimiter } from '../../../common/middlewares/rateLimiter';

const router = Router();

router.get('/login', SystemController.viewLogin);
router.post('/login', systemLoginLimiter, SystemController.login);
router.get('/dashboard', SystemController.viewDashboard);
router.post('/logout', SystemController.logout);

router.get('/migrate', SystemController.runMigrations);
router.get('/seed', SystemController.runSeeders);
router.get('/reset', SystemController.resetDatabase);

export default router;
