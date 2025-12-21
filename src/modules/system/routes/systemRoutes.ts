import { Router } from 'express';
import { SystemController } from '../controllers/SystemController';

const router = Router();

router.get('/migrate', SystemController.runMigrations);
router.get('/seed', SystemController.runSeeders);
// router.get('/reset', SystemController.resetDatabase);

export default router;
