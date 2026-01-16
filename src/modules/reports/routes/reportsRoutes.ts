import { Router } from 'express';
import { ReportsController } from '../controllers/ReportsController';

import { cache } from '../../../common/middlewares/cache';

const router = Router();

// API Endpoints
router.get('/stats', cache(300), ReportsController.getStats);

// SPA View Route (Catch-all for this module)
// SPA View Route (Catch-all for this module)
router.get(/.*/, ReportsController.viewApp);

export default router;
