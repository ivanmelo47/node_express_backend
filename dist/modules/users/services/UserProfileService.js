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
const UserProfile_1 = __importDefault(require("@/modules/users/models/UserProfile"));
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
class UserProfileService {
    /**
     * Get user profile by user ID.
     * @param {number} userId
     * @returns {Promise<UserProfile|null>}
     */
    static async getProfile(userId) {
        return await UserProfile_1.default.findOne({ where: { userId } });
    }
    /**
     * Update or Create user profile.
     * @param {number} userId
     * @param {Object} data
     * @returns {Promise<UserProfile>}
     */
    static async updateOrCreate(userId, data) {
        // Flatten address object if present
        if (data.address && typeof data.address === 'object') {
            data = { ...data, ...data.address };
            delete data.address; // Remove the nested object after flattening
        }
        const t = await database_1.default.init();
        try {
            const [profile, created] = await UserProfile_1.default.findOrCreate({
                where: { userId },
                defaults: { ...data, userId },
                transaction: t,
            });
            if (!created) {
                await profile.update(data, { transaction: t });
            }
            await database_1.default.commit(t);
            return profile;
        }
        catch (error) {
            await database_1.default.rollback(t);
            throw error;
        }
    }
    /**
     * Update or Create user profile by User UUID.
     * @param {string} userUuid
     * @param {Object} data
     * @returns {Promise<UserProfile>}
     */
    static async updateOrCreateByUuid(userUuid, data) {
        // @ts-ignore
        const user = await Promise.resolve().then(() => __importStar(require("@/modules/users/models/User"))).then((m) => m.default.findOne({ where: { uuid: userUuid } }));
        if (!user) {
            throw new Error("User not found");
        }
        return await this.updateOrCreate(user.id, data);
    }
}
exports.default = UserProfileService;
