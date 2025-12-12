import express from "express";
// @ts-ignore
import * as userController from "@/modules/users/controllers/userController";
// @ts-ignore
import * as userProfileController from "@/modules/users/controllers/userProfileController";
import { updateProfileRules } from "@/modules/users/rules/userProfileRules";
import authMiddleware from "@/modules/auth/middlewares/authMiddleware";
import roleMiddleware from "@/common/middlewares/roleMiddleware";
import abilityMiddleware from "@/common/middlewares/abilityMiddleware";

const router = express.Router();

// Public or Authenticated routes (depending on requirements, here keeping them authenticated)
router.get("/profile/me", authMiddleware, userProfileController.getMyProfile);
router.put("/profile/me", authMiddleware, updateProfileRules, userProfileController.updateMyProfile);

router.get("/", authMiddleware, abilityMiddleware("user:read"), userController.getUsers);
router.get("/:uuid", authMiddleware, abilityMiddleware("user:read"), userController.getUserByUuid);

// Admin only routes (also checking for specific abilities for granularity)
router.post("/", authMiddleware, roleMiddleware(["admin"]), abilityMiddleware("user:create"), userController.createUser);
router.put("/profile/:uuid", authMiddleware, roleMiddleware(["admin"]), updateProfileRules, userProfileController.updateUserProfile);
router.put("/:uuid", authMiddleware, roleMiddleware(["admin"]), abilityMiddleware("user:update"), userController.updateUser);
router.delete("/:uuid", authMiddleware, roleMiddleware(["admin"]), abilityMiddleware("user:delete"), userController.deleteUser);

export default router;
