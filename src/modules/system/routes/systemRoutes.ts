import { Router } from 'express';
import { SystemController } from '../controllers/SystemController';
import { SystemFileController } from '../controllers/SystemFileController';
import { basicAuth } from '../../../common/middlewares/basicAuth';

const router = Router();

// Apply Basic Auth to all routes
router.use(basicAuth);

router.get('/dashboard', SystemController.viewDashboard);
router.post('/logs', SystemController.getLogs);
router.post('/logs/export', SystemController.exportLogsToExcel);
router.get('/test-mail', SystemController.testMail);

router.post('/migrate', SystemController.runMigrations);
router.post('/seed', SystemController.runSeeders);
router.post('/reset', SystemController.resetDatabase);

// File Manager routes
router.get('/files', SystemFileController.viewFileManager);
router.get('/files/list', SystemFileController.listFiles);
router.get('/files/read', SystemFileController.readFile);
router.post('/files/save', SystemFileController.saveFile);
router.post('/files/create-folder', SystemFileController.createFolder);
router.delete('/files/delete', SystemFileController.deleteItem);

export default router;
