import { Router } from 'express';
import { ReportsController } from '../controllers/ReportsController';

const router = Router();

// API Endpoints
router.get('/stats', ReportsController.getStats);

// SPA View Route (Catch-all for this module)
// SPA View Route (Catch-all for this module)
router.get(/.*/, ReportsController.viewApp);

export default router;
