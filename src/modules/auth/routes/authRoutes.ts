import express from 'express';
// @ts-ignore
import * as authController from '@/modules/auth/controllers/authController';
import { authLimiter } from '@/common/middlewares/rateLimiter';

const router = express.Router();

// Apply stricter rate limit to authentication routes
router.use(authLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/confirm-account', authController.confirmAccount);

export default router;
