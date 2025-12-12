import express from "express";
// @ts-ignore
import * as authController from "@/modules/auth/controllers/authController";
import { authLimiter } from "@/common/middlewares/rateLimiter";

const router = express.Router();

// Apply stricter rate limit to authentication routes
router.use(authLimiter);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/confirm-account", authController.confirmAccount);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

export default router;
