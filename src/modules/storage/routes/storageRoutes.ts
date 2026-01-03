import { Router } from 'express';
import { StorageController } from '../controllers/StorageController';
import authMiddleware from '../../auth/middlewares/authMiddleware';

const router = Router();

// Protect all storage routes with JWT Authentication
router.use(authMiddleware);

// Route to get private files
// /api/storage/private/folder/file.pdf
router.get(/^\/private\/(.*)$/, StorageController.getPrivateFile);

export default router;
