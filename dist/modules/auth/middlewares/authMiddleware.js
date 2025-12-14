"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = __importDefault(require("@/modules/auth/services/AuthService"));
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.errorResponse('Unauthorized: No token provided', 401);
        }
        const token = authHeader.split(' ')[1];
        const result = await AuthService_1.default.validateToken(token);
        if (result === 'expired') {
            return res.errorResponse('Token expired', 401);
        }
        if (!result) {
            return res.errorResponse('Unauthorized: Invalid token', 401);
        }
        const accessToken = result;
        // Attach user and token info to request
        req.user = accessToken.User;
        req.token = accessToken;
        next();
    }
    catch (error) {
        console.error('Auth Middleware Error:', error);
        res.errorResponse('Internal Server Error', 500, error.message);
    }
};
exports.default = authMiddleware;
