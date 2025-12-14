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

// Master only routes - Abilities Management
router.get("/abilities", authMiddleware, roleMiddleware(["master"]), userController.listAbilities);

// Public or Authenticated routes (depending on requirements, here keeping them authenticated)
router.get("/profile/me", authMiddleware, userProfileController.getMyProfile);
router.put("/profile/me", authMiddleware, updateProfileRules, userProfileController.updateMyProfile);

router.get("/", authMiddleware, abilityMiddleware("read"), userController.getUsers);
router.get("/:uuid", authMiddleware, abilityMiddleware("read"), userController.getUserByUuid);

// Admin only routes (also checking for specific abilities for granularity)
router.post("/", authMiddleware, roleMiddleware(["admin"]), abilityMiddleware("create"), userController.createUser);
router.put("/profile/:uuid", authMiddleware, roleMiddleware(["admin"]), updateProfileRules, userProfileController.updateUserProfile);
router.put("/:uuid", authMiddleware, roleMiddleware(["admin"]), abilityMiddleware("update"), userController.updateUser);
router.delete("/:uuid", authMiddleware, roleMiddleware(["admin"]), abilityMiddleware("delete"), userController.deleteUser);

router.get("/:uuid/abilities", authMiddleware, roleMiddleware(["master"]), userController.getUserAbilities);
router.put("/:uuid/abilities", authMiddleware, roleMiddleware(["master"]), userController.updateUserAbilities);

export default router;
