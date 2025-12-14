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
Object.defineProperty(exports, "__esModule", { value: true });
const roleMiddleware = (roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.errorResponse('Unauthorized', 401);
        }
        const userRole = req.user.Role;
        if (!userRole) {
            return res.errorResponse('Forbidden: Insufficient permissions', 403);
        }
        // Dynamic Hierarchy Check
        try {
            // @ts-ignore
            const RoleModel = await Promise.resolve().then(() => __importStar(require('@/modules/users/models/Role'))).then(m => m.default);
            // Get the hierarchy level of the roles allowed to access this route
            const allowedRoles = await RoleModel.findAll({
                where: {
                    name: roles
                }
            });
            // Find the "minimum privilege" (highest hierarchy number) allowed.
            // e.g. if allowed is ['admin'], hierarchy is 2. We allow anyone with <= 2.
            // If allowed is ['user'], hierarchy is 3. We allow anyone with <= 3.
            // If allowed is ['admin', 'user'], max hierarchy is 3. We allow <= 3.
            const maxAllowedHierarchy = Math.max(...allowedRoles.map((r) => r.hierarchy));
            // User must have equal or higher privilege (lower or equal hierarchy number)
            if (userRole.hierarchy <= maxAllowedHierarchy) {
                return next();
            }
            return res.errorResponse('Forbidden: Insufficient permissions', 403);
        }
        catch (error) {
            console.error('Role middleware error:', error);
            return res.errorResponse('Internal Server Error', 500);
        }
    };
};
exports.default = roleMiddleware;
