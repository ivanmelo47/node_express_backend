"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// @ts-ignore
const userController = __importStar(require("@/modules/users/controllers/userController"));
// @ts-ignore
const userProfileController = __importStar(require("@/modules/users/controllers/userProfileController"));
const userProfileRules_1 = require("@/modules/users/rules/userProfileRules");
const authMiddleware_1 = __importDefault(require("@/modules/auth/middlewares/authMiddleware"));
const roleMiddleware_1 = __importDefault(require("@/common/middlewares/roleMiddleware"));
const abilityMiddleware_1 = __importDefault(require("@/common/middlewares/abilityMiddleware"));
const router = express_1.default.Router();
// Public or Authenticated routes (depending on requirements, here keeping them authenticated)
router.get("/profile/me", authMiddleware_1.default, userProfileController.getMyProfile);
router.put("/profile/me", authMiddleware_1.default, userProfileRules_1.updateProfileRules, userProfileController.updateMyProfile);
router.get("/", authMiddleware_1.default, (0, abilityMiddleware_1.default)("read"), userController.getUsers);
router.get("/:uuid", authMiddleware_1.default, (0, abilityMiddleware_1.default)("read"), userController.getUserByUuid);
// Admin only routes (also checking for specific abilities for granularity)
router.post("/", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin"]), (0, abilityMiddleware_1.default)("create"), userController.createUser);
router.put("/profile/:uuid", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin"]), userProfileRules_1.updateProfileRules, userProfileController.updateUserProfile);
router.put("/:uuid", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin"]), (0, abilityMiddleware_1.default)("update"), userController.updateUser);
router.delete("/:uuid", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin"]), (0, abilityMiddleware_1.default)("delete"), userController.deleteUser);
// Master only routes - Abilities Management
router.get("/abilities", authMiddleware_1.default, (0, roleMiddleware_1.default)(["master"]), userController.listAbilities);
router.get("/:uuid/abilities", authMiddleware_1.default, (0, roleMiddleware_1.default)(["master"]), userController.getUserAbilities);
router.put("/:uuid/abilities", authMiddleware_1.default, (0, roleMiddleware_1.default)(["master"]), userController.updateUserAbilities);
exports.default = router;
