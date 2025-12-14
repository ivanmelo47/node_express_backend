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
exports.updateUserProfile = exports.updateMyProfile = exports.getMyProfile = void 0;
// @ts-ignore
const UserProfileService_1 = __importDefault(require("@/modules/users/services/UserProfileService"));
// @ts-ignore
const UserProfileResource_1 = __importDefault(require("@/modules/users/resources/UserProfileResource"));
const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await UserProfileService_1.default.getProfile(userId);
        if (!profile) {
            // @ts-ignore
            return res.errorResponse("Profile not found. Please complete your profile.", 404);
        }
        // @ts-ignore
        res.successResponse(new UserProfileResource_1.default(profile).resolve());
    }
    catch (error) {
        next(error);
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res, next) => {
    try {
        const userUuid = req.user.uuid;
        const profile = await UserProfileService_1.default.updateOrCreateByUuid(userUuid, req.body);
        // @ts-ignore
        // @ts-ignore
        res.successResponse(new UserProfileResource_1.default(profile).resolve(), "Profile updated successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.updateMyProfile = updateMyProfile;
const updateUserProfile = async (req, res, next) => {
    try {
        const { uuid } = req.params;
        // Check if target user exists and is not admin
        // @ts-ignore
        const user = await Promise.resolve().then(() => __importStar(require("@/modules/users/models/User"))).then((m) => m.default.findOne({
            where: { uuid },
            include: ["Role"],
        }));
        if (!user) {
            // @ts-ignore
            return res.errorResponse("User not found", 404);
        }
        // Prevent updating other admins
        // Assuming Role model is included and has a 'name' field
        if (user.Role && user.Role.name === "admin") {
            // @ts-ignore
            return res.errorResponse("Cannot update profile of another admin", 403);
        }
        const profile = await UserProfileService_1.default.updateOrCreateByUuid(uuid, req.body);
        // @ts-ignore
        res.successResponse(new UserProfileResource_1.default(profile).resolve(), "Profile updated successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserProfile = updateUserProfile;
