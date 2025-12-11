import express from 'express';
// @ts-ignore
import * as userController from '@/controllers/userController';
import authMiddleware from '@/middlewares/authMiddleware';
import roleMiddleware from '@/middlewares/roleMiddleware';
import abilityMiddleware from '@/middlewares/abilityMiddleware';

const router = express.Router();

// Public or Authenticated routes (depending on requirements, here keeping them authenticated)
router.get('/', authMiddleware, abilityMiddleware('user:read'), userController.getUsers);
router.get('/:id', authMiddleware, abilityMiddleware('user:read'), userController.getUserById);

// Admin only routes (also checking for specific abilities for granularity)
router.post('/', authMiddleware, roleMiddleware(['admin']), abilityMiddleware('user:create'), userController.createUser);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), abilityMiddleware('user:update'), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), abilityMiddleware('user:delete'), userController.deleteUser);

export default router;
